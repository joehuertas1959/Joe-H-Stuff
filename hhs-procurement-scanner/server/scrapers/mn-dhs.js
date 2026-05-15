'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'MN', agency: 'Minnesota DHS', tier: 1,
    url: 'https://mn.gov/dhs/partners-and-providers/doing-business-with-dhs/current-requests-for-proposals/',
    baseUrl: 'https://mn.gov',
    beneficiaries: 1200000, estValueM: 8,
    notes: 'Medicaid expansion; active IV-E and SNAP signals.'
  }, opts);
}
module.exports = { scrape };
