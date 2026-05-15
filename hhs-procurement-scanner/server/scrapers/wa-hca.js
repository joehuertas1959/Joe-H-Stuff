'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'WA', agency: 'Washington HCA', tier: 1,
    url: 'https://www.hca.wa.gov/about-hca/bids-and-contracts',
    baseUrl: 'https://www.hca.wa.gov',
    beneficiaries: 2100000, estValueM: 8,
    notes: 'Medicaid expansion; active procurement calendar.'
  }, opts);
}
module.exports = { scrape };
