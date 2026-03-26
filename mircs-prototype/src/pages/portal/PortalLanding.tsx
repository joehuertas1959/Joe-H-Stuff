// REQ-0060: Move Firearms Services URL to top
// REQ-0062: Move Available Services language inside portal (post-login)
// REQ-0063: Remove License Rules
// REQ-0065: On-Screen PIN Retrieval
// REQ-0177: Expiration notification
import { useNavigate } from 'react-router-dom';

const MOCK_LICENSES = [
  { type: 'License to Carry Firearms (LTC)', number: 'LTC-12345', status: 'Active', expires: '2027-08-15', issuedBy: 'Boston PD' },
];

export default function PortalLanding() {
  const navigate = useNavigate();

  return (
    <div>
      <button className="back-nav" onClick={() => navigate('/')}>← Back to Unified Portal</button>

      {/* REQ-0060: Firearms Services link at top */}
      <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
        <strong>ℹ️ Resources:</strong> Please visit{' '}
        <a href="#">mass.gov/firearms-services</a> for additional information about Massachusetts firearms laws and requirements.
      </div>

      <h1 style={{ color: '#0d3f6b' }}>MIRCS Firearms Licensing Portal</h1>

      {/* REQ-0177: Expiration notification */}
      <div className="alert alert-warning">
        <strong>⚠️ License Expiration Notice:</strong> Your License to Carry Firearms (LTC-12345) will
        expire on <strong>August 15, 2027</strong>. We encourage you to start your renewal application as
        soon as possible. <a href="#">Start Renewal →</a>
        <br /><br />
        <em>Grace Period: If you apply for renewal before your expiration date, your current license
        remains active until a decision is rendered (LTC and FID only).</em>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem' }}>
        <div>
          <div className="card">
            <div className="card-title">Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="btn btn-primary" onClick={() => navigate('/portal/apply')}>📝 New License Application</button>
              <button className="btn btn-secondary" onClick={() => navigate('/portal/apply')}>🔄 Renewal Application</button>
              <button className="btn btn-secondary">🔑 Retrieve PIN</button>
              <button className="btn btn-secondary">📬 Change Address</button>
              <button className="btn btn-secondary">👤 Change Name</button>
              <button className="btn btn-secondary">📁 Upload Documents</button>
            </div>
          </div>
        </div>

        <div>
          {/* REQ-0062: Available Services shown post-login */}
          <div className="card">
            <div className="card-title">My Licenses</div>
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>License Type</th><th>Number</th><th>Status</th><th>Expires</th><th>Issued By</th></tr>
                </thead>
                <tbody>
                  {MOCK_LICENSES.map(lic => (
                    <tr key={lic.number}>
                      <td>{lic.type}</td>
                      <td>{lic.number}</td>
                      <td><span className="badge badge-active">{lic.status}</span></td>
                      <td>{lic.expires}</td>
                      <td>{lic.issuedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-title">My Applications</div>
            <div className="table-container">
              <table>
                <thead><tr><th>App No.</th><th>Type</th><th>Status</th><th>Submitted</th></tr></thead>
                <tbody>
                  <tr>
                    <td><a href="#">APP-2025-100001</a></td>
                    <td>Renewal — LTC</td>
                    <td><span className="badge badge-pending">Under Review</span></td>
                    <td>2025-03-01</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* REQ-0065: On-screen PIN retrieval */}
          <div className="card">
            <div className="card-title">Retrieve Your PIN</div>
            <p style={{ fontSize: '0.875rem', color: '#616161', marginBottom: '0.75rem' }}>
              Your PIN is required to complete firearms transactions. For mobile accessibility,
              your PIN letter is available as a downloadable PDF below.
            </p>
            <button className="btn btn-secondary btn-sm">📄 View PIN Letter (PDF)</button>
          </div>
        </div>
      </div>
    </div>
  );
}
