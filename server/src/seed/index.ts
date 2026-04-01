/**
 * Seed script — populates the MIRCS database with Hawaii test data.
 *
 * Covers all entity types and status combinations for thorough testing.
 * Run with:  npm run db:seed
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { upsertVector } from '../db/vector';

const prisma = new PrismaClient();

async function main() {
  console.log('🌺  Seeding MIRCS database with Hawaii test data…');

  // ────────────────────────────────────────────────────────────────────────────
  // 1. DEALERS  (3 dealers across Oahu, Maui, Kauai)
  // ────────────────────────────────────────────────────────────────────────────
  const dealer1 = await prisma.dealer.upsert({
    where: { licenseNumber: 'DLR-HI-00882' },
    update: {},
    create: {
      licenseNumber: 'DLR-HI-00882',
      fflNumber:     'FFL-96-12345',
      name:          'Aloha Arms & Outdoors LLC',
      address:       '1225 Kalani Street',
      city:          'Honolulu', state: 'HI', zip: '96817',
      phone:         '808-555-0101',
      email:         'info@alohaarms.example.com',
      status:        'active',
      expiresAt:     new Date('2026-12-31'),
    },
  });

  const dealer2 = await prisma.dealer.upsert({
    where: { licenseNumber: 'DLR-HI-01147' },
    update: {},
    create: {
      licenseNumber: 'DLR-HI-01147',
      fflNumber:     'FFL-96-67890',
      name:          'Maui Firearms & Supply',
      address:       '350 Dairy Road',
      city:          'Kahului', state: 'HI', zip: '96732',
      phone:         '808-555-0202',
      email:         'sales@mauifirearms.example.com',
      status:        'active',
      expiresAt:     new Date('2026-06-30'),
    },
  });

  const dealer3 = await prisma.dealer.upsert({
    where: { licenseNumber: 'DLR-HI-01388' },
    update: {},
    create: {
      licenseNumber: 'DLR-HI-01388',
      fflNumber:     'FFL-96-44412',
      name:          'Kauai Shooting Sports',
      address:       '3100 Kuhio Highway',
      city:          'Lihue', state: 'HI', zip: '96766',
      phone:         '808-555-0303',
      email:         'info@kauaishooting.example.com',
      status:        'active',
      expiresAt:     new Date('2027-03-31'),
    },
  });

  console.log('  ✓ Dealers (3)');

  // ────────────────────────────────────────────────────────────────────────────
  // 2. PERSONS  (10 residents across Hawaii islands)
  // ────────────────────────────────────────────────────────────────────────────
  const persons = await Promise.all([
    // 0 — Keali'i Nakamura (Honolulu)
    prisma.person.upsert({
      where: { id: 'person-keali-nakamura' }, update: {},
      create: {
        id: 'person-keali-nakamura',
        firstName: "Keali'i", lastName: 'Nakamura',
        dob: '1990-07-15',
        address: '2241 Liliha Street', city: 'Honolulu', zip: '96815',
        email: 'keali.nakamura@example.com', phone: '808-555-1001',
        race: 'A', ethnicity: 'N', gender: 'M',
      },
    }),
    // 1 — Maile Kahananui (Honolulu)
    prisma.person.upsert({
      where: { id: 'person-maile-kahananui' }, update: {},
      create: {
        id: 'person-maile-kahananui',
        firstName: 'Maile', lastName: 'Kahananui',
        dob: '1988-03-22',
        address: '1450 Ala Moana Blvd', city: 'Honolulu', zip: '96814',
        email: 'maile.k@example.com', phone: '808-555-1002',
        race: 'P', ethnicity: 'N', gender: 'F',
      },
    }),
    // 2 — James Wilson (Honolulu)
    prisma.person.upsert({
      where: { id: 'person-james-wilson' }, update: {},
      create: {
        id: 'person-james-wilson',
        firstName: 'James', lastName: 'Wilson',
        dob: '1975-11-30',
        address: '78 South King Street', city: 'Honolulu', zip: '96813',
        email: 'j.wilson@example.com', phone: '808-555-1003',
        race: 'W', ethnicity: 'N', gender: 'M',
      },
    }),
    // 3 — Leilani Fujimoto (Honolulu)
    prisma.person.upsert({
      where: { id: 'person-leilani-fujimoto' }, update: {},
      create: {
        id: 'person-leilani-fujimoto',
        firstName: 'Leilani', lastName: 'Fujimoto',
        dob: '1995-06-08',
        address: '500 Ala Moana Blvd', city: 'Honolulu', zip: '96813',
        email: 'lfujimoto@example.com', phone: '808-555-1004',
        race: 'A', ethnicity: 'N', gender: 'F',
      },
    }),
    // 4 — David Patel (Honolulu)
    prisma.person.upsert({
      where: { id: 'person-david-patel' }, update: {},
      create: {
        id: 'person-david-patel',
        firstName: 'David', lastName: 'Patel',
        dob: '1982-09-14',
        address: '3456 Waialae Avenue', city: 'Honolulu', zip: '96816',
        email: 'dpatel@example.com', phone: '808-555-1005',
        race: 'A', ethnicity: 'N', gender: 'M',
      },
    }),
    // 5 — Alicia Santos (Honolulu)
    prisma.person.upsert({
      where: { id: 'person-alicia-santos' }, update: {},
      create: {
        id: 'person-alicia-santos',
        firstName: 'Alicia', lastName: 'Santos',
        dob: '1993-01-25',
        address: '1200 Ala Kapuna Street', city: 'Honolulu', zip: '96819',
        email: 'asantos@example.com', phone: '808-555-1006',
        race: 'P', ethnicity: 'H', gender: 'F',
      },
    }),
    // 6 — Ryan Kim (Honolulu)
    prisma.person.upsert({
      where: { id: 'person-ryan-kim' }, update: {},
      create: {
        id: 'person-ryan-kim',
        firstName: 'Ryan', lastName: 'Kim',
        dob: '1987-04-03',
        address: '987 Pensacola Street', city: 'Honolulu', zip: '96814',
        email: 'rkim@example.com', phone: '808-555-1007',
        race: 'A', ethnicity: 'N', gender: 'M',
      },
    }),
    // 7 — Margaret Costa (Hilo, Big Island)
    prisma.person.upsert({
      where: { id: 'person-margaret-costa' }, update: {},
      create: {
        id: 'person-margaret-costa',
        firstName: 'Margaret', lastName: 'Costa',
        dob: '1970-12-19',
        address: '230 Merchant Street', city: 'Hilo', zip: '96720',
        email: 'mcosta@example.com', phone: '808-555-2001',
        race: 'P', ethnicity: 'N', gender: 'F',
      },
    }),
    // 8 — Kaimana Akana (Wailuku, Maui)
    prisma.person.upsert({
      where: { id: 'person-kaimana-akana' }, update: {},
      create: {
        id: 'person-kaimana-akana',
        firstName: 'Kaimana', lastName: 'Akana',
        dob: '1985-08-11',
        address: '45 Kamehameha Avenue', city: 'Wailuku', zip: '96793',
        email: 'kakana@example.com', phone: '808-555-3001',
        race: 'P', ethnicity: 'H', gender: 'M',
      },
    }),
    // 9 — Nalani Tran (Kapa'a, Kauai)
    prisma.person.upsert({
      where: { id: 'person-nalani-tran' }, update: {},
      create: {
        id: 'person-nalani-tran',
        firstName: 'Nalani', lastName: 'Tran',
        dob: '1998-02-14',
        address: "4900 Kuhio Highway", city: "Kapa'a", zip: '96746',
        email: 'ntran@example.com', phone: '808-555-4001',
        race: 'A', ethnicity: 'N', gender: 'F',
      },
    }),
  ]);

  for (const p of persons) {
    await upsertVector('Person', p.id,
      `${p.firstName} ${p.lastName} ${p.address} ${p.city} ${p.zip}`);
  }
  console.log('  ✓ Persons (10)');

  // ────────────────────────────────────────────────────────────────────────────
  // 3. FIREARMS  (12 firearms, variety of types)
  // ────────────────────────────────────────────────────────────────────────────
  const firearms = await Promise.all([
    // 0
    prisma.firearm.upsert({
      where: { serialNumber: 'GLK-US-A1234567' }, update: {},
      create: {
        type: 'Pistol', make: 'Glock', model: 'G17 Gen5',
        caliber: '9mm', barrelLength: '4.49', serialNumber: 'GLK-US-A1234567',
        surfaceFinish: 'Polymer Frame', isSemiAutomatic: true,
        isLargeCapacity: true, countryOfOrigin: 'Austria',
      },
    }),
    // 1
    prisma.firearm.upsert({
      where: { serialNumber: 'SW-MP9-B9876543' }, update: {},
      create: {
        type: 'Pistol', make: 'Smith & Wesson', model: 'M&P 9 Shield',
        caliber: '9mm', barrelLength: '3.1', serialNumber: 'SW-MP9-B9876543',
        surfaceFinish: 'Polymer Frame', isSemiAutomatic: true,
        isLargeCapacity: false, countryOfOrigin: 'USA',
      },
    }),
    // 2
    prisma.firearm.upsert({
      where: { serialNumber: 'REM-870-C5551234' }, update: {},
      create: {
        type: 'Shotgun', make: 'Remington', model: '870 Express',
        caliber: '12 Gauge', barrelLength: '18.5', serialNumber: 'REM-870-C5551234',
        surfaceFinish: 'Blued', isSemiAutomatic: false,
        isLargeCapacity: false, countryOfOrigin: 'USA',
      },
    }),
    // 3
    prisma.firearm.upsert({
      where: { serialNumber: 'RUG-10-22-D2224444' }, update: {},
      create: {
        type: 'Rifle', make: 'Ruger', model: '10/22 Carbine',
        caliber: '.22 LR', barrelLength: '18.5', serialNumber: 'RUG-10-22-D2224444',
        surfaceFinish: 'Blued', isSemiAutomatic: true,
        isLargeCapacity: false, countryOfOrigin: 'USA',
      },
    }),
    // 4
    prisma.firearm.upsert({
      where: { serialNumber: 'SIG-P320-E3336666' }, update: {},
      create: {
        type: 'Pistol', make: 'Sig Sauer', model: 'P320',
        caliber: '9mm', barrelLength: '4.7', serialNumber: 'SIG-P320-E3336666',
        surfaceFinish: 'Stainless Steel', isSemiAutomatic: true,
        isLargeCapacity: true, countryOfOrigin: 'Germany',
      },
    }),
    // 5 — PMF (privately made)
    prisma.firearm.upsert({
      where: { serialNumber: 'HIFRB-P-888112233' }, update: {},
      create: {
        type: 'Pistol', make: 'Privately Made', model: 'PMF-1911',
        caliber: '.45 ACP', barrelLength: '5.0', serialNumber: 'HIFRB-P-888112233',
        surfaceFinish: 'Parkerized', isSemiAutomatic: true,
        isPrivatelyMade: true, isLargeCapacity: false, countryOfOrigin: 'USA',
      },
    }),
    // 6
    prisma.firearm.upsert({
      where: { serialNumber: 'COL-SAA-F9997777' }, update: {},
      create: {
        type: 'Revolver', make: 'Colt', model: 'Single Action Army',
        caliber: '.357 Magnum', barrelLength: '4.75', serialNumber: 'COL-SAA-F9997777',
        surfaceFinish: 'Nickel Plated', isSemiAutomatic: false,
        isLargeCapacity: false, countryOfOrigin: 'USA',
      },
    }),
    // 7
    prisma.firearm.upsert({
      where: { serialNumber: 'MOS-500-G1112222' }, update: {},
      create: {
        type: 'Shotgun', make: 'Mossberg', model: '500 Tactical',
        caliber: '12 Gauge', barrelLength: '20.0', serialNumber: 'MOS-500-G1112222',
        surfaceFinish: 'Parkerized', isSemiAutomatic: false,
        isLargeCapacity: false, countryOfOrigin: 'USA',
      },
    }),
    // 8
    prisma.firearm.upsert({
      where: { serialNumber: 'BER-92FS-H5558888' }, update: {},
      create: {
        type: 'Pistol', make: 'Beretta', model: '92FS',
        caliber: '9mm', barrelLength: '4.9', serialNumber: 'BER-92FS-H5558888',
        surfaceFinish: 'Bruniton', isSemiAutomatic: true,
        isLargeCapacity: true, countryOfOrigin: 'Italy',
      },
    }),
    // 9
    prisma.firearm.upsert({
      where: { serialNumber: 'TAU-G2C-I6669999' }, update: {},
      create: {
        type: 'Pistol', make: 'Taurus', model: 'G2C',
        caliber: '9mm', barrelLength: '3.26', serialNumber: 'TAU-G2C-I6669999',
        surfaceFinish: 'Matte Black', isSemiAutomatic: true,
        isLargeCapacity: false, countryOfOrigin: 'Brazil',
      },
    }),
    // 10
    prisma.firearm.upsert({
      where: { serialNumber: 'WIN-70-J7773333' }, update: {},
      create: {
        type: 'Rifle', make: 'Winchester', model: 'Model 70',
        caliber: '.308 Win', barrelLength: '22.0', serialNumber: 'WIN-70-J7773333',
        surfaceFinish: 'Blued', isSemiAutomatic: false,
        isLargeCapacity: false, countryOfOrigin: 'USA',
      },
    }),
    // 11
    prisma.firearm.upsert({
      where: { serialNumber: 'SPR-XDS-K8884444' }, update: {},
      create: {
        type: 'Pistol', make: 'Springfield Armory', model: 'XD-S',
        caliber: '.40 S&W', barrelLength: '3.3', serialNumber: 'SPR-XDS-K8884444',
        surfaceFinish: 'Melonite', isSemiAutomatic: true,
        isLargeCapacity: false, countryOfOrigin: 'Croatia',
      },
    }),
  ]);

  for (const f of firearms) {
    await upsertVector('Firearm', f.id,
      `${f.type} ${f.make} ${f.model} ${f.caliber} serial ${f.serialNumber}`);
  }
  console.log('  ✓ Firearms (12)');

  // ────────────────────────────────────────────────────────────────────────────
  // 4. PERMITS (PTA)  —  all statuses: approved, pending, denied, expired
  // ────────────────────────────────────────────────────────────────────────────
  const permits = await Promise.all([
    prisma.permit.upsert({
      where: { permitNumber: 'PTA-2025-100001' }, update: {},
      create: {
        permitNumber: 'PTA-2025-100001', type: 'PTA_PISTOL_REVOLVER', status: 'approved',
        personId: persons[0].id, fee: 26,
        expiresAt: new Date('2025-12-31'), approvedAt: new Date('2025-11-15'),
      },
    }),
    prisma.permit.upsert({
      where: { permitNumber: 'PTA-2025-100002' }, update: {},
      create: {
        permitNumber: 'PTA-2025-100002', type: 'PTA_PISTOL_REVOLVER', status: 'pending',
        personId: persons[1].id, fee: 26,
        expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.permit.upsert({
      where: { permitNumber: 'PTA-2025-100003' }, update: {},
      create: {
        permitNumber: 'PTA-2025-100003', type: 'PTA_RIFLE_SHOTGUN', status: 'approved',
        personId: persons[2].id, fee: 26,
        expiresAt: new Date('2025-11-30'), approvedAt: new Date('2025-11-01'),
      },
    }),
    prisma.permit.upsert({
      where: { permitNumber: 'PTA-2025-100004' }, update: {},
      create: {
        permitNumber: 'PTA-2025-100004', type: 'PTA_PISTOL_REVOLVER', status: 'denied',
        personId: persons[4].id, fee: 26,
        denialReason: 'D001 - Felony Conviction',
      },
    }),
    prisma.permit.upsert({
      where: { permitNumber: 'PTA-2026-200001' }, update: {},
      create: {
        permitNumber: 'PTA-2026-200001', type: 'PTA_PISTOL_REVOLVER', status: 'approved',
        personId: persons[3].id, fee: 26,
        expiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(),
      },
    }),
    prisma.permit.upsert({
      where: { permitNumber: 'PTA-2026-200002' }, update: {},
      create: {
        permitNumber: 'PTA-2026-200002', type: 'PTA_RIFLE_SHOTGUN', status: 'pending',
        personId: persons[5].id, fee: 26,
        expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      },
    }),
    // expired — Kaimana Akana
    prisma.permit.upsert({
      where: { permitNumber: 'PTA-2025-300001' }, update: {},
      create: {
        permitNumber: 'PTA-2025-300001', type: 'PTA_PISTOL_REVOLVER', status: 'expired',
        personId: persons[8].id, fee: 26,
        expiresAt: new Date('2025-06-01'), approvedAt: new Date('2025-05-22'),
      },
    }),
    // approved — Nalani Tran
    prisma.permit.upsert({
      where: { permitNumber: 'PTA-2026-300002' }, update: {},
      create: {
        permitNumber: 'PTA-2026-300002', type: 'PTA_RIFLE_SHOTGUN', status: 'approved',
        personId: persons[9].id, fee: 26,
        expiresAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(),
      },
    }),
  ]);
  console.log('  ✓ Permits / PTA (8)');

  // ────────────────────────────────────────────────────────────────────────────
  // 5. LICENSES (LTC)  — active, pending, expired, suspended
  // ────────────────────────────────────────────────────────────────────────────
  const licenses = await Promise.all([
    prisma.license.upsert({
      where: { licenseNumber: 'LTC-2024-300001' }, update: {},
      create: {
        licenseNumber: 'LTC-2024-300001', type: 'LTC_CONCEALED', status: 'active',
        personId: persons[1].id, fee: 100,
        trainingType: 'NRA Basic Pistol',
        goodCause: 'Personal protection for overnight shift work',
        expiresAt: new Date('2026-12-31'), approvedAt: new Date('2024-06-15'),
      },
    }),
    prisma.license.upsert({
      where: { licenseNumber: 'LTC-2025-300002' }, update: {},
      create: {
        licenseNumber: 'LTC-2025-300002', type: 'LTC_OPEN', status: 'active',
        personId: persons[2].id, fee: 100,
        trainingType: 'Hawaii Approved Course',
        goodCause: 'Licensed security professional',
        expiresAt: new Date('2026-05-01'), approvedAt: new Date('2025-05-01'),
      },
    }),
    prisma.license.upsert({
      where: { licenseNumber: 'LTC-2025-300003' }, update: {},
      create: {
        licenseNumber: 'LTC-2025-300003', type: 'LTC_CONCEALED', status: 'pending',
        personId: persons[0].id, fee: 100,
        trainingType: 'HPD-Approved Course',
        goodCause: 'Rural residence, concern about wildlife encounters while hiking',
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.license.upsert({
      where: { licenseNumber: 'LTC-2025-300004' }, update: {},
      create: {
        licenseNumber: 'LTC-2025-300004', type: 'LTC_CONCEALED', status: 'pending',
        personId: persons[6].id, fee: 100,
        trainingType: 'NRA Basic Pistol',
        goodCause: 'Collecting and sport shooting',
        expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.license.upsert({
      where: { licenseNumber: 'LTC-2024-300005' }, update: {},
      create: {
        licenseNumber: 'LTC-2024-300005', type: 'LTC_CONCEALED', status: 'expired',
        personId: persons[7].id, fee: 100,
        trainingType: 'Law Enforcement',
        goodCause: 'Retired law enforcement officer',
        expiresAt: new Date('2025-01-01'), approvedAt: new Date('2024-01-01'),
      },
    }),
    // suspended — Kaimana Akana (domestic order)
    prisma.license.upsert({
      where: { licenseNumber: 'LTC-2025-400006' }, update: {},
      create: {
        licenseNumber: 'LTC-2025-400006', type: 'LTC_CONCEALED', status: 'suspended',
        personId: persons[8].id, fee: 100,
        trainingType: 'HPD-Approved Course',
        goodCause: 'Personal protection — rural property',
        denialReason: 'S001 - Active Restraining Order',
        expiresAt: new Date('2026-08-01'), approvedAt: new Date('2025-02-01'),
      },
    }),
  ]);
  console.log('  ✓ Licenses / LTC (6)');

  // ────────────────────────────────────────────────────────────────────────────
  // 6. FIREARM REGISTRATIONS
  // ────────────────────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.firearmRegistration.upsert({
      where: { regNumber: 'REG-2025-400001' }, update: {},
      create: { regNumber: 'REG-2025-400001', personId: persons[0].id, firearmId: firearms[0].id, permitId: permits[0].id },
    }),
    prisma.firearmRegistration.upsert({
      where: { regNumber: 'REG-2025-400002' }, update: {},
      create: { regNumber: 'REG-2025-400002', personId: persons[1].id, firearmId: firearms[1].id },
    }),
    prisma.firearmRegistration.upsert({
      where: { regNumber: 'REG-2025-400003' }, update: {},
      create: { regNumber: 'REG-2025-400003', personId: persons[2].id, firearmId: firearms[2].id, permitId: permits[2].id },
    }),
    prisma.firearmRegistration.upsert({
      where: { regNumber: 'REG-2025-400004' }, update: {},
      create: { regNumber: 'REG-2025-400004', personId: persons[3].id, firearmId: firearms[4].id },
    }),
    prisma.firearmRegistration.upsert({
      where: { regNumber: 'REG-2024-400005' }, update: {},
      create: { regNumber: 'REG-2024-400005', personId: persons[6].id, firearmId: firearms[6].id },
    }),
    prisma.firearmRegistration.upsert({
      where: { regNumber: 'REG-2026-400006' }, update: {},
      create: { regNumber: 'REG-2026-400006', personId: persons[9].id, firearmId: firearms[9].id, permitId: permits[7].id },
    }),
  ]);
  console.log('  ✓ Firearm Registrations (6)');

  // ────────────────────────────────────────────────────────────────────────────
  // 7. TRANSACTIONS  — Sale, Transfer, Loan, Bequest
  // ────────────────────────────────────────────────────────────────────────────
  const transactions = await Promise.all([
    prisma.transaction.upsert({
      where: { ticketNumber: 'HPD-SHF-2025-500001' }, update: {},
      create: {
        ticketNumber: 'HPD-SHF-2025-500001', type: 'Sale', status: 'completed',
        firearmId: firearms[0].id, sellerId: persons[2].id, buyerId: persons[0].id, dealerId: dealer1.id,
        notes: 'Standard dealer-assisted sale',
      },
    }),
    prisma.transaction.upsert({
      where: { ticketNumber: 'HPD-SHF-2025-500002' }, update: {},
      create: {
        ticketNumber: 'HPD-SHF-2025-500002', type: 'Transfer', status: 'pending',
        firearmId: firearms[3].id, sellerId: persons[4].id, buyerId: persons[3].id,
        notes: 'Personal sale between private parties',
      },
    }),
    prisma.transaction.upsert({
      where: { ticketNumber: 'HPD-SHF-2025-500003' }, update: {},
      create: {
        ticketNumber: 'HPD-SHF-2025-500003', type: 'Sale', status: 'completed',
        firearmId: firearms[4].id, buyerId: persons[3].id, dealerId: dealer2.id,
        notes: 'New firearm dealer sale',
      },
    }),
    prisma.transaction.upsert({
      where: { ticketNumber: 'HPD-SHF-2026-500004' }, update: {},
      create: {
        ticketNumber: 'HPD-SHF-2026-500004', type: 'Bequest', status: 'pending',
        firearmId: firearms[6].id, sellerId: persons[7].id, buyerId: persons[5].id,
        notes: 'Estate transfer — inheritance',
      },
    }),
    prisma.transaction.upsert({
      where: { ticketNumber: 'HPD-SHF-2026-500005' }, update: {},
      create: {
        ticketNumber: 'HPD-SHF-2026-500005', type: 'Sale', status: 'completed',
        firearmId: firearms[9].id, buyerId: persons[9].id, dealerId: dealer3.id,
        notes: 'New pistol purchase at Kauai Shooting Sports',
      },
    }),
    prisma.transaction.upsert({
      where: { ticketNumber: 'HPD-SHF-2026-500006' }, update: {},
      create: {
        ticketNumber: 'HPD-SHF-2026-500006', type: 'Transfer', status: 'completed',
        firearmId: firearms[2].id, sellerId: persons[2].id, buyerId: persons[8].id,
        notes: 'Private party transfer — shotgun',
      },
    }),
    prisma.transaction.upsert({
      where: { ticketNumber: 'HPD-SHF-2026-500007' }, update: {},
      create: {
        ticketNumber: 'HPD-SHF-2026-500007', type: 'Loan', status: 'approved',
        firearmId: firearms[8].id, sellerId: persons[0].id, buyerId: persons[6].id,
        notes: 'Temporary loan for sport shooting competition',
      },
    }),
    prisma.transaction.upsert({
      where: { ticketNumber: 'HPD-SHF-2026-500008' }, update: {},
      create: {
        ticketNumber: 'HPD-SHF-2026-500008', type: 'Sale', status: 'rejected',
        firearmId: firearms[10].id, buyerId: persons[4].id, dealerId: dealer1.id,
        notes: 'Sale rejected — buyer has active denial on file (D001)',
      },
    }),
  ]);
  console.log('  ✓ Transactions (8)');

  // ────────────────────────────────────────────────────────────────────────────
  // 8. LOST / STOLEN REPORTS
  // ────────────────────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.lostStolenReport.upsert({
      where: { reportNumber: 'RPT-2025-600001' }, update: {},
      create: {
        reportNumber: 'RPT-2025-600001', type: 'Stolen', status: 'open',
        firearmId: firearms[5].id, reporterId: persons[5].id,
        location: 'Vehicle break-in, Ala Moana Center parking structure',
        description: 'Pistol taken from locked vehicle during overnight parking',
      },
    }),
    prisma.lostStolenReport.upsert({
      where: { reportNumber: 'RPT-2025-600002' }, update: {},
      create: {
        reportNumber: 'RPT-2025-600002', type: 'Lost', status: 'open',
        firearmId: firearms[7].id, reporterId: persons[7].id,
        location: 'Kailua-Kona area',
        description: 'Shotgun unaccounted for following household move',
      },
    }),
    prisma.lostStolenReport.upsert({
      where: { reportNumber: 'RPT-2024-600003' }, update: {},
      create: {
        reportNumber: 'RPT-2024-600003', type: 'Stolen', status: 'recovered',
        firearmId: firearms[1].id, reporterId: persons[4].id,
        location: 'Waikiki hotel room',
        description: 'Taken during hotel stay; recovered by HPD at pawnshop',
        recoveredAt: new Date('2024-09-10'),
      },
    }),
    prisma.lostStolenReport.upsert({
      where: { reportNumber: 'RPT-2026-600004' }, update: {},
      create: {
        reportNumber: 'RPT-2026-600004', type: 'Stolen', status: 'open',
        firearmId: firearms[11].id, reporterId: persons[9].id,
        location: "Kapaa Beach Park, Kauai",
        description: 'Stolen from locked car during morning beach visit',
      },
    }),
  ]);
  console.log('  ✓ Lost/Stolen Reports (4)');

  // ────────────────────────────────────────────────────────────────────────────
  // 9. SERIALIZATION REQUESTS  (PMF requests)
  // ────────────────────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.serializationRequest.upsert({
      where: { serialNumber: 'HIFRB-P-888112233' }, update: {},
      create: {
        serialNumber: 'HIFRB-P-888112233', firearmType: 'Pistol',
        make: 'Privately Made', model: 'PMF-1911', caliber: '.45 ACP',
        meansOfProd: 'CNC Machining', applicantId: persons[6].id,
        status: 'issued', issuedAt: new Date('2025-08-20'),
      },
    }),
    prisma.serializationRequest.upsert({
      where: { serialNumber: 'HIFRB-RI-777334455' }, update: {},
      create: {
        serialNumber: 'HIFRB-RI-777334455', firearmType: 'Rifle',
        make: 'Privately Made', model: 'AR-pattern', caliber: '5.56 NATO',
        meansOfProd: '3D Printing', applicantId: persons[0].id,
        status: 'pending',
      },
    }),
    prisma.serializationRequest.upsert({
      where: { serialNumber: 'HIFRB-S-555990011' }, update: {},
      create: {
        serialNumber: 'HIFRB-S-555990011', firearmType: 'Shotgun',
        make: 'Privately Made', model: 'Pump-Action Build', caliber: '12 Gauge',
        meansOfProd: 'Kit Assembly', applicantId: persons[8].id,
        status: 'issued', issuedAt: new Date('2025-10-05'),
      },
    }),
    prisma.serializationRequest.upsert({
      where: { serialNumber: 'HIFRB-P-223344556' }, update: {},
      create: {
        serialNumber: 'HIFRB-P-223344556', firearmType: 'Pistol',
        make: 'Privately Made', model: '9mm Compact Build', caliber: '9mm',
        meansOfProd: '3D Printing', applicantId: persons[9].id,
        status: 'pending',
      },
    }),
  ]);
  console.log('  ✓ Serialization Requests (4)');

  // ────────────────────────────────────────────────────────────────────────────
  // 10. ADMIN MESSAGES
  // ────────────────────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.adminMessage.upsert({
      where: { id: 'msg-001' }, update: {},
      create: {
        id: 'msg-001',
        title: 'MIRCS Portal Now Live',
        body: 'The HPD Electronic Firearms Registry System is now accepting registrations and permit applications. All transactions must be submitted through this system effective immediately.',
        severity: 'info', active: true,
      },
    }),
    prisma.adminMessage.upsert({
      where: { id: 'msg-002' }, update: {},
      create: {
        id: 'msg-002',
        title: 'PTA Fee Reminder — $26 Per Firearm',
        body: 'Pursuant to HRS §134-2, the Permit to Acquire fee remains $26 per firearm for all types (pistol, revolver, rifle, shotgun). Payment is non-refundable.',
        severity: 'warning', active: true,
        expiresAt: new Date('2026-12-31'),
      },
    }),
    prisma.adminMessage.upsert({
      where: { id: 'msg-003' }, update: {},
      create: {
        id: 'msg-003',
        title: 'System Maintenance — May 3, 2026',
        body: 'Scheduled maintenance from 2:00 AM to 4:00 AM HST on May 3, 2026. The portal will be unavailable during this window. Plan accordingly.',
        severity: 'warning', active: true,
        expiresAt: new Date('2026-05-04'),
      },
    }),
  ]);
  console.log('  ✓ Admin Messages (3)');

  console.log('\n🌺  Seed complete!');
  console.log('   10 persons | 12 firearms | 8 permits | 6 licenses');
  console.log('    8 transactions | 4 reports | 4 serialization requests | 3 messages\n');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
