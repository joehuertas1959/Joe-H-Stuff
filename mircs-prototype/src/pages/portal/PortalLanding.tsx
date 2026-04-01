// RFP-HPD-1954933: Licensing Portal — HPD Electronic Firearms Registry System
// REQ-0060, REQ-0062, REQ-0063, REQ-0065, REQ-0177
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLicenses } from '../../api/client';

export default function PortalLanding() {
  const navigate = useNavigate();
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getLicenses()
      .then(setLicenses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Any active license expiring within 90 days
  const expiringSoon = licenses.filter(l => {
    if (!l.expiresAt || l.status !== 'active') return false;
    return new Date(l.expiresAt).getTime() - Date.now() < 90 * 24 * 60 * 60 * 1000;
  });

  function licenseTypeLabel(type: string) {
    if (type === 'LTC_CONCEALED') return 'License to Carry — Concealed (LTC)';
    if (type === 'LTC_OPEN')      return 'License to Carry — Open Carry (LTC)';
    return type;
  }

  function statusBadge(status: string) {
    const map: Record<string, string> = {
      active:    'badge-active',
      pending:   'badge-pending',
      expired:   'badge-expired',
      suspended: 'badge-suspended',
      revoked:   'badge-revoked',
    };
    return map[status] ?? 'badge-pending';
  }

  return (
    <div>
      <button className="back-nav" onClick={() => navigate('/')}>← Back to Unified Portal</button>
      <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
        <strong>ℹ️ Resources:</strong> Please visit{' '}
        <a href="#">hawaii.gov/firearms</a> for additional information about Hawaii firearms laws and requirements.
      </div>
      <h1 style={{ color: '#0d3f6b' }}>HPD Firearms Licensing Portal</h1>

      {expiringSoon.length > 0 && (
        <div className="alert alert-warning">
          <strong>⚠️ License Expiration Notice:</strong>{' '}
          {expiringSoon.map(l => (
            <span key={l.id}>
              Your license <strong>{l.licenseNumber}</strong> expires on{' '}
              <strong>{new Date(l.expiresAt).toLocaleDateString()}</strong>.{' '}
            </span>
          ))}
          We encourage you to start your renewal application as soon as possible.{' '}
          <a href="#">Start Renewal →</a>
          <br /><br />
          <em>If you apply for renewal before expiration, your current license remains active until a decision is rendered.</em>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem' }}>
        <div>
          <div className="card">
            <div className="card-title">Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="btn btn-primary" onClick={() => navigate('/portal/apply')}>📝 New LTC Application</button>
              <button className="btn btn-secondary" onClick={() => navigate('/portal/apply')}>🔄 Renewal Application</button>
              <button className="btn btn-secondary">🔑 Retrieve PIN</button>
              <button className="btn btn-secondary">📬 Change Address</button>
              <button className="btn btn-secondary">👤 Change Name</button>
              <button className="btn btn-secondary">📁 Upload Documents</button>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-title">My Licenses</div>
            {loading ? (
              <p style={{ color: '#616161', fontSize: '0.875rem' }}>Loading licenses…</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr><th>License Type</th><th>Number</th><th>Status</th><th>Expires</th><th>Issued By</th></tr>
                  </thead>
                  <tbody>
                    {licenses.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: 'center', color: '#616161' }}>No licenses on record.</td></tr>
                    ) : licenses.map(lic => (
                      <tr key={lic.id}>
                        <td style={{ fontSize: '0.85rem' }}>{licenseTypeLabel(lic.type)}</td>
                        <td>{lic.licenseNumber}</td>
                        <td><span className={`badge ${statusBadge(lic.status)}`}>{lic.status}</span></td>
                        <td>{lic.expiresAt ? new Date(lic.expiresAt).toLocaleDateString() : '—'}</td>
                        <td>HPD</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-title">Retrieve Your PIN</div>
            <p style={{ fontSize: '0.875rem', color: '#616161', marginBottom: '0.75rem' }}>
              Your PIN is required to complete firearms transactions. For mobile accessibility, your PIN letter
              is available as a downloadable PDF below.
            </p>
            <button className="btn btn-secondary btn-sm">📄 View PIN Letter (PDF)</button>
          </div>
        </div>
      </div>
    </div>
  );
}
