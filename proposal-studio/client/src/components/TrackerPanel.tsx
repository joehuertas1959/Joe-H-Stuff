import { api } from '../lib/api';
import type { TrackerStatus } from '../types';
import { ago, GenerateButton, type PanelProps } from './common';

const STATUSES: TrackerStatus[] = ['Not Started', 'In Progress', 'Complete', 'Blocked'];

export function TrackerPanel({ proposal, onUpdate, onError }: PanelProps) {
  const tr = proposal.tracker;
  const done = tr ? tr.steps.filter((s) => s.status === 'Complete').length : 0;

  return (
    <>
      <div className="card">
        <div className="spread">
          <div>
            <h3>Proposal Management Tracker</h3>
            <div className="sub">
              {tr
                ? `${done}/${tr.steps.length} steps complete · generated ${ago(tr.generatedAt)}`
                : 'All steps in the approval and production process for this response.'}
            </div>
          </div>
          <GenerateButton
            label={tr ? 'Regenerate' : 'Generate Tracker'}
            disabled={!proposal.rfp}
            onError={onError}
            onRun={async () => onUpdate(await api.generate(proposal.id, 'tracker'))}
          />
        </div>
        {!proposal.rfp && <div className="muted">Add a solicitation in Step 1 first.</div>}
      </div>

      {tr && (
        <div className="kanbanish">
          {tr.steps.map((s, i) => (
            <div key={s.id} className="step-row">
              <div>
                <div className="phase">{s.phase}</div>
                <div style={{ fontWeight: 600 }}>
                  {i + 1}. {s.name}
                </div>
                <div className="muted" style={{ fontSize: 13 }}>{s.description}</div>
                <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                  Owner: <b>{s.owner}</b>
                  {s.dueOffset ? ` · Due: ${s.dueOffset}` : ''}
                </div>
              </div>
              <select
                value={s.status}
                onChange={async (e) => {
                  try {
                    onUpdate(
                      await api.patch(proposal.id, `tracker/${s.id}`, { status: e.target.value }),
                    );
                  } catch (err) {
                    onError(err instanceof Error ? err.message : String(err));
                  }
                }}
                style={{ width: 140 }}
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
