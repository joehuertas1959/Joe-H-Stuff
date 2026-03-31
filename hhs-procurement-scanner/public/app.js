'use strict';

// ── State ────────────────────────────────────────────────────────────────────
let allOpps = [];
let filteredOpps = [];
let sortCol = 'urgency';
let sortDir = 1;
let logPollInterval = null;

const URGENCY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, WATCH: 4 };
const WIN_ORDER     = { High: 0, Medium: 1, Low: 2, 'Long Shot': 3 };

// ── Init ─────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  updateCountdown();
  loadStatus();
  setInterval(updateCountdown, 3600000); // refresh countdown hourly
});

// ── H.R. 1 Countdown ─────────────────────────────────────────────────────────
function updateCountdown() {
  const days = Math.ceil((new Date('2027-01-01') - new Date()) / 86400000);
  const el = document.getElementById('hr1Countdown');
  if (el) el.textContent = `${days} days`;
}

// ── Load status & opportunities ──────────────────────────────────────────────
async function loadStatus() {
  try {
    const [statusRes, oppsRes, summaryRes] = await Promise.all([
      fetch('/api/status'),
      fetch('/api/opportunities'),
      fetch('/api/pipeline-summary')
    ]);
    const status  = await statusRes.json();
    const oppsData = await oppsRes.json();
    const summary = await summaryRes.json();

    allOpps = oppsData.opportunities || [];
    filteredOpps = [...allOpps];

    updateKPIs(summary);
    updateLastScanInfo(status);
    populateStateFilter(allOpps);
    renderTable();

    if (status.scanInProgress) {
      startLogPolling();
    }
  } catch (err) {
    console.error('Load status error:', err);
  }
}

// ── KPI Bar ───────────────────────────────────────────────────────────────────
function updateKPIs(summary) {
  setText('kpiTotal',    summary.total_count ?? '—');
  setText('kpiValue',    `$${summary.total_pipeline_value ?? '—'}M`);
  const critHigh = (summary.by_urgency?.CRITICAL?.count || 0) + (summary.by_urgency?.HIGH?.count || 0);
  setText('kpiCritical', critHigh);
  setText('kpiHighWin',  summary.by_win_probability?.High?.count ?? '—');
  setText('kpiAPD',      summary.apd_confirmed ?? '—');
  setText('kpiRecompete', summary.near_term_recompetes ?? '—');
}

function updateLastScanInfo(status) {
  const el = document.getElementById('lastScanInfo');
  if (!el) return;
  if (!status.lastScan) {
    el.innerHTML = '<div class="no-scan">No scan run yet.</div>';
    return;
  }
  const ts = new Date(status.lastScan.timestamp).toLocaleString();
  const sources = (status.lastScan.sources_checked || []).join(', ');
  el.innerHTML = `<div class="last-scan-box">
    <div class="last-scan-ts">Last scan: ${ts}</div>
    <div class="last-scan-src">Sources: ${sources || 'N/A'}</div>
    <div class="last-scan-count">${status.lastScan.new_found || 0} new/updated</div>
  </div>`;
}

// ── Scan ──────────────────────────────────────────────────────────────────────
async function runScan(tier) {
  const apiKey = document.getElementById('samApiKey').value.trim() || 'DEMO_KEY';
  setScanInProgress(true);
  clearLogDisplay();
  appendLog(`Starting ${tier === 'all' ? 'full' : 'Tier ' + tier} scan…`);

  try {
    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier, sam_api_key: apiKey })
    });
    const data = await res.json();
    if (data.error) {
      appendLog(`Error: ${data.error}`);
      setScanInProgress(false);
      return;
    }
    startLogPolling();
    pollUntilDone();
  } catch (err) {
    appendLog(`Scan request failed: ${err.message}`);
    setScanInProgress(false);
  }
}

function pollUntilDone() {
  const interval = setInterval(async () => {
    try {
      const res = await fetch('/api/status');
      const status = await res.json();
      if (!status.scanInProgress) {
        clearInterval(interval);
        setScanInProgress(false);
        stopLogPolling();
        appendLog('✅ Scan complete. Refreshing data…');
        await loadStatus();
      }
    } catch (_) {}
  }, 2000);
}

function startLogPolling() {
  if (logPollInterval) return;
  logPollInterval = setInterval(async () => {
    try {
      const res = await fetch('/api/scan-log');
      const data = await res.json();
      renderLog(data.log || []);
    } catch (_) {}
  }, 1500);
}

function stopLogPolling() {
  if (logPollInterval) {
    clearInterval(logPollInterval);
    logPollInterval = null;
  }
}

function setScanInProgress(inProgress) {
  const statusEl = document.getElementById('scanStatus');
  const btnAll = document.getElementById('btnScanAll');
  const tierBtns = document.querySelectorAll('.btn-tier');

  if (inProgress) {
    statusEl.classList.remove('hidden');
    btnAll.disabled = true;
    tierBtns.forEach(b => b.disabled = true);
  } else {
    statusEl.classList.add('hidden');
    btnAll.disabled = false;
    tierBtns.forEach(b => b.disabled = false);
  }
}

// ── Log Display ───────────────────────────────────────────────────────────────
function renderLog(entries) {
  const el = document.getElementById('scanLog');
  if (!el) return;
  if (!entries.length) return;
  el.innerHTML = entries.map(e =>
    `<div class="log-line">[${e.ts?.slice(11,19) || ''}] ${escHtml(e.msg)}</div>`
  ).join('');
  el.scrollTop = el.scrollHeight;
}

function appendLog(msg) {
  const el = document.getElementById('scanLog');
  if (!el) return;
  const emptyEl = el.querySelector('.log-empty');
  if (emptyEl) emptyEl.remove();
  const line = document.createElement('div');
  line.className = 'log-line';
  line.textContent = `[${new Date().toTimeString().slice(0,8)}] ${msg}`;
  el.appendChild(line);
  el.scrollTop = el.scrollHeight;
}

function clearLogDisplay() {
  const el = document.getElementById('scanLog');
  if (el) el.innerHTML = '';
}

// ── Table ─────────────────────────────────────────────────────────────────────
function renderTable() {
  const tbody = document.getElementById('oppsTableBody');
  if (!tbody) return;

  if (filteredOpps.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="11">${
      allOpps.length === 0
        ? 'No opportunities loaded. Run a scan to begin.'
        : 'No results match the current filters.'
    }</td></tr>`;
    document.getElementById('resultsMeta').textContent =
      allOpps.length === 0 ? 'Run a scan to discover procurement opportunities.' : '0 results';
    return;
  }

  // Sort
  const sorted = [...filteredOpps].sort((a, b) => {
    let av = a[sortCol], bv = b[sortCol];
    if (sortCol === 'urgency') { av = URGENCY_ORDER[av] ?? 9; bv = URGENCY_ORDER[bv] ?? 9; }
    else if (sortCol === 'win_probability') { av = WIN_ORDER[av] ?? 9; bv = WIN_ORDER[bv] ?? 9; }
    else if (sortCol === 'est_value_m') { av = parseFloat(av) || 0; bv = parseFloat(bv) || 0; }
    if (av < bv) return -sortDir;
    if (av > bv) return sortDir;
    return 0;
  });

  tbody.innerHTML = sorted.map(opp => buildRow(opp)).join('');

  const meta = document.getElementById('resultsMeta');
  if (meta) {
    meta.textContent = `${filteredOpps.length} of ${allOpps.length} opportunities | Est. Value: $${
      filteredOpps.reduce((t, o) => t + (parseFloat(o.est_value_m) || 0), 0).toFixed(1)
    }M`;
  }
}

function buildRow(opp) {
  const urgClass = `urg-${(opp.urgency || 'watch').toLowerCase()}`;
  const winClass = `win-${(opp.win_probability || '').toLowerCase().replace(' ', '-')}`;
  const title = escHtml(opp.opportunity_title || 'Untitled');
  const agency = escHtml(opp.agency || '');

  const docLink = opp.document_url && !opp.document_url.startsWith('NOT_FOUND')
    ? `<a href="${escAttr(opp.document_url)}" target="_blank" class="link-doc" title="Document">📄</a>`
    : `<span class="link-notfound" title="${escAttr(opp.document_url || '')}">❌</span>`;

  const portalLink = opp.portal_url
    ? `<a href="${escAttr(opp.portal_url)}" target="_blank" class="link-portal" title="Portal">🌐</a>`
    : '';

  return `<tr class="opp-row" onclick="showDetail('${opp.id}')">
    <td class="col-state"><span class="state-badge">${escHtml(opp.state || '?')}</span></td>
    <td class="col-title">
      <div class="opp-title">${title}</div>
      <div class="opp-agency">${agency}</div>
      <div class="opp-rfp">${escHtml(opp.rfp_rfi_number || '')}</div>
    </td>
    <td class="col-cat"><span class="cat-badge">${escHtml(opp.category || '')}</span></td>
    <td class="col-urg"><span class="urgency-badge ${urgClass}">${escHtml(opp.urgency || '')}</span></td>
    <td class="col-win"><span class="win-badge ${winClass}">${escHtml(opp.win_probability || '')}</span></td>
    <td class="col-val">${opp.est_value_m ? `$${opp.est_value_m}M` : '?'}</td>
    <td class="col-due">${escHtml(opp.due_date || 'TBD')}<br><span class="days-rem">${
      typeof opp.days_remaining === 'number' ? `${opp.days_remaining}d` : opp.days_remaining || ''
    }</span></td>
    <td class="col-status"><span class="status-badge">${escHtml(opp.status || '')}</span></td>
    <td class="col-apd"><span class="apd-badge apd-${(opp.apd_status||'').toLowerCase().replace(/\s/g,'-')}">${escHtml(opp.apd_status || '?')}</span></td>
    <td class="col-hr1"><span class="hr1-score hr1-${opp.hr1_readiness_score}">${opp.hr1_readiness_score || '?'}</span></td>
    <td class="col-links">${docLink} ${portalLink}</td>
  </tr>`;
}

// ── Detail Panel ──────────────────────────────────────────────────────────────
function showDetail(id) {
  const opp = allOpps.find(o => o.id === id);
  if (!opp) return;

  const panel = document.getElementById('detailPanel');
  const content = document.getElementById('detailContent');

  const docHtml = opp.document_url && !opp.document_url.startsWith('NOT_FOUND')
    ? `<a href="${escAttr(opp.document_url)}" target="_blank">${escHtml(opp.document_url)}</a>`
    : `<span class="not-found">${escHtml(opp.document_url || 'NOT_FOUND')}</span>`;

  const portalHtml = opp.portal_url
    ? `<a href="${escAttr(opp.portal_url)}" target="_blank">${escHtml(opp.portal_url)}</a>`
    : 'N/A';

  content.innerHTML = `
    <div class="detail-header">
      <span class="state-badge lg">${escHtml(opp.state || '?')}</span>
      <h2>${escHtml(opp.opportunity_title || 'Untitled')}</h2>
    </div>
    <div class="detail-badges">
      <span class="urgency-badge urg-${(opp.urgency||'watch').toLowerCase()}">${escHtml(opp.urgency||'')}</span>
      <span class="win-badge win-${(opp.win_probability||'').toLowerCase().replace(' ','-')}">${escHtml(opp.win_probability||'')}</span>
      <span class="cat-badge">${escHtml(opp.category||'')}</span>
      <span class="apd-badge apd-${(opp.apd_status||'').toLowerCase().replace(/\s/g,'-')}">${escHtml(opp.apd_status||'?')}</span>
    </div>
    <div class="detail-grid">
      <div class="dg-row"><span class="dg-label">Agency</span><span>${escHtml(opp.agency||'')}</span></div>
      <div class="dg-row"><span class="dg-label">RFP/RFI #</span><span>${escHtml(opp.rfp_rfi_number||'')}</span></div>
      <div class="dg-row"><span class="dg-label">Program</span><span>${escHtml(opp.program||'')}</span></div>
      <div class="dg-row"><span class="dg-label">IT Type</span><span>${escHtml(opp.it_type||'')}</span></div>
      <div class="dg-row"><span class="dg-label">Status</span><span>${escHtml(opp.status||'')}</span></div>
      <div class="dg-row"><span class="dg-label">Published</span><span>${escHtml(opp.published_date||'')}</span></div>
      <div class="dg-row"><span class="dg-label">Due Date</span><span>${escHtml(opp.due_date||'TBD')}</span></div>
      <div class="dg-row"><span class="dg-label">Days Remaining</span><span>${escHtml(String(opp.days_remaining||'TBD'))}</span></div>
      <div class="dg-row"><span class="dg-label">Est. Value</span><span>$${opp.est_value_m||'?'}M</span></div>
      <div class="dg-row"><span class="dg-label">FMAP</span><span>${escHtml(opp.fmap||'N/A')}</span></div>
      <div class="dg-row"><span class="dg-label">H.R. 1 Score</span><span>${opp.hr1_readiness_score||'?'} / 5</span></div>
      <div class="dg-row"><span class="dg-label">Incumbent Expiry</span><span>${escHtml(opp.incumbent_expiry||'Unknown')}</span></div>
      <div class="dg-row"><span class="dg-label">Source</span><span>${escHtml(opp.source||'')} (Tier ${opp.source_tier||'?'})</span></div>
    </div>
    <div class="detail-section">
      <div class="dg-label">Document URL</div>
      <div>${docHtml}</div>
    </div>
    <div class="detail-section">
      <div class="dg-label">Portal URL</div>
      <div>${portalHtml}</div>
    </div>
    <div class="detail-section">
      <div class="dg-label">Competitive Context</div>
      <div>${escHtml(opp.competitive_context||'N/A')}</div>
    </div>
    <div class="detail-section">
      <div class="dg-label">Notes</div>
      <div class="notes-text">${escHtml(opp.notes||'')}</div>
    </div>
    <div class="detail-section">
      <div class="dg-label">Scraped At</div>
      <div>${escHtml(opp.scraped_at||'')}</div>
    </div>
  `;

  panel.classList.remove('hidden');
  panel.scrollIntoView({ behavior: 'smooth' });
}

function closeDetail() {
  document.getElementById('detailPanel').classList.add('hidden');
}

// ── Filters ───────────────────────────────────────────────────────────────────
function applyFilters() {
  const state   = document.getElementById('filterState').value;
  const cat     = document.getElementById('filterCategory').value;
  const urgency = document.getElementById('filterUrgency').value;
  const win     = document.getElementById('filterWin').value;
  const q       = document.getElementById('filterSearch').value.toLowerCase();

  filteredOpps = allOpps.filter(o => {
    if (state   && o.state !== state)                                  return false;
    if (cat     && !(o.category || '').includes(cat))                  return false;
    if (urgency && o.urgency !== urgency)                              return false;
    if (win     && o.win_probability !== win)                          return false;
    if (q && !(
      (o.opportunity_title || '').toLowerCase().includes(q) ||
      (o.agency || '').toLowerCase().includes(q) ||
      (o.notes || '').toLowerCase().includes(q) ||
      (o.rfp_rfi_number || '').toLowerCase().includes(q)
    )) return false;
    return true;
  });

  renderTable();
}

function clearFilters() {
  document.getElementById('filterState').value = '';
  document.getElementById('filterCategory').value = '';
  document.getElementById('filterUrgency').value = '';
  document.getElementById('filterWin').value = '';
  document.getElementById('filterSearch').value = '';
  filteredOpps = [...allOpps];
  renderTable();
}

function populateStateFilter(opps) {
  const sel = document.getElementById('filterState');
  const current = sel.value;
  const states = [...new Set(opps.map(o => o.state).filter(Boolean))].sort();
  sel.innerHTML = '<option value="">All States</option>' +
    states.map(s => `<option value="${s}">${s}</option>`).join('');
  sel.value = current;
}

// ── Sorting ───────────────────────────────────────────────────────────────────
function sortBy(col) {
  if (sortCol === col) sortDir *= -1;
  else { sortCol = col; sortDir = 1; }
  renderTable();
}

// ── Exports ───────────────────────────────────────────────────────────────────
function downloadExcel() {
  window.location.href = '/api/export/excel';
}

function downloadMarkdown() {
  window.location.href = '/api/export/markdown';
}

async function clearData() {
  if (!confirm('Clear all opportunity data? This cannot be undone.')) return;
  await fetch('/api/opportunities', { method: 'DELETE' });
  allOpps = [];
  filteredOpps = [];
  renderTable();
  updateKPIs({});
  document.getElementById('lastScanInfo').innerHTML = '';
  document.getElementById('scanLog').innerHTML = '<div class="log-empty">Run a scan to see live log output.</div>';
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escAttr(s) {
  return String(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
