'use strict';

const axios   = require('axios');
const cheerio = require('cheerio');
const {
  classifyOpportunity, calcUrgency, calcDaysRemaining,
  calcWinProbability, getHR1Score, getRegion, getFMAP, makeId
} = require('./reference-data');

// ── Portal configuration array ────────────────────────────────────────────────
// Add new states here — no other code changes needed.
const PORTALS = [
  {
    state:        'PA',
    agency:       'Pennsylvania DHS (Dept. of Human Services)',
    url:          'https://www.dhs.pa.gov/providers/Providers/Pages/Procurement.aspx',
    baseUrl:      'https://www.dhs.pa.gov',
    beneficiaries: 3500000,
    contentSelectors: [
      '.ms-rtestate-field a',
      '#ctl00_PlaceHolderMain_ctl01__ControlWrapper_RichHtmlField a',
      'main a', '#content a'
    ],
    keywords: /RFP|RFI|solicitation|procurement|contract|Medicaid|eligibility|SNAP|IT|health|human services/i,
    estValues: { DDI: 28, Assessment: 4, 'M&O': 14, default: 8 },
    notes: '9,269 children coverage error; HIGHEST BD priority. SNAP/work-req signals high.'
  },
  {
    state:        'KY',
    agency:       'Kentucky CHFS (Cabinet for Health and Family Services)',
    url:          'https://chfs.ky.gov/agencies/dms/Pages/procurement.aspx',
    baseUrl:      'https://chfs.ky.gov',
    beneficiaries: 1600000,
    contentSelectors: [
      '.ms-rtestate-field a',
      '.content-region a', 'main a', '#content a'
    ],
    keywords: /RFP|RFI|solicitation|procurement|Medicaid|MMIS|eligibility|work requirements|IT|contract/i,
    estValues: { DDI: 22, Assessment: 3, 'M&O': 10, default: 6 },
    notes: '50K-case backlog; 600 defects at launch. HIGHEST BD priority.'
  },
  {
    state:        'RI',
    agency:       'Rhode Island EOHHS (Executive Office of Health and Human Services)',
    url:          'https://eohhs.ri.gov/resources/rfps-and-contracts',
    baseUrl:      'https://eohhs.ri.gov',
    beneficiaries: 350000,
    contentSelectors: [
      '.view-content a', '.field--name-body a',
      'article a', 'main a', '#content a'
    ],
    keywords: /RFP|RFI|contract|solicitation|Medicaid|eligibility|SNAP|health|human services/i,
    estValues: { DDI: 10, Assessment: 2, 'M&O': 5, default: 3 },
    notes: 'Class-action suits; systemic failures. HIGHEST BD priority.'
  },
  {
    state:        'CO',
    agency:       'Colorado HCPF (Dept. of Health Care Policy and Financing)',
    url:          'https://hcpf.colorado.gov/rfps',
    baseUrl:      'https://hcpf.colorado.gov',
    beneficiaries: 1700000,
    contentSelectors: [
      '.view-content a', '.field--name-body a',
      '.paragraph--type--text-section a', 'article a', 'main a'
    ],
    keywords: /RFP|RFI|solicitation|procurement|Medicaid|MMIS|eligibility|IT|health|contract/i,
    estValues: { DDI: 25, Assessment: 4, 'M&O': 12, default: 8 },
    notes: 'Deloitte audit findings; active DDI. HIGH BD priority.'
  },
  {
    state:        'AR',
    agency:       'Arkansas DHS (Division of Medical Services)',
    url:          'https://humanservices.arkansas.gov/divisions-shared-services/medical-services/provider-information/solicitations/',
    baseUrl:      'https://humanservices.arkansas.gov',
    beneficiaries: 1000000,
    contentSelectors: [
      '.entry-content a', '.wp-block-group a',
      'article a', 'main a', '#content a'
    ],
    keywords: /RFP|RFI|solicitation|procurement|Medicaid|health|IT|contract|vendor/i,
    estValues: { DDI: 15, Assessment: 3, 'M&O': 8, default: 5 },
    notes: 'Active Deloitte contract; CE module needed. MEDIUM BD priority.'
  },
  {
    state:        'GA',
    agency:       'Georgia DCH (Dept. of Community Health)',
    url:          'https://dch.georgia.gov/georgia-medicaid-enterprise-system-procurement',
    baseUrl:      'https://dch.georgia.gov',
    beneficiaries: 2200000,
    contentSelectors: [
      '.field--name-body a',
      '.paragraph--type--text-section a', 'article a', 'main a'
    ],
    keywords: /RFP|RFI|solicitation|procurement|Medicaid|MMIS|eligibility|MES|IT|contract/i,
    estValues: { DDI: 30, Assessment: 4, 'M&O': 14, default: 9 },
    notes: 'Large expansion; active Deloitte contract. MEDIUM BD priority.'
  },
  {
    state:        'FL',
    agency:       'Florida AHCA (Agency for Health Care Administration)',
    url:          'https://ahca.myflorida.com/medicaid/procurement',
    baseUrl:      'https://ahca.myflorida.com',
    beneficiaries: 5300000,
    contentSelectors: [
      '.field-items a', '.node__content a',
      'article a', '.tab-content a', 'main a'
    ],
    // Florida uses ITN (Invitation to Negotiate) as its RFP equivalent
    keywords: /RFP|RFI|ITN|solicitation|procurement|Medicaid|eligibility|SNAP|MMIS|IT|health|contract/i,
    estValues: { DDI: 35, Assessment: 5, 'M&O': 18, default: 10 },
    notes: 'Gainwell performance concerns; large ABAWD pop. ITN = FL RFP equivalent.'
  },
  {
    state:        'TX',
    agency:       'Texas HHS (Health and Human Services Commission)',
    url:          'https://www.hhs.texas.gov/doing-business-hhs/contracting-procurement/open-solicitations',
    baseUrl:      'https://www.hhs.texas.gov',
    beneficiaries: 5000000,
    contentSelectors: [
      '.field--name-body a', '.view-content a',
      'article a', 'main a', 'table tr td a'
    ],
    keywords: /RFP|RFI|solicitation|procurement|Medicaid|MMIS|eligibility|SNAP|IT|health|contract/i,
    estValues: { DDI: 35, Assessment: 5, 'M&O': 18, default: 10 },
    notes: 'Large ABAWD pop.; non-expansion; Accenture incumbent. HIGH BD priority.'
  },
  {
    state:        'MT',
    agency:       'Montana DPHHS (Dept. of Public Health and Human Services)',
    url:          'https://dphhs.mt.gov/procurement',
    baseUrl:      'https://dphhs.mt.gov',
    beneficiaries: 290000,
    contentSelectors: [
      '.field--name-body a', 'article a',
      'main a', '.soi-content-region a'
    ],
    keywords: /RFP|RFI|solicitation|procurement|Medicaid|health|IT|contract|vendor/i,
    estValues: { DDI: 8, Assessment: 2, 'M&O': 5, default: 3 },
    notes: 'Medicaid expansion; procurement activity. MEDIUM BD priority.'
  },
  {
    state:        'WI',
    agency:       'Wisconsin DHS (Dept. of Health Services)',
    url:          'https://www.dhs.wisconsin.gov/contracts/procurements.htm',
    baseUrl:      'https://www.dhs.wisconsin.gov',
    beneficiaries: 1200000,
    contentSelectors: [
      '.col-md-8 a', '.field--name-body a',
      '#content a', 'main a'
    ],
    keywords: /RFP|RFI|solicitation|procurement|Medicaid|health|IT|contract|eligibility|MMIS/i,
    estValues: { DDI: 18, Assessment: 3, 'M&O': 9, default: 6 },
    notes: 'Non-expansion; legacy MMIS. MEDIUM BD priority.'
  },
  {
    state:        'NY',
    agency:       'New York DOH (Dept. of Health)',
    url:          'https://www.health.ny.gov/funding/procurement/',
    baseUrl:      'https://www.health.ny.gov',
    beneficiaries: 7000000,
    contentSelectors: [
      '#content a', '.content a',
      'table tr td a', 'main a'
    ],
    keywords: /RFP|RFI|solicitation|procurement|Medicaid|eMedNY|health|IT|contract|eligibility/i,
    estValues: { DDI: 30, Assessment: 5, 'M&O': 15, default: 10 },
    notes: 'eMedNY; large but well-funded. LOW BD priority (HR1 score 4).'
  },
  {
    state:        'CA',
    agency:       'California DHCS (Dept. of Health Care Services)',
    url:          'https://www.dhcs.ca.gov/provgovpart/Pages/RFP.aspx',
    baseUrl:      'https://www.dhcs.ca.gov',
    beneficiaries: 14000000,
    contentSelectors: [
      '.ms-rtestate-field a',
      '#ctl00_PlaceHolderMain_ctl01__ControlWrapper_RichHtmlField a',
      'main a', '#content a'
    ],
    keywords: /RFP|RFI|solicitation|procurement|Medicaid|CARES|Medi-Cal|health|IT|contract|eligibility/i,
    estValues: { DDI: 35, Assessment: 6, 'M&O': 20, default: 12 },
    notes: 'CARES active DDI; large vendor relationships. LOW BD priority (HR1 score 4).'
  }
];

// Nav link text to skip (common across all CMS platforms)
const NAV_SKIP = /^(home|about|contact|login|search|menu|back|next|previous|skip|print|share|top|footer|header|sitemap|accessibility|help|subscribe|rss)$/i;

async function scrape({ logger = console.log } = {}) {
  const results = [];
  const seen = new Set();

  for (const portal of PORTALS) {
    logger(`State Portals [${portal.state}]: scanning ${portal.agency} …`);
    try {
      const portalResults = await extractFromPortal(portal, logger);
      for (const r of portalResults) {
        if (!seen.has(r.id)) {
          seen.add(r.id);
          results.push(r);
        }
      }
    } catch (err) {
      logger(`State Portals [${portal.state}] unexpected error: ${err.message}`);
    }
    await sleep(1500); // polite delay between portals
  }

  logger(`State Health Portals: ${results.length} total unique opportunities across ${PORTALS.length} states`);
  return results;
}

async function extractFromPortal(portal, logger) {
  const results = [];

  const resp = await axios.get(portal.url, {
    timeout: 20000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; HHS-Procurement-Scanner/4.0)',
      'Accept': 'text/html,application/xhtml+xml'
    },
    maxRedirects: 5
  });

  const $ = cheerio.load(resp.data);
  const entries = [];
  const seenTitles = new Set();

  // Try selectors in order; use first that yields results
  for (const sel of portal.contentSelectors) {
    $(sel).each((i, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr('href') || '';
      if (text.length < 8) return;
      if (NAV_SKIP.test(text)) return;

      const context = $(el).closest('p, li, td, tr, div').text().trim().slice(0, 400);
      if (!portal.keywords.test(text + context)) return;

      const dedupKey = text.toLowerCase().slice(0, 60);
      if (seenTitles.has(dedupKey)) return;
      seenTitles.add(dedupKey);

      const rfpNum  = extractRFP(text + context);
      const dueDate = parseDate(context) || parseDueLabel(context);
      const fullHref = resolveUrl(href, portal.baseUrl);

      entries.push({ title: text, rfpNum, href: fullHref, dueDate, context });
    });
    if (entries.length > 0) break; // stop at first selector that found results
  }

  logger(`State Portals [${portal.state}]: ${entries.length} entries found`);

  const hr1Info = getHR1Score(portal.state);

  for (const entry of entries.slice(0, 15)) {
    const { category, program, itType } = classifyOpportunity(entry.title, entry.context);
    const estValue = estimateValue(portal.estValues, itType);
    const urgency  = calcUrgency(entry.dueDate);
    const winProb  = calcWinProbability(portal.state, category, hr1Info.keyFactor + ' ' + portal.notes);
    const id       = makeId(entry.title, portal.state, entry.rfpNum || portal.state);

    results.push({
      id,
      state:               portal.state,
      region:              getRegion(portal.state),
      agency:              portal.agency,
      opportunity_title:   entry.title,
      rfp_rfi_number:      entry.rfpNum || 'N/A',
      category,
      program,
      it_type:             itType,
      status:              entry.dueDate ? 'Active RFP' : 'Pre-RFP',
      published_date:      new Date().toISOString().slice(0, 10),
      due_date:            entry.dueDate || 'TBD',
      days_remaining:      calcDaysRemaining(entry.dueDate),
      est_value_m:         estValue,
      beneficiaries:       portal.beneficiaries,
      fmap:                getFMAP(portal.state),
      urgency,
      document_url:        entry.href || `NOT_FOUND — no direct document link at ${portal.url}`,
      portal_url:          portal.url,
      notes:               `${portal.agency} portal. ${hr1Info.keyFactor}. ${portal.notes}`,
      win_probability:     winProb,
      competitive_context: hr1Info.keyFactor.slice(0, 150),
      apd_status:          'Unknown',
      incumbent_expiry:    'Unknown',
      hr1_readiness_score: hr1Info.score,
      source:              `${portal.state} Health Portal`,
      source_tier:         2,
      scraped_at:          new Date().toISOString()
    });
  }

  return results;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolveUrl(href, baseUrl) {
  if (!href) return null;
  if (href.startsWith('http')) return href;
  if (href.startsWith('/')) return `${baseUrl}${href}`;
  return `${baseUrl}/${href}`;
}

// Use static value lookup to avoid spurious "updates" from random values
function estimateValue(estValues, itType) {
  return estValues[itType] || estValues.default || 5;
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
  const MONTHS = { january:1, february:2, march:3, april:4, may:5, june:6,
    july:7, august:8, september:9, october:10, november:11, december:12 };
  const m = text.match(/(?:due|closing|deadline|close)[:\s]+([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/i);
  if (m) {
    const mo = MONTHS[m[1].toLowerCase()];
    if (!mo) return null;
    return `${m[3]}-${String(mo).padStart(2,'0')}-${m[2].padStart(2,'0')}`;
  }
  return null;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

module.exports = { scrape, PORTALS };
