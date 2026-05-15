'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'CT', agency: 'Connecticut DSS', tier: 1,
    url: 'https://portal.ct.gov/DAS/CTSource/bidboard',
    baseUrl: 'https://portal.ct.gov',
    beneficiaries: 850000, estValueM: 5,
    notes: 'Medicaid expansion; SNAP/TANF signals.'
  }, opts);
}
module.exports = { scrape };
