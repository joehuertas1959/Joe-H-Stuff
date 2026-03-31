// REQ-0014 / REQ-0016, REQ-0059
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FirearmEntry from '../../components/FirearmEntry';
import type { Firearm } from '../../types';

const US_STATES = ['MA', 'CT', 'RI', 'NH', 'VT', 'ME', 'NY', 'NJ', 'PA', 'Other'];

export default function LossOrTheft() {
  const navigate = useNavigate();
  const [lossCity, setLossCity] = useState('');
  const [lossState, setLossState] = useState('MA');
  const [lossDate, setLossDate] = useState('');
  const [circumstance, setCircumstance] = useState('');
  const [firearms, setFirearms] = useState<Partial<Firearm>[]>([{}]);
  const [submitted, setSubmitted] = useState(false);

  function updateFirearm(index: number, field: keyof Firearm, value: string | boolean) {
    setFirearms(prev => prev.map((f, i) => i === index ? { ...f, [field]: value } : f));
  }

  if (submitted) {
    return (
      <div>
        <button className="back-nav" onClick={() => navigate('/fa10')}>← Back to FA-10</button>
        <div className="card confirmation-page">
          <div className="confirmation-icon">🚨</div>
          <h2 style={{ color: '#cd0000' }}>Loss/Theft Successfully Reported</h2>
          <p style={{ color: '#616161', marginBottom: '1rem' }}>Your report has been submitted and your licensing authority has been notified.</p>
          <div className="confirmation-ticket">
            <strong>Report No.:</strong> LT-2026-{Math.floor(Math.random() * 900000 + 100000)}<br />
            <strong>Date of Loss/Theft:</strong> {lossDate}<br />
            <strong>Location:</strong> {lossCity}, {lossState}<br />
            <strong>Firearms Reported:</strong> {firearms.length}
          </div>
          <div className="alert alert-info" style={{ maxWidth: 500, margin: '1rem auto', textAlign: 'left' }}>
            <strong>ℹ️ Next Steps:</strong> Your licensing authority and DCJIS have been automatically notified. You may be contacted for additional information. Please also file a police report if you have not already done so.
          </div>
          <div className="btn-group" style={{ justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print Report</button>
            <button className="btn btn-secondary" onClick={() => navigate('/fa10')}>Return to FA-10</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="back-nav" onClick={() => navigate('/fa10')}>← Back to FA-10</button>
      <h1 style={{ color: '#0d3f6b' }}>Report Loss or Theft</h1>
      <div className="alert alert-warning">
        <strong>⚠️ Required:</strong> Massachusetts law requires all lost or stolen firearms to be reported electronically. Upon submission, your licensing authority will be automatically notified per M.G.L. c.140 §121B(c).
      </div>
      <div className="card">
        <div className="card-title">Loss/Theft Details</div>
        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">Date of Loss/Theft <span className="required-mark">*</span></label>
            <input type="date" className="form-control" value={lossDate} onChange={e => setLossDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">State of Loss/Theft <span className="required-mark">*</span></label>
            <select className="form-control" value={lossState} onChange={e => setLossState(e.target.value)}>
              {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{lossState !== 'MA' ? 'City/Town (Out of State)' : 'City/Town'} <span className="required-mark">*</span></label>
            <input type="text" className="form-control" value={lossCity} onChange={e => setLossCity(e.target.value)} placeholder={lossState !== 'MA' ? 'Enter out-of-state city' : 'Enter city/town'} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Circumstances / Description</label>
          <textarea className="form-control" rows={3} value={circumstance} onChange={e => setCircumstance(e.target.value)} placeholder="Describe how the firearm was lost or stolen..." />
        </div>
      </div>
      <div className="card">
        <div className="card-title">Firearm Information</div>
        {firearms.map((fa, i) => (
          <FirearmEntry key={i} firearm={fa} index={i} onChange={updateFirearm}
            onRemove={(idx) => setFirearms(prev => prev.filter((_, j) => j !== idx))}
            showRemove={firearms.length > 1} />
        ))}
        <button className="btn btn-secondary btn-sm" onClick={() => setFirearms(prev => [...prev, {}])}>+ Add Another Firearm</button>
      </div>
      <div className="btn-group">
        <button className="btn btn-secondary" onClick={() => navigate('/fa10')}>Cancel</button>
        <button className="btn btn-danger" disabled={!lossDate || !lossCity} onClick={() => setSubmitted(true)}>Submit Loss/Theft Report</button>
      </div>
    </div>
  );
}
