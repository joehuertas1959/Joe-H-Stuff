'use strict';

const samGov            = require('./sam-gov');
const usaSpending       = require('./usaspending');
const oigWorkplan       = require('./oig-workplan');
const cmsApd            = require('./cms-apd');
const tenncare          = require('./tenncare');
const tnGeneralServices = require('./tn-generalservices');
const virginia          = require('./virginia');
const oklahoma          = require('./oklahoma');
const iowa              = require('./iowa');
const nevada            = require('./nevada');
const nebraska          = require('./nebraska');
const hawaii            = require('./hawaii');
const illinois          = require('./illinois');
const stateHealthPortals = require('./state-health-portals');
const hmaRoundup        = require('./hma-roundup');
// New v5.5 portals
const txHhsc            = require('./tx-hhsc');
const ncDhhs            = require('./nc-dhhs');
const flAhca            = require('./fl-ahca');
const caDhcs            = require('./ca-dhcs');
const nyDoh             = require('./ny-doh');
const nyDohRfp          = require('./ny-doh-rfp');
const azAhcccs          = require('./az-ahcccs');
const waHca             = require('./wa-hca');
const ohMedicaid        = require('./oh-medicaid');
const ohMedicaidBuys    = require('./oh-medicaid-buys');
const mnDhs             = require('./mn-dhs');
const coHcpf            = require('./co-hcpf');
const paDhs             = require('./pa-dhs');
const scDhhs            = require('./sc-dhhs');
const wiDhs             = require('./wi-dhs');
const moDss             = require('./mo-dss');
const kyDms             = require('./ky-dms');
const miDhhs            = require('./mi-dhhs');
const inFssa            = require('./in-fssa');
const mdMmcp            = require('./md-mmcp');
const maMasshealth      = require('./ma-masshealth');
const njDmahs           = require('./nj-dmahs');
const laLdh             = require('./la-ldh');
const ctDss             = require('./ct-dss');
const nhDhhs            = require('./nh-dhhs');
const orOha             = require('./or-oha');
const gaDch             = require('./ga-dch');
// New v5.6 portals
const alMedicaid        = require('./al-medicaid');
const msMedicaid        = require('./ms-medicaid');
const wvDhhr            = require('./wv-dhhr');
const mtDphhs           = require('./mt-dphhs');
const riEohhs           = require('./ri-eohhs');
const arDhs             = require('./ar-dhs');
// Aggregators / intel platforms
const bidnet            = require('./bidnet');
const govwin            = require('./govwin');

const SOURCES = {
  tier1: [
    { name: 'TennCare',                fn: tenncare.scrape },
    { name: 'TN General Services',     fn: tnGeneralServices.scrape },
    { name: 'Virginia DMAS',           fn: virginia.scrape },
    { name: 'Oklahoma OHCA',           fn: oklahoma.scrape },
    { name: 'Nevada NEVADAePro',       fn: nevada.scrape },
    { name: 'Nebraska DHHS',           fn: nebraska.scrape },
    { name: 'Hawaii Med-QUEST',        fn: hawaii.scrape },
    { name: 'Illinois HFS',            fn: illinois.scrape },
    { name: 'Texas HHSC',             fn: txHhsc.scrape },
    { name: 'NC DHHS',                fn: ncDhhs.scrape },
    { name: 'Florida AHCA',           fn: flAhca.scrape },
    { name: 'California DHCS',        fn: caDhcs.scrape },
    { name: 'New York DOH',           fn: nyDoh.scrape },
    { name: 'New York DOH (RFA/RFP)', fn: nyDohRfp.scrape },
    { name: 'Arizona AHCCCS',         fn: azAhcccs.scrape },
    { name: 'Washington HCA',         fn: waHca.scrape },
    { name: 'Ohio Medicaid',          fn: ohMedicaid.scrape },
    { name: 'Ohio ODM / Ohio Buys',   fn: ohMedicaidBuys.scrape },
    { name: 'Minnesota DHS',          fn: mnDhs.scrape },
    { name: 'Colorado HCPF',          fn: coHcpf.scrape },
    { name: 'Pennsylvania DHS',       fn: paDhs.scrape },
    { name: 'South Carolina DHHS',    fn: scDhhs.scrape },
    { name: 'Wisconsin DHS',          fn: wiDhs.scrape },
    { name: 'Missouri DSS',           fn: moDss.scrape },
    { name: 'Kentucky CHFS',          fn: kyDms.scrape },
    { name: 'Michigan DHHS',          fn: miDhhs.scrape },
    { name: 'Indiana FSSA',           fn: inFssa.scrape },
    { name: 'Maryland DHMH',          fn: mdMmcp.scrape },
    { name: 'Massachusetts MassHealth', fn: maMasshealth.scrape },
    { name: 'New Jersey DMAHS',       fn: njDmahs.scrape },
    { name: 'Louisiana LDH',          fn: laLdh.scrape },
    { name: 'Connecticut DSS',        fn: ctDss.scrape },
    { name: 'New Hampshire DHHS',     fn: nhDhhs.scrape },
    { name: 'Oregon OHA',             fn: orOha.scrape },
    { name: 'Georgia DCH',            fn: gaDch.scrape },
    { name: 'Alabama Medicaid',       fn: alMedicaid.scrape },
    { name: 'Mississippi DOM',        fn: msMedicaid.scrape },
    { name: 'West Virginia DHHR',     fn: wvDhhr.scrape },
    { name: 'Montana DPHHS',          fn: mtDphhs.scrape },
    { name: 'Rhode Island EOHHS',     fn: riEohhs.scrape },
    { name: 'Arkansas DHS',           fn: arDhs.scrape },
  ],
  tier2: [
    { name: 'Iowa DAS',              fn: iowa.scrape },
    { name: 'CMS APD',               fn: cmsApd.scrape },
    { name: 'State Health Portals',  fn: stateHealthPortals.scrape },
    { name: 'HMA Weekly Roundup',    fn: hmaRoundup.scrape },
    { name: 'BidNet Direct',         fn: bidnet.scrape },
    { name: 'GovWin IQ',             fn: govwin.scrape }
  ],
  tier3: [
    { name: 'SAM.gov',        fn: samGov.scrape },
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

  // Apply exclusion criteria (PROMPTJH v5.5, Section 6.3)
  const filtered = applyExclusionCriteria(allResults, logger, opts.exclusionPhrases || []);
  logger(`\nTotal after exclusion filter: ${filtered.length} / ${allResults.length}`);

  return filtered;
}

function applyExclusionCriteria(results, logger, dynamicExclusions = []) {
  const excluded = [];

  // Merge store-managed exclusion phrases with any extra passed in
  const NON_IT_EXCLUDE = dynamicExclusions.map(p => p.toLowerCase());

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

    // Non-IT Medicaid exclusions (v5.5)
    const titleLower = r.opportunity_title.toLowerCase();
    if (NON_IT_EXCLUDE.some(e => titleLower.includes(e))) {
      excluded.push(`${r.state} — ${r.opportunity_title.slice(0, 50)} (non-IT exclusion)`);
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
