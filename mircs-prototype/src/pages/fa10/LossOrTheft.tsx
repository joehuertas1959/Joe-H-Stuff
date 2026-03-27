// RFP-HPD-1954933: Report Loss or Theft — HRS §134-13
// REQ-0059: Notify Licensing Authorities of Loss or Theft
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FirearmEntry from '../../components/FirearmEntry';
import type { Firearm } from '../../types';

const US_STATES = ['HI', 'CA', 'WA', 'OR', 'AK', 'AZ', 'NV', 'Other'];

export default function LossOrTheft() {
  const navigate = useNavigate();
  const [lossCity, setLossCity] = useState('');
  const [lossState, setLossState] = useState('HI');
  const [lossDate, setLossDate] = useState('');
  const [circumstance, setCircumstance] = useState('');
  const [policeReport, setPoliceReport] = useState('');
  const [firearms, setFirearms] = useState<Partial<Firearm>[]>([{}]);
  const [submitted, setSubmitted] = useState(false);

  function updateFirearm(index: number, field: keyof Firearm, value: string | boolean) {
    setFirearms(prev => prev.map((f, i) => i === index ? { ...f, [field]: value } : f));
  }

  if (submitted) {
    return (
      <div>
        <button className="back-nav" onClick={() => navigate('/pta')}>← Back to PTA Portal</button>
        <div className="card confirmation-page">
          <div className="confirmation-icon">🚨</div>
          <h2 style={{ color: '#DC2626' }}>Loss/Theft Successfully Reported</h2>
          <p style={{ color: '#5A7490', marginBottom: '1rem' }}>
            Your report has been submitted to the HPD Firearms Unit and all Hawaii county police departments.
          </p>
          <div className="confirmation-ticket">
            <strong>Report No.:</strong> LT-{new Date().getFullYear()}-{Math.floor(Math.random() * 900000 + 100000)}<br />
            <strong>Date of Loss/Theft:</strong> {lossDate}<br />
            <strong>Location:</strong> {lossCity}, {lossState}<br />
            <strong>Firearms Reported:</strong> {firearms.length}<br />
            {policeReport && <><strong>HPD Report No.:</strong> {policeReport}<br /></>}
          </div>
          <div className="alert" style={{ background: '#E8F5E9', border: '1px solid #4CAF50', borderRadius: 4, color: '#1B4332', maxWidth: 460, margin: '1rem auto', textAlign: 'left', padding: '0.85rem 1rem' }}>
            <strong>Next Steps:</strong>
            <ul style={{ marginTop: '0.5rem', marginLeft: '1.25rem', fontSize: '0.875rem', lineHeight: 1.7 }}>
              <li>HPD Firearms Unit and all county PDs have been automatically notified.</li>
              <li>The firearm(s) have been flagged in the Hawaii Hot Files system.</li>
              <li>If you haven't already, file a police report with your local HPD district.</li>
              <li>You may be contacted for additional information.</li>
            </ul>
          </div>
          <div className="btn-group" style={{ justifyContent: 'center' }}>
            <button className="btn btn-gold" onClick={() => window.print()}>🖨️ Print Report</button>
            <button className="btn btn-secondary" onClick={() => navigate('/pta')}>Return to PTA Portal</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="back-nav" onClick={() => navigate('/pta')}>← Back to PTA Portal</button>
      <h1 style={{ color: '#1B2A4A' }}>Report Loss or Theft (HRS §134-13)</h1>

      <div className="alert alert-gold">
        <strong>Required by Hawaii Law (HRS §134-13):</strong> All lost or stolen firearms must be
        reported to HPD immediately. Upon submission, the HPD Firearms Unit and all Hawaii county
        police departments will be automatically notified via the statewide hot files system.
      </div>

      <div className="card">
        <div className="card-title">Loss/Theft Details</div>
        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">Date of Loss/Theft <span className="required-mark">*</span></label>
            <input type="date" className="form-control" value={lossDate} onChange={e => setLossDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">State <span className="required-mark">*</span></label>
            <select className="form-control" value={lossState} onChange={e => setLossState(e.target.value)}>
              {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">
              City / Location <span className="required-mark">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={lossCity}
              onChange={e => setLossCity(e.target.value)}
              placeholder={lossState === 'HI' ? 'e.g. Honolulu, Kailua, Pearl City' : 'Enter city'}
            />
          </div>
          <div className="form-group">
            <label className="form-label">HPD Police Report No. (if filed)</label>
            <input type="text" className="form-control" value={policeReport} onChange={e => setPoliceReport(e.target.value)} placeholder="e.g. HPD-2025-XXXXXXX" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Circumstances / Description</label>
          <textarea
            className="form-control"
            rows={3}
            value={circumstance}
            onChange={e => setCircumstance(e.target.value)}
            placeholder="Describe how the firearm was lost or stolen..."
          />
        </div>
      </div>

      <div className="card">
        <div className="card-title">Firearm Information</div>
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
        <button className="btn btn-secondary btn-sm" onClick={() => setFirearms(prev => [...prev, {}])}>
          + Add Another Firearm
        </button>
      </div>

      <div className="btn-group">
        <button className="btn btn-secondary" onClick={() => navigate('/pta')}>Cancel</button>
        <button className="btn btn-danger" disabled={!lossDate || !lossCity} onClick={() => setSubmitted(true)}>
          Submit Loss/Theft Report
        </button>
      </div>
    </div>
  );
}
