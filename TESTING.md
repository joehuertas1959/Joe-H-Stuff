# MIRCS — HPD Electronic Firearms Registry System
## Testing Guide

---

## 1. Prerequisites

| Tool | Minimum version |
|------|----------------|
| Node.js | 18+ |
| npm | 9+ |

---

## 2. First-Time Setup

### 2a. Server

```bash
cd server
cp .env.example .env          # creates .env with DATABASE_URL="file:./prisma/mircs.db"

npm install                   # installs dependencies (no native binaries required)
npm run db:push               # creates the SQLite database from schema
npm run db:seed               # loads all Hawaiian test data
npm run dev                   # starts API on http://localhost:3001
```

Verify the server is running:
```bash
curl http://localhost:3001/health
# → {"status":"ok","ts":"..."}
```

### 2b. Frontend (separate terminal)

```bash
cd mircs-prototype
npm install
npm run dev                   # starts Vite dev server on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 3. Reset & Re-seed

If you want a clean slate:

```bash
cd server
npm run db:reset              # deletes mircs.db, re-applies schema, re-seeds
```

---

## 4. Test Data Summary

### Dealers (3)

| Name | License | Location |
|------|---------|----------|
| Aloha Arms & Outdoors LLC | DLR-HI-00882 | Honolulu |
| Maui Firearms & Supply | DLR-HI-01147 | Kahului |
| Kauai Shooting Sports | DLR-HI-01388 | Lihue |

### Persons (10)

| Name | City | Notable |
|------|------|---------|
| Keali'i Nakamura | Honolulu | Has pending LTC, approved PTA |
| Maile Kahananui | Honolulu | Active LTC, pending PTA |
| James Wilson | Honolulu | Active LTC (open carry), approved PTA |
| Leilani Fujimoto | Honolulu | Approved PTA expiring soon |
| David Patel | Honolulu | **Denied PTA** (D001 felony) |
| Alicia Santos | Honolulu | Pending PTA, stolen firearm report |
| Ryan Kim | Honolulu | Pending LTC, has PMF serialization |
| Margaret Costa | Hilo | **Expired LTC** (retired LE) |
| Kaimana Akana | Wailuku (Maui) | **Suspended LTC** (S001), expired PTA |
| Nalani Tran | Kapa'a (Kauai) | Approved PTA, stolen report |

### Firearms (12)

Glock G17, S&W M&P9, Remington 870, Ruger 10/22, Sig P320, PMF-1911 (HIFRB-P-888112233),
Colt SAA, Mossberg 500, Beretta 92FS, Taurus G2C, Winchester Model 70, Springfield XD-S

### Permits / PTA (8)

| Status | Count |
|--------|-------|
| approved | 4 |
| pending | 2 |
| denied | 1 |
| expired | 1 |

### Licenses / LTC (6)

| Status | Count |
|--------|-------|
| active | 2 |
| pending | 2 |
| expired | 1 |
| suspended | 1 |

### Transactions (8)

Types: Sale ×4, Transfer ×2, Loan ×1, Bequest ×1  
Statuses: completed ×3, pending ×2, approved ×1, rejected ×1

### Lost/Stolen Reports (4)

- RPT-2025-600001 — Stolen PMF pistol, Ala Moana parking (open)
- RPT-2025-600002 — Lost shotgun, Kailua-Kona (open)
- RPT-2024-600003 — Stolen S&W M&P9, Waikiki hotel (recovered)
- RPT-2026-600004 — Stolen Springfield XD-S, Kauai (open)

### Serialization Requests (4)

| Serial | Type | Status |
|--------|------|--------|
| HIFRB-P-888112233 | Pistol | issued |
| HIFRB-RI-777334455 | Rifle | pending |
| HIFRB-S-555990011 | Shotgun | issued |
| HIFRB-P-223344556 | Pistol | pending |

---

## 5. Module-by-Module Test Scenarios

### 5a. Unified Portal (/)

- **Verify live stats**: PTAs and LTCs counters pull from `/api/admin/stats` — should show `8` and `6` respectively after seeding.
- **Navigation**: click each service card — all should route correctly.

### 5b. FA-10 Transactions Portal (/fa10)

- Click **Register a Firearm** → fills the registration form.
- Click **Personal Sale or Transfer** → two-party sale workflow.
- Click **Report Loss or Theft** → pre-fills firearm search.
- **Search by serial**: try `GLK-US-A1234567` or `HIFRB-P-888112233`.

### 5c. Licensing Portal (/portal)

- **My Licenses table** should show all 6 seeded licenses loaded from `/api/licenses`.
- **Expiration warning** appears for any `active` license expiring within 90 days.
  - LTC-2025-300002 (James Wilson) expires 2026-05-01 — should trigger warning.
- Verify status badges: `active` (green), `pending` (yellow), `expired`, `suspended`.

### 5d. Dealer Portal (/dealer)

- **Dealer info card** shows Aloha Arms & Outdoors LLC (first dealer alphabetically from API).
- **Recent Activity table** shows up to 5 transactions from `/api/transactions`.
- Verify status badges: `completed` (green), `pending` (yellow), `rejected` (orange/red).

### 5e. Serialization — PMF (/serialization)

- Submit a new PMF serialization request.
- Verify the generated serial number follows the `HIFRB-P-XXXXXXXXX` format.

### 5f. Admin — HPD Tools (/admin)

**Messages tab:**
- Three seeded messages should appear (info + 2 warnings).
- Post a new message → it appears at the top of the list immediately.
- Click **Deactivate** → message disappears from the list (soft-deleted via API).

**Expired Permits tab:**
- All permits with `expiresAt < now` and `status != 'expired'` are listed.
- Currently: PTA-2025-100001 (Keali'i, expired 2025-12-31), PTA-2025-100003 (Wilson, expired 2025-11-30).

**Denial Reasons tab:**
- Static reference table — 9 reasons across Denial, Suspension, Revocation categories.
- All updated to HRS §134-7 / Hawaii code references.

### 5g. Search API

```bash
# Search persons by name
curl "http://localhost:3001/api/search?q=Nakamura"

# Search firearms by make
curl "http://localhost:3001/api/search?q=Glock&type=Firearm"

# Search permits
curl "http://localhost:3001/api/search?q=PTA-2025-100001&type=Permit"

# Search by serial number
curl "http://localhost:3001/api/search?q=GLK-US-A1234567"
```

---

## 6. API Endpoint Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| GET | /api/persons | All persons |
| GET | /api/firearms | All firearms |
| GET | /api/permits | All permits (with person) |
| GET | /api/licenses | All licenses (with person) |
| GET | /api/transactions | All transactions (with firearm, buyer, seller, dealer) |
| GET | /api/dealers | All dealers |
| GET | /api/reports | All lost/stolen reports |
| GET | /api/serialization | All serialization requests |
| GET | /api/admin/stats | Dashboard counts |
| GET | /api/admin/messages | Active admin messages |
| POST | /api/admin/messages | Create admin message |
| DELETE | /api/admin/messages/:id | Deactivate message |
| GET | /api/admin/expired-permits | Permits past expiry |
| GET | /api/search?q=&type=&limit= | Full-text search |

---

## 7. Known Prototype Limitations

- No authentication — all endpoints are open. In production, HPD SSO / OAuth2 would gate access.
- No email/SMS notifications for expiring permits or license status changes.
- Placeholder pages exist for: Inheritance transaction, Surrender, License Validation.
- State Files portal (`/statefiles`) is a prototype stub only.
- Search uses SQL `LIKE` (contains) — not semantic/vector search (no external model required).
