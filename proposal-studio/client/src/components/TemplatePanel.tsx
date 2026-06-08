import { api } from '../lib/api';
import { ago, Empty, GenerateButton, type PanelProps } from './common';

export function TemplatePanel({ proposal, onUpdate, onError }: PanelProps) {
  const t = proposal.template;
  return (
    <>
      <div className="card">
        <div className="spread">
          <div>
            <h3>Response Template</h3>
            <div className="sub">
              {t ? `Generated ${ago(t.generatedAt)} · ${t.sections.length} sections` : 'Built from the unique requirements, instructions, and evaluation factors in the solicitation.'}
            </div>
          </div>
          <GenerateButton
            label={t ? 'Regenerate' : 'Generate Template'}
            disabled={!proposal.rfp}
            onError={onError}
            onRun={async () => onUpdate(await api.generate(proposal.id, 'template'))}
          />
        </div>
        {!proposal.rfp && <div className="muted">Add a solicitation in Step 1 first.</div>}
      </div>

      {t && (
        <>
          <div className="card">
            <h3>{t.title}</h3>
            <div className="muted">{t.overview}</div>
          </div>
          {t.sections.length === 0 ? (
            <Empty>No sections were extracted.</Empty>
          ) : (
            t.sections.map((s, i) => (
              <div key={s.id} className="card">
                <div className="spread">
                  <h3>
                    {i + 1}. {s.heading}
                  </h3>
                  {s.pageOrFormatLimits && <span className="badge">{s.pageOrFormatLimits}</span>}
                </div>
                <p style={{ marginTop: 4 }}>{s.instructions}</p>
                {s.requirements.length > 0 && (
                  <>
                    <div className="muted" style={{ fontSize: 12, fontWeight: 600, marginTop: 8 }}>
                      Requirements to address:
                    </div>
                    <ul className="req-list">
                      {s.requirements.map((r, j) => (
                        <li key={j}>{r}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ))
          )}
        </>
      )}
    </>
  );
}
