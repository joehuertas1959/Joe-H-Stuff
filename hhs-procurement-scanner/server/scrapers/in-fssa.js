'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'IN', agency: 'Indiana FSSA', tier: 1,
    url: 'https://www.in.gov/idoa/procurement/current-business-opportunities/',
    baseUrl: 'https://www.in.gov',
    beneficiaries: 1800000, estValueM: 8,
    notes: 'Active IV-E and IV-D signals; Medicaid expansion state.'
  }, opts);
}
module.exports = { scrape };
