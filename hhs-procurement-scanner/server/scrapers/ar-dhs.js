'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'AR', agency: 'Arkansas DHS', tier: 1,
    url: 'https://humanservices.arkansas.gov/about-dhs/doing-business-with-dhs/',
    baseUrl: 'https://humanservices.arkansas.gov',
    beneficiaries: 1000000, estValueM: 5,
    notes: 'Active Deloitte contract; CE module needed per reference data; FMAP 70.52%; non-expansion state.'
  }, opts);
}
module.exports = { scrape };
