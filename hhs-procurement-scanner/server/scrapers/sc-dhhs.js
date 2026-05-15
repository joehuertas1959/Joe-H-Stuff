'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'SC', agency: 'South Carolina DHHS', tier: 1,
    url: 'http://webprod.cio.sc.gov/SCSolicitationWeb/solicitationSearch.do?searchgroup=DHHS&searchstatus=O&searchlimit=100&btnSearch=on',
    baseUrl: 'http://webprod.cio.sc.gov',
    beneficiaries: 1100000, estValueM: 6,
    notes: 'Active MMIS modernization; non-expansion state.'
  }, opts);
}
module.exports = { scrape };
