'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const { fetchWithBrowser } = require('./browser');
const { classifyOpportunity, calcUrgency, calcDaysRemaining, calcWinProbability,
        getHR1Score, getRegion, getFMAP, makeId, parseRFPNumber } = require('./reference-data');

// Procurement signal — must appear in link text OR surrounding context for Strategy 2
const PROCUREMENT_SIGNAL = /\b(RFP|RFI|ITN|IFB|RFQ|RFQQ|solicitation|request\s+for\s+proposal|request\s+for\s+information|invitation\s+for\s+bid|bid\s+opportunity|contract\s+opportunity|procurement|vendor\s+selection|source\s+selection|pre-solicitation|pre-bid|award\s+notice|notice\s+of\s+intent)\b/i;

// Exact single-word nav items
const NAV_SKIP = /^(home|about|contact|login|search|menu|back|next|previous|skip|print|share|facebook|twitter|linkedin|accessibility|sitemap|help|top|footer|header|news|events|careers|privacy|terms|subscribe|resources|forms|services|programs|apply|register|logout|signin|signup)$/i;

// Multi-word UI / nav / footer patterns that are never procurement titles
const BAD_TITLE = /^(skip\s+to|go\s+to\s+main|back\s+to\s+top|return\s+to|scroll\s+to|jump\s+to|change\s+site\s+language|select\s+language|language\s+(settings|options)|report\s+(a|an)\s+(accessibility|problem|issue|bug)|accessibility\s+statement|view\s+(all|more|our|full)|read\s+more|see\s+all|see\s+more|learn\s+more|click\s+here|find\s+out|sign\s+(in|up|out)|log\s+(in|out)|create\s+account|my\s+account|give\s+feedback|submit\s+feedback|contact\s+us|email\s+us|call\s+us|follow\s+us|share\s+this|print\s+this|get\s+adobe|download\s+adobe|department\s+of\s+human\s+services$|department\s+of\s+health$|department\s+of\s+health\s+and\s+human\s+services$|state\s+of\s+[a-z]+$|office\s+of\s+[a-z\s]+$|bureau\s+of\s+[a-z\s]+$)/i;

// Phone number patterns masquerading as titles
const PHONE_PATTERN = /^[\d\s\.\-\(\)]+$|^\d-\d{3}-[A-Z0-9]+$|^1-8[0-9]{2}-/i;

// Staff bio / org chart entries
const STAFF_TITLE = /\b(director|secretary|administrator|commissioner|deputy|assistant\s+secretary|chief\s+of\s+staff|executive\s+director|general\s+counsel)\b.*,/i;

function isBadTitle(text) {
  if (NAV_SKIP.test(text)) return true;
  if (BAD_TITLE.test(text)) return true;
  if (PHONE_PATTERN.test(text.trim())) return true;
  if (STAFF_TITLE.test(text)) return true;
  // Reject if text is mostly digits/punctuation (breadcrumbs, page numbers)
  const alphaPct = (text.match(/[a-zA-Z]/g) || []).length / text.length;
  if (alphaPct < 0.4 && text.length < 30) return true;
  return false;
}

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
  // MM/DD/YYYY or MM-DD-YYYY
  let m = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) {
    const y = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${y}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`;
  }
  // "March 15, 2026" or "15 March 2026"
  m = text.match(/([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
  if (m) {
    const mo = MONTHS[m[1].toLowerCase()];
    if (mo) return `${m[3]}-${String(mo).padStart(2,'0')}-${m[2].padStart(2,'0')}`;
  }
  return null;
}

async function scrapePortal(config, { logger = console.log } = {}) {
  const { state, agency, url, baseUrl, beneficiaries = 0, keywords, estValueM, notes: portalNotes } = config;
  logger(`${agency} (${state}): fetching procurement page …`);
  const results = [];

  try {
    const $ = await fetchHtml(url, logger);
    const entries = [];
    const seen = new Set();

    const kwRegex = keywords || /RFP|RFI|IFB|solicitation|procurement|bid|contract|vendor|Medicaid|SNAP|TANF|health|eligibility|IT|system|MMIS|managed care|MCO/i;

    // Strategy 1: table rows
    $('table tbody tr, table tr').each((i, row) => {
      const cells = $(row).find('td');
      if (cells.length < 2) return;
      const rowText = $(row).text().trim();
      if (!kwRegex.test(rowText)) return;
      const link = $(row).find('a').first();
      const href = link.attr('href') || '';
      const title = link.text().trim() || $(cells.eq(0)).text().trim() || $(cells.eq(1)).text().trim();
      if (title.length < 10) return;
      if (isBadTitle(title)) return;
      const key = title.toLowerCase().slice(0, 60);
      if (seen.has(key)) return;
      seen.add(key);
      entries.push({ title, href, context: rowText.slice(0, 400) });
    });

    // Strategy 2: list items / paragraphs with procurement links
    // Requires PROCUREMENT_SIGNAL in text or context to block nav/footer/UI links
    if (entries.length === 0) {
      $('a[href]').each((i, el) => {
        const text = $(el).text().trim();
        const href = $(el).attr('href') || '';
        if (text.length < 10) return;
        if (isBadTitle(text)) return;
        const context = $(el).closest('p, li, td, div').text().trim();
        // Must have procurement signal AND keyword match
        if (!PROCUREMENT_SIGNAL.test(text) && !PROCUREMENT_SIGNAL.test(context)) return;
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
