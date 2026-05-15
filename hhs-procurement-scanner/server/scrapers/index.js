'use strict';

const samGov            = require('./sam-gov');
const usaSpending       = require('./usaspending');
const oigWorkplan       = require('./oig-workplan');
const cmsApd            = require('./cms-apd');
const tenncare          = require('./tenncare');
const virginia          = require('./virginia');
const oklahoma          = require('./oklahoma');
const iowa              = require('./iowa');
const nevada            = require('./nevada');
const nebraska          = require('./nebraska');
const hawaii            = require('./hawaii');
const illinois          = require('./illinois');
const stateHealthPortals = require('./state-health-portals');
const hmaRoundup        = require('./hma-roundup');
const bidnet            = require('./bidnet');
const govwin            = require('./govwin');

// ── Source-to-tier mapping ───────────────────────────────────────────────────
// Tier 1 — Daily:   TennCare, VA DMAS, OK OHCA, Nevada, Nebraska, Hawaii, Illinois
// Tier 2 — Weekly:  Iowa DAS, CMS APD, State Health Portals (12 states), HMA Roundup
// Tier 3 — Weekly:  SAM.gov, USASpending.gov
// Tier 4 — Monthly: HHS OIG Work Plan

const SOURCES = {
  tier1: [
    { name: 'TennCare',           fn: tenncare.scrape          },
    { name: 'Virginia DMAS',      fn: virginia.scrape          },
    { name: 'Oklahoma OHCA',      fn: oklahoma.scrape          },
    { name: 'Nevada NEVADAePro',  fn: nevada.scrape            },
    { name: 'Nebraska DHHS',      fn: nebraska.scrape          },
    { name: 'Hawaii Med-QUEST',   fn: hawaii.scrape            },
    { name: 'Illinois HFS',       fn: illinois.scrape          }
  ],
  tier2: [
    { name: 'Iowa DAS',               fn: iowa.scrape              },
    { name: 'CMS APD',                fn: cmsApd.scrape            },
    { name: 'State Health Portals',   fn: stateHealthPortals.scrape },
    { name: 'HMA Weekly Roundup',     fn: hmaRoundup.scrape        },
    { name: 'BidNet Direct',          fn: bidnet.scrape            },
    { name: 'GovWin IQ',              fn: govwin.scrape            }
  ],
  tier3: [
    { name: 'SAM.gov',        fn: samGov.scrape      },
    { name: 'USASpending',    fn: usaSpending.scrape }
  ],
  tier4: [
    { name: 'OIG Work Plan',  fn: oigWorkplan.scrape }
  ]
};

async function runScan({ tier = 'all', sam_api_key, govwin_username, govwin_password, govwin_api_key, bidnet_username, bidnet_password, logger = console.log } = {}) {
  const allResults = [];
  const seenIds = new Set();

  const addResults = (results, sourceName) => {
    let added = 0;
    for (const r of results) {
      if (!seenIds.has(r.id)) {
        seenIds.add(r.id);
        allResults.push(r);
        added++;
      }
    }
    logger(`${sourceName}: +${added} unique opportunities`);
  };

  const runSource = async (source, opts) => {
    try {
      logger(`— Running ${source.name} …`);
      const results = await source.fn(opts);
      addResults(results, source.name);
    } catch (err) {
      logger(`${source.name} failed: ${err.message}`);
    }
  };

  const opts       = { logger, api_key: sam_api_key || 'DEMO_KEY' };
  const samOpts    = { logger, api_key: sam_api_key || 'DEMO_KEY' };
  const govwinOpts = { logger, username: govwin_username, password: govwin_password, api_key: govwin_api_key };
  const bidnetOpts = { logger, username: bidnet_username, password: bidnet_password };

  const tiersToRun = tier === 'all'
    ? ['tier1', 'tier2', 'tier3', 'tier4']
    : [`tier${tier}`];

  for (const t of tiersToRun) {
    const sources = SOURCES[t] || [];
    if (sources.length === 0) {
      logger(`No sources registered for ${t}`);
      continue;
    }
    logger(`\n=== Running ${t.toUpperCase()} sources ===`);

    // Run Tier 1/2 state portals sequentially to be polite
    if (t === 'tier1' || t === 'tier2') {
      for (const source of sources) {
        // GovWin gets its own credentials object; skip if no credentials provided
        if (source.name === 'GovWin IQ') {
          if (!govwinOpts.username && !govwinOpts.api_key) {
            logger('GovWin IQ: no credentials configured — skipping. Add GOVWIN_USERNAME/PASSWORD to .env or enter in UI.');
            continue;
          }
          await runSource(source, govwinOpts);
        } else if (source.name === 'BidNet Direct') {
          await runSource(source, bidnetOpts);
        } else {
          await runSource(source, opts);
        }
      }
    }

    // Tier 3 can run in parallel (API sources, better rate limit handling)
    if (t === 'tier3') {
      await Promise.all([
        runSource({ name: 'SAM.gov', fn: samGov.scrape }, samOpts),
        (async () => {
          await sleep(3000); // slight offset to avoid simultaneous API calls
          await runSource({ name: 'USASpending.gov', fn: usaSpending.scrape }, opts);
        })()
      ]);
    }

    // Tier 4
    if (t === 'tier4') {
      for (const source of sources) {
        await runSource(source, opts);
      }
    }
  }

  // Apply exclusion criteria (PROMPTJH v4.0, Section 6.3)
  const normalized = normalizeUrls(allResults);
  const filtered = applyExclusionCriteria(normalized, logger);
  logger(`\nTotal after exclusion filter: ${filtered.length} / ${allResults.length}`);

  return filtered;
}

function normalizeUrls(results) {
  for (const r of results) {
    // Replace NOT_FOUND placeholder with portal URL
    if (r.document_url && r.document_url.startsWith('NOT_FOUND')) {
      r.document_url = r.portal_url || null;
    }
    // Ensure portal_url is always present
    if (!r.portal_url && r.document_url && r.document_url.startsWith('http')) {
      r.portal_url = r.document_url;
    }
  }
  return results;
}

function applyExclusionCriteria(results, logger) {
  const excluded = [];

  // Signal-only statuses: never remove, they are intelligence not active RFPs
  const SIGNAL_STATUSES = new Set(['Watch', 'Award', 'Cancelled']);

  const kept = results.filter(r => {
    // Exclude expired opportunities (due date has passed)
    if (typeof r.days_remaining === 'number' && r.days_remaining < 0) {
      excluded.push(`EXPIRED: ${r.state} — ${r.opportunity_title.slice(0, 50)} (due ${r.due_date})`);
      return false;
    }
    // Also catch urgency=EXPIRED for string-parsed dates
    if (r.urgency === 'EXPIRED') {
      excluded.push(`EXPIRED: ${r.state} — ${r.opportunity_title.slice(0, 50)} (due ${r.due_date})`);
      return false;
    }

    // Exclude < $500K (unless est_value_m is 0 = unknown)
    if (r.est_value_m > 0 && r.est_value_m < 0.5) {
      excluded.push(`${r.state} — ${r.opportunity_title.slice(0, 50)} (value < $500K)`);
      return false;
    }

    // Exclude purely financial audits with no IT component
    if (/financial\s*audit/i.test(r.opportunity_title) && !/IT|information\s*technology|system|software/i.test(r.opportunity_title)) {
      excluded.push(`${r.state} — ${r.opportunity_title.slice(0, 50)} (financial audit, no IT component)`);
      return false;
    }

    // Exclude general IT infrastructure with no HHS program component
    if (/network\s*upgrade|office\s*IT|desktop|printer|copier|telephone\s*system/i.test(r.opportunity_title)) {
      excluded.push(`${r.state} — ${r.opportunity_title.slice(0, 50)} (general IT infra, no HHS program component)`);
      return false;
    }

    // For non-signal statuses from scraped portals (not SAM.gov/USASpending which are pre-filtered):
    // Require at least one procurement keyword in the title to avoid pulling in program pages, nav links, etc.
    if (!SIGNAL_STATUSES.has(r.status) &&
        r.source !== 'SAM.gov' &&
        r.source !== 'USASpending.gov' &&
        r.source !== 'BidNet Direct' &&
        !r.source?.includes('APD') &&
        !r.source?.includes('OIG') &&
        !r.source?.includes('HMA')) {
      const hasSignal = /\b(RFP|RFI|ITN|IFB|RFQ|RFQQ|solicitation|bid\b|procurement\s+notice|contract\s+opportunit|IDIQ)\b/i.test(r.opportunity_title);
      if (!hasSignal) {
        excluded.push(`${r.state} — ${r.opportunity_title.slice(0, 50)} (no procurement signal in title)`);
        return false;
      }
    }

    return true;
  });

  if (excluded.length > 0) {
    logger(`Excluded ${excluded.length} results per Section 6.3 criteria`);
    excluded.forEach(e => logger(`  - ${e}`));
  }

  return kept;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

module.exports = { runScan };
