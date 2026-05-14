'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const { classifyOpportunity, calcUrgency, calcDaysRemaining, calcWinProbability, getHR1Score, getRegion, getFMAP, makeId } = require('./reference-data');

const PORTAL_URL = 'https://www.tn.gov/tenncare/providers/resources/upcoming-procurements.html';
// Known-good anchor from PROMPTJH v4.0, Section 3.8
const KNOWN_ANCHOR = 'RFP 31865-00661 IT Audit Management Services';

async function scrape({ logger = console.log } = {}) {
  logger('TennCare: fetching upcoming procurements …');
  const results = [];

  try {
    const resp = await axios.get(PORTAL_URL, {
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HHS-Procurement-Scanner/4.0)',
        'Accept': 'text/html,application/xhtml+xml'
      }
    });

    const $ = cheerio.load(resp.data);

    // TennCare lists solicitations in a table or list of links
    const entries = [];

    // Try table rows first
    $('table tbody tr').each((i, row) => {
      const cells = $(row).find('td');
      if (cells.length < 2) return;
      const title = $(cells[0]).text().trim() || $(cells[1]).text().trim();
      const link = $(row).find('a').first();
      const href = link.attr('href') || '';
      const rfpNum = extractRFP($(cells[0]).text() + $(cells[1]).text());
      const dueText = $(cells).filter((i, c) => /due|deadline|close/i.test($(c).text())).text();
      const dueDate = parseDate(dueText);
      if (title.length > 5) {
        entries.push({ title, rfpNum, href, dueDate });
      }
    });

    // Try list/anchor approach if table approach yields nothing
    if (entries.length === 0) {
      $('a').each((i, el) => {
        const text = $(el).text().trim();
        const href = $(el).attr('href') || '';
        if (text.length < 10) return;
        const context = $(el).parent().text().trim();
        if (/RFP|RFI|ITN|solicitation|procurement|vendor/i.test(context + text)) {
          const rfpNum = extractRFP(text + context);
          const dueDate = parseDate(context);
          entries.push({ title: text, rfpNum, href, dueDate });
        }
      });
    }

    logger(`TennCare: found ${entries.length} procurement entries`);

    // Always check known anchor even if not in live data
    const hasKnownAnchor = entries.some(e => e.title.includes('31865') || e.title.toLowerCase().includes('it audit'));
    if (!hasKnownAnchor) {
      logger(`TennCare: known anchor "${KNOWN_ANCHOR}" not found — may be awarded or removed`);
    }

    for (const entry of entries.slice(0, 20)) {
      const { category, program, itType } = classifyOpportunity(entry.title, '');
      const fullHref = entry.href.startsWith('http') ? entry.href : `https://www.tn.gov${entry.href}`;
      const hr1Info = getHR1Score('TN');
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
        document_url: fullHref && fullHref !== 'https://www.tn.gov' ? fullHref : `NOT_FOUND — no direct document link on listing page`,
        portal_url: PORTAL_URL,
        notes: `TennCare portal. ${hr1Info.keyFactor}. Active Deloitte litigation context. Review portal directly for PDF attachments (Tier A).`,
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

  } catch (err) {
    logger(`TennCare error: ${err.message}`);
  }

  return results;
}

function extractRFP(text) {
  const m = text.match(/\b(RFP|RFI|ITN|IFB|RFQ|RFQQ)[\s#-]*([A-Z0-9-]{4,})/i);
  return m ? `${m[1]} ${m[2]}` : 'N/A';
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

function estimateTennValue(category) {
  if (/audit/i.test(category)) return 2.5;
  if (/DDI|MMIS|E&E/i.test(category)) return 18.0;
  return 5.0;
}

module.exports = { scrape };
