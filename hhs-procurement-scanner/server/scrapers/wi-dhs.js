'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'WI', agency: 'Wisconsin DHS', tier: 1,
    url: 'https://publicnotices.wisconsin.gov/Search/Results?Organization=Dept+of+Health+Services+(DHS)&Category=Procurement',
    baseUrl: 'https://publicnotices.wisconsin.gov',
    beneficiaries: 1300000, estValueM: 7,
    notes: 'Non-expansion; legacy MMIS modernization opportunity.'
  }, opts);
}
module.exports = { scrape };
