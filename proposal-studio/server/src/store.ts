import fs from 'node:fs/promises';
import path from 'node:path';
import { nanoid } from 'nanoid';
import type { Proposal } from './types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'proposals.json');

let cache: Proposal[] | null = null;

async function load(): Promise<Proposal[]> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(DB_PATH, 'utf8');
    cache = JSON.parse(raw) as Proposal[];
  } catch {
    cache = [];
  }
  return cache;
}

async function persist() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(cache ?? [], null, 2));
}

export async function listProposals(): Promise<Proposal[]> {
  const all = await load();
  return [...all].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getProposal(id: string): Promise<Proposal | undefined> {
  const all = await load();
  return all.find((p) => p.id === id);
}

export async function createProposal(name: string): Promise<Proposal> {
  const all = await load();
  const now = new Date().toISOString();
  const proposal: Proposal = {
    id: nanoid(10),
    name: name || 'Untitled Proposal',
    createdAt: now,
    updatedAt: now,
    priorProposals: [],
  };
  all.push(proposal);
  await persist();
  return proposal;
}

export async function updateProposal(
  id: string,
  mutate: (p: Proposal) => void,
): Promise<Proposal> {
  const all = await load();
  const p = all.find((x) => x.id === id);
  if (!p) throw new Error('Proposal not found');
  mutate(p);
  p.updatedAt = new Date().toISOString();
  await persist();
  return p;
}

export async function deleteProposal(id: string): Promise<void> {
  const all = await load();
  const idx = all.findIndex((p) => p.id === id);
  if (idx !== -1) {
    all.splice(idx, 1);
    await persist();
  }
}
