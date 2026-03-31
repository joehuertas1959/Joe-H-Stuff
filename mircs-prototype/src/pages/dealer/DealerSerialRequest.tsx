// REQ-0043–0049, REQ-0051, REQ-0052
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FIREARM_TYPES, FIREARM_MAKES, SERIALIZATION_SCHEMA, MEANS_OF_PRODUCTION } from '../../types';

interface SerialRequest {
  type: string; make: string; model: string; caliber: string; barrelLength: string;
  isPrivatelyMade: boolean; meansOfProduction: string; meansOther: string;
}

const NO_BARREL_CALIBER_TYPES = ['Stun Gun', 'Frame', 'Receiver'];

export default function DealerSerialRequest() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<SerialRequest[]>([createBlank()]);
  const [submitted, setSubmitted] = useState(false);
  const [issuedSerials, setIssuedSerials] = useState<string[]>([]);

  function createBlank(): SerialRequest {
    return { type: '', make: '', model: '', caliber: '', barrelLength: '', isPrivatelyMade: false, meansOfProduction: '', meansOther: '' };
  }

  function updateRequest(i: number, field: keyof SerialRequest, value: string | boolean) {
    setRequests(prev => prev.map((r, j) => j === i ? { ...r, [field]: value } : r));
  }

  function generateSerial(type: string): string {
    const prefix = SERIALIZATION_SCHEMA[type] || 'MAFRB-';
    return prefix + 'D' + String(Math.floor(Math.random() * 900000000 + 100000000));
  }

  function submitRequests() {
    setIssuedSerials(requests.map(r => generateSerial(r.type)));
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div>
        <button className="back-nav" onClick={() => navigate('/dealer')}>← Back to MIRCS Dealer</button>
        <div className="card">
          <div className="card-title" style={{ color: '#388557' }}>✅ Serial Numbers Issued</div>
          <div className="alert alert-warning"><strong>⚠️ Timing Notice:</strong> Serial numbers must be applied to the firearm at the time of manufacture or assembly per 501 CMR regulations.</div>
          <div className="alert alert-danger"><strong>⛔ Non-Transferable:</strong> Serial numbers assigned by DCJIS are non-transferable. Transfer to any other firearm is expressly prohibited.</div>
          {requests.map((r, i) => (
            <div key={i} style={{ marginBottom: '1.25rem', padding: '1rem', background: '#edf7f1', border: '1px solid #388557', borderRadius: 4 }}>
              <div className="serial-number-display" style={{ marginBottom: '0.75rem' }}>{issuedSerials[i]}</div>
              <div style={{ fontSize: '0.875rem' }}>
                <strong>Type:</strong> {r.type} &nbsp;|&nbsp; <strong>Make:</strong> {r.make} &nbsp;|&nbsp; <strong>Model:</strong> {r.model}<br />
                <strong>Date Issued:</strong> {new Date().toLocaleDateString()}
              </div>
              <div className="alert alert-info" style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}>Retain this document for your records. DCJIS will not mail a physical copy.</div>
              <button className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem' }}>Mark as Unused</button>
            </div>
          ))}
          <div className="btn-group">
            <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print Serial Number Document(s)</button>
            <button className="btn btn-secondary" onClick={() => { setSubmitted(false); setRequests([createBlank()]); }}>New Request</button>
            <button className="btn btn-secondary" onClick={() => navigate('/dealer')}>Return to Dealer</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="back-nav" onClick={() => navigate('/dealer')}>← Back to MIRCS Dealer</button>
      <h1 style={{ color: '#0d3f6b' }}>Request Serial Number(s)</h1>
      <div className="alert alert-info">
        <strong>ℹ️ Dealer Serial Number Request:</strong> As a licensed dealer, you may request up to <strong>5 serial numbers simultaneously</strong>. Format: <code style={{ fontFamily: 'monospace' }}>MAFRB-[TYPE]D[9 digits]</code>
      </div>
      <div className="card" style={{ background: '#f0f4f8' }}>
        <div className="card-title">Dealer Information (Pre-filled)</div>
        <div className="form-row-3">
          <div><strong>Name:</strong> Boston Arms LLC</div>
          <div><strong>Address:</strong> 500 Commonwealth Ave, Boston MA</div>
          <div><strong>Phone:</strong> (617) 555-0100</div>
          <div><strong>License No.:</strong> DLR-MA-00412</div>
          <div><strong>License Expires:</strong> 2027-12-31</div>
        </div>
      </div>
      {requests.map((r, i) => {
        const hideBarrelCaliber = NO_BARREL_CALIBER_TYPES.includes(r.type);
        return (
          <div key={i} className="card">
            <div className="firearm-entry-header">
              <h3>Request {i + 1}</h3>
              {requests.length > 1 && <button className="btn btn-danger btn-sm" onClick={() => setRequests(prev => prev.filter((_, j) => j !== i))}>Remove</button>}
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Firearm Type <span className="required-mark">*</span></label>
                <select className="form-control" value={r.type} onChange={e => updateRequest(i, 'type', e.target.value)}>
                  <option value="">-- Select Type --</option>
                  {FIREARM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {r.type && <p className="form-hint" style={{ fontFamily: 'monospace' }}>Schema: {SERIALIZATION_SCHEMA[r.type] || 'MAFRB-'}D#########</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Make <span className="required-mark">*</span></label>
                <select className="form-control" value={r.make} onChange={e => updateRequest(i, 'make', e.target.value)}>
                  <option value="">-- Select Make --</option>
                  {FIREARM_MAKES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Model <span className="required-mark">*</span></label>
                <input type="text" className="form-control" value={r.model} onChange={e => updateRequest(i, 'model', e.target.value)} />
              </div>
            </div>
            {!hideBarrelCaliber && (
              <div className="form-row-2">
                <div className="form-group"><label className="form-label">Caliber <span className="required-mark">*</span></label><input type="text" className="form-control" value={r.caliber} onChange={e => updateRequest(i, 'caliber', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Barrel Length <span className="required-mark">*</span></label><input type="text" className="form-control" value={r.barrelLength} onChange={e => updateRequest(i, 'barrelLength', e.target.value)} /></div>
              </div>
            )}
            <div className="form-check">
              <input type="checkbox" id={`pmf-${i}`} checked={r.isPrivatelyMade} onChange={e => updateRequest(i, 'isPrivatelyMade', e.target.checked)} />
              <label className="form-check-label" htmlFor={`pmf-${i}`}>This is a privately made firearm</label>
            </div>
            {r.isPrivatelyMade && (
              <div className="form-row-2" style={{ marginTop: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Means and Manner of Production <span className="required-mark">*</span></label>
                  <select className="form-control" value={r.meansOfProduction} onChange={e => updateRequest(i, 'meansOfProduction', e.target.value)}>
                    <option value="">-- Select --</option>
                    {MEANS_OF_PRODUCTION.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {requests.length < 5 && <button className="btn btn-secondary" onClick={() => setRequests(prev => [...prev, createBlank()])}>+ Add Another Request ({requests.length}/5)</button>}
      <div className="btn-group">
        <button className="btn btn-secondary" onClick={() => navigate('/dealer')}>Cancel</button>
        <button className="btn btn-primary" disabled={requests.some(r => !r.type || !r.make)} onClick={submitRequests}>Submit Serial Number Request(s)</button>
      </div>
    </div>
  );
}
