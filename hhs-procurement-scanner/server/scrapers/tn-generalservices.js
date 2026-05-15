'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'TN', agency: 'Tennessee General Services CPO', tier: 1,
    url: 'https://www.tn.gov/generalservices/procurement/central-procurement-office--cpo-/supplier-information/request-for-proposals--rfp--opportunities1.html',
    baseUrl: 'https://www.tn.gov',
    beneficiaries: 1600000, estValueM: 5,
    notes: 'TN statewide RFP portal; supplements TennCare-specific portal.'
  }, opts);
}
module.exports = { scrape };
