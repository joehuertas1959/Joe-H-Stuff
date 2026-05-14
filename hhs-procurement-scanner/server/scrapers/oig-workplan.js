'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const { calcWinProbability, getHR1Score, makeId } = require('./reference-data');

const OIG_URL = 'https://oig.hhs.gov/reports-and-publications/workplan/';

async function scrape({ logger = console.log } = {}) {
  logger('OIG Work Plan: fetching …');
  const results = [];

  try {
    const resp = await axios.get(OIG_URL, {
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HHS-Procurement-Scanner/4.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    const $ = cheerio.load(resp.data);
    const items = [];

    // OIG Work Plan page lists items in tables or lists; try multiple selectors
    $('table tbody tr, .workplan-item, article, .views-row, li').each((i, el) => {
      const text = $(el).text().trim();
      const link = $(el).find('a').first();
      const linkText = link.text().trim();
      const href = link.attr('href') || '';

      if (!linkText || linkText.length < 10) return;

      // Filter for Medicaid IT-related items per Section 3.2 & 7.6
      const relevantTerms = /Medicaid|MMIS|eligibility|information technology|IT system|data system|security|HIPAA|ERM|audit|health information|interoperability|benefit system|child support|SNAP|CHIP|human services/i;
      if (!relevantTerms.test(text)) return;

      items.push({
        title: linkText,
        text: text.slice(0, 300),
        href: href.startsWith('http') ? href : `https://oig.hhs.gov${href}`
      });
    });

    logger(`OIG Work Plan: found ${items.length} relevant items`);

    // If we got nothing from structured selectors, try paragraph text
    if (items.length === 0) {
      $('p, .field-item').each((i, el) => {
        const text = $(el).text().trim();
        const link = $(el).find('a').first();
        const href = link.attr('href') || '';
        const linkText = link.text().trim();
        if (linkText.length > 20 && /Medicaid|MMIS|eligibility|health IT/i.test(text)) {
          items.push({
            title: linkText,
            text: text.slice(0, 300),
            href: href.startsWith('http') ? href : `https://oig.hhs.gov${href}`
          });
        }
      });
    }

    for (const item of items.slice(0, 30)) {
      const { category, program } = classifyOIG(item.title, item.text);
      const id = makeId(item.title, 'Federal', item.href.slice(-20));
      const hr1Info = getHR1Score('');  // OIG is federal-level

      results.push({
        id,
        state: 'Federal',
        region: 'National',
        agency: 'HHS Office of Inspector General',
        opportunity_title: `[OIG SIGNAL] ${item.title}`,
        rfp_rfi_number: 'N/A',
        category,
        program,
        it_type: 'Assessment',
        status: 'Watch',
        published_date: new Date().toISOString().slice(0, 10),
        due_date: 'TBD',
        days_remaining: 'TBD',
        est_value_m: estimateOIGValue(category),
        beneficiaries: 0,
        fmap: 'N/A',
        urgency: 'WATCH',
        document_url: item.href || OIG_URL,
        portal_url: OIG_URL,
        notes: `OIG Work Plan item — typically drives state ERM/Audit procurements 6–18 months after publication. ${item.text}`,
        win_probability: 'Medium',
        competitive_context: 'OIG finding; no incumbent identified. State corrective action procurement likely. Open competition expected.',
        apd_status: 'Not Applicable',
        incumbent_expiry: 'N/A',
        hr1_readiness_score: 3,
        source: 'HHS OIG Work Plan',
        source_tier: 4,
        scraped_at: new Date().toISOString()
      });
    }

  } catch (err) {
    logger(`OIG Work Plan error: ${err.message}`);
  }

  logger(`OIG Work Plan: ${results.length} pipeline signals identified`);
  return results;
}

function classifyOIG(title, text) {
  const combined = `${title} ${text}`;
  if (/audit|assessment|NIST|HIPAA|security/i.test(combined))        return { category: 'AUDIT-ITAudit', program: 'Medicaid' };
  if (/risk\s*management|ERM|GRC|compliance/i.test(combined))        return { category: 'ERM-Assessment', program: 'Medicaid' };
  if (/eligibility|enrollment|MAGI|work\s*req/i.test(combined))      return { category: 'MES-E&E', program: 'Medicaid' };
  if (/claims|adjudicat/i.test(combined))                            return { category: 'MES-Claims', program: 'Medicaid' };
  if (/interoperability|FHIR|data\s*exchange/i.test(combined))       return { category: 'MES-FHIR', program: 'Medicaid' };
  if (/SNAP|nutrition|food/i.test(combined))                         return { category: 'Work-Requirements', program: 'SNAP' };
  return { category: 'ERM-Assessment', program: 'Cross-Program' };
}

function estimateOIGValue(category) {
  if (/AUDIT|ERM/i.test(category)) return Math.round((Math.random() * 3 + 1) * 10) / 10;
  return Math.round((Math.random() * 8 + 2) * 10) / 10;
}

module.exports = { scrape };
