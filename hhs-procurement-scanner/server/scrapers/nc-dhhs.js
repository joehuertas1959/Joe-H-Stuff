'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'NC', agency: 'NC DHHS', tier: 1,
    url: 'https://medicaid.ncdhhs.gov/requests-proposals-rfps-and-requests-information-rfis',
    baseUrl: 'https://medicaid.ncdhhs.gov',
    beneficiaries: 2800000, estValueM: 8,
    notes: 'Active MCO reprocurement; NCTracks incumbent.'
  }, opts);
}
module.exports = { scrape };
