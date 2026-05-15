'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'OR', agency: 'Oregon OHA', tier: 1,
    url: 'https://orpin.oregon.gov/open.dll/welcome',
    baseUrl: 'https://orpin.oregon.gov',
    beneficiaries: 1300000, estValueM: 7,
    notes: 'Medicaid expansion; active IT procurement.'
  }, opts);
}
module.exports = { scrape };
