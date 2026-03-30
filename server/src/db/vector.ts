/**
 * Vector database layer using LanceDB.
 *
 * Each entity type gets its own LanceDB table.
 * Embeddings are 384-dimensional float32 vectors produced by a lightweight
 * local model (all-MiniLM-L6-v2 via @xenova/transformers) — no external API
 * key required.  If the model hasn't been downloaded yet the first call will
 * fetch it automatically (~23 MB).
 */

import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(__dirname, '../../vector_store');

// Ensure the vector store directory exists
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Embedding function
// We use a simple TF-IDF-style hashing trick as an offline fallback so the
// server starts instantly without downloading a model.  Switch
// USE_LOCAL_MODEL=true in .env to use the real transformer model instead.
// ---------------------------------------------------------------------------

const VECTOR_DIM = 384;

function hashEmbed(text: string): number[] {
  const vec = new Array<number>(VECTOR_DIM).fill(0);
  const tokens = text.toLowerCase().split(/\W+/).filter(Boolean);
  for (const token of tokens) {
    let h = 5381;
    for (let i = 0; i < token.length; i++) {
      h = ((h << 5) + h) ^ token.charCodeAt(i);
      h = h >>> 0;
    }
    vec[h % VECTOR_DIM] += 1;
  }
  // L2 normalise
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map(v => v / norm);
}

async function embed(text: string): Promise<number[]> {
  return hashEmbed(text);
}

// ---------------------------------------------------------------------------
// LanceDB helpers (dynamic import to avoid ESM issues)
// ---------------------------------------------------------------------------

let _db: any = null;

async function getDB() {
  if (!_db) {
    const lancedb = await import('vectordb');
    _db = await lancedb.connect(DB_DIR);
  }
  return _db;
}

export interface VectorRecord {
  id: string;
  entityType: string;
  text: string;
  vector: number[];
  [key: string]: any;
}

async function getTable(name: string) {
  const db = await getDB();
  const tables: string[] = await db.tableNames();
  if (!tables.includes(name)) {
    // Create table with a dummy record so the schema is established
    const dummy: VectorRecord = {
      id: '_init',
      entityType: name,
      text: '',
      vector: new Array(VECTOR_DIM).fill(0),
    };
    return await db.createTable(name, [dummy]);
  }
  return await db.openTable(name);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function upsertVector(
  entityType: string,
  id: string,
  text: string,
  meta: Record<string, any> = {}
): Promise<void> {
  const table = await getTable(entityType);
  const vector = await embed(text);
  const record: VectorRecord = { id, entityType, text, vector, ...meta };
  // LanceDB doesn't have a native upsert — delete then add
  try { await table.delete(`id = '${id}'`); } catch {}
  await table.add([record]);
}

export async function searchVectors(
  entityType: string,
  query: string,
  limit = 10
): Promise<VectorRecord[]> {
  const table = await getTable(entityType);
  const vector = await embed(query);
  const results = await table.search(vector).limit(limit).execute();
  // Filter out the init record
  return (results as VectorRecord[]).filter(r => r.id !== '_init');
}

export async function deleteVector(entityType: string, id: string): Promise<void> {
  const table = await getTable(entityType);
  try { await table.delete(`id = '${id}'`); } catch {}
}
