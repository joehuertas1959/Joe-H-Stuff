import { api } from '../lib/api';
import type { ChecklistItem } from '../types';
import { ago, GenerateButton, type PanelProps } from './common';

export function ChecklistPanel({ proposal, onUpdate, onError }: PanelProps) {
  const cl = proposal.checklist;
  const done = cl ? cl.items.filter((i) => i.done).length : 0;
  const requiredOpen = cl ? cl.items.filter((i) => i.required && !i.done).length : 0;

  // group by category
  const groups: Record<string, ChecklistItem[]> = {};
  for (const i of cl?.items ?? []) (groups[i.category] ||= []).push(i);

  async function toggle(item: ChecklistItem) {
    try {
      onUpdate(await api.patch(proposal.id, `checklist/${item.id}`, { done: !item.done }));
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <>
      <div className="card">
        <div className="spread">
          <div>
            <h3>Pre-Submission Checklist</h3>
            <div className="sub">
              {cl
                ? `${done}/${cl.items.length} done · ${requiredOpen} required item(s) remaining · generated ${ago(cl.generatedAt)}`
                : 'Every required step, form, certification, attachment, and format rule before submitting.'}
            </div>
          </div>
          <GenerateButton
            label={cl ? 'Regenerate' : 'Generate Checklist'}
            disabled={!proposal.rfp}
            onError={onError}
            onRun={async () => onUpdate(await api.generate(proposal.id, 'checklist'))}
          />
        </div>
        {!proposal.rfp && <div className="muted">Add a solicitation in Step 1 first.</div>}
      </div>

      {Object.entries(groups).map(([cat, items]) => (
        <div key={cat} className="card">
          <h3>{cat}</h3>
          <div className="stack">
            {items.map((i) => (
              <label
                key={i.id}
                className="row"
                style={{ alignItems: 'flex-start', cursor: 'pointer', gap: 10 }}
              >
                <input
                  type="checkbox"
                  checked={i.done}
                  onChange={() => void toggle(i)}
                  style={{ width: 'auto', marginTop: 3 }}
                />
                <div style={{ flex: 1 }}>
                  <div>
                    <b style={{ textDecoration: i.done ? 'line-through' : 'none' }}>{i.label}</b>{' '}
                    {i.required && <span className="badge req">Required</span>}
                  </div>
                  <div className="muted" style={{ fontSize: 13 }}>{i.detail}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
