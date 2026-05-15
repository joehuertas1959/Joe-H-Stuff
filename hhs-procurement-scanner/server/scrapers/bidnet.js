'use strict';

const axios   = require('axios');
const cheerio = require('cheerio');
const {
  classifyOpportunity, calcUrgency, calcDaysRemaining,
  calcWinProbability, getHR1Score, getRegion, getFMAP, makeId
} = require('./reference-data');

const BIDNET_PORTAL_URL = 'https://www.bidnetdirect.com';
const LOGIN_URL         = `${BIDNET_PORTAL_URL}/login`;
const SEARCH_URL        = `${BIDNET_PORTAL_URL}/rfp-catalog/rfp-search`;

const SEARCH_TERMS = [
  'Medicaid information technology',
  'Medicaid eligibility enrollment system',
  'MMIS Medicaid Management Information',
  'health human services IT',
  'community engagement work requirements Medicaid',
  'FHIR interoperability Medicaid'
];

async function scrape({ username, password, logger = console.log } = {}) {
  if (!username || !password) {
    logger('BidNet Direct: no credentials configured — skipping. Add BIDNET_USERNAME/PASSWORD to .env or enter in UI.');
    return [];
  }

  logger('BidNet Direct: authenticating …');

  const jar = new CookieJar();

  // Step 1: GET login page to harvest CSRF token and initial cookies
  try {
    const loginPage = await axios.get(LOGIN_URL, {
      timeout: 20000,
      headers: { 'User-Agent': AGENT, 'Accept': 'text/html,application/xhtml+xml' },
      maxRedirects: 5
    });
    extractCookies(loginPage.headers['set-cookie'] || [], jar);
    const $ = cheerio.load(loginPage.data);
    const csrf = $('input[name="_token"], input[name="csrf"], input[name="_csrf"]').val();
    if (csrf) jar.set('_csrf_form', csrf);
  } catch (err) {
    logger(`BidNet: could not load login page — ${err.message}`);
    return [];
  }

  // Step 2: POST credentials
  try {
    const body = new URLSearchParams({ username, password });
    if (jar.get('_csrf_form')) body.set('_token', jar.get('_csrf_form'));

    const loginResp = await axios.post(LOGIN_URL, body.toString(), {
      timeout: 20000,
      maxRedirects: 5,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie':       jar.serialize(),
        'User-Agent':   AGENT,
        'Referer':      LOGIN_URL
      },
      validateStatus: s => s < 500
    });

    extractCookies(loginResp.headers['set-cookie'] || [], jar);

    const body2 = loginResp.data?.toString() || '';
    if (loginResp.status === 401 || body2.includes('Invalid') || body2.includes('incorrect')) {
      logger('BidNet: login failed — check BIDNET_USERNAME and BIDNET_PASSWORD in .env');
      return [];
    }

    logger('BidNet Direct: login successful');
  } catch (err) {
    logger(`BidNet: login failed — ${err.message}`);
    return [];
  }

  // Step 3: search for each keyword
  const results = [];
  const seen    = new Set();

  for (const term of SEARCH_TERMS) {
    logger(`BidNet: searching "${term}" …`);
    try {
      const resp = await axios.get(SEARCH_URL, {
        params:  { keyword: term, category: 'Health & Human Services' },
        timeout: 20000,
        headers: {
          'Cookie':          jar.serialize(),
          'User-Agent':      AGENT,
          'Accept':          'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer':         SEARCH_URL
        },
        maxRedirects: 5
      });

      extractCookies(resp.headers['set-cookie'] || [], jar);

      const $ = cheerio.load(resp.data);
      const entries = extractListings($, logger);
      logger(`BidNet [${term}]: ${entries.length} listings found`);

      for (const e of entries) {
        if (seen.has(e.dedupKey)) continue;
        seen.add(e.dedupKey);
        results.push(buildRecord(e));
      }

      await sleep(2000);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        logger('BidNet: session expired mid-scan — try re-running');
        break;
      }
      logger(`BidNet [${term}] error: ${err.message}`);
    }
  }

  logger(`BidNet Direct: ${results.length} unique opportunities found`);
  return results;
}

// ── HTML parser ───────────────────────────────────────────────────────────────

const RESULT_SELECTORS = [
  '.rfp-search-result', '.rfp-result', '.rfp-listing',
  '.result-item', '.bid-result', '.opportunity-row',
  'table tbody tr', '.search-results li', '.bid-listing', 'article.bid'
];

function extractListings($, logger) {
  const entries = [];

  for (const sel of RESULT_SELECTORS) {
    $(sel).each((_, el) => {
      const text  = $(el).text().trim();
      const link  = $(el).find('a').first();
      const title = link.text().trim() || $(el).find('.title, h3, h4').text().trim();
      const href  = link.attr('href') || '';

      if (title.length < 10) return;
      if (!/Medicaid|HHS|health.*human|MMIS|eligib|SNAP|CHIP|social.?servi/i.test(text)) return;

      const fullHref = href.startsWith('http') ? href : href ? `${BIDNET_PORTAL_URL}${href}` : '';

      entries.push({
        dedupKey:    `bidnet|${title.slice(0, 50)}`.toLowerCase().replace(/\s+/g, '-'),
        title,
        href:        fullHref,
        rfpNum:      extractRFP(text),
        dueDate:     parseDueDate(text),
        postedDate:  parsePostedDate(text),
        stateCode:   extractState(text),
        agency:      extractAgency(text),
        description: text.slice(0, 300)
      });
    });
    if (entries.length > 0) break;
  }

  if (entries.length === 0) {
    logger('BidNet: no structured result elements matched — page structure may differ from expected; results empty for this search.');
  }

  return entries;
}

function buildRecord(e) {
  const { category, program, itType } = classifyOpportunity(e.title, e.description);
  const stateCode = e.stateCode || '';
  const hr1Info   = getHR1Score(stateCode);
  const urgency   = calcUrgency(e.dueDate);
  const winProb   = calcWinProbability(stateCode, category, hr1Info.keyFactor || '');
  const id        = makeId(e.title, stateCode || 'BidNet', e.rfpNum);

  return {
    id,
    state:               stateCode || 'Unknown',
    region:              stateCode ? getRegion(stateCode) : 'Unknown',
    agency:              e.agency || 'State/Local HHS Agency',
    opportunity_title:   e.title,
    rfp_rfi_number:      e.rfpNum || 'N/A',
    category,
    program,
    it_type:             itType,
    status:              e.dueDate ? 'Active RFP' : 'Pre-RFP',
    published_date:      e.postedDate || new Date().toISOString().slice(0, 10),
    due_date:            e.dueDate || 'TBD',
    days_remaining:      calcDaysRemaining(e.dueDate),
    est_value_m:         0,
    beneficiaries:       0,
    fmap:                getFMAP(stateCode),
    urgency,
    document_url:        e.href || BIDNET_PORTAL_URL,
    portal_url:          BIDNET_PORTAL_URL,
    notes:               `BidNet Direct listing. ${e.description.slice(0, 200)}`,
    win_probability:     winProb,
    competitive_context: hr1Info.keyFactor || '',
    apd_status:          'Unknown',
    incumbent_expiry:    'Unknown',
    hr1_readiness_score: hr1Info.score || 3,
    source:              'BidNet Direct',
    source_tier:         2,
    scraped_at:          new Date().toISOString()
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const STATE_ABBR = {
  'Alabama':'AL','Alaska':'AK','Arizona':'AZ','Arkansas':'AR','California':'CA',
  'Colorado':'CO','Connecticut':'CT','Delaware':'DE','Florida':'FL','Georgia':'GA',
  'Hawaii':'HI','Idaho':'ID','Illinois':'IL','Indiana':'IN','Iowa':'IA',
  'Kansas':'KS','Kentucky':'KY','Louisiana':'LA','Maine':'ME','Maryland':'MD',
  'Massachusetts':'MA','Michigan':'MI','Minnesota':'MN','Mississippi':'MS',
  'Missouri':'MO','Montana':'MT','Nebraska':'NE','Nevada':'NV','New Hampshire':'NH',
  'New Jersey':'NJ','New Mexico':'NM','New York':'NY','North Carolina':'NC',
  'North Dakota':'ND','Ohio':'OH','Oklahoma':'OK','Oregon':'OR','Pennsylvania':'PA',
  'Rhode Island':'RI','South Carolina':'SC','South Dakota':'SD','Tennessee':'TN',
  'Texas':'TX','Utah':'UT','Vermont':'VT','Virginia':'VA','Washington':'WA',
  'West Virginia':'WV','Wisconsin':'WI','Wyoming':'WY',
  'Puerto Rico':'PR','Guam':'GU','Virgin Islands':'VI'
};
const STATE_NAMES_SORTED = Object.keys(STATE_ABBR).sort((a, b) => b.length - a.length);
const STATE_CODES = new Set(Object.values(STATE_ABBR));

function extractRFP(text) {
  const m = text.match(/\b(RFP|RFI|ITN|IFB|RFQ|RFQQ)[\s#:\-]*([A-Z0-9\-]{3,20})/i);
  return m ? `${m[1].toUpperCase()} ${m[2]}` : null;
}

function parseDueDate(text) {
  const m = text.match(/(?:due|clos(?:ing|es?)|deadline|response)[:\s]+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i);
  if (!m) return parseAnyDate(text);
  const [, mm, dd, yyyy] = m;
  return isoDate(mm, dd, yyyy);
}

function parsePostedDate(text) {
  const m = text.match(/(?:posted|published|issued)[:\s]+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i);
  if (!m) return null;
  const [, mm, dd, yyyy] = m;
  return isoDate(mm, dd, yyyy);
}

function parseAnyDate(text) {
  const m = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (!m) return null;
  const [, mm, dd, yyyy] = m;
  return isoDate(mm, dd, yyyy);
}

function isoDate(mm, dd, yyyy) {
  const y = yyyy.length === 2 ? `20${yyyy}` : yyyy;
  return `${y}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

function extractState(text) {
  for (const name of STATE_NAMES_SORTED) {
    if (text.includes(name)) return STATE_ABBR[name];
  }
  const abbrs = text.match(/\b([A-Z]{2})\b/g) || [];
  return abbrs.find(a => STATE_CODES.has(a)) || null;
}

function extractAgency(text) {
  const m = text.match(/(?:agency|department|division|bureau|office)[:\s]+([^\n,]{5,60})/i);
  return m ? m[1].trim() : null;
}

class CookieJar {
  constructor() { this._jar = {}; }
  set(k, v) { this._jar[k] = v; }
  get(k)    { return this._jar[k]; }
  serialize() { return Object.entries(this._jar).map(([k, v]) => `${k}=${v}`).join('; '); }
}

function extractCookies(headers, jar) {
  for (const h of headers) {
    const part = h.split(';')[0].trim();
    const eq   = part.indexOf('=');
    if (eq === -1) continue;
    jar.set(part.slice(0, eq).trim(), part.slice(eq + 1).trim());
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

module.exports = { scrape };
