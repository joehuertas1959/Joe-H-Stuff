'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'WV', agency: 'West Virginia DHHR', tier: 1,
    url: 'https://dhhr.wv.gov/Pages/procurements.aspx',
    baseUrl: 'https://dhhr.wv.gov',
    beneficiaries: 670000, estValueM: 5,
    notes: 'High FMAP 75.93%; expansion state; legacy eligibility systems; active CE modernization interest.'
  }, opts);
}
module.exports = { scrape };
