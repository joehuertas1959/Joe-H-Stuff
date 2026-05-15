'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'NH', agency: 'New Hampshire DHHS', tier: 1,
    url: 'https://www.dhhs.nh.gov/doing-business-dhhs/contracts-procurement-opportunities/open-requests-proposals',
    baseUrl: 'https://www.dhhs.nh.gov',
    beneficiaries: 200000, estValueM: 3,
    notes: 'Small state; active procurement for IV-E and Medicaid.'
  }, opts);
}
module.exports = { scrape };
