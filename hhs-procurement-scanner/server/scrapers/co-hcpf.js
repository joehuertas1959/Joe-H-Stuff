'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'CO', agency: 'Colorado HCPF', tier: 1,
    url: 'https://hcpf.colorado.gov/procurement',
    baseUrl: 'https://hcpf.colorado.gov',
    beneficiaries: 1700000, estValueM: 10,
    notes: 'Deloitte audit findings; active DDI. HIGH BD priority.'
  }, opts);
}
module.exports = { scrape };
