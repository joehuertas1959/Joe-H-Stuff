'use strict';
const { scrapePortal } = require('./generic-portal');
async function scrape(opts) {
  return scrapePortal({
    state: 'MS', agency: 'Mississippi Division of Medicaid', tier: 1,
    url: 'https://medicaid.ms.gov/about-dom/doing-business-with-dom/procurement/',
    baseUrl: 'https://medicaid.ms.gov',
    beneficiaries: 950000, estValueM: 7,
    notes: 'Highest FMAP in nation (77.08%); non-expansion; aging MMIS; priority H.R. 1 CE market.'
  }, opts);
}
module.exports = { scrape };
