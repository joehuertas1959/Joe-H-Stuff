-- =============================================================================
-- MIRCS Unified Portal — PostgreSQL Database Schema
-- Massachusetts Integrated Record Check System
-- An Act Modernizing Firearms Laws (Chapter 135, Acts of 2024)
-- =============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- ENUMERATIONS
-- =============================================================================

CREATE TYPE license_type_enum AS ENUM (
  'LTC',
  'FID',
  'Machine Gun License',
  'Non-Resident LTC',
  'Gun Club License',
  'Gunsmith License',
  'Dealer License'
);

CREATE TYPE license_status_enum AS ENUM (
  'active',
  'expired',
  'suspended',
  'revoked',
  'pending'
);

CREATE TYPE application_status_enum AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'approved',
  'denied',
  'withdrawn'
);

CREATE TYPE application_type_enum AS ENUM (
  'new',
  'renewal'
);

CREATE TYPE firearm_type_enum AS ENUM (
  'Handgun',
  'Rifle',
  'Shotgun',
  'Machine Gun',
  'Stun Gun',
  'Frame',
  'Receiver'
);

CREATE TYPE firearm_status_enum AS ENUM (
  'registered',
  'lost',
  'stolen',
  'surrendered',
  'destroyed',
  'transferred',
  'pending_serialization'
);

CREATE TYPE transaction_type_enum AS ENUM (
  'personal_sale',
  'registration',
  'loss_theft',
  'inheritance',
  'surrender',
  'license_validation'
);

CREATE TYPE transaction_subtype_enum AS ENUM (
  'Sale',
  'Rental',
  'Lease',
  'Loan'
);

CREATE TYPE submitter_role_enum AS ENUM (
  'buyer',
  'seller'
);

CREATE TYPE serial_request_status_enum AS ENUM (
  'pending',
  'issued',
  'unused',
  'cancelled'
);

CREATE TYPE requester_type_enum AS ENUM (
  'licensed',
  'unlicensed'
);

CREATE TYPE statefiles_transaction_type_enum AS ENUM (
  'registration',
  'surrender',
  'change_of_custody'
);

CREATE TYPE denial_category_enum AS ENUM (
  'Denial',
  'Suspension',
  'Revocation'
);

CREATE TYPE gender_enum AS ENUM ('M', 'F', 'X', 'U');
CREATE TYPE race_enum AS ENUM ('W', 'B', 'I', 'A', 'U');
CREATE TYPE ethnicity_enum AS ENUM ('H', 'N');

-- =============================================================================
-- LICENSING AUTHORITIES
-- Police departments and Mass State Police
-- =============================================================================

CREATE TABLE licensing_authorities (
  la_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(200) NOT NULL,
  city_town      VARCHAR(100) NOT NULL,
  address        VARCHAR(255),
  phone          VARCHAR(20),
  email          VARCHAR(100),
  is_msp         BOOLEAN NOT NULL DEFAULT FALSE,  -- TRUE for towns without a PD (use MSP)
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_la_city_town ON licensing_authorities(city_town);

-- =============================================================================
-- PERSONS
-- All individuals who interact with the system
-- =============================================================================

CREATE TABLE persons (
  person_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name             VARCHAR(100) NOT NULL,
  middle_name            VARCHAR(100),
  last_name              VARCHAR(100) NOT NULL,
  suffix                 VARCHAR(20),
  date_of_birth          DATE NOT NULL,
  place_of_birth         VARCHAR(200),
  gender                 gender_enum,
  race                   race_enum,
  ethnicity              ethnicity_enum,
  hair_color             VARCHAR(50),
  eye_color              VARCHAR(50),
  height                 VARCHAR(20),
  weight_lbs             SMALLINT,
  address_line1          VARCHAR(255),
  address_line2          VARCHAR(255),
  city                   VARCHAR(100),
  state                  CHAR(2),
  zip                    VARCHAR(10),
  email                  VARCHAR(255),
  phone                  VARCHAR(20),
  driver_license_number  VARCHAR(50),
  driver_license_state   CHAR(2),
  tax_id                 VARCHAR(20),            -- For non-licensed individuals / businesses
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_persons_last_name ON persons(last_name);
CREATE INDEX idx_persons_dob ON persons(date_of_birth);

-- =============================================================================
-- PERSON ALIASES
-- Previous names / aliases for license applicants
-- =============================================================================

CREATE TABLE person_aliases (
  alias_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id   UUID NOT NULL REFERENCES persons(person_id) ON DELETE CASCADE,
  first_name  VARCHAR(100),                      -- "." if none
  last_name   VARCHAR(100) NOT NULL,
  reason      VARCHAR(100) NOT NULL,             -- Maiden Name, Legally Changed, etc.
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_aliases_person ON person_aliases(person_id);

-- =============================================================================
-- SYSTEM USERS
-- Authentication accounts linked to persons or agency staff
-- =============================================================================

CREATE TABLE system_users (
  user_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id     UUID REFERENCES persons(person_id),
  username      VARCHAR(100) UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),                    -- NULL if using SSO
  role          VARCHAR(50) NOT NULL,            -- citizen, dealer, law_enforcement, la_admin, dcjis_admin
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  mfa_enabled   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON system_users(email);
CREATE INDEX idx_users_person ON system_users(person_id);

-- =============================================================================
-- DEALERS
-- Licensed firearms dealers
-- =============================================================================

CREATE TABLE dealers (
  dealer_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_number  VARCHAR(50) UNIQUE NOT NULL,   -- e.g. DLR-MA-00412
  business_name   VARCHAR(255) NOT NULL,
  address_line1   VARCHAR(255) NOT NULL,
  address_line2   VARCHAR(255),
  city            VARCHAR(100) NOT NULL,
  state           CHAR(2) NOT NULL DEFAULT 'MA',
  zip             VARCHAR(10),
  phone           VARCHAR(20),
  email           VARCHAR(255),
  ffl_number      VARCHAR(50),                   -- Federal Firearms License number
  status          license_status_enum NOT NULL DEFAULT 'active',
  license_expiry  DATE NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dealers_license ON dealers(license_number);
CREATE INDEX idx_dealers_city ON dealers(city);

-- =============================================================================
-- FIREARMS REGISTRY
-- Master record for every firearm in the Commonwealth
-- =============================================================================

CREATE TABLE firearms (
  firearm_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_number       VARCHAR(100) UNIQUE NOT NULL,
  firearm_type        firearm_type_enum NOT NULL,
  make                VARCHAR(100) NOT NULL,
  model               VARCHAR(100) NOT NULL,
  caliber             VARCHAR(50),               -- NULL for Stun Gun, Frame, Receiver
  barrel_length_in    NUMERIC(5,2),              -- NULL for Stun Gun, Frame, Receiver
  surface_finish      VARCHAR(50),
  is_semi_automatic   BOOLEAN NOT NULL DEFAULT FALSE,
  is_privately_made   BOOLEAN NOT NULL DEFAULT FALSE,
  is_large_capacity   BOOLEAN NOT NULL DEFAULT FALSE,
  status              firearm_status_enum NOT NULL DEFAULT 'registered',
  current_owner_id    UUID REFERENCES persons(person_id),
  current_dealer_id   UUID REFERENCES dealers(dealer_id),
  registered_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_firearms_serial ON firearms(serial_number);
CREATE INDEX idx_firearms_owner ON firearms(current_owner_id);
CREATE INDEX idx_firearms_dealer ON firearms(current_dealer_id);
CREATE INDEX idx_firearms_type ON firearms(firearm_type);
CREATE INDEX idx_firearms_status ON firearms(status);

-- =============================================================================
-- LICENSES
-- Active and historical firearms licenses
-- =============================================================================

CREATE TABLE licenses (
  license_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_number    VARCHAR(50) UNIQUE NOT NULL,  -- e.g. LTC-12345, FID-88888
  person_id         UUID NOT NULL REFERENCES persons(person_id),
  license_type      license_type_enum NOT NULL,
  status            license_status_enum NOT NULL DEFAULT 'active',
  issued_date       DATE NOT NULL,
  expiration_date   DATE NOT NULL,
  issued_by_la_id   UUID NOT NULL REFERENCES licensing_authorities(la_id),
  pin_hash          VARCHAR(255),                 -- Hashed PIN for transaction verification
  suspended_reason  VARCHAR(255),
  revoked_reason    VARCHAR(255),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_licenses_number ON licenses(license_number);
CREATE INDEX idx_licenses_person ON licenses(person_id);
CREATE INDEX idx_licenses_status ON licenses(status);
CREATE INDEX idx_licenses_expiry ON licenses(expiration_date);

-- =============================================================================
-- DENIAL / SUSPENSION / REVOCATION REASONS
-- REQ-0215: Managed by DCJIS Admin
-- =============================================================================

CREATE TABLE denial_reasons (
  reason_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         VARCHAR(10) UNIQUE NOT NULL,       -- e.g. D001, S001, R001
  reason_text  VARCHAR(255) NOT NULL,
  category     denial_category_enum NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- LICENSE APPLICATIONS
-- New and renewal applications
-- =============================================================================

CREATE TABLE license_applications (
  application_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number       VARCHAR(50) UNIQUE NOT NULL,  -- e.g. APP-2026-100001
  person_id                UUID NOT NULL REFERENCES persons(person_id),
  application_type         application_type_enum NOT NULL,
  license_type             license_type_enum NOT NULL,
  status                   application_status_enum NOT NULL DEFAULT 'submitted',
  licensing_authority_id   UUID NOT NULL REFERENCES licensing_authorities(la_id),
  existing_license_id      UUID REFERENCES licenses(license_id),  -- For renewals
  has_safety_certificate   BOOLEAN NOT NULL DEFAULT TRUE,
  safety_cert_reason       VARCHAR(100),           -- If no cert
  lost_stolen_count        VARCHAR(10) NOT NULL DEFAULT '0',
  affidavit_attested       BOOLEAN NOT NULL DEFAULT FALSE,
  proof_of_residency_type  VARCHAR(100),
  electronic_signature     VARCHAR(255),
  denial_reason_id         UUID REFERENCES denial_reasons(reason_id),
  denial_notes             TEXT,
  submitted_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decided_at               TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_applications_person ON license_applications(person_id);
CREATE INDEX idx_applications_status ON license_applications(status);
CREATE INDEX idx_applications_la ON license_applications(licensing_authority_id);

-- =============================================================================
-- APPLICATION DOCUMENTS
-- Uploaded supporting documents
-- =============================================================================

CREATE TABLE application_documents (
  document_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id   UUID NOT NULL REFERENCES license_applications(application_id) ON DELETE CASCADE,
  document_type    VARCHAR(100) NOT NULL,
  storage_path     VARCHAR(500) NOT NULL,         -- Path in blob storage (e.g. Azure Blob)
  file_name        VARCHAR(255) NOT NULL,
  file_size_bytes  BIGINT,
  mime_type        VARCHAR(100),
  uploaded_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_docs_application ON application_documents(application_id);

-- =============================================================================
-- FA-10 TRANSACTIONS
-- Personal sales, registrations, loss/theft, inheritance, surrender
-- =============================================================================

CREATE TABLE fa10_transactions (
  transaction_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number            VARCHAR(50) UNIQUE NOT NULL,  -- e.g. FA10-2026-100001
  transaction_type         transaction_type_enum NOT NULL,
  transaction_subtype      transaction_subtype_enum,      -- Sale/Rental/Lease/Loan
  submitter_id             UUID NOT NULL REFERENCES persons(person_id),
  submitter_role           submitter_role_enum,            -- buyer or seller
  other_party_id           UUID REFERENCES persons(person_id),
  other_party_no_license   BOOLEAN NOT NULL DEFAULT FALSE,
  no_license_reason        VARCHAR(100),
  firearm_id               UUID NOT NULL REFERENCES firearms(firearm_id),
  date_of_transfer         DATE,
  date_acquired            DATE,
  source_info              VARCHAR(255),
  attested                 BOOLEAN NOT NULL DEFAULT FALSE,
  is_loan_returned         BOOLEAN NOT NULL DEFAULT FALSE,
  loan_return_date         DATE,
  status                   VARCHAR(20) NOT NULL DEFAULT 'completed',
  submitted_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fa10_submitter ON fa10_transactions(submitter_id);
CREATE INDEX idx_fa10_firearm ON fa10_transactions(firearm_id);
CREATE INDEX idx_fa10_type ON fa10_transactions(transaction_type);
CREATE INDEX idx_fa10_date ON fa10_transactions(submitted_at);

-- =============================================================================
-- LOSS / THEFT REPORTS
-- REQ-0016, REQ-0059
-- =============================================================================

CREATE TABLE loss_theft_reports (
  report_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_number         VARCHAR(50) UNIQUE NOT NULL,  -- e.g. LT-2026-100001
  reporter_id           UUID NOT NULL REFERENCES persons(person_id),
  firearm_id            UUID NOT NULL REFERENCES firearms(firearm_id),
  loss_date             DATE NOT NULL,
  loss_city             VARCHAR(100) NOT NULL,
  loss_state            CHAR(2) NOT NULL DEFAULT 'MA',
  circumstances         TEXT,
  la_notified           BOOLEAN NOT NULL DEFAULT TRUE,
  la_notified_at        TIMESTAMPTZ,
  police_report_filed   BOOLEAN NOT NULL DEFAULT FALSE,
  status                VARCHAR(50) NOT NULL DEFAULT 'reported',
  submitted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_loss_theft_reporter ON loss_theft_reports(reporter_id);
CREATE INDEX idx_loss_theft_firearm ON loss_theft_reports(firearm_id);

-- =============================================================================
-- DEALER TRANSACTIONS
-- Dealer-to-customer and dealer-to-dealer sales
-- =============================================================================

CREATE TABLE dealer_transactions (
  transaction_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number         VARCHAR(50) UNIQUE NOT NULL,  -- e.g. DLR-2026-100001
  dealer_id             UUID NOT NULL REFERENCES dealers(dealer_id),
  customer_id           UUID REFERENCES persons(person_id),
  customer_license_id   UUID REFERENCES licenses(license_id),
  transaction_type      transaction_subtype_enum NOT NULL DEFAULT 'Sale',
  is_dealer_to_dealer   BOOLEAN NOT NULL DEFAULT FALSE,
  dest_dealer_id        UUID REFERENCES dealers(dealer_id),  -- For D2D transfers
  is_out_of_state       BOOLEAN NOT NULL DEFAULT FALSE,
  dest_ffl_number       VARCHAR(50),
  physical_confirmed    BOOLEAN NOT NULL DEFAULT FALSE,  -- REQ-0028
  firearm_id            UUID NOT NULL REFERENCES firearms(firearm_id),
  is_semi_automatic     BOOLEAN NOT NULL DEFAULT FALSE,
  has_permit_to_purchase BOOLEAN NOT NULL DEFAULT FALSE,  -- REQ-0192
  permit_number         VARCHAR(50),
  is_loan_returned      BOOLEAN NOT NULL DEFAULT FALSE,
  loan_return_date      DATE,
  status                VARCHAR(20) NOT NULL DEFAULT 'completed',
  submitted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dealer_tx_dealer ON dealer_transactions(dealer_id);
CREATE INDEX idx_dealer_tx_customer ON dealer_transactions(customer_id);
CREATE INDEX idx_dealer_tx_firearm ON dealer_transactions(firearm_id);
CREATE INDEX idx_dealer_tx_date ON dealer_transactions(submitted_at);

-- =============================================================================
-- SERIAL NUMBER REQUESTS
-- REQ-0042 to REQ-0052, REQ-0113, REQ-0165
-- =============================================================================

CREATE TABLE serial_number_requests (
  request_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number          VARCHAR(50) UNIQUE NOT NULL,
  requester_id            UUID NOT NULL REFERENCES persons(person_id),
  requester_type          requester_type_enum NOT NULL,
  dealer_id               UUID REFERENCES dealers(dealer_id),  -- NULL for public requests
  firearm_type            firearm_type_enum NOT NULL,
  firearm_make            VARCHAR(100) NOT NULL,
  firearm_model           VARCHAR(100) NOT NULL,
  firearm_caliber         VARCHAR(50),
  firearm_barrel_length   NUMERIC(5,2),
  is_privately_made       BOOLEAN NOT NULL DEFAULT FALSE,
  means_of_production     VARCHAR(100),
  is_company_request      BOOLEAN NOT NULL DEFAULT FALSE,
  company_name            VARCHAR(255),
  assigned_serial_number  VARCHAR(100) UNIQUE,
  status                  serial_request_status_enum NOT NULL DEFAULT 'pending',
  issued_at               TIMESTAMPTZ,
  marked_unused_at        TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_serial_req_requester ON serial_number_requests(requester_id);
CREATE INDEX idx_serial_req_dealer ON serial_number_requests(dealer_id);
CREATE INDEX idx_serial_req_status ON serial_number_requests(status);
CREATE INDEX idx_serial_number ON serial_number_requests(assigned_serial_number);

-- =============================================================================
-- STATE HOT FILES TRANSACTIONS
-- REQ-0189, REQ-0199, REQ-0224, REQ-0235, REQ-0239
-- Law enforcement entries: surrenders, seizures, change of custody
-- =============================================================================

CREATE TABLE statefiles_transactions (
  transaction_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number     VARCHAR(50) UNIQUE NOT NULL,  -- e.g. SHF-2026-100001
  transaction_type  statefiles_transaction_type_enum NOT NULL,
  agency_id         UUID NOT NULL REFERENCES licensing_authorities(la_id),
  officer_name      VARCHAR(200) NOT NULL,
  officer_badge     VARCHAR(50),
  firearm_id        UUID NOT NULL REFERENCES firearms(firearm_id),
  owner_name        VARCHAR(200),
  owner_license_no  VARCHAR(50),
  transaction_date  DATE NOT NULL,
  surrender_grounds TEXT,
  custody_type      VARCHAR(100),
  custody_other     VARCHAR(100),
  case_number       VARCHAR(100),
  submitted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_statefiles_agency ON statefiles_transactions(agency_id);
CREATE INDEX idx_statefiles_firearm ON statefiles_transactions(firearm_id);
CREATE INDEX idx_statefiles_date ON statefiles_transactions(transaction_date);

-- =============================================================================
-- ADMIN MESSAGES
-- REQ-0022: Global messages posted by DCJIS admins
-- =============================================================================

CREATE TABLE admin_messages (
  message_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_page     VARCHAR(100) NOT NULL,          -- e.g. 'All Pages', 'FA-10 Landing Page'
  message_text    TEXT NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_by_id   UUID REFERENCES system_users(user_id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deactivated_at  TIMESTAMPTZ
);

CREATE INDEX idx_admin_messages_active ON admin_messages(is_active);

-- =============================================================================
-- AUDIT LOG
-- Every action in the system is recorded — required for CJIS compliance
-- =============================================================================

CREATE TABLE audit_log (
  log_id       BIGSERIAL PRIMARY KEY,
  user_id      UUID REFERENCES system_users(user_id),
  action_type  VARCHAR(100) NOT NULL,             -- e.g. LICENSE_LOOKUP, TX_SUBMITTED, LOGIN
  entity_type  VARCHAR(100),                      -- e.g. License, FA10Transaction
  entity_id    UUID,
  ip_address   INET,
  user_agent   TEXT,
  details      JSONB,                             -- Flexible additional context
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_action ON audit_log(action_type);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);

-- =============================================================================
-- SEED DATA: LICENSING AUTHORITIES
-- =============================================================================

INSERT INTO licensing_authorities (name, city_town, is_msp) VALUES
  ('Boston Police Department',       'Boston',       FALSE),
  ('Cambridge Police Department',    'Cambridge',    FALSE),
  ('Worcester Police Department',    'Worcester',    FALSE),
  ('Springfield Police Department',  'Springfield',  FALSE),
  ('Lowell Police Department',       'Lowell',       FALSE),
  ('Brockton Police Department',     'Brockton',     FALSE),
  ('Quincy Police Department',       'Quincy',       FALSE),
  ('Lynn Police Department',         'Lynn',         FALSE),
  ('New Bedford Police Department',  'New Bedford',  FALSE),
  ('Fall River Police Department',   'Fall River',   FALSE),
  ('Massachusetts State Police',     'Gosnold',      TRUE),
  ('Massachusetts State Police',     'Cuttyhunk',    TRUE);

-- =============================================================================
-- SEED DATA: DENIAL / SUSPENSION / REVOCATION REASONS (REQ-0215)
-- =============================================================================

INSERT INTO denial_reasons (code, reason_text, category) VALUES
  ('D001', 'Felony Conviction',                              'Denial'),
  ('D002', 'Domestic Violence Restraining Order',            'Denial'),
  ('D003', 'Harassment Prevention Order (c.258E §4A)',       'Denial'),
  ('D004', 'Mental Health Commitment (§35 or §35A)',         'Denial'),
  ('D005', 'Pending Felony Arraignment',                     'Denial'),
  ('S001', 'Active Restraining Order',                       'Suspension'),
  ('S002', 'Harassment Prevention Order (c.258E §4B)',       'Suspension'),
  ('R001', 'Felony Conviction (Post-License)',               'Revocation'),
  ('R002', 'Harassment Prevention Order (c.258E §4C)',       'Revocation');

-- =============================================================================
-- SEED DATA: DEMO LICENSE HOLDERS
-- =============================================================================

INSERT INTO persons (
  person_id, first_name, middle_name, last_name,
  date_of_birth, gender, race, ethnicity,
  address_line1, city, state, zip, email
) VALUES
  (
    'a1000000-0000-0000-0000-000000000001',
    'John', 'A.', 'Smith',
    '1985-06-20', 'M', 'W', 'N',
    '123 Main St', 'Boston', 'MA', '02101', 'john.smith@example.com'
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    'Alice', 'M.', 'Brown',
    '1990-03-15', 'F', 'W', 'N',
    '456 Elm St', 'Cambridge', 'MA', '02139', 'alice.brown@example.com'
  ),
  (
    'a1000000-0000-0000-0000-000000000003',
    'Mark', 'T.', 'Davis',
    '1978-11-02', 'M', 'B', 'N',
    '789 Oak Ave', 'Worcester', 'MA', '01601', 'mark.davis@example.com'
  ),
  (
    'a1000000-0000-0000-0000-000000000004',
    'Robert', 'C.', 'Jones',
    '1972-07-30', 'M', 'W', 'N',
    '321 Pine Rd', 'Springfield', 'MA', '01101', 'robert.jones@example.com'
  );

INSERT INTO licenses (
  license_number, person_id, license_type, status,
  issued_date, expiration_date, issued_by_la_id
)
SELECT
  l.license_number, l.person_id, l.license_type::license_type_enum,
  l.status::license_status_enum, l.issued_date, l.expiration_date,
  la.la_id
FROM (
  VALUES
    ('LTC-12345', 'a1000000-0000-0000-0000-000000000001'::UUID, 'LTC',         'active',    '2022-08-15'::DATE, '2028-08-15'::DATE, 'Boston'),
    ('FID-88888', 'a1000000-0000-0000-0000-000000000002'::UUID, 'FID',         'active',    '2023-01-20'::DATE, '2029-01-20'::DATE, 'Cambridge'),
    ('FID-99999', 'a1000000-0000-0000-0000-000000000003'::UUID, 'FID',         'expired',   '2018-03-01'::DATE, '2024-03-01'::DATE, 'Worcester'),
    ('LTC-SUSPEND','a1000000-0000-0000-0000-000000000004'::UUID,'LTC',         'suspended', '2021-05-20'::DATE, '2027-05-20'::DATE, 'Springfield')
) AS l(license_number, person_id, license_type, status, issued_date, expiration_date, la_city)
JOIN licensing_authorities la ON la.city_town = l.la_city AND la.is_msp = FALSE
LIMIT 4;

INSERT INTO dealers (
  license_number, business_name,
  address_line1, city, state, zip, phone,
  status, license_expiry
) VALUES
  ('DLR-MA-00412', 'Boston Arms LLC',       '500 Commonwealth Ave', 'Boston',      'MA', '02215', '(617) 555-0100', 'active', '2027-12-31'),
  ('DLR-MA-00777', 'Springfield Armory MA', '100 Industry Rd',      'Springfield', 'MA', '01101', '(413) 555-0200', 'active', '2027-11-30');
