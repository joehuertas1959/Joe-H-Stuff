-- =============================================================================
-- MIRCS Unified Portal — Extended Demo Seed Data (Hawaiian Theme)
-- Massachusetts residents of Hawaiian heritage — realistic test scenarios
-- =============================================================================

-- =============================================================================
-- DEMO PERSONS (Hawaiian names, MA residents)
-- =============================================================================

INSERT INTO persons (
  person_id, first_name, middle_name, last_name,
  date_of_birth, place_of_birth,
  gender, race, ethnicity,
  hair_color, eye_color, height, weight_lbs,
  address_line1, city, state, zip,
  email, phone,
  driver_license_number, driver_license_state
) VALUES
  (
    'b2000000-0000-0000-0000-000000000001',
    'Kai', 'Makoa', 'Kealoha',
    '1988-04-12', 'Honolulu, HI',
    'M', 'A', 'N',
    'Black', 'Brown', '5''11"', 185,
    '14 Beacon Hill Ter', 'Boston', 'MA', '02108',
    'kai.kealoha@example.com', '(617) 555-0301',
    'S110045892', 'MA'
  ),
  (
    'b2000000-0000-0000-0000-000000000002',
    'Leilani', 'Hoku', 'Kahananui',
    '1993-09-27', 'Kailua, HI',
    'F', 'A', 'N',
    'Black', 'Brown', '5''5"', 130,
    '88 Brattle St', 'Cambridge', 'MA', '02138',
    'leilani.kahananui@example.com', '(617) 555-0302',
    'S220087341', 'MA'
  ),
  (
    'b2000000-0000-0000-0000-000000000003',
    'Koa', 'Alika', 'Malama',
    '1975-11-03', 'Hilo, HI',
    'M', 'A', 'N',
    'Black', 'Brown', '6''1"', 210,
    '22 Elm Park E', 'Worcester', 'MA', '01609',
    'koa.malama@example.com', '(508) 555-0303',
    'S330062185', 'MA'
  ),
  (
    'b2000000-0000-0000-0000-000000000004',
    'Maile', 'Nohea', 'Akana',
    '1996-02-14', 'Maui, HI',
    'F', 'A', 'N',
    'Black', 'Hazel', '5''4"', 120,
    '301 Pawtucket Blvd', 'Lowell', 'MA', '01854',
    'maile.akana@example.com', '(978) 555-0304',
    'S440091067', 'MA'
  ),
  (
    'b2000000-0000-0000-0000-000000000005',
    'Ikaika', 'Nalu', 'Kamaka',
    '1983-07-19', 'Lahaina, HI',
    'M', 'A', 'H',
    'Black', 'Brown', '6''0"', 195,
    '55 Hancock St', 'Quincy', 'MA', '02169',
    'ikaika.kamaka@example.com', '(617) 555-0305',
    'S550034729', 'MA'
  ),
  (
    'b2000000-0000-0000-0000-000000000006',
    'Noelani', 'Pua', 'Nakoa',
    '1990-12-08', 'Wailuku, HI',
    'F', 'A', 'N',
    'Brown', 'Brown', '5''6"', 140,
    '77 Cabot St', 'Beverly', 'MA', '01915',
    'noelani.nakoa@example.com', '(978) 555-0306',
    'S660057834', 'MA'
  ),
  (
    'b2000000-0000-0000-0000-000000000007',
    'Makoa', 'Kai', 'Holomalia',
    '1979-05-30', 'Kaneohe, HI',
    'M', 'A', 'N',
    'Black', 'Brown', '5''10"', 175,
    '200 Pleasant St', 'Malden', 'MA', '02148',
    'makoa.holomalia@example.com', '(781) 555-0307',
    'S770028463', 'MA'
  );

-- =============================================================================
-- PERSON ALIASES (name changes)
-- =============================================================================

INSERT INTO person_aliases (person_id, first_name, last_name, reason) VALUES
  (
    'b2000000-0000-0000-0000-000000000002',
    'Leilani', 'Fonoti',
    'Maiden Name'
  ),
  (
    'b2000000-0000-0000-0000-000000000004',
    'Maile', 'Malia',
    'Legally Changed'
  );

-- =============================================================================
-- LICENSES
-- =============================================================================

INSERT INTO licenses (
  license_number, person_id, license_type, status,
  issued_date, expiration_date, issued_by_la_id
)
SELECT
  l.license_number,
  l.person_id,
  l.license_type::license_type_enum,
  l.status::license_status_enum,
  l.issued_date,
  l.expiration_date,
  la.la_id
FROM (
  VALUES
    -- Kai Kealoha: Active LTC (Boston)
    ('LTC-KK-4412', 'b2000000-0000-0000-0000-000000000001'::UUID,
     'LTC',  'active',    '2023-06-01'::DATE, '2029-06-01'::DATE, 'Boston'),
    -- Leilani Kahananui: Active FID (Cambridge)
    ('FID-LH-8871', 'b2000000-0000-0000-0000-000000000002'::UUID,
     'FID',  'active',    '2024-01-15'::DATE, '2030-01-15'::DATE, 'Cambridge'),
    -- Koa Malama: Expired LTC (Worcester)
    ('LTC-KM-3309', 'b2000000-0000-0000-0000-000000000003'::UUID,
     'LTC',  'expired',   '2019-03-20'::DATE, '2025-03-20'::DATE, 'Worcester'),
    -- Maile Akana: Active FID (Lowell)
    ('FID-MA-6653', 'b2000000-0000-0000-0000-000000000004'::UUID,
     'FID',  'active',    '2024-09-10'::DATE, '2030-09-10'::DATE, 'Lowell'),
    -- Ikaika Kamaka: Active LTC (Quincy)
    ('LTC-IK-7720', 'b2000000-0000-0000-0000-000000000005'::UUID,
     'LTC',  'active',    '2022-11-05'::DATE, '2028-11-05'::DATE, 'Quincy'),
    -- Noelani Nakoa: Active FID (Beverly — MSP jurisdiction workaround: use Lynn)
    ('FID-NN-5591', 'b2000000-0000-0000-0000-000000000006'::UUID,
     'FID',  'active',    '2023-08-22'::DATE, '2029-08-22'::DATE, 'Lynn'),
    -- Makoa Holomalia: Suspended LTC (Lowell)
    ('LTC-MH-1138', 'b2000000-0000-0000-0000-000000000007'::UUID,
     'LTC',  'suspended', '2021-04-14'::DATE, '2027-04-14'::DATE, 'Lowell')
) AS l(license_number, person_id, license_type, status, issued_date, expiration_date, la_city)
JOIN licensing_authorities la
  ON la.city_town = l.la_city AND la.is_msp = FALSE;

-- Update Makoa's suspension reason
UPDATE licenses
   SET suspended_reason = 'Harassment Prevention Order (c.258E §4B) — Active Order Filed 2026-01-09'
 WHERE license_number = 'LTC-MH-1138';

-- =============================================================================
-- FIREARMS
-- =============================================================================

INSERT INTO firearms (
  firearm_id, serial_number, firearm_type, make, model,
  caliber, barrel_length_in, surface_finish,
  is_semi_automatic, is_privately_made, is_large_capacity,
  status, current_owner_id
) VALUES
  -- Kai Kealoha's firearms
  (
    'c3000000-0000-0000-0000-000000000001',
    'SIG-2024-PA365-KK01',
    'Handgun', 'SIG Sauer', 'P365',
    '9mm', 3.10, 'Matte Black',
    TRUE, FALSE, FALSE,
    'registered', 'b2000000-0000-0000-0000-000000000001'
  ),
  (
    'c3000000-0000-0000-0000-000000000002',
    'GLOCK-2022-G19-KK02',
    'Handgun', 'Glock', 'G19 Gen5',
    '9mm', 4.02, 'Black Polymer',
    TRUE, FALSE, FALSE,
    'registered', 'b2000000-0000-0000-0000-000000000001'
  ),
  (
    'c3000000-0000-0000-0000-000000000003',
    'RUGER-2023-AR556-KK03',
    'Rifle', 'Ruger', 'AR-556',
    '5.56 NATO', 16.10, 'Matte Black',
    TRUE, FALSE, TRUE,
    'registered', 'b2000000-0000-0000-0000-000000000001'
  ),
  -- Leilani Kahananui''s firearm
  (
    'c3000000-0000-0000-0000-000000000004',
    'SMITH-2024-M&P9-LH04',
    'Handgun', 'Smith & Wesson', 'M&P 9 Shield EZ',
    '9mm', 3.68, 'Stainless',
    TRUE, FALSE, FALSE,
    'registered', 'b2000000-0000-0000-0000-000000000002'
  ),
  -- Koa Malama''s firearm (lost — license expired)
  (
    'c3000000-0000-0000-0000-000000000005',
    'MOSSBERG-2018-500-KM05',
    'Shotgun', 'Mossberg', '500 Hunting',
    '12 Gauge', 28.00, 'Blued Steel',
    FALSE, FALSE, FALSE,
    'lost', 'b2000000-0000-0000-0000-000000000003'
  ),
  -- Ikaika Kamaka''s firearms
  (
    'c3000000-0000-0000-0000-000000000006',
    'CZ-2023-P10C-IK06',
    'Handgun', 'CZ', 'P-10 C',
    '9mm', 4.02, 'Black Nitride',
    TRUE, FALSE, FALSE,
    'registered', 'b2000000-0000-0000-0000-000000000005'
  ),
  (
    'c3000000-0000-0000-0000-000000000007',
    'SPRINGFIELD-2021-HELLS-IK07',
    'Handgun', 'Springfield Armory', 'Hellcat',
    '9mm', 3.00, 'Melonite',
    TRUE, FALSE, FALSE,
    'transferred', 'b2000000-0000-0000-0000-000000000001'   -- transferred to Kai
  ),
  -- Noelani Nakoa''s firearm
  (
    'c3000000-0000-0000-0000-000000000008',
    'RUGER-2024-LCP2-NN08',
    'Handgun', 'Ruger', 'LCP II',
    '.380 ACP', 2.75, 'Black Oxide',
    TRUE, FALSE, FALSE,
    'registered', 'b2000000-0000-0000-0000-000000000006'
  ),
  -- Makoa Holomalia''s firearm (surrendered — license suspended)
  (
    'c3000000-0000-0000-0000-000000000009',
    'TAURUS-2020-G3C-MH09',
    'Handgun', 'Taurus', 'G3C',
    '9mm', 3.26, 'Matte Black',
    TRUE, FALSE, FALSE,
    'surrendered', 'b2000000-0000-0000-0000-000000000007'
  );

-- =============================================================================
-- FA-10 TRANSACTIONS
-- =============================================================================

-- 1. Personal sale: Ikaika sold Springfield Hellcat to Kai (completed 2026-01-20)
INSERT INTO fa10_transactions (
  ticket_number, transaction_type, transaction_subtype,
  submitter_id, submitter_role,
  other_party_id, other_party_no_license,
  firearm_id, date_of_transfer, attested, status
) VALUES (
  'FA10-2026-100011',
  'personal_sale', 'Sale',
  'b2000000-0000-0000-0000-000000000005',  -- Ikaika (seller)
  'seller',
  'b2000000-0000-0000-0000-000000000001',  -- Kai (buyer)
  FALSE,
  'c3000000-0000-0000-0000-000000000007',  -- Springfield Hellcat
  '2026-01-20',
  TRUE, 'completed'
);

-- 2. Firearm registration: Noelani registering her Ruger LCP II (inherited)
INSERT INTO fa10_transactions (
  ticket_number, transaction_type,
  submitter_id, submitter_role,
  firearm_id, date_acquired, source_info,
  attested, status
) VALUES (
  'FA10-2026-100012',
  'registration',
  'b2000000-0000-0000-0000-000000000006',  -- Noelani
  'buyer',
  'c3000000-0000-0000-0000-000000000008',  -- Ruger LCP II
  '2026-02-01',
  'Inherited from estate of grandfather, Kimo Nakoa',
  TRUE, 'completed'
);

-- 3. Loan: Kai loaned his SIG P365 to Leilani (loan, not returned yet)
INSERT INTO fa10_transactions (
  ticket_number, transaction_type, transaction_subtype,
  submitter_id, submitter_role,
  other_party_id, other_party_no_license,
  firearm_id, date_of_transfer,
  attested, is_loan_returned, status
) VALUES (
  'FA10-2026-100013',
  'personal_sale', 'Loan',
  'b2000000-0000-0000-0000-000000000001',  -- Kai (lender/seller role)
  'seller',
  'b2000000-0000-0000-0000-000000000002',  -- Leilani (borrower)
  FALSE,
  'c3000000-0000-0000-0000-000000000001',  -- SIG P365
  '2026-03-10',
  TRUE, FALSE, 'completed'
);

-- =============================================================================
-- LOSS / THEFT REPORTS
-- =============================================================================

-- Koa Malama reported his Mossberg 500 stolen (2026-02-14, Worcester)
INSERT INTO loss_theft_reports (
  report_number, reporter_id, firearm_id,
  loss_date, loss_city, loss_state,
  circumstances,
  la_notified, la_notified_at,
  police_report_filed, status
) VALUES (
  'LT-2026-100005',
  'b2000000-0000-0000-0000-000000000003',   -- Koa Malama
  'c3000000-0000-0000-0000-000000000005',   -- Mossberg 500
  '2026-02-14', 'Worcester', 'MA',
  'Firearm was stored in a locked vehicle in the driveway at night. Vehicle window was smashed and the case was taken.',
  TRUE, '2026-02-14 09:22:00+00',
  TRUE, 'reported'
);

-- =============================================================================
-- DEALER TRANSACTIONS
-- =============================================================================

-- Kai Kealoha purchased Glock G19 from Boston Arms LLC (2026-01-08)
INSERT INTO dealer_transactions (
  ticket_number,
  dealer_id,
  customer_id, customer_license_id,
  transaction_type,
  is_dealer_to_dealer, is_out_of_state,
  physical_confirmed,
  firearm_id,
  is_semi_automatic, has_permit_to_purchase,
  status
)
SELECT
  'DLR-2026-100008',
  d.dealer_id,
  'b2000000-0000-0000-0000-000000000001',   -- Kai
  l.license_id,
  'Sale',
  FALSE, FALSE,
  TRUE,
  'c3000000-0000-0000-0000-000000000002',   -- Glock G19
  TRUE, FALSE,
  'completed'
FROM dealers d
CROSS JOIN licenses l
WHERE d.license_number = 'DLR-MA-00412'
  AND l.license_number = 'LTC-KK-4412';

-- Leilani Kahananui purchased S&W M&P Shield EZ from Boston Arms LLC (2026-02-03)
INSERT INTO dealer_transactions (
  ticket_number,
  dealer_id,
  customer_id, customer_license_id,
  transaction_type,
  is_dealer_to_dealer, is_out_of_state,
  physical_confirmed,
  firearm_id,
  is_semi_automatic, has_permit_to_purchase,
  status
)
SELECT
  'DLR-2026-100009',
  d.dealer_id,
  'b2000000-0000-0000-0000-000000000002',   -- Leilani
  l.license_id,
  'Sale',
  FALSE, FALSE,
  TRUE,
  'c3000000-0000-0000-0000-000000000004',   -- S&W M&P Shield EZ
  TRUE, FALSE,
  'completed'
FROM dealers d
CROSS JOIN licenses l
WHERE d.license_number = 'DLR-MA-00412'
  AND l.license_number = 'FID-LH-8871';

-- Ikaika Kamaka purchased CZ P-10C from Springfield Armory MA (2026-01-15)
INSERT INTO dealer_transactions (
  ticket_number,
  dealer_id,
  customer_id, customer_license_id,
  transaction_type,
  is_dealer_to_dealer, is_out_of_state,
  physical_confirmed,
  firearm_id,
  is_semi_automatic, has_permit_to_purchase,
  status
)
SELECT
  'DLR-2026-100010',
  d.dealer_id,
  'b2000000-0000-0000-0000-000000000005',   -- Ikaika
  l.license_id,
  'Sale',
  FALSE, FALSE,
  TRUE,
  'c3000000-0000-0000-0000-000000000006',   -- CZ P-10C
  TRUE, FALSE,
  'completed'
FROM dealers d
CROSS JOIN licenses l
WHERE d.license_number = 'DLR-MA-00777'
  AND l.license_number = 'LTC-IK-7720';

-- =============================================================================
-- STATE HOT FILES — SURRENDER
-- Makoa Holomalia surrendered his Taurus G3C after license suspension (2026-01-12)
-- =============================================================================

INSERT INTO statefiles_transactions (
  ticket_number, transaction_type,
  agency_id,
  officer_name, officer_badge,
  firearm_id,
  owner_name, owner_license_no,
  transaction_date,
  surrender_grounds
)
SELECT
  'SHF-2026-100003',
  'surrender',
  la.la_id,
  'Sgt. Patricia Oliveira', 'LPD-0147',
  'c3000000-0000-0000-0000-000000000009',   -- Taurus G3C
  'Makoa Kai Holomalia', 'LTC-MH-1138',
  '2026-01-12',
  'License suspended per Harassment Prevention Order (c.258E §4B). Firearm voluntarily surrendered per MGL c.140 §129D.'
FROM licensing_authorities la
WHERE la.city_town = 'Lowell' AND la.is_msp = FALSE;

-- =============================================================================
-- LICENSE APPLICATIONS
-- =============================================================================

-- Leilani submitted LTC renewal (upgrading from FID) — under review
INSERT INTO license_applications (
  application_number, person_id,
  application_type, license_type, status,
  licensing_authority_id,
  existing_license_id,
  has_safety_certificate,
  lost_stolen_count,
  affidavit_attested,
  proof_of_residency_type,
  electronic_signature,
  submitted_at
)
SELECT
  'APP-2026-100007',
  'b2000000-0000-0000-0000-000000000002',   -- Leilani
  'renewal', 'LTC', 'under_review',
  la.la_id,
  l.license_id,
  TRUE,
  '0',
  TRUE,
  'Massachusetts Driver License',
  'Leilani H. Kahananui',
  '2026-03-05 14:33:00+00'
FROM licensing_authorities la
CROSS JOIN licenses l
WHERE la.city_town = 'Cambridge' AND la.is_msp = FALSE
  AND l.license_number = 'FID-LH-8871';

-- Koa Malama submitted new LTC application (expired license) — submitted
INSERT INTO license_applications (
  application_number, person_id,
  application_type, license_type, status,
  licensing_authority_id,
  existing_license_id,
  has_safety_certificate,
  lost_stolen_count,
  affidavit_attested,
  proof_of_residency_type,
  electronic_signature,
  submitted_at
)
SELECT
  'APP-2026-100008',
  'b2000000-0000-0000-0000-000000000003',   -- Koa
  'new', 'LTC', 'submitted',
  la.la_id,
  l.license_id,
  TRUE,
  '1',   -- 1 stolen firearm on record
  TRUE,
  'Massachusetts Driver License',
  'Koa A. Malama',
  '2026-03-18 09:10:00+00'
FROM licensing_authorities la
CROSS JOIN licenses l
WHERE la.city_town = 'Worcester' AND la.is_msp = FALSE
  AND l.license_number = 'LTC-KM-3309';

-- =============================================================================
-- SYSTEM USERS (for login testing)
-- =============================================================================

INSERT INTO system_users (
  person_id, username, email,
  password_hash, role,
  is_active, mfa_enabled
) VALUES
  (
    'b2000000-0000-0000-0000-000000000001',
    'kai.kealoha', 'kai.kealoha@example.com',
    -- bcrypt hash of 'TestPass2026!' — do NOT use in production
    '$2b$12$demohashdemohashdemohasXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'citizen', TRUE, FALSE
  ),
  (
    'b2000000-0000-0000-0000-000000000002',
    'leilani.kahananui', 'leilani.kahananui@example.com',
    '$2b$12$demohashdemohashdemohasXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'citizen', TRUE, FALSE
  ),
  (
    'b2000000-0000-0000-0000-000000000005',
    'ikaika.kamaka', 'ikaika.kamaka@example.com',
    '$2b$12$demohashdemohashdemohasXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'citizen', TRUE, TRUE   -- MFA enabled
  );

-- =============================================================================
-- ADMIN MESSAGE (demo banner)
-- =============================================================================

INSERT INTO admin_messages (target_page, message_text, is_active)
VALUES (
  'All Pages',
  'NOTICE: System maintenance is scheduled for Saturday, April 5, 2026 from 2:00 AM to 6:00 AM. MIRCS will be unavailable during this window. Plan transactions accordingly.',
  TRUE
);
