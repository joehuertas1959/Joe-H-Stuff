'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const { fetchWithBrowser } = require('./browser');
const { classifyOpportunity, calcUrgency, calcDaysRemaining, calcWinProbability,
        getHR1Score, getRegion, getFMAP, makeId, parseRFPNumber } = require('./reference-data');

// Single-word nav links to skip
const NAV_SKIP = /^(home|about|contact|login|search|menu|back|next|previous|skip|print|share|facebook|twitter|linkedin|accessibility|sitemap|help|top|footer|header|news|events|careers|privacy|terms|subscribe|english|español)$/i;

// Link TITLES that are clearly not procurement opportunities
const BAD_TITLE = /^(what\s+is\b|apply\s+for\b|view\s+our\b|about\s+|how\s+to\b|contact\s+|click\s+here|learn\s+more|read\s+more|sign\s+in|log\s+in|more\s+info|visit\s+|go\s+to\s+|see\s+all|check\s+out|get\s+|find\s+a\b|find\s+your|translate\b|español|accessibility\b|skip\s+to|back\s+to\b)/i;

// Person name / staff listing patterns — not a procurement title
const STAFF_TITLE = /\b(director|secretary|administrator|commissioner|officer|chief|supervisor|coordinator|manager|deputy|associate\s+commissioner|state\s+medicaid\s+director)\b/i;

// Must appear in the link text OR its immediate context for Strategy 2
const PROCUREMENT_SIGNAL = /\b(RFP|RFI|ITN|IFB|RFQ|RFQQ|solicitation|request\s+for\s+proposal|request\s+for\s+information|request\s+for\s+quotation|bid\s+opportunit|procurement\s+opportunit|upcoming\s+procurement|vendor\s+opportunit|contract\s+opportunit|notice\s+of\s+intent|sources?\s+sought|pre-solicitation|pre\s+solicitation|award\s+notice)\b/i;

async function fetchHtml(url, logger) {
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
    if (bodyText.length < 400 || !/(RFP|RFI|solicitation|procurement|upcoming|bid|contract|vendor)/i.test(bodyText)) {
      logger(`${url}: static HTML appears empty — using browser rendering …`);
      const html = await fetchWithBrowser(url, { logger });
      return cheerio.load(html);
    }
    return cheerio.load(resp.data);
  } catch (err) {
    logger(`${url}: axios failed (${err.message}) — using browser rendering …`);
    const html = await fetchWithBrowser(url, { logger });
    return cheerio.load(html);
  }
}

function parseDate(text) {
  const MONTHS = {january:1,february:2,march:3,april:4,may:5,june:6,july:7,august:8,september:9,october:10,november:11,december:12};
  let m = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) {
    const y = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${y}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`;
  }
  m = text.match(/([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
  if (m) {
    const mo = MONTHS[m[1].toLowerCase()];
    if (mo) return `${m[3]}-${String(mo).padStart(2,'0')}-${m[2].padStart(2,'0')}`;
  }
  return null;
}

function isBadTitle(text) {
  if (text.length < 8 || text.length > 200) return true;
  if (NAV_SKIP.test(text)) return true;
  if (BAD_TITLE.test(text)) return true;
  // Person name with staff title but no procurement signal
  if (STAFF_TITLE.test(text) && !PROCUREMENT_SIGNAL.test(text)) return true;
  // Ends with "policy" or "statement" — footer links
  if (/\b(policy|statement|notice|disclaimer|cookie|copyright)\s*$/.test(text)) return true;
  // Pure question (no procurement context)
  if (/\?$/.test(text) && !PROCUREMENT_SIGNAL.test(text)) return true;
  return false;
}

async function scrapePortal(config, { logger = console.log } = {}) {
  const { state, agency, url, baseUrl, beneficiaries = 0, keywords, estValueM, notes: portalNotes } = config;
  logger(`${agency} (${state}): fetching procurement page …`);
  const results = [];

  try {
    const $ = await fetchHtml(url, logger);
    const entries = [];
    const seen = new Set();

    const kwRegex = keywords || /RFP|RFI|IFB|solicitation|procurement|bid|contract|vendor|Medicaid|SNAP|TANF|eligibility|MMIS|managed care|MCO/i;

    // Strategy 1: table rows — good structured data
    $('table tbody tr, table tr').each((i, row) => {
      const cells = $(row).find('td');
      if (cells.length < 2) return;
      const rowText = $(row).text().trim();
      if (rowText.length > 2000) return; // skip rows that contain entire page navigation
      if (!kwRegex.test(rowText) && !PROCUREMENT_SIGNAL.test(rowText)) return;
      const link = $(row).find('a').first();
      const href = link.attr('href') || '';
      const title = (link.text().trim() || $(cells.eq(0)).text().trim() || $(cells.eq(1)).text().trim()).slice(0, 200);
      if (isBadTitle(title)) return;
      const key = title.toLowerCase().slice(0, 60);
      if (seen.has(key)) return;
      seen.add(key);
      entries.push({ title, href, context: rowText.slice(0, 400) });
    });

    // Strategy 2: anchor links — ONLY accept if procurement signal present
    if (entries.length === 0) {
      $('a[href]').each((i, el) => {
        const text = $(el).text().trim();
        const href = $(el).attr('href') || '';
        if (isBadTitle(text)) return;

        const context = $(el).closest('p, li, td, tr, section').text().trim().slice(0, 500);

        // Require a procurement signal in the title OR the immediate context
        if (!PROCUREMENT_SIGNAL.test(text) && !PROCUREMENT_SIGNAL.test(context)) return;

        // Also require HHS-program relevance
        if (!kwRegex.test(text + ' ' + context)) return;

        const key = text.toLowerCase().slice(0, 60);
        if (seen.has(key)) return;
        seen.add(key);
        entries.push({ title: text, href, context: context.slice(0, 400) });
      });
    }

    logger(`${agency} (${state}): found ${entries.length} entries`);

    for (const entry of entries.slice(0, 20)) {
      const rfpNum = parseRFPNumber(entry.title + ' ' + entry.context);
      const dueDate = parseDate(entry.context);
      const { category, program_area, program, itType } = classifyOpportunity(entry.title, entry.context);
      const hr1Info = getHR1Score(state);
      const urgency = calcUrgency(dueDate);
      const winProb = calcWinProbability(state, category, hr1Info.keyFactor || '', program_area);
      const id = makeId(entry.title, state, rfpNum);

      let fullHref = entry.href;
      if (fullHref && !fullHref.startsWith('http')) {
        const base = baseUrl || new URL(url).origin;
        fullHref = fullHref.startsWith('/') ? `${base}${fullHref}` : `${base}/${fullHref}`;
      }

      results.push({
        id,
        state,
        region: getRegion(state),
        agency,
        opportunity_title: entry.title,
        rfp_rfi_number: rfpNum,
        category,
        program_area,
        program,
        it_type: itType,
        status: dueDate ? 'Active RFP' : 'Pre-RFP',
        published_date: new Date().toISOString().slice(0, 10),
        due_date: dueDate || 'TBD',
        days_remaining: calcDaysRemaining(dueDate),
        est_value_m: estValueM || 0,
        beneficiaries: beneficiaries || 0,
        fmap: getFMAP(state),
        urgency,
        document_url: fullHref || `NOT_FOUND — no direct link on listing page`,
        portal_url: url,
        notes: `${agency} portal. ${portalNotes || ''} ${hr1Info.keyFactor || ''}`.trim(),
        win_probability: winProb,
        competitive_context: (hr1Info.keyFactor || '').slice(0, 150),
        apd_status: 'Unknown',
        incumbent_expiry: 'Unknown',
        hr1_readiness_score: hr1Info.score || 3,
        source: `${agency} Portal`,
        source_tier: config.tier || 1,
        scraped_at: new Date().toISOString()
      });
    }
  } catch (err) {
    logger(`${agency} (${state}) error: ${err.message}`);
  }

  return results;
}

module.exports = { scrapePortal };
