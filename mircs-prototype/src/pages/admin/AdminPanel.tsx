// REQ-0022, REQ-0238, REQ-0215
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminMessage {
  id: string; target: string; message: string; active: boolean; created: string;
}

const INITIAL_MESSAGES: AdminMessage[] = [
  { id: '1', target: 'Unified Portal Landing Page', message: 'IMPORTANT: The Massachusetts Electronic Firearms Registry is now live as of October 2, 2025. All firearms must be registered electronically.', active: true, created: '2025-10-02' },
  { id: '2', target: 'MIRCS Dealer Landing Page', message: 'Reminder: All dealer inventory must be registered by December 31, 2025.', active: true, created: '2025-11-01' },
  { id: '3', target: 'All Pages', message: 'System maintenance scheduled for April 5, 2026 from 2:00 AM – 4:00 AM. The portal will be unavailable during this window.', active: true, created: '2026-03-28' },
];

const EXPIRED_LICENSES = [
  { name: 'Wilson, Gary', licenseNo: 'LTC-00991', type: 'LTC', expires: '2026-01-15', town: 'Boston', inRenewal: false },
  { name: 'Taylor, Susan', licenseNo: 'FID-44321', type: 'FID', expires: '2026-02-20', town: 'Boston', inRenewal: true },
  { name: 'Martin, Kevin', licenseNo: 'LTC-55678', type: 'LTC', expires: '2026-03-01', town: 'Boston', inRenewal: false },
  { name: 'Anderson, Patricia', licenseNo: 'FID-77234', type: 'FID', expires: '2026-03-10', town: 'Boston', inRenewal: false },
  { name: 'Thompson, David', licenseNo: 'LTC-88412', type: 'LTC', expires: '2026-03-25', town: 'Boston', inRenewal: true },
];

const DENIAL_REASONS = [
  { code: 'D001', reason: 'Felony Conviction', cat: 'Denial', active: true },
  { code: 'D002', reason: 'Domestic Violence Restraining Order', cat: 'Denial', active: true },
  { code: 'D003', reason: 'Harassment Prevention Order (c.258E §4A)', cat: 'Denial', active: true },
  { code: 'D004', reason: 'Mental Health Commitment (§35 or §35A)', cat: 'Denial', active: true },
  { code: 'D005', reason: 'Pending Felony Arraignment', cat: 'Denial', active: true },
  { code: 'S001', reason: 'Active Restraining Order', cat: 'Suspension', active: true },
  { code: 'S002', reason: 'Harassment Prevention Order (c.258E §4B)', cat: 'Suspension', active: true },
  { code: 'R001', reason: 'Felony Conviction (Post-License)', cat: 'Revocation', active: true },
  { code: 'R002', reason: 'Harassment Prevention Order (c.258E §4C)', cat: 'Revocation', active: true },
];

export default function AdminPanel() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<AdminMessage[]>(INITIAL_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [newTarget, setNewTarget] = useState('Unified Portal Landing Page');
  const [activeTab, setActiveTab] = useState<'messages' | 'expired' | 'denial-reasons'>('messages');

  function addMessage() {
    if (!newMessage.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), target: newTarget, message: newMessage, active: true, created: new Date().toISOString().split('T')[0] }]);
    setNewMessage('');
  }

  return (
    <div>
      <button className="back-nav" onClick={() => navigate('/')}>← Back to Unified Portal</button>
      <h1 style={{ color: '#0d3f6b' }}>Admin / DCJIS Tools</h1>
      <div className="steps" style={{ marginBottom: '1.5rem' }}>
        {[
          { id: 'messages' as const, label: '📢 Admin Messages' },
          { id: 'expired' as const, label: '⚠️ Expired Licenses Report' },
          { id: 'denial-reasons' as const, label: '📋 Denial/Revocation Reasons' },
        ].map(tab => (
          <button key={tab.id} className={`step ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'messages' && (
        <div>
          <div className="card">
            <div className="card-title">Post New Global Message</div>
            <div className="form-group">
              <label className="form-label">Target Page <span className="required-mark">*</span></label>
              <select className="form-control" value={newTarget} onChange={e => setNewTarget(e.target.value)} style={{ maxWidth: 400 }}>
                <option>Unified Portal Landing Page</option>
                <option>MIRCS Portal Landing Page</option>
                <option>MIRCS Dealer Landing Page</option>
                <option>FA-10 Gun Transaction Portal Landing Page</option>
                <option>All Pages</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Message <span className="required-mark">*</span></label>
              <textarea className="form-control" rows={3} value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Enter the message to display..." />
            </div>
            <button className="btn btn-primary" onClick={addMessage} disabled={!newMessage.trim()}>📢 Post Message</button>
          </div>
          <div className="card">
            <div className="card-title">Active Messages</div>
            {messages.length === 0 && <p style={{ color: '#616161' }}>No messages configured.</p>}
            {messages.map(msg => (
              <div key={msg.id} style={{ border: '1px solid #d0d0d0', borderRadius: 4, padding: '0.75rem', marginBottom: '0.75rem', background: msg.active ? '#fff' : '#f9f9f9', opacity: msg.active ? 1 : 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#14558f', marginBottom: '0.25rem' }}>
                      📍 {msg.target} &nbsp;|&nbsp; {msg.created} &nbsp;
                      <span className={`badge ${msg.active ? 'badge-active' : 'badge-pending'}`}>{msg.active ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>{msg.message}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, active: !m.active } : m))}>{msg.active ? 'Deactivate' : 'Activate'}</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setMessages(prev => prev.filter(m => m.id !== msg.id))}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'expired' && (
        <div className="card">
          <div className="card-title">Expired Licenses — Boston Police Department</div>
          <p style={{ color: '#616161', fontSize: '0.875rem', marginBottom: '1rem' }}>Licenses issued to residents of your jurisdiction that have expired. Licenses with an active renewal application in progress are flagged accordingly.</p>
          <div className="table-container">
            <table>
              <thead><tr><th>Name</th><th>License No.</th><th>Type</th><th>Expired</th><th>Renewal Pending</th><th>Actions</th></tr></thead>
              <tbody>
                {EXPIRED_LICENSES.map((lic, i) => (
                  <tr key={i}>
                    <td>{lic.name}</td>
                    <td>{lic.licenseNo}</td>
                    <td>{lic.type}</td>
                    <td style={{ color: '#cd0000', fontWeight: 600 }}>{lic.expires}</td>
                    <td>{lic.inRenewal ? <span className="badge badge-pending">Yes</span> : <span className="badge badge-expired">No</span>}</td>
                    <td><button className="btn btn-secondary btn-sm">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#616161' }}>
            <strong>{EXPIRED_LICENSES.filter(l => !l.inRenewal).length}</strong> license(s) expired with no renewal application on file.
          </div>
        </div>
      )}

      {activeTab === 'denial-reasons' && (
        <div className="card">
          <div className="card-title">Manage Denial / Suspension / Revocation Reasons</div>
          <p style={{ color: '#616161', fontSize: '0.875rem', marginBottom: '1rem' }}>These reference values populate the denial, suspension, and revocation letter reason dropdowns throughout Core MIRCS. Per REQ-0215, harassment orders (M.G.L. c.258E §4A–4C) have been added.</p>
          <div className="table-container">
            <table>
              <thead><tr><th>Code</th><th>Reason</th><th>Category</th><th>Active</th></tr></thead>
              <tbody>
                {DENIAL_REASONS.map(row => (
                  <tr key={row.code}>
                    <td><code>{row.code}</code></td>
                    <td>{row.reason}</td>
                    <td><span className={`badge ${row.cat === 'Denial' ? 'badge-suspended' : row.cat === 'Revocation' ? 'badge-revoked' : 'badge-expired'}`}>{row.cat}</span></td>
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
