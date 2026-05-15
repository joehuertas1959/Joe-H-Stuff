'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'MO', agency: 'Missouri DSS', tier: 1,
    url: 'https://dss.mo.gov/bids/',
    baseUrl: 'https://dss.mo.gov',
    beneficiaries: 1000000, estValueM: 6,
    notes: 'Non-expansion; SNAP/TANF modernization signals.'
  }, opts);
}
module.exports = { scrape };
