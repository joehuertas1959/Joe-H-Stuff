'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const {
  classifyOpportunity, calcUrgency, calcDaysRemaining,
  calcWinProbability, getHR1Score, getRegion, getFMAP, makeId
} = require('./reference-data');

// BidNet Direct — public RFP catalog for state/local government procurement
// Many states use BidNet as their publishing platform for health-IT solicitations.
// NOTE: GovWin IQ (Deltek) requires a paid subscription and cannot be scraped here.
//       Contact sales@deltek.com to license GovWin data feeds for this tool.
const BIDNET_SEARCH_URL = 'https://www.bidnetdirect.com/rfp-catalog/rfp-search';
const BIDNET_PORTAL_URL  = 'https://www.bidnetdirect.com';

const SEARCH_TERMS = [
  'Medicaid information technology',
  'Medicaid eligibility enrollment system',
  'MMIS Medicaid Management Information',
  'health human services IT',
  'community engagement work requirements Medicaid',
  'FHIR interoperability Medicaid'
];

async function scrape({ logger = console.log } = {}) {
  logger('BidNet Direct: searching public RFP catalog …');
  const results = [];
  const seen = new Set();

  for (const term of SEARCH_TERMS) {
    logger(`BidNet: searching "${term}" …`);
    try {
      const resp = await axios.get(BIDNET_SEARCH_URL, {
        params: { keyword: term, category: 'Health & Human Services' },
        timeout: 20000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; HHS-Procurement-Scanner/4.0)',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        maxRedirects: 5
      });

      const $ = cheerio.load(resp.data);
      const entries = extractListings($, logger);

      for (const e of entries) {
        if (seen.has(e.dedupKey)) continue;
        seen.add(e.dedupKey);

        const { category, program, itType } = classifyOpportunity(e.title, e.description);
        const stateCode = e.stateCode || '';
        const hr1Info = getHR1Score(stateCode);
        const urgency = calcUrgency(e.dueDate);
        const winProb = calcWinProbability(stateCode, category, hr1Info.keyFactor || '');
        const id = makeId(e.title, stateCode || 'BidNet', e.rfpNum);

        results.push({
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
        });
      }

      await sleep(2000);
    } catch (err) {
      if (err.response?.status === 403) {
        logger('BidNet: access denied (site may require a registered account for search results). Skipping.');
        break;
      }
      logger(`BidNet [${term}] error: ${err.message}`);
    }
  }

  logger(`BidNet Direct: ${results.length} unique opportunities found`);
  return results;
}

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

function extractListings($, logger) {
  const entries = [];

  // BidNet search results typically render as a list of result cards
  const selectors = [
    '.rfp-search-result', '.rfp-result', '.rfp-listing',
    '.result-item', '.bid-result', '.opportunity-row',
    'table tbody tr', '.search-results li', 'article'
  ];

  let found = false;
  for (const sel of selectors) {
    const items = $(sel);
    if (items.length === 0) continue;

    items.each((i, el) => {
      const text   = $(el).text().trim();
      const link   = $(el).find('a').first();
      const title  = link.text().trim() || text.slice(0, 120);
      const href   = link.attr('href') || '';
      const fullHref = href.startsWith('http') ? href : href ? `${BIDNET_PORTAL_URL}${href}` : '';

      if (title.length < 10) return;

      // Only keep HHS/Medicaid-related entries
      if (!/Medicaid|HHS|health.*human|MMIS|eligib|SNAP|Medicaid|CHIP|social service/i.test(text)) return;

      const rfpNum    = extractRFP(text);
      const dueDate   = parseDate(text);
      const postedDate = parseDate(text, true);
      const stateCode = extractState(text);
      const agency    = extractAgency(text, title);

      entries.push({
        dedupKey:    `${stateCode}|${rfpNum || title.slice(0, 40)}`.toLowerCase(),
        title,
        href:        fullHref,
        rfpNum,
        dueDate,
        postedDate,
        stateCode,
        agency,
        description: text.slice(0, 300)
      });
    });

    if (entries.length > 0) { found = true; break; }
  }

  if (!found) {
    logger('BidNet: no structured result elements found — site may be JS-rendered; results will be empty for this search.');
  }

  return entries;
}

function extractRFP(text) {
  const m = text.match(/\b(RFP|RFI|ITN|IFB|RFQ|RFQQ)[\s#:\-]*([A-Z0-9\-]{3,20})/i);
  return m ? `${m[1].toUpperCase()} ${m[2]}` : null;
}

function parseDate(text, posted = false) {
  const label = posted ? /(?:posted|published|issued)[:\s]+/i : /(?:due|closing|deadline|close|response)[:\s]+/i;
  const block  = label.test(text) ? text.replace(label, '').slice(0, 30) : text;
  const m = block.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (!m) return null;
  const [, mm, dd, yyyy] = m;
  const y = yyyy.length === 2 ? `20${yyyy}` : yyyy;
  return `${y}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

function extractState(text) {
  const sorted = Object.keys(STATE_ABBR).sort((a, b) => b.length - a.length);
  for (const name of sorted) {
    if (text.includes(name)) return STATE_ABBR[name];
  }
  const m = text.match(/\b([A-Z]{2})\b/g);
  if (m) {
    for (const abbr of m) {
      if (Object.values(STATE_ABBR).includes(abbr)) return abbr;
    }
  }
  return null;
}

function extractAgency(text, title) {
  const m = text.match(/(?:agency|department|division|bureau|office)[:\s]+([^\n,]{5,60})/i);
  return m ? m[1].trim() : null;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

module.exports = { scrape };
