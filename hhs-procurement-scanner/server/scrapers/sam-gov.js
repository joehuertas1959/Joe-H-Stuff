'use strict';

const axios = require('axios');
const { classifyOpportunity, calcUrgency, calcDaysRemaining, calcWinProbability, getHR1Score, getRegion, getFMAP, makeId } = require('./reference-data');

const SAM_BASE = 'https://api.sam.gov/opportunities/v2/search';

// Keyword sets per PROMPTJH v4.0, Sections 7.4–7.6
const SEARCH_SETS = [
  { label: 'Medicaid-MES',  keywords: 'Medicaid information technology eligibility enrollment MMIS' },
  { label: 'WorkReq-CE',    keywords: 'Medicaid work requirements community engagement H.R. 1 ABAWD' },
  { label: 'COOP',          keywords: 'continuity of operations business continuity disaster recovery health human services' },
  { label: 'ERM-GRC',       keywords: 'enterprise risk management GRC governance risk compliance health Medicaid' },
  { label: 'IT-Audit',      keywords: 'IT audit MARS-E NIST 800-53 HIPAA security assessment Medicaid' },
  { label: 'FHIR-Interop',  keywords: 'FHIR interoperability CMS-0057 API gateway Medicaid' }
];

// Focus states (Tier 1 top-20, Section 3.4)
const TIER1_STATES = new Set([
  'TN','NV','NE','HI','IL','IA','VA','OK','CO','AR',
  'PA','GA','KY','RI','FL','CA','NY','TX','MT','WI'
]);

async function scrape({ api_key = 'DEMO_KEY', logger = console.log } = {}) {
  const results = [];
  const seen = new Set();

  const today = new Date();
  const fromDate = new Date(today);
  fromDate.setDate(fromDate.getDate() - 90);  // look back 90 days

  const fmt = d => `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`;

  for (const set of SEARCH_SETS) {
    logger(`SAM.gov: searching "${set.label}" …`);
    try {
      const resp = await axios.get(SAM_BASE, {
        params: {
          api_key,
          keywords:    set.keywords,
          postedFrom:  fmt(fromDate),
          postedTo:    fmt(today),
          limit:       100,
          offset:      0
        },
        timeout: 20000,
        headers: { 'User-Agent': 'HHS-Procurement-Scanner/4.0' }
      });

      const opps = resp.data?.opportunitiesData || [];
      logger(`SAM.gov [${set.label}]: ${opps.length} results`);

      for (const opp of opps) {
        const title = opp.title || '';
        const rfpNum = opp.solicitationNumber || 'N/A';
        const state = opp.placeOfPerformance?.state?.code?.toUpperCase() || '';

        // De-duplicate by solicitation number + state
        const dedupKey = `${state}|${rfpNum}|${title.slice(0, 30)}`.toLowerCase();
        if (seen.has(dedupKey)) continue;
        seen.add(dedupKey);

        // Parse dates
        const postedDate = opp.postedDate ? opp.postedDate.slice(0, 10) : null;
        const responseDeadLine = opp.responseDeadLine || null;
        const dueDate = responseDeadLine ? responseDeadLine.slice(0, 10) : 'TBD';

        // Classify
        const descText = opp.description || opp.fullParentPathName || '';
        const { category, program, itType } = classifyOpportunity(title, descText);

        // URLs
        const portalUrl = opp.uiLink || `https://sam.gov/opp/${opp.noticeId}/view`;
        const docUrl = opp.resourceLinks?.[0] || portalUrl;

        // Estimate value (SAM.gov often doesn't have value; flag as estimate)
        const rawValue = opp.award?.amount || 0;
        const estValueM = rawValue ? Math.round(rawValue / 100000) / 10 : estimateValue(category, title);

        const hr1Info = getHR1Score(state);
        const urgency = calcUrgency(dueDate);
        const winProb = calcWinProbability(state, category, descText);
        const compContext = buildCompContext(opp, hr1Info);

        const id = makeId(title, state, rfpNum);

        results.push({
          id,
          state: state || 'Federal',
          region: getRegion(state) || 'Unknown',
          agency: opp.fullParentPathName?.split('.').pop()?.trim() || 'HHS/CMS',
          opportunity_title: title,
          rfp_rfi_number: rfpNum,
          category,
          program,
          it_type: itType,
          status: mapSamStatus(opp.type, opp.baseType),
          published_date: postedDate || '',
          due_date: dueDate,
          days_remaining: calcDaysRemaining(dueDate),
          est_value_m: estValueM,
          beneficiaries: 0,
          fmap: getFMAP(state),
          urgency,
          document_url: docUrl,
          portal_url: portalUrl,
          notes: `SAM.gov notice. ${opp.typeOfSetAsideDescription ? 'Set-aside: ' + opp.typeOfSetAsideDescription + '.' : ''} ${descText.slice(0, 200)}`,
          win_probability: winProb,
          competitive_context: compContext,
          apd_status: 'Unknown',
          incumbent_expiry: 'Unknown',
          hr1_readiness_score: hr1Info.score,
          source: 'SAM.gov',
          source_tier: TIER1_STATES.has(state) ? 1 : 3,
          scraped_at: new Date().toISOString()
        });
      }

      // Rate-limit between keyword sets
      await sleep(1500);

    } catch (err) {
      if (err.response?.status === 429) {
        logger(`SAM.gov [${set.label}]: rate limited — waiting 30s`);
        await sleep(30000);
      } else {
        logger(`SAM.gov [${set.label}] error: ${err.message}`);
      }
    }
  }

  logger(`SAM.gov: total ${results.length} unique opportunities`);
  return results;
}

function mapSamStatus(type, baseType) {
  if (!type && !baseType) return 'Active RFP';
  const t = `${type} ${baseType}`.toLowerCase();
  if (t.includes('award'))     return 'Award';
  if (t.includes('cancel'))    return 'Cancelled';
  if (t.includes('sources sought') || t.includes('rfi')) return 'RFI';
  if (t.includes('pre-solicitation') || t.includes('pre-rfp')) return 'Pre-RFP';
  return 'Active RFP';
}

function estimateValue(category, title) {
  // Rough estimate when no value provided
  if (/DDI|modernization|MMIS/i.test(category + title)) return Math.round((Math.random() * 20 + 10) * 10) / 10;
  if (/assessment|audit|IV.V/i.test(category + title))  return Math.round((Math.random() * 3 + 1) * 10) / 10;
  if (/M&O|maintenance/i.test(category + title))        return Math.round((Math.random() * 10 + 5) * 10) / 10;
  return Math.round((Math.random() * 5 + 1) * 10) / 10;
}

function buildCompContext(opp, hr1Info) {
  const parts = [];
  if (hr1Info.keyFactor) parts.push(hr1Info.keyFactor);
  if (opp.typeOfSetAsideDescription) parts.push(`Set-aside: ${opp.typeOfSetAsideDescription}`);
  return parts.join('; ').slice(0, 150);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

module.exports = { scrape };
