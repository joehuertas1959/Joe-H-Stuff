'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const { classifyOpportunity, calcUrgency, calcDaysRemaining, calcWinProbability,
        getHR1Score, getRegion, getFMAP, makeId, parseRFPNumber } = require('./reference-data');

// GovWin IQ (Deltek) — premier paid subscription intel platform for government contracting
// Covers pre-RFP pipeline, incumbent data, award histories, and analyst briefings
// Public pages (press releases, news) scraped without auth; full pipeline requires subscription
const GOVWIN_BASE     = 'https://govwin.com';
const PUBLIC_NEWS_URL = 'https://govwin.com/ko/resourcelibrary/index';
const PORTAL_URL      = 'https://govwin.com';

const HHS_RELEVANCE = /\b(medicaid|medicare|chip|snap|tanf|hhs|cms|eligibility\s+system|enrollment\s+system|mmis|managed\s+care|child\s+welfare|human\s+services|social\s+services|benefits\s+system|health\s+information|health\s+IT|health\s+technology|state\s+health|magi|work\s+requirements|community\s+engagement)\b/i;
const PROCUREMENT_SIGNAL = /\b(RFP|RFI|ITN|IFB|RFQ|solicitation|bid|proposal|contract\s+award|opportunity|pipeline|incumbent|recompete|upcoming)\b/i;

async function scrape({ logger = console.log } = {}) {
  logger('GovWin IQ: checking for HHS procurement intelligence …');

  // Check for subscription credentials
  const username = process.env.GOVWIN_USERNAME;
  const password  = process.env.GOVWIN_PASSWORD;

  if (username && password) {
    logger('GovWin IQ: credentials found — attempting authenticated scrape …');
    try {
      return await scrapeAuthenticated(username, password, logger);
    } catch (err) {
      logger(`GovWin IQ authenticated scrape failed: ${err.message} — falling back to public pages`);
    }
  } else {
    logger('GovWin IQ: no credentials (set GOVWIN_USERNAME / GOVWIN_PASSWORD env vars for full pipeline access)');
  }

  // Public page fallback — resource library / press releases
  return await scrapePublic(logger);
}

async function scrapeAuthenticated(username, password, logger) {
  // Step 1: POST to login endpoint
  const loginUrl = `${GOVWIN_BASE}/ko/user/login`;
  const session  = axios.create({ timeout: 30000, maxRedirects: 10, withCredentials: true });

  // Fetch login page to get CSRF token
  const loginPage = await session.get(loginUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const $login = cheerio.load(loginPage.data);
  const csrf   = $login('input[name="_token"], input[name="csrf_token"], input[name="authenticity_token"]').val() || '';

  // Attempt login
  await session.post(loginUrl, `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&_token=${encodeURIComponent(csrf)}`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent':   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer':      loginUrl
    }
  });

  // Attempt to fetch HHS pipeline search
  const searchUrl = `${GOVWIN_BASE}/ko/opportunities/search?keyword=medicaid+eligibility&naics=541512,541511,541519,541690&agencies=HHS,CMS`;
  const resp = await session.get(searchUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });

  // Verify we are logged in (not redirected back to login)
  if (/login|sign\s*in|please\s+log/i.test(resp.data.slice(0, 2000))) {
    throw new Error('Login did not succeed — check credentials');
  }

  const $ = cheerio.load(resp.data);
  return extractOpportunities($, logger, 'GovWin IQ (Authenticated)');
}

async function scrapePublic(logger) {
  const results = [];

  try {
    const resp = await axios.get(PUBLIC_NEWS_URL, {
      timeout: 25000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept':     'text/html,application/xhtml+xml'
      },
      maxRedirects: 5
    });

    const $ = cheerio.load(resp.data);
    const bodyText = $('body').text();

    // If we got useful content, extract any HHS procurement signals
    if (bodyText.length > 500) {
      const entries = extractOpportunities($, logger, 'GovWin IQ (Public)');
      if (entries.length > 0) return entries;
    }
  } catch (err) {
    logger(`GovWin IQ public page fetch failed: ${err.message}`);
  }

  // Emit a subscription-required sentinel so users know this source is available
  logger('GovWin IQ: no public results — emitting subscription sentinel');
  const sentinel = buildSubscriptionSentinel();
  return [sentinel];
}

function extractOpportunities($, logger, sourceName) {
  const entries = [];
  const seen    = new Set();

  // Try structured result rows first
  $('table tbody tr, .opportunity-row, .result-row, [class*="opp-item"], [class*="result-item"]').each((_, row) => {
    const rowText = $(row).text().trim();
    if (rowText.length < 15 || rowText.length > 3000) return;
    if (!HHS_RELEVANCE.test(rowText)) return;

    const link  = $(row).find('a').first();
    const title = link.text().trim() || $(row).find('td').first().text().trim();
    if (title.length < 8 || title.length > 200) return;

    const key = title.toLowerCase().slice(0, 60);
    if (seen.has(key)) return;
    seen.add(key);

    const href     = link.attr('href') || '';
    const fullHref = href.startsWith('http') ? href : href ? `${GOVWIN_BASE}${href.startsWith('/') ? '' : '/'}${href}` : GOVWIN_BASE;
    const dueDate  = parseDate(rowText);
    const stateMatch = rowText.match(/\b([A-Z]{2})\b/);
    const state    = stateMatch ? stateMatch[1] : 'Federal';
    const rfpNum   = parseRFPNumber(rowText);

    entries.push({ title, href: fullHref, dueDate, state, rfpNum, context: rowText.slice(0, 400) });
  });

  // Fallback: links with both HHS relevance and procurement signal
  if (entries.length === 0) {
    $('a[href]').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length < 10 || text.length > 200) return;
      if (!HHS_RELEVANCE.test(text)) return;
      if (!PROCUREMENT_SIGNAL.test(text)) return;

      const key = text.toLowerCase().slice(0, 60);
      if (seen.has(key)) return;
      seen.add(key);

      const href    = $(el).attr('href') || '';
      const context = $(el).closest('p, li, div, tr').text().trim().slice(0, 400);
      const fullHref = href.startsWith('http') ? href : `${GOVWIN_BASE}${href.startsWith('/') ? '' : '/'}${href}`;

      entries.push({
        title: text,
        href:  fullHref,
        dueDate: parseDate(context),
        state:   (context.match(/\b([A-Z]{2})\b/) || [])[1] || 'Federal',
        rfpNum:  parseRFPNumber(text + context),
        context
      });
    });
  }

  logger(`${sourceName}: ${entries.length} relevant entries found`);

  return entries.slice(0, 20).map(entry => {
    const { category, program_area, program, itType } = classifyOpportunity(entry.title, entry.context || '');
    const hr1Info = getHR1Score(entry.state);
    const urgency  = calcUrgency(entry.dueDate);
    const winProb  = calcWinProbability(entry.state, category, hr1Info.keyFactor || '', program_area);
    const id       = makeId(entry.title, entry.state, entry.rfpNum);

    return {
      id,
      state:               entry.state,
      region:              getRegion(entry.state) || 'Unknown',
      agency:              'GovWin IQ (Deltek)',
      opportunity_title:   entry.title,
      rfp_rfi_number:      entry.rfpNum || 'N/A',
      category,
      program_area,
      program,
      it_type:             itType,
      status:              entry.dueDate ? 'Active RFP' : 'Pre-RFP',
      published_date:      new Date().toISOString().slice(0, 10),
      due_date:            entry.dueDate || 'TBD',
      days_remaining:      calcDaysRemaining(entry.dueDate),
      est_value_m:         0,
      beneficiaries:       0,
      fmap:                getFMAP(entry.state),
      urgency,
      document_url:        entry.href,
      portal_url:          PORTAL_URL,
      notes:               `GovWin IQ intel. ${hr1Info.keyFactor || ''}. Subscription required for full pipeline data.`.trim(),
      win_probability:     winProb,
      competitive_context: (hr1Info.keyFactor || '').slice(0, 150),
      apd_status:          'Unknown',
      incumbent_expiry:    'Unknown',
      hr1_readiness_score: hr1Info.score || 3,
      source:              sourceName,
      source_tier:         2,
      scraped_at:          new Date().toISOString()
    };
  });
}

function buildSubscriptionSentinel() {
  return {
    id:                  'govwin-subscription-required',
    state:               'Federal',
    region:              'National',
    agency:              'GovWin IQ (Deltek)',
    opportunity_title:   'GovWin IQ — Subscription Required for Full Pipeline Access',
    rfp_rfi_number:      'N/A',
    category:            'Intel Source',
    program_area:        'All HHS Programs',
    program:             'N/A',
    it_type:             'N/A',
    status:              'Info',
    published_date:      new Date().toISOString().slice(0, 10),
    due_date:            'TBD',
    days_remaining:      null,
    est_value_m:         0,
    beneficiaries:       0,
    fmap:                'N/A',
    urgency:             'Low',
    document_url:        PORTAL_URL,
    portal_url:          PORTAL_URL,
    notes:               'GovWin IQ (govwin.com) provides pre-RFP HHS pipeline data, incumbent info, and analyst briefings. Set GOVWIN_USERNAME and GOVWIN_PASSWORD env vars to enable authenticated scraping. Without credentials, only public resource library content is accessible.',
    win_probability:     'N/A',
    competitive_context: 'GovWin IQ subscription unlocks pre-solicitation pipeline, incumbent contract values, and recompete dates. Industry standard for BD pipeline management.',
    apd_status:          'N/A',
    incumbent_expiry:    'N/A',
    hr1_readiness_score: 0,
    source:              'GovWin IQ (Subscription Required)',
    source_tier:         2,
    scraped_at:          new Date().toISOString()
  };
}

function parseDate(text) {
  const m = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) {
    const y = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${y}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
  }
  return null;
}

module.exports = { scrape };
