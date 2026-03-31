'use strict';

// ── H.R. 1 Readiness Scores (PROMPTJH v4.0, Section 4.2) ───────────────────
const STATE_HR1_SCORES = {
  TN: { score: 2, expansion: false, systemVintage: 'Aging/mixed',   keyFactor: 'Active Deloitte litigation; documented failures',         bdPriority: 'HIGH' },
  CO: { score: 2, expansion: true,  systemVintage: 'Modernizing',   keyFactor: 'Deloitte audit findings; active DDI',                     bdPriority: 'HIGH' },
  PA: { score: 2, expansion: true,  systemVintage: 'Legacy mixed',  keyFactor: '9,269 children coverage error; scrutiny',                 bdPriority: 'HIGH' },
  KY: { score: 1, expansion: true,  systemVintage: 'Legacy',        keyFactor: '50K-case backlog; 600 defects at launch',                bdPriority: 'HIGHEST' },
  RI: { score: 1, expansion: true,  systemVintage: 'Legacy',        keyFactor: 'Class-action suits; systemic failures',                  bdPriority: 'HIGHEST' },
  FL: { score: 3, expansion: false, systemVintage: 'Mixed',         keyFactor: 'Gainwell performance concerns; large ABAWD pop.',        bdPriority: 'HIGH' },
  AR: { score: 3, expansion: false, systemVintage: 'Modernizing',   keyFactor: 'Active Deloitte contract; CE module needed',             bdPriority: 'MEDIUM' },
  GA: { score: 3, expansion: true,  systemVintage: 'Modernizing',   keyFactor: 'Large expansion; active Deloitte contract',              bdPriority: 'MEDIUM' },
  NE: { score: 4, expansion: false, systemVintage: 'Modern',        keyFactor: 'Optum incumbent; limited complexity',                    bdPriority: 'LOW' },
  NV: { score: 3, expansion: true,  systemVintage: 'Mixed',         keyFactor: 'Active NEVADAePro procurements',                        bdPriority: 'HIGH' },
  VA: { score: 3, expansion: true,  systemVintage: 'Modernizing',   keyFactor: 'DMAS active procurement calendar',                      bdPriority: 'HIGH' },
  HI: { score: 4, expansion: true,  systemVintage: 'Modern',        keyFactor: 'Med-QUEST well-run; limited complexity',                bdPriority: 'LOW' },
  OK: { score: 3, expansion: false, systemVintage: 'Legacy mixed',  keyFactor: 'OHCA active procurements; ABAWD population',            bdPriority: 'HIGH' },
  IA: { score: 3, expansion: false, systemVintage: 'Legacy',        keyFactor: 'DataTables portal; active SNAP activity',               bdPriority: 'MEDIUM' },
  IL: { score: 3, expansion: true,  systemVintage: 'Modernizing',   keyFactor: 'HFS active; Maximus $76.8M contract',                   bdPriority: 'MEDIUM' },
  MT: { score: 3, expansion: true,  systemVintage: 'Mixed',         keyFactor: 'Medicaid expansion; procurement activity',              bdPriority: 'MEDIUM' },
  WI: { score: 3, expansion: false, systemVintage: 'Mixed',         keyFactor: 'Non-expansion; legacy MMIS',                           bdPriority: 'MEDIUM' },
  TX: { score: 2, expansion: false, systemVintage: 'Legacy mixed',  keyFactor: 'Large ABAWD pop.; non-expansion; Accenture incumbent',  bdPriority: 'HIGH' },
  NY: { score: 4, expansion: true,  systemVintage: 'Modern',        keyFactor: 'eMedNY; large but well-funded',                        bdPriority: 'LOW' },
  CA: { score: 4, expansion: true,  systemVintage: 'Modernizing',   keyFactor: 'CARES active DDI; large vendor relationships',         bdPriority: 'LOW' }
};

// Default score for unlisted states
const DEFAULT_HR1_SCORE = 3;

function getHR1Score(stateCode) {
  return STATE_HR1_SCORES[stateCode] || { score: DEFAULT_HR1_SCORE, expansion: null, bdPriority: 'MEDIUM' };
}

// ── State regions ────────────────────────────────────────────────────────────
const STATE_REGIONS = {
  ME:'Northeast', NH:'Northeast', VT:'Northeast', MA:'Northeast', RI:'Northeast',
  CT:'Northeast', NY:'Northeast', NJ:'Northeast', PA:'Northeast',
  MD:'Southeast', DE:'Southeast', VA:'Southeast', WV:'Southeast', NC:'Southeast',
  SC:'Southeast', GA:'Southeast', FL:'Southeast', TN:'Southeast', KY:'Southeast',
  AL:'Southeast', MS:'Southeast',
  AR:'South', LA:'South', TX:'South', OK:'South',
  OH:'Midwest', IN:'Midwest', IL:'Midwest', MI:'Midwest', WI:'Midwest',
  MN:'Midwest', IA:'Midwest', MO:'Midwest', ND:'Midwest', SD:'Midwest',
  NE:'Midwest', KS:'Midwest',
  MT:'West', WY:'West', CO:'West', NM:'West', AZ:'West', UT:'West',
  ID:'West', NV:'West', CA:'West', OR:'West', WA:'West', AK:'West', HI:'West'
};

function getRegion(stateCode) {
  return STATE_REGIONS[stateCode] || 'Unknown';
}

// ── FMAP rates (approximate 2026) ────────────────────────────────────────────
const STATE_FMAP = {
  MS:77.08, WV:75.93, AL:73.89, AR:70.52, NM:70.14, KY:69.56, MT:66.28,
  SD:66.01, ID:65.87, OK:65.55, LA:64.47, IA:59.71, TN:65.08, SC:70.42,
  MO:63.71, AZ:68.42, TX:62.41, GA:66.64, NC:66.37, FL:58.28, WY:50.00,
  CO:50.00, VA:50.00, NJ:50.00, CT:50.00, MD:50.00, MA:50.00, NY:50.00,
  CA:50.00, IL:50.00, WI:59.37, OH:62.57, PA:54.55, MI:65.38, MN:50.00,
  NV:58.67, HI:56.72, OR:63.79, WA:50.00, ME:64.87, VT:55.50, RI:52.75,
  NH:50.00, DE:55.23, ND:50.00, NE:55.00, KS:57.35, IN:66.72, AK:50.00,
  UT:70.00
};

function getFMAP(stateCode) {
  return STATE_FMAP[stateCode] ? `${STATE_FMAP[stateCode]}%` : 'N/A';
}

// ── Category classification ──────────────────────────────────────────────────
const CATEGORY_PATTERNS = [
  // AUDIT
  { pattern: /IT\s*audit|audit\s*management|MARS-?E|NIST\s*800-?53|penetration\s*test|pen\s*test|FedRAMP|SOC\s*2|IV[&\/]V|HIPAA\s*security\s*risk/i,
    category: 'AUDIT-ITAudit', program: 'Medicaid', itType: 'Assessment' },
  // COOP
  { pattern: /continuity\s*of\s*operations|COOP|business\s*continuity|disaster\s*recovery|alternate\s*site|tabletop\s*exercise|business\s*impact\s*analysis|BIA\b|recovery\s*time\s*objective|RTO\b/i,
    category: 'COOP-BCM', program: 'COOP', itType: 'Assessment' },
  // ERM / GRC
  { pattern: /enterprise\s*risk\s*management|GRC\b|governance[\s,]*risk[\s,]*compliance|risk\s*register|third[\s-]party\s*risk|TPRM|policy\s*management|audit\s*management\s*software/i,
    category: 'ERM-GRC', program: 'ERM', itType: 'Assessment' },
  // Work Requirements / CE
  { pattern: /work\s*requirements?|community\s*engagement|CE\s*module|H\.?R\.?\s*1\b|ABAWD|able[- ]bodied/i,
    category: 'Work-Requirements', program: 'Medicaid', itType: 'DDI' },
  // MES Eligibility & Enrollment
  { pattern: /eligibility.*enrollment|enrollment.*eligibility|E&E\b|MES[-\s]E&E|MAGI|CMS-?0057|FHIR.*eligibility/i,
    category: 'MES-E&E', program: 'Medicaid', itType: 'DDI' },
  // MES FHIR / Interoperability
  { pattern: /FHIR|interoperability|API\s*gateway|CMS-?0057|HL7|Fast\s*Healthcare/i,
    category: 'MES-FHIR', program: 'Medicaid', itType: 'DDI' },
  // MES Claims
  { pattern: /claims?\s*processing|claims?\s*management|claims?\s*adjudicat/i,
    category: 'MES-Claims', program: 'Medicaid', itType: 'DDI' },
  // MES Provider
  { pattern: /provider\s*management|provider\s*enrollment|PECOS|provider\s*registry/i,
    category: 'MES-Provider', program: 'Medicaid', itType: 'DDI' },
  // MES BI / Analytics
  { pattern: /business\s*intelligence|analytics?\s*platform|data\s*warehouse|reporting\s*system/i,
    category: 'MES-BI', program: 'Medicaid', itType: 'Platform' },
  // MMIS
  { pattern: /MMIS|Medicaid\s*Management\s*Information/i,
    category: 'MMIS-Modernization', program: 'Medicaid', itType: 'DDI' },
  // MCO
  { pattern: /managed\s*care|MCO|DSNP|dual\s*eligible|encounter\s*data|capitation/i,
    category: 'MCO-Rebid', program: 'Medicaid', itType: 'Platform' },
  // CHIP
  { pattern: /CHIP\b|Children['']?s\s*Health\s*Insurance/i,
    category: 'CHIP', program: 'CHIP', itType: 'DDI' },
  // SNAP / EBT
  { pattern: /SNAP\b|EBT\b|food\s*stamps?|nutrition\s*assistance|electronic\s*benefits?\s*transfer/i,
    category: 'Work-Requirements', program: 'SNAP', itType: 'DDI' },
  // TANF
  { pattern: /TANF\b|temporary\s*assistance/i,
    category: 'MES-E&E', program: 'TANF', itType: 'DDI' },
  // IV-D / Child Support
  { pattern: /IV[-\s]D\b|child\s*support\s*enforcement/i,
    category: 'MES-Claims', program: 'IV-D', itType: 'DDI' },
  // Drug Rebate
  { pattern: /drug\s*rebate|pharmaceutical\s*rebate|MDRP/i,
    category: 'MES-DrugRebate', program: 'Medicaid', itType: 'DDI' },
  // APD-specific
  { pattern: /advance\s*planning\s*document|APD\b/i,
    category: 'APD-DDI', program: 'Medicaid', itType: 'DDI' },
  // Recompete
  { pattern: /recompet|contract\s*renewal|option\s*period|re-?bid/i,
    category: 'RECOMPETE-Expiring', program: 'Medicaid', itType: 'M&O' },
  // Generic Medicaid IT (fallback)
  { pattern: /Medicaid|HHS\s*IT|health\s*information\s*technology|health\s*IT/i,
    category: 'MES-E&E', program: 'Medicaid', itType: 'DDI' }
];

function classifyOpportunity(title = '', description = '') {
  const text = `${title} ${description}`;
  for (const p of CATEGORY_PATTERNS) {
    if (p.pattern.test(text)) {
      return { category: p.category, program: p.program, itType: p.itType };
    }
  }
  return { category: 'MES-E&E', program: 'Cross-Program', itType: 'Assessment' };
}

// ── Urgency calculation ──────────────────────────────────────────────────────
function calcUrgency(dueDateStr) {
  if (!dueDateStr || dueDateStr === 'TBD') return 'WATCH';
  const due = new Date(dueDateStr);
  if (isNaN(due.getTime())) return 'WATCH';
  const days = Math.ceil((due - new Date()) / 86400000);
  if (days <= 14)  return 'CRITICAL';
  if (days <= 30)  return 'HIGH';
  if (days <= 90)  return 'MEDIUM';
  if (days > 90)   return 'LOW';
  return 'WATCH';
}

function calcDaysRemaining(dueDateStr) {
  if (!dueDateStr || dueDateStr === 'TBD') return 'TBD';
  const due = new Date(dueDateStr);
  if (isNaN(due.getTime())) return 'TBD';
  return Math.ceil((due - new Date()) / 86400000);
}

// ── Win Probability ──────────────────────────────────────────────────────────
function calcWinProbability(stateCode, category, notes = '') {
  const info = getHR1Score(stateCode);
  const score = info.score;
  const hasIncumbentIssue = /litigation|defect|backlog|failure|protest|performanc/i.test(notes + info.keyFactor);
  const isModular = /module|modular|IV.V|assessment|audit|review/i.test(category);

  if (score <= 2 && hasIncumbentIssue && isModular) return 'High';
  if (score <= 2 && hasIncumbentIssue)               return 'Medium';
  if (score <= 3 && isModular)                       return 'Medium';
  if (score >= 4)                                    return 'Low';
  return 'Medium';
}

// ── Unique ID ────────────────────────────────────────────────────────────────
const crypto = require('crypto');

function makeId(title, state, rfpNumber) {
  const raw = `${state}|${rfpNumber || title}`.toLowerCase().replace(/\s+/g, '-');
  return crypto.createHash('md5').update(raw).digest('hex').slice(0, 12);
}

module.exports = {
  STATE_HR1_SCORES,
  STATE_REGIONS,
  getHR1Score,
  getRegion,
  getFMAP,
  classifyOpportunity,
  calcUrgency,
  calcDaysRemaining,
  calcWinProbability,
  makeId
};
