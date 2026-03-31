// REQ-0005, REQ-0006, REQ-0027, REQ-0036, REQ-0056, REQ-0182, REQ-0223
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FirearmEntry from '../../components/FirearmEntry';
import type { Firearm } from '../../types';
import { NO_LICENSE_REASONS } from '../../types';

type Step = 'role' | 'party-info' | 'firearm' | 'transaction-details' | 'review' | 'confirm';

const MOCK_LICENSE: Record<string, { name: string; type: string; status: 'active' | 'expired' | 'suspended' | 'revoked'; expiry: string }> = {
  'LTC-12345': { name: 'John A. Smith', type: 'License to Carry Firearms (LTC)', status: 'active', expiry: '2028-08-15' },
  'FID-88888': { name: 'Alice M. Brown', type: 'Firearms Identification Card (FID)', status: 'active', expiry: '2029-01-20' },
  'FID-99999': { name: 'Mark T. Davis', type: 'Firearms Identification Card (FID)', status: 'expired', expiry: '2024-03-01' },
  'LTC-SUSPEND': { name: 'Robert C. Jones', type: 'License to Carry Firearms (LTC)', status: 'suspended', expiry: '2027-05-20' },
};

export default function PersonalSaleTransfer() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('role');
  const [role, setRole] = useState<'buyer' | 'seller' | ''>('');
  const [transactionType, setTransactionType] = useState('Sale');
  const [firearmsReturned, setFirearmsReturned] = useState(false);
  const [returnDate, setReturnDate] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [licenseInfo, setLicenseInfo] = useState<typeof MOCK_LICENSE[string] | null>(null);
  const [licenseWarning, setLicenseWarning] = useState('');
  const [hasNoLicense, setHasNoLicense] = useState(false);
  const [noLicenseReason, setNoLicenseReason] = useState('');
  const [firearms, setFirearms] = useState<Partial<Firearm>[]>([{}]);
  const [dateOfTransfer, setDateOfTransfer] = useState('');
  const [attested, setAttested] = useState(false);
  const ticketNumber = 'FA10-2026-' + Math.floor(Math.random() * 900000 + 100000);

  function lookupLicense() {
    const info = MOCK_LICENSE[licenseNo.toUpperCase()];
    if (!info) { setLicenseInfo(null); setLicenseWarning('License number not found. Please verify and try again.'); return; }
    setLicenseInfo(info);
    if (info.status !== 'active') {
      setLicenseWarning(`WARNING: This license is ${info.status.toUpperCase()}. Per M.G.L. c.140 §123(g), you may not proceed with this transaction. Please confiscate the license and contact your licensing authority.`);
    } else { setLicenseWarning(''); }
  }

  function updateFirearm(index: number, field: keyof Firearm, value: string | boolean) {
    setFirearms(prev => prev.map((f, i) => i === index ? { ...f, [field]: value } : f));
  }

  const statusBadge = (s: string) => {
    const cls: Record<string, string> = { active: 'badge-active', expired: 'badge-expired', suspended: 'badge-suspended', revoked: 'badge-revoked' };
    return <span className={`badge ${cls[s] || 'badge-pending'}`}>{s}</span>;
  };

  return (
    <div>
      <button className="back-nav" onClick={() => navigate('/fa10')}>← Back to FA-10</button>
      <h1 style={{ color: '#0d3f6b' }}>Personal Sale or Transfer</h1>
      <div className="steps">
        {(['role', 'party-info', 'firearm', 'transaction-details', 'review', 'confirm'] as Step[]).map((s, i) => {
          const labels: Record<Step, string> = { role: 'Your Role', 'party-info': 'Party Info', firearm: 'Firearm(s)', 'transaction-details': 'Details', review: 'Review', confirm: 'Confirmation' };
          const idx = ['role', 'party-info', 'firearm', 'transaction-details', 'review', 'confirm'].indexOf(step);
          return (
            <div key={s} className={`step ${i === idx ? 'active' : i < idx ? 'completed' : ''}`}>
              <span className="step-number">{i < idx ? '✓' : i + 1}</span>{labels[s]}
            </div>
          );
        })}
      </div>

      {step === 'role' && (
        <div className="card">
          <div className="card-title">Step 1: Are you the Buyer or Seller?</div>
          <p style={{ marginBottom: '1.25rem', color: '#616161' }}>Under Massachusetts law, both parties to a personal sale or transfer must independently report the transaction.</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {[{ val: 'buyer' as const, icon: '🛒', title: 'I am the Buyer', desc: 'I am acquiring a firearm from a private seller.' }, { val: 'seller' as const, icon: '💰', title: 'I am the Seller', desc: 'I am transferring ownership of a firearm to a private buyer.' }].map(r => (
              <button key={r.val} onClick={() => setRole(r.val)} style={{ flex: '1 1 220px', background: role === r.val ? '#e8f0f9' : '#fff', border: `2px solid ${role === r.val ? '#14558f' : '#d0d0d0'}`, borderRadius: 8, padding: '1.25rem', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{r.icon}</div>
                <div style={{ fontWeight: 700, color: '#0d3f6b', marginBottom: '0.25rem' }}>{r.title}</div>
                <div style={{ fontSize: '0.875rem', color: '#616161' }}>{r.desc}</div>
              </button>
            ))}
          </div>
          <hr className="section-divider" />
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Transaction Type <span className="required-mark">*</span></label>
              <select className="form-control" value={transactionType} onChange={e => setTransactionType(e.target.value)}>
                <option value="Sale">Sale</option><option value="Rental">Rental</option><option value="Lease">Lease</option><option value="Loan">Loan</option>
              </select>
            </div>
          </div>
          {(transactionType === 'Loan' || transactionType === 'Lease') && (
            <div className="alert alert-info" style={{ marginTop: '0.5rem' }}>
              <div className="form-check" style={{ marginBottom: '0.5rem' }}>
                <input type="checkbox" id="returned" checked={firearmsReturned} onChange={e => setFirearmsReturned(e.target.checked)} />
                <label className="form-check-label" htmlFor="returned">Firearm(s) have been returned</label>
              </div>
              {firearmsReturned && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Date of Return <span className="required-mark">*</span></label>
                  <input type="date" className="form-control" value={returnDate} onChange={e => setReturnDate(e.target.value)} style={{ maxWidth: 220 }} />
                </div>
              )}
            </div>
          )}
          <div className="btn-group">
            <button className="btn btn-primary" disabled={!role} onClick={() => setStep('party-info')}>Continue →</button>
          </div>
        </div>
      )}

      {step === 'party-info' && (
        <div className="card">
          <div className="card-title">Step 2: {role === 'buyer' ? 'Seller' : 'Buyer'} Information</div>
          <div className="form-check" style={{ marginBottom: '1rem' }}>
            <input type="checkbox" id="no-license" checked={hasNoLicense} onChange={e => setHasNoLicense(e.target.checked)} />
            <label className="form-check-label" htmlFor="no-license">The {role === 'buyer' ? 'seller' : 'buyer'} does not have a Massachusetts firearms license</label>
          </div>
          {hasNoLicense ? (
            <div className="form-group">
              <label className="form-label">Reason for No License <span className="required-mark">*</span></label>
              <select className="form-control" value={noLicenseReason} onChange={e => setNoLicenseReason(e.target.value)} style={{ maxWidth: 400 }}>
                <option value="">-- Select Reason --</option>
                {NO_LICENSE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <hr className="section-divider" />
              <div className="form-row-2">
                <div className="form-group"><label className="form-label">First Name <span className="required-mark">*</span></label><input type="text" className="form-control" /></div>
                <div className="form-group"><label className="form-label">Last Name <span className="required-mark">*</span></label><input type="text" className="form-control" /></div>
                <div className="form-group"><label className="form-label">Date of Birth <span className="required-mark">*</span></label><input type="date" className="form-control" /></div>
                <div className="form-group"><label className="form-label">Address <span className="required-mark">*</span></label><input type="text" className="form-control" /></div>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '1rem' }}>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label className="form-label">FID/LTC License No. <span className="required-mark">*</span></label>
                  <input type="text" className="form-control" placeholder="e.g. LTC-12345" value={licenseNo} onChange={e => setLicenseNo(e.target.value)} />
                </div>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">PIN</label><input type="password" className="form-control" placeholder="PIN" style={{ width: 120 }} /></div>
                <button className="btn btn-secondary" onClick={lookupLicense} type="button">Look Up</button>
              </div>
              {licenseWarning && <div className="alert alert-danger"><strong>⛔ Transaction Blocked:</strong> {licenseWarning}</div>}
              {licenseInfo && !licenseWarning && (
                <div className="alert alert-success">
                  <div className="license-valid valid" style={{ marginBottom: '0.5rem' }}>✅ License Valid {statusBadge(licenseInfo.status)}</div>
                  <strong>{licenseInfo.name}</strong><br />Type: {licenseInfo.type}<br />Expires: {licenseInfo.expiry}
                </div>
              )}
            </div>
          )}
          <div className="btn-group">
            <button className="btn btn-secondary" onClick={() => setStep('role')}>← Back</button>
            <button className="btn btn-primary" onClick={() => setStep('firearm')} disabled={!hasNoLicense && !!licenseWarning}>Continue →</button>
          </div>
        </div>
      )}

      {step === 'firearm' && (
        <div className="card">
          <div className="card-title">Step 3: Firearm Information</div>
          <p style={{ color: '#616161', fontSize: '0.875rem', marginBottom: '1rem' }}>Enter information for each firearm being transferred.</p>
          {firearms.map((fa, i) => <FirearmEntry key={i} firearm={fa} index={i} onChange={updateFirearm} onRemove={idx => setFirearms(prev => prev.filter((_, j) => j !== idx))} showRemove={firearms.length > 1} label={`Firearm ${i + 1}`} />)}
          <button className="btn btn-secondary btn-sm" onClick={() => setFirearms(prev => [...prev, {}])} type="button">+ Add Another Firearm</button>
          <div className="btn-group">
            <button className="btn btn-secondary" onClick={() => setStep('party-info')}>← Back</button>
            <button className="btn btn-primary" onClick={() => setStep('transaction-details')}>Continue →</button>
          </div>
        </div>
      )}

      {step === 'transaction-details' && (
        <div className="card">
          <div className="card-title">Step 4: Transaction Details</div>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Date of Transfer <span className="required-mark">*</span></label>
              <input type="date" className="form-control" value={dateOfTransfer} onChange={e => setDateOfTransfer(e.target.value)} />
            </div>
          </div>
          <div className="attest-box">
            <div className="form-check">
              <input type="checkbox" id="attest" checked={attested} onChange={e => setAttested(e.target.checked)} />
              <label className="form-check-label" htmlFor="attest" style={{ fontStyle: 'italic' }}>"I attest under the pains and penalties of perjury that I am properly licensed, permitted or exempted under the laws of the commonwealth and am not otherwise prohibited from owning or possessing a firearm."</label>
            </div>
          </div>
          <div className="btn-group">
            <button className="btn btn-secondary" onClick={() => setStep('firearm')}>← Back</button>
            <button className="btn btn-primary" disabled={!attested || !dateOfTransfer} onClick={() => setStep('review')}>Review Transaction →</button>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className="card">
          <div className="card-title">Step 5: Review Transaction</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div><strong>Your Role:</strong> {role === 'buyer' ? 'Buyer' : 'Seller'}<br /><strong>Transaction Type:</strong> {transactionType}<br /><strong>Date of Transfer:</strong> {dateOfTransfer}</div>
            <div><strong>Firearms:</strong> {firearms.length}<br />{firearms.map((f, i) => <div key={i} style={{ fontSize: '0.875rem' }}>{i + 1}. {f.type} — {f.make} {f.model} (SN: {f.serialNumber})</div>)}</div>
          </div>
          <div className="alert alert-warning"><strong>⚠️ Before submitting:</strong> Verify all information is accurate. Once submitted, each firearm transaction will generate a unique Ticket Number and FA-10 form.</div>
          <div className="btn-group">
            <button className="btn btn-secondary" onClick={() => setStep('transaction-details')}>← Back</button>
            <button className="btn btn-success" onClick={() => setStep('confirm')}>Submit Transaction ✓</button>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="card confirmation-page">
          <div className="confirmation-icon">✅</div>
          <h2 style={{ color: '#388557' }}>Transaction Successfully Reported</h2>
          <p style={{ color: '#616161', marginBottom: '1rem' }}>Your personal sale/transfer has been recorded.</p>
          {firearms.map((f, i) => (
            <div key={i} className="confirmation-ticket">
              <strong>Ticket No.:</strong> {ticketNumber}-{i + 1}<br />
              <strong>Date:</strong> {dateOfTransfer}<br />
              <strong>Role:</strong> {role === 'buyer' ? 'Buyer' : 'Seller'}<br />
              <strong>Transaction Type:</strong> {transactionType}<br />
              <strong>Firearm:</strong> {f.type} — {f.make} {f.model}<br />
              <strong>Serial #:</strong> {f.serialNumber}
            </div>
          ))}
          <p className="form-hint" style={{ marginBottom: '1rem' }}>ℹ️ Reminder: The other party must also submit their own transaction report.</p>
          <div className="btn-group" style={{ justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print Receipt(s)</button>
            <button className="btn btn-secondary" onClick={() => navigate('/fa10')}>Return to FA-10</button>
          </div>
        </div>
      )}
    </div>
  );
}
