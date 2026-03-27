// RFP-HPD-1954933: LTC Application — HRS §134-9, §134-9.6
// Forms: HPD-150A (Application), HPD-150B (Background), HPD-150C (Reference), HPD-150D (Affidavit)
// REQ: 120-Day Statutory Deadline, Appointment Scheduling, Background Check Tracking
// REQ: Mental Health Waiver, Training Certificate Upload, Fingerprinting Appointment
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RACE_VALUES, ETHNICITY_VALUES, GENDER_VALUES, NAME_CHANGE_REASONS, LTC_TRAINING_TYPES, APPOINTMENT_TYPES } from '../../types';

const CARRY_TYPES = [
  { value: 'concealed', label: 'Concealed Carry', icon: '🪪', desc: 'Carry a firearm concealed on your person.' },
  { value: 'open', label: 'Open Carry', icon: '🔫', desc: 'Carry a firearm openly, visible to the public.' },
];

const GOOD_CAUSE_OPTIONS = [
  'Personal Protection — Documented Threat',
  'Business / Employment Necessity',
  'Protection of Property (Business Owner)',
  'Other — Describe Below',
];

const REFERENCES = [
  { id: 'ref1', label: 'Reference 1 — HPD-150C' },
  { id: 'ref2', label: 'Reference 2 — HPD-150C' },
];

export default function LTCApplication() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [carryType, setCarryType] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Applicant (pre-filled mock)
  const [firstName] = useState('Maile');
  const [lastName] = useState('Kahananui');
  const [dob] = useState('1988-03-22');
  const [email] = useState('maile.k@email.com');
  const [phone] = useState('(808) 555-0271');
  const [address] = useState('456 Ala Moana Blvd, Unit 8A');
  const [city] = useState('Honolulu');
  const [gender, setGender] = useState('F');
  const [race, setRace] = useState('P');
  const [ethnicity, setEthnicity] = useState('N');
  const [height] = useState('5\'4"');
  const [weight] = useState('130');

  // Good cause
  const [goodCause, setGoodCause] = useState('');
  const [goodCauseDetail, setGoodCauseDetail] = useState('');

  // Training
  const [trainingType, setTrainingType] = useState('');
  const [trainingDate, setTrainingDate] = useState('');
  const [trainingInstructor, setTrainingInstructor] = useState('');
  const [hasMilitaryTraining, setHasMilitaryTraining] = useState(false);

  // Mental health
  const [mentalHealthAdjudicated, setMentalHealthAdjudicated] = useState(false);
  const [mentalHealthWaiver, setMentalHealthWaiver] = useState(false);

  // Documents
  const [trainingUploaded, setTrainingUploaded] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [residencyUploaded, setResidencyUploaded] = useState(false);

  // Fingerprinting appointment
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('');

  // Affidavit / Signature (HPD-150D)
  const [attested, setAttested] = useState(false);
  const [signature, setSignature] = useState('');
  const today = new Date().toLocaleDateString();

  const appNumber = 'LTC-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 900000 + 100000)).padStart(6, '0');
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 120);
  const deadlineStr = deadline.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  if (submitted) {
    return (
      <div>
        <div className="card confirmation-page">
          <div className="confirmation-icon">🪪</div>
          <h2 style={{ color: '#1B6B3A' }}>LTC Application Submitted</h2>
          <p style={{ color: '#5A7490', marginBottom: '1rem' }}>
            Your License to Carry application has been received by the HPD Firearms Unit.
          </p>
          <div className="confirmation-ticket">
            <strong>Application No.:</strong> {appNumber}<br />
            <strong>Applicant:</strong> {firstName} {lastName}<br />
            <strong>Carry Type:</strong> {carryType === 'concealed' ? 'Concealed Carry' : 'Open Carry'}<br />
            <strong>Fee Paid:</strong> $100.00<br />
            <strong>Date Submitted:</strong> {today}<br />
            <strong>Fingerprinting Appointment:</strong> {apptDate} at {apptTime}<br />
            <strong style={{ color: '#C9A84C' }}>Statutory Deadline (HRS §134-9):</strong>{' '}
            <strong>{deadlineStr}</strong><br />
            <span style={{ fontSize: '0.8rem', color: '#6A849C' }}>HPD must render a decision within 120 days of this application date.</span>
          </div>

          {/* 120-Day Deadline Box */}
          <div style={{
            background: '#FEF9EC', border: '2px solid #C9A84C', borderRadius: 8,
            padding: '1rem 1.25rem', maxWidth: 480, margin: '1rem auto', textAlign: 'left',
          }}>
            <div style={{ fontWeight: 700, color: '#1B2A4A', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
              120-Day Processing Deadline — HRS §134-9
            </div>
            <div style={{ background: '#E5E7EB', borderRadius: 8, height: 10, overflow: 'hidden', marginBottom: '0.4rem' }}>
              <div style={{ height: '100%', width: '1%', background: '#C9A84C', borderRadius: 8 }} />
            </div>
            <div style={{ fontSize: '0.8rem', color: '#5A7490' }}>
              Day 0 of 120 &nbsp;|&nbsp; Deadline: <strong style={{ color: '#C9A84C' }}>{deadlineStr}</strong>
            </div>
          </div>

          <div className="alert" style={{ background: '#E8F5E9', border: '1px solid #4CAF50', borderRadius: 4, color: '#1B4332', maxWidth: 460, margin: '1rem auto', textAlign: 'left', padding: '0.85rem 1rem' }}>
            <strong>Next Steps:</strong>
            <ul style={{ marginTop: '0.5rem', marginLeft: '1.25rem', fontSize: '0.875rem', lineHeight: 1.7 }}>
              <li>Attend fingerprinting appointment on <strong>{apptDate}</strong>.</li>
              <li>HPD will conduct a full NCIC/CJIS background check.</li>
              <li>You may be contacted for an in-person interview.</li>
              <li>Track your application status online or call (808) 529-3371.</li>
              <li>HPD must decide within <strong>120 days</strong> per HRS §134-9.</li>
            </ul>
          </div>

          <div className="btn-group" style={{ justifyContent: 'center' }}>
            <button className="btn btn-gold" onClick={() => window.print()}>🖨️ Print Application Packet</button>
            <button className="btn btn-secondary" onClick={() => navigate('/licensing')}>Back to LTC Portal</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="back-nav" onClick={() => navigate('/licensing')}>← Back to License to Carry</button>
      <h1 style={{ color: '#1B2A4A' }}>License to Carry Application</h1>
      <p style={{ color: '#5A7490', marginBottom: '1rem' }}>
        City &amp; County of Honolulu &nbsp;|&nbsp; HRS §134-9 &nbsp;|&nbsp; Forms HPD-150A / 150B / 150C / 150D
      </p>

      {/* 120-Day Notice */}
      <div className="alert alert-gold">
        <strong>Statutory Deadline (HRS §134-9):</strong> HPD must approve or deny your application within
        <strong> 120 days</strong> of receipt. You will receive email and SMS status updates.
        Application fee: <strong>$100.00</strong> (non-refundable).
      </div>

      {/* Progress Steps */}
      <div className="steps">
        {['Carry Type', 'Personal Info', 'Good Cause', 'Training & Health', 'Documents', 'Appointment', 'Submit'].map((s, i) => (
          <div key={s} className={`step ${step === i + 1 ? 'active' : step > i + 1 ? 'completed' : ''}`}>
            <span className="step-number">{step > i + 1 ? '✓' : i + 1}</span>{s}
          </div>
        ))}
      </div>

      {/* Step 1: Carry Type */}
      {step === 1 && (
        <div className="card">
          <div className="card-title">Step 1: Select Carry Type (HPD-150A)</div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {CARRY_TYPES.map(ct => (
              <button
                key={ct.value}
                onClick={() => setCarryType(ct.value)}
                style={{
                  flex: '1 1 220px', padding: '1.25rem', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                  background: carryType === ct.value ? '#1B2A4A' : '#fff',
                  border: `2px solid ${carryType === ct.value ? '#C9A84C' : '#DCE4F0'}`,
                  color: carryType === ct.value ? '#fff' : '#1B2A4A',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>{ct.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>{ct.label}</div>
                <div style={{ fontSize: '0.82rem', opacity: 0.8 }}>{ct.desc}</div>
              </button>
            ))}
          </div>

          <div className="alert" style={{ background: '#F0F4FA', border: '1px solid #B0C4DE', borderRadius: 4, padding: '0.85rem 1rem', color: '#1B2A4A' }}>
            <strong>Note:</strong> Both concealed and open carry require demonstrated good cause under HRS §134-9.
            The 120-day processing clock begins upon receipt of a complete application.
          </div>

          <div className="btn-group">
            <button className="btn btn-gold" disabled={!carryType} onClick={() => setStep(2)}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 2: Personal Info (HPD-150A) */}
      {step === 2 && (
        <div className="card">
          <div className="card-title">Step 2: Personal Information (HPD-150A)</div>
          <p style={{ fontSize: '0.875rem', color: '#5A7490', marginBottom: '1rem' }}>
            Pre-filled from your account. Please verify all details are accurate.
          </p>

          <div className="form-row-3">
            <div className="form-group"><label className="form-label">First Name</label><input className="form-control" value={firstName} readOnly /></div>
            <div className="form-group"><label className="form-label">Last Name</label><input className="form-control" value={lastName} readOnly /></div>
            <div className="form-group"><label className="form-label">Date of Birth</label><input type="date" className="form-control" value={dob} readOnly /></div>
            <div className="form-group"><label className="form-label">Height</label><input className="form-control" value={height} readOnly /></div>
            <div className="form-group"><label className="form-label">Weight (lbs)</label><input className="form-control" value={weight} readOnly /></div>
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
          <div className="form-row-2">
            <div className="form-group"><label className="form-label">Address</label><input className="form-control" value={address} readOnly /></div>
            <div className="form-group"><label className="form-label">City</label><input className="form-control" value={city} readOnly /></div>
            <div className="form-group"><label className="form-label">State</label><input className="form-control" value="HI" readOnly /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-control" value={email} readOnly /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={phone} readOnly /></div>
          </div>

          <div className="btn-group">
            <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-gold" onClick={() => setStep(3)}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 3: Good Cause (HPD-150A) */}
      {step === 3 && (
        <div className="card">
          <div className="card-title">Step 3: Good Cause Statement (HPD-150A / HRS §134-9)</div>
          <p style={{ fontSize: '0.875rem', color: '#5A7490', marginBottom: '1rem' }}>
            Hawaii requires applicants to demonstrate "good cause" for issuance of a License to Carry.
            Your statement will be reviewed by the HPD Chief of Police.
          </p>

          <div className="form-group">
            <label className="form-label">Primary Reason for Applying <span className="required-mark">*</span></label>
            <select className="form-control" value={goodCause} onChange={e => setGoodCause(e.target.value)} style={{ maxWidth: 440 }}>
              <option value="">-- Select Good Cause --</option>
              {GOOD_CAUSE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {goodCause && (
            <div className="form-group">
              <label className="form-label">
                Detailed Statement <span className="required-mark">*</span>
                <span className="form-hint" style={{ display: 'inline', marginLeft: '0.5rem' }}>(Minimum 100 characters)</span>
              </label>
              <textarea
                className="form-control"
                rows={5}
                placeholder="Provide a detailed explanation of the circumstances that necessitate carrying a firearm..."
                value={goodCauseDetail}
                onChange={e => setGoodCauseDetail(e.target.value)}
              />
              <p className="form-hint">{goodCauseDetail.length}/100 minimum characters</p>
            </div>
          )}

          <div className="btn-group">
            <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
            <button className="btn btn-gold" disabled={!goodCause || goodCauseDetail.length < 100} onClick={() => setStep(4)}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 4: Training & Mental Health (HPD-150B) */}
      {step === 4 && (
        <div className="card">
          <div className="card-title">Step 4: Training &amp; Mental Health (HPD-150B)</div>

          <h4>Firearms Training Certification (Required — HRS §134-9)</h4>
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Training Type <span className="required-mark">*</span></label>
              <select className="form-control" value={trainingType} onChange={e => setTrainingType(e.target.value)}>
                <option value="">-- Select --</option>
                {LTC_TRAINING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Training Completion Date <span className="required-mark">*</span></label>
              <input type="date" className="form-control" value={trainingDate} onChange={e => setTrainingDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Instructor / Agency</label>
              <input type="text" className="form-control" value={trainingInstructor} onChange={e => setTrainingInstructor(e.target.value)} placeholder="Instructor name or agency" />
            </div>
          </div>

          {trainingType === 'Military Training (DD-214 Required)' && (
            <div className="alert alert-gold">
              <strong>DD-214 Required:</strong> Military training must be supported by your DD-214 (Certificate of Release or Discharge from Active Duty). Upload in the Documents step.
            </div>
          )}

          <div className="form-check" style={{ marginBottom: '0.75rem' }}>
            <input type="checkbox" id="mil-training" checked={hasMilitaryTraining} onChange={e => setHasMilitaryTraining(e.target.checked)} />
            <label className="form-check-label" htmlFor="mil-training">I have completed military service firearms training (DD-214 required)</label>
          </div>

          <hr className="section-divider" />
          <h4>Mental Health Disclosure (HPD-150B / HRS §134-7)</h4>
          <div className="form-check">
            <input type="checkbox" id="mh-adj" checked={mentalHealthAdjudicated} onChange={e => setMentalHealthAdjudicated(e.target.checked)} />
            <label className="form-check-label" htmlFor="mh-adj">
              I have been adjudicated as mentally defective or committed to a mental institution
            </label>
          </div>
          {mentalHealthAdjudicated && (
            <div style={{ marginTop: '0.75rem', padding: '1rem', background: '#FEF9EC', border: '1px solid #C9A84C', borderRadius: 6 }}>
              <div className="form-check">
                <input type="checkbox" id="mh-waiver" checked={mentalHealthWaiver} onChange={e => setMentalHealthWaiver(e.target.checked)} />
                <label className="form-check-label" htmlFor="mh-waiver">
                  I am applying for a Mental Health Waiver. I understand I must submit supporting documentation from a licensed mental health professional.
                </label>
              </div>
            </div>
          )}

          {/* References (HPD-150C) */}
          <hr className="section-divider" />
          <h4>Character References — HPD-150C (Two Required)</h4>
          <p style={{ fontSize: '0.82rem', color: '#5A7490', marginBottom: '0.75rem' }}>
            Two character references are required. References must not be family members.
          </p>
          {REFERENCES.map(ref => (
            <div key={ref.id} style={{ background: '#F0F4FA', padding: '0.85rem', borderRadius: 6, marginBottom: '0.5rem' }}>
              <div style={{ fontWeight: 600, color: '#1B2A4A', marginBottom: '0.5rem', fontSize: '0.875rem' }}>{ref.label}</div>
              <div className="form-row-3">
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Full Name</label><input type="text" className="form-control" /></div>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Relationship</label><input type="text" className="form-control" /></div>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Phone</label><input type="tel" className="form-control" /></div>
              </div>
            </div>
          ))}

          <div className="btn-group">
            <button className="btn btn-secondary" onClick={() => setStep(3)}>← Back</button>
            <button className="btn btn-gold" disabled={!trainingType || !trainingDate} onClick={() => setStep(5)}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 5: Documents */}
      {step === 5 && (
        <div className="card">
          <div className="card-title">Step 5: Supporting Documents</div>
          <p style={{ fontSize: '0.875rem', color: '#5A7490', marginBottom: '1rem' }}>
            Upload required documents. All files must be PDF, JPG, or PNG (max 10 MB each).
          </p>

          {[
            { label: 'Training Certificate', required: true, uploaded: trainingUploaded, onToggle: () => setTrainingUploaded(!trainingUploaded) },
            { label: 'Government-Issued Photo ID', required: true, uploaded: photoUploaded, onToggle: () => setPhotoUploaded(!photoUploaded) },
            { label: 'Proof of Residency', required: true, uploaded: residencyUploaded, onToggle: () => setResidencyUploaded(!residencyUploaded) },
          ].map(doc => (
            <div key={doc.label} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.85rem', padding: '0.85rem', background: doc.uploaded ? '#E8F5E9' : '#F9FAFB', border: `1px solid ${doc.uploaded ? '#4CAF50' : '#DCE4F0'}`, borderRadius: 6 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#1B2A4A', fontSize: '0.875rem' }}>
                  {doc.label} {doc.required && <span className="required-mark">*</span>}
                </div>
                <input type="file" className="form-control" accept=".pdf,.jpg,.png" style={{ marginTop: '0.4rem', maxWidth: 320 }} onChange={doc.onToggle} />
              </div>
              {doc.uploaded && <span style={{ color: '#059669', fontWeight: 700, fontSize: '1.1rem' }}>✓</span>}
            </div>
          ))}

          {mentalHealthAdjudicated && (
            <div style={{ padding: '0.85rem', background: '#FEF9EC', border: '1px solid #C9A84C', borderRadius: 6, marginBottom: '0.85rem' }}>
              <div style={{ fontWeight: 600, color: '#1B2A4A', marginBottom: '0.4rem' }}>Mental Health Waiver Documentation <span className="required-mark">*</span></div>
              <input type="file" className="form-control" accept=".pdf,.jpg,.png" style={{ maxWidth: 320 }} />
            </div>
          )}

          {hasMilitaryTraining && (
            <div style={{ padding: '0.85rem', background: '#F0F4FA', border: '1px solid #B0C4DE', borderRadius: 6, marginBottom: '0.85rem' }}>
              <div style={{ fontWeight: 600, color: '#1B2A4A', marginBottom: '0.4rem' }}>DD-214 (Certificate of Release) <span className="required-mark">*</span></div>
              <input type="file" className="form-control" accept=".pdf,.jpg,.png" style={{ maxWidth: 320 }} />
            </div>
          )}

          <div className="btn-group">
            <button className="btn btn-secondary" onClick={() => setStep(4)}>← Back</button>
            <button className="btn btn-gold" disabled={!trainingUploaded || !photoUploaded || !residencyUploaded} onClick={() => setStep(6)}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 6: Appointment Scheduling */}
      {step === 6 && (
        <div className="card">
          <div className="card-title">Step 6: Schedule Fingerprinting Appointment</div>
          <p style={{ fontSize: '0.875rem', color: '#5A7490', marginBottom: '1rem' }}>
            All LTC applicants must appear in person at the HPD Firearms Unit for fingerprinting.
            Select a date and time that works for you.
          </p>

          <div style={{ background: '#F0F4FA', border: '1px solid #B0C4DE', borderRadius: 6, padding: '0.85rem 1rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
            <div style={{ fontWeight: 700, color: '#1B2A4A' }}>HPD Firearms Unit — 801 South Beretania Street, Honolulu, HI 96813</div>
            <div style={{ color: '#5A7490' }}>Available Monday–Friday, 8 AM–3:30 PM HST (closed state holidays)</div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">
                Appointment Type <span className="required-mark">*</span>
              </label>
              <select className="form-control">
                <option value="fingerprint">Fingerprinting — LTC</option>
                {APPOINTMENT_TYPES.filter(t => t !== 'Fingerprinting — LTC').map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Preferred Date <span className="required-mark">*</span></label>
              <input type="date" className="form-control" value={apptDate} onChange={e => setApptDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="form-group">
              <label className="form-label">Preferred Time <span className="required-mark">*</span></label>
              <select className="form-control" value={apptTime} onChange={e => setApptTime(e.target.value)}>
                <option value="">-- Select --</option>
                {['8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="btn-group">
            <button className="btn btn-secondary" onClick={() => setStep(5)}>← Back</button>
            <button className="btn btn-gold" disabled={!apptDate || !apptTime} onClick={() => setStep(7)}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 7: Review & Submit (HPD-150D Affidavit) */}
      {step === 7 && (
        <div className="card">
          <div className="card-title">Step 7: Affidavit &amp; Submit (HPD-150D)</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            <div style={{ background: '#F0F4FA', padding: '0.85rem', borderRadius: 6 }}>
              <div style={{ fontWeight: 700, color: '#1B2A4A', marginBottom: '0.4rem' }}>Application Summary</div>
              <div><strong>Carry Type:</strong> {carryType === 'concealed' ? 'Concealed Carry' : 'Open Carry'}</div>
              <div><strong>Good Cause:</strong> {goodCause}</div>
              <div><strong>Training:</strong> {trainingType} ({trainingDate})</div>
              <div><strong>Fingerprinting:</strong> {apptDate} at {apptTime}</div>
              <div><strong>Fee:</strong> $100.00</div>
            </div>
            <div style={{ background: '#F0F4FA', padding: '0.85rem', borderRadius: 6 }}>
              <div style={{ fontWeight: 700, color: '#1B2A4A', marginBottom: '0.4rem' }}>Applicant</div>
              <div><strong>Name:</strong> {firstName} {lastName}</div>
              <div><strong>DOB:</strong> {dob}</div>
              <div><strong>Email:</strong> {email}</div>
              <div><strong>Phone:</strong> {phone}</div>
            </div>
          </div>

          {/* 120-Day Deadline Information */}
          <div style={{ background: '#FEF9EC', border: '2px solid #C9A84C', borderRadius: 6, padding: '0.85rem 1rem', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 700, color: '#1B2A4A', marginBottom: '0.25rem' }}>120-Day Statutory Deadline (HRS §134-9)</div>
            <div style={{ fontSize: '0.875rem', color: '#5A7490' }}>
              HPD must approve or deny your application within <strong>120 days</strong> of the date received.
              Statutory deadline: <strong style={{ color: '#C9A84C' }}>{deadlineStr}</strong>.
              If HPD fails to act within 120 days, you may seek judicial review.
            </div>
          </div>

          <div className="attest-box">
            <p style={{ fontSize: '0.875rem', color: '#1B2A4A', fontWeight: 600, marginBottom: '0.5rem' }}>
              Affidavit of Acknowledgment (HPD-150D)
            </p>
            <p style={{ fontSize: '0.82rem', color: '#444', lineHeight: 1.7, marginBottom: '0.75rem' }}>
              I, the undersigned, hereby certify under penalty of law that all information provided in this
              License to Carry application and supporting documents is true, accurate, and complete.
              I acknowledge that providing false information is a criminal offense under Hawaii law (HRS §134).
              I further certify that I meet all eligibility requirements under HRS §134-7 and §134-9, and
              that I will comply with all terms and conditions of any license issued, including all applicable
              provisions of the Hawaii Revised Statutes and Rules of the Chief of Police.
            </p>
            <div className="form-check" style={{ marginBottom: '0.75rem' }}>
              <input type="checkbox" id="attest-ltc" checked={attested} onChange={e => setAttested(e.target.checked)} />
              <label className="form-check-label" htmlFor="attest-ltc">
                I have read and agree to this affidavit (HPD-150D)
              </label>
            </div>
            <div className="form-row-2">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Electronic Signature <span className="required-mark">*</span></label>
                <input type="text" className="form-control" placeholder="Type your full legal name" value={signature} onChange={e => setSignature(e.target.value)} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Date (Auto-populated)</label>
                <input type="text" className="form-control" value={today} readOnly />
              </div>
            </div>
          </div>

          <div className="btn-group">
            <button className="btn btn-secondary" onClick={() => setStep(6)}>← Back</button>
            <button
              className="btn btn-gold"
              disabled={!attested || !signature}
              onClick={() => setSubmitted(true)}
              style={{ fontWeight: 700 }}
            >
              Submit Application &amp; Pay $100.00 ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
