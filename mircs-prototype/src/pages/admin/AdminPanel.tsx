// RFP-HPD-1954933: Admin — HPD Electronic Firearms Registry System
// REQ-0022: Post Global/Admin Messages
// REQ-0238: Licensing Authority Report for Expired Permits
// REQ-0215: Denial/Suspension/Revocation Reasons Reference Data
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminMessages, createAdminMessage, deleteAdminMessage, getExpiredPermits } from '../../api/client';

const DENIAL_REASONS = [
  { code: 'D001', reason: 'Felony Conviction',                              cat: 'Denial',     active: true },
  { code: 'D002', reason: 'Domestic Violence Restraining Order',            cat: 'Denial',     active: true },
  { code: 'D003', reason: 'Harassment Prevention Order (HRS §586)',         cat: 'Denial',     active: true },
  { code: 'D004', reason: 'Mental Health Commitment (HRS §334)',            cat: 'Denial',     active: true },
  { code: 'D005', reason: 'Pending Felony Arraignment',                     cat: 'Denial',     active: true },
  { code: 'S001', reason: 'Active Restraining Order',                       cat: 'Suspension', active: true },
  { code: 'S002', reason: 'Domestic Violence Temporary Restraining Order',  cat: 'Suspension', active: true },
  { code: 'R001', reason: 'Felony Conviction (Post-License)',               cat: 'Revocation', active: true },
  { code: 'R002', reason: 'Mental Health Adjudication (Post-License)',      cat: 'Revocation', active: true },
];

export default function AdminPanel() {
  const navigate = useNavigate();

  const [messages, setMessages]           = useState<any[]>([]);
  const [expiredPermits, setExpiredPermits] = useState<any[]>([]);
  const [newMessage, setNewMessage]       = useState('');
  const [newTarget, setNewTarget]         = useState('Unified Portal Landing Page');
  const [newSeverity, setNewSeverity]     = useState('info');
  const [activeTab, setActiveTab]         = useState<'messages' | 'expired' | 'denial-reasons'>('messages');
  const [loadingMsgs, setLoadingMsgs]     = useState(true);
  const [loadingExpired, setLoadingExpired] = useState(false);

  useEffect(() => {
    getAdminMessages()
      .then(setMessages)
      .catch(() => {})
      .finally(() => setLoadingMsgs(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'expired') {
      setLoadingExpired(true);
      getExpiredPermits()
        .then(setExpiredPermits)
        .catch(() => {})
        .finally(() => setLoadingExpired(false));
    }
  }, [activeTab]);

  async function addMessage() {
    if (!newMessage.trim()) return;
    try {
      const msg = await createAdminMessage({ title: newTarget, body: newMessage, severity: newSeverity, active: true });
      setMessages(prev => [msg, ...prev]);
      setNewMessage('');
    } catch {}
  }

  async function deactivateMessage(id: string) {
    try {
      await deleteAdminMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch {}
  }

  return (
    <div>
      <button className="back-nav" onClick={() => navigate('/')}>← Back to Unified Portal</button>
      <h1 style={{ color: '#0d3f6b' }}>Admin / HPD Tools</h1>

      <div className="steps" style={{ marginBottom: '1.5rem' }}>
        {([
          { id: 'messages'       as const, label: '📢 Admin Messages' },
          { id: 'expired'        as const, label: '⚠️ Expired Permits Report' },
          { id: 'denial-reasons' as const, label: '📋 Denial / Revocation Reasons' },
        ]).map(tab => (
          <button key={tab.id} className={`step ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── MESSAGES TAB ── */}
      {activeTab === 'messages' && (
        <div>
          <div className="card">
            <div className="card-title">Post New System Message</div>
            <div className="form-group">
              <label className="form-label">Target Page <span className="required-mark">*</span></label>
              <select className="form-control" value={newTarget} onChange={e => setNewTarget(e.target.value)} style={{ maxWidth: 400 }}>
                <option>Unified Portal Landing Page</option>
                <option>HPD Dealer Portal Landing Page</option>
                <option>FA-10 Transactions Portal Landing Page</option>
                <option>Licensing Portal Landing Page</option>
                <option>All Pages</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Severity</label>
              <select className="form-control" value={newSeverity} onChange={e => setNewSeverity(e.target.value)} style={{ maxWidth: 200 }}>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Message <span className="required-mark">*</span></label>
              <textarea className="form-control" rows={3} value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Enter the message to display…" />
            </div>
            <button className="btn btn-primary" onClick={addMessage} disabled={!newMessage.trim()}>📢 Post Message</button>
          </div>

          <div className="card">
            <div className="card-title">Active Messages</div>
            {loadingMsgs && <p style={{ color: '#616161' }}>Loading messages…</p>}
            {!loadingMsgs && messages.length === 0 && <p style={{ color: '#616161' }}>No active messages.</p>}
            {messages.map(msg => (
              <div key={msg.id} style={{ border: '1px solid #d0d0d0', borderRadius: 4, padding: '0.75rem', marginBottom: '0.75rem', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#14558f', marginBottom: '0.25rem' }}>
                      📍 {msg.title} &nbsp;|&nbsp; {new Date(msg.createdAt).toLocaleDateString()} &nbsp;
                      <span className={`badge ${msg.severity === 'critical' ? 'badge-suspended' : msg.severity === 'warning' ? 'badge-pending' : 'badge-active'}`}>
                        {msg.severity}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>{msg.body}</div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => deactivateMessage(msg.id)}>Deactivate</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── EXPIRED PERMITS TAB ── */}
      {activeTab === 'expired' && (
        <div className="card">
          <div className="card-title">Expired Permits — Honolulu Police Department</div>
          <p style={{ color: '#616161', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Permits that have passed their expiration date and have not been updated to "expired" status.
          </p>
          {loadingExpired ? (
            <p style={{ color: '#616161' }}>Loading…</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Permit No.</th><th>Holder</th><th>Type</th><th>Expired</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {expiredPermits.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: '#616161' }}>No overdue permits found.</td></tr>
                  ) : expiredPermits.map((p: any) => (
                    <tr key={p.id}>
                      <td>{p.permitNumber}</td>
                      <td>{p.person ? `${p.person.lastName}, ${p.person.firstName}` : '—'}</td>
                      <td style={{ fontSize: '0.82rem' }}>{p.type === 'PTA_PISTOL_REVOLVER' ? 'Pistol/Revolver' : 'Rifle/Shotgun'}</td>
                      <td style={{ color: '#cd0000', fontWeight: 600 }}>
                        {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString() : '—'}
                      </td>
                      <td><span className="badge badge-expired">{p.status}</span></td>
                      <td><button className="btn btn-secondary btn-sm">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── DENIAL REASONS TAB ── */}
      {activeTab === 'denial-reasons' && (
        <div className="card">
          <div className="card-title">Manage Denial / Suspension / Revocation Reasons</div>
          <p style={{ color: '#616161', fontSize: '0.875rem', marginBottom: '1rem' }}>
            These reference values populate the denial, suspension, and revocation dropdowns throughout the system under HRS §134-7.
          </p>
          <div className="table-container">
            <table>
              <thead><tr><th>Code</th><th>Reason</th><th>Category</th><th>Active</th></tr></thead>
              <tbody>
                {DENIAL_REASONS.map(row => (
                  <tr key={row.code}>
                    <td><code>{row.code}</code></td>
                    <td>{row.reason}</td>
                    <td>
                      <span className={`badge ${row.cat === 'Denial' ? 'badge-suspended' : row.cat === 'Revocation' ? 'badge-revoked' : 'badge-expired'}`}>
                        {row.cat}
                      </span>
                    </td>
                    <td><span className="badge badge-active">Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="btn-group"><button className="btn btn-primary btn-sm">+ Add Reason</button></div>
        </div>
      )}
    </div>
  );
}
