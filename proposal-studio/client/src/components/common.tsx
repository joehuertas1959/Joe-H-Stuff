import { useState, type ReactNode } from 'react';
import type { Proposal } from '../types';

export interface PanelProps {
  proposal: Proposal;
  onUpdate: (p: Proposal) => void;
  onError: (msg: string) => void;
}

export function GenerateButton({
  onRun,
  label,
  className = 'primary',
  disabled,
  onError,
}: {
  onRun: () => Promise<void>;
  label: string;
  className?: string;
  disabled?: boolean;
  onError?: (msg: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      className={className}
      disabled={busy || disabled}
      onClick={async () => {
        setBusy(true);
        try {
          await onRun();
        } catch (e) {
          onError?.(e instanceof Error ? e.message : String(e));
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? <span className="spinner" /> : null} {busy ? 'Working…' : label}
    </button>
  );
}

export function Banner({ kind, children }: { kind: 'err' | 'info'; children: ReactNode }) {
  return <div className={`banner ${kind}`}>{children}</div>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}

export function sevClass(v: string) {
  return v === 'High' ? 'high' : v === 'Medium' ? 'medium' : 'low';
}

export function ago(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString();
}
