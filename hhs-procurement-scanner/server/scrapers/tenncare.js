'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const { fetchWithBrowser } = require('./browser');
const { classifyOpportunity, calcUrgency, calcDaysRemaining, calcWinProbability,
        getHR1Score, getRegion, getFMAP, makeId } = require('./reference-data');

// Primary TennCare procurement listing page
const PORTAL_URL = 'https://www.tn.gov/tenncare/information-statistics/upcoming-procurements.html';
// TN statewide vendor/solicitation search (Edison) — broader fallback
const EDISON_URL  = 'https://hub.procurement.tn.gov/bso/external/bidDetail.sdo';
const VENDOR_URL  = 'https://www.tn.gov/generalservices/procurement/central-procurement-office--cpo-/supplier-information/request-for-proposals--rfp--opportunities1.html';

const PROCUREMENT_SIGNAL = /\b(RFP|RFI|ITN|IFB|RFQ|solicitation|request\s+for\s+proposal|request\s+for\s+information|bid\s+opportunit|procurement|upcoming|vendor\s+opportunit|sources?\s+sought|pre-solicitation|contract\s+opportunit)\b/i;
const TN_HHS_TERMS = /\b(TennCare|Medicaid|CHIP|eligibility|enrollment|MMIS|managed care|MCO|health\s+care|health\s+plan|behavioral\s+health|CMS|SNAP|TANF|social\s+service|human\s+service)\b/i;

async function tryFetch(url, logger) {
  try {
    const resp = await axios.get(url, {
      timeout: 25000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml'
      },
      maxRedirects: 5
    });
    const $t = cheerio.load(resp.data);
    const bodyText = $t('body').text().replace(/\s+/g, ' ').trim();
    if (bodyText.length > 500 && PROCUREMENT_SIGNAL.test(bodyText)) {
      return cheerio.load(resp.data);
    }
    // Try browser rendering
    logger(`TennCare: ${url} — trying browser rendering …`);
    const html = await fetchWithBrowser(url, { logger });
    return cheerio.load(html);
  } catch (err) {
    logger(`TennCare: ${url} failed (${err.message})`);
    return null;
  }
}

function extractEntries($, url) {
  const entries = [];
  const seen = new Set();

  // Strategy 1: table rows
  $('table tbody tr, table tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length < 2) return;
    const rowText = $(row).text().trim();
    if (rowText.length > 2000 || rowText.length < 10) return;
    const link = $(row).find('a').first();
    const href = link.attr('href') || '';
    const title = (link.text().trim() || $(cells.eq(0)).text().trim()).slice(0, 200);
    if (title.length < 8) return;
    const key = title.toLowerCase().slice(0, 60);
    if (seen.has(key)) return;
    seen.add(key);
    const rfpNum = extractRFP(rowText);
    const dueDate = parseDate(rowText);
    entries.push({ title, href, rfpNum, dueDate, context: rowText.slice(0, 400) });
  });

  if (entries.length > 0) return entries;

  // Strategy 2: anchor links with procurement + TennCare/Medicaid signal
  $('a[href]').each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr('href') || '';
    if (text.length < 8 || text.length > 200) return;
    const context = $(el).closest('p, li, td, tr, section').text().trim().slice(0, 500);
    if (!PROCUREMENT_SIGNAL.test(text) && !PROCUREMENT_SIGNAL.test(context)) return;
    if (!TN_HHS_TERMS.test(text + ' ' + context)) return;
    const key = text.toLowerCase().slice(0, 60);
    if (seen.has(key)) return;
    seen.add(key);
    const rfpNum = extractRFP(text + ' ' + context);
    const dueDate = parseDate(context);
    entries.push({ title: text, href, rfpNum, dueDate, context: context.slice(0, 400) });
  });

  // Strategy 3: headings / paragraphs that look like solicitation titles
  if (entries.length === 0) {
    $('h2, h3, h4, p, li').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length < 15 || text.length > 300) return;
      if (!PROCUREMENT_SIGNAL.test(text)) return;
      if (!TN_HHS_TERMS.test(text)) return;
      const key = text.toLowerCase().slice(0, 60);
      if (seen.has(key)) return;
      seen.add(key);
      const link = $(el).find('a').first();
      const href = link.attr('href') || '';
      entries.push({ title: text, href, rfpNum: extractRFP(text), dueDate: parseDate(text), context: text });
    });
  }

  return entries;
}

async function scrape({ logger = console.log } = {}) {
  logger('TennCare: fetching upcoming procurements …');
  const results = [];

  // Try primary TennCare portal, then TN General Services RFP page
  const urlsToTry = [PORTAL_URL, VENDOR_URL];
  const allEntries = [];

  for (const url of urlsToTry) {
    const $ = await tryFetch(url, logger);
    if (!$) continue;
    const entries = extractEntries($, url);
    logger(`TennCare: ${url} → ${entries.length} entries`);
    for (const e of entries) {
      const key = (e.title || '').toLowerCase().slice(0, 60);
      if (!allEntries.some(x => x.title.toLowerCase().slice(0, 60) === key)) {
        allEntries.push({ ...e, sourceUrl: url });
      }
    }
  }

  if (allEntries.length === 0) {
    logger('TennCare: no procurement entries found — portal may require manual check at ' + PORTAL_URL);
    // Emit a sentinel entry so the scanner surface-level shows TennCare is active
    results.push(buildSentinel());
    return results;
  }

  const hr1Info = getHR1Score('TN');
  for (const entry of allEntries.slice(0, 20)) {
    const { category, program, itType } = classifyOpportunity(entry.title, entry.context || '');
    const sourceUrl = entry.sourceUrl || PORTAL_URL;
    let fullHref = entry.href || '';
    if (fullHref && !fullHref.startsWith('http')) {
      fullHref = fullHref.startsWith('/') ? `https://www.tn.gov${fullHref}` : `https://www.tn.gov/${fullHref}`;
    }
    const urgency = calcUrgency(entry.dueDate);
    const winProb = calcWinProbability('TN', category, hr1Info.keyFactor);
    const id = makeId(entry.title, 'TN', entry.rfpNum);

    results.push({
      id,
      state: 'TN',
      region: 'Southeast',
      agency: 'TennCare (Tennessee Medicaid)',
      opportunity_title: entry.title,
      rfp_rfi_number: entry.rfpNum || 'N/A',
      category,
      program,
      it_type: itType,
      status: entry.dueDate ? 'Active RFP' : 'Pre-RFP',
      published_date: new Date().toISOString().slice(0, 10),
      due_date: entry.dueDate || 'TBD',
      days_remaining: calcDaysRemaining(entry.dueDate),
      est_value_m: estimateTennValue(category),
      beneficiaries: 1600000,
      fmap: getFMAP('TN'),
      urgency,
      document_url: fullHref || `NOT_FOUND — check portal: ${sourceUrl}`,
      portal_url: sourceUrl,
      notes: `TennCare portal. ${hr1Info.keyFactor}. Active Deloitte litigation context.`,
      win_probability: winProb,
      competitive_context: hr1Info.keyFactor.slice(0, 150),
      apd_status: 'Unknown',
      incumbent_expiry: 'Unknown',
      hr1_readiness_score: hr1Info.score,
      source: 'TennCare Portal',
      source_tier: 1,
      scraped_at: new Date().toISOString()
    });
  }

  return results;
}

function buildSentinel() {
  const hr1Info = getHR1Score('TN');
  return {
    id: makeId('TennCare Upcoming Procurements — Manual Review Required', 'TN', 'SENTINEL'),
    state: 'TN',
    region: 'Southeast',
    agency: 'TennCare (Tennessee Medicaid)',
    opportunity_title: 'TennCare Upcoming Procurements — Manual Review Required',
    rfp_rfi_number: 'N/A',
    category: 'MES-Other',
    program: 'Medicaid',
    it_type: 'DDI',
    status: 'Pre-RFP',
    published_date: new Date().toISOString().slice(0, 10),
    due_date: 'TBD',
    days_remaining: 'TBD',
    est_value_m: 0,
    beneficiaries: 1600000,
    fmap: getFMAP('TN'),
    urgency: 'WATCH',
    document_url: PORTAL_URL,
    portal_url: PORTAL_URL,
    notes: `TennCare portal could not be scraped automatically — page may require JavaScript. Review directly at ${PORTAL_URL}. ${hr1Info.keyFactor}.`,
    win_probability: 'Medium',
    competitive_context: hr1Info.keyFactor.slice(0, 150),
    apd_status: 'Unknown',
    incumbent_expiry: 'Unknown',
    hr1_readiness_score: hr1Info.score,
    source: 'TennCare Portal',
    source_tier: 1,
    scraped_at: new Date().toISOString()
  };
}

function extractRFP(text) {
  const m = text.match(/\b(RFP|RFI|ITN|IFB|RFQ|RFQQ)[\s#-]*([A-Z0-9-]{4,})/i);
  return m ? `${m[1]} ${m[2]}` : 'N/A';
}

function parseDate(text) {
  if (!text) return null;
  const m = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) {
    const [, mm, dd, yyyy] = m;
    const y = yyyy.length === 2 ? `20${yyyy}` : yyyy;
    return `${y}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
  }
  return null;
}

function estimateTennValue(category) {
  if (/audit/i.test(category)) return 2.5;
  if (/DDI|MMIS|E&E/i.test(category)) return 18.0;
  return 5.0;
}

module.exports = { scrape };
