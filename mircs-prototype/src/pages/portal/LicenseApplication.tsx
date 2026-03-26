// REQ-0060: Move Firearms Services URL
// REQ-0062: Update Available Services Language
// REQ-0063: Remove License Rules
// REQ-0065: On-Screen PIN Retrieval
// REQ-0067: Select Licensing Authorities for Towns Without PDs
// REQ-0068: Update "Reason for No Safety Certificate" Dropdown
// REQ-0069: Remove "Reason for Applying" Field
// REQ-0070: Remove "Business Owner" Field
// REQ-0071: Remove "Build" and "Complexion" Fields
// REQ-0072: Add "Gender" Field (NCIC aligned)
// REQ-0074: Add "Name Change Reason" Dropdown
// REQ-0078: Support Human Photo Validation
// REQ-0080: Add "Proof of Residency" Dropdown
// REQ-0083: Enhance Post Application Submission Functionality
// REQ-0084: Support Affidavit Updates
// REQ-0085: Support "Gender" Edit Capabilities
// REQ-0168: Licensing Authority Requirements - Online Dealer Training
// REQ-0177: Expiration Notification
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LICENSE_TYPES, RACE_VALUES, ETHNICITY_VALUES, GENDER_VALUES, NAME_CHANGE_REASONS } from '../../types';

const MA_TOWNS = [
  'Boston', 'Cambridge', 'Worcester', 'Springfield', 'Lowell',
  'Brockton', 'Quincy', 'Lynn', 'New Bedford', 'Fall River',
  'Gosnold', // → needs MSP
  'Cuttyhunk', // → needs MSP
];

const MSP_TOWNS = ['Gosnold', 'Cuttyhunk']; // REQ-0067

const DOCUMENT_TYPES = [
  'Safety Certificate',
  'Supporting Letter',
  'Reference Letter',
  'Military Discharge (DD-214)',
  'Court Order',
  'Proof of Residency',
  'Lost/Stolen Firearms Affidavit',
  'Online Dealer Training Certificate', // REQ-0168
  'Other',
];

const PROOF_OF_RESIDENCY = [
  'Utility Bill',
  'Bank Statement',
  'Lease Agreement',
  'Mortgage Statement',
  'Government Correspondence',
  'Other',
];

const SAFETY_CERT_REASON = [
  'Completed safety course',
  'Military/Law Enforcement Exemption', // REQ-0068
  'Hunter Education Certificate',
  'Other',
];

type AppType = 'new' | 'renewal';

export default function LicenseApplication() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [appType, setAppType] = useState<AppType>('new');
  const [licenseType, setLicenseType] = useState('');
  const [town, setTown] = useState('');
  const [townWarning, setTownWarning] = useState('');

  // Personal info
  const [firstName] = useState('John');
  const [middleName] = useState('A.');
  const [lastName] = useState('Smith');
  const [suffix] = useState('');
  const [dob] = useState('1985-06-20');
  const [height] = useState('5\'10"');
  const [weight] = useState('175');
  const [hairColor] = useState('Brown');
  const [eyeColor] = useState('Blue');
  const [gender, setGender] = useState('M'); // REQ-0072
  const [race, setRace] = useState('W');
  const [ethnicity, setEthnicity] = useState('N');

  // Aliases
  const [aliases, setAliases] = useState<{ first: string; last: string; reason: string; reasonOther: string }[]>([]);
  const [showAddAlias, setShowAddAlias] = useState(false);

  // Documents
  const [proofOfResidency, setProofOfResidency] = useState('');
  const [hasSafetyCert, setHasSafetyCert] = useState(true);
  const [safetyCertReason, setSafetyCertReason] = useState('');

  // Affidavit (REQ-0084)
  const [affidavitAttested, setAffidavitAttested] = useState(false);
  const [lostStolenCount, setLostStolenCount] = useState('0');

  // Dealer training (REQ-0168)
  const isDealerLicense = licenseType.includes('Sell') || licenseType.includes('Gunsmith');

  // Electronic signature
  const [signature, setSignature] = useState('');
  const today = new Date().toLocaleDateString();

  const [submitted, setSubmitted] = useState(false);
  const appNumber = 'APP-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 900000 + 100000);

  function handleTownChange(t: string) {
    setTown(t);
    if (MSP_TOWNS.includes(t)) {
      setTownWarning(`The town of ${t} does not have a Police Department. Please select "MASS STATE POLICE" as your Licensing Authority.`);
    } else {
      setTownWarning('');
    }
  }

  if (submitted) {
    return (
      <div>
        <button className="back-nav" onClick={() => navigate('/')}>← Back to Portal</button>
        <div className="card confirmation-page">
          <div className="confirmation-icon">📋</div>
          <h2 style={{ color: '#388557' }}>Application Successfully Submitted</h2>
          <div className="confirmation-ticket">
            <strong>Application No.:</strong> {appNumber}<br />
            <strong>Application Type:</strong> {appType === 'new' ? 'New Application' : 'Renewal'}<br />
            <strong>License Type:</strong> {licenseType}<br />
            <strong>Applicant:</strong> {firstName} {lastName}<br />
            <strong>Licensing Authority:</strong> {MSP_TOWNS.includes(town) ? 'Massachusetts State Police' : `${town} Police Department`}<br />
            <strong>Date Submitted:</strong> {today}
          </div>
          <div className="alert alert-info" style={{ maxWidth: 500, margin: '1rem auto', textAlign: 'left' }}>
            <strong>Next Steps:</strong>
            <ul style={{ marginTop: '0.5rem', marginLeft: '1.25rem', fontSize: '0.875rem' }}>
              <li>Your application has been sent to your licensing authority for review.</li>
              <li>You may be contacted to arrange payment or an in-person appointment.</li>
              <li>Check application status via "My Applications" in the portal.</li>
              <li>Processing time: up to 40 days.</li>
            </ul>
          </div>
          <div className="btn-group" style={{ justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print Application</button>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>Return to Portal</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="back-nav" onClick={() => navigate('/portal')}>← Back to MIRCS Portal</button>
      <h1 style={{ color: '#0d3f6b' }}>Firearms License Application</h1>

      {/* Steps */}
      <div className="steps">
        {['Application Type', 'License Details', 'Personal Info', 'Documents', 'Review & Submit'].map((s, i) => (
          <div key={s} className={`step ${step === i + 1 ? 'active' : step > i + 1 ? 'completed' : ''}`}>
            <span className="step-number">{step > i + 1 ? '✓' : i + 1}</span>{s}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="card">
          <div className="card-title">Step 1: Application Type</div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
            {[{ val: 'new' as AppType, label: 'New Application', icon: '🆕' }, { val: 'renewal' as AppType, label: 'Renewal', icon: '🔄' }].map(({ val, label, icon }) => (
              <button key={val} onClick={() => setAppType(val)} style={{ flex: '1 1 180px', background: appType === val ? '#e8f0f9' : '#fff', border: `2px solid ${appType === val ? '#14558f' : '#d0d0d0'}`, borderRadius: 8, padding: '1rem', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>{icon}</div>
                <div style={{ fontWeight: 700, color: '#0d3f6b' }}>{label}</div>
              </button>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">License Type <span className="required-mark">*</span></label>
            <select className="form-control" value={licenseType} onChange={e => setLicenseType(e.target.value)} style={{ maxWidth: 500 }}>
              <option value="">-- Select License Type --</option>
              {LICENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* REQ-0168: Dealer training gate */}
          {isDealerLicense && (
            <div className="alert alert-warning">
              <strong>⚠️ Online Dealer Training Required:</strong> Applications for a{' '}
              <strong>{licenseType}</strong> require proof of completion of the Massachusetts Online
              Firearms Dealer Training Program before submission. You will be prompted to upload your
              training certificate in the Documents section.{' '}
              <a href="#">Access training program →</a>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Licensing Authority (Your Town/City) <span className="required-mark">*</span>
            </label>
            <select className="form-control" value={town} onChange={e => handleTownChange(e.target.value)} style={{ maxWidth: 400 }}>
              <option value="">-- Select Your Town --</option>
              {MA_TOWNS.map(t => <option key={t} value={t}>{t}</option>)}
              <option value="MASS STATE POLICE">MASS STATE POLICE</option>
            </select>
            {/* REQ-0067: MSP warning for towns without PDs */}
            {townWarning && (
              <div className="alert alert-warning" style={{ marginTop: '0.5rem' }}>
                <strong>⚠️ {townWarning}</strong>
              </div>
            )}
          </div>

          <div className="btn-group">
            <button className="btn btn-primary" disabled={!licenseType || !town || !!townWarning} onClick={() => setStep(2)}>Continue →</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <div className="card-title">Step 2: License Details &amp; Physical Attributes</div>
          <p style={{ color: '#616161', fontSize: '0.875rem', marginBottom: '1rem' }}>
            The following fields have been pre-filled from your account profile. Please review and update as needed.
            {/* REQ-0069: "Reason for Applying" field removed */}
            {/* REQ-0070: "Business Owner" field removed */}
          </p>

          <div className="form-row-3">
            <div className="form-group"><label className="form-label">Height</label><input type="text" className="form-control" defaultValue={height} readOnly /></div>
            <div className="form-group"><label className="form-label">Weight (lbs)</label><input type="text" className="form-control" defaultValue={weight} readOnly /></div>
            {/* REQ-0071: "Build" and "Complexion" removed — not shown here */}
            <div className="form-group"><label className="form-label">Hair Color</label><input type="text" className="form-control" defaultValue={hairColor} readOnly /></div>
            <div className="form-group"><label className="form-label">Eye Color</label><input type="text" className="form-control" defaultValue={eyeColor} readOnly /></div>
            {/* REQ-0072: Gender field (replaces Sex) */}
            <div className="form-group">
              <label className="form-label">Gender <span className="required-mark">*</span> <span style={{ fontSize: '0.75rem', color: '#388557' }}>New</span></label>
              <select className="form-control" value={gender} onChange={e => setGender(e.target.value)}>
                {GENDER_VALUES.map(g => <option key={g.code} value={g.code}>{g.label}</option>)}
              </select>
            </div>
          </div>

          <hr className="section-divider" />
          <h4>Race &amp; Ethnicity (REQ-0054)</h4>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Race <span className="required-mark">*</span></label>
              <select className="form-control" value={race} onChange={e => setRace(e.target.value)}>
                {RACE_VALUES.map(r => <option key={r.code} value={r.code}>{r.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Ethnicity <span className="required-mark">*</span></label>
              <select className="form-control" value={ethnicity} onChange={e => setEthnicity(e.target.value)}>
                {ETHNICITY_VALUES.map(e => <option key={e.code} value={e.code}>{e.label}</option>)}
              </select>
            </div>
          </div>

          <hr className="section-divider" />
          <h4>Previous Names / Aliases</h4>
          {aliases.map((alias, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', background: '#f9f9f9', padding: '0.5rem', borderRadius: 4 }}>
              <span style={{ fontSize: '0.875rem' }}>{alias.first || '.'} {alias.last} — {alias.reason}</span>
              <button className="btn btn-danger btn-sm" onClick={() => setAliases(prev => prev.filter((_, j) => j !== i))}>Remove</button>
            </div>
          ))}

          {showAddAlias ? (
            <div style={{ background: '#f0f4f8', padding: '1rem', borderRadius: 4, marginBottom: '0.75rem' }}>
              <div className="form-row-3">
                <div className="form-group"><label className="form-label">First Name (or "." if none)</label><input type="text" className="form-control" placeholder="First name or ." /></div>
                <div className="form-group"><label className="form-label">Last Name <span className="required-mark">*</span></label><input type="text" className="form-control" /></div>
                {/* REQ-0074: Name Change Reason dropdown */}
                <div className="form-group">
                  <label className="form-label">Reason <span className="required-mark">*</span></label>
                  <select className="form-control">
                    <option value="">-- Select --</option>
                    {NAME_CHANGE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="btn-group" style={{ marginTop: 0 }}>
                <button className="btn btn-primary btn-sm" onClick={() => { setAliases(prev => [...prev, { first: '', last: 'Doe', reason: 'Maiden Name', reasonOther: '' }]); setShowAddAlias(false); }}>Add</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowAddAlias(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowAddAlias(true)}>+ Add Previous Name/Alias</button>
          )}

          <div className="btn-group">
            <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" onClick={() => setStep(3)}>Continue →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <div className="card-title">Step 3: Personal Information &amp; Safety Certificate</div>
          <div className="form-row-2">
            <div className="form-group"><label className="form-label">First Name</label><input type="text" className="form-control" value={firstName} readOnly /></div>
            <div className="form-group"><label className="form-label">Last Name</label><input type="text" className="form-control" value={lastName} readOnly /></div>
            <div className="form-group"><label className="form-label">Date of Birth</label><input type="date" className="form-control" value={dob} readOnly /></div>
          </div>

          <hr className="section-divider" />
          <h4>Safety Certificate</h4>
          <div className="form-check" style={{ marginBottom: '0.75rem' }}>
            <input type="checkbox" id="has-cert" checked={hasSafetyCert} onChange={e => setHasSafetyCert(e.target.checked)} />
            <label className="form-check-label" htmlFor="has-cert">I have a valid firearms safety certificate</label>
          </div>
          {!hasSafetyCert && (
            <div className="form-group">
              {/* REQ-0068: "Reason for No Safety Certificate" — includes Law Enforcement */}
              <label className="form-label">Reason for No Safety Certificate <span className="required-mark">*</span></label>
              <select className="form-control" value={safetyCertReason} onChange={e => setSafetyCertReason(e.target.value)} style={{ maxWidth: 400 }}>
                <option value="">-- Select --</option>
                {SAFETY_CERT_REASON.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          )}

          <hr className="section-divider" />
          {/* REQ-0084: Electronic Affidavit for Lost/Stolen */}
          <h4>Lost/Stolen Firearms Affidavit</h4>
          <p style={{ fontSize: '0.875rem', color: '#616161', marginBottom: '0.75rem' }}>
            Per M.G.L. c.140 §121F(r)(i), all applicants must attest to the following regarding lost or stolen firearms.
          </p>
          <div className="form-group">
            <label className="form-label">Number of lost/stolen firearms in the past 5 years</label>
            <select className="form-control" value={lostStolenCount} onChange={e => setLostStolenCount(e.target.value)} style={{ maxWidth: 200 }}>
              {['0','1','2','3','4','5+'].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="attest-box">
            <div className="form-check">
              <input type="checkbox" id="affidavit" checked={affidavitAttested} onChange={e => setAffidavitAttested(e.target.checked)} />
              <label className="form-check-label" htmlFor="affidavit" style={{ fontStyle: 'italic' }}>
                I attest under the pains and penalties of perjury that the information provided regarding
                lost or stolen firearms is accurate and complete to the best of my knowledge.
              </label>
            </div>
          </div>

          <div className="btn-group">
            <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
            <button className="btn btn-primary" disabled={!affidavitAttested} onClick={() => setStep(4)}>Continue →</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="card">
          <div className="card-title">Step 4: Supporting Documents</div>

          {/* REQ-0080: Proof of Residency required */}
          <div className="alert alert-warning">
            <strong>Required:</strong> Proof of Residency must be uploaded before submitting your application.
          </div>

          <div className="form-group">
            <label className="form-label">
              Proof of Residency <span className="required-mark">*</span>
            </label>
            <select className="form-control" value={proofOfResidency} onChange={e => setProofOfResidency(e.target.value)} style={{ maxWidth: 400 }}>
              <option value="">-- Select Document Type --</option>
              {PROOF_OF_RESIDENCY.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {proofOfResidency && (
            <div className="form-group">
              <label className="form-label">Upload {proofOfResidency} <span className="required-mark">*</span></label>
              <input type="file" className="form-control" accept=".pdf,.jpg,.png" />
            </div>
          )}

          {/* REQ-0168: Dealer training certificate upload */}
          {isDealerLicense && (
            <div className="card" style={{ background: '#fff8e1', border: '1px solid #ffc107' }}>
              <div className="card-title">Online Gun Dealer Training Certification (Required)</div>
              <p style={{ fontSize: '0.875rem', color: '#616161', marginBottom: '0.75rem' }}>
                You must complete the Massachusetts Online Firearms Dealer Training Program and upload
                your certificate before your application can be submitted. <a href="#">Access training →</a>
              </p>
              <div className="form-group">
                <label className="form-label">Upload Training Certificate <span className="required-mark">*</span></label>
                <input type="file" className="form-control" accept=".pdf,.jpg,.png" />
              </div>
            </div>
          )}

          <hr className="section-divider" />
          <h4>Additional Documents (Optional)</h4>
          <div className="form-group">
            <label className="form-label">Document Type</label>
            {/* REQ-0079: "Proof of Business Ownership" option removed */}
            <select className="form-control" style={{ maxWidth: 400 }}>
              <option value="">-- Select --</option>
              {DOCUMENT_TYPES.filter(d => d !== 'Proof of Business Ownership').map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <input type="file" className="form-control" accept=".pdf,.jpg,.png" style={{ maxWidth: 400 }} />

          <div className="btn-group">
            <button className="btn btn-secondary" onClick={() => setStep(3)}>← Back</button>
            <button className="btn btn-primary" disabled={!proofOfResidency} onClick={() => setStep(5)}>Continue →</button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="card">
          <div className="card-title">Step 5: Review &amp; Submit</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <strong>Type:</strong> {appType === 'new' ? 'New Application' : 'Renewal'}<br />
              <strong>License:</strong> {licenseType}<br />
              <strong>LA:</strong> {MSP_TOWNS.includes(town) ? 'Massachusetts State Police' : `${town} PD`}
            </div>
            <div>
              <strong>Applicant:</strong> {firstName} {middleName} {lastName} {suffix}<br />
              <strong>DOB:</strong> {dob}<br />
              <strong>Gender:</strong> {GENDER_VALUES.find(g => g.code === gender)?.label}
            </div>
          </div>

          {/* REQ-0081: Electronic Signature */}
          <div className="attest-box">
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label">Electronic Signature <span className="required-mark">*</span></label>
              <input type="text" className="form-control" placeholder="Type your full legal name" value={signature} onChange={e => setSignature(e.target.value)} style={{ maxWidth: 400 }} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Signature Date (Auto-populated)</label>
              <input type="text" className="form-control" value={today} readOnly style={{ maxWidth: 200 }} />
            </div>
          </div>

          <div className="btn-group">
            <button className="btn btn-secondary" onClick={() => setStep(4)}>← Back</button>
            <button className="btn btn-success" disabled={!signature} onClick={() => setSubmitted(true)}>
              Submit Application ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
