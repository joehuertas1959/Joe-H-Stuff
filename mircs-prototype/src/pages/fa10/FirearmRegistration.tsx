// REQ-0055, REQ-0056, REQ-0057, REQ-0164, REQ-0219
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FirearmEntry from '../../components/FirearmEntry';
import type { Firearm } from '../../types';
import { NO_LICENSE_REASONS, LICENSE_TYPES } from '../../types';

type RegistrantType = 'licensed' | 'non-licensed' | 'entity' | '';

export default function FirearmRegistration() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [registrantType, setRegistrantType] = useState<RegistrantType>('');
  const [licenseNo, setLicenseNo] = useState('');
  const [pin, setPin] = useState('');
  const [noLicenseReason, setNoLicenseReason] = useState('');
  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Smith');
  const [address, setAddress] = useState('123 Main St');
  const [city, setCity] = useState('Boston');
  const [state, setState] = useState('MA');
  const [zip, setZip] = useState('02101');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [licenseType, setLicenseType] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [dateAcquired, setDateAcquired] = useState('');
  const [sourceInfo, setSourceInfo] = useState('');
  const [firearms, setFirearms] = useState<Partial<Firearm>[]>([{}]);
  const [attested, setAttested] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const regNumber = 'REG-2026-' + Math.floor(Math.random() * 900000 + 100000);

  function updateFirearm(index: number, field: keyof Firearm, value: string | boolean) {
    setFirearms(prev => prev.map((f, i) => i === index ? { ...f, [field]: value } : f));
  }

  if (submitted) {
    return (
      <div>
        <button className="back-nav" onClick={() => navigate('/fa10')}>← Back to FA-10</button>
        <div className="card confirmation-page">
          <div className="confirmation-icon">📝</div>
          <h2 style={{ color: '#388557' }}>Firearm(s) Successfully Registered</h2>
          <p style={{ color: '#616161' }}>Your firearm registration has been recorded in the Massachusetts Electronic Firearms Registry.</p>
          {firearms.map((f, i) => (
            <div key={i} className="confirmation-ticket">
              <strong>Registration No.:</strong> {regNumber}-{i + 1}<br />
              <strong>Date Acquired:</strong> {dateAcquired}<br />
              <strong>Registrant:</strong> {registrantType === 'entity' ? businessName : `${firstName} ${lastName}`}<br />
              <strong>Firearm:</strong> {f.type} — {f.make} {f.model}<br />
              <strong>Serial #:</strong> {f.serialNumber}
            </div>
          ))}
          <div className="btn-group" style={{ justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print Registration</button>
            <button className="btn btn-secondary" onClick={() => navigate('/fa10')}>Return to FA-10</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="back-nav" onClick={() => navigate('/fa10')}>← Back to FA-10</button>
      <h1 style={{ color: '#0d3f6b' }}>Register a Firearm</h1>
      <div className="help-file">
        <div className="help-file-title">📋 Registration Timing Requirements</div>
        <ol>
          <li>Registration shall be completed at the time of import, purchase, acquisition, manufacture, or assembly.</li>
          <li>Firearms imported by a new resident may be registered within <strong>60 days</strong>.</li>
          <li>Firearms imported by a licensed dealer, gunsmith, distributor, or manufacturer may be registered within <strong>7 days</strong>.</li>
          <li>Firearms acquired by an heir or devisee through distribution of an estate may be registered within <strong>60 days</strong>.</li>
          <li>Firearms manufactured or assembled as a privately-made firearm may be registered within <strong>7 days</strong>.</li>
        </ol>
      </div>

      {step === 1 && (
        <div className="card">
          <div className="card-title">Step 1: Registrant Type</div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {[
              { val: 'licensed' as RegistrantType, label: 'I have a Massachusetts firearms license', icon: '🪺' },
              { val: 'non-licensed' as RegistrantType, label: 'I do not have a Massachusetts firearms license', icon: '👤' },
              { val: 'entity' as RegistrantType, label: 'I am registering on behalf of a business or museum', icon: '🏢' },
            ].map(({ val, label, icon }) => (
              <button key={val} onClick={() => setRegistrantType(val)} style={{ flex: '1 1 200px', background: registrantType === val ? '#e8f0f9' : '#fff', border: `2px solid ${registrantType === val ? '#14558f' : '#d0d0d0'}`, borderRadius: 8, padding: '1rem', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>{icon}</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0d3f6b' }}>{label}</div>
              </button>
            ))}
          </div>
          {registrantType === 'licensed' && (
            <div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label className="form-label">License No. <span className="required-mark">*</span></label>
                  <input type="text" className="form-control" value={licenseNo} onChange={e => setLicenseNo(e.target.value)} placeholder="e.g. LTC-12345" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">PIN</label>
                  <input type="password" className="form-control" value={pin} onChange={e => setPin(e.target.value)} placeholder="PIN" style={{ width: 120 }} />
                </div>
                <button className="btn btn-secondary" type="button">Look Up</button>
              </div>
              <div className="alert alert-success" style={{ marginTop: '0.75rem' }}>✅ <strong>{firstName} {lastName}</strong> — LTC Active, expires 2028-08-15</div>
            </div>
          )}
          {registrantType === 'non-licensed' && (
            <div className="form-group">
              <label className="form-label">Reason for No License <span className="required-mark">*</span></label>
              <select className="form-control" value={noLicenseReason} onChange={e => setNoLicenseReason(e.target.value)} style={{ maxWidth: 400 }}>
                <option value="">-- Select Reason --</option>
                {NO_LICENSE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          )}
          {registrantType === 'entity' && (
            <div className="form-row-2">
              <div className="form-group"><label className="form-label">Business / Entity Name <span className="required-mark">*</span></label><input type="text" className="form-control" value={businessName} onChange={e => setBusinessName(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Tax ID <span className="required-mark">*</span></label><input type="text" className="form-control" value={taxId} onChange={e => setTaxId(e.target.value)} /></div>
            </div>
          )}
          <div className="btn-group">
            <button className="btn btn-primary" disabled={!registrantType} onClick={() => setStep(2)}>Continue →</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <div className="card-title">Step 2: Registrant Information</div>
          <div className="form-row-2">
            <div className="form-group"><label className="form-label">First Name <span className="required-mark">*</span></label><input type="text" className="form-control" value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Last Name <span className="required-mark">*</span></label><input type="text" className="form-control" value={lastName} onChange={e => setLastName(e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Address <span className="required-mark">*</span></label><input type="text" className="form-control" value={address} onChange={e => setAddress(e.target.value)} /></div>
            <div className="form-group"><label className="form-label">City/Town <span className="required-mark">*</span></label><input type="text" className="form-control" value={city} onChange={e => setCity(e.target.value)} /></div>
            <div className="form-group"><label className="form-label">State <span className="required-mark">*</span></label><input type="text" className="form-control" value={state} onChange={e => setState(e.target.value)} /></div>
            <div className="form-group"><label className="form-label">ZIP <span className="required-mark">*</span></label><input type="text" className="form-control" value={zip} onChange={e => setZip(e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Phone <span className="required-mark">*</span></label><input type="tel" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Email <span className="required-mark">*</span></label><input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} /></div>
          </div>
          {registrantType === 'licensed' && (
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">License Type <span className="required-mark">*</span></label>
                <select className="form-control" value={licenseType} onChange={e => setLicenseType(e.target.value)}>
                  <option value="">-- Select --</option>
                  {LICENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">License Expiration Date <span className="required-mark">*</span></label>
                <input type="date" className="form-control" value={licenseExpiry} onChange={e => setLicenseExpiry(e.target.value)} />
              </div>
            </div>
          )}
          <div className="btn-group">
            <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" onClick={() => setStep(3)}>Continue →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <div className="card-title">Step 3: Firearm Information</div>
          <p style={{ color: '#616161', fontSize: '0.875rem', marginBottom: '1rem' }}>You may register up to 10 firearms at one time.</p>
          {firearms.map((fa, i) => (
            <FirearmEntry key={i} firearm={fa} index={i} onChange={updateFirearm}
              onRemove={(idx) => setFirearms(prev => prev.filter((_, j) => j !== idx))}
              showRemove={firearms.length > 1} />
          ))}
          {firearms.length < 10 && <button className="btn btn-secondary btn-sm" onClick={() => setFirearms(prev => [...prev, {}])}>+ Add Another Firearm</button>}
          <hr className="section-divider" />
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Date Acquired <span className="required-mark">*</span></label>
              <input type="date" className="form-control" value={dateAcquired} onChange={e => setDateAcquired(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Source (Name and Address Where Obtained)</label>
              <input type="text" className="form-control" placeholder='e.g. "Boston Gun Shop, 100 State St"' value={sourceInfo} onChange={e => setSourceInfo(e.target.value)} />
            </div>
          </div>
          <div className="attest-box">
            <div className="form-check">
              <input type="checkbox" id="attest-reg" checked={attested} onChange={e => setAttested(e.target.checked)} />
              <label className="form-check-label" htmlFor="attest-reg" style={{ fontStyle: 'italic' }}>"I attest under the pains and penalties of perjury that I am properly licensed, permitted or exempted under the laws of the commonwealth and am not otherwise prohibited from owning or possessing a firearm."</label>
            </div>
          </div>
          <div className="btn-group">
            <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
            <button className="btn btn-success" disabled={!attested || !dateAcquired} onClick={() => setSubmitted(true)}>Submit Registration ✓</button>
          </div>
        </div>
      )}
    </div>
  );
}
