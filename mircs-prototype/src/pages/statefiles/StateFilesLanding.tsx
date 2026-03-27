// RFP-HPD-1954933: HPD Law Enforcement Portal
// REQ-0059: Notify Licensing Authorities of Loss or Theft
// REQ-0088: Notify Licensing Authorities of Address Changes
// REQ-0189: Firearm Surrender, Storage, and Disposal
// REQ-0199: Track Firearm Transfers and Chain of Custody
// REQ-0224: Surrender Weapon to Police
// REQ-0235: Surrendered Firearm Tracking System
// REQ-0239: Statewide Hot Files — All Hawaii Counties
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FirearmEntry from '../../components/FirearmEntry';
import type { Firearm } from '../../types';
import { CHANGE_OF_CUSTODY_TYPES } from '../../types';

const MOCK_USER = {
  name: 'Sgt. Kaimana Akana',
  agency: 'Honolulu Police Department',
  badge: 'HPD-7741',
  unit: 'Firearms Unit',
};

type TransactionType = 'registration' | 'surrender' | 'custody' | '';

export default function StateFilesLanding() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TransactionType>('');
  const [firearms, setFirearms] = useState<Partial<Firearm>[]>([{}]);
  const [submitted, setSubmitted] = useState(false);

  // Surrender/Registration fields
  const [ownerName, setOwnerName] = useState('');
  const [ownerLicenseNo, setOwnerLicenseNo] = useState('');
  const [surrenderDate, setSurrenderDate] = useState('');
  const [surrenderGrounds, setSurrenderGrounds] = useState('');
  const [caseNumber, setCaseNumber] = useState('');

  // Change of Custody fields
  const [custodyType, setCustodyType] = useState('');
  const [custodyOther, setCustodyOther] = useState('');
  const [dateDisposed, setDateDisposed] = useState('');

  function updateFirearm(i: number, field: keyof Firearm, val: string | boolean) {
    setFirearms(prev => prev.map((f, j) => j === i ? { ...f, [field]: val } : f));
  }

  const ticketNo = 'HPD-SHF-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 900000 + 100000);

  if (submitted) {
    return (
      <div>
        <button className="back-nav" onClick={() => { setSubmitted(false); setActiveTab(''); setFirearms([{}]); }}>← New Transaction</button>
        <div className="card confirmation-page">
          <div className="confirmation-icon">🚔</div>
          <h2 style={{ color: '#1B6B3A' }}>Transaction Recorded</h2>
          <p style={{ color: '#5A7490', marginBottom: '1rem' }}>
            This transaction has been entered into the HPD Statewide Hot Files system.
            All Hawaii counties will be updated via real-time data sharing.
          </p>
          <div className="confirmation-ticket">
            <strong>Ticket No.:</strong> {ticketNo}<br />
            <strong>Agency:</strong> {MOCK_USER.agency}<br />
            <strong>Officer:</strong> {MOCK_USER.name} | Badge: {MOCK_USER.badge}<br />
            <strong>Type:</strong> {activeTab === 'registration' ? 'Firearm Registration (PD)' : activeTab === 'surrender' ? 'Surrender / Seizure to HPD' : 'Change of Custody'}<br />
            <strong>Firearms:</strong> {firearms.length}<br />
            {caseNumber && <><strong>HPD Case No.:</strong> {caseNumber}<br /></>}
            {activeTab === 'custody' && <><strong>Disposition:</strong> {custodyType}<br /><strong>Date Disposed:</strong> {dateDisposed}<br /></>}
          </div>
          <div className="alert" style={{ background: '#E8F5E9', border: '1px solid #4CAF50', borderRadius: 4, color: '#1B4332', maxWidth: 460, margin: '1rem auto', textAlign: 'left', padding: '0.85rem 1rem', fontSize: '0.875rem' }}>
            This record has been transmitted to:<br />
            <ul style={{ margin: '0.4rem 0 0 1rem' }}>
              <li>HPD Firearms Unit — City &amp; County of Honolulu</li>
              <li>Maui County Police Department</li>
              <li>Hawaii County Police Department (Big Island)</li>
              <li>Kauai Police Department</li>
            </ul>
          </div>
          <div className="btn-group" style={{ justifyContent: 'center' }}>
            <button className="btn btn-gold" onClick={() => window.print()}>🖨️ Print Transaction Record</button>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>Return to HPD Portal</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="back-nav" onClick={() => navigate('/')}>← Back to HPD Portal</button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: '#1B2A4A', marginBottom: '0.25rem' }}>Law Enforcement Portal</h1>
          <p style={{ color: '#5A7490' }}>HPD Statewide Hot Files Platform — Firearms Transactions &amp; Tracking</p>
        </div>
        <div style={{ background: '#E8EEF5', border: '1px solid #B0C4DE', borderRadius: 4, padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
          <div style={{ fontWeight: 700, color: '#1B2A4A' }}>{MOCK_USER.agency}</div>
          <div style={{ color: '#5A7490' }}>{MOCK_USER.name} | Badge: {MOCK_USER.badge}</div>
          <div style={{ color: '#5A7490' }}>{MOCK_USER.unit}</div>
        </div>
      </div>

      {!activeTab && (
        <div>
          <div className="apps-grid">
            {[
              {
                id: 'registration' as TransactionType,
                icon: '📝',
                title: 'Register Firearm (PD)',
                desc: 'Register a firearm on behalf of a citizen or for a seized firearm. HPD officer role.',
                hrsRef: 'HRS §134-3',
              },
              {
                id: 'surrender' as TransactionType,
                icon: '🚨',
                title: 'Surrender / Seizure',
                desc: 'Record a firearm surrendered to or seized by law enforcement. Generates transaction record.',
                hrsRef: 'HRS §134-7',
              },
              {
                id: 'custody' as TransactionType,
                icon: '🔄',
                title: 'Change of Custody',
                desc: 'Record final disposition: destroyed, auctioned, transferred to another jurisdiction, or returned to owner.',
                hrsRef: 'HRS §134-3',
              },
            ].map(item => (
              <button
                key={item.id}
                className="app-card"
                onClick={() => setActiveTab(item.id)}
                style={{ textAlign: 'left', cursor: 'pointer' }}
              >
                <div className="app-card-icon">{item.icon}</div>
                <div className="app-card-title">{item.title}</div>
                <div className="app-card-desc">{item.desc}</div>
                <div style={{ marginTop: '0.6rem' }}>
                  <span style={{ fontSize: '0.72rem', background: '#E8EEF5', color: '#1B2A4A', borderRadius: 3, padding: '0.2rem 0.45rem', fontWeight: 600 }}>
                    {item.hrsRef}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Recent Notifications */}
          <div className="card">
            <div className="card-title">Recent Notifications — Loss/Theft &amp; Address Changes</div>
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Date</th><th>Type</th><th>Subject</th><th>Detail</th><th>County</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {[
                    { date: '2025-03-25', type: 'Loss/Theft', subject: 'Nakamura, Keali\'i (PTA-2025-048812)', detail: 'Glock 17 reported lost — Honolulu', county: 'Honolulu', status: 'New' },
                    { date: '2025-03-24', type: 'Address Change', subject: 'Yamamoto, Hana (LTC-2025-001203)', detail: 'Moved from Kailua to Honolulu', county: 'Honolulu', status: 'Reviewed' },
                    { date: '2025-03-22', type: 'Loss/Theft', subject: 'Tanaka, Roy (PTA-2025-041100)', detail: 'S&W reported stolen — Pearl City', county: 'Honolulu', status: 'Reviewed' },
                    { date: '2025-03-20', type: 'Address Change', subject: 'Santos, Maria (LTC-2024-009812)', detail: 'Relocated from Maui County', county: 'Maui', status: 'New' },
                  ].map((n, i) => (
                    <tr key={i}>
                      <td>{n.date}</td>
                      <td>
                        <span className={`badge ${n.type === 'Loss/Theft' ? 'badge-suspended' : 'badge-pending'}`}>
                          {n.type}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{n.subject}</td>
                      <td style={{ fontSize: '0.82rem', color: '#5A7490' }}>{n.detail}</td>
                      <td style={{ fontSize: '0.82rem' }}>{n.county}</td>
                      <td>
                        <span className={`badge ${n.status === 'New' ? 'badge-approved' : 'badge-pending'}`}>
                          {n.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statewide Sharing Info */}
          <div className="alert alert-gold">
            <strong>Statewide Hot Files (RFP-HPD-1954933):</strong> All transactions entered here are
            shared in real-time with Maui County PD, Hawaii County PD, and Kauai PD per the
            cross-county data sharing requirement. CJIS compliance is enforced for all access.
          </div>
        </div>
      )}

      {(activeTab === 'registration' || activeTab === 'surrender') && (
        <div>
          <button className="back-nav" onClick={() => setActiveTab('')}>← Back</button>
          <div className="card">
            <div className="card-title">
              {activeTab === 'surrender' ? 'Surrender / Seizure — Firearm to HPD' : 'Register Firearm (PD Role)'}
            </div>
            <p style={{ fontSize: '0.875rem', color: '#5A7490', marginBottom: '1rem' }}>
              Agency and officer information is pre-filled from your login credentials and cannot be edited.
            </p>

            <div className="form-row-2" style={{ background: '#E8EEF5', padding: '0.75rem', borderRadius: 4, marginBottom: '1rem' }}>
              <div><strong>Agency:</strong> {MOCK_USER.agency}</div>
              <div><strong>Officer:</strong> {MOCK_USER.name} | {MOCK_USER.badge}</div>
            </div>

            <h4>Firearm Owner / Subject Information</h4>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Owner Name</label>
                <input type="text" className="form-control" value={ownerName} onChange={e => setOwnerName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">PTA / License No. (if applicable)</label>
                <input type="text" className="form-control" value={ownerLicenseNo} onChange={e => setOwnerLicenseNo(e.target.value)} placeholder="PTA-YYYY-XXXXXX" />
              </div>
              <div className="form-group">
                <label className="form-label">Date <span className="required-mark">*</span></label>
                <input type="date" className="form-control" value={surrenderDate} onChange={e => setSurrenderDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">HPD Case No. (Optional)</label>
                <input type="text" className="form-control" value={caseNumber} onChange={e => setCaseNumber(e.target.value)} />
              </div>
              {activeTab === 'surrender' && (
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Grounds for Surrender/Seizure</label>
                  <input type="text" className="form-control" value={surrenderGrounds} onChange={e => setSurrenderGrounds(e.target.value)} placeholder="e.g., Domestic Violence Order, Prohibited Person, Voluntary Surrender" />
                </div>
              )}
            </div>

            <h4 style={{ marginTop: '1rem' }}>Firearm Information</h4>
            {firearms.map((fa, i) => (
              <FirearmEntry
                key={i}
                firearm={fa}
                index={i}
                onChange={updateFirearm}
                onRemove={(idx) => setFirearms(prev => prev.filter((_, j) => j !== idx))}
                showRemove={firearms.length > 1}
              />
            ))}
            <button className="btn btn-secondary btn-sm" onClick={() => setFirearms(prev => [...prev, {}])}>+ Add Firearm</button>

            <div className="btn-group">
              <button className="btn btn-secondary" onClick={() => setActiveTab('')}>Cancel</button>
              <button className="btn btn-gold" disabled={!surrenderDate} onClick={() => setSubmitted(true)}>
                Submit &amp; Record Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'custody' && (
        <div>
          <button className="back-nav" onClick={() => setActiveTab('')}>← Back</button>
          <div className="card">
            <div className="card-title">Change of Custody (HRS §134-3)</div>
            <p style={{ fontSize: '0.875rem', color: '#5A7490', marginBottom: '1rem' }}>
              Record the final disposition of a firearm held by this agency. This transaction is
              transmitted to all Hawaii county police departments via the statewide hot files system.
            </p>

            <div className="form-row-2" style={{ background: '#E8EEF5', padding: '0.75rem', borderRadius: 4, marginBottom: '1rem' }}>
              <div><strong>Agency:</strong> {MOCK_USER.agency}</div>
              <div><strong>Officer:</strong> {MOCK_USER.name} | {MOCK_USER.badge}</div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Change of Custody Type <span className="required-mark">*</span></label>
                <select className="form-control" value={custodyType} onChange={e => setCustodyType(e.target.value)}>
                  <option value="">-- Select --</option>
                  {CHANGE_OF_CUSTODY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
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
                <label className="form-label">HPD Case No. (Optional)</label>
                <input type="text" className="form-control" value={caseNumber} onChange={e => setCaseNumber(e.target.value)} />
              </div>
            </div>

            <h4>Firearm(s)</h4>
            {firearms.map((fa, i) => (
              <FirearmEntry
                key={i}
                firearm={fa}
                index={i}
                onChange={updateFirearm}
                onRemove={(idx) => setFirearms(prev => prev.filter((_, j) => j !== idx))}
                showRemove={firearms.length > 1}
              />
            ))}
            <button className="btn btn-secondary btn-sm" onClick={() => setFirearms(prev => [...prev, {}])}>+ Add Firearm</button>

            <div className="btn-group">
              <button className="btn btn-secondary" onClick={() => setActiveTab('')}>Cancel</button>
              <button className="btn btn-gold" disabled={!custodyType || !dateDisposed} onClick={() => setSubmitted(true)}>
                Submit Change of Custody
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
