'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'TX', agency: 'Texas HHSC', tier: 1,
    url: 'https://www.hhs.texas.gov/business/contracting-hhs/procurement-opportunities',
    baseUrl: 'https://www.hhs.texas.gov',
    beneficiaries: 5000000, estValueM: 10,
    notes: 'Large ABAWD population; Accenture incumbent; non-expansion state.'
  }, opts);
}
module.exports = { scrape };
