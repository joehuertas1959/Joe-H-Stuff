'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const { fetchWithBrowser } = require('./browser');
const { classifyOpportunity, calcUrgency, calcDaysRemaining, calcWinProbability, getHR1Score, getFMAP, makeId } = require('./reference-data');

const PORTAL_URL = 'https://dhhs.ne.gov/Pages/Procurement.aspx';
const BASE_URL   = 'https://dhhs.ne.gov';

// Nav/chrome link text to skip (SharePoint pages have many nav anchors)
const NAV_SKIP = /^(home|about|contact|login|search|menu|back|next|previous|skip|print|share|facebook|twitter|linkedin|accessibility|sitemap|help|top|footer|header)$/i;

const KEYWORDS = /RFP|RFI|solicitation|procurement|bid|vendor|Medicaid|SNAP|human services|eligibility|work requirements|IT|information technology|MMIS|contract|health/i;

async function scrape({ logger = console.log } = {}) {
  logger('Nebraska DHHS: fetching procurement page …');
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

    // Primary: SharePoint rich-text field (most NE .gov SharePoint pages)
    const selectors = [
      '.ms-rtestate-field a',
      '#ctl00_PlaceHolderMain_ctl01__ControlWrapper_RichHtmlField a',
      '.soi-content-region a',
      'main a',
      '#content a'
    ];

    let found = false;
    for (const sel of selectors) {
      $(sel).each((i, el) => {
        const text = $(el).text().trim();
        const href = $(el).attr('href') || '';
        if (text.length < 8) return;
        if (NAV_SKIP.test(text)) return;
        const context = $(el).closest('p, li, td, div').text().trim();
        if (!KEYWORDS.test(text + context)) return;

        const dedupKey = text.toLowerCase().slice(0, 60);
        if (seen.has(dedupKey)) return;
        seen.add(dedupKey);

        const rfpNum = extractRFP(text + context);
        const dueDate = parseDate(context);
        const fullHref = href.startsWith('http') ? href
          : href.startsWith('/') ? `${BASE_URL}${href}`
          : href ? `${BASE_URL}/${href}` : null;

        entries.push({ title: text, rfpNum, href: fullHref, dueDate });
        found = true;
      });
      if (found && entries.length > 0) break;
    }

    if (entries.length === 0) {
      logger('Nebraska DHHS: 0 from static HTML — retrying with browser rendering …');
      try {
        const html = await fetchWithBrowser(PORTAL_URL, { logger });
        const $b = cheerio.load(html);
        for (const sel of selectors) {
          $b(sel).each((i, el) => {
            const text = $b(el).text().trim();
            const href = $b(el).attr('href') || '';
            if (text.length < 8) return;
            if (NAV_SKIP.test(text)) return;
            const context = $b(el).closest('p, li, td, div').text().trim();
            if (!KEYWORDS.test(text + context)) return;
            const dedupKey = text.toLowerCase().slice(0, 60);
            if (seen.has(dedupKey)) return;
            seen.add(dedupKey);
            const rfpNum = extractRFP(text + context);
            const dueDate = parseDate(context);
            const fullHref = href.startsWith('http') ? href : href.startsWith('/') ? `${BASE_URL}${href}` : href ? `${BASE_URL}/${href}` : null;
            entries.push({ title: text, rfpNum, href: fullHref, dueDate });
            found = true;
          });
          if (found && entries.length > 0) break;
        }
      } catch (bErr) {
        logger(`Nebraska DHHS browser fallback failed: ${bErr.message}`);
      }
    }

    logger(`Nebraska DHHS: found ${entries.length} procurement entries`);

    const hr1Info = getHR1Score('NE');

    for (const entry of entries.slice(0, 20)) {
      const { category, program, itType } = classifyOpportunity(entry.title, '');
      const urgency = calcUrgency(entry.dueDate);
      const winProb = calcWinProbability('NE', category, hr1Info.keyFactor);
      const id      = makeId(entry.title, 'NE', entry.rfpNum || 'NE');

      results.push({
        id,
        state:               'NE',
        region:              'Midwest',
        agency:              'Nebraska DHHS (Dept. of Health and Human Services)',
        opportunity_title:   entry.title,
        rfp_rfi_number:      entry.rfpNum || 'N/A',
        category,
        program,
        it_type:             itType,
        status:              entry.dueDate ? 'Active RFP' : 'Pre-RFP',
        published_date:      new Date().toISOString().slice(0, 10),
        due_date:            entry.dueDate || 'TBD',
        days_remaining:      calcDaysRemaining(entry.dueDate),
        est_value_m:         6.0,
        beneficiaries:       400000,
        fmap:                getFMAP('NE'),
        urgency,
        document_url:        entry.href || `NOT_FOUND — no direct document link on listing page`,
        portal_url:          PORTAL_URL,
        notes:               `Nebraska DHHS portal. ${hr1Info.keyFactor}. Optum incumbent; work requirements / CE module context. Non-expansion state.`,
        win_probability:     winProb,
        competitive_context: hr1Info.keyFactor.slice(0, 150),
        apd_status:          'Unknown',
        incumbent_expiry:    'Unknown',
        hr1_readiness_score: hr1Info.score,
        source:              'Nebraska DHHS Portal',
        source_tier:         1,
        scraped_at:          new Date().toISOString()
      });
    }

  } catch (err) {
    logger(`Nebraska DHHS error: ${err.message}`);
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

module.exports = { scrape };
