'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'OH', agency: 'Ohio Medicaid', tier: 1,
    url: 'https://medicaid.ohio.gov/wps/portal/gov/medicaid/stakeholders-and-partners/legal-and-contracts/requests-for-proposals',
    baseUrl: 'https://medicaid.ohio.gov',
    beneficiaries: 3400000, estValueM: 12,
    notes: 'Large Medicaid program; active IT modernization.'
  }, opts);
}
module.exports = { scrape };
