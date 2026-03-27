// Hawaii Firearms Permit & Licensing System — HPD
// Honolulu Police Department, City & County of Honolulu
// RFP-HPD-1954933: Electronic Firearms Permit Application System

export interface Firearm {
  type: string;
  make: string;
  model: string;
  caliber: string;
  barrelLength: string;
  serialNumber: string;
  surfaceFinish: string;
  isSemiAutomatic: boolean;
  isPrivatelyMade: boolean;
  isLargeCapacity: boolean;
  countryOfOrigin: string;
}

export interface LicenseHolder {
  licenseNumber: string;
  pin: string;
  firstName: string;
  lastName: string;
  dob: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  email: string;
  phone: string;
  licenseType: string;
  licenseStatus: 'active' | 'expired' | 'suspended' | 'revoked';
  expirationDate: string;
}

export interface Transaction {
  id: string;
  type: string;
  date: string;
  status: string;
  firearm: Partial<Firearm>;
  ticketNumber: string;
}

// Hawaii firearm categories per HRS §134
export const FIREARM_TYPES = [
  'Pistol',
  'Revolver',
  'Rifle',
  'Shotgun',
  'Machine Gun',
  'Assault Weapon',
  'Frame / Receiver',
];

export const FIREARM_MAKES = [
  'Glock',
  'Smith & Wesson',
  'Ruger',
  'Sig Sauer',
  'Colt',
  'Remington',
  'Winchester',
  'Mossberg',
  'Beretta',
  'Springfield Armory',
  'Kahr Arms',
  'Taurus',
  'CZ',
  'Walther',
  'Other',
];

export const SURFACE_FINISHES = [
  'Blued',
  'Stainless Steel',
  'Parkerized',
  'Cerakote',
  'Nickel Plated',
  'Chrome',
  'Anodized',
  'Polymer Frame',
  'Other',
];

// Hawaii-specific license/permit types per HRS §134
export const LICENSE_TYPES = [
  'Permit to Acquire (PTA) — Pistol or Revolver',
  'Permit to Acquire (PTA) — Rifle or Shotgun',
  'License to Carry (LTC) — Concealed',
  'License to Carry (LTC) — Open Carry',
  'Dealer License',
  'Manufacturer License',
];

export const TRANSACTION_TYPES = [
  'Sale',
  'Transfer',
  'Loan',
  'Bequest / Inheritance',
];

export const RACE_VALUES = [
  { code: 'W', label: 'W - White' },
  { code: 'B', label: 'B - Black or African American' },
  { code: 'I', label: 'I - American Indian or Alaska Native' },
  { code: 'A', label: 'A - Asian' },
  { code: 'P', label: 'P - Native Hawaiian or Pacific Islander' },
  { code: 'U', label: 'U - Unknown' },
];

export const ETHNICITY_VALUES = [
  { code: 'H', label: 'H - Hispanic or Latino' },
  { code: 'N', label: 'N - Non-Hispanic or Not Latino' },
];

export const GENDER_VALUES = [
  { code: 'M', label: 'M - Male' },
  { code: 'F', label: 'F - Female' },
  { code: 'X', label: 'X - Non-Binary' },
  { code: 'U', label: 'U - Unknown' },
];

export const NAME_CHANGE_REASONS = [
  'Maiden Name',
  'Legally Changed Name',
  'Nickname',
  'Previous Marriage',
  'Adopted Name',
  'Other',
];

// Hawaii firearm serialization schema
export const SERIALIZATION_SCHEMA: Record<string, string> = {
  'Pistol':          'HIFRB-P',
  'Revolver':        'HIFRB-R',
  'Rifle':           'HIFRB-RI',
  'Shotgun':         'HIFRB-S',
  'Machine Gun':     'HIFRB-M',
  'Assault Weapon':  'HIFRB-A',
  'Frame / Receiver':'HIFRB-FR',
};

export const MEANS_OF_PRODUCTION = [
  '3D Printing',
  'CNC Machining',
  'Manual Fabrication',
  'Kit Assembly',
  'Other',
];

export const CHANGE_OF_CUSTODY_TYPES = [
  'Auction',
  'Destroyed',
  'Transfer to Another Jurisdiction',
  'Returned to Owner',
  'Evidence Hold',
  'Other',
];

// Hawaii-specific: PTA denial reasons per HRS §134-7
export const PTA_DENIAL_REASONS = [
  'Felony Conviction',
  'Mental Health Adjudication',
  'Domestic Violence Conviction or Restraining Order',
  'Fugitive from Justice',
  'Unlawful Drug User',
  'Illegal Alien Status',
  'Dishonorable Discharge',
  'Renounced US Citizenship',
  'Under Indictment for Felony',
  'Other Prohibited Person',
];

// LTC training requirements per HRS §134-9
export const LTC_TRAINING_TYPES = [
  'NRA Basic Pistol Course',
  'Hawaii Approved Firearms Safety Course',
  'Law Enforcement Training',
  'Military Training (DD-214 Required)',
  'Hunter Education Certificate',
  'Other HPD-Approved Course',
];

// Hawaii counties for cross-county sharing
export const HI_COUNTIES = [
  'City & County of Honolulu',
  'Maui County',
  'Hawaii County (Big Island)',
  'Kauai County',
];

// HPD appointment types per RFP Appendix A §V.A.3
export const APPOINTMENT_TYPES = [
  'Fingerprinting — LTC',
  'In-Person Interview — LTC',
  'Document Review — PTA',
  'Document Pickup — Approved Permit',
];

// Hawaii Revised Statutes references
export const HRS_REFERENCES = {
  PTA: 'HRS §134-2',
  REGISTRATION: 'HRS §134-3',
  LTC: 'HRS §134-9',
  LTC_TERM: 'HRS §134-9.6',
  PROHIBITED_PERSONS: 'HRS §134-7',
  DEALERS: 'HRS §134-14',
};

// HPD Forms per RFP Exhibit C
export const HPD_FORMS = [
  'HPD-89 (Permit to Acquire)',
  'HPD-150A (LTC Application)',
  'HPD-150B (LTC Background)',
  'HPD-150C (LTC Reference)',
  'HPD-150D (LTC Affidavit)',
  'Mental Health Waiver',
  'State of Hawaii PTA Application',
  'LTC Affidavit of Acknowledgment',
];

// PTA fee per HRS §134-2
export const PTA_FEE_PISTOL_REVOLVER = 26;
export const PTA_FEE_RIFLE_SHOTGUN = 26;
export const LTC_FEE = 100;
export const LTC_PROCESSING_DAYS = 120; // Statutory deadline per HRS §134-9
