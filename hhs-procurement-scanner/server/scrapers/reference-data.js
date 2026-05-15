'use strict';

// ── H.R. 1 Readiness Scores (PROMPTJH v5.5, Section 4.2) ───────────────────
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

// ── v5.5 Classification logic ─────────────────────────────────────────────────

function classifyProgramArea(title = '', description = '') {
  const t = (title + ' ' + description).toLowerCase();
  // Cross-program integration — check BEFORE individual programs
  if (['system integration','enterprise integration','interface development',
       'interface integration','data exchange','api integration','interoperability']
       .some(k => t.includes(k)) &&
      ['medicaid','snap','tanf','eligibility','iv-d','iv-e','child support','child welfare']
       .some(k => t.includes(k))) return 'Integration';
  if (['continuity of operations','coop plan','coop ','disaster recovery','business continuity'].some(k => t.includes(k))) return 'COOP';
  if (['enterprise risk management','erm platform','grc platform','governance risk compliance','risk register'].some(k => t.includes(k))) return 'ERM';
  if (['it audit','nist 800-53','security assessment','fisma','mars-e','hipaa audit','fedramp','soc 2','penetration test'].some(k => t.includes(k))) return 'IT Audit';
  if (['iv&v','independent verification','independent testing','testing services','quality assurance','test management'].some(k => t.includes(k))) return 'Testing Services';
  if (['leadership as a service','laas','resources as a service','raas','staff augmentation','program management office','pmo support'].some(k => t.includes(k))) return 'LaaS-RaaS';
  if (['iv-e','title iv-e','foster care','adoption assistance','ccwis','sacwis','child welfare information system','child welfare system','child welfare technology','ncands','afcars'].some(k => t.includes(k))) return 'IV-E';
  if (['iv-d','title iv-d','child support enforcement','child support system','cse system','cses','state disbursement unit','sdu'].some(k => t.includes(k))) return 'IV-D';
  if (['iv-a','title iv-a','tanf system','tanf technology','tanf information system','tanf eligibility system'].some(k => t.includes(k))) return 'IV-A';
  if (['liheap','energy assistance','low income home energy','weatherization'].some(k => t.includes(k))) return 'LIHEAP';
  if (['tanf','temporary assistance for needy families','cash assistance','work first'].some(k => t.includes(k))) return 'TANF';
  if (['snap','food stamps','supplemental nutrition','ebt','food assistance'].some(k => t.includes(k))) return 'SNAP';
  if (['rural health transformation','rhtp','critical access hospital','frontier health','rural hospital transformation'].some(k => t.includes(k))) return 'RHTP';
  return 'Medicaid';
}

function classifyCategory(title = '', description = '') {
  const t = (title + ' ' + description).toLowerCase();
  if (['managed care','mco','capitation','d-snp','dsnp'].some(k => t.includes(k))) return 'MCO-ManagedCare';
  if (['mmis','claims processing','claims adjudication'].some(k => t.includes(k))) return 'MES-MMIS';
  if (['eligibility','enrollment','e&e','eedss','bridges','cbms','calheers'].some(k => t.includes(k))) return 'MES-EligibilityEnrollment';
  if (['provider management','provider portal','provider services'].some(k => t.includes(k))) return 'MES-ProviderMgmt';
  if (['analytics','data analytics','business intelligence','data warehouse','reporting system'].some(k => t.includes(k))) return 'MES-Analytics';
  if (['iv&v','independent verification','independent testing','testing services'].some(k => t.includes(k))) return 'MES-IVV';
  if (['systems integrat','enterprise integrat','si services','program integrat'].some(k => t.includes(k))) return 'MES-SystemsIntegration';
  if (['it audit','security assessment','nist 800','fisma','mars-e','hipaa security'].some(k => t.includes(k))) return 'AUDIT-ITAudit';
  if (['enterprise risk','erm','grc','governance risk','risk register'].some(k => t.includes(k))) return 'ERM-GRC';
  if (['continuity','coop','disaster recovery','business continuity'].some(k => t.includes(k))) return 'COOP-IT';
  if (['snap','ebt','food assistance','supplemental nutrition'].some(k => t.includes(k))) return 'Benefits-SNAP';
  if (['tanf','cash assistance','temporary assistance'].some(k => t.includes(k))) return 'Benefits-TANF';
  if (['liheap','energy assistance','weatherization'].some(k => t.includes(k))) return 'Benefits-LIHEAP';
  if (['staff augment','laas','raas','resources as a service','leadership as a service'].some(k => t.includes(k))) return 'Staffing-LaaS';
  if (['workforce','work requirement','employment','income verification'].some(k => t.includes(k))) return 'MES-WorkRequirements';
  if (['child welfare','foster care','cws','ccwis','sacwis'].some(k => t.includes(k))) return 'MES-ChildWelfare';
  if (['child support','iv-d','cses'].some(k => t.includes(k))) return 'MES-ChildSupport';
  return 'MES-Other';
}

function classifyOpportunity(title = '', description = '') {
  const category = classifyCategory(title, description);
  const program_area = classifyProgramArea(title, description);
  // Derive legacy 'program' and 'itType' fields from program_area/category
  const program = program_area === 'Medicaid' ? 'Medicaid' : program_area;
  let itType = 'DDI';
  if (/audit|assessment|review|iv&v|iv.v|verification/i.test(title)) itType = 'Assessment';
  else if (/m&o|maintenance|operations|support/i.test(title)) itType = 'M&O';
  else if (/staff|augment|laas|raas/i.test(title)) itType = 'Staffing';
  return { category, program_area, program, itType };
}

// ── Urgency calculation (v5.5 — 5 levels) ────────────────────────────────────
function calcUrgency(dueDateStr) {
  if (!dueDateStr || dueDateStr === 'TBD' || dueDateStr === 'Unknown') return 'WATCH';
  const due = new Date(dueDateStr);
  if (isNaN(due.getTime())) return 'WATCH';
  const days = Math.ceil((due - new Date()) / 86400000);
  if (days < 0)   return 'OVERDUE';
  if (days <= 7)  return 'CRITICAL';
  if (days <= 30) return 'HIGH';
  if (days <= 90) return 'WATCH';
  return 'MONITOR';
}

function calcDaysRemaining(dueDateStr) {
  if (!dueDateStr || dueDateStr === 'TBD') return 'TBD';
  const due = new Date(dueDateStr);
  if (isNaN(due.getTime())) return 'TBD';
  return Math.ceil((due - new Date()) / 86400000);
}

// ── Win Probability (v5.5) ────────────────────────────────────────────────────
function calcWinProbability(stateCode, category, notes = '', programArea = '') {
  const t = (category + ' ' + notes).toLowerCase();
  if (['Testing Services','LaaS-RaaS','IT Audit','ERM','COOP'].includes(programArea)) return 'High';
  if (/iv&v|independent verification|independent testing|audit|assessment|testing services/.test(t)) return 'High';
  if (['SNAP','TANF','LIHEAP'].includes(programArea)) return 'Medium';
  if (programArea === 'IV-E') return 'High';
  if (programArea === 'IV-D') return 'Medium';
  if (programArea === 'IV-A') return 'Medium';
  if (programArea === 'Integration') return 'High';
  if (stateCode === 'VT') return 'High';
  if (/deloitte|maximus|optum|dxc|gainwell|accenture/.test(t)) return 'Low';
  if (category === 'MCO-ManagedCare') return 'Low';
  return 'Medium';
}

// ── RFP number extraction (v5.5) ──────────────────────────────────────────────
function parseRFPNumber(text = '') {
  text = text.replace(/#[A-Z0-9_]+/gi, ' ');
  const patterns = [
    /\b(RFP-MQD-\d{4}-\d{3,})\b/i,
    /\b(RFI-MQD-\d{4}-\d{3,})\b/i,
    /\b(RFP[-\s]?\d{4,}[-\w]*)\b/i,
    /\b(RFI[-\s]?\d{4,}[-\w]*)\b/i,
    /\b(RFQ[-\s]?\d{4,}[-\w]*)\b/i,
    /\b(\d{5}-\d{5})\b/,
    /\b(HHS\d{7,}[-\w]*)\b/i,
    /\b(MEDIOMC\d{5,})\b/i,
    /\b([A-Z]{2,6}-[A-Z]{2,6}-\d{4}[-\w]*)\b/i,
    /\b(YH\d{2}-\d{4})\b/i,
    /\b(RFP|RFI|ITN|IFB|RFQ|RFQQ)[\s#-]*([A-Z0-9-]{4,})/i,
  ];
  for (const pat of patterns) {
    const m = text.match(pat);
    if (m) return (m[1] || `${m[1]} ${m[2]}`).toUpperCase();
  }
  return 'N/A';
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
  STATE_FMAP,
  getHR1Score,
  getRegion,
  getFMAP,
  classifyProgramArea,
  classifyCategory,
  classifyOpportunity,
  calcUrgency,
  calcDaysRemaining,
  calcWinProbability,
  parseRFPNumber,
  makeId
};
