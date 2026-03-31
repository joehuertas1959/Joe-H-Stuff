// REQ-0023, REQ-0040
import { useNavigate } from 'react-router-dom';

const MOCK_DEALER = { name: 'Boston Arms LLC', licenseNo: 'DLR-MA-00412', city: 'Boston', address: '500 Commonwealth Ave, Boston, MA 02215', status: 'Active' };

const dealerMenuItems = [
  { id: 'new-transaction', icon: '🔫', title: 'Start New Transaction', desc: 'Process a firearm sale, rental, lease, or loan for a customer.', path: '/dealer/transaction' },
  { id: 'serial-request', icon: '🔢', title: 'Request Serial Number', desc: 'Request unique DCJIS serial numbers for firearms in inventory.', path: '/dealer/serial-request' },
  { id: 'pending', icon: '⏳', title: 'Manage Pending Transactions', desc: 'View and complete transactions currently in progress.', path: '/dealer/pending' },
  { id: 'history', icon: '📋', title: 'View Previous Transactions', desc: 'Search and review completed transaction history.', path: '/dealer/history' },
  { id: 'registration', icon: '📝', title: 'Register Inventory', desc: 'Register firearms in dealer inventory per M.G.L. c.140 §123(n).', path: '/fa10/registration' },
  { id: 'loss-theft', icon: '🚨', title: 'Report Loss or Theft', desc: 'Report a lost or stolen firearm from dealer inventory.', path: '/fa10/loss-theft' },
];

export default function DealerLanding() {
  const navigate = useNavigate();
  return (
    <div>
      <button className="back-nav" onClick={() => navigate('/')}>← Back to Unified Portal</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: '#0d3f6b', marginBottom: '0.25rem' }}>MIRCS Dealer</h1>
          <p style={{ color: '#616161' }}>Massachusetts Instant Record Check System — Licensed Firearms Dealer Portal</p>
        </div>
        <div style={{ background: '#e8f0f9', border: '1px solid #14558f', borderRadius: 4, padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
          <div style={{ fontWeight: 700, color: '#0d3f6b' }}>{MOCK_DEALER.name}</div>
          <div style={{ color: '#616161' }}>License: {MOCK_DEALER.licenseNo}</div>
          <div style={{ color: '#616161' }}>📍 {MOCK_DEALER.city}, MA</div>
          <span className="badge badge-active" style={{ marginTop: '0.25rem' }}>Active License</span>
        </div>
      </div>
      <div className="apps-grid">
        {dealerMenuItems.map(item => (
          <button key={item.id} className="app-card" onClick={() => navigate(item.path)} style={{ textAlign: 'left', cursor: 'pointer' }}>
            <div className="app-card-icon">{item.icon}</div>
            <div className="app-card-title">{item.title}</div>
            <div className="app-card-desc">{item.desc}</div>
          </button>
        ))}
      </div>
      <div className="card">
        <div className="card-title">Recent Activity</div>
        <div className="table-container">
          <table>
            <thead><tr><th>Ticket No.</th><th>Date</th><th>Customer</th><th>Type</th><th>Firearm</th><th>Status</th></tr></thead>
            <tbody>
              {[
                { ticket: 'DLR-2026-100425', date: '2026-03-28', customer: 'Williams, James', type: 'Sale', fa: 'Sig Sauer P365 (Handgun)', status: 'Completed' },
                { ticket: 'DLR-2026-100424', date: '2026-03-27', customer: 'Garcia, Maria', type: 'Sale', fa: 'Glock 19 (Handgun)', status: 'Completed' },
                { ticket: 'DLR-2026-100423', date: '2026-03-26', customer: 'Smith, John', type: 'Sale', fa: 'Ruger 10/22 (Rifle)', status: 'Pending' },
                { ticket: 'DLR-2026-100421', date: '2026-03-24', customer: 'Jones, Robert', type: 'Loan', fa: 'S&W M&P (Handgun)', status: 'Completed' },
                { ticket: 'DLR-2026-100418', date: '2026-03-20', customer: 'Brown, Alice', type: 'Sale', fa: 'Mossberg 500 (Shotgun)', status: 'Completed' },
              ].map(row => (
                <tr key={row.ticket}>
                  <td><a href="#">{row.ticket}</a></td>
                  <td>{row.date}</td>
                  <td>{row.customer}</td>
                  <td>{row.type}</td>
                  <td>{row.fa}</td>
                  <td><span className={`badge ${row.status === 'Completed' ? 'badge-active' : 'badge-pending'}`}>{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
