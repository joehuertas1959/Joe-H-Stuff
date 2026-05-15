'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'MI', agency: 'Michigan DHHS', tier: 1,
    url: 'https://www.michigan.gov/dtmb/procurement/contractconnect/bid-proposals',
    baseUrl: 'https://www.michigan.gov',
    beneficiaries: 2700000, estValueM: 10,
    notes: 'Active IV-E and Medicaid IT modernization.'
  }, opts);
}
module.exports = { scrape };
