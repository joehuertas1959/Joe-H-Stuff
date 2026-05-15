'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'PA', agency: 'Pennsylvania DHS', tier: 1,
    url: 'https://www.dhs.pa.gov/providers/Providers/Pages/Solicitations.aspx',
    baseUrl: 'https://www.dhs.pa.gov',
    beneficiaries: 3500000, estValueM: 12,
    notes: '9,269 children coverage error; HIGHEST BD priority. SNAP/work-req signals.'
  }, opts);
}
module.exports = { scrape };
