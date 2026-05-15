# HHS Procurement Intelligence Scanner

**PROMPTJH-SCAN v4.1** | Effective: 2026-05-15

A full-stack web application that scans live procurement sources to identify HHS-related IT procurement opportunities across all 50 states + U.S. territories, using the PROMPTJH v4.0 specification.

---

## Quick Start

```bash
cd hhs-procurement-scanner
npm install
npm start
# Open http://localhost:3000
```

## Features

- **Live scraping** of procurement sources across 4 tier cadences covering all 50 states + PR, GU, VI
- **24-column schema** per PROMPTJH v4.0 (all required fields)
- **Excel export** — 6-sheet workbook: Full_Scan_Findings, Pipeline_Summary, State_Priority_Matrix, Vendor_Matrix, Confirmed_Unchanged_Log, Prompt_Improvement_Flags
- **Markdown export** — Daily Roundup format per Section 5.5
- **H.R. 1 readiness scores** for top-20 priority states
- **Auto-classification** of opportunities into 30+ category flags (MES, COOP, ERM, AUDIT, MCO, MMIS, etc.)
- **Win Probability** auto-calculated from state readiness, incumbent context, and opportunity scope
- **Urgency classification** — EXPIRED / CRITICAL / HIGH / MEDIUM / LOW / WATCH
- **Exclusion filter** per Section 6.3: removes sub-$500K, expired, non-HHS-program, financial-only entries, and false positives (non-procurement page content)
- **URL normalization** — broken document links fall back to the portal URL automatically
- **H.R. 1 CE deadline countdown** (Jan. 1, 2027)

## Sources Scanned

| Tier | Cadence | Source | Coverage |
|------|---------|--------|----------|
| 1 | Daily | TennCare Upcoming Procurements | TN |
| 1 | Daily | Virginia DMAS Procurement | VA |
| 1 | Daily | Oklahoma OHCA Procurement | OK |
| 1 | Daily | Nevada NEVADAePro | NV |
| 1 | Daily | Nebraska DHHS | NE |
| 1 | Daily | Hawaii Med-QUEST | HI |
| 1 | Daily | Illinois HFS | IL |
| 2 | Weekly | Iowa DAS BidOpportunities (DataTables) | IA |
| 2 | Weekly | CMS APD Database (MACPro) | Federal |
| 2 | Weekly | State Health Portals (direct scrape) | 43 states + PR, GU, VI |
| 2 | Weekly | HMA Weekly Roundup (signal intelligence) | All states |
| 2 | Weekly | BidNet Direct (public RFP catalog) | All states |
| 3 | Weekly | SAM.gov API (6 keyword sets) | Federal + all states |
| 3 | Weekly | USASpending.gov API (HHS/CMS contracts) | Federal + all states |
| 4 | Monthly | HHS OIG Work Plan (signal intelligence) | Federal |

> **GovWin IQ (Deltek):** Requires a paid subscription — not included in automated scanning.
> Contact Deltek to license GovWin data feeds. Manual GovWin searches should supplement this tool.

## SAM.gov API Key

The app uses `DEMO_KEY` by default (100 req/day). For production use, register a free API key at [sam.gov](https://sam.gov) and enter it in the Scan Controls panel.

## Project Structure

```
hhs-procurement-scanner/
├── server.js                    # Express server + API routes
├── server/
│   ├── store.js                 # JSON data persistence
│   ├── scrapers/
│   │   ├── index.js             # Scraper orchestrator
│   │   ├── reference-data.js    # H.R.1 scores, classification, urgency
│   │   ├── sam-gov.js           # SAM.gov API (6 keyword sets)
│   │   ├── usaspending.js       # USASpending.gov API
│   │   ├── oig-workplan.js      # HHS OIG Work Plan HTML scraper
│   │   ├── cms-apd.js           # CMS APD / MACPro scraper
│   │   ├── tenncare.js          # TennCare portal scraper
│   │   ├── virginia.js          # Virginia DMAS scraper
│   │   ├── oklahoma.js          # Oklahoma OHCA scraper
│   │   └── iowa.js              # Iowa DAS DataTables scraper
│   └── exporters/
│       ├── excel.js             # 24-col, 6-sheet Excel workbook
│       └── markdown.js          # Daily Roundup markdown
├── public/
│   ├── index.html               # Dashboard UI
│   ├── app.js                   # Frontend logic
│   └── styles.css               # Styling
└── data/
    └── opportunities.json       # Persistent data store (auto-created)
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/status` | Server status, scan state, opportunity count |
| GET | `/api/opportunities` | All opportunities (filterable by state, category, urgency, win_probability, q) |
| POST | `/api/scan` | Trigger scan — body: `{ tier: "all"|"1"|"2"|"3"|"4", sam_api_key: "..." }` |
| GET | `/api/pipeline-summary` | Aggregated pipeline stats |
| GET | `/api/scan-log` | Last 50 scan log entries |
| GET | `/api/export/excel` | Download Excel workbook |
| GET | `/api/export/markdown` | Download Daily Roundup markdown |
| DELETE | `/api/opportunities` | Clear all stored opportunities |

---

*Confidential — Internal Use Only · Client: JH · PROMPTJH v4.0 · Next scheduled review: 2026-07-01*
