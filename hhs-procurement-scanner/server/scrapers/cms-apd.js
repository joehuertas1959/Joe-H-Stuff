'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const { getHR1Score, getRegion, getFMAP, makeId } = require('./reference-data');

const APD_URL = 'https://www.medicaid.gov/medicaid/data-systems/macpro';

// CMS also publishes APD data via their MACPro portal and state Medicaid pages
// As a supplement, we also check the CMS MMIS page for state system updates
const CMS_MMIS_URL = 'https://www.medicaid.gov/medicaid/data-systems/medicaid-information-technology/index.html';

async function scrape({ logger = console.log } = {}) {
  logger('CMS APD Database: fetching MACPro and CMS MMIS pages …');
  const results = [];

  // Tier 1 states for APD monitoring
  const TIER1_STATES = ['TN', 'NV', 'NE', 'HI', 'IL', 'IA', 'VA', 'OK', 'CO', 'AR', 'PA', 'GA', 'KY', 'RI', 'FL', 'CA', 'NY', 'TX', 'MT', 'WI'];

  for (const url of [APD_URL, CMS_MMIS_URL]) {
    try {
      const resp = await axios.get(url, {
        timeout: 20000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; HHS-Procurement-Scanner/4.0)',
          'Accept': 'text/html,application/xhtml+xml'
        }
      });

      const $ = cheerio.load(resp.data);
      const entries = [];

      // Look for state APD references, system updates, or approval notices
      $('a, tr, li, p').each((i, el) => {
        const text = $(el).text().trim();
        const link = $(el).find('a').first();
        const href = $(el).attr('href') || link.attr('href') || '';
        const linkText = link.text().trim() || text;

        if (!linkText || linkText.length < 8) return;

        // Look for APD-related content
        if (!/APD|Advance\s*Planning|MES|MMIS|eligibility.*system|medicaid.*system|state.*IT|DDI|CMS[-\s]64/i.test(text)) return;

        // Try to extract state code
        const stateMatch = text.match(/\b([A-Z]{2})\b/);
        const stateCode = stateMatch && TIER1_STATES.includes(stateMatch[1]) ? stateMatch[1] : null;

        const apdType = /M&O|maintenance|operations/i.test(text) ? 'M&O' : 'DDI';
        const apdStatus = /approved|approval/i.test(text) ? 'Approved' : /pending|submitted/i.test(text) ? 'Pending' : 'Unknown';

        entries.push({
          title: linkText.slice(0, 120),
          href: href.startsWith('http') ? href : `https://www.medicaid.gov${href}`,
          state: stateCode,
          apdType,
          apdStatus,
          context: text.slice(0, 300)
        });
      });

      logger(`CMS APD [${url.includes('macpro') ? 'MACPro' : 'MMIS'}]: ${entries.length} APD-related entries`);

      for (const entry of entries.slice(0, 20)) {
        if (!entry.state) continue;
        const hr1Info = getHR1Score(entry.state);
        const urgency = entry.apdStatus === 'Approved' ? 'HIGH' : entry.apdStatus === 'Pending' ? 'MEDIUM' : 'WATCH';
        const id = makeId(entry.title, entry.state, 'APD');

        results.push({
          id,
          state: entry.state,
          region: getRegion(entry.state),
          agency: `${entry.state} Medicaid Agency`,
          opportunity_title: `[APD SIGNAL] ${entry.title}`,
          rfp_rfi_number: 'N/A',
          category: entry.apdType === 'M&O' ? 'APD-MandO' : 'APD-DDI',
          program: 'Medicaid',
          it_type: entry.apdType,
          status: entry.apdStatus === 'Approved' ? 'Pre-RFP' : 'Watch',
          published_date: new Date().toISOString().slice(0, 10),
          due_date: 'TBD',
          days_remaining: 'TBD',
          est_value_m: entry.apdType === 'DDI' ? 25.0 : 8.0,
          beneficiaries: 0,
          fmap: getFMAP(entry.state),
          urgency,
          document_url: entry.href || APD_URL,
          portal_url: APD_URL,
          notes: `CMS APD signal. Approved APD = procurement typically follows in 3–18 months. ${entry.context.slice(0, 150)}`,
          win_probability: 'Medium',
          competitive_context: `APD ${entry.apdStatus}. ${hr1Info.keyFactor || ''}`.slice(0, 150),
          apd_status: entry.apdStatus,
          incumbent_expiry: 'Unknown',
          hr1_readiness_score: hr1Info.score,
          source: 'CMS APD Database',
          source_tier: 2,
          scraped_at: new Date().toISOString()
        });
      }

      await sleep(1500);
    } catch (err) {
      logger(`CMS APD [${url}] error: ${err.message}`);
    }
  }

  logger(`CMS APD: ${results.length} APD pipeline signals`);
  return results;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

module.exports = { scrape };
