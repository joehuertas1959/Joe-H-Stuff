'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'RI', agency: 'Rhode Island EOHHS', tier: 1,
    url: 'https://eohhs.ri.gov/about/procurement',
    baseUrl: 'https://eohhs.ri.gov',
    beneficiaries: 330000, estValueM: 4,
    notes: 'bdPriority HIGHEST; class-action suits; systemic eligibility failures; active modernization need.'
  }, opts);
}
module.exports = { scrape };
