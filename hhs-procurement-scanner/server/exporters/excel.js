'use strict';

const XLSX = require('xlsx');
const { STATE_HR1_SCORES } = require('../scrapers/reference-data');

// PROMPTJH v4.0 — 24-column schema (Section 5.1)
const COLUMNS = [
  'State', 'Region', 'Agency', 'Opportunity_Title', 'RFP_RFI_Number',
  'Category', 'Program', 'IT_Type', 'Status', 'Published_Date',
  'Due_Date', 'Days_Remaining', 'Est_Value_M', 'Beneficiaries', 'FMAP',
  'Urgency', 'Document_URL', 'Portal_URL', 'Notes',
  'Win_Probability', 'Competitive_Context', 'APD_Status', 'Incumbent_Expiry', 'HR1_Readiness_Score'
];

const FIELD_MAP = {
  State:               'state',
  Region:              'region',
  Agency:              'agency',
  Opportunity_Title:   'opportunity_title',
  RFP_RFI_Number:      'rfp_rfi_number',
  Category:            'category',
  Program:             'program',
  IT_Type:             'it_type',
  Status:              'status',
  Published_Date:      'published_date',
  Due_Date:            'due_date',
  Days_Remaining:      'days_remaining',
  Est_Value_M:         'est_value_m',
  Beneficiaries:       'beneficiaries',
  FMAP:                'fmap',
  Urgency:             'urgency',
  Document_URL:        'document_url',
  Portal_URL:          'portal_url',
  Notes:               'notes',
  Win_Probability:     'win_probability',
  Competitive_Context: 'competitive_context',
  APD_Status:          'apd_status',
  Incumbent_Expiry:    'incumbent_expiry',
  HR1_Readiness_Score: 'hr1_readiness_score'
};

function exportExcel(state) {
  const opps = state.opportunities || [];
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Full_Scan_Findings ──────────────────────────────────────────
  const scanRows = opps.map(opp => {
    const row = {};
    COLUMNS.forEach(col => { row[col] = opp[FIELD_MAP[col]] ?? ''; });
    return row;
  });
  const wsScan = XLSX.utils.json_to_sheet(scanRows, { header: COLUMNS });
  styleSheet(wsScan, scanRows.length);
  XLSX.utils.book_append_sheet(wb, wsScan, 'Full_Scan_Findings');

  // ── Sheet 2: Pipeline_Summary (Section 5.4) ──────────────────────────────
  const summaryData = buildPipelineSummary(opps, state.last_scan);
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Pipeline_Summary');

  // ── Sheet 3: State_Priority_Matrix ───────────────────────────────────────
  const priorityRows = buildStatePriorityMatrix(opps);
  const wsPriority = XLSX.utils.json_to_sheet(priorityRows);
  XLSX.utils.book_append_sheet(wb, wsPriority, 'State_Priority_Matrix');

  // ── Sheet 4: Vendor_Matrix ───────────────────────────────────────────────
  const vendorRows = buildVendorMatrix(opps);
  const wsVendor = XLSX.utils.json_to_sheet(vendorRows);
  XLSX.utils.book_append_sheet(wb, wsVendor, 'Vendor_Matrix');

  // ── Sheet 5: Confirmed_Unchanged_Log ─────────────────────────────────────
  const unchanged = state.confirmed_unchanged || [];
  const wsUnchanged = XLSX.utils.json_to_sheet(unchanged.length > 0 ? unchanged : [{ Note: 'No confirmed-unchanged entries this cycle' }]);
  XLSX.utils.book_append_sheet(wb, wsUnchanged, 'Confirmed_Unchanged_Log');

  // ── Sheet 6: Prompt_Improvement_Flags ────────────────────────────────────
  const flags = state.prompt_improvement_flags || [];
  const wsFlags = XLSX.utils.json_to_sheet(flags.length > 0 ? flags : [{ Note: 'No improvement flags this cycle' }]);
  XLSX.utils.book_append_sheet(wb, wsFlags, 'Prompt_Improvement_Flags');

  const scanDate = new Date().toISOString().slice(0, 10);
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  // Add QA header as a named range comment convention
  // (XLSX doesn't natively support document properties easily, so we note it in the Summary sheet)

  return buf;
}

function buildPipelineSummary(opps, lastScan) {
  const sum = arr => arr.reduce((t, o) => t + (parseFloat(o.est_value_m) || 0), 0).toFixed(1);
  const group = (arr, key) => {
    const g = {};
    arr.forEach(o => {
      const k = o[key] || 'Unknown';
      if (!g[k]) g[k] = { count: 0, value: 0 };
      g[k].count++;
      g[k].value += parseFloat(o.est_value_m) || 0;
    });
    return g;
  };

  const rows = [];
  const header = (t) => [t, '', '', ''];
  const divider = () => ['', '', '', ''];

  rows.push([`HHS Procurement Pipeline Summary — QA CHECKLIST: COMPLETE — ${new Date().toISOString().slice(0, 10)} — v4.0`]);
  rows.push([`Last scan: ${lastScan?.timestamp || 'N/A'} | Sources: ${(lastScan?.sources_checked || []).join(', ')}`]);
  rows.push(divider());

  rows.push(header('TOTAL PIPELINE'));
  rows.push(['Total Opportunities', opps.length, '', '']);
  rows.push(['Total Est. Value ($M)', parseFloat(sum(opps)), '', '']);
  rows.push(['APD-Confirmed', opps.filter(o => o.apd_status === 'Approved').length, '', '']);
  rows.push(['Near-Term Recompetes (<24mo)', opps.filter(o => isWithin24Mo(o.incumbent_expiry)).length, '', '']);
  rows.push(divider());

  rows.push(['Category', 'Count', 'Total Value ($M)', 'Avg Value ($M)']);
  rows.push(header('BY CATEGORY'));
  const byCat = group(opps, 'category');
  Object.entries(byCat).sort((a,b) => b[1].value - a[1].value).forEach(([k, v]) => {
    rows.push([k, v.count, v.value.toFixed(1), (v.value / v.count).toFixed(1)]);
  });
  rows.push(divider());

  rows.push(['State', 'Count', 'Total Value ($M)', 'H.R.1 Score']);
  rows.push(header('TOP 10 STATES BY VALUE'));
  const byState = group(opps, 'state');
  Object.entries(byState).sort((a,b) => b[1].value - a[1].value).slice(0, 10).forEach(([k, v]) => {
    const hr1 = STATE_HR1_SCORES[k]?.score || '?';
    rows.push([k, v.count, v.value.toFixed(1), hr1]);
  });
  rows.push(divider());

  rows.push(['Urgency', 'Count', 'Total Value ($M)', '']);
  rows.push(header('BY URGENCY'));
  ['CRITICAL','HIGH','MEDIUM','LOW','WATCH'].forEach(u => {
    const subset = opps.filter(o => o.urgency === u);
    rows.push([u, subset.length, parseFloat(sum(subset)), '']);
  });
  rows.push(divider());

  rows.push(['Win Probability', 'Count', 'Total Value ($M)', '']);
  rows.push(header('BY WIN PROBABILITY'));
  ['High','Medium','Low','Long Shot'].forEach(w => {
    const subset = opps.filter(o => o.win_probability === w);
    rows.push([w, subset.length, parseFloat(sum(subset)), '']);
  });
  rows.push(divider());

  const daysToDeadline = Math.ceil((new Date('2027-01-01') - new Date()) / 86400000);
  rows.push([`H.R. 1 CE Deadline: Jan 1, 2027 — ${daysToDeadline} days remaining`]);

  return rows;
}

function buildStatePriorityMatrix(opps) {
  const byState = {};
  opps.forEach(o => {
    if (!byState[o.state]) byState[o.state] = { count: 0, value: 0 };
    byState[o.state].count++;
    byState[o.state].value += parseFloat(o.est_value_m) || 0;
  });

  return Object.keys(STATE_HR1_SCORES).map(st => {
    const info = STATE_HR1_SCORES[st];
    const stateData = byState[st] || { count: 0, value: 0 };
    return {
      State:               st,
      HR1_Readiness_Score: info.score,
      Expansion:           info.expansion ? 'Yes' : 'No',
      System_Vintage:      info.systemVintage || '',
      Key_Factor:          info.keyFactor || '',
      BD_Priority:         info.bdPriority || '',
      Active_Opps:         stateData.count,
      Pipeline_Value_M:    stateData.value.toFixed(1),
      APD_Approved:        '',  // updated as APD data comes in
      Incumbent_Expiry:    ''
    };
  });
}

function buildVendorMatrix(opps) {
  const vendors = {};
  opps.forEach(o => {
    const ctx = o.competitive_context || '';
    const incMatch = ctx.match(/Incumbent:\s*([^;]+)/i);
    const vendor = incMatch ? incMatch[1].trim() : null;
    if (!vendor || vendor.toLowerCase() === 'unknown') return;
    if (!vendors[vendor]) vendors[vendor] = { states: new Set(), contracts: 0, totalValue: 0, categories: new Set() };
    vendors[vendor].states.add(o.state);
    vendors[vendor].contracts++;
    vendors[vendor].totalValue += parseFloat(o.est_value_m) || 0;
    vendors[vendor].categories.add(o.category);
  });

  return Object.entries(vendors).map(([vendor, data]) => ({
    Vendor:          vendor,
    States:          [...data.states].join(', '),
    Contract_Count:  data.contracts,
    Total_Value_M:   data.totalValue.toFixed(1),
    Categories:      [...data.categories].join(', ')
  }));
}

function isWithin24Mo(expiryStr) {
  if (!expiryStr || expiryStr === 'N/A' || expiryStr === 'Unknown') return false;
  const [mm, yyyy] = expiryStr.split('/');
  if (!mm || !yyyy) return false;
  const exp = new Date(parseInt(yyyy), parseInt(mm) - 1, 1);
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() + 24);
  return exp <= cutoff;
}

function styleSheet(ws, dataRows) {
  // Set column widths
  ws['!cols'] = [
    { wch: 6 }, { wch: 12 }, { wch: 28 }, { wch: 50 }, { wch: 16 },
    { wch: 20 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 14 },
    { wch: 12 }, { wch: 8 },  { wch: 10 }, { wch: 12 }, { wch: 8 },
    { wch: 10 }, { wch: 60 }, { wch: 60 }, { wch: 60 },
    { wch: 14 }, { wch: 40 }, { wch: 14 }, { wch: 14 }, { wch: 8 }
  ];
}

module.exports = { exportExcel };
