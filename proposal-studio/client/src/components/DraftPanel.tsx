import { useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import type { GapAnnotation, TemplateSection } from '../types';
import { ago, Banner, GenerateButton, type PanelProps } from './common';

// Wrap any annotation excerpts found in the section text with colored <mark>s.
function highlight(text: string, anns: GapAnnotation[]): ReactNode[] {
  type Hit = { start: number; end: number; type: 'gap' | 'inferred'; note: string };
  const hits: Hit[] = [];
  const lower = text.toLowerCase();
  for (const a of anns) {
    const ex = (a.excerpt || '').trim();
    if (ex.length < 4) continue;
    const idx = lower.indexOf(ex.toLowerCase());
    if (idx !== -1) hits.push({ start: idx, end: idx + ex.length, type: a.type, note: a.note });
  }
  hits.sort((x, y) => x.start - y.start);
  // drop overlaps
  const merged: Hit[] = [];
  for (const hit of hits) {
    if (!merged.length || hit.start >= merged[merged.length - 1].end) merged.push(hit);
  }
  if (!merged.length) return [text];

  const out: ReactNode[] = [];
  let cursor = 0;
  merged.forEach((hit, i) => {
    if (hit.start > cursor) out.push(text.slice(cursor, hit.start));
    out.push(
      <mark key={i} className={hit.type} title={hit.note}>
        {text.slice(hit.start, hit.end)}
      </mark>,
    );
    cursor = hit.end;
  });
  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

function SectionDraft({
  section,
  proposalId,
  annotations,
  reviewMode,
  onUpdate,
  onError,
}: {
  section: TemplateSection;
  proposalId: string;
  annotations: GapAnnotation[];
  reviewMode: boolean;
  onUpdate: PanelProps['onUpdate'];
  onError: PanelProps['onError'];
}) {
  const [draft, setDraft] = useState(section.draft);
  const mine = annotations.filter((a) => a.sectionId === section.id);

  async function save(text: string) {
    try {
      onUpdate(await api.patch(proposalId, `section/${section.id}`, { draft: text }));
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="section-block">
      <div className="section-head">
        <div className="h">{section.heading}</div>
        <div className="muted" style={{ fontSize: 12 }}>{section.instructions}</div>
      </div>
      <div className="section-body">
        {reviewMode ? (
          draft.trim() ? (
            <div className="draft-render">{highlight(draft, mine)}</div>
          ) : (
            <div className="draft-render">
              <mark className="gap" title="Section is empty">[NO CONTENT — section not drafted]</mark>
            </div>
          )
        ) : (
          <textarea
            className="draft-area"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              if (draft !== section.draft) void save(draft);
            }}
            placeholder="Draft this section…"
          />
        )}

        {reviewMode && mine.length > 0 && (
          <div className="stack" style={{ marginTop: 10 }}>
            {mine.map((a, i) => (
              <div
                key={i}
                style={{
                  borderLeft: `3px solid ${a.type === 'gap' ? 'var(--red)' : 'var(--inferred-ink)'}`,
                  paddingLeft: 10,
                  fontSize: 13,
                }}
              >
                <b style={{ color: a.type === 'gap' ? 'var(--red)' : 'var(--inferred-ink)' }}>
                  {a.type === 'gap' ? 'GAP' : 'INFERRED'}:
                </b>{' '}
                {a.note}
                {a.type === 'inferred' && a.suggestedText && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ background: 'var(--inferred-bg)', padding: '6px 10px', borderRadius: 6 }}>
                      {a.suggestedText}
                    </div>
                    <button
                      className="small"
                      style={{ marginTop: 6 }}
                      onClick={() => {
                        const next = (draft ? draft + '\n\n' : '') + a.suggestedText;
                        setDraft(next);
                        void save(next);
                      }}
                    >
                      ＋ Insert into draft
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function DraftPanel({ proposal, onUpdate, onError }: PanelProps) {
  const [reviewMode, setReviewMode] = useState(false);
  const t = proposal.template;
  const ga = proposal.gapAnalysis;
  const unassigned = ga?.annotations.filter((a) => !a.sectionId) ?? [];

  if (!t) {
    return (
      <Banner kind="info">Generate a response template in Step 2 before drafting.</Banner>
    );
  }

  return (
    <>
      <div className="card">
        <div className="spread">
          <div>
            <h3>Draft &amp; Gap Analysis</h3>
            <div className="sub">
              Draft from prior proposals, edit inline, then analyze for gaps (red) and inferred content (blue).
            </div>
          </div>
          <div className="row">
            <GenerateButton
              className=""
              label="Draft from prior"
              onError={onError}
              onRun={async () => onUpdate(await api.generate(proposal.id, 'draft'))}
            />
            <GenerateButton
              label="Run gap analysis"
              onError={onError}
              onRun={async () => onUpdate(await api.generate(proposal.id, 'gaps'))}
            />
          </div>
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <button className={reviewMode ? '' : 'primary'} onClick={() => setReviewMode(false)}>
            ✎ Edit
          </button>
          <button className={reviewMode ? 'primary' : ''} onClick={() => setReviewMode(true)}>
            👁 Review gaps
          </button>
          {reviewMode && (
            <div className="legend" style={{ marginLeft: 'auto' }}>
              <span><span className="swatch" style={{ background: 'var(--gap-bg)' }} />Gap</span>
              <span><span className="swatch" style={{ background: 'var(--inferred-bg)' }} />Inferred</span>
            </div>
          )}
        </div>
      </div>

      {ga && (
        <div className="card">
          <div className="spread">
            <div>
              <h3>Completeness</h3>
              <div className="sub">Analyzed {ago(ga.generatedAt)}</div>
            </div>
            <div className="score-big">{ga.completenessScore}%</div>
          </div>
          <div className="meter" style={{ marginBottom: 10 }}>
            <div style={{ width: `${Math.max(0, Math.min(100, ga.completenessScore))}%` }} />
          </div>
          <p className="muted">{ga.summary}</p>
        </div>
      )}

      {t.sections.map((s) => (
        <SectionDraft
          key={s.id}
          section={s}
          proposalId={proposal.id}
          annotations={ga?.annotations ?? []}
          reviewMode={reviewMode}
          onUpdate={onUpdate}
          onError={onError}
        />
      ))}

      {reviewMode && unassigned.length > 0 && (
        <div className="card">
          <h3>General findings</h3>
          <div className="stack">
            {unassigned.map((a, i) => (
              <div key={i} style={{ fontSize: 13 }}>
                <b style={{ color: a.type === 'gap' ? 'var(--red)' : 'var(--inferred-ink)' }}>
                  {a.type === 'gap' ? 'GAP' : 'INFERRED'}:
                </b>{' '}
                {a.note}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
