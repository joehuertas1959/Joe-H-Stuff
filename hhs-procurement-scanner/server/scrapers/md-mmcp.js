'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'MD', agency: 'Maryland DHMH', tier: 1,
    url: 'https://procurement.maryland.gov/solicitations/?procuringAgency=DHMH&status=open',
    baseUrl: 'https://procurement.maryland.gov',
    beneficiaries: 1600000, estValueM: 8,
    notes: 'Medicaid expansion; active IT procurement calendar.'
  }, opts);
}
module.exports = { scrape };
