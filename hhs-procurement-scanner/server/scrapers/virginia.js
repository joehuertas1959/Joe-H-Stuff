'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const { classifyOpportunity, calcUrgency, calcDaysRemaining, calcWinProbability, getHR1Score, getFMAP, makeId } = require('./reference-data');

const PORTAL_URL = 'https://www.dmas.virginia.gov/for-vendors/procurement/';

async function scrape({ logger = console.log } = {}) {
  logger('Virginia DMAS: fetching procurement page …');
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

    // DMAS procurement page typically has a table or list of solicitations
    $('table tr, .procurement-item, .solicitation').each((i, el) => {
      const text = $(el).text().trim();
      if (text.length < 10) return;
      if (!/RFP|RFI|IFB|solicitation|procurement|vendor|Medicaid|DMAS|contract/i.test(text)) return;

      const link = $(el).find('a').first();
      const href = link.attr('href') || '';
      const title = link.text().trim() || text.split('\n')[0].trim();
      const rfpNum = extractRFP(text);
      const dueDate = parseDate(text);

      if (title.length > 8) {
        entries.push({ title, rfpNum, href, dueDate, context: text.slice(0, 300) });
      }
    });

    // Fallback: find all meaningful links
    if (entries.length === 0) {
      $('a[href]').each((i, el) => {
        const text = $(el).text().trim();
        const href = $(el).attr('href') || '';
        const context = $(el).closest('p, li, div').text().trim();
        if (text.length < 8) return;
        if (/RFP|RFI|solicitation|procurement|Medicaid|DMAS/i.test(text + context)) {
          const rfpNum = extractRFP(text + context);
          const dueDate = parseDate(context);
          entries.push({ title: text, rfpNum, href, dueDate, context: context.slice(0, 300) });
        }
      });
    }

    logger(`Virginia DMAS: found ${entries.length} procurement entries`);

    for (const entry of entries.slice(0, 15)) {
      const { category, program, itType } = classifyOpportunity(entry.title, entry.context);
      const fullHref = entry.href.startsWith('http') ? entry.href : `https://www.dmas.virginia.gov${entry.href}`;
      const hr1Info = getHR1Score('VA');
      const urgency = calcUrgency(entry.dueDate);
      const winProb = calcWinProbability('VA', category, hr1Info.keyFactor);
      const id = makeId(entry.title, 'VA', entry.rfpNum);

      results.push({
        id,
        state: 'VA',
        region: 'Southeast',
        agency: 'Virginia DMAS (Dept. of Medical Assistance Services)',
        opportunity_title: entry.title,
        rfp_rfi_number: entry.rfpNum || 'N/A',
        category,
        program,
        it_type: itType,
        status: entry.dueDate ? 'Active RFP' : 'Pre-RFP',
        published_date: new Date().toISOString().slice(0, 10),
        due_date: entry.dueDate || 'TBD',
        days_remaining: calcDaysRemaining(entry.dueDate),
        est_value_m: 8.5,
        beneficiaries: 1500000,
        fmap: getFMAP('VA'),
        urgency,
        document_url: fullHref.startsWith('https://www.dmas.virginia.gov') ? fullHref : `NOT_FOUND — relative URL could not be resolved`,
        portal_url: PORTAL_URL,
        notes: `Virginia DMAS portal. ${hr1Info.keyFactor}. ${entry.context.slice(0, 150)}`,
        win_probability: winProb,
        competitive_context: hr1Info.keyFactor.slice(0, 150),
        apd_status: 'Unknown',
        incumbent_expiry: 'Unknown',
        hr1_readiness_score: hr1Info.score,
        source: 'Virginia DMAS Portal',
        source_tier: 1,
        scraped_at: new Date().toISOString()
      });
    }

  } catch (err) {
    logger(`Virginia DMAS error: ${err.message}`);
  }

  return results;
}

function extractRFP(text) {
  const m = text.match(/\b(RFP|RFI|IFB|RFQ|RFQQ|RFQO)[\s#-]*([A-Z0-9-]{3,})/i);
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
