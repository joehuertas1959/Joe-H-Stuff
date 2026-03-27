// REQ-0042: Public Users request unique serial numbers via Serialization Module
// REQ-0044: Support Non-Dealer Serial Number Request Details
// REQ-0046: Issuance of Unique Serial Number
// REQ-0047: Notify Users of Serial Number Issuance
// REQ-0049: Return Warning for Time of Serialization
// REQ-0051: Mark a Serial Number as Unused
// REQ-0052: Return Non-Transferable Warning
// REQ-0113: Support New Application Registration Without SNs
// REQ-0165: Develop and Maintain a Serial Number Request System
// REQ-0220: Electronic Serialization Effective Date
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FIREARM_TYPES, FIREARM_MAKES, SERIALIZATION_SCHEMA, MEANS_OF_PRODUCTION, LICENSE_TYPES } from '../../types';

type RequesterType = 'licensed' | 'unlicensed' | '';

const NO_BARREL_CALIBER = ['Stun Gun', 'Frame', 'Receiver'];

export default function SerializationRequest() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [requesterType, setRequesterType] = useState<RequesterType>('');
  const [licenseNo, setLicenseNo] = useState('');
  const [licenseType, setLicenseType] = useState('');
  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Smith');
  const [dob, setDob] = useState('1980-05-15');
  const [pob, setPob] = useState('Boston, MA');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dlNumber, setDlNumber] = useState('');
  const [dlState, setDlState] = useState('MA');
  const [taxId, setTaxId] = useState('');
  const [hasDL, setHasDL] = useState(true);

  const [firearmType, setFirearmType] = useState('');
  const [firearmMake, setFirearmMake] = useState('');
  const [firearmModel, setFirearmModel] = useState('');
  const [firearmCaliber, setFirearmCaliber] = useState('');
  const [firearmBarrel, setFirearmBarrel] = useState('');
  const [isPrivatelyMade, setIsPrivatelyMade] = useState(false);
  const [meansOfProduction, setMeansOfProduction] = useState('');
  const [meansOther, setMeansOther] = useState('');

  const [isCompany, setIsCompany] = useState(false);
  const [mfgFirstName, setMfgFirstName] = useState('');
  const [mfgLastName, setMfgLastName] = useState('');
  const [mfgCompany, setMfgCompany] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [serialNumber, setSerialNumber] = useState('');

  const hideBarrelCaliber = NO_BARREL_CALIBER.includes(firearmType);

  function generateSerial(): string {
    const prefix = SERIALIZATION_SCHEMA[firearmType] || 'MAFRB-';
    const suffix = String(Math.floor(Math.random() * 900000000 + 100000000));
    return prefix + suffix;
  }

  function submitRequest() {
    setSerialNumber(generateSerial());
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div>
        <button className="back-nav" onClick={() => navigate('/')}>← Back to Portal</button>
        <div className="card">
          <div className="card-title" style={{ color: '#388557' }}>✅ Serial Number Issued</div>

          {/* REQ-0049: Timing warning */}
          <div className="alert alert-warning">
            <strong>⚠️ Timing Notice:</strong> Per 501 CMR regulations, serial numbers must be applied
            to the firearm within the required timeframe from manufacture or assembly.
            Failure to comply may result in penalties.
          </div>

          {/* REQ-0052: Non-transferable */}
          <div className="alert alert-danger">
            <strong>⛔ Non-Transferable:</strong> The serial number assigned by DCJIS is non-transferable.
            Transfer of this serial number to any firearm other than the one identified in this request
            is expressly prohibited.
          </div>

          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ fontSize: '0.9rem', color: '#616161', marginBottom: '0.5rem' }}>Your assigned serial number:</div>
            <div className="serial-number-display">{serialNumber}</div>
            <div style={{ fontSize: '0.8rem', color: '#616161', marginTop: '0.75rem' }}>
              Issued: {new Date().toLocaleDateString()} &nbsp;|&nbsp;
              Type: {firearmType} &nbsp;|&nbsp;
              {firstName} {lastName}
            </div>
          </div>

          <div className="confirmation-ticket" style={{ margin: '0 auto', display: 'block' }}>
            <strong>Registrant:</strong> {firstName} {lastName}<br />
            <strong>Date of Request:</strong> {new Date().toLocaleDateString()}<br />
            <strong>Serial Number:</strong> {serialNumber}<br />
            <strong>Firearm Type:</strong> {firearmType}<br />
            <strong>Make:</strong> {firearmMake}<br />
            <strong>Model:</strong> {firearmModel}<br />
            {!hideBarrelCaliber && <><strong>Caliber:</strong> {firearmCaliber}<br /></>}
            {isPrivatelyMade && <><strong>Privately Made:</strong> Yes — {meansOfProduction}<br /></>}
          </div>

          <div className="alert alert-info" style={{ marginTop: '1rem' }}>
            It is the requestor's responsibility to retain the document containing the serial number for
            their records. DCJIS will not mail a physical copy.
            <br /><br />
            <strong>⚠️ Reminder:</strong> You must register this firearm after applying the serial number.
          </div>

          {/* REQ-0051: Mark as unused */}
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#f9f9f9', border: '1px solid #ddd', borderRadius: 4 }}>
            <h4>Serial Number No Longer Needed?</h4>
            <p style={{ fontSize: '0.875rem', color: '#616161', marginBottom: '0.75rem' }}>
              If you no longer need this serial number, you may mark it as unused. Once marked unused,
              the serial number cannot be reactivated or reused in the future.
            </p>
            <button className="btn btn-danger btn-sm">Mark Serial Number as Unused</button>
          </div>

          <div className="btn-group">
            <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print Serial Number Document</button>
            <button className="btn btn-secondary" onClick={() => navigate('/pta/registration')}>Register this Firearm</button>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>Return to Portal</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="back-nav" onClick={() => navigate('/')}>← Back to Portal</button>
      <h1 style={{ color: '#0d3f6b' }}>Request a Firearm Serial Number</h1>

      <div className="alert alert-info">
        <strong>ℹ️ Serial Number Request System:</strong> Per M.G.L. c.140 §121C, DCJIS provides unique
        serial numbers for privately made firearms and firearms without valid serial numbers.
        Upon approval, your serial number will be available in your results inbox.
      </div>

      {/* Steps */}
      <div className="steps">
        {['Requester Type', 'Personal Info', 'Firearm Info', 'Review'].map((s, i) => (
          <div key={s} className={`step ${step === i + 1 ? 'active' : step > i + 1 ? 'completed' : ''}`}>
            <span className="step-number">{step > i + 1 ? '✓' : i + 1}</span>{s}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="card">
          <div className="card-title">Step 1: Requester Type</div>
          <p style={{ color: '#616161', marginBottom: '1rem', fontSize: '0.875rem' }}>
            Select your licensing status to determine what information is required.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {[
              { val: 'licensed' as RequesterType, icon: '🪪', label: 'I have a Massachusetts firearms license', desc: 'LTC, FID, Machine Gun, Non-Resident LTC, Gun Club, or Gunsmith license.' },
              { val: 'unlicensed' as RequesterType, icon: '👤', label: 'I do not have a Massachusetts firearms license', desc: 'Driver\'s license or Tax ID required.' },
            ].map(({ val, icon, label, desc }) => (
              <button key={val} onClick={() => setRequesterType(val)}
                style={{ flex: '1 1 220px', background: requesterType === val ? '#e8f0f9' : '#fff', border: `2px solid ${requesterType === val ? '#14558f' : '#d0d0d0'}`, borderRadius: 8, padding: '1rem', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>{icon}</div>
                <div style={{ fontWeight: 700, color: '#0d3f6b', marginBottom: '0.25rem', fontSize: '0.9rem' }}>{label}</div>
                <div style={{ fontSize: '0.8rem', color: '#616161' }}>{desc}</div>
              </button>
            ))}
          </div>
          <div className="btn-group">
            <button className="btn btn-primary" disabled={!requesterType} onClick={() => setStep(2)}>Continue →</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <div className="card-title">Step 2: Personal Information</div>

          {requesterType === 'licensed' && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '1rem' }}>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label className="form-label">License No. <span className="required-mark">*</span></label>
                <input type="text" className="form-control" value={licenseNo} onChange={e => setLicenseNo(e.target.value)} placeholder="e.g. LTC-12345" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">License Type</label>
                <select className="form-control" value={licenseType} onChange={e => setLicenseType(e.target.value)} style={{ width: 280 }}>
                  <option value="">-- Select --</option>
                  {LICENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <button className="btn btn-secondary" type="button">Look Up</button>
            </div>
          )}

          <div className="alert alert-success" style={{ display: requesterType === 'licensed' ? 'block' : 'none' }}>
            ✅ Pre-filled from license record
          </div>

          <div className="form-row-2">
            <div className="form-group"><label className="form-label">First Name <span className="required-mark">*</span></label><input type="text" className="form-control" value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Last Name <span className="required-mark">*</span></label><input type="text" className="form-control" value={lastName} onChange={e => setLastName(e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Date of Birth <span className="required-mark">*</span></label><input type="date" className="form-control" value={dob} onChange={e => setDob(e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Place of Birth <span className="required-mark">*</span></label><input type="text" className="form-control" value={pob} onChange={e => setPob(e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Address <span className="required-mark">*</span></label><input type="text" className="form-control" value={address} onChange={e => setAddress(e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Phone <span className="required-mark">*</span></label><input type="tel" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} /></div>
          </div>

          {requesterType === 'unlicensed' && (
            <div>
              <hr className="section-divider" />
              <p style={{ fontSize: '0.875rem', color: '#616161', marginBottom: '0.75rem' }}>
                <strong>Identity Verification:</strong> Non-licensed individuals must provide either a
                driver's license number (with state) or a Tax ID. If you do not have either, please
                contact the Firearms Records Bureau.
              </p>
              <div className="form-check" style={{ marginBottom: '0.75rem' }}>
                <input type="checkbox" id="has-dl" checked={hasDL} onChange={e => setHasDL(e.target.checked)} />
                <label className="form-check-label" htmlFor="has-dl">I have a driver's license or motor vehicle operator's license</label>
              </div>
              {hasDL ? (
                <div className="form-row-2">
                  <div className="form-group"><label className="form-label">Driver's License No. <span className="required-mark">*</span></label><input type="text" className="form-control" value={dlNumber} onChange={e => setDlNumber(e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">State <span className="required-mark">*</span></label><input type="text" className="form-control" value={dlState} onChange={e => setDlState(e.target.value)} style={{ maxWidth: 100 }} /></div>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Tax ID <span className="required-mark">*</span></label>
                  <p className="form-hint">Enter your Tax ID number (e.g. for a museum or other business). No state required for Tax ID.</p>
                  <input type="text" className="form-control" value={taxId} onChange={e => setTaxId(e.target.value)} style={{ maxWidth: 300 }} />
                </div>
              )}
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
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Type <span className="required-mark">*</span></label>
              <select className="form-control" value={firearmType} onChange={e => setFirearmType(e.target.value)}>
                <option value="">-- Select --</option>
                {FIREARM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {firearmType && <p className="form-hint" style={{ fontFamily: 'monospace' }}>Schema: {SERIALIZATION_SCHEMA[firearmType] || 'MAFRB-'}#########</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Make <span className="required-mark">*</span></label>
              <select className="form-control" value={firearmMake} onChange={e => setFirearmMake(e.target.value)}>
                <option value="">-- Select --</option>
                {FIREARM_MAKES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Model <span className="required-mark">*</span></label>
              <input type="text" className="form-control" value={firearmModel} onChange={e => setFirearmModel(e.target.value)} />
            </div>
          </div>

          {!hideBarrelCaliber && (
            <div className="form-row-2">
              <div className="form-group"><label className="form-label">Caliber <span className="required-mark">*</span></label><input type="text" className="form-control" value={firearmCaliber} onChange={e => setFirearmCaliber(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Barrel Length (inches) <span className="required-mark">*</span></label><input type="text" className="form-control" value={firearmBarrel} onChange={e => setFirearmBarrel(e.target.value)} /></div>
            </div>
          )}
          {hideBarrelCaliber && firearmType && (
            <p className="form-hint">ℹ️ Barrel length and caliber are not required for {firearmType}.</p>
          )}

          <hr className="section-divider" />
          <h4>Manufacturer Information</h4>
          <div className="form-check" style={{ marginBottom: '0.75rem' }}>
            <input type="checkbox" id="is-company" checked={isCompany} onChange={e => setIsCompany(e.target.checked)} />
            <label className="form-check-label" htmlFor="is-company">This is a privately made firearm by a company or organization</label>
          </div>
          <div className="form-row-3">
            {(isCompany || !isPrivatelyMade) && (
              <>
                <div className="form-group"><label className="form-label">First Name <span className="required-mark">*</span></label><input type="text" className="form-control" value={mfgFirstName} onChange={e => setMfgFirstName(e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Last Name <span className="required-mark">*</span></label><input type="text" className="form-control" value={mfgLastName} onChange={e => setMfgLastName(e.target.value)} /></div>
              </>
            )}
            {isCompany && (
              <div className="form-group"><label className="form-label">Company Name <span className="required-mark">*</span></label><input type="text" className="form-control" value={mfgCompany} onChange={e => setMfgCompany(e.target.value)} /></div>
            )}
          </div>

          <hr className="section-divider" />
          <div className="form-check" style={{ marginBottom: '0.75rem' }}>
            <input type="checkbox" id="pmf" checked={isPrivatelyMade} onChange={e => setIsPrivatelyMade(e.target.checked)} />
            <label className="form-check-label" htmlFor="pmf">This is a privately made firearm</label>
          </div>

          {isPrivatelyMade && (
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Means and Manner of Production <span className="required-mark">*</span></label>
                <select className="form-control" value={meansOfProduction} onChange={e => setMeansOfProduction(e.target.value)}>
                  <option value="">-- Select --</option>
                  {MEANS_OF_PRODUCTION.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              {meansOfProduction === 'Other' && (
                <div className="form-group">
                  <label className="form-label">Describe <span className="required-mark">*</span></label>
                  <input type="text" className="form-control" value={meansOther} onChange={e => setMeansOther(e.target.value)} />
                </div>
              )}
            </div>
          )}

          <div className="btn-group">
            <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
            <button className="btn btn-primary" disabled={!firearmType || !firearmMake} onClick={() => setStep(4)}>Review Request →</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="card">
          <div className="card-title">Step 4: Review Request</div>
          <div className="form-row-2">
            <div>
              <strong>Requester:</strong> {firstName} {lastName}<br />
              <strong>Type:</strong> {requesterType === 'licensed' ? `Licensed — ${licenseType || licenseNo}` : 'Non-Licensed'}<br />
            </div>
            <div>
              <strong>Firearm Type:</strong> {firearmType}<br />
              <strong>Make / Model:</strong> {firearmMake} {firearmModel}<br />
              {!hideBarrelCaliber && <><strong>Caliber:</strong> {firearmCaliber} | <strong>Barrel:</strong> {firearmBarrel}"<br /></>}
              {isPrivatelyMade && <><strong>Privately Made:</strong> {meansOfProduction}<br /></>}
            </div>
          </div>
          <div className="attest-box">
            <strong>By submitting this request, I acknowledge that:</strong>
            <ul style={{ marginTop: '0.5rem', marginLeft: '1.25rem', fontSize: '0.875rem' }}>
              <li>The serial number I receive is non-transferable and may only be applied to the specific firearm described in this request.</li>
              <li>Once issued, this serial number cannot be retracted.</li>
              <li>If I no longer need the serial number, I must mark it as unused via my results inbox.</li>
            </ul>
          </div>
          <div className="btn-group">
            <button className="btn btn-secondary" onClick={() => setStep(3)}>← Back</button>
            <button className="btn btn-primary" onClick={submitRequest}>Submit Request</button>
          </div>
        </div>
      )}
    </div>
  );
}
