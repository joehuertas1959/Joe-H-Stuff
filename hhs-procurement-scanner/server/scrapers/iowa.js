'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const { classifyOpportunity, calcUrgency, calcDaysRemaining, calcWinProbability, getHR1Score, getFMAP, makeId } = require('./reference-data');

const PORTAL_URL = 'https://bidopportunities.iowa.gov';
// Iowa uses DataTables — per PROMPTJH v4.0 Section 6.1: "press Enter after keyword entry"
// We query their search endpoint directly
const SEARCH_URL = 'https://bidopportunities.iowa.gov/Bids/Grid_Read';

async function scrape({ logger = console.log } = {}) {
  logger('Iowa DAS: fetching bid opportunities (DataTables endpoint) …');
  const results = [];

  const keywords = ['Medicaid', 'health information', 'eligibility', 'SNAP', 'human services', 'IT services'];

  for (const kw of keywords) {
    try {
      // DataTables server-side POST
      const formData = new URLSearchParams({
        'search[value]': kw,
        'start': '0',
        'length': '50',
        'draw': '1'
      });

      const resp = await axios.post(SEARCH_URL, formData.toString(), {
        timeout: 20000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; HHS-Procurement-Scanner/4.0)',
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': PORTAL_URL
        }
      });

      const data = resp.data?.data || [];
      logger(`Iowa DAS [${kw}]: ${data.length} results`);

      for (const row of data) {
        // Row is typically an array of HTML-encoded cell values
        const cells = Array.isArray(row) ? row : Object.values(row);
        const rawTitle = stripHtml(cells[0] || cells[1] || '');
        const rawDue = stripHtml(cells[3] || cells[4] || '');
        const rawLink = extractHref(cells[0] || cells[1] || '');

        if (!rawTitle || rawTitle.length < 5) continue;

        const dueDate = parseDate(rawDue);
        const { category, program, itType } = classifyOpportunity(rawTitle, '');
        const rfpNum = extractRFP(rawTitle);
        const id = makeId(rawTitle, 'IA', rfpNum);
        const hr1Info = getHR1Score('IA');
        const urgency = calcUrgency(dueDate);
        const winProb = calcWinProbability('IA', category, hr1Info.keyFactor);

        const docUrl = rawLink
          ? (rawLink.startsWith('http') ? rawLink : `${PORTAL_URL}${rawLink}`)
          : `NOT_FOUND — no direct link in DataTables response`;

        results.push({
          id,
          state: 'IA',
          region: 'Midwest',
          agency: 'Iowa Department of Administrative Services',
          opportunity_title: rawTitle,
          rfp_rfi_number: rfpNum || 'N/A',
          category,
          program,
          it_type: itType,
          status: dueDate ? 'Active RFP' : 'Pre-RFP',
          published_date: new Date().toISOString().slice(0, 10),
          due_date: dueDate || 'TBD',
          days_remaining: calcDaysRemaining(dueDate),
          est_value_m: 5.0,
          beneficiaries: 850000,
          fmap: getFMAP('IA'),
          urgency,
          document_url: docUrl,
          portal_url: PORTAL_URL,
          notes: `Iowa DAS DataTables portal. ${hr1Info.keyFactor}. Non-expansion state; active SNAP/work requirements signals.`,
          win_probability: winProb,
          competitive_context: hr1Info.keyFactor.slice(0, 150),
          apd_status: 'Unknown',
          incumbent_expiry: 'Unknown',
          hr1_readiness_score: hr1Info.score,
          source: 'Iowa DAS Portal',
          source_tier: 2,
          scraped_at: new Date().toISOString()
        });
      }

      await sleep(1000);
    } catch (err) {
      logger(`Iowa DAS [${kw}] error: ${err.message}`);
    }
  }

  // De-duplicate
  const seen = new Set();
  const unique = results.filter(r => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });

  logger(`Iowa DAS: ${unique.length} unique opportunities`);
  return unique;
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').trim();
}

function extractHref(html) {
  const m = html.match(/href="([^"]+)"/);
  return m ? m[1] : null;
}

function extractRFP(text) {
  const m = text.match(/\b(RFP|RFI|IFB|RFQ)[\s#-]*([A-Z0-9-]{3,})/i);
  return m ? `${m[1].toUpperCase()} ${m[2]}` : 'N/A';
}

function parseDate(text) {
  const m = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) {
    const [, mm, dd, yyyy] = m;
    const y = yyyy.length === 2 ? `20${yyyy}` : yyyy;
    return `${y}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
  }
  return null;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

module.exports = { scrape };
