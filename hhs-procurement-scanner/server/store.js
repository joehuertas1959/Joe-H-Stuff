'use strict';

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'opportunities.json');

const DEFAULT_STATE = {
  opportunities: [],
  last_scan: null,
  confirmed_unchanged: [],
  prompt_improvement_flags: []
};

let _state = null;

function init() {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_STATE, null, 2));
    console.log('[store] Initialized fresh data store.');
  } else {
    try {
      _state = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      console.log(`[store] Loaded ${(_state.opportunities || []).length} opportunities from disk.`);
    } catch (e) {
      console.warn('[store] Corrupt data file — resetting.', e.message);
      _state = { ...DEFAULT_STATE };
      _save();
    }
  }
}

function getState() {
  if (!_state) {
    if (fs.existsSync(DATA_FILE)) {
      try { _state = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
      catch (_) { _state = { ...DEFAULT_STATE }; }
    } else {
      _state = { ...DEFAULT_STATE };
    }
  }
  return _state;
}

function setState(updates) {
  _state = { ...getState(), ...updates };
  _save();
}

function _save() {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(_state, null, 2));
}

function addFlag(flag) {
  const s = getState();
  const flags = s.prompt_improvement_flags || [];
  flags.push({ ...flag, recorded_at: new Date().toISOString() });
  setState({ prompt_improvement_flags: flags });
}

function addUnchanged(entry) {
  const s = getState();
  const log = s.confirmed_unchanged || [];
  // Replace if same source recorded today
  const today = new Date().toISOString().slice(0, 10);
  const filtered = log.filter(e => !(e.source === entry.source && (e.scan_timestamp || '').startsWith(today)));
  filtered.push({ ...entry, scan_timestamp: new Date().toISOString() });
  setState({ confirmed_unchanged: filtered });
}

module.exports = { init, getState, setState, addFlag, addUnchanged };
