// RFP-HPD-1954933: FA-10 Firearm Transactions — HPD Electronic Firearms Registry System
// REQ-0001: FA-10 transactions available in unified portal, open to all users
// REQ-0002: All transaction types supported
// REQ-0003: Electronic submission replaces paper FA-10 form
import { useNavigate } from 'react-router-dom';

const transactions = [
  { id: 'personal-sale', title: 'Personal Sale or Transfer',            desc: 'Report a private sale or transfer of a firearm between individuals. Both buyer and seller must independently report.',  icon: '🤝', path: '/fa10/personal-sale' },
  { id: 'registration',  title: 'Register a Firearm',                   desc: 'Register a firearm you own or have acquired. Required within 5 days of acquisition under HRS §134-3.',                   icon: '📝', path: '/fa10/registration' },
  { id: 'loss-theft',    title: 'Report Loss or Theft',                 desc: 'Report a firearm that has been lost or stolen. Required promptly upon discovery under HRS §134-13.',                     icon: '🚨', path: '/fa10/loss-theft' },
  { id: 'inheritance',   title: 'Inheritance / Estate Transfer',        desc: 'Transfer a firearm acquired through the distribution of an estate or by bequest.',                                        icon: '📜', path: '/fa10/inheritance' },
  { id: 'surrender',     title: 'Surrender Firearm to Police',          desc: 'Report the voluntary surrender of a firearm to a law enforcement agency.',                                                icon: '🚔', path: '/fa10/surrender' },
  { id: 'validation',    title: 'Verify License to Carry (LTC)',        desc: 'Verify an active License to Carry before completing a transaction. Confirms HPD-issued LTC status.',                     icon: '✅', path: '/fa10/license-validation' },
];

export default function FA10Landing() {
  const navigate = useNavigate();
  return (
    <div>
      <button className="back-nav" onClick={() => navigate('/')}>← Back to Unified Portal</button>
      <h1 style={{ color: '#0d3f6b' }}>Firearm Transaction Portal (FA-10)</h1>
      <p style={{ color: '#616161', marginBottom: '1.5rem' }}>
        Select a transaction type below. All transactions are submitted electronically to HPD.
        A Firearms Transaction Receipt will be generated upon completion.
      </p>
      <div className="alert alert-info">
        <strong>ℹ️ Note:</strong> Under Hawaii law (HRS §134-3), both the buyer and seller must
        independently report personal sales and transfers. Use this portal to fulfill your
        individual reporting obligation.
      </div>
      <div className="apps-grid">
        {transactions.map(tx => (
          <button key={tx.id} className="app-card" onClick={() => navigate(tx.path)} style={{ textAlign: 'left', cursor: 'pointer' }}>
            <div className="app-card-icon">{tx.icon}</div>
            <div className="app-card-title">{tx.title}</div>
            <div className="app-card-desc">{tx.desc}</div>
          </button>
        ))}
      </div>
      <div className="card">
        <div className="card-title">View Previous Transactions</div>
        <p style={{ fontSize: '0.875rem', color: '#616161', marginBottom: '1rem' }}>
          Search for and view your previously submitted FA-10 transactions.
        </p>
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
