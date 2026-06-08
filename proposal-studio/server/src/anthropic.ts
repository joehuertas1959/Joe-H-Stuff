import Anthropic from '@anthropic-ai/sdk';
import fs from 'node:fs/promises';
import type { StoredDocument } from './types.js';

export const MODEL = 'claude-opus-4-8';

function getClient(apiKey?: string): Anthropic {
  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      'No Anthropic API key. Set ANTHROPIC_API_KEY in the environment or pass one from the UI.',
    );
  }
  return new Anthropic({ apiKey: key });
}

// A content source we hand to Claude: either inline text or a PDF document block.
export type ContentSource =
  | { kind: 'text'; label: string; text: string }
  | { kind: 'pdf'; label: string; base64: string; mediaType: string };

export async function documentToSource(doc: StoredDocument): Promise<ContentSource> {
  if (doc.kind === 'pdf' && doc.path) {
    const buf = await fs.readFile(doc.path);
    return {
      kind: 'pdf',
      label: doc.name,
      base64: buf.toString('base64'),
      mediaType: doc.mediaType || 'application/pdf',
    };
  }
  return { kind: 'text', label: doc.name, text: doc.text || '' };
}

// Build the `content` array for a user message from sources + an instruction.
function buildContent(sources: ContentSource[], instruction: string): any[] {
  const content: any[] = [];
  for (const src of sources) {
    if (src.kind === 'pdf') {
      content.push({ type: 'text', text: `=== Document: ${src.label} (PDF) ===` });
      content.push({
        type: 'document',
        source: { type: 'base64', media_type: src.mediaType, data: src.base64 },
      });
    } else {
      content.push({
        type: 'text',
        text: `=== Document: ${src.label} ===\n${src.text}\n=== End of ${src.label} ===`,
      });
    }
  }
  content.push({ type: 'text', text: instruction });
  return content;
}

interface CallOptions {
  apiKey?: string;
  system: string;
  sources?: ContentSource[];
  instruction: string;
  maxTokens?: number;
}

// Core call. Tries adaptive thinking; falls back to a plain request if the
// installed SDK / API rejects the advanced parameters.
async function callClaude(opts: CallOptions): Promise<string> {
  const client = getClient(opts.apiKey);
  const content = buildContent(opts.sources || [], opts.instruction);
  const base: any = {
    model: MODEL,
    max_tokens: opts.maxTokens ?? 16000,
    system: opts.system,
    messages: [{ role: 'user', content }],
  };

  const attempts: any[] = [
    { ...base, thinking: { type: 'adaptive' }, output_config: { effort: 'high' } },
    base,
  ];

  let lastErr: unknown;
  for (const params of attempts) {
    try {
      const resp: any = await client.messages.create(params);
      const text = (resp.content || [])
        .filter((b: any) => b.type === 'text')
        .map((b: any) => b.text)
        .join('\n')
        .trim();
      if (text) return text;
      lastErr = new Error('Empty response from model');
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Model call failed');
}

export async function callClaudeText(opts: CallOptions): Promise<string> {
  return callClaude(opts);
}

// Ask Claude for JSON and parse it robustly (strips ``` fences, finds the
// outermost JSON object/array if the model adds prose around it).
export async function callClaudeJSON<T>(opts: CallOptions): Promise<T> {
  const raw = await callClaude({
    ...opts,
    instruction:
      opts.instruction +
      '\n\nRespond with ONLY valid JSON matching the requested schema. No markdown, no commentary, no code fences.',
  });
  return parseJSON<T>(raw);
}

export function parseJSON<T>(raw: string): T {
  let s = raw.trim();
  // strip code fences if present
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  try {
    return JSON.parse(s) as T;
  } catch {
    // find first { or [ and matching last } or ]
    const start = s.search(/[{[]/);
    const end = Math.max(s.lastIndexOf('}'), s.lastIndexOf(']'));
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(s.slice(start, end + 1)) as T;
    }
    throw new Error('Model did not return parseable JSON:\n' + raw.slice(0, 500));
  }
}
