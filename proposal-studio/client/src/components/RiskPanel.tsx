import { useState } from 'react';
import { api } from '../lib/api';
import type { RiskItem, RiskTreatment } from '../types';
import { ago, GenerateButton, sevClass, type PanelProps } from './common';

const TREATMENTS: RiskTreatment[] = ['Unaddressed', 'Accept', 'Mitigate', 'Transfer', 'Avoid'];

function RiskCard({ risk, proposalId, onUpdate, onError }: { risk: RiskItem } & Omit<PanelProps, 'proposal'> & { proposalId: string }) {
  const [notes, setNotes] = useState(risk.treatmentNotes);

  async function save(patch: { treatment?: RiskTreatment; treatmentNotes?: string }) {
    try {
      onUpdate(await api.patch(proposalId, `risk/${risk.id}`, patch));
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className={`card risk-card t-${risk.treatment}`}>
      <div className="spread">
        <h3>{risk.title}</h3>
        <span className="badge">{risk.category}</span>
      </div>
      <div className="row" style={{ margin: '4px 0 8px' }}>
        <span className={`badge ${sevClass(risk.likelihood)}`}>Likelihood: {risk.likelihood}</span>
        <span className={`badge ${sevClass(risk.impact)}`}>Impact: {risk.impact}</span>
      </div>
      <p>{risk.description}</p>
      <div style={{ background: '#f7f9fb', borderRadius: 8, padding: '8px 12px', marginBottom: 10 }}>
        <b>Recommendation:</b> {risk.recommendation}
      </div>
      <div className="row">
        <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>Treatment:</span>
        {TREATMENTS.map((tr) => (
          <button
            key={tr}
            className={`small ${risk.treatment === tr ? 'primary' : ''}`}
            onClick={() => void save({ treatment: tr })}
          >
            {tr}
          </button>
        ))}
      </div>
      <textarea
        rows={2}
        style={{ marginTop: 8 }}
        placeholder="Treatment notes / decision rationale…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={() => {
          if (notes !== risk.treatmentNotes) void save({ treatmentNotes: notes });
        }}
      />
    </div>
  );
}

export function RiskPanel({ proposal, onUpdate, onError }: PanelProps) {
  const ra = proposal.risks;
  const open = ra ? ra.risks.filter((r) => r.treatment === 'Unaddressed').length : 0;

  return (
    <>
      <div className="card">
        <div className="spread">
          <div>
            <h3>Risk Analysis</h3>
            <div className="sub">
              {ra
                ? `${ra.risks.length} risks · ${open} unaddressed · generated ${ago(ra.generatedAt)}`
                : 'Risks of pursuing and submitting this proposal, with recommended mitigations. Choose how to treat each.'}
            </div>
          </div>
          <GenerateButton
            label={ra ? 'Regenerate' : 'Run Risk Analysis'}
            disabled={!proposal.rfp}
            onError={onError}
            onRun={async () => onUpdate(await api.generate(proposal.id, 'risks'))}
          />
        </div>
        {!proposal.rfp && <div className="muted">Add a solicitation in Step 1 first.</div>}
      </div>

      {ra?.risks.map((r) => (
        <RiskCard
          key={r.id}
          risk={r}
          proposalId={proposal.id}
          onUpdate={onUpdate}
          onError={onError}
        />
      ))}
    </>
  );
}
