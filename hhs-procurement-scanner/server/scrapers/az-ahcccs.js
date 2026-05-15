'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'AZ', agency: 'Arizona AHCCCS', tier: 1,
    url: 'https://www.azahcccs.gov/Resources/OversightOfHealthPlans/SolicitationsAndContracts/open.html',
    baseUrl: 'https://www.azahcccs.gov',
    beneficiaries: 2200000, estValueM: 8,
    notes: 'Active RHTP signals; Medicaid expansion state.'
  }, opts);
}
module.exports = { scrape };
