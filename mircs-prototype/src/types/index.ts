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

export const FIREARM_TYPES = [
  'Handgun',
  'Rifle',
  'Shotgun',
  'Machine Gun',
  'Stun Gun',
  'Frame',
  'Receiver',
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
  'Other',
];

export const LICENSE_TYPES = [
  'License to Carry Firearms (LTC)',
  'Firearms Identification Card (FID)',
  'Machine Gun License',
  'Non-Resident LTC',
  'Gun Club License',
  'Gunsmith License',
  'License to Sell/Rent/Lease Firearms and Ammunition',
];

export const TRANSACTION_TYPES = [
  'Sale',
  'Rental',
  'Lease',
  'Loan',
];

export const RACE_VALUES = [
  { code: 'W', label: 'W - White' },
  { code: 'B', label: 'B - Black' },
  { code: 'I', label: 'I - American Indian' },
  { code: 'A', label: 'A - Asian' },
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

export const SERIALIZATION_SCHEMA: Record<string, string> = {
  'Handgun':      'MAFRB-H',
  'Rifle':        'MAFRB-R',
  'Shotgun':      'MAFRB-S',
  'Stun Gun':     'MAFRB-ST',
  'Machine Gun':  'MAFRB-M',
  'Frame':        'MAFRB-FR',
  'Receiver':     'MAFRB-RC',
};

export const MEANS_OF_PRODUCTION = [
  '3D Printing',
  'CNC Machining',
  'Manual Fabrication',
  'Kit Assembly',
  'Other',
];

export const CHANGE_OF_CUSTODY_TYPES = [
  'Police Auction',
  'Destroyed',
  'Transfer to Another Jurisdiction',
  'Transferred Back to Owner',
  'Other',
];

export const NO_LICENSE_REASONS = [
  'FFL without Dealer\'s License',
  'Heir or Devisee',
  'New MA Resident',
  'Other',
];
