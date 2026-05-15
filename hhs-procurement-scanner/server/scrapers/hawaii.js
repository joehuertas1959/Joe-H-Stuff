'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const { fetchWithBrowser } = require('./browser');
const { classifyOpportunity, calcUrgency, calcDaysRemaining, calcWinProbability, getHR1Score, getFMAP, makeId } = require('./reference-data');

const PORTAL_URL = 'https://medquest.hawaii.gov/content/medquest/en/resources/solicitations-contract.html';
const BASE_URL   = 'https://medquest.hawaii.gov';

const KEYWORDS = /RFP|RFI|solicitation|contract|procurement|Medicaid|Med-QUEST|eligibility|health|IT|information technology|MMIS|vendor|bid/i;

async function scrape({ logger = console.log } = {}) {
  logger('Hawaii Med-QUEST: fetching solicitations page …');
  const results = [];

  try {
    const resp = await axios.get(PORTAL_URL, {
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HHS-Procurement-Scanner/4.0)',
        'Accept': 'text/html,application/xhtml+xml'
      },
      maxRedirects: 5
    });

    const $ = cheerio.load(resp.data);
    const entries = [];
    const seen = new Set();

    // Hawaii CMS wraps content in .parsys / .par containers; try progressively broader selectors
    const selectors = [
      '.parsys a',
      '.par a',
      '.aem-Grid a',
      'article a',
      '.field--name-body a',
      'main a',
      '#content a'
    ];

    for (const sel of selectors) {
      $(sel).each((i, el) => {
        const text = $(el).text().trim();
        const href = $(el).attr('href') || '';
        if (text.length < 8) return;
        if (/^(home|about|contact|menu|back|top)$/i.test(text)) return;
        const context = $(el).closest('p, li, td, div').text().trim();
        if (!KEYWORDS.test(text + context)) return;

        const dedupKey = text.toLowerCase().slice(0, 60);
        if (seen.has(dedupKey)) return;
        seen.add(dedupKey);

        const rfpNum = extractRFP(text + context);
        const dueDate = parseDate(context) || parseDueLabel(context);

        // Resolve URL — Med-QUEST links are often absolute or relative-to-root
        const fullHref = href.startsWith('http') ? href
          : href.startsWith('/') ? `${BASE_URL}${href}`
          : href ? `${BASE_URL}/${href}` : null;

        entries.push({ title: text, rfpNum, href: fullHref, dueDate });
      });
      if (entries.length > 0) break;
    }

    // Browser fallback if static HTML yielded nothing
    if (entries.length === 0) {
      logger('Hawaii Med-QUEST: 0 from static HTML — retrying with browser rendering …');
      try {
        const html = await fetchWithBrowser(PORTAL_URL, { logger });
        const $b = cheerio.load(html);
        for (const sel of selectors) {
          $b(sel).each((i, el) => {
            const text = $b(el).text().trim();
            const href = $b(el).attr('href') || '';
            if (text.length < 8) return;
            if (/^(home|about|contact|menu|back|top)$/i.test(text)) return;
            const context = $b(el).closest('p, li, td, div').text().trim();
            if (!KEYWORDS.test(text + context)) return;
            const dedupKey = text.toLowerCase().slice(0, 60);
            if (seen.has(dedupKey)) return;
            seen.add(dedupKey);
            const rfpNum = extractRFP(text + context);
            const dueDate = parseDate(context) || parseDueLabel(context);
            const fullHref = href.startsWith('http') ? href : href.startsWith('/') ? `${BASE_URL}${href}` : href ? `${BASE_URL}/${href}` : null;
            entries.push({ title: text, rfpNum, href: fullHref, dueDate });
          });
          if (entries.length > 0) break;
        }
      } catch (bErr) {
        logger(`Hawaii Med-QUEST browser fallback failed: ${bErr.message}`);
      }
    }

    logger(`Hawaii Med-QUEST: found ${entries.length} solicitation entries`);

    const hr1Info = getHR1Score('HI');

    for (const entry of entries.slice(0, 15)) {
      const { category, program, itType } = classifyOpportunity(entry.title, '');
      const urgency = calcUrgency(entry.dueDate);
      const winProb = calcWinProbability('HI', category, hr1Info.keyFactor);
      const id      = makeId(entry.title, 'HI', entry.rfpNum || 'HI');

      results.push({
        id,
        state:               'HI',
        region:              'West',
        agency:              'Hawaii Med-QUEST (Medicaid)',
        opportunity_title:   entry.title,
        rfp_rfi_number:      entry.rfpNum || 'N/A',
        category,
        program,
        it_type:             itType,
        status:              entry.dueDate ? 'Active RFP' : 'Pre-RFP',
        published_date:      new Date().toISOString().slice(0, 10),
        due_date:            entry.dueDate || 'TBD',
        days_remaining:      calcDaysRemaining(entry.dueDate),
        est_value_m:         5.0,
        beneficiaries:       380000,
        fmap:                getFMAP('HI'),
        urgency,
        document_url:        entry.href || `NOT_FOUND — no direct document link on listing page`,
        portal_url:          PORTAL_URL,
        notes:               `Hawaii Med-QUEST portal. ${hr1Info.keyFactor}. Expansion state; modern well-run system. FMAP: ${getFMAP('HI')}.`,
        win_probability:     winProb,
        competitive_context: hr1Info.keyFactor.slice(0, 150),
        apd_status:          'Unknown',
        incumbent_expiry:    'Unknown',
        hr1_readiness_score: hr1Info.score,
        source:              'Hawaii Med-QUEST Portal',
        source_tier:         1,
        scraped_at:          new Date().toISOString()
      });
    }

  } catch (err) {
    logger(`Hawaii Med-QUEST error: ${err.message}`);
  }

  return results;
}

function extractRFP(text) {
  const m = text.match(/\b(RFP|RFI|ITN|IFB|RFQ|RFQQ)[\s#-]*([A-Z0-9-]{3,})/i);
  return m ? `${m[1].toUpperCase()} ${m[2]}` : null;
}

function parseDate(text) {
  const m = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) {
    const [, mm, dd, yyyy] = m;
    const y = yyyy.length === 2 ? `20${yyyy}` : yyyy;
    return `${y}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }
  return null;
}

// Parse "Due: March 15, 2026" / "Closing: April 30, 2026" style labels
function parseDueLabel(text) {
  const MONTHS = { january:1,february:2,march:3,april:4,may:5,june:6,july:7,august:8,september:9,october:10,november:11,december:12 };
  const m = text.match(/(?:due|closing|deadline)[:\s]+([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/i);
  if (m) {
    const mo = MONTHS[m[1].toLowerCase()];
    if (!mo) return null;
    return `${m[3]}-${String(mo).padStart(2,'0')}-${m[2].padStart(2,'0')}`;
  }
  return null;
}

module.exports = { scrape };
