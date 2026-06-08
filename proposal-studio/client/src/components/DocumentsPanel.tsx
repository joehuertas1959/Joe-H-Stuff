import { useRef, useState } from 'react';
import { api } from '../lib/api';
import { ago, Banner, type PanelProps } from './common';

function Uploader({
  slot,
  proposal,
  onUpdate,
  onError,
}: PanelProps & { slot: 'rfp' | 'prior' }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteName, setPasteName] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  async function send(payload: { file?: File; text?: string; name?: string }) {
    setBusy(true);
    try {
      onUpdate(await api.uploadDoc(proposal.id, slot, payload));
      setPasteOpen(false);
      setPasteText('');
      setPasteName('');
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <div
        className={`dropzone ${drag ? 'drag' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void send({ file: f });
        }}
        onClick={() => fileRef.current?.click()}
      >
        {busy ? (
          <span className="spinner" />
        ) : (
          <>
            Drop a <b>PDF / .docx / .txt</b> here or <u>click to browse</u>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void send({ file: f });
            e.target.value = '';
          }}
        />
      </div>
      <div className="row">
        <button className="small" onClick={() => setPasteOpen((o) => !o)}>
          {pasteOpen ? 'Cancel paste' : '✎ Paste text instead'}
        </button>
      </div>
      {pasteOpen && (
        <div className="stack">
          <input
            type="text"
            placeholder="Document name"
            value={pasteName}
            onChange={(e) => setPasteName(e.target.value)}
          />
          <textarea
            rows={8}
            placeholder="Paste the document text…"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
          />
          <button
            className="primary"
            disabled={!pasteText.trim() || busy}
            onClick={() => void send({ text: pasteText, name: pasteName || 'Pasted document' })}
          >
            Save text
          </button>
        </div>
      )}
    </div>
  );
}

export function DocumentsPanel({ proposal, onUpdate, onError }: PanelProps) {
  return (
    <>
      <Banner kind="info">
        Step 1 — add the solicitation, then (optionally) any prior proposals to reuse. Everything else
        in the workspace builds on these.
      </Banner>

      <div className="card">
        <h3>Solicitation (RFP / RFQ)</h3>
        <div className="sub">The procurement document to respond to. Required for every other step.</div>
        {proposal.rfp ? (
          <div className="spread" style={{ marginBottom: 12 }}>
            <div>
              <b>{proposal.rfp.name}</b>{' '}
              <span className="badge">{proposal.rfp.kind === 'pdf' ? 'PDF' : 'TEXT'}</span>
              <div className="meta muted">Added {ago(proposal.rfp.uploadedAt)}</div>
            </div>
          </div>
        ) : (
          <div className="muted" style={{ marginBottom: 10 }}>No solicitation added yet.</div>
        )}
        <Uploader slot="rfp" proposal={proposal} onUpdate={onUpdate} onError={onError} />
      </div>

      <div className="card">
        <h3>Prior Proposals</h3>
        <div className="sub">
          Past responses to mine for reusable content when drafting (Step 5). Optional.
        </div>
        {proposal.priorProposals.length > 0 && (
          <ul className="stack" style={{ listStyle: 'none', padding: 0, marginBottom: 12 }}>
            {proposal.priorProposals.map((d) => (
              <li key={d.id} className="spread" style={{ border: '1px solid var(--line)', borderRadius: 8, padding: '8px 12px' }}>
                <div>
                  <b>{d.name}</b> <span className="badge">{d.kind === 'pdf' ? 'PDF' : 'TEXT'}</span>
                </div>
                <button
                  className="small danger"
                  onClick={async () => {
                    try {
                      onUpdate(await api.deletePrior(proposal.id, d.id));
                    } catch (e) {
                      onError(e instanceof Error ? e.message : String(e));
                    }
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <Uploader slot="prior" proposal={proposal} onUpdate={onUpdate} onError={onError} />
      </div>
    </>
  );
}
