'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const { classifyOpportunity, calcUrgency, calcDaysRemaining, calcWinProbability, getHR1Score, getFMAP, makeId } = require('./reference-data');

const PORTAL_URL  = 'https://hfs.illinois.gov/info/procurement.html';
const BASE_URL    = 'https://hfs.illinois.gov';
// Illinois Procurement Bulletin — preserve as-is when links point here
const IPB_HOST    = 'ipb.illinois.gov';

const KEYWORDS = /RFP|RFI|solicitation|procurement|Medicaid|eligibility|SNAP|MMIS|health|IT|information technology|vendor|contract|bid|managed care|MCO/i;

async function scrape({ logger = console.log } = {}) {
  logger('Illinois HFS: fetching procurement page …');
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
    const seen = new Set();

    // Illinois state CMS uses .soi-content-region as main content wrapper
    const selectors = [
      '.soi-content-region a',
      '#page-content a',
      '.field--name-body a',
      'main a',
      '#content a'
    ];

    for (const sel of selectors) {
      $(sel).each((i, el) => {
        const text = $(el).text().trim();
        const href = $(el).attr('href') || '';
        if (text.length < 8) return;
        if (/^(home|about|contact|login|search|menu|top|back)$/i.test(text)) return;
        const context = $(el).closest('p, li, td, div').text().trim();
        if (!KEYWORDS.test(text + context)) return;

        const dedupKey = text.toLowerCase().slice(0, 60);
        if (seen.has(dedupKey)) return;
        seen.add(dedupKey);

        const rfpNum  = extractRFP(text + context);
        const dueDate = parseDate(context) || parseDueLabel(context);

        // Resolve URL — preserve IPB links exactly; resolve other relative URLs
        let fullHref;
        if (href.startsWith('http')) {
          fullHref = href; // preserve ipb.illinois.gov and other external links
        } else if (href.startsWith('/')) {
          fullHref = `${BASE_URL}${href}`;
        } else if (href) {
          fullHref = `${BASE_URL}/${href}`;
        } else {
          fullHref = null;
        }

        entries.push({ title: text, rfpNum, href: fullHref, dueDate });
      });
      if (entries.length > 0) break;
    }

    logger(`Illinois HFS: found ${entries.length} procurement entries`);

    const hr1Info = getHR1Score('IL');

    for (const entry of entries.slice(0, 20)) {
      const { category, program, itType } = classifyOpportunity(entry.title, '');
      const urgency = calcUrgency(entry.dueDate);
      const winProb = calcWinProbability('IL', category, hr1Info.keyFactor);
      const id      = makeId(entry.title, 'IL', entry.rfpNum || 'IL');
      const isIPB   = entry.href && entry.href.includes(IPB_HOST);

      results.push({
        id,
        state:               'IL',
        region:              'Midwest',
        agency:              'Illinois HFS (Healthcare and Family Services)',
        opportunity_title:   entry.title,
        rfp_rfi_number:      entry.rfpNum || 'N/A',
        category,
        program,
        it_type:             itType,
        status:              entry.dueDate ? 'Active RFP' : 'Pre-RFP',
        published_date:      new Date().toISOString().slice(0, 10),
        due_date:            entry.dueDate || 'TBD',
        days_remaining:      calcDaysRemaining(entry.dueDate),
        est_value_m:         12.0,
        beneficiaries:       3500000,
        fmap:                getFMAP('IL'),
        urgency,
        document_url:        entry.href || `NOT_FOUND — no direct document link on listing page`,
        portal_url:          PORTAL_URL,
        notes:               `Illinois HFS portal. ${hr1Info.keyFactor}. Medicaid expansion state; active modernization. Maximus $76.8M contract context.${isIPB ? ' Link resolves to Illinois Procurement Bulletin (ipb.illinois.gov) — Tier B.' : ''}`,
        win_probability:     winProb,
        competitive_context: hr1Info.keyFactor.slice(0, 150),
        apd_status:          'Unknown',
        incumbent_expiry:    'Unknown',
        hr1_readiness_score: hr1Info.score,
        source:              'Illinois HFS Portal',
        source_tier:         1,
        scraped_at:          new Date().toISOString()
      });
    }

  } catch (err) {
    logger(`Illinois HFS error: ${err.message}`);
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

function parseDueLabel(text) {
  const MONTHS = { january:1,february:2,march:3,april:4,may:5,june:6,july:7,august:8,september:9,october:10,november:11,december:12 };
  const m = text.match(/(?:due|closing|deadline|close)[:\s]+([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/i);
  if (m) {
    const mo = MONTHS[m[1].toLowerCase()];
    if (!mo) return null;
    return `${m[3]}-${String(mo).padStart(2,'0')}-${m[2].padStart(2,'0')}`;
  }
  return null;
}

module.exports = { scrape };
