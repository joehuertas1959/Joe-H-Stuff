# Joe-H-Stuff

## MIRCS Unified Portal — Firearms Licensing System Prototype

A React/TypeScript prototype for the Massachusetts Integrated Record Check System (MIRCS)
Unified Portal, implementing requirements from the **Massachusetts Gun Reform Bill
"An Act Modernizing Firearms Laws"** (Chapter 135, Acts of 2024).

---

## Getting Started

```bash
cd mircs-prototype
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## What's Implemented

### Modules

| Module | Route | Key Requirements |
|--------|-------|-----------------|
| **Unified Portal** | `/` | REQ-0001, REQ-0094–0098 |
| **FA-10 Gun Transaction Portal** | `/fa10` | REQ-0002, REQ-0003 |
| — Personal Sale or Transfer | `/fa10/personal-sale` | REQ-0005 (Buyer/Seller role), REQ-0018 (multi-weapon), REQ-0036 (transaction types), REQ-0056 (attestation), REQ-0182 (loans), REQ-0223 |
| — Register a Firearm | `/fa10/registration` | REQ-0055, REQ-0056, REQ-0057 (help file), REQ-0164, REQ-0219 |
| — Report Loss or Theft | `/fa10/loss-theft` | REQ-0016 (city/town + state), REQ-0059 (LA notification) |
| **MIRCS Dealer** | `/dealer` | REQ-0023 (header), REQ-0040 (city display) |
| — New Transaction | `/dealer/transaction` | REQ-0028 (physical license), REQ-0031 (status blocks), REQ-0036, REQ-0039 (D2D), REQ-0041 (dealer address on FA10), REQ-0184 (semi-auto), REQ-0192 (permit to purchase) |
| — Serial Number Request | `/dealer/serial-request` | REQ-0043, REQ-0045–0049, REQ-0051, REQ-0052 |
| **Serialization Module** | `/serialization` | REQ-0042, REQ-0044, REQ-0046, REQ-0047, REQ-0049, REQ-0051, REQ-0052, REQ-0113, REQ-0165, REQ-0220 |
| **MIRCS Portal** | `/portal` | REQ-0060, REQ-0062, REQ-0065, REQ-0177 |
| — License Application | `/portal/apply` | REQ-0063, REQ-0067 (MSP towns), REQ-0068, REQ-0069–0072 (gender field), REQ-0074, REQ-0078, REQ-0080 (proof of residency), REQ-0081, REQ-0083, REQ-0084 (affidavit), REQ-0168 (dealer training) |
| **State Hot Files Platform** | `/statefiles` | REQ-0059, REQ-0088, REQ-0189, REQ-0199 (chain of custody), REQ-0224, REQ-0235, REQ-0239 |
| **Admin / DCJIS Tools** | `/admin` | REQ-0022 (admin messages), REQ-0215 (denial reasons), REQ-0238 (expired license report) |

### Cross-Cutting Requirements

- **REQ-0006/REQ-0007**: Weapon type/make/surface finish dropdowns with type-ahead support
- **REQ-0027**: Weapon type validation (stun gun/frame/receiver exempt from barrel length & caliber)
- **REQ-0054**: Race & Ethnicity fields (NCIC aligned)
- **REQ-0125–0145**: Accessibility (WCAG 2.1), responsive design, Mayflower theme
- **REQ-0159**: "Weapon" replaced with "Firearm" throughout
- **REQ-0221**: Massachusetts Mayflower design system applied

### Serial Number Schema (REQ-0046)

```
MAFRB-H#########   Handgun
MAFRB-R#########   Rifle
MAFRB-S#########   Shotgun
MAFRB-ST#########  Stun Gun
MAFRB-M#########   Machine Gun
MAFRB-FR#########  Frame
MAFRB-RC#########  Receiver
+ "D" suffix for dealer requests
```

### Mock License Numbers (for demo)

| License No. | Name | Status |
|-------------|------|--------|
| `LTC-12345` | John A. Smith | ✅ Active |
| `FID-88888` | Alice M. Brown | ✅ Active |
| `FID-99999` | Mark T. Davis | ⚠️ Expired |
| `LTC-SUSPEND` | Robert C. Jones | ⛔ Suspended |
| `DLR-MA-00777` | Springfield Armory MA | ✅ Active (Dealer) |

---

## Tech Stack

- **React 19** + TypeScript
- **React Router v7**
- **Vite 8**
- Custom CSS (Massachusetts Mayflower design system palette)

## Requirements Source

INTERNAL MIRCS Gun Bill Requirements Tracker v2 — xFact / DCJIS
**An Act Modernizing Firearms Laws**, Chapter 135, Acts of 2024
