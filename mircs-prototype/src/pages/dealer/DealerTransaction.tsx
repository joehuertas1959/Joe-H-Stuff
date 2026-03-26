// REQ-0024: Update "Type of Gun to be Purchased" Dropdown
// REQ-0025: Allow User to Enter Multiple Weapons (Dealer)
// REQ-0028: Confirm Physical License Documentation (checkbox)
// REQ-0031: License/Card/Permit Status Updates
// REQ-0036: Transaction Type Dropdown (Sale, Rental, Lease, Loan)
// REQ-0039: Support Dealer to Dealer Transactions
// REQ-0041: Add Dealer's Address to FA10 Form
// REQ-0184: Semi-Automatic Checkbox (FID restriction)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FirearmEntry, { REQUIRES_SEMI_AUTO } from '../../components/FirearmEntry';
import type { Firearm } from '../../types';

const MOCK_CUSTOMERS: Record<string, { name: string; licenseType: string; status: 'active' | 'expired' | 'suspended' | 'revoked'; expiry: string }> = {
  'LTC-12345': { name: 'John A. Smith', licenseType: 'License to Carry Firearms (LTC)', status: 'active', expiry: '2027-08-15' },
  'FID-88888': { name: 'Alice M. Brown', licenseType: 'Firearms Identification Card (FID)', status: 'active', expiry: '2028-01-20' },
  'FID-99999': { name: 'Mark T. Davis', licenseType: 'Firearms Identification Card (FID)', status: 'expired', expiry: '2024-03-01' },
  'LTC-SUSPEND': { name: 'Robert C. Jones', licenseType: 'License to Carry Firearms (LTC)', status: 'suspended', expiry: '2026-05-20' },
  'DLR-MA-00777': { name: 'Springfield Armory MA', licenseType: 'License to Sell/Rent/Lease Firearms and Ammunition', status: 'active', expiry: '2026-11-30' },
};

export default function DealerTransaction() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [licenseNo, setLicenseNo] = useState('');
  const [customer, setCustomer] = useState<typeof MOCK_CUSTOMERS[string] | null>(null);
  const [licenseAlert, setLicenseAlert] = useState('');
  const [physicalConfirmed, setPhysicalConfirmed] = useState(false); // REQ-0028
  const [transactionType, setTransactionType] = useState('Sale'); // REQ-0036

  // REQ-0039: Dealer-to-dealer
  const [isDealerToDealer, setIsDealerToDealer] = useState(false);
  const [isOutOfStateTransfer, setIsOutOfStateTransfer] = useState(false);
  const [fflNumber, setFflNumber] = useState('');

  // REQ-0182: Loan/Lease return
  const [firearmsReturned, setFirearmsReturned] = useState(false);
  const [returnDate, setReturnDate] = useState('');

  const [firearms, setFirearms] = useState<Partial<Firearm>[]>([{}]);
  const [semiAutoFlags, setSemiAutoFlags] = useState<boolean[]>([false]); // REQ-0184
  const [permitToPurchase, setPermitToPurchase] = useState(false); // REQ-0192
  const [permitNo, setPermitNo] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isFID = customer?.licenseType?.includes('FID') && !customer.licenseType.includes('Restricted');
  const ticketNo = 'DLR-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 900000 + 100000);

  function lookupLicense() {
    const c = MOCK_CUSTOMERS[licenseNo.toUpperCase()];
    if (!c) { setCustomer(null); setLicenseAlert('License not found. Verify and try again.'); return; }
    setCustomer(c);
    if (c.status !== 'active') {
      setLicenseAlert(
        `TRANSACTION BLOCKED: This license is ${c.status.toUpperCase()}. ` +
        `Per M.G.L. c.140 §123(g), you cannot proceed with this sale. Please inform the customer and contact your licensing authority.`
      );
    } else {
      setLicenseAlert('');
    }
  }

  function updateFirearm(index: number, field: keyof Firearm, value: string | boolean) {
    setFirearms(prev => prev.map((f, i) => i === index ? { ...f, [field]: value } : f));
  }

  function toggleSemiAuto(index: number, val: boolean) {
    setSemiAutoFlags(prev => prev.map((v, i) => i === index ? val : v));
  }

  const statusBadge = (s: string) => {
    const cls: Record<string, string> = { active: 'badge-active', expired: 'badge-expired', suspended: 'badge-suspended', revoked: 'badge-revoked' };
    return <span className={`badge ${cls[s] || 'badge-pending'}`}>{s}</span>;
  };

  if (submitted) {
    return (
      <div>
        <button className="back-nav" onClick={() => navigate('/dealer')}>← Back to MIRCS Dealer</button>
        <div className="card confirmation-page">
          <div className="confirmation-icon">✅</div>
          <h2 style={{ color: '#388557' }}>Transaction Completed</h2>
          {firearms.map((f, i) => (
            <div key={i} className="confirmation-ticket">
              <strong>Ticket No.:</strong> {ticketNo}-{i + 1}<br />
              <strong>Customer:</strong> {customer?.name}<br />
              <strong>Type:</strong> {transactionType}<br />
              <strong>Firearm:</strong> {f.type} — {f.make} {f.model}<br />
              <strong>Serial #:</strong> {f.serialNumber}<br />
              <strong>Dealer:</strong> Boston Arms LLC, 500 Commonwealth Ave, Boston MA 02215
            </div>
          ))}
          <div className="btn-group" style={{ justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print FA-10</button>
            <button className="btn btn-secondary" onClick={() => navigate('/dealer')}>New Transaction</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="back-nav" onClick={() => navigate('/dealer')}>← Back to MIRCS Dealer</button>
      <h1 style={{ color: '#0d3f6b' }}>Start New Transaction</h1>

      <div className="steps">
        {['Lookup Customer', 'Firearm(s)', 'Review & Submit'].map((s, i) => (
          <div key={s} className={`step ${step === i + 1 ? 'active' : step > i + 1 ? 'completed' : ''}`}>
            <span className="step-number">{step > i + 1 ? '✓' : i + 1}</span>{s}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="card">
          <div className="card-title">Step 1: Lookup License Holder</div>

          {/* REQ-0036: Transaction Type */}
          <div className="form-row-2" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Transaction Type <span className="required-mark">*</span></label>
              <select className="form-control" value={transactionType} onChange={e => setTransactionType(e.target.value)}>
                <option value="Sale">Sale</option>
                <option value="Rental">Rental</option>
                <option value="Lease">Lease</option>
                <option value="Loan">Loan</option>
              </select>
            </div>
          </div>

          {/* REQ-0039: Dealer-to-Dealer */}
          <div className="form-check" style={{ marginBottom: '0.75rem' }}>
            <input type="checkbox" id="d2d" checked={isDealerToDealer} onChange={e => setIsDealerToDealer(e.target.checked)} />
            <label className="form-check-label" htmlFor="d2d">This is a dealer-to-dealer transfer</label>
          </div>

          {isDealerToDealer && (
            <div className="form-check" style={{ marginBottom: '1rem', marginLeft: '1.5rem' }}>
              <input type="checkbox" id="oos" checked={isOutOfStateTransfer} onChange={e => setIsOutOfStateTransfer(e.target.checked)} />
              <label className="form-check-label" htmlFor="oos">Transfer to out-of-state dealer (FFL required)</label>
            </div>
          )}

          {isDealerToDealer && isOutOfStateTransfer && (
            <div className="form-group" style={{ marginLeft: '1.5rem' }}>
              <label className="form-label">FFL Number <span className="required-mark">*</span></label>
              <input type="text" className="form-control" value={fflNumber} onChange={e => setFflNumber(e.target.value)} placeholder="Enter FFL number" style={{ maxWidth: 300 }} />
              <p className="form-hint">State firearms license not required for out-of-state dealer transfers.</p>
            </div>
          )}

          {/* REQ-0182: Loan/Lease return */}
          {(transactionType === 'Loan' || transactionType === 'Lease') && (
            <div className="alert alert-info">
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

          <hr className="section-divider" />

          {!isOutOfStateTransfer && (
            <>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label className="form-label">
                    {isDealerToDealer ? 'Dealer License No.' : 'Customer License No.'} <span className="required-mark">*</span>
                  </label>
                  <input type="text" className="form-control" placeholder={isDealerToDealer ? 'e.g. DLR-MA-00777' : 'e.g. LTC-12345, FID-88888'} value={licenseNo} onChange={e => setLicenseNo(e.target.value)} />
                </div>
                {!isDealerToDealer && (
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">PIN</label>
                    <input type="password" className="form-control" placeholder="PIN" style={{ width: 120 }} />
                  </div>
                )}
                <button className="btn btn-secondary" onClick={lookupLicense} type="button">Look Up</button>
              </div>

              {licenseAlert && (
                <div className="alert alert-danger">
                  <strong>⛔ {licenseAlert}</strong>
                </div>
              )}

              {customer && !licenseAlert && (
                <div className="alert alert-success">
                  <div className="license-valid valid" style={{ marginBottom: '0.5rem' }}>
                    ✅ License Valid {statusBadge(customer.status)}
                  </div>
                  <strong>{customer.name}</strong><br />
                  License Type: {customer.licenseType}<br />
                  Expires: {customer.expiry}
                </div>
              )}

              {/* REQ-0028: Confirm Physical License */}
              {customer && !licenseAlert && (
                <div className="attest-box">
                  <div className="form-check">
                    <input type="checkbox" id="physical" checked={physicalConfirmed} onChange={e => setPhysicalConfirmed(e.target.checked)} />
                    <label className="form-check-label" htmlFor="physical">
                      <strong>I confirm that I have verified the buyer's physical license documentation in person</strong>
                      {' '}per M.G.L. c.140 §123(f) &amp; (k).
                    </label>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="btn-group">
            <button className="btn btn-secondary" onClick={() => navigate('/dealer')}>Cancel</button>
            <button
              className="btn btn-primary"
              disabled={!isOutOfStateTransfer && (!customer || !!licenseAlert || !physicalConfirmed)}
              onClick={() => setStep(2)}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <div className="card-title">Step 2: Firearm Information</div>
          <p style={{ color: '#616161', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Enter details for each firearm. Multiple firearms can be added — each generates a separate FA-10.
          </p>

          {firearms.map((fa, i) => (
            <div key={i}>
              <FirearmEntry
                firearm={fa} index={i} onChange={updateFirearm}
                onRemove={(idx) => {
                  setFirearms(prev => prev.filter((_, j) => j !== idx));
                  setSemiAutoFlags(prev => prev.filter((_, j) => j !== idx));
                }}
                showRemove={firearms.length > 1}
              />

              {/* REQ-0184: Semi-Auto checkbox — for FID cardholders cannot purchase semi-auto */}
              {REQUIRES_SEMI_AUTO.includes(fa.type || '') && (
                <div style={{ marginTop: '-0.5rem', marginBottom: '1rem', padding: '0 1rem' }}>
                  <div className="form-check">
                    <input type="checkbox" id={`semi-${i}`} checked={semiAutoFlags[i] || false}
                      onChange={e => toggleSemiAuto(i, e.target.checked)} />
                    <label className="form-check-label" htmlFor={`semi-${i}`}>This firearm is Semi-Automatic</label>
                  </div>
                  {semiAutoFlags[i] && isFID && (
                    <div className="alert alert-danger" style={{ marginTop: '0.5rem' }}>
                      <strong>⛔ Sale Restricted:</strong> FID cardholders cannot purchase or transfer
                      semi-automatic firearms. This sale cannot proceed per M.G.L. c.140 §129B.
                    </div>
                  )}
                </div>
              )}

              {/* REQ-0192: Permit to Purchase — for FID buying handgun */}
              {fa.type === 'Handgun' && isFID && (
                <div style={{ marginTop: '-0.5rem', marginBottom: '1rem', padding: '0 1rem' }}>
                  <div className="form-check">
                    <input type="checkbox" id={`ptp-${i}`} checked={permitToPurchase} onChange={e => setPermitToPurchase(e.target.checked)} />
                    <label className="form-check-label" htmlFor={`ptp-${i}`}>Licensee has a Permit to Purchase (FID + Handgun)</label>
                  </div>
                  {permitToPurchase && (
                    <div className="form-group" style={{ marginTop: '0.5rem', maxWidth: 300 }}>
                      <label className="form-label">Permit to Purchase No. <span className="required-mark">*</span></label>
                      <input type="text" className="form-control" value={permitNo} onChange={e => setPermitNo(e.target.value)} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <button className="btn btn-secondary btn-sm" onClick={() => { setFirearms(prev => [...prev, {}]); setSemiAutoFlags(prev => [...prev, false]); }}>
            + Add Another Firearm
          </button>

          <div className="btn-group">
            <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" onClick={() => setStep(3)}>Review Transaction →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <div className="card-title">Step 3: Review &amp; Submit</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <strong>Customer:</strong> {customer?.name || 'Out-of-State Dealer'}<br />
              <strong>License:</strong> {licenseNo}<br />
              <strong>Transaction Type:</strong> {transactionType}<br />
              {isOutOfStateTransfer && <><strong>FFL:</strong> {fflNumber}<br /></>}
            </div>
            <div>
              <strong>Dealer:</strong> Boston Arms LLC<br />
              {/* REQ-0041: Dealer's address on FA10 */}
              <strong>Dealer Address:</strong> 500 Commonwealth Ave, Boston MA 02215<br />
              <strong>Firearms:</strong> {firearms.length}
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>#</th><th>Type</th><th>Make</th><th>Model</th><th>Serial #</th><th>Semi-Auto</th></tr></thead>
              <tbody>
                {firearms.map((f, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{f.type}</td>
                    <td>{f.make}</td>
                    <td>{f.model}</td>
                    <td>{f.serialNumber}</td>
                    <td>{semiAutoFlags[i] ? '⚠️ Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="btn-group">
            <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
            <button className="btn btn-success" onClick={() => setSubmitted(true)}>Complete Transaction ✓</button>
          </div>
        </div>
      )}
    </div>
  );
}
