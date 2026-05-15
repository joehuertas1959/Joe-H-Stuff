'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'KY', agency: 'Kentucky CHFS', tier: 1,
    url: 'https://chfs.ky.gov/agencies/dms/Pages/procurement.aspx',
    baseUrl: 'https://chfs.ky.gov',
    beneficiaries: 1600000, estValueM: 8,
    notes: '50K-case backlog; 600 defects at launch. HIGHEST BD priority.'
  }, opts);
}
module.exports = { scrape };
