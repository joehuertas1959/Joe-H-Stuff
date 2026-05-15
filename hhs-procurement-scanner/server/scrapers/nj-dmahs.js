'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'NJ', agency: 'New Jersey DMAHS', tier: 1,
    url: 'https://www.njstart.gov/bso/external/publicBids.sdo',
    baseUrl: 'https://www.njstart.gov',
    beneficiaries: 1800000, estValueM: 8,
    notes: 'Medicaid expansion; active procurement activity.'
  }, opts);
}
module.exports = { scrape };
