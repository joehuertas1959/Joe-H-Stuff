'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const { fetchWithBrowser } = require('./browser');
const { classifyOpportunity, calcUrgency, calcDaysRemaining, calcWinProbability, getHR1Score, getRegion, getFMAP, makeId } = require('./reference-data');

// NEVADAePro public purchase listing — Tier B per PROMPTJH v4.0 Section 3.8
const PORTAL_URL = 'https://nevadaepro.com/bso/external/publicPurchase.sdo';
const BASE_URL   = 'https://nevadaepro.com';

const KEYWORDS = /Medicaid|health|HHS|human services|eligibility|SNAP|MMIS|IT|information technology|welfare|benefits|managed care|behavioral health/i;

async function scrape({ logger = console.log } = {}) {
  logger('Nevada NEVADAePro: fetching public purchase listing …');
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

    // If we got redirected to a login/error page, bail gracefully
    const finalUrl = resp.request?.res?.responseUrl || '';
    if (/login|error|session/i.test(finalUrl)) {
      logger('Nevada NEVADAePro: redirected to login/error — page may require session; check portal manually');
      return results;
    }

    const $ = cheerio.load(resp.data);
    const entries = [];

    // Primary: table rows — NEVADAePro BSO platform uses a bid results table
    $('table tr').each((i, row) => {
      if (i === 0) return; // skip header row
      const cells = $(row).find('td');
      if (cells.length < 2) return;

      const link = $(row).find('a').first();
      const href = link.attr('href') || '';
      const title = link.text().trim() || $(cells.eq(1)).text().trim();
      const rowText = $(row).text().trim();

      if (title.length < 8) return;
      if (!KEYWORDS.test(rowText)) return;

      const rfpNum = extractRFP(rowText) || extractBidId(href);
      const dueDate = parseDate(rowText);
      const docUrl  = buildDocUrl(href);

      entries.push({ title, rfpNum, href: docUrl, dueDate, context: rowText.slice(0, 300) });
    });

    // Fallback: any bid-detail links on the page
    if (entries.length === 0) {
      $('a[href*="bidDetail"]').each((i, el) => {
        const text = $(el).text().trim();
        const href = $(el).attr('href') || '';
        const context = $(el).closest('tr, li, div').text().trim();
        if (text.length < 8) return;
        if (!KEYWORDS.test(text + context)) return;
        const rfpNum = extractRFP(text + context) || extractBidId(href);
        const dueDate = parseDate(context);
        entries.push({ title: text, rfpNum, href: buildDocUrl(href), dueDate, context: context.slice(0, 300) });
      });
    }

    if (entries.length === 0) {
      logger('Nevada NEVADAePro: 0 from static HTML — retrying with browser rendering …');
      try {
        const html = await fetchWithBrowser(PORTAL_URL, { logger });
        const $b = cheerio.load(html);
        $b('table tr').each((i, row) => {
          if (i === 0) return;
          const cells = $b(row).find('td');
          if (cells.length < 2) return;
          const link = $b(row).find('a').first();
          const href = link.attr('href') || '';
          const title = link.text().trim() || $b(cells.eq(1)).text().trim();
          const rowText = $b(row).text().trim();
          if (title.length < 8 || !KEYWORDS.test(rowText)) return;
          const rfpNum = extractRFP(rowText) || extractBidId(href);
          const dueDate = parseDate(rowText);
          entries.push({ title, rfpNum, href: buildDocUrl(href), dueDate, context: rowText.slice(0, 300) });
        });
        if (entries.length === 0) {
          $b('a[href*="bidDetail"]').each((i, el) => {
            const text = $b(el).text().trim();
            const href = $b(el).attr('href') || '';
            const context = $b(el).closest('tr, li, div').text().trim();
            if (text.length < 8 || !KEYWORDS.test(text + context)) return;
            entries.push({ title: text, rfpNum: extractBidId(href), href: buildDocUrl(href), dueDate: parseDate(context), context: context.slice(0, 300) });
          });
        }
      } catch (bErr) {
        logger(`Nevada NEVADAePro browser fallback failed: ${bErr.message}`);
      }
      if (entries.length === 0) logger('Nevada NEVADAePro: 0 results after browser fallback — check portal manually');
    }

    logger(`Nevada NEVADAePro: found ${entries.length} relevant entries`);

    const hr1Info = getHR1Score('NV');

    for (const entry of entries.slice(0, 20)) {
      const { category, program, itType } = classifyOpportunity(entry.title, entry.context);
      const urgency  = calcUrgency(entry.dueDate);
      const winProb  = calcWinProbability('NV', category, hr1Info.keyFactor);
      const id       = makeId(entry.title, 'NV', entry.rfpNum);

      results.push({
        id,
        state:               'NV',
        region:              'West',
        agency:              'Nevada eProcurement (NEVADAePro)',
        opportunity_title:   entry.title,
        rfp_rfi_number:      entry.rfpNum || 'N/A',
        category,
        program,
        it_type:             itType,
        status:              entry.dueDate ? 'Active RFP' : 'Pre-RFP',
        published_date:      new Date().toISOString().slice(0, 10),
        due_date:            entry.dueDate || 'TBD',
        days_remaining:      calcDaysRemaining(entry.dueDate),
        est_value_m:         8.0,
        beneficiaries:       850000,
        fmap:                getFMAP('NV'),
        urgency,
        document_url:        entry.href && entry.href.startsWith('http') ? entry.href
                               : `NOT_FOUND — bidId URL is Tier B; click Attachments tab for Tier A PDFs`,
        portal_url:          PORTAL_URL,
        notes:               `NEVADAePro portal. ${hr1Info.keyFactor}. Expansion state; mixed system vintage. bidId URL is Tier B per spec Section 3.8; Attachments tab = Tier A.`,
        win_probability:     winProb,
        competitive_context: hr1Info.keyFactor.slice(0, 150),
        apd_status:          'Unknown',
        incumbent_expiry:    'Unknown',
        hr1_readiness_score: hr1Info.score,
        source:              'Nevada NEVADAePro',
        source_tier:         1,
        scraped_at:          new Date().toISOString()
      });
    }

  } catch (err) {
    logger(`Nevada NEVADAePro error: ${err.message}`);
  }

  return results;
}

function buildDocUrl(href) {
  if (!href) return null;
  if (href.startsWith('http')) return href;
  return `${BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
}

function extractBidId(href) {
  const m = href.match(/bidId=([A-Z0-9-]+)/i);
  return m ? `BID-${m[1]}` : null;
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
