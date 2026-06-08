import type { Proposal } from '../types';

const KEY_STORAGE = 'proposal-studio-anthropic-key';

export function getApiKey(): string {
  return localStorage.getItem(KEY_STORAGE) || '';
}
export function setApiKey(k: string) {
  localStorage.setItem(KEY_STORAGE, k);
}

function headers(extra?: Record<string, string>): Record<string, string> {
  const h: Record<string, string> = { ...extra };
  const key = getApiKey();
  if (key) h['x-anthropic-key'] = key;
  return h;
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export const api = {
  listProposals: () => fetch('/api/proposals').then((r) => handle<Proposal[]>(r)),

  getProposal: (id: string) => fetch(`/api/proposals/${id}`).then((r) => handle<Proposal>(r)),

  createProposal: (name: string) =>
    fetch('/api/proposals', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name }),
    }).then((r) => handle<Proposal>(r)),

  deleteProposal: (id: string) =>
    fetch(`/api/proposals/${id}`, { method: 'DELETE' }).then((r) => handle<{ ok: boolean }>(r)),

  uploadDoc: (id: string, slot: 'rfp' | 'prior', payload: { file?: File; text?: string; name?: string }) => {
    const fd = new FormData();
    if (payload.file) fd.append('file', payload.file);
    if (payload.text != null) fd.append('text', payload.text);
    if (payload.name) fd.append('name', payload.name);
    return fetch(`/api/proposals/${id}/${slot}`, { method: 'POST', body: fd }).then((r) =>
      handle<Proposal>(r),
    );
  },

  deletePrior: (id: string, docId: string) =>
    fetch(`/api/proposals/${id}/prior/${docId}`, { method: 'DELETE' }).then((r) =>
      handle<Proposal>(r),
    ),

  generate: (id: string, what: 'template' | 'tracker' | 'risks' | 'draft' | 'checklist' | 'gaps' | 'evaluation') =>
    fetch(`/api/proposals/${id}/${what}`, { method: 'POST', headers: headers() }).then((r) =>
      handle<Proposal>(r),
    ),

  exportDocx: async (id: string, filename: string) => {
    const res = await fetch(`/api/proposals/${id}/export/docx`, { headers: headers() });
    if (!res.ok) {
      let msg = `Export failed (${res.status})`;
      try {
        const body = await res.json();
        if (body?.error) msg = body.error;
      } catch {
        /* ignore */
      }
      throw new Error(msg);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  patch: (id: string, path: string, body: unknown) =>
    fetch(`/api/proposals/${id}/${path}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => handle<Proposal>(r)),
};
