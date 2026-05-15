'use strict';

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'opportunities.json');

// Built-in scan-time exclusion phrases (PROMPTJH v5.5, Section 6.3)
const BUILT_IN_PHRASES = [
  'managed care organization', 'mco contract', 'provider rate',
  'pharmacy benefit', 'drug rebate', 'beneficiary advisory',
  'advisory committee', 'public notice', 'public meeting',
  'waiver amendment', 'state plan amendment', 'annual report',
  'provider manual', 'member handbook', 'applying for medicaid',
  'news release', 'press release', 'request for applications',
  'notice of funding', 'grant funding', 'cooperative agreement',
  'elevator maintenance', 'janitorial', 'grounds maintenance',
  'food service', 'linen service',
  'medical physicist', 'physician services', 'nursing services',
  'dental services', 'clinical staffing', 'locum tenens',
  'tractor tire', 'dry ice', 'waste tire',
];

const DEFAULT_STATE = {
  opportunities: [],
  last_scan: null,
  confirmed_unchanged: [],
  prompt_improvement_flags: [],
  exclusions: []
};

let _state = null;

function _seedBuiltIns(state) {
  const existing = state.exclusions || [];
  const hasBuiltIns = existing.some(e => e.built_in);
  if (!hasBuiltIns) {
    const builtIns = BUILT_IN_PHRASES.map(phrase => ({
      phrase,
      built_in: true,
      added_at: new Date().toISOString()
    }));
    state.exclusions = [...builtIns, ...existing];
  }
  return state;
}

function init() {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    _state = _seedBuiltIns({ ...DEFAULT_STATE });
    fs.writeFileSync(DATA_FILE, JSON.stringify(_state, null, 2));
    console.log('[store] Initialized fresh data store with built-in exclusions.');
  } else {
    try {
      _state = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      _state = _seedBuiltIns(_state);
      _save();
      console.log(`[store] Loaded ${(_state.opportunities || []).length} opportunities from disk.`);
    } catch (e) {
      console.warn('[store] Corrupt data file — resetting.', e.message);
      _state = _seedBuiltIns({ ...DEFAULT_STATE });
      _save();
    }
  }
}

function getState() {
  if (!_state) {
    if (fs.existsSync(DATA_FILE)) {
      try {
        _state = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        _state = _seedBuiltIns(_state);
      } catch (_) { _state = _seedBuiltIns({ ...DEFAULT_STATE }); }
    } else {
      _state = _seedBuiltIns({ ...DEFAULT_STATE });
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
  const today = new Date().toISOString().slice(0, 10);
  const filtered = log.filter(e => !(e.source === entry.source && (e.scan_timestamp || '').startsWith(today)));
  filtered.push({ ...entry, scan_timestamp: new Date().toISOString() });
  setState({ confirmed_unchanged: filtered });
}

module.exports = { init, getState, setState, addFlag, addUnchanged, BUILT_IN_PHRASES };
