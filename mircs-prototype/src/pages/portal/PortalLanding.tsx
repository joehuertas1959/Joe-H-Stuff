// REQ-0060: Move Firearms Services URL to top
// REQ-0062: Move Available Services language inside portal (post-login)
// REQ-0063: Remove License Rules
// REQ-0065: On-Screen PIN Retrieval
// REQ-0177: Expiration notification
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLicenses } from '../../api/client';

interface License {
  id: string;
  licenseNumber: string;
  type: string;
  status: string;
  expiresAt: string | null;
  approvedAt: string | null;
  person: {
    firstName: string;
    lastName: string;
    city: string;
  };
}

function formatLicenseType(type: string): string {
  if (type === 'LTC_CONCEALED') return 'License to Carry (Concealed)';
  if (type === 'LTC_OPEN') return 'License to Carry (Open)';
  return type.replace(/_/g, ' ');
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    active: 'badge-active',
    pending: 'badge-pending',
    expired: 'badge-expired',
    suspended: 'badge-suspended',
    revoked: 'badge-denied',
  };
  const cls = map[status] ?? 'badge-pending';
  return <span className={`badge ${cls}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}

export default function PortalLanding() {
  const navigate = useNavigate();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLicenses()
      .then((data: any) => setLicenses(data as License[]))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Find soonest-expiring active license for the warning banner
  const soonExpiring = licenses
    .filter(l => l.status === 'active' && l.expiresAt)
    .sort((a, b) => new Date(a.expiresAt!).getTime() - new Date(b.expiresAt!).getTime())[0];

  const pendingApplications = licenses.filter(l => l.status === 'pending');

  return (
    <div>
      <button className="back-nav" onClick={() => navigate('/')}>← Back to Unified Portal</button>

      {/* REQ-0060: Firearms Services link at top */}
      <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
        <strong>ℹ️ Resources:</strong> Please visit{' '}
        <a href="#">hawaii.gov/firearms-services</a> for additional information about Hawaii firearms laws and requirements.
      </div>

      <h1 style={{ color: '#0d3f6b' }}>MIRCS Firearms Licensing Portal</h1>

      {/* REQ-0177: Expiration notification — driven by live data */}
      {soonExpiring && (
        <div className="alert alert-warning">
          <strong>⚠️ License Expiration Notice:</strong> Your {formatLicenseType(soonExpiring.type)} ({soonExpiring.licenseNumber}) will
          expire on <strong>{new Date(soonExpiring.expiresAt!).toLocaleDateString()}</strong>. We encourage you to start your renewal application as
          soon as possible. <a href="#">Start Renewal →</a>
          <br /><br />
          <em>Grace Period: If you apply for renewal before your expiration date, your current license
          remains active until a decision is rendered (LTC only).</em>
        </div>
      )}

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

            {loading && (
              <p style={{ color: '#616161', fontSize: '0.875rem', padding: '0.5rem 0' }}>Loading licenses…</p>
            )}
            {error && (
              <div className="alert alert-danger" style={{ fontSize: '0.875rem' }}>
                Could not load licenses: {error}
              </div>
            )}
            {!loading && !error && (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>License Type</th>
                      <th>Number</th>
                      <th>Status</th>
                      <th>Expires</th>
                      <th>Holder</th>
                    </tr>
                  </thead>
                  <tbody>
                    {licenses.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: '#9e9e9e', padding: '1rem' }}>
                          No licenses on file.
                        </td>
                      </tr>
                    ) : (
                      licenses.map(lic => (
                        <tr key={lic.id}>
                          <td>{formatLicenseType(lic.type)}</td>
                          <td><strong>{lic.licenseNumber}</strong></td>
                          <td>{statusBadge(lic.status)}</td>
                          <td>{lic.expiresAt ? new Date(lic.expiresAt).toLocaleDateString() : '—'}</td>
                          <td>{lic.person.firstName} {lic.person.lastName}, {lic.person.city}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-title">My Applications</div>
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>License No.</th><th>Type</th><th>Status</th><th>Applied</th></tr>
                </thead>
                <tbody>
                  {pendingApplications.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: '#9e9e9e', padding: '1rem' }}>
                        No applications in progress.
                      </td>
                    </tr>
                  ) : (
                    pendingApplications.map(lic => (
                      <tr key={lic.id}>
                        <td><a href="#">{lic.licenseNumber}</a></td>
                        <td>{formatLicenseType(lic.type)}</td>
                        <td><span className="badge badge-pending">Pending Review</span></td>
                        <td>{lic.approvedAt ? new Date(lic.approvedAt).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))
                  )}
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
