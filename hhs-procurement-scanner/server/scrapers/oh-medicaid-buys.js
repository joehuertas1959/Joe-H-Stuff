'use strict';
const { scrapePortal } = require('./generic-portal');
// Ohio Buys (procure.ohio.gov) — state-wide eProcurement system used by ODM for IT contracts
async function scrape(opts) {
  return scrapePortal({
    state: 'OH', agency: 'Ohio ODM / Ohio Buys', tier: 1,
    url: 'https://procure.ohio.gov/proc/index.cfm',
    baseUrl: 'https://procure.ohio.gov',
    beneficiaries: 3400000, estValueM: 12,
    keywords: /Medicaid|MMIS|eligibility|SNAP|TANF|health|IT|information technology|ODM|managed care|system|contract|RFP|RFI|procurement/i,
    notes: 'Ohio Buys eProcurement portal — covers ODM Medicaid IT alongside medicaid.ohio.gov.'
  }, opts);
}
module.exports = { scrape };
