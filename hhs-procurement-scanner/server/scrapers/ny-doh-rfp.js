'use strict';
const { scrapePortal } = require('./generic-portal');
// NY DOH Request for Applications / RFP listing — separate from the main funding page
async function scrape(opts) {
  return scrapePortal({
    state: 'NY', agency: 'New York DOH (RFA/RFP)', tier: 1,
    url: 'https://www.health.ny.gov/funding/rfa/',
    baseUrl: 'https://www.health.ny.gov',
    beneficiaries: 8000000, estValueM: 20,
    keywords: /Medicaid|eMedNY|MMIS|eligibility|SNAP|managed care|health IT|system|RFP|RFI|RFA|solicitation|procurement|contract|vendor/i,
    notes: 'NY DOH RFA/RFP listing page — complements health.ny.gov/funding/ for IT solicitations.'
  }, opts);
}
module.exports = { scrape };
