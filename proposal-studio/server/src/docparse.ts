import fs from 'node:fs/promises';
import path from 'node:path';
import { nanoid } from 'nanoid';
import mammoth from 'mammoth';
import type { StoredDocument } from './types.js';

const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads');

async function ensureDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

// Turn an uploaded file (or pasted text) into a StoredDocument.
export async function ingest(input: {
  name: string;
  mimetype?: string;
  buffer?: Buffer;
  pastedText?: string;
}): Promise<StoredDocument> {
  await ensureDir();
  const id = nanoid(10);
  const uploadedAt = new Date().toISOString();

  if (input.pastedText != null && !input.buffer) {
    return { id, name: input.name, kind: 'text', text: input.pastedText, uploadedAt };
  }

  const buffer = input.buffer!;
  const ext = path.extname(input.name).toLowerCase();
  const mime = input.mimetype || '';

  if (ext === '.pdf' || mime === 'application/pdf') {
    const filePath = path.join(UPLOAD_DIR, `${id}.pdf`);
    await fs.writeFile(filePath, buffer);
    return {
      id,
      name: input.name,
      kind: 'pdf',
      mediaType: 'application/pdf',
      path: filePath,
      uploadedAt,
    };
  }

  if (
    ext === '.docx' ||
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const { value } = await mammoth.extractRawText({ buffer });
    return { id, name: input.name, kind: 'text', text: value, uploadedAt };
  }

  // treat everything else (.txt, .md, .rtf-ish) as text
  return { id, name: input.name, kind: 'text', text: buffer.toString('utf8'), uploadedAt };
}

export async function removeDocumentFile(doc: StoredDocument) {
  if (doc.kind === 'pdf' && doc.path) {
    await fs.rm(doc.path, { force: true });
  }
}
