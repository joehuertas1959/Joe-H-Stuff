// RFP-HPD-1954933: Permit to Acquire Application — HRS §134-2
// Form HPD-89 — Pistol/Revolver ($26) and Rifle/Shotgun ($26)
// REQ: Online Application Submission, Payment Processing, Background Check Tracking
// REQ: Email/SMS Notifications, Permit Generation, 10-Day Validity
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RACE_VALUES, ETHNICITY_VALUES, GENDER_VALUES, NAME_CHANGE_REASONS, PTA_DENIAL_REASONS } from '../../types';

const FIREARM_CATEGORIES = [
  { value: 'pistol-revolver', label: 'Pistol or Revolver', fee: 26, minAge: 21, hrsRef: 'HRS §134-2(a)' },
  { value: 'rifle-shotgun', label: 'Rifle or Shotgun', fee: 26, minAge: 18, hrsRef: 'HRS §134-2(b)' },
];

const HI_COUNTIES = [
  'City & County of Honolulu',
  'Maui County',
  'Hawaii County (Big Island)',
  'Kauai County',
];

const DISQUALIFIERS = [
  { id: 'felony', label: 'Have you ever been convicted of a felony?' },
  { id: 'dv', label: 'Have you ever been convicted of a misdemeanor crime of domestic violence or are subject to a domestic violence restraining order?' },
  { id: 'mentalHealth', label: 'Have you ever been adjudicated as a mental defective or committed to a mental institution?' },
  { id: 'drugs', label: 'Are you an unlawful user of or addicted to any controlled substance?' },
  { id: 'fugitive', label: 'Are you a fugitive from justice?' },
  { id: 'alienStatus', label: 'Are you an alien illegally or unlawfully in the United States?' },
  { id: 'discharge', label: 'Have you been discharged from the Armed Forces under dishonorable conditions?' },
  { id: 'citizenship', label: 'Have you renounced your United States citizenship?' },
  { id: 'indictment', label: 'Are you currently under indictment for a crime punishable by imprisonment for more than one year?' },
];

export default function PTAApplication() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Applicant info (pre-filled mock)
  const [firstName] = useState('Keali\'i');
  const [lastName] = useState('Nakamura');
  const [dob] = useState('1990-07-15');
  const [ssn4] = useState('4521');
  const [county, setCounty] = useState('City & County of Honolulu');
  const [address] = useState('1234 Kalakaua Ave, Apt 202');
  const [city] = useState('Honolulu');
  const [zip] = useState('96815');
  const [email] = useState('keali.nakamura@email.com');
  const [phone] = useState('(808) 555-0148');
  const [gender, setGender] = useState('M');
  const [race, setRace] = useState('A');
  const [ethnicity, setEthnicity] = useState('N');
  const [height] = useState('5\'9"');
  const [weight] = useState('165');
  const [eyeColor] = useState('Brown');
  const [hairColor] = useState('Black');

  // Aliases
  const [hasAlias, setHasAlias] = useState(false);

  // Disqualifiers — all must be "No" for approval
  const [disqAnswers, setDisqAnswers] = useState<Record<string, boolean>>(
    Object.fromEntries(DISQUALIFIERS.map(d => [d.id, false]))
  );

  // Payment
  const [payMethod, setPayMethod] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Signature
  const [signature, setSignature] = useState('');
  const [attested, setAttested] = useState(false);
  const today = new Date().toLocaleDateString();

  const selectedCategory = FIREARM_CATEGORIES.find(c => c.value === category);
  const hasDisqualifier = Object.values(disqAnswers).some(v => v === true);
  const appNumber = 'PTA-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 900000 + 100000)).padStart(6, '0');

  if (submitted) {
    return (
      <div>
        <div className="card confirmation-page">
          <div className="confirmation-icon">📋</div>
          <h2 style={{ color: '#1B6B3A' }}>Permit Application Submitted</h2>
          <p style={{ color: '#5A7490', marginBottom: '1rem' }}>
            Your application has been received by the Honolulu Police Department Firearms Unit.
            A background check will be initiated and you will be notified by email and SMS.
          </p>
          <div className="confirmation-ticket">
            <strong>Application No.:</strong> {appNumber}<br />
            <strong>Applicant:</strong> {firstName} {lastName}<br />
            <strong>Permit Type:</strong> {selectedCategory?.label}<br />
            <strong>County:</strong> {county}<br />
            <strong>Fee Paid:</strong> ${selectedCategory?.fee}.00<br />
            <strong>Date Submitted:</strong> {today}<br />
            <strong>Est. Processing:</strong> 5–10 business days<br />
            <strong>Permit Validity (if approved):</strong> 10 days from issuance
          </div>
          <div className="alert" style={{ background: '#E8F5E9', border: '1px solid #4CAF50', borderRadius: 4, color: '#1B4332', maxWidth: 460, margin: '1rem auto', textAlign: 'left', padding: '0.85rem 1rem' }}>
            <strong>Next Steps:</strong>
            <ul style={{ marginTop: '0.5rem', marginLeft: '1.25rem', fontSize: '0.875rem', lineHeight: 1.7 }}>
              <li>HPD will conduct a mandatory background check (NCIC/CJIS).</li>
              <li>Check your email at <strong>{email}</strong> for status updates.</li>
              <li>If approved, your permit will be emailed and valid for <strong>10 days</strong>.</li>
              <li>After purchase, register firearm with HPD within <strong>5 days</strong> per HRS §134-3.</li>
            </ul>
          </div>
          <div className="btn-group" style={{ justifyContent: 'center' }}>
            <button className="btn btn-gold" onClick={() => window.print()}>🖨️ Print Application</button>
            <button className="btn btn-secondary" onClick={() => navigate('/pta')}>Back to PTA Portal</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="back-nav" onClick={() => navigate('/pta')}>← Back to Permit to Acquire</button>
      <h1 style={{ color: '#1B2A4A' }}>Apply for Permit to Acquire (HPD-89)</h1>
      <p style={{ color: '#5A7490', marginBottom: '1rem' }}>
        City &amp; County of Honolulu &nbsp;|&nbsp; HRS §134-2 &nbsp;|&nbsp; Form HPD-89
      </p>

      {/* Progress Steps */}
      <div className="steps">
        {['Permit Type', 'Personal Info', 'Eligibility', 'Payment', 'Review & Submit'].map((s, i) => (
          <div key={s} className={`step ${step === i + 1 ? 'active' : step > i + 1 ? 'completed' : ''}`}>
            <span className="step-number">{step > i + 1 ? '✓' : i + 1}</span>{s}
          </div>
        ))}
      </div>

      {/* Step 1: Permit Type */}
      {step === 1 && (
        <div className="card">
          <div className="card-title">Step 1: Select Permit Type</div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {FIREARM_CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                style={{
                  flex: '1 1 220px',
                  background: category === cat.value ? '#1B2A4A' : '#fff',
                  border: `2px solid ${category === cat.value ? '#C9A84C' : '#DCE4F0'}`,
                  borderRadius: 8, padding: '1.25rem', cursor: 'pointer', textAlign: 'left',
                  color: category === cat.value ? '#fff' : '#1B2A4A',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>
                  {cat.value === 'pistol-revolver' ? '🔫' : '🎯'}
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>{cat.label}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.3rem' }}>{cat.hrsRef}</div>
                <div style={{ fontSize: '0.85rem', color: category === cat.value ? '#C9A84C' : '#B8860B', fontWeight: 700 }}>
                  Application Fee: ${cat.fee}.00
                </div>
                <div style={{ fontSize: '0.78rem', marginTop: '0.3rem', opacity: 0.75 }}>
                  Minimum age: {cat.minAge}
                </div>
              </button>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">County of Residence <span className="required-mark">*</span></label>
            <select className="form-control" value={county} onChange={e => setCounty(e.target.value)} style={{ maxWidth: 360 }}>
              {HI_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <p className="form-hint">Applications are processed by your county police department.</p>
          </div>

          <div className="alert alert-gold">
            <strong>Important (HRS §134-2):</strong> A separate permit is required for each firearm purchased.
            Permits are valid for <strong>10 days</strong> from the date of issuance. You must register the
            acquired firearm with HPD within 5 days of acquisition (HRS §134-3).
          </div>

          <div className="btn-group">
            <button className="btn btn-gold" disabled={!category} onClick={() => setStep(2)}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Personal Info */}
      {step === 2 && (
        <div className="card">
          <div className="card-title">Step 2: Personal Information</div>
          <p style={{ color: '#5A7490', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Information is pre-filled from your account. Please verify all details are current and accurate.
          </p>

          <div className="form-row-3">
            <div className="form-group"><label className="form-label">First Name</label><input className="form-control" value={firstName} readOnly /></div>
            <div className="form-group"><label className="form-label">Last Name</label><input className="form-control" value={lastName} readOnly /></div>
            <div className="form-group"><label className="form-label">Date of Birth</label><input type="date" className="form-control" value={dob} readOnly /></div>
            <div className="form-group"><label className="form-label">Last 4 SSN</label><input className="form-control" value={ssn4} readOnly /></div>
            <div className="form-group"><label className="form-label">Height</label><input className="form-control" value={height} readOnly /></div>
            <div className="form-group"><label className="form-label">Weight (lbs)</label><input className="form-control" value={weight} readOnly /></div>
            <div className="form-group"><label className="form-label">Eye Color</label><input className="form-control" value={eyeColor} readOnly /></div>
            <div className="form-group"><label className="form-label">Hair Color</label><input className="form-control" value={hairColor} readOnly /></div>
            <div className="form-group">
              <label className="form-label">Gender <span className="required-mark">*</span></label>
              <select className="form-control" value={gender} onChange={e => setGender(e.target.value)}>
                {GENDER_VALUES.map(g => <option key={g.code} value={g.code}>{g.label}</option>)}
              </select>
            </div>
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
          <h4>Address</h4>
          <div className="form-row-2">
            <div className="form-group"><label className="form-label">Street Address</label><input className="form-control" value={address} readOnly /></div>
            <div className="form-group"><label className="form-label">City</label><input className="form-control" value={city} readOnly /></div>
            <div className="form-group"><label className="form-label">State</label><input className="form-control" value="HI" readOnly /></div>
            <div className="form-group"><label className="form-label">ZIP Code</label><input className="form-control" value={zip} readOnly /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-control" value={email} readOnly /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={phone} readOnly /></div>
          </div>

          <hr className="section-divider" />
          <h4>Previous Names / Aliases</h4>
          <div className="form-check">
            <input type="checkbox" id="has-alias" checked={hasAlias} onChange={e => setHasAlias(e.target.checked)} />
            <label className="form-check-label" htmlFor="has-alias">I have been known by another name</label>
          </div>
          {hasAlias && (
            <div className="form-row-3" style={{ marginTop: '0.75rem' }}>
              <div className="form-group"><label className="form-label">First Name (or "." if none)</label><input type="text" className="form-control" placeholder="First" /></div>
              <div className="form-group"><label className="form-label">Last Name</label><input type="text" className="form-control" /></div>
              <div className="form-group">
                <label className="form-label">Reason</label>
                <select className="form-control">
                  <option value="">-- Select --</option>
                  {NAME_CHANGE_REASONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="btn-group">
            <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-gold" onClick={() => setStep(3)}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 3: Eligibility / Disqualifiers */}
      {step === 3 && (
        <div className="card">
          <div className="card-title">Step 3: Eligibility Questions (HRS §134-7)</div>
          <p style={{ color: '#5A7490', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Answer each question truthfully. Providing false information is a criminal offense under Hawaii law.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {DISQUALIFIERS.map((d) => (
              <div key={d.id} style={{
                background: disqAnswers[d.id] ? '#FEF2F2' : '#F9FAFB',
                border: `1px solid ${disqAnswers[d.id] ? '#FCA5A5' : '#E5E7EB'}`,
                borderRadius: 6, padding: '0.85rem 1rem',
              }}>
                <div style={{ fontSize: '0.875rem', color: '#1B2A4A', marginBottom: '0.5rem', fontWeight: 500 }}>
                  {d.label}
                </div>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  {['No', 'Yes'].map(ans => (
                    <label key={ans} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                      <input
                        type="radio"
                        name={d.id}
                        value={ans}
                        checked={disqAnswers[d.id] === (ans === 'Yes')}
                        onChange={() => setDisqAnswers(prev => ({ ...prev, [d.id]: ans === 'Yes' }))}
                      />
                      <span style={{ color: ans === 'Yes' ? '#DC2626' : '#059669' }}>{ans}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {hasDisqualifier && (
            <div className="alert" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#7F1D1D', borderRadius: 4, padding: '0.85rem 1rem', marginTop: '1rem' }}>
              <strong>Notice:</strong> Based on your answers, you may not be eligible to receive a Permit to Acquire
              under HRS §134-7. Submitting a false application is a criminal offense. You may contact the HPD
              Firearms Unit at (808) 529-3371 for further guidance.
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                <strong>Potential denial reason:</strong>{' '}
                {PTA_DENIAL_REASONS[Object.keys(disqAnswers).findIndex(k => disqAnswers[k])] || 'See HRS §134-7'}
              </div>
            </div>
          )}

          <div className="btn-group">
            <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
            <button className="btn btn-gold" disabled={hasDisqualifier} onClick={() => setStep(4)}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Payment */}
      {step === 4 && (
        <div className="card">
          <div className="card-title">Step 4: Payment — Application Fee</div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem', padding: '1rem', background: '#F0F4FA', borderRadius: 6, border: '1px solid #B0C4DE' }}>
            <div style={{ fontSize: '2rem' }}>💳</div>
            <div>
              <div style={{ fontWeight: 700, color: '#1B2A4A', fontSize: '1rem' }}>
                {selectedCategory?.label} — Permit to Acquire
              </div>
              <div style={{ color: '#B8860B', fontWeight: 800, fontSize: '1.25rem' }}>
                ${selectedCategory?.fee}.00
              </div>
              <div style={{ fontSize: '0.78rem', color: '#6A849C' }}>Non-refundable application fee per HRS §134-2</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {[
              { id: 'credit', label: 'Credit / Debit Card', icon: '💳' },
              { id: 'echeck', label: 'eCheck / ACH', icon: '🏦' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setPayMethod(m.id)}
                style={{
                  flex: '1 1 160px', padding: '0.85rem', borderRadius: 6, cursor: 'pointer',
                  border: `2px solid ${payMethod === m.id ? '#C9A84C' : '#DCE4F0'}`,
                  background: payMethod === m.id ? '#FEF9EC' : '#fff',
                  fontWeight: 700, fontSize: '0.9rem', color: '#1B2A4A',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{m.icon}</div>
                {m.label}
              </button>
            ))}
          </div>

          {payMethod === 'credit' && (
            <div className="form-row-2">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Card Number <span className="required-mark">*</span></label>
                <input type="text" className="form-control" placeholder="•••• •••• •••• ••••" value={cardNumber} onChange={e => setCardNumber(e.target.value)} maxLength={19} style={{ maxWidth: 320 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Expiration (MM/YY) <span className="required-mark">*</span></label>
                <input type="text" className="form-control" placeholder="MM/YY" value={cardExp} onChange={e => setCardExp(e.target.value)} maxLength={5} style={{ maxWidth: 120 }} />
              </div>
              <div className="form-group">
                <label className="form-label">CVV <span className="required-mark">*</span></label>
                <input type="text" className="form-control" placeholder="•••" value={cardCvv} onChange={e => setCardCvv(e.target.value)} maxLength={4} style={{ maxWidth: 100 }} />
              </div>
            </div>
          )}

          {payMethod === 'echeck' && (
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Routing Number <span className="required-mark">*</span></label>
                <input type="text" className="form-control" maxLength={9} placeholder="9-digit routing number" />
              </div>
              <div className="form-group">
                <label className="form-label">Account Number <span className="required-mark">*</span></label>
                <input type="text" className="form-control" placeholder="Checking account number" />
              </div>
            </div>
          )}

          <p style={{ fontSize: '0.78rem', color: '#6A849C', marginTop: '0.5rem' }}>
            🔒 All payment information is encrypted using 256-bit SSL. Processed securely by the City &amp; County of Honolulu payment system.
          </p>

          <div className="btn-group">
            <button className="btn btn-secondary" onClick={() => setStep(3)}>← Back</button>
            <button
              className="btn btn-gold"
              disabled={!payMethod || (payMethod === 'credit' && (!cardNumber || !cardExp || !cardCvv))}
              onClick={() => setStep(5)}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Review & Submit */}
      {step === 5 && (
        <div className="card">
          <div className="card-title">Step 5: Review &amp; Submit</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            <div style={{ background: '#F0F4FA', padding: '0.85rem', borderRadius: 6 }}>
              <div style={{ fontWeight: 700, color: '#1B2A4A', marginBottom: '0.4rem' }}>Permit Details</div>
              <div><strong>Type:</strong> {selectedCategory?.label}</div>
              <div><strong>County:</strong> {county}</div>
              <div><strong>Statutory Ref:</strong> {selectedCategory?.hrsRef}</div>
              <div><strong>Fee:</strong> ${selectedCategory?.fee}.00</div>
            </div>
            <div style={{ background: '#F0F4FA', padding: '0.85rem', borderRadius: 6 }}>
              <div style={{ fontWeight: 700, color: '#1B2A4A', marginBottom: '0.4rem' }}>Applicant</div>
              <div><strong>Name:</strong> {firstName} {lastName}</div>
              <div><strong>DOB:</strong> {dob}</div>
              <div><strong>Email:</strong> {email}</div>
              <div><strong>Phone:</strong> {phone}</div>
            </div>
          </div>

          <div className="attest-box">
            <p style={{ fontSize: '0.875rem', color: '#1B2A4A', marginBottom: '0.75rem', fontWeight: 600 }}>
              Affidavit and Certification (HRS §134-2)
            </p>
            <p style={{ fontSize: '0.82rem', color: '#444', lineHeight: 1.7, marginBottom: '0.75rem' }}>
              I hereby certify, under penalty of law, that the information provided in this application
              is true, correct, and complete. I understand that providing false information on a firearm
              permit application is a criminal offense under Hawaii law. I further certify that I am not
              prohibited from possessing a firearm under HRS §134-7 or applicable federal law.
            </p>
            <div className="form-check" style={{ marginBottom: '0.75rem' }}>
              <input type="checkbox" id="attest" checked={attested} onChange={e => setAttested(e.target.checked)} />
              <label className="form-check-label" htmlFor="attest">
                I have read and agree to the above certification
              </label>
            </div>
            <div className="form-row-2">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Electronic Signature <span className="required-mark">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type your full legal name"
                  value={signature}
                  onChange={e => setSignature(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Date (Auto-populated)</label>
                <input type="text" className="form-control" value={today} readOnly />
              </div>
            </div>
          </div>

          <div className="btn-group">
            <button className="btn btn-secondary" onClick={() => setStep(4)}>← Back</button>
            <button
              className="btn btn-gold"
              disabled={!attested || !signature}
              onClick={() => setSubmitted(true)}
              style={{ fontWeight: 700 }}
            >
              Submit &amp; Pay ${selectedCategory?.fee}.00 ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
