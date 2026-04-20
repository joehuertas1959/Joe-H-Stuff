'use strict';

const axios = require('axios');

// Map scanner opportunity → xFact §3.2 opportunity schema
function mapToXFactOpportunity(opp) {
  const estimatedValue = opp.est_value_m > 0 ? `$${opp.est_value_m}M` : null;

  return {
    title:            opp.opportunity_title,
    agency:           opp.agency,
    rfpNumber:        opp.rfp_rfi_number !== 'N/A' ? opp.rfp_rfi_number : null,
    status:           'pending',
    documentId:       null,
    dueDate:          opp.due_date !== 'TBD' ? opp.due_date : null,
    estimatedValue,
    bidScore:         opp.bid_score ?? null,
    bidScoreData:     opp.bid_score_data ? JSON.stringify(opp.bid_score_data) : null,
    outcome:          null,
    outcomeNotes:     buildOpportunityNotes(opp)
  };
}

function buildOpportunityNotes(opp) {
  const lines = [
    `Source: ${opp.source} (Tier ${opp.source_tier})`,
    `State: ${opp.state} | Region: ${opp.region}`,
    `Category: ${opp.category} | Program: ${opp.program || 'N/A'} | IT Type: ${opp.it_type || 'N/A'}`,
    `Urgency: ${opp.urgency} | Win Probability: ${opp.win_probability}`,
    `APD Status: ${opp.apd_status || 'Unknown'} | Incumbent Expiry: ${opp.incumbent_expiry || 'Unknown'}`,
    `HR1 Readiness Score: ${opp.hr1_readiness_score ?? 'N/A'}/5`,
    `FMAP: ${opp.fmap ?? 'N/A'}% | Beneficiaries: ${opp.beneficiaries?.toLocaleString() ?? 'N/A'}`,
    `Portal URL: ${opp.portal_url || 'N/A'}`,
    `Document URL: ${opp.document_url || 'N/A'}`,
    `Scanner Notes: ${opp.notes || ''}`,
    `Competitive Context: ${opp.competitive_context || ''}`,
    `Scraped At: ${opp.scraped_at}`
  ];
  return lines.join('\n');
}

async function pushToXFact(opp, xfactApiUrl) {
  if (!xfactApiUrl) throw new Error('xfactApiUrl is required');

  const payload = mapToXFactOpportunity(opp);

  const resp = await axios.post(`${xfactApiUrl.replace(/\/$/, '')}/api/opportunities`, payload, {
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent':   'HHS-Procurement-Scanner/4.0'
    }
  });

  return resp.data;
}

function exportAsXFactJson(opportunities) {
  return opportunities.map(mapToXFactOpportunity);
}

module.exports = { mapToXFactOpportunity, buildOpportunityNotes, pushToXFact, exportAsXFactJson };
