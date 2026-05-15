'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'AL', agency: 'Alabama Medicaid Agency', tier: 1,
    url: 'https://medicaid.alabama.gov/content/vendor_info/purchasing.aspx',
    baseUrl: 'https://medicaid.alabama.gov',
    beneficiaries: 1100000, estValueM: 6,
    notes: 'High FMAP 73.89%; non-expansion state; legacy MMIS; strong H.R. 1 CE exposure.'
  }, opts);
}
module.exports = { scrape };
