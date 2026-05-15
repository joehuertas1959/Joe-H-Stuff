'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const store = require('./server/store');
const { runScan } = require('./server/scrapers/index');
const { exportExcel } = require('./server/exporters/excel');
const { exportMarkdown } = require('./server/exporters/markdown');
const { scoreBidOpportunity } = require('./server/ai-scorer');
const { exportAsXFactJson, pushToXFact } = require('./server/xfact-integration');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Scan state ──────────────────────────────────────────────────────────────
let scanInProgress = false;
let scanLog = [];

function logScan(msg) {
  const entry = { ts: new Date().toISOString(), msg };
  scanLog.push(entry);
  if (scanLog.length > 200) scanLog = scanLog.slice(-200);
  console.log(`[SCAN] ${entry.ts} — ${msg}`);
}

// ── Routes ───────────────────────────────────────────────────────────────────

// GET /api/status
app.get('/api/status', (req, res) => {
  const state = store.getState();
  res.json({
    scanInProgress,
    lastScan: state.last_scan || null,
    opportunityCount: (state.opportunities || []).length,
    version: '4.0'
  });
});

// GET /api/opportunities
app.get('/api/opportunities', (req, res) => {
  const state = store.getState();
  let opps = state.opportunities || [];
  const exclusions = (state.exclusions || []).map(e => e.phrase.toLowerCase());

  // Apply title exclusion filter
  if (exclusions.length > 0) {
    opps = opps.filter(o => {
      const title = (o.opportunity_title || '').toLowerCase();
      return !exclusions.some(phrase => title.includes(phrase));
    });
  }

  const { state: stateFilter, category, urgency, win_probability, status, q } = req.query;
  if (stateFilter) opps = opps.filter(o => o.state === stateFilter.toUpperCase());
  if (category)    opps = opps.filter(o => (o.category || '').includes(category));
  if (urgency)     opps = opps.filter(o => o.urgency === urgency.toUpperCase());
  if (win_probability) opps = opps.filter(o => o.win_probability === win_probability);
  if (status)      opps = opps.filter(o => o.status === status);
  if (q) {
    const lq = q.toLowerCase();
    opps = opps.filter(o =>
      (o.opportunity_title || '').toLowerCase().includes(lq) ||
      (o.agency || '').toLowerCase().includes(lq) ||
      (o.notes || '').toLowerCase().includes(lq)
    );
  }

  res.json({ total: opps.length, opportunities: opps });
});

// GET /api/exclusions
app.get('/api/exclusions', (req, res) => {
  const state = store.getState();
  res.json({ exclusions: state.exclusions || [] });
});

// POST /api/exclusions — body: { phrase: "..." }
app.post('/api/exclusions', (req, res) => {
  const phrase = (req.body.phrase || '').trim();
  if (!phrase) return res.status(400).json({ error: 'phrase is required' });
  const state = store.getState();
  const exclusions = state.exclusions || [];
  if (exclusions.some(e => e.phrase.toLowerCase() === phrase.toLowerCase())) {
    return res.status(409).json({ error: 'Phrase already in exclusion list' });
  }
  exclusions.push({ phrase, added_at: new Date().toISOString() });
  store.setState({ exclusions });
  res.json({ added: true, phrase, total: exclusions.length });
});

// DELETE /api/exclusions — body: { phrase: "..." }
app.delete('/api/exclusions', (req, res) => {
  const phrase = (req.body.phrase || '').trim();
  if (!phrase) return res.status(400).json({ error: 'phrase is required' });
  const state = store.getState();
  const before = (state.exclusions || []).length;
  const exclusions = (state.exclusions || []).filter(
    e => e.phrase.toLowerCase() !== phrase.toLowerCase()
  );
  if (exclusions.length === before) return res.status(404).json({ error: 'Phrase not found' });
  store.setState({ exclusions });
  res.json({ removed: true, phrase, total: exclusions.length });
});

// GET /api/pipeline-summary
app.get('/api/pipeline-summary', (req, res) => {
  const state = store.getState();
  const opps = state.opportunities || [];

  const sum = (arr, key) => arr.reduce((t, o) => t + (parseFloat(o[key]) || 0), 0);
  const groupBy = (arr, key) => {
    const groups = {};
    arr.forEach(o => {
      const k = o[key] || 'Unknown';
      if (!groups[k]) groups[k] = { count: 0, total_value: 0 };
      groups[k].count++;
      groups[k].total_value += parseFloat(o.est_value_m) || 0;
    });
    return groups;
  };

  res.json({
    total_pipeline_value: Math.round(sum(opps, 'est_value_m') * 10) / 10,
    total_count: opps.length,
    by_category: groupBy(opps, 'category'),
    by_state: groupBy(opps, 'state'),
    by_urgency: groupBy(opps, 'urgency'),
    by_win_probability: groupBy(opps, 'win_probability'),
    by_status: groupBy(opps, 'status'),
    apd_confirmed: opps.filter(o => o.apd_status === 'Approved').length,
    near_term_recompetes: opps.filter(o => {
      if (!o.incumbent_expiry || o.incumbent_expiry === 'N/A' || o.incumbent_expiry === 'Unknown') return false;
      const [mm, yyyy] = o.incumbent_expiry.split('/');
      if (!mm || !yyyy) return false;
      const exp = new Date(parseInt(yyyy), parseInt(mm) - 1, 1);
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() + 24);
      return exp <= cutoff;
    }).length,
    last_scan: state.last_scan || null
  });
});

// GET /api/scan-log
app.get('/api/scan-log', (req, res) => {
  res.json({ log: scanLog.slice(-50) });
});

// GET /api/state-priorities
app.get('/api/state-priorities', (req, res) => {
  const { STATE_HR1_SCORES, STATE_REGIONS } = require('./server/scrapers/reference-data');
  res.json({ states: STATE_HR1_SCORES, regions: STATE_REGIONS });
});

// POST /api/scan
app.post('/api/scan', async (req, res) => {
  if (scanInProgress) {
    return res.status(409).json({ error: 'Scan already in progress' });
  }

  const { tier = 'all', sam_api_key } = req.body;
  scanInProgress = true;
  scanLog = [];
  logScan(`Starting ${tier === 'all' ? 'full' : `Tier ${tier}`} scan — PROMPTJH-SCAN v4.0`);

  // Respond immediately; scan runs async
  res.json({ started: true, tier });

  try {
    const results = await runScan({ tier, sam_api_key, logger: logScan });
    const state = store.getState();
    const existing = state.opportunities || [];

    // Merge: update existing by id, append new
    const existingMap = {};
    existing.forEach(o => { existingMap[o.id] = o; });
    results.forEach(o => { existingMap[o.id] = o; });
    const merged = Object.values(existingMap);
    merged.sort((a, b) => {
      const urgencyOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, WATCH: 4 };
      return (urgencyOrder[a.urgency] ?? 5) - (urgencyOrder[b.urgency] ?? 5);
    });

    store.setState({
      opportunities: merged,
      last_scan: {
        timestamp: new Date().toISOString(),
        tier,
        new_found: results.length,
        sources_checked: [...new Set(results.map(r => r.source))]
      }
    });

    logScan(`Scan complete — ${results.length} opportunities found/updated. Total in store: ${merged.length}`);
  } catch (err) {
    logScan(`Scan error: ${err.message}`);
    console.error(err);
  } finally {
    scanInProgress = false;
  }
});

// GET /api/export/excel
app.get('/api/export/excel', (req, res) => {
  const state = store.getState();
  try {
    const buf = exportExcel(state);
    const date = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="HHS_IT_Procurement_Opportunities_Full_Scan_${date}.xlsx"`);
    res.send(buf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/export/markdown
app.get('/api/export/markdown', (req, res) => {
  const state = store.getState();
  try {
    const md = exportMarkdown(state);
    const date = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="HHS_Procurement_Daily_Roundup_${date}.md"`);
    res.send(md);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/opportunities/:id/score — AI bid score for a single opportunity
app.post('/api/opportunities/:id/score', async (req, res) => {
  const state = store.getState();
  const opp = (state.opportunities || []).find(o => o.id === req.params.id);
  if (!opp) return res.status(404).json({ error: 'Opportunity not found' });

  const apiKey = req.body.anthropic_api_key || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(400).json({ error: 'ANTHROPIC_API_KEY not set' });

  try {
    const result = await scoreBidOpportunity(opp, { logger: logScan, apiKey });
    // Persist score back onto the opportunity
    const updated = (state.opportunities || []).map(o =>
      o.id === req.params.id
        ? { ...o, bid_score: result.score, bid_score_data: result }
        : o
    );
    store.setState({ opportunities: updated });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/score/batch — score up to 10 unscored opportunities (async-friendly)
app.post('/api/score/batch', async (req, res) => {
  const state = store.getState();
  const apiKey = req.body.anthropic_api_key || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(400).json({ error: 'ANTHROPIC_API_KEY not set' });

  const unscored = (state.opportunities || [])
    .filter(o => o.bid_score == null)
    .slice(0, 10);

  if (unscored.length === 0) return res.json({ scored: 0, message: 'All opportunities already scored' });

  res.json({ started: true, count: unscored.length });

  // Run scoring async after responding
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  for (const opp of unscored) {
    try {
      const result = await scoreBidOpportunity(opp, { logger: logScan, apiKey });
      const current = store.getState();
      const updated = (current.opportunities || []).map(o =>
        o.id === opp.id ? { ...o, bid_score: result.score, bid_score_data: result } : o
      );
      store.setState({ opportunities: updated });
    } catch (err) {
      logScan(`Batch score error for ${opp.id}: ${err.message}`);
    }
    await sleep(1000);
  }
  logScan(`Batch scoring complete — ${unscored.length} opportunities scored`);
});

// GET /api/export/xfact — export all opportunities as xFact JSON schema
app.get('/api/export/xfact', (req, res) => {
  const state = store.getState();
  const opps = state.opportunities || [];
  const date = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="xfact_opportunities_${date}.json"`);
  res.json(exportAsXFactJson(opps));
});

// POST /api/xfact/push/:id — push a single opportunity to a live xFact instance
app.post('/api/xfact/push/:id', async (req, res) => {
  const state = store.getState();
  const opp = (state.opportunities || []).find(o => o.id === req.params.id);
  if (!opp) return res.status(404).json({ error: 'Opportunity not found' });

  const { xfact_api_url } = req.body;
  if (!xfact_api_url) return res.status(400).json({ error: 'xfact_api_url required in request body' });

  try {
    const result = await pushToXFact(opp, xfact_api_url);
    res.json({ pushed: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/opportunities (clear all)
app.delete('/api/opportunities', (req, res) => {
  store.setState({ opportunities: [], last_scan: null });
  res.json({ cleared: true });
});

// Catch-all → index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`HHS Procurement Scanner v4.0 running on http://localhost:${PORT}`);
  store.init();
});
