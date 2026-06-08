import { useEffect, useState } from 'react';
import type { Proposal } from './types';
import { api, getApiKey, setApiKey } from './lib/api';
import { Banner, ago } from './components/common';
import { DocumentsPanel } from './components/DocumentsPanel';
import { TemplatePanel } from './components/TemplatePanel';
import { TrackerPanel } from './components/TrackerPanel';
import { RiskPanel } from './components/RiskPanel';
import { DraftPanel } from './components/DraftPanel';
import { ChecklistPanel } from './components/ChecklistPanel';
import { EvaluationPanel } from './components/EvaluationPanel';

const TABS = [
  ['documents', '1 · Documents'],
  ['template', '2 · Response Template'],
  ['tracker', '3 · Mgmt Tracker'],
  ['risk', '4 · Risk Analysis'],
  ['draft', '5 · Draft & Gaps'],
  ['checklist', '6 · Submission Checklist'],
  ['evaluation', '7 · Evaluation'],
] as const;

type TabId = (typeof TABS)[number][0];

export function App() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selected, setSelected] = useState<Proposal | null>(null);
  const [tab, setTab] = useState<TabId>('documents');
  const [error, setError] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState(getApiKey());
  const [showKey, setShowKey] = useState(false);

  async function refreshList() {
    try {
      setProposals(await api.listProposals());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  useEffect(() => {
    void refreshList();
  }, []);

  async function open(id: string) {
    setError(null);
    try {
      const p = await api.getProposal(id);
      setSelected(p);
      setTab('documents');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function createNew() {
    const name = prompt('Name this proposal / opportunity:', 'New Opportunity');
    if (name == null) return;
    const p = await api.createProposal(name);
    await refreshList();
    setSelected(p);
    setTab('documents');
  }

  function onUpdate(p: Proposal) {
    setSelected(p);
    setProposals((list) => list.map((x) => (x.id === p.id ? { ...x, updatedAt: p.updatedAt, name: p.name } : x)));
  }

  async function remove(id: string) {
    if (!confirm('Delete this proposal and its documents?')) return;
    await api.deleteProposal(id);
    if (selected?.id === id) setSelected(null);
    await refreshList();
  }

  const hasKey = !!getApiKey();

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-head">
          <div className="logo">Proposal<span>Studio</span></div>
          <div className="tagline">AI-assisted RFP/RFQ response development</div>
        </div>
        <div className="proposal-list">
          <button className="primary" style={{ width: '100%', marginBottom: 10 }} onClick={createNew}>
            + New Proposal
          </button>
          {proposals.length === 0 && <div className="muted" style={{ padding: 8 }}>No proposals yet.</div>}
          {proposals.map((p) => (
            <div
              key={p.id}
              className={`proposal-item ${selected?.id === p.id ? 'active' : ''}`}
              onClick={() => open(p.id)}
            >
              <div className="spread">
                <div className="name">{p.name}</div>
                <button
                  className="small danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    void remove(p.id);
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="meta">Updated {ago(p.updatedAt)}</div>
            </div>
          ))}
        </div>
        <div className="sidebar-foot">
          <button style={{ width: '100%' }} onClick={() => setShowKey((s) => !s)}>
            {hasKey ? '🔑 API key set' : '⚠ Set API key'}
          </button>
          {showKey && (
            <div className="stack" style={{ marginTop: 10 }}>
              <div className="muted" style={{ fontSize: 12 }}>
                Anthropic API key (stored in this browser only; sent per-request to your local server).
              </div>
              <input
                type="text"
                placeholder="sk-ant-…"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
              />
              <button
                className="primary"
                onClick={() => {
                  setApiKey(keyInput.trim());
                  setShowKey(false);
                }}
              >
                Save key
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="main">
        {!selected ? (
          <div className="content">
            <div className="card">
              <h3>Welcome to Proposal Studio</h3>
              <p className="muted">
                Create a proposal, upload the solicitation (RFP/RFQ) plus any prior proposals, and the
                workspace walks you through seven AI-assisted steps:
              </p>
              <ol className="muted">
                <li>Generate a response <b>template</b> from the solicitation's requirements</li>
                <li>Build a proposal-management <b>tracker</b> of approval steps</li>
                <li>Run a <b>risk analysis</b> and choose how to treat each risk</li>
                <li>Draft a response, drawing from <b>prior proposals</b></li>
                <li>Detect <b>gaps</b> (red) and inferred content (blue) in the draft</li>
                <li>Produce a pre-submission <b>checklist</b></li>
                <li><b>Evaluate</b> the draft as the issuing authority's evaluator would</li>
              </ol>
              <button className="primary" onClick={createNew}>+ New Proposal</button>
            </div>
          </div>
        ) : (
          <>
            <div className="topbar">
              <h1>{selected.name}</h1>
              {selected.rfp && <span className="doc-pill">RFP: {selected.rfp.name}</span>}
              <span className="doc-pill">{selected.priorProposals.length} prior proposal(s)</span>
            </div>
            <div className="tabs">
              {TABS.map(([id, label]) => (
                <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id as TabId)}>
                  {label}
                </button>
              ))}
            </div>
            <div className="content">
              {error && <Banner kind="err">{error}</Banner>}
              {!hasKey && (
                <Banner kind="info">
                  No API key set yet — AI steps will fail until you add one in the sidebar (unless the
                  server has <kbd>ANTHROPIC_API_KEY</kbd> configured).
                </Banner>
              )}
              {tab === 'documents' && <DocumentsPanel proposal={selected} onUpdate={onUpdate} onError={setError} />}
              {tab === 'template' && <TemplatePanel proposal={selected} onUpdate={onUpdate} onError={setError} />}
              {tab === 'tracker' && <TrackerPanel proposal={selected} onUpdate={onUpdate} onError={setError} />}
              {tab === 'risk' && <RiskPanel proposal={selected} onUpdate={onUpdate} onError={setError} />}
              {tab === 'draft' && <DraftPanel proposal={selected} onUpdate={onUpdate} onError={setError} />}
              {tab === 'checklist' && <ChecklistPanel proposal={selected} onUpdate={onUpdate} onError={setError} />}
              {tab === 'evaluation' && <EvaluationPanel proposal={selected} onUpdate={onUpdate} onError={setError} />}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
