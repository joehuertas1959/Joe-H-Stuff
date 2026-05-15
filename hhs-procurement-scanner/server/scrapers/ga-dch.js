'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'GA', agency: 'Georgia DCH', tier: 1,
    url: 'https://dch.georgia.gov/divisionsoffices/office-procurement-services/bidding-opportunities',
    baseUrl: 'https://dch.georgia.gov',
    beneficiaries: 2800000, estValueM: 10,
    notes: 'Medicaid expansion; active Deloitte contract; IT modernization signals.'
  }, opts);
}
module.exports = { scrape };
