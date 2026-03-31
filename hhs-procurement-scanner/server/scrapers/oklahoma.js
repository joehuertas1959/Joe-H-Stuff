'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const { classifyOpportunity, calcUrgency, calcDaysRemaining, calcWinProbability, getHR1Score, getFMAP, makeId } = require('./reference-data');

const PORTAL_URL = 'https://oklahoma.gov/ohca/resources/procurement.html';

async function scrape({ logger = console.log } = {}) {
  logger('Oklahoma OHCA: fetching procurement page …');
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
    const entries = [];

    // OHCA page usually has a list or table of current solicitations
    $('table tr, li, .field-item, p').each((i, el) => {
      const text = $(el).text().trim();
      if (text.length < 10) return;
      if (!/RFP|RFI|solicitation|procurement|bid|vendor|Medicaid|OHCA|contract/i.test(text)) return;

      const link = $(el).find('a').first();
      const href = link.attr('href') || '';
      const title = link.text().trim() || text.split('\n')[0].trim().slice(0, 120);
      const rfpNum = extractRFP(text);
      const dueDate = parseDate(text);

      if (title.length > 8) {
        entries.push({ title, rfpNum, href, dueDate, context: text.slice(0, 300) });
      }
    });

    logger(`Oklahoma OHCA: found ${entries.length} procurement entries`);

    for (const entry of entries.slice(0, 15)) {
      const { category, program, itType } = classifyOpportunity(entry.title, entry.context);
      const fullHref = entry.href.startsWith('http') ? entry.href
        : entry.href.startsWith('/') ? `https://oklahoma.gov${entry.href}`
        : `NOT_FOUND — relative URL`;
      const hr1Info = getHR1Score('OK');
      const urgency = calcUrgency(entry.dueDate);
      const winProb = calcWinProbability('OK', category, hr1Info.keyFactor);
      const id = makeId(entry.title, 'OK', entry.rfpNum);

      results.push({
        id,
        state: 'OK',
        region: 'South',
        agency: 'Oklahoma OHCA (Health Care Authority)',
        opportunity_title: entry.title,
        rfp_rfi_number: entry.rfpNum || 'N/A',
        category,
        program,
        it_type: itType,
        status: entry.dueDate ? 'Active RFP' : 'Pre-RFP',
        published_date: new Date().toISOString().slice(0, 10),
        due_date: entry.dueDate || 'TBD',
        days_remaining: calcDaysRemaining(entry.dueDate),
        est_value_m: 6.0,
        beneficiaries: 1000000,
        fmap: getFMAP('OK'),
        urgency,
        document_url: fullHref.startsWith('http') ? fullHref : `NOT_FOUND — URL could not be resolved`,
        portal_url: PORTAL_URL,
        notes: `Oklahoma OHCA portal. ${hr1Info.keyFactor}. Large ABAWD population — SNAP/work req. signals. ${entry.context.slice(0, 100)}`,
        win_probability: winProb,
        competitive_context: hr1Info.keyFactor.slice(0, 150),
        apd_status: 'Unknown',
        incumbent_expiry: 'Unknown',
        hr1_readiness_score: hr1Info.score,
        source: 'Oklahoma OHCA Portal',
        source_tier: 1,
        scraped_at: new Date().toISOString()
      });
    }

  } catch (err) {
    logger(`Oklahoma OHCA error: ${err.message}`);
  }

  return results;
}

function extractRFP(text) {
  const m = text.match(/\b(RFP|RFI|IFB|RFQ|RFQQ)[\s#-]*([A-Z0-9-]{3,})/i);
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

module.exports = { scrape };
