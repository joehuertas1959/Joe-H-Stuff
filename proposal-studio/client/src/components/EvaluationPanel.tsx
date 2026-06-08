import { api } from '../lib/api';
import { ago, Banner, GenerateButton, type PanelProps } from './common';

export function EvaluationPanel({ proposal, onUpdate, onError }: PanelProps) {
  const ev = proposal.evaluation;
  const pct = ev && ev.maxScore > 0 ? Math.round((ev.totalScore / ev.maxScore) * 100) : 0;

  if (!proposal.template) {
    return <Banner kind="info">Generate a template and draft your response before evaluating.</Banner>;
  }

  return (
    <>
      <div className="card">
        <div className="spread">
          <div>
            <h3>Evaluation</h3>
            <div className="sub">
              Scored against the solicitation's evaluation criteria, as the issuing authority's evaluator
              would.
            </div>
          </div>
          <GenerateButton
            label={ev ? 'Re-evaluate' : 'Run Evaluation'}
            onError={onError}
            onRun={async () => onUpdate(await api.generate(proposal.id, 'evaluation'))}
          />
        </div>
      </div>

      {ev && (
        <>
          <div className="card">
            <div className="spread">
              <div>
                <div className="score-big">
                  {ev.totalScore} <span className="muted" style={{ fontSize: 18 }}>/ {ev.maxScore}</span>
                </div>
                <div className="muted">{pct}% of available points · evaluated {ago(ev.generatedAt)}</div>
              </div>
            </div>
            <div className="meter" style={{ margin: '10px 0' }}>
              <div style={{ width: `${pct}%` }} />
            </div>
            <p>{ev.summary}</p>
          </div>

          <div className="card">
            <h3>Top recommendations to improve the score</h3>
            <ol className="stack" style={{ paddingLeft: 18 }}>
              {ev.topRecommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ol>
          </div>

          {ev.criteria.map((c, i) => {
            const cpct = c.maxPoints > 0 ? Math.round((c.awardedPoints / c.maxPoints) * 100) : 0;
            return (
              <div key={i} className="card">
                <div className="spread">
                  <h3>{c.criterion}</h3>
                  <b>
                    {c.awardedPoints} / {c.maxPoints}
                  </b>
                </div>
                <div className="meter" style={{ margin: '6px 0 10px' }}>
                  <div style={{ width: `${cpct}%` }} />
                </div>
                <p>{c.rationale}</p>
                {c.improvements.length > 0 && (
                  <>
                    <div className="muted" style={{ fontSize: 12, fontWeight: 600 }}>To improve:</div>
                    <ul className="req-list">
                      {c.improvements.map((imp, j) => (
                        <li key={j}>{imp}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            );
          })}
        </>
      )}
    </>
  );
}
