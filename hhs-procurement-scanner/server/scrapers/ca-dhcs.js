'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'CA', agency: 'California DHCS', tier: 1,
    url: 'https://www.dhcs.ca.gov/provgovpart/Pages/Solicitations.aspx',
    baseUrl: 'https://www.dhcs.ca.gov',
    beneficiaries: 15000000, estValueM: 25,
    notes: 'CARES active DDI; large vendor relationships.'
  }, opts);
}
module.exports = { scrape };
