'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'FL', agency: 'Florida AHCA', tier: 1,
    url: 'https://ahca.myflorida.com/procurements',
    baseUrl: 'https://ahca.myflorida.com',
    beneficiaries: 5500000, estValueM: 12,
    notes: 'Gainwell performance concerns; large ABAWD population.'
  }, opts);
}
module.exports = { scrape };
