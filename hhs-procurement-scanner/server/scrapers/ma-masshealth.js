'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'MA', agency: 'Massachusetts MassHealth', tier: 1,
    url: 'https://www.commbuys.com/bso/external/publicBids.sdo',
    baseUrl: 'https://www.commbuys.com',
    beneficiaries: 2100000, estValueM: 10,
    notes: 'Medicaid expansion; active MMIS modernization.'
  }, opts);
}
module.exports = { scrape };
