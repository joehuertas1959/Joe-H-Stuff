'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'NY', agency: 'New York DOH', tier: 1,
    url: 'https://www.health.ny.gov/funding/',
    baseUrl: 'https://www.health.ny.gov',
    beneficiaries: 8000000, estValueM: 20,
    notes: 'eMedNY; large but well-funded.'
  }, opts);
}
module.exports = { scrape };
