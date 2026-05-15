'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'LA', agency: 'Louisiana LDH', tier: 1,
    url: 'https://wwwcfprd.doa.louisiana.gov/osp/lapac/dspBid.cfm?search=department&term=4',
    baseUrl: 'https://wwwcfprd.doa.louisiana.gov',
    beneficiaries: 2000000, estValueM: 8,
    notes: 'Medicaid expansion; active IT modernization signals.'
  }, opts);
}
module.exports = { scrape };
