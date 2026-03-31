// REQ-0059, REQ-0088, REQ-0189, REQ-0199, REQ-0224, REQ-0235, REQ-0239
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FirearmEntry from '../../components/FirearmEntry';
import type { Firearm } from '../../types';
import { CHANGE_OF_CUSTODY_TYPES } from '../../types';

const MOCK_USER = { name: 'Sgt. Officer James', agency: 'Boston Police Department', badge: 'BPD-4421' };
type TransactionType = 'registration' | 'surrender' | 'custody' | '';

export default function StateFilesLanding() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TransactionType>('');
  const [firearms, setFirearms] = useState<Partial<Firearm>[]>([{}]);
  const [submitted, setSubmitted] = useState(false);
  const [ownerName, setOwnerName] = useState('');
  const [ownerLicenseNo, setOwnerLicenseNo] = useState('');
  const [surrenderDate, setSurrenderDate] = useState('');
  const [surrenderGrounds, setSurrenderGrounds] = useState('');
  const [custodyType, setCustodyType] = useState('');
  const [custodyOther, setCustodyOther] = useState('');
  const [dateDisposed, setDateDisposed] = useState('');
  const [casNo, setCaseNo] = useState('');

  function updateFirearm(i: number, field: keyof Firearm, val: string | boolean) {
    setFirearms(prev => prev.map((f, j) => j === i ? { ...f, [field]: val } : f));
  }

  const ticketNo = 'SHF-2026-' + Math.floor(Math.random() * 900000 + 100000);

  if (submitted) {
    return (
      <div>
        <button className="back-nav" onClick={() => { setSubmitted(false); setActiveTab(''); setFirearms([{}]); }}>← New Transaction</button>
        <div className="card confirmation-page">
          <div className="confirmation-icon">🚔</div>
          <h2 style={{ color: '#388557' }}>Transaction Recorded</h2>
          <div className="confirmation-ticket">
            <strong>Ticket No.:</strong> {ticketNo}<br />
            <strong>Agency:</strong> {MOCK_USER.agency}<br />
            <strong>Officer:</strong> {MOCK_USER.name}<br />
            <strong>Type:</strong> {activeTab === 'registration' ? 'Firearm Registration' : activeTab === 'surrender' ? 'Surrender/Seizure to Police' : 'Change of Custody'}<br />
            <strong>Firearms:</strong> {firearms.length}<br />
            {activeTab === 'custody' && <><strong>Disposition:</strong> {custodyType}<br /><strong>Date Disposed:</strong> {dateDisposed}<br /></>}
          </div>
          <div className="btn-group" style={{ justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print FA-10</button>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>Return to Portal</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="back-nav" onClick={() => navigate('/')}>← Back to Unified Portal</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: '#0d3f6b', marginBottom: '0.25rem' }}>State Hot Files Platform</h1>
          <p style={{ color: '#616161' }}>Law Enforcement &amp; Police Department Firearms Transactions</p>
        </div>
        <div style={{ background: '#e8f0f9', border: '1px solid #14558f', borderRadius: 4, padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
          <div style={{ fontWeight: 700, color: '#0d3f6b' }}>{MOCK_USER.agency}</div>
          <div style={{ color: '#616161' }}>{MOCK_USER.name} | Badge: {MOCK_USER.badge}</div>
        </div>
      </div>

      {!activeTab && (
        <div>
          <div className="apps-grid">
            {[
              { id: 'registration' as TransactionType, icon: '📝', title: 'Register Firearm (PD)', desc: 'Register a firearm on behalf of a citizen or seized firearm (PD role).' },
              { id: 'surrender' as TransactionType, icon: '🚨', title: 'Surrender / Seizure', desc: 'Record a firearm surrendered to or seized by law enforcement.' },
              { id: 'custody' as TransactionType, icon: '🔄', title: 'Change of Custody', desc: 'Record final disposition: destroyed, auctioned, transferred, or returned to owner.' },
            ].map(item => (
              <button key={item.id} className="app-card" onClick={() => setActiveTab(item.id)} style={{ textAlign: 'left', cursor: 'pointer' }}>
                <div className="app-card-icon">{item.icon}</div>
                <div className="app-card-title">{item.title}</div>
                <div className="app-card-desc">{item.desc}</div>
              </button>
            ))}
          </div>
          <div className="card">
            <div className="card-title">Recent Notifications (Loss/Theft &amp; Address Changes)</div>
            <div className="table-container">
              <table>
                <thead><tr><th>Date</th><th>Type</th><th>Subject</th><th>Detail</th><th>Status</th></tr></thead>
                <tbody>
                  {[
                    { date: '2026-03-30', type: 'Loss/Theft', subject: 'Williams, James (LTC-77211)', detail: 'Glock 19 reported stolen — Dorchester', status: 'New' },
                    { date: '2026-03-29', type: 'Address Change', subject: 'Garcia, Maria (FID-55102)', detail: 'Moved from Quincy to Boston', status: 'Reviewed' },
                    { date: '2026-03-28', type: 'Loss/Theft', subject: 'Smith, John (LTC-12345)', detail: 'Ruger 10/22 reported lost — Cambridge', status: 'New' },
                    { date: '2026-03-25', type: 'Address Change', subject: 'Jones, Robert (LTC-99001)', detail: 'Moved from Brockton to Boston', status: 'Reviewed' },
                    { date: '2026-03-22', type: 'Loss/Theft', subject: 'Brown, Alice (FID-88888)', detail: 'S&W M&P reported stolen — South Boston', status: 'Reviewed' },
                  ].map((n, i) => (
                    <tr key={i}>
                      <td>{n.date}</td>
                      <td><span className={`badge ${n.type === 'Loss/Theft' ? 'badge-suspended' : 'badge-pending'}`}>{n.type}</span></td>
                      <td>{n.subject}</td>
                      <td style={{ fontSize: '0.85rem' }}>{n.detail}</td>
                      <td><span className={`badge ${n.status === 'New' ? 'badge-active' : 'badge-pending'}`}>{n.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {(activeTab === 'registration' || activeTab === 'surrender') && (
        <div>
          <button className="back-nav" onClick={() => setActiveTab('')}>← Back</button>
          <div className="card">
            <div className="card-title">{activeTab === 'surrender' ? 'Surrender / Seizure Firearm to Police' : 'Register Firearm (PD)'}</div>
            <div className="form-row-2" style={{ background: '#f0f4f8', padding: '0.75rem', borderRadius: 4, marginBottom: '1rem' }}>
              <div><strong>Agency:</strong> {MOCK_USER.agency}</div>
              <div><strong>Officer:</strong> {MOCK_USER.name}</div>
            </div>
            <h4>Firearm Owner / Subject Information</h4>
            <div className="form-row-2">
              <div className="form-group"><label className="form-label">Owner Name</label><input type="text" className="form-control" value={ownerName} onChange={e => setOwnerName(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">License No. (if applicable)</label><input type="text" className="form-control" value={ownerLicenseNo} onChange={e => setOwnerLicenseNo(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Date <span className="required-mark">*</span></label><input type="date" className="form-control" value={surrenderDate} onChange={e => setSurrenderDate(e.target.value)} /></div>
              {activeTab === 'surrender' && <div className="form-group"><label className="form-label">Grounds for Surrender/Seizure</label><input type="text" className="form-control" value={surrenderGrounds} onChange={e => setSurrenderGrounds(e.target.value)} /></div>}
            </div>
            <h4 style={{ marginTop: '1rem' }}>Firearm Information</h4>
            {firearms.map((fa, i) => <FirearmEntry key={i} firearm={fa} index={i} onChange={updateFirearm} onRemove={(idx) => setFirearms(prev => prev.filter((_, j) => j !== idx))} showRemove={firearms.length > 1} />)}
            <button className="btn btn-secondary btn-sm" onClick={() => setFirearms(prev => [...prev, {}])}>+ Add Firearm</button>
            <div className="btn-group">
              <button className="btn btn-secondary" onClick={() => setActiveTab('')}>Cancel</button>
              <button className="btn btn-success" disabled={!surrenderDate} onClick={() => setSubmitted(true)}>Submit &amp; Print FA-10</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'custody' && (
        <div>
          <button className="back-nav" onClick={() => setActiveTab('')}>← Back</button>
          <div className="card">
            <div className="card-title">Change of Custody</div>
            <div className="form-row-2" style={{ background: '#f0f4f8', padding: '0.75rem', borderRadius: 4, marginBottom: '1rem' }}>
              <div><strong>Agency:</strong> {MOCK_USER.agency}</div>
              <div><strong>Officer:</strong> {MOCK_USER.name}</div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Change of Custody Type <span className="required-mark">*</span></label>
                <select className="form-control" value={custodyType} onChange={e => setCustodyType(e.target.value)}>
                  <option value="">-- Select --</option>{CHANGE_OF_CUSTODY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {custodyType === 'Other' && (
                <div className="form-group">
                  <label className="form-label">Describe <span className="required-mark">*</span></label>
                  <input type="text" className="form-control" value={custodyOther} onChange={e => setCustodyOther(e.target.value)} maxLength={100} />
                  <p className="form-hint">{custodyOther.length}/100 characters</p>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Date Disposed <span className="required-mark">*</span></label>
                <input type="date" className="form-control" value={dateDisposed} onChange={e => setDateDisposed(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Dept. Case No. (Optional)</label>
                <input type="text" className="form-control" value={casNo} onChange={e => setCaseNo(e.target.value)} />
              </div>
            </div>
            <h4>Firearm(s)</h4>
            {firearms.map((fa, i) => <FirearmEntry key={i} firearm={fa} index={i} onChange={updateFirearm} onRemove={(idx) => setFirearms(prev => prev.filter((_, j) => j !== idx))} showRemove={firearms.length > 1} />)}
            <button className="btn btn-secondary btn-sm" onClick={() => setFirearms(prev => [...prev, {}])}>+ Add Firearm</button>
            <div className="btn-group">
              <button className="btn btn-secondary" onClick={() => setActiveTab('')}>Cancel</button>
              <button className="btn btn-success" disabled={!custodyType || !dateDisposed} onClick={() => setSubmitted(true)}>Submit Change of Custody</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
