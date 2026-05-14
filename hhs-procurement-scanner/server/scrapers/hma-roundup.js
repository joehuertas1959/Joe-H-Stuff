'use strict';

const axios   = require('axios');
const cheerio = require('cheerio');
const { classifyOpportunity, getHR1Score, getRegion, getFMAP, makeId } = require('./reference-data');

const PORTAL_URL = 'https://www.healthmanagement.com/insights/';

// Month names for URL construction (HMA URL pattern: /month-DD-YYYY/)
const MONTHS = ['january','february','march','april','may','june',
  'july','august','september','october','november','december'];

// State name → code lookup
const STATE_NAME_MAP = {
  'Alabama':'AL','Alaska':'AK','Arizona':'AZ','Arkansas':'AR','California':'CA',
  'Colorado':'CO','Connecticut':'CT','Delaware':'DE','Florida':'FL','Georgia':'GA',
  'Hawaii':'HI','Idaho':'ID','Illinois':'IL','Indiana':'IN','Iowa':'IA',
  'Kansas':'KS','Kentucky':'KY','Louisiana':'LA','Maine':'ME','Maryland':'MD',
  'Massachusetts':'MA','Michigan':'MI','Minnesota':'MN','Mississippi':'MS',
  'Missouri':'MO','Montana':'MT','Nebraska':'NE','Nevada':'NV','New Hampshire':'NH',
  'New Jersey':'NJ','New Mexico':'NM','New York':'NY','North Carolina':'NC',
  'North Dakota':'ND','Ohio':'OH','Oklahoma':'OK','Oregon':'OR','Pennsylvania':'PA',
  'Rhode Island':'RI','South Carolina':'SC','South Dakota':'SD','Tennessee':'TN',
  'Texas':'TX','Utah':'UT','Vermont':'VT','Virginia':'VA','Washington':'WA',
  'West Virginia':'WV','Wisconsin':'WI','Wyoming':'WY'
};

// Signal patterns — most specific first (PROMPTJH v4.0, Section 7)
const SIGNAL_PATTERNS = [
  { pattern: /request\s+for\s+proposal|RFP\b/i,                        status: 'Active RFP', urgency: 'HIGH'   },
  { pattern: /request\s+for\s+information|RFI\b/i,                     status: 'RFI',        urgency: 'MEDIUM' },
  { pattern: /invitation\s+to\s+negotiate|ITN\b/i,                     status: 'Active RFP', urgency: 'HIGH'   },
  { pattern: /re-?bid|recompet|contract\s+renewal/i,                   status: 'Pre-RFP',    urgency: 'MEDIUM' },
  { pattern: /planning.*procurement|upcoming.*RFP|pre-?solicitation/i, status: 'Pre-RFP',    urgency: 'MEDIUM' },
  { pattern: /contract\s+award|awarded\s+contract/i,                   status: 'Award',      urgency: 'WATCH'  },
  { pattern: /work\s+requirements?|community\s+engagement|ABAWD|H\.R\.?\s*1\b/i, status: 'Watch', urgency: 'WATCH' },
  { pattern: /Medicaid.*moderniz|MMIS\b|MES\b|eligibility.*system/i,  status: 'Watch',      urgency: 'WATCH'  },
  { pattern: /FHIR|interoperability|CMS-0057/i,                        status: 'Watch',      urgency: 'WATCH'  }
];

// ── URL construction ──────────────────────────────────────────────────────────
function buildCandidateUrls() {
  const today = new Date();
  const candidates = [];

  // Walk back up to 8 days to find most recent Monday (1) or Wednesday (3)
  for (let i = 0; i <= 8; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dow = d.getDay();
    if (dow === 1 || dow === 3) {
      candidates.push(buildUrl(d, true));  // zero-padded day
      candidates.push(buildUrl(d, false)); // un-padded day (HMA inconsistency guard)
    }
    if (candidates.length >= 4) break;
  }

  // Prior week Monday as final fallback
  const priorMon = new Date(today);
  const dayOfWeek = today.getDay();
  const daysToLastMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  priorMon.setDate(today.getDate() - daysToLastMon - 7);
  candidates.push(buildUrl(priorMon, true));
  candidates.push(buildUrl(priorMon, false));

  return [...new Set(candidates)];
}

function buildUrl(d, zeroPad) {
  const month = MONTHS[d.getMonth()];
  const day   = zeroPad ? String(d.getDate()).padStart(2, '0') : String(d.getDate());
  const year  = d.getFullYear();
  return `https://www.healthmanagement.com/insights/weekly-roundup-v2/${month}-${day}-${year}/`;
}

// ── Main scraper ──────────────────────────────────────────────────────────────
async function scrape({ logger = console.log } = {}) {
  logger('HMA Weekly Roundup: building candidate URLs …');
  const results = [];

  const candidates = buildCandidateUrls();
  let articleUrl = null;
  let articleDate = null;
  let $body = null;

  for (const url of candidates) {
    try {
      logger(`HMA: trying ${url}`);
      const resp = await axios.get(url, {
        timeout: 20000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; HHS-Procurement-Scanner/4.0)',
          'Accept': 'text/html,application/xhtml+xml'
        },
        validateStatus: s => s === 200
      });
      $body = cheerio.load(resp.data);
      articleUrl  = url;
      articleDate = extractDateFromUrl(url);
      logger(`HMA: found article at ${url}`);
      break;
    } catch (_) {
      // 404 or network error — try next candidate
    }
  }

  if (!$body) {
    logger('HMA Weekly Roundup: no article found in any candidate URL this week');
    return results;
  }

  // Extract article text from common WordPress content containers
  let articleText = '';
  ['.entry-content', '.post-content', 'article .content', '.article-body', 'article'].forEach(sel => {
    if (!articleText) articleText = $body(sel).text().trim();
  });

  if (!articleText) {
    logger('HMA: article content container not found');
    return results;
  }

  // Split into sentences and scan for procurement signals
  const sentences = articleText
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter(s => s.length > 30)
    .slice(0, 200); // cap at 200 sentences

  logger(`HMA: scanning ${sentences.length} sentences for procurement signals …`);

  const seen = new Set();

  for (const sentence of sentences) {
    const signal = matchSignal(sentence);
    if (!signal) continue;

    const stateCode = extractStateCode(sentence);
    const { category, program, itType } = classifyOpportunity(sentence, '');
    const hr1Info = getHR1Score(stateCode || '');

    const id = makeId(sentence.slice(0, 80), stateCode || 'Federal', 'HMA');
    if (seen.has(id)) continue;
    seen.add(id);

    results.push({
      id,
      state:               stateCode || 'Federal',
      region:              stateCode ? getRegion(stateCode) : 'National',
      agency:              `${stateCode || 'Federal'} Medicaid / HHS (via HMA Roundup)`,
      opportunity_title:   `[HMA SIGNAL] ${sentence.slice(0, 120).trim()}`,
      rfp_rfi_number:      'N/A',
      category,
      program,
      it_type:             itType,
      status:              signal.status,
      published_date:      articleDate || new Date().toISOString().slice(0, 10),
      due_date:            'TBD',
      days_remaining:      'TBD',
      est_value_m:         0,   // unknown at signal stage; passes exclusion filter (checks > 0 && < 0.5)
      beneficiaries:       0,
      fmap:                getFMAP(stateCode || ''),
      urgency:             signal.urgency,
      document_url:        articleUrl,
      portal_url:          PORTAL_URL,
      notes:               `HMA Weekly Roundup signal. Verify against state procurement portal before acting. Context: ${sentence.slice(0, 250)}`,
      win_probability:     'Medium',
      competitive_context: 'Early-stage signal from HMA Roundup; no incumbent identified yet. Confirm at state portal.',
      apd_status:          'Unknown',
      incumbent_expiry:    'Unknown',
      hr1_readiness_score: stateCode ? hr1Info.score : 3,
      source:              'HMA Weekly Roundup',
      source_tier:         2,
      scraped_at:          new Date().toISOString()
    });
  }

  logger(`HMA Weekly Roundup: ${results.length} procurement signals extracted`);
  return results;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function matchSignal(sentence) {
  for (const sp of SIGNAL_PATTERNS) {
    if (sp.pattern.test(sentence)) return { status: sp.status, urgency: sp.urgency };
  }
  return null;
}

function extractStateCode(sentence) {
  // Try longest-match first (e.g., "New Hampshire" before "New")
  const sorted = Object.keys(STATE_NAME_MAP).sort((a, b) => b.length - a.length);
  for (const name of sorted) {
    if (sentence.includes(name)) return STATE_NAME_MAP[name];
  }
  // Fall back to 2-letter abbreviation surrounded by word boundaries
  const m = sentence.match(/\b([A-Z]{2})\b/);
  if (m && STATE_NAME_MAP[m[1]]) return m[1]; // unlikely but possible
  return null;
}

function extractDateFromUrl(url) {
  // Extract YYYY-MM from URL slug like /march-31-2026/
  const m = url.match(/\/([a-z]+)-(\d{1,2})-(\d{4})\//);
  if (!m) return null;
  const mo = MONTHS.indexOf(m[1]);
  if (mo === -1) return null;
  return `${m[3]}-${String(mo + 1).padStart(2, '0')}-${m[2].padStart(2, '0')}`;
}

module.exports = { scrape, buildCandidateUrls };
