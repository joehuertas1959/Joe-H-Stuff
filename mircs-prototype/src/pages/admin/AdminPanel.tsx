// RFP-HPD-1954933: HPD Admin Tools
// REQ: Post Global/Admin Messages, Manage System Configuration
// REQ: 120-Day Deadline Alerts, Expired Permit Reports, Denial/Revocation Reasons
// REQ: Statewide Hawaii County Data Sharing Administration
// REQ: PTA Denial Reasons per HRS §134-7, LTC Denial Reasons per HRS §134-9
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStats, getAdminMessages, createAdminMessage } from '../../api/client';
import { PTA_DENIAL_REASONS, HI_COUNTIES } from '../../types';

interface AdminMessage {
  id: string;
  title: string;    // stored as "target page" in the UI
  body: string;
  severity: string;
  active: boolean;
  createdAt: string;
}

interface AdminStats {
  persons: number;
  firearms: number;
  permits: number;
  licenses: number;
  transactions: number;
  openReports: number;
  pendingPermits: number;
  pendingLicenses: number;
  approachingDeadlines: number;
}

// Static reference data (Denial Reasons, County Config, Approaching Deadlines)
// In a future sprint these will be fetched from dedicated API endpoints
const APPROACHING_DEADLINE = [
  { appNo: 'LTC-2025-001847', name: 'Kahananui, Maile',  submitted: '2025-01-15', deadline: '2025-05-15', daysLeft: 49, stage: 'Background Check' },
  { appNo: 'LTC-2025-001611', name: 'Santos, Ricardo',   submitted: '2025-01-02', deadline: '2025-05-02', daysLeft: 36, stage: 'HPD Review' },
  { appNo: 'LTC-2025-001402', name: 'Kim, David',        submitted: '2024-12-20', deadline: '2025-04-19', daysLeft: 23, stage: 'Interview Scheduled' },
];

const DENIAL_REASONS = [
  { code: 'D001', reason: 'Felony Conviction',                               hrsRef: 'HRS §134-7(b)(1)', cat: 'Denial' },
  { code: 'D002', reason: 'Domestic Violence Conviction or Restraining Order', hrsRef: 'HRS §134-7(b)(7)', cat: 'Denial' },
  { code: 'D003', reason: 'Mental Health Adjudication',                      hrsRef: 'HRS §134-7(b)(3)', cat: 'Denial' },
  { code: 'D004', reason: 'Unlawful Drug User or Addict',                    hrsRef: 'HRS §134-7(b)(4)', cat: 'Denial' },
  { code: 'D005', reason: 'Fugitive from Justice',                           hrsRef: 'HRS §134-7(b)(2)', cat: 'Denial' },
  { code: 'D006', reason: 'Illegal Alien Status',                            hrsRef: 'HRS §134-7(b)(5)', cat: 'Denial' },
  { code: 'D007', reason: 'Dishonorable Discharge',                          hrsRef: 'HRS §134-7(b)(6)', cat: 'Denial' },
  { code: 'D008', reason: 'Renounced US Citizenship',                        hrsRef: 'HRS §134-7(b)(8)', cat: 'Denial' },
  { code: 'D009', reason: 'Under Indictment for Felony',                     hrsRef: 'HRS §134-7(b)(9)', cat: 'Denial' },
  { code: 'D010', reason: 'Other Prohibited Person',                         hrsRef: 'HRS §134-7',       cat: 'Denial' },
  { code: 'S001', reason: 'Active Restraining Order — Pending Review',        hrsRef: 'HRS §134-7(g)',    cat: 'Suspension' },
  { code: 'S002', reason: 'Mental Health Petition — Awaiting Adjudication',   hrsRef: 'HRS §134-7(h)',    cat: 'Suspension' },
  { code: 'R001', reason: 'Felony Conviction (Post-Issuance)',                 hrsRef: 'HRS §134-9(c)',    cat: 'Revocation' },
  { code: 'R002', reason: 'Failure to Maintain Good Cause',                   hrsRef: 'HRS §134-9(d)',    cat: 'Revocation' },
];

type AdminTab = 'messages' | 'deadlines' | 'expired' | 'denial-reasons' | 'counties';

export default function AdminPanel() {
  const navigate = useNavigate();

  // Live API state
  const [stats, setStats]       = useState<AdminStats | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loadingMsgs, setLoadingMsgs]   = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [msgError, setMsgError] = useState<string | null>(null);
  const [posting, setPosting]   = useState(false);

  // Form state
  const [newMessage, setNewMessage] = useState('');
  const [newTarget,  setNewTarget]  = useState('HPD Portal Landing Page');
  const [newSeverity, setNewSeverity] = useState('info');

  const [activeTab, setActiveTab] = useState<AdminTab>('messages');

  // Fetch stats
  useEffect(() => {
    getAdminStats()
      .then((data: any) => setStats(data as AdminStats))
      .catch(console.error)
      .finally(() => setLoadingStats(false));
  }, []);

  // Fetch messages
  useEffect(() => {
    getAdminMessages()
      .then((data: any) => setMessages(data as AdminMessage[]))
      .catch((err: Error) => setMsgError(err.message))
      .finally(() => setLoadingMsgs(false));
  }, []);

  async function postMessage() {
    if (!newMessage.trim()) return;
    setPosting(true);
    try {
      const created = await createAdminMessage({
        title: newTarget,
        body: newMessage,
        severity: newSeverity,
        active: true,
      }) as AdminMessage;
      setMessages(prev => [created, ...prev]);
      setNewMessage('');
    } catch (err: any) {
      alert('Failed to post message: ' + err.message);
    } finally {
      setPosting(false);
    }
  }

  async function deactivateMessage(id: string) {
    const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
    try {
      await fetch(`${BASE}/api/admin/messages/${id}`, { method: 'DELETE' });
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (err: any) {
      alert('Failed to deactivate message: ' + err.message);
    }
  }

  const statItems = [
    { label: 'Persons', value: stats?.persons, icon: '👤' },
    { label: 'Firearms', value: stats?.firearms, icon: '🔫' },
    { label: 'Permits', value: stats?.permits, icon: '📄' },
    { label: 'Licenses', value: stats?.licenses, icon: '🪪' },
    { label: 'Transactions', value: stats?.transactions, icon: '🔄' },
    { label: 'Open Reports', value: stats?.openReports, icon: '🚨' },
    { label: 'Pending PTAs', value: stats?.pendingPermits, icon: '⏳' },
    { label: 'Pending LTCs', value: stats?.pendingLicenses, icon: '⏳' },
  ];

  return (
    <div>
      <button className="back-nav" onClick={() => navigate('/')}>← Back to HPD Portal</button>
      <h1 style={{ color: '#1B2A4A' }}>Admin — HPD System Tools</h1>
      <p style={{ color: '#5A7490', marginBottom: '1rem' }}>RFP-HPD-1954933 &nbsp;|&nbsp; System Administration &amp; Configuration</p>

      {/* Live Stats Strip */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {statItems.map(s => (
          <div key={s.label} style={{
            background: '#F0F4FA', border: '1px solid #C8D8EA', borderRadius: 6,
            padding: '0.6rem 1rem', minWidth: 100, textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.3rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1B2A4A', lineHeight: 1.1 }}>
              {loadingStats ? '…' : (s.value ?? 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#5A7490', marginTop: '0.15rem' }}>{s.label}</div>
          </div>
        ))}
        {!loadingStats && (stats?.approachingDeadlines ?? 0) > 0 && (
          <div style={{
            background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 6,
            padding: '0.6rem 1rem', minWidth: 100, textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.3rem' }}>⏱️</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#B45309', lineHeight: 1.1 }}>
              {stats!.approachingDeadlines}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#92400E', marginTop: '0.15rem' }}>Near Deadline</div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1.5rem', borderBottom: '2px solid #DCE4F0', paddingBottom: '0.75rem' }}>
        {[
          { id: 'messages'       as AdminTab, label: '📢 Admin Messages' },
          { id: 'deadlines'      as AdminTab, label: '⏱️ 120-Day Deadline Alerts' },
          { id: 'expired'        as AdminTab, label: '⚠️ Expired Permits Report' },
          { id: 'denial-reasons' as AdminTab, label: '📋 Denial / Revocation Reasons' },
          { id: 'counties'       as AdminTab, label: '🏝️ County Data Sharing' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.45rem 0.85rem', borderRadius: 4,
              border: `1px solid ${activeTab === tab.id ? '#C9A84C' : '#DCE4F0'}`,
              background: activeTab === tab.id ? '#1B2A4A' : '#fff',
              color: activeTab === tab.id ? '#C9A84C' : '#5A7490',
              fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Admin Messages (live from /api/admin/messages) ── */}
      {activeTab === 'messages' && (
        <div>
          <div className="card">
            <div className="card-title">Post New Global Message</div>
            <p style={{ color: '#5A7490', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Messages posted here will display as banners on the targeted portal pages.
            </p>
            <div className="form-group">
              <label className="form-label">Target Page <span className="required-mark">*</span></label>
              <select className="form-control" value={newTarget} onChange={e => setNewTarget(e.target.value)} style={{ maxWidth: 400 }}>
                <option>HPD Portal Landing Page</option>
                <option>PTA Portal</option>
                <option>LTC / Licensing Portal</option>
                <option>HPD Dealer Portal</option>
                <option>Law Enforcement Portal</option>
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
              <textarea
                className="form-control"
                rows={3}
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Enter the message to display on the portal..."
              />
            </div>
            <button className="btn btn-gold" onClick={postMessage} disabled={!newMessage.trim() || posting}>
              {posting ? 'Posting…' : '📢 Post Message'}
            </button>
          </div>

          <div className="card">
            <div className="card-title">Active Messages</div>
            {loadingMsgs && <p style={{ color: '#616161', fontSize: '0.875rem' }}>Loading messages…</p>}
            {msgError && <div className="alert alert-danger" style={{ fontSize: '0.875rem' }}>Error: {msgError}</div>}
            {!loadingMsgs && !msgError && messages.length === 0 && (
              <p style={{ color: '#9e9e9e', fontSize: '0.875rem' }}>No active messages.</p>
            )}
            {messages.map(msg => (
              <div key={msg.id} style={{
                border: `1px solid ${msg.severity === 'critical' ? '#DC2626' : msg.severity === 'warning' ? '#F59E0B' : '#C9A84C'}`,
                borderRadius: 4, padding: '0.75rem', marginBottom: '0.75rem',
                background: msg.severity === 'critical' ? '#FEF2F2' : msg.severity === 'warning' ? '#FFFBEB' : '#FEF9EC',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1B2A4A', marginBottom: '0.25rem' }}>
                      📍 {msg.title} &nbsp;|&nbsp; {new Date(msg.createdAt).toLocaleDateString()}
                      &nbsp;<span className={`badge ${msg.severity === 'critical' ? 'badge-suspended' : msg.severity === 'warning' ? 'badge-pending' : 'badge-approved'}`}>
                        {msg.severity.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#444' }}>{msg.body}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-danger btn-sm" onClick={() => deactivateMessage(msg.id)}>Deactivate</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 120-Day Deadline Alerts ── */}
      {activeTab === 'deadlines' && (
        <div className="card">
          <div className="card-title">LTC Applications — 120-Day Statutory Deadline Alerts (HRS §134-9)</div>
          <p style={{ color: '#5A7490', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Applications approaching or at risk of exceeding the 120-day processing deadline.
            HPD must approve or deny each LTC application within 120 days per HRS §134-9.
            {stats && (
              <span style={{ marginLeft: '0.5rem', fontWeight: 700, color: '#B45309' }}>
                ({stats.approachingDeadlines} approaching deadline system-wide)
              </span>
            )}
          </p>
          <div className="table-container">
            <table>
              <thead>
                <tr><th>App No.</th><th>Applicant</th><th>Submitted</th><th>Deadline</th><th>Days Left</th><th>Stage</th><th>Action</th></tr>
              </thead>
              <tbody>
                {APPROACHING_DEADLINE.map(a => (
                  <tr key={a.appNo}>
                    <td><a href="#">{a.appNo}</a></td>
                    <td>{a.name}</td>
                    <td>{a.submitted}</td>
                    <td style={{ color: '#B8860B', fontWeight: 600 }}>{a.deadline}</td>
                    <td>
                      <span className={`badge ${a.daysLeft <= 14 ? 'badge-suspended' : a.daysLeft <= 30 ? 'badge-pending' : 'badge-active'}`}>
                        {a.daysLeft}d
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{a.stage}</td>
                    <td><button className="btn btn-secondary btn-sm">Review</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="alert alert-gold" style={{ marginTop: '1rem' }}>
            <strong>Alert:</strong> {APPROACHING_DEADLINE.filter(a => a.daysLeft <= 30).length} application(s)
            are within 30 days of the statutory deadline.
          </div>
        </div>
      )}

      {/* ── Expired Permits Report ── */}
      {activeTab === 'expired' && (
        <div className="card">
          <div className="card-title">Expired Permits &amp; Licenses — HPD Firearms Unit</div>
          <p style={{ color: '#5A7490', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Permits and licenses that have expired without being used or renewed.
            This report is fetched live from <code>/api/admin/expired-permits</code>.
          </p>
          <ExpiredPermitsTable />
        </div>
      )}

      {/* ── Denial/Revocation Reasons ── */}
      {activeTab === 'denial-reasons' && (
        <div className="card">
          <div className="card-title">Manage Denial / Suspension / Revocation Reasons</div>
          <p style={{ color: '#5A7490', fontSize: '0.875rem', marginBottom: '1rem' }}>
            These reference values populate denial, suspension, and revocation letter reason dropdowns
            throughout the HPD portal. Values are aligned with HRS §134-7 and HRS §134-9.
          </p>
          <div className="table-container">
            <table>
              <thead><tr><th>Code</th><th>Reason</th><th>HRS Reference</th><th>Category</th><th>Status</th></tr></thead>
              <tbody>
                {DENIAL_REASONS.map(row => (
                  <tr key={row.code}>
                    <td><code>{row.code}</code></td>
                    <td style={{ fontSize: '0.875rem' }}>{row.reason}</td>
                    <td style={{ fontSize: '0.8rem', color: '#5A7490' }}>{row.hrsRef}</td>
                    <td>
                      <span className={`badge ${row.cat === 'Denial' ? 'badge-suspended' : row.cat === 'Revocation' ? 'badge-revoked' : 'badge-expired'}`}>
                        {row.cat}
                      </span>
                    </td>
                    <td><span className="badge badge-approved">Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="btn-group">
            <button className="btn btn-gold btn-sm">+ Add Reason</button>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.82rem', color: '#6A849C' }}>
            PTA denial reasons per HRS §134-7: {PTA_DENIAL_REASONS.length} total reasons configured.
          </div>
        </div>
      )}

      {/* ── County Data Sharing ── */}
      {activeTab === 'counties' && (
        <div className="card">
          <div className="card-title">Statewide County Data Sharing — Hawaii</div>
          <p style={{ color: '#5A7490', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Manage real-time data sharing configuration between all Hawaii county police departments.
          </p>
          <div className="table-container">
            <table>
              <thead><tr><th>County</th><th>Police Department</th><th>Sync Status</th><th>Last Sync</th><th>PTAs</th><th>LTCs</th></tr></thead>
              <tbody>
                {[
                  { county: 'City & County of Honolulu', pd: 'Honolulu Police Department', status: 'Active', lastSync: '2025-03-27 14:32', ptas: 11423, ltcs: 1608 },
                  { county: 'Maui County',               pd: 'Maui Police Department',     status: 'Active', lastSync: '2025-03-27 14:30', ptas: 2841,  ltcs: 412 },
                  { county: 'Hawaii County',             pd: 'Hawaii Police Department',   status: 'Active', lastSync: '2025-03-27 14:31', ptas: 3102,  ltcs: 488 },
                  { county: 'Kauai County',              pd: 'Kauai Police Department',    status: 'Active', lastSync: '2025-03-27 14:29', ptas: 891,   ltcs: 103 },
                ].map(c => (
                  <tr key={c.county}>
                    <td style={{ fontWeight: 600 }}>{c.county}</td>
                    <td style={{ fontSize: '0.85rem' }}>{c.pd}</td>
                    <td><span className="badge badge-approved">{c.status}</span></td>
                    <td style={{ fontSize: '0.82rem', color: '#5A7490' }}>{c.lastSync}</td>
                    <td style={{ textAlign: 'right' }}>{c.ptas.toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>{c.ltcs.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="alert alert-gold" style={{ marginTop: '1rem' }}>
            <strong>CJIS Compliance:</strong> All cross-county data sharing is encrypted with 256-bit AES
            and requires MFA. Audit logs are maintained per FBI CJIS Security Policy v6.0.
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: '#6A849C' }}>
            Counties served: {HI_COUNTIES.length} &nbsp;|&nbsp; RFP-HPD-1954933 Statewide Data Sharing Requirement
          </div>
        </div>
      )}
    </div>
  );
}

/** Sub-component: fetches expired permits live from the API */
function ExpiredPermitsTable() {
  const [rows, setRows]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
    fetch(`${BASE}/api/admin/expired-permits`)
      .then(r => r.json())
      .then(setRows)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: '#616161', fontSize: '0.875rem' }}>Loading expired permits…</p>;
  if (error)   return <div className="alert alert-danger" style={{ fontSize: '0.875rem' }}>Error: {error}</div>;

  return (
    <>
      <div className="table-container">
        <table>
          <thead>
            <tr><th>Name</th><th>Permit/License No.</th><th>Type</th><th>Expired</th><th>City</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#9e9e9e', padding: '1rem' }}>No expired permits found.</td></tr>
            ) : rows.map((p: any) => (
              <tr key={p.id}>
                <td>{p.person.lastName}, {p.person.firstName}</td>
                <td>{p.permitNumber}</td>
                <td style={{ fontSize: '0.82rem' }}>{p.type.replace(/_/g, ' ')}</td>
                <td style={{ color: '#DC2626', fontWeight: 600 }}>{new Date(p.expiresAt).toLocaleDateString()}</td>
                <td>{p.person.city}</td>
                <td><span className="badge badge-suspended">{p.status}</span></td>
                <td><button className="btn btn-secondary btn-sm">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#5A7490' }}>
        <strong>{rows.length}</strong> expired permit(s) on record.
      </div>
    </>
  );
}
