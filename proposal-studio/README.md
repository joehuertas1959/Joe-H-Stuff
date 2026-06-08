# Proposal Studio

An AI-assisted platform for developing and managing responses to procurement
solicitations (RFPs / RFQs). Upload a solicitation and prior proposals, and the
workspace walks a proposal manager through seven AI-assisted steps powered by
Claude (`claude-opus-4-8` via the Anthropic API).

## The seven capabilities

1. **Response Template** — extracts the unique requirements, specifications,
   instructions, and directions from the solicitation and builds a structured
   response template.
2. **Proposal Management Tracker** — generates the ordered steps in the approval
   and production process, with owners, phases, and relative due dates; statuses
   are editable.
3. **Risk Analysis** — surfaces the risks of pursuing/submitting the proposal
   with recommended mitigations, and lets you treat each risk
   (**Accept / Mitigate / Transfer / Avoid**) with notes.
4. **Draft from Prior Proposals** — analyzes prior proposals and fills the
   response template into a first-pass draft.
5. **Submission Checklist** — produces a pre-submission checklist of every
   required step, form, certification, attachment, and format rule.
6. **Gap Analysis** — analyzes the current draft and flags **gaps in
   highlighted red** and **inferred/extrapolated content in highlighted blue**,
   with the option to insert suggested content.
7. **Evaluation** — scores the draft against the solicitation's stated
   evaluation criteria, as an evaluator on the issuing authority's team would,
   and recommends how to improve the score.

## Architecture

```
proposal-studio/
├── server/   Node + Express + TypeScript API (Anthropic SDK, PDF/DOCX parsing)
└── client/   React + TypeScript + Vite single-page app
```

The frontend never calls Claude directly — all AI logic lives behind the REST
API in `server/src/services.ts`, so the backend can be swapped (e.g. to Next.js
API routes or a Python service) without touching the UI.

Documents:
- **PDF** is sent to Claude as a native document block (no lossy text extraction).
- **.docx** is converted to text server-side via `mammoth`.
- **.txt / pasted text** is used directly.

Data is persisted to `server/data/proposals.json`; uploaded PDFs live in
`server/data/uploads/` (both gitignored).

## Getting started

```bash
cd proposal-studio
npm run install:all      # installs root, server, and client deps

# Provide your Anthropic API key (either way works):
export ANTHROPIC_API_KEY=sk-ant-...   # server-side, OR enter it in the UI sidebar

npm run dev              # starts API (http://localhost:8787) + UI (http://localhost:5174)
```

Open <http://localhost:5174>. If you don't set `ANTHROPIC_API_KEY` on the
server, click **Set API key** in the sidebar — the key is stored only in your
browser and sent per-request to your local server.

### Production build

```bash
npm run build           # builds the client into client/dist
npm start               # server serves the API + the built client on :8787
```

## API surface

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/proposals` | list proposals |
| `POST` | `/api/proposals` | create proposal |
| `GET/DELETE` | `/api/proposals/:id` | fetch / delete |
| `POST` | `/api/proposals/:id/rfp` | upload solicitation (file or text) |
| `POST` | `/api/proposals/:id/prior` | add a prior proposal |
| `POST` | `/api/proposals/:id/template` | generate response template |
| `POST` | `/api/proposals/:id/tracker` | generate management tracker |
| `POST` | `/api/proposals/:id/risks` | run risk analysis |
| `POST` | `/api/proposals/:id/draft` | draft from prior proposals |
| `POST` | `/api/proposals/:id/checklist` | generate submission checklist |
| `POST` | `/api/proposals/:id/gaps` | run gap analysis |
| `POST` | `/api/proposals/:id/evaluation` | evaluate the draft |
| `PATCH` | `/api/proposals/:id/section/:sectionId` | edit a section draft |
| `PATCH` | `/api/proposals/:id/risk/:riskId` | set risk treatment |
| `PATCH` | `/api/proposals/:id/tracker/:stepId` | update step status |
| `PATCH` | `/api/proposals/:id/checklist/:itemId` | toggle checklist item |

## Notes

- The Anthropic API key supplied from the UI is sent via the `x-anthropic-key`
  header to your **local** server only; it is never persisted server-side.
- This is a single-user local tool; storage is a JSON file, not a database.
