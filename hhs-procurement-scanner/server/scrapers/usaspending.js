'use strict';

const axios = require('axios');
const { classifyOpportunity, calcUrgency, calcDaysRemaining, calcWinProbability, getHR1Score, getRegion, getFMAP, makeId } = require('./reference-data');

const USA_SPENDING_URL = 'https://api.usaspending.gov/api/v2/search/spending_by_award/';

async function scrape({ logger = console.log } = {}) {
  logger('USASpending.gov: searching HHS/CMS contracts to state recipients …');
  const results = [];
  const seen = new Set();

  const payload = {
    filters: {
      award_type_codes: ['A', 'B', 'C', 'D'],
      agencies: [
        { type: 'awarding', tier: 'toptier', name: 'Department of Health and Human Services' }
      ],
      recipient_type_names: ['state_government'],
      keywords: ['Medicaid', 'MMIS', 'eligibility', 'information technology', 'IT services']
    },
    fields: [
      'Award ID',
      'Recipient Name',
      'Award Amount',
      'Start Date',
      'End Date',
      'Awarding Agency',
      'Awarding Sub Agency',
      'Description',
      'Place of Performance State Code',
      'Place of Performance State Name',
      'generated_internal_id'
    ],
    sort: 'End Date',
    order: 'asc',
    limit: 100,
    page: 1
  };

  try {
    const resp = await axios.post(USA_SPENDING_URL, payload, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'HHS-Procurement-Scanner/4.0'
      }
    });

    const awards = resp.data?.results || [];
    logger(`USASpending.gov: ${awards.length} awards returned`);

    for (const award of awards) {
      const title = award['Description'] || 'HHS/Medicaid IT Contract';
      const stateCode = (award['Place of Performance State Code'] || '').toUpperCase();
      const awardId = award['Award ID'] || '';
      const recipientName = award['Recipient Name'] || 'Unknown';
      const awardAmount = parseFloat(award['Award Amount']) || 0;
      const startDate = award['Start Date'] || '';
      const endDate = award['End Date'] || '';

      // Skip tiny contracts (< $500K threshold from Section 6.3)
      if (awardAmount > 0 && awardAmount < 500000) continue;

      const dedupKey = `usaspending|${awardId}`.toLowerCase();
      if (seen.has(dedupKey)) continue;
      seen.add(dedupKey);

      const { category, program, itType } = classifyOpportunity(title, '');
      const hr1Info = getHR1Score(stateCode);

      // Calculate incumbent expiry info
      const incumbentExpiry = formatIncumbentExpiry(endDate);
      const isNearTermRecompete = isWithin24Months(endDate);

      const estValueM = Math.round(awardAmount / 100000) / 10;
      const urgency = isNearTermRecompete ? 'HIGH' : 'WATCH';
      const winProb = calcWinProbability(stateCode, category, hr1Info.keyFactor || '');

      // Build detail URL for USASpending
      const internalId = award['generated_internal_id'] || '';
      const portalUrl = internalId
        ? `https://www.usaspending.gov/award/${internalId}`
        : 'https://usaspending.gov/search';

      const id = makeId(title, stateCode, awardId);

      results.push({
        id,
        state: stateCode || 'Federal',
        region: getRegion(stateCode) || 'Unknown',
        agency: award['Awarding Sub Agency'] || award['Awarding Agency'] || 'HHS',
        opportunity_title: isNearTermRecompete
          ? `[RECOMPETE SIGNAL] ${recipientName} — ${title.slice(0, 80)}`
          : `${recipientName} — ${title.slice(0, 80)}`,
        rfp_rfi_number: awardId,
        category: isNearTermRecompete ? 'RECOMPETE-Expiring' : category,
        program,
        it_type: isNearTermRecompete ? 'M&O' : itType,
        status: isNearTermRecompete ? 'Watch' : 'Award',
        published_date: startDate.slice(0, 10),
        due_date: endDate ? endDate.slice(0, 10) : 'TBD',
        days_remaining: calcDaysRemaining(endDate),
        est_value_m: estValueM,
        beneficiaries: 0,
        fmap: getFMAP(stateCode),
        urgency,
        document_url: portalUrl,
        portal_url: 'https://usaspending.gov/search',
        notes: `USASpending.gov award. Incumbent: ${recipientName}. Contract period: ${startDate.slice(0, 10)} – ${endDate.slice(0, 10)}.${isNearTermRecompete ? ' NEAR-TERM RECOMPETE (<24 months to expiry).' : ''}`,
        win_probability: winProb,
        competitive_context: `Incumbent: ${recipientName}; Expiry: ${incumbentExpiry}; ${hr1Info.keyFactor || ''}`.slice(0, 150),
        apd_status: 'Unknown',
        incumbent_expiry: incumbentExpiry,
        hr1_readiness_score: hr1Info.score,
        source: 'USASpending.gov',
        source_tier: 3,
        scraped_at: new Date().toISOString()
      });
    }

    logger(`USASpending.gov: ${results.length} relevant contracts processed`);
  } catch (err) {
    logger(`USASpending.gov error: ${err.message}`);
  }

  return results;
}

function formatIncumbentExpiry(dateStr) {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Unknown';
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function isWithin24Months(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() + 24);
  return d <= cutoff;
}

module.exports = { scrape };
