import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  listProposals,
  getProposal,
  createProposal,
  updateProposal,
  deleteProposal,
} from './store.js';
import { ingest, removeDocumentFile } from './docparse.js';
import * as svc from './services.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8787;

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 30 * 1024 * 1024 } });

// Pull an API key override from the request (header or body).
function keyFrom(req: Request): string | undefined {
  return (req.header('x-anthropic-key') || req.body?.anthropic_api_key || undefined) as
    | string
    | undefined;
}

// Wrap async handlers so thrown errors become JSON 500s.
function h(fn: (req: Request, res: Response) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
}

app.get('/api/health', (_req, res) => res.json({ ok: true, model: 'claude-opus-4-8' }));

// --- Proposals CRUD --------------------------------------------------------
app.get('/api/proposals', h(async (_req, res) => res.json(await listProposals())));

app.post('/api/proposals', h(async (req, res) => {
  const p = await createProposal((req.body?.name as string) || 'Untitled Proposal');
  res.status(201).json(p);
}));

app.get('/api/proposals/:id', h(async (req, res) => {
  const p = await getProposal(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
}));

app.delete('/api/proposals/:id', h(async (req, res) => {
  const p = await getProposal(req.params.id);
  if (p) {
    if (p.rfp) await removeDocumentFile(p.rfp);
    for (const d of p.priorProposals) await removeDocumentFile(d);
  }
  await deleteProposal(req.params.id);
  res.json({ ok: true });
}));

// --- Documents -------------------------------------------------------------
app.post(
  '/api/proposals/:id/rfp',
  upload.single('file'),
  h(async (req, res) => {
    const doc = await ingest({
      name: req.file?.originalname || (req.body?.name as string) || 'RFP',
      mimetype: req.file?.mimetype,
      buffer: req.file?.buffer,
      pastedText: req.body?.text,
    });
    const p = await updateProposal(req.params.id, (p) => {
      if (p.rfp) void removeDocumentFile(p.rfp);
      p.rfp = doc;
    });
    res.json(p);
  }),
);

app.post(
  '/api/proposals/:id/prior',
  upload.single('file'),
  h(async (req, res) => {
    const doc = await ingest({
      name: req.file?.originalname || (req.body?.name as string) || 'Prior Proposal',
      mimetype: req.file?.mimetype,
      buffer: req.file?.buffer,
      pastedText: req.body?.text,
    });
    const p = await updateProposal(req.params.id, (p) => {
      p.priorProposals.push(doc);
    });
    res.json(p);
  }),
);

app.delete('/api/proposals/:id/prior/:docId', h(async (req, res) => {
  const p = await updateProposal(req.params.id, (p) => {
    const doc = p.priorProposals.find((d) => d.id === req.params.docId);
    if (doc) void removeDocumentFile(doc);
    p.priorProposals = p.priorProposals.filter((d) => d.id !== req.params.docId);
  });
  res.json(p);
}));

// --- AI generation endpoints ----------------------------------------------
app.post('/api/proposals/:id/template', h(async (req, res) => {
  const p = await getProposal(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const template = await svc.generateTemplate(p, keyFrom(req));
  const updated = await updateProposal(p.id, (p) => {
    // preserve existing drafts when regenerating, matching by heading
    if (p.template) {
      for (const s of template.sections) {
        const prev = p.template.sections.find((o) => o.heading === s.heading);
        if (prev) s.draft = prev.draft;
      }
    }
    p.template = template;
  });
  res.json(updated);
}));

app.post('/api/proposals/:id/tracker', h(async (req, res) => {
  const p = await getProposal(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const tracker = await svc.generateTracker(p, keyFrom(req));
  res.json(await updateProposal(p.id, (p) => { p.tracker = tracker; }));
}));

app.post('/api/proposals/:id/risks', h(async (req, res) => {
  const p = await getProposal(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const risks = await svc.analyzeRisks(p, keyFrom(req));
  res.json(await updateProposal(p.id, (p) => { p.risks = risks; }));
}));

app.post('/api/proposals/:id/draft', h(async (req, res) => {
  const p = await getProposal(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const drafts = await svc.draftFromPrior(p, keyFrom(req));
  res.json(await updateProposal(p.id, (p) => {
    for (const s of p.template!.sections) {
      if (drafts[s.id] != null) s.draft = drafts[s.id];
    }
  }));
}));

app.post('/api/proposals/:id/checklist', h(async (req, res) => {
  const p = await getProposal(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const checklist = await svc.generateChecklist(p, keyFrom(req));
  res.json(await updateProposal(p.id, (p) => { p.checklist = checklist; }));
}));

app.post('/api/proposals/:id/gaps', h(async (req, res) => {
  const p = await getProposal(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const gapAnalysis = await svc.analyzeGaps(p, keyFrom(req));
  res.json(await updateProposal(p.id, (p) => { p.gapAnalysis = gapAnalysis; }));
}));

app.post('/api/proposals/:id/evaluation', h(async (req, res) => {
  const p = await getProposal(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const evaluation = await svc.evaluateProposal(p, keyFrom(req));
  res.json(await updateProposal(p.id, (p) => { p.evaluation = evaluation; }));
}));

// --- Manual edits ----------------------------------------------------------
app.patch('/api/proposals/:id/section/:sectionId', h(async (req, res) => {
  const updated = await updateProposal(req.params.id, (p) => {
    const s = p.template?.sections.find((x) => x.id === req.params.sectionId);
    if (s && typeof req.body?.draft === 'string') s.draft = req.body.draft;
  });
  res.json(updated);
}));

app.patch('/api/proposals/:id/risk/:riskId', h(async (req, res) => {
  const updated = await updateProposal(req.params.id, (p) => {
    const r = p.risks?.risks.find((x) => x.id === req.params.riskId);
    if (r) {
      if (req.body?.treatment) r.treatment = req.body.treatment;
      if (typeof req.body?.treatmentNotes === 'string') r.treatmentNotes = req.body.treatmentNotes;
    }
  });
  res.json(updated);
}));

app.patch('/api/proposals/:id/tracker/:stepId', h(async (req, res) => {
  const updated = await updateProposal(req.params.id, (p) => {
    const s = p.tracker?.steps.find((x) => x.id === req.params.stepId);
    if (s && req.body?.status) s.status = req.body.status;
  });
  res.json(updated);
}));

app.patch('/api/proposals/:id/checklist/:itemId', h(async (req, res) => {
  const updated = await updateProposal(req.params.id, (p) => {
    const i = p.checklist?.items.find((x) => x.id === req.params.itemId);
    if (i && typeof req.body?.done === 'boolean') i.done = req.body.done;
  });
  res.json(updated);
}));

// --- Serve built client in production --------------------------------------
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

// --- Error handler ---------------------------------------------------------
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[error]', err?.message || err);
  res.status(err?.status || 500).json({ error: err?.message || 'Internal error' });
});

app.listen(PORT, () => {
  console.log(`Proposal Studio API listening on http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('  (ANTHROPIC_API_KEY not set — supply a key in the UI to use AI features)');
  }
});
