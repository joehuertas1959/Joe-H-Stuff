// REQ-0001, REQ-0002, REQ-0003
import { useNavigate } from 'react-router-dom';

const transactions = [
  { id: 'personal-sale', title: 'Personal Sale or Transfer', desc: 'Report a private sale or transfer of a firearm between individuals. Both buyer and seller must report.', icon: '🤝', path: '/fa10/personal-sale', gunBill: true },
  { id: 'registration', title: 'Register a Firearm', desc: 'Register a firearm you own or have acquired. Required for all firearms under the new law.', icon: '📝', path: '/fa10/registration', gunBill: true },
  { id: 'loss-theft', title: 'Report Loss or Theft', desc: 'Report a firearm that has been lost or stolen.', icon: '🚨', path: '/fa10/loss-theft', gunBill: false },
  { id: 'inheritance', title: 'Inheritance', desc: 'Transfer a firearm acquired through the distribution of an estate.', icon: '📜', path: '/fa10/inheritance', gunBill: false },
  { id: 'surrender', title: 'Surrender Firearm to Police', desc: 'Report the surrender of a firearm to a law enforcement agency.', icon: '🚔', path: '/fa10/surrender', gunBill: false },
  { id: 'license-validation', title: 'Generate Firearms License Validation', desc: 'Validate a Massachusetts firearms license before completing a transaction.', icon: '✅', path: '/fa10/license-validation', gunBill: false },
];

export default function FA10Landing() {
  const navigate = useNavigate();
  return (
    <div>
      <button className="back-nav" onClick={() => navigate('/')}>← Back to Unified Portal</button>
      <h1 style={{ color: '#0d3f6b' }}>Gun Transaction Portal (FA-10)</h1>
      <p style={{ color: '#616161', marginBottom: '1.5rem' }}>Select a transaction type below. All transactions are submitted electronically. A Firearms Transaction Receipt will be generated upon completion.</p>
      <div className="alert alert-info">
        <strong>ℹ️ Note:</strong> Under Massachusetts law, both the buyer and seller must independently report personal sales and transfers. Use this portal to fulfill your reporting obligation.
      </div>
      <div className="apps-grid">
        {transactions.map(tx => (
          <button key={tx.id} className="app-card" onClick={() => navigate(tx.path)} style={{ textAlign: 'left', cursor: 'pointer' }}>
            <div className="app-card-icon">{tx.icon}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="app-card-title">{tx.title}</span>
              {tx.gunBill && <span style={{ background: '#fff8e1', color: '#7a5a00', border: '1px solid #ffc107', borderRadius: 4, fontSize: '0.65rem', padding: '1px 6px', fontWeight: 700 }}>GUN BILL</span>}
            </div>
            <div className="app-card-desc">{tx.desc}</div>
          </button>
        ))}
      </div>
      <div className="card">
        <div className="card-title">View Previous Transactions</div>
        <p style={{ fontSize: '0.875rem', color: '#616161', marginBottom: '1rem' }}>Search for and view your previously submitted FA-10 transactions.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Date Range (From)</label><input type="date" className="form-control" /></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Date Range (To)</label><input type="date" className="form-control" /></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Serial Number</label><input type="text" className="form-control" placeholder="Enter serial #" /></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Make</label><input type="text" className="form-control" placeholder="Enter make" /></div>
        </div>
        <button className="btn btn-primary btn-sm">Search Transactions</button>
      </div>
    </div>
  );
}
