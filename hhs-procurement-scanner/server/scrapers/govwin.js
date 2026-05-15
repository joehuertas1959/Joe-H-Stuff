'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const {
  classifyOpportunity, calcUrgency, calcDaysRemaining,
  calcWinProbability, getHR1Score, getRegion, getFMAP, makeId
} = require('./reference-data');

// GovWin IQ (Deltek) — subscription-required procurement intelligence platform.
//
// Authentication modes (checked in order):
//   1. API key  — set GOVWIN_API_KEY in .env  (requires API add-on from Deltek)
//   2. Web login — set GOVWIN_USERNAME + GOVWIN_PASSWORD in .env
//
// IMPORTANT: Automated access must be permitted under your Deltek subscription.
// Contact your Deltek account rep to confirm before enabling.

const BASE_URL     = 'https://iq.govwin.com';
const LOGIN_URL    = `${BASE_URL}/neo/login`;
const API_SEARCH   = `${BASE_URL}/neo/api/v1/opportunities/search`;
const WEB_SEARCH   = `${BASE_URL}/neo/opportunities`;

const HHS_KEYWORDS = [
  'Medicaid information technology',
  'Medicaid eligibility enrollment',
  'MMIS Medicaid Management Information',
  'health human services IT system',
  'community engagement work requirements',
  'FHIR interoperability Medicaid',
  'SNAP EBT system',
  'CHIP health information'
];

async function scrape({ username, password, api_key, logger = console.log } = {}) {
  logger('GovWin IQ: starting …');

  if (api_key) {
    return scrapeViaApi(api_key, logger);
  }

  if (username && password) {
    return scrapeViaWebLogin(username, password, logger);
  }

  // Should not reach here — index.js guards this — but be explicit.
  logger('GovWin IQ: no credentials provided — skipping.');
  return [];
}

// ── Path 1: API key (preferred) ───────────────────────────────────────────────
async function scrapeViaApi(api_key, logger) {
  logger('GovWin IQ: using API key authentication …');
  const results = [];
  const seen = new Set();

  for (const keyword of HHS_KEYWORDS) {
    logger(`GovWin API: searching "${keyword}" …`);
    try {
      const resp = await axios.get(API_SEARCH, {
        params: {
          q:           keyword,
          stage:       'Pre-RFP,RFP,RFI',
          naics:       '541512,541519,541611,621,622,923',  // HHS-adjacent NAICS
          limit:       50,
          page:        1
        },
        headers: {
          'Authorization': `Bearer ${api_key}`,
          'Accept':        'application/json',
          'User-Agent':    'HHS-Procurement-Scanner/4.1'
        },
        timeout: 20000
      });

      const opps = resp.data?.opportunities || resp.data?.results || resp.data?.data || [];
      logger(`GovWin API [${keyword}]: ${opps.length} results`);

      for (const opp of opps) {
        const entry = normalizeApiResult(opp);
        if (seen.has(entry.dedupKey)) continue;
        seen.add(entry.dedupKey);
        results.push(buildRecord(entry));
      }

      await sleep(1500);
    } catch (err) {
      if (err.response?.status === 401) {
        logger('GovWin IQ: API key invalid or expired — check GOVWIN_API_KEY in .env');
        break;
      }
      if (err.response?.status === 403) {
        logger('GovWin IQ: API access not permitted for this subscription tier — contact Deltek support');
        break;
      }
      logger(`GovWin API [${keyword}] error: ${err.message}`);
    }
  }

  logger(`GovWin IQ: ${results.length} unique opportunities via API`);
  return results;
}

// ── Path 2: Web login (session cookie) ───────────────────────────────────────
async function scrapeViaWebLogin(username, password, logger) {
  logger('GovWin IQ: using web login authentication …');

  // Step 1: fetch login page to get CSRF token / hidden fields
  let csrfToken = null;
  const jar = new CookieJar();

  try {
    const loginPage = await axios.get(LOGIN_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HHS-Procurement-Scanner/4.1)' },
      timeout: 20000
    });
    const $ = cheerio.load(loginPage.data);
    csrfToken = $('input[name="_token"], input[name="csrf_token"], input[name="_csrf"]').val() || null;
    extractCookies(loginPage.headers['set-cookie'] || [], jar);
  } catch (err) {
    logger(`GovWin IQ: failed to load login page — ${err.message}`);
    return [];
  }

  // Step 2: POST credentials
  const postData = new URLSearchParams({
    username,
    password,
    ...(csrfToken ? { _token: csrfToken } : {})
  });

  let sessionCookies = null;
  try {
    const loginResp = await axios.post(LOGIN_URL, postData.toString(), {
      headers: {
        'Content-Type':  'application/x-www-form-urlencoded',
        'Cookie':        jar.serialize(),
        'User-Agent':    'Mozilla/5.0 (compatible; HHS-Procurement-Scanner/4.1)',
        'Referer':       LOGIN_URL
      },
      maxRedirects: 5,
      timeout: 20000,
      validateStatus: s => s < 500
    });

    if (loginResp.status === 401 || loginResp.data?.toString().includes('Invalid credentials')) {
      logger('GovWin IQ: login failed — check GOVWIN_USERNAME and GOVWIN_PASSWORD in .env');
      return [];
    }

    extractCookies(loginResp.headers['set-cookie'] || [], jar);
    sessionCookies = jar.serialize();
    logger('GovWin IQ: login successful');
  } catch (err) {
    logger(`GovWin IQ: login request failed — ${err.message}`);
    return [];
  }

  // Step 3: search for each keyword set
  const results = [];
  const seen = new Set();

  for (const keyword of HHS_KEYWORDS) {
    logger(`GovWin web: searching "${keyword}" …`);
    try {
      const resp = await axios.get(WEB_SEARCH, {
        params: { q: keyword, stage: 'Pre-RFP,RFP,RFI', limit: 50 },
        headers: {
          'Cookie':     sessionCookies,
          'User-Agent': 'Mozilla/5.0 (compatible; HHS-Procurement-Scanner/4.1)',
          'Accept':     'application/json, text/html',
          'Referer':    WEB_SEARCH
        },
        timeout: 20000
      });

      // GovWin may return JSON or HTML depending on Accept header negotiation
      let opps = [];
      if (typeof resp.data === 'object' && (resp.data.opportunities || resp.data.results)) {
        opps = resp.data.opportunities || resp.data.results || [];
      } else if (typeof resp.data === 'string') {
        opps = parseWebResults(resp.data, logger);
      }

      logger(`GovWin web [${keyword}]: ${opps.length} results`);

      for (const opp of opps) {
        const entry = normalizeWebResult(opp);
        if (seen.has(entry.dedupKey)) continue;
        seen.add(entry.dedupKey);
        results.push(buildRecord(entry));
      }

      await sleep(2000); // more conservative delay for web sessions
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        logger('GovWin IQ: session expired or access denied mid-scan');
        break;
      }
      logger(`GovWin web [${keyword}] error: ${err.message}`);
    }
  }

  logger(`GovWin IQ: ${results.length} unique opportunities via web session`);
  return results;
}

// ── Result normalizers ────────────────────────────────────────────────────────

function normalizeApiResult(opp) {
  const title    = opp.title || opp.name || opp.opportunityTitle || '';
  const stateCode = (opp.state || opp.placeOfPerformanceState || opp.pop_state || '').toUpperCase().slice(0, 2);
  const rfpNum   = opp.solicitationNumber || opp.rfpNumber || opp.id || 'N/A';
  const dueDate  = opp.responseDeadline || opp.dueDate || opp.closingDate || null;
  const href     = opp.url || opp.link || (opp.id ? `${BASE_URL}/neo/opportunities/${opp.id}` : BASE_URL);

  return {
    dedupKey:    `govwin|${rfpNum}|${title.slice(0, 40)}`.toLowerCase(),
    title,
    stateCode,
    rfpNum,
    agency:      opp.agency || opp.buyerAgency || opp.customer || '',
    dueDate:     dueDate ? dueDate.slice(0, 10) : null,
    postedDate:  (opp.postedDate || opp.publishedDate || '').slice(0, 10),
    href,
    description: opp.description || opp.synopsis || '',
    valueMin:    parseFloat(opp.valueMin || opp.contractValue || 0),
    valueMax:    parseFloat(opp.valueMax || 0)
  };
}

function normalizeWebResult(opp) {
  if (typeof opp === 'object' && opp.title) return normalizeApiResult(opp);
  // HTML-parsed result — same structure
  return normalizeApiResult(opp);
}

function parseWebResults(html, logger) {
  const $ = cheerio.load(html);
  const items = [];

  // GovWin result cards typically have class patterns like .opportunity-card, .result-row, etc.
  const selectors = [
    '.opportunity-card', '.opportunity-row', '.result-item',
    'table tbody tr', '.search-result', 'article.opp'
  ];

  for (const sel of selectors) {
    $(sel).each((i, el) => {
      const link  = $(el).find('a').first();
      const title = link.text().trim() || $(el).find('.title, .opp-title, h3, h4').text().trim();
      const href  = link.attr('href') || '';
      if (title.length < 10) return;
      items.push({
        title,
        url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
        description: $(el).text().trim().slice(0, 400)
      });
    });
    if (items.length > 0) break;
  }

  if (items.length === 0) {
    logger('GovWin web: could not parse HTML results — page structure may have changed');
  }

  return items;
}

function buildRecord(entry) {
  const { category, program, itType } = classifyOpportunity(entry.title, entry.description);
  const stateCode = entry.stateCode || '';
  const hr1Info   = getHR1Score(stateCode);
  const urgency   = calcUrgency(entry.dueDate);
  const estValueM = entry.valueMin > 0 ? Math.round(entry.valueMin / 100000) / 10 : 0;
  const winProb   = calcWinProbability(stateCode, category, hr1Info.keyFactor || '');
  const id        = makeId(entry.title, stateCode || 'GovWin', entry.rfpNum);

  return {
    id,
    state:               stateCode || 'Unknown',
    region:              stateCode ? getRegion(stateCode) : 'Unknown',
    agency:              entry.agency || 'State/Federal HHS Agency',
    opportunity_title:   entry.title,
    rfp_rfi_number:      entry.rfpNum || 'N/A',
    category,
    program,
    it_type:             itType,
    status:              entry.dueDate ? 'Active RFP' : 'Pre-RFP',
    published_date:      entry.postedDate || new Date().toISOString().slice(0, 10),
    due_date:            entry.dueDate || 'TBD',
    days_remaining:      calcDaysRemaining(entry.dueDate),
    est_value_m:         estValueM,
    beneficiaries:       0,
    fmap:                getFMAP(stateCode),
    urgency,
    document_url:        entry.href || BASE_URL,
    portal_url:          BASE_URL,
    notes:               `GovWin IQ listing. ${entry.description.slice(0, 200)}`,
    win_probability:     winProb,
    competitive_context: hr1Info.keyFactor || '',
    apd_status:          'Unknown',
    incumbent_expiry:    'Unknown',
    hr1_readiness_score: hr1Info.score || 3,
    source:              'GovWin IQ',
    source_tier:         2,
    scraped_at:          new Date().toISOString()
  };
}

// ── Minimal cookie jar ────────────────────────────────────────────────────────

class CookieJar {
  constructor() { this.cookies = {}; }

  serialize() {
    return Object.entries(this.cookies).map(([k, v]) => `${k}=${v}`).join('; ');
  }
}

function extractCookies(setCookieHeaders, jar) {
  for (const header of setCookieHeaders) {
    const part = header.split(';')[0].trim();
    const eq   = part.indexOf('=');
    if (eq === -1) continue;
    jar.cookies[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

module.exports = { scrape };
