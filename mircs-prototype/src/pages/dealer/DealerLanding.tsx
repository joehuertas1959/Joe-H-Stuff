// RFP-HPD-1954933: HPD Dealer Portal — HRS §134-14
// Licensed Firearms Dealer Transactions, Inventory, Serial Number Requests
import { useNavigate } from 'react-router-dom';

const MOCK_DEALER = {
  name: 'Aloha Arms & Outdoors LLC',
  licenseNo: 'DLR-HI-00882',
  federalFFL: 'FFL-96-12345',
  city: 'Honolulu',
  address: '1225 Kalani Street, Honolulu, HI 96817',
  status: 'Active',
  licenseExpires: '2026-12-31',
};

const dealerMenuItems = [
  {
    id: 'new-transaction',
    icon: '🔫',
    title: 'Start New Sale Transaction',
    desc: 'Process a firearm sale to a customer. Verify PTA, record transfer, and submit to HPD per HRS §134-14.',
    path: '/dealer/transaction',
    hrsRef: 'HRS §134-14',
  },
  {
    id: 'serial-request',
    icon: '🔢',
    title: 'Request Serial Number (PMF)',
    desc: 'Request a unique Hawaii serial number (HIFRB-) for privately made firearms in dealer inventory.',
    path: '/dealer/serial-request',
    hrsRef: 'HRS §134-27',
  },
  {
    id: 'registration',
    icon: '📝',
    title: 'Register Dealer Inventory',
    desc: 'Register firearms in dealer inventory. Required for all firearms received by a licensed dealer.',
    path: '/pta/registration',
    hrsRef: 'HRS §134-3',
  },
  {
    id: 'loss-theft',
    icon: '🚨',
    title: 'Report Loss or Theft',
    desc: 'Report a firearm lost or stolen from dealer inventory. Required within 24 hours of discovery.',
    path: '/pta/loss-theft',
    hrsRef: 'HRS §134-13',
  },
  {
    id: 'history',
    icon: '📋',
    title: 'View Transaction History',
    desc: 'Search and review completed dealer transactions, sales records, and compliance reports.',
    path: '/dealer/history',
    hrsRef: null,
  },
  {
    id: 'cross-county',
    icon: '🏝️',
    title: 'Statewide License Validation',
    desc: 'Validate a customer\'s permit or license across all Hawaii counties before completing a sale.',
    path: '/dealer',
    hrsRef: 'HRS §134-2',
  },
];

export default function DealerLanding() {
  const navigate = useNavigate();

  return (
    <div>
      <button className="back-nav" onClick={() => navigate('/')}>← Back to HPD Portal</button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: '#1B2A4A', marginBottom: '0.25rem' }}>HPD Dealer Portal</h1>
          <p style={{ color: '#5A7490' }}>Licensed Firearms Dealer — Honolulu Police Department &nbsp;|&nbsp; HRS §134-14</p>
        </div>
        <div style={{ background: '#E8EEF5', border: '1px solid #B0C4DE', borderRadius: 6, padding: '0.75rem 1.25rem', fontSize: '0.875rem' }}>
          <div style={{ fontWeight: 700, color: '#1B2A4A' }}>{MOCK_DEALER.name}</div>
          <div style={{ color: '#5A7490' }}>License: {MOCK_DEALER.licenseNo}</div>
          <div style={{ color: '#5A7490' }}>FFL: {MOCK_DEALER.federalFFL}</div>
          <div style={{ color: '#5A7490' }}>📍 {MOCK_DEALER.city}, HI</div>
          <div style={{ marginTop: '0.25rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span className="badge badge-approved">Active License</span>
            <span style={{ fontSize: '0.72rem', color: '#6A849C' }}>Expires: {MOCK_DEALER.licenseExpires}</span>
          </div>
        </div>
      </div>

      <div className="apps-grid">
        {dealerMenuItems.map(item => (
          <button
            key={item.id}
            className="app-card"
            onClick={() => navigate(item.path)}
            style={{ textAlign: 'left', cursor: 'pointer' }}
          >
            <div className="app-card-icon">{item.icon}</div>
            <div className="app-card-title">{item.title}</div>
            <div className="app-card-desc">{item.desc}</div>
            {item.hrsRef && (
              <div style={{ marginTop: '0.6rem' }}>
                <span style={{ fontSize: '0.72rem', background: '#E8EEF5', color: '#1B2A4A', borderRadius: 3, padding: '0.2rem 0.45rem', fontWeight: 600 }}>
                  {item.hrsRef}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-title">Recent Activity — {MOCK_DEALER.name}</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Ticket No.</th>
                <th>Date</th>
                <th>Customer</th>
                <th>PTA Verified</th>
                <th>Firearm</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { ticket: 'DLR-2025-100421', date: '2025-03-20', customer: 'Nakamura, Keali\'i', pta: 'PTA-2025-048812', fa: 'Glock 17 (Pistol)', status: 'Completed' },
                { ticket: 'DLR-2025-100420', date: '2025-03-19', customer: 'Yamamoto, Hana', pta: 'PTA-2025-047901', fa: 'Ruger 10/22 (Rifle)', status: 'Pending' },
                { ticket: 'DLR-2025-100418', date: '2025-03-17', customer: 'Kahananui, Maile', pta: 'PTA-2025-046335', fa: 'S&W M&P (Pistol)', status: 'Completed' },
              ].map(row => (
                <tr key={row.ticket}>
                  <td><a href="#">{row.ticket}</a></td>
                  <td>{row.date}</td>
                  <td>{row.customer}</td>
                  <td style={{ fontSize: '0.8rem', color: '#5A7490' }}>{row.pta}</td>
                  <td>{row.fa}</td>
                  <td>
                    <span className={`badge ${row.status === 'Completed' ? 'badge-approved' : 'badge-pending'}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cross-County Validation Note */}
      <div className="alert alert-gold">
        <strong>Statewide Compliance (HRS §134-14):</strong> Before completing any sale, verify that the customer
        has a valid Permit to Acquire (PTA) issued by their county police department. PTAs are valid for
        <strong> 10 days</strong> from issuance. Use the Statewide License Validation tool to confirm
        permits issued by other Hawaii counties.
      </div>
    </div>
  );
}
