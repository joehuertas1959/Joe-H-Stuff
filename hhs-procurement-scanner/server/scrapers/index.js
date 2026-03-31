'use strict';

const samGov      = require('./sam-gov');
const usaSpending = require('./usaspending');
const oigWorkplan = require('./oig-workplan');
const cmsApd      = require('./cms-apd');
const tenncare    = require('./tenncare');
const virginia    = require('./virginia');
const oklahoma    = require('./oklahoma');
const iowa        = require('./iowa');

// ── Source-to-tier mapping ───────────────────────────────────────────────────
// Tier 1 — Daily: dedicated state HHS portals
// Tier 2 — Daily/Weekly: state eProcurement + CMS APD
// Tier 3 — Weekly: SAM.gov + USASpending.gov
// Tier 4 — Monthly: OIG Work Plan

const SOURCES = {
  tier1: [
    { name: 'TennCare',       fn: tenncare.scrape    },
    { name: 'Virginia DMAS',  fn: virginia.scrape    },
    { name: 'Oklahoma OHCA',  fn: oklahoma.scrape    }
  ],
  tier2: [
    { name: 'Iowa DAS',       fn: iowa.scrape        },
    { name: 'CMS APD',        fn: cmsApd.scrape      }
  ],
  tier3: [
    { name: 'SAM.gov',        fn: samGov.scrape      },
    { name: 'USASpending',    fn: usaSpending.scrape }
  ],
  tier4: [
    { name: 'OIG Work Plan',  fn: oigWorkplan.scrape }
  ]
};

async function runScan({ tier = 'all', sam_api_key, logger = console.log } = {}) {
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

  const opts = { logger, api_key: sam_api_key || 'DEMO_KEY' };
  const samOpts = { logger, api_key: sam_api_key || 'DEMO_KEY' };

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
        await runSource(source, opts);
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
  const filtered = applyExclusionCriteria(allResults, logger);
  logger(`\nTotal after exclusion filter: ${filtered.length} / ${allResults.length}`);

  return filtered;
}

function applyExclusionCriteria(results, logger) {
  const excluded = [];
  const kept = results.filter(r => {
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

    return true;
  });

  if (excluded.length > 0) {
    logger(`Excluded ${excluded.length} opportunities per Section 6.3 criteria`);
  }

  return kept;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

module.exports = { runScan };
