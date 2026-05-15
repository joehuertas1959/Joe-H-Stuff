'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'MT', agency: 'Montana DPHHS', tier: 1,
    url: 'https://dphhs.mt.gov/DPHHS/contractsandgrants',
    baseUrl: 'https://dphhs.mt.gov',
    beneficiaries: 280000, estValueM: 3,
    notes: 'Expansion state; FMAP 66.28%; active procurement activity per reference data; Medicaid expansion beneficiary growth.'
  }, opts);
}
module.exports = { scrape };
