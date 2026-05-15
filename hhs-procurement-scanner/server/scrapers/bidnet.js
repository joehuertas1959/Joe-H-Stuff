'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const { fetchWithBrowser } = require('./browser');
const { classifyOpportunity, calcUrgency, calcDaysRemaining, calcWinProbability,
        getHR1Score, getRegion, getFMAP, makeId, parseRFPNumber } = require('./reference-data');

// BidNet Direct — public bid aggregator used by many state/local HHS agencies
// Public search does not require authentication for open bids
const SEARCH_URL = 'https://www.bidnetdirect.com/public/solicitations/open';
const PORTAL_URL = 'https://www.bidnetdirect.com';

// HHS-specific search terms to query
const HHS_SEARCHES = [
  { label: 'Medicaid-IT',   q: 'Medicaid information technology' },
  { label: 'MMIS',          q: 'MMIS Medicaid Management Information System' },
  { label: 'Eligibility',   q: 'eligibility enrollment benefits system' },
  { label: 'SNAP-TANF',     q: 'SNAP TANF human services technology' },
  { label: 'HealthIT-CE',   q: 'health care technology community engagement work requirements' },
];

const PROCUREMENT_SIGNAL = /\b(RFP|RFI|ITN|IFB|RFQ|solicitation|bid|proposal|contract\s+opportunity)\b/i;
const HHS_RELEVANCE = /\b(medicaid|medicare|chip|snap|tanf|hhs|cms|eligibility\s+system|enrollment\s+system|mmis|managed\s+care|child\s+welfare|human\s+services|social\s+services|benefits\s+system|health\s+care\s+(IT|information|system|technology))\b/i;

async function scrape({ logger = console.log } = {}) {
  logger('BidNet Direct: searching for HHS-related bids …');
  const results = [];
  const seen = new Set();

  for (const search of HHS_SEARCHES) {
    logger(`BidNet Direct [${search.label}]: querying …`);
    try {
      const entries = await fetchBidNetSearch(search.q, logger);
      logger(`BidNet Direct [${search.label}]: ${entries.length} relevant entries`);
      for (const entry of entries) {
        if (seen.has(entry.id)) continue;
        seen.add(entry.id);
        results.push(entry);
      }
      await sleep(2000);
    } catch (err) {
      logger(`BidNet Direct [${search.label}] error: ${err.message}`);
    }
  }

  logger(`BidNet Direct: ${results.length} total unique opportunities`);
  return results;
}

async function fetchBidNetSearch(query, logger) {
  const entries = [];
  let $;

  // Try static fetch first
  try {
    const resp = await axios.get(SEARCH_URL, {
      params: { q: query },
      timeout: 25000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      maxRedirects: 5
    });
    const bodyText = cheerio.load(resp.data)('body').text();
    if (bodyText.length > 500 && /solicitation|bid|RFP|proposal/i.test(bodyText)) {
      $ = cheerio.load(resp.data);
    }
  } catch (_) {}

  // Browser fallback
  if (!$) {
    try {
      const url = `${SEARCH_URL}?q=${encodeURIComponent(query)}`;
      const html = await fetchWithBrowser(url, { logger });
      $ = cheerio.load(html);
    } catch (bErr) {
      logger(`BidNet Direct browser fallback failed: ${bErr.message}`);
      return entries;
    }
  }

  const seen = new Set();

  // BidNet typically renders results as table rows or card-style divs
  // Try table approach first
  $('table tbody tr, .bid-row, .solicitation-row, [class*="bid-item"], [class*="solicitation-item"]').each((_, row) => {
    const rowText = $(row).text().trim();
    if (rowText.length < 10 || rowText.length > 3000) return;
    if (!HHS_RELEVANCE.test(rowText)) return;

    const link = $(row).find('a').first();
    const title = link.text().trim() || $(row).find('[class*="title"], [class*="name"], td').first().text().trim();
    if (title.length < 8 || title.length > 200) return;

    const key = title.toLowerCase().slice(0, 60);
    if (seen.has(key)) return;
    seen.add(key);

    const href = link.attr('href') || '';
    const fullHref = href.startsWith('http') ? href : href ? `${PORTAL_URL}${href.startsWith('/') ? '' : '/'}${href}` : PORTAL_URL;
    const dueDate = parseDate(rowText);
    const stateMatch = rowText.match(/\b([A-Z]{2})\b/);
    const state = stateMatch ? stateMatch[1] : 'Federal';
    const rfpNum = parseRFPNumber(rowText);

    entries.push({ title, href: fullHref, dueDate, state, rfpNum, context: rowText.slice(0, 400) });
  });

  // Fallback: any links with procurement signal
  if (entries.length === 0) {
    $('a[href]').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length < 8 || text.length > 200) return;
      if (!HHS_RELEVANCE.test(text)) return;
      if (!PROCUREMENT_SIGNAL.test(text)) return;
      const key = text.toLowerCase().slice(0, 60);
      if (seen.has(key)) return;
      seen.add(key);
      const href = $(el).attr('href') || '';
      const fullHref = href.startsWith('http') ? href : `${PORTAL_URL}${href.startsWith('/') ? '' : '/'}${href}`;
      const context = $(el).closest('p, li, div, tr').text().trim().slice(0, 400);
      const dueDate = parseDate(context);
      const stateMatch = context.match(/\b([A-Z]{2})\b/);
      entries.push({ title: text, href: fullHref, dueDate, state: stateMatch?.[1] || 'Federal', rfpNum: parseRFPNumber(text + context), context });
    });
  }

  return entries.slice(0, 20).map(entry => {
    const { category, program_area, program, itType } = classifyOpportunity(entry.title, entry.context || '');
    const hr1Info = getHR1Score(entry.state);
    const urgency = calcUrgency(entry.dueDate);
    const winProb = calcWinProbability(entry.state, category, hr1Info.keyFactor || '', program_area);
    const id = makeId(entry.title, entry.state, entry.rfpNum);

    return {
      id,
      state: entry.state,
      region: getRegion(entry.state) || 'Unknown',
      agency: 'BidNet Direct',
      opportunity_title: entry.title,
      rfp_rfi_number: entry.rfpNum || 'N/A',
      category,
      program_area,
      program,
      it_type: itType,
      status: entry.dueDate ? 'Active RFP' : 'Pre-RFP',
      published_date: new Date().toISOString().slice(0, 10),
      due_date: entry.dueDate || 'TBD',
      days_remaining: calcDaysRemaining(entry.dueDate),
      est_value_m: 0,
      beneficiaries: 0,
      fmap: getFMAP(entry.state),
      urgency,
      document_url: entry.href,
      portal_url: PORTAL_URL,
      notes: `BidNet Direct aggregated bid. ${hr1Info.keyFactor || ''}`.trim(),
      win_probability: winProb,
      competitive_context: (hr1Info.keyFactor || '').slice(0, 150),
      apd_status: 'Unknown',
      incumbent_expiry: 'Unknown',
      hr1_readiness_score: hr1Info.score || 3,
      source: 'BidNet Direct',
      source_tier: 2,
      scraped_at: new Date().toISOString()
    };
  });
}

function parseDate(text) {
  const m = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) {
    const y = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${y}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`;
  }
  return null;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

module.exports = { scrape };
