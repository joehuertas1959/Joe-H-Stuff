// RFP-HPD-1954933: Dealer Portal — HPD Electronic Firearms Registry System
// REQ-0023: Update Application Header ("HPD Dealer Portal")
// REQ-0040: Indicate User's City/Town
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDealers, getTransactions } from '../../api/client';

const dealerMenuItems = [
  { id: 'new-transaction', icon: '🔫', title: 'Start New Transaction',          desc: 'Process a firearm sale, rental, lease, or loan for a customer.',                         path: '/dealer/transaction' },
  { id: 'serial-request',  icon: '🔢', title: 'Request HIFRB Serial Number',    desc: 'Request unique Hawaii HIFRB serial numbers for privately made firearms in inventory.',    path: '/dealer/serial-request' },
  { id: 'pending',         icon: '⏳', title: 'Manage Pending Transactions',     desc: 'View and complete transactions currently in progress.',                                    path: '/dealer/pending' },
  { id: 'history',         icon: '📋', title: 'View Previous Transactions',      desc: 'Search and review completed transaction history.',                                         path: '/dealer/history' },
  { id: 'registration',    icon: '📝', title: 'Register Inventory',              desc: 'Register firearms in dealer inventory per HRS §134-3.',                                    path: '/fa10/registration' },
  { id: 'loss-theft',      icon: '🚨', title: 'Report Loss or Theft',            desc: 'Report a lost or stolen firearm from dealer inventory.',                                   path: '/fa10/loss-theft' },
];

export default function DealerLanding() {
  const navigate = useNavigate();
  const [dealer, setDealer]           = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([getDealers(), getTransactions()])
      .then(([dealers, txs]) => {
        setDealer(dealers[0] ?? null);
        setTransactions(txs.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <button className="back-nav" onClick={() => navigate('/')}>← Back to Unified Portal</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: '#0d3f6b', marginBottom: '0.25rem' }}>HPD Dealer Portal</h1>
          <p style={{ color: '#616161' }}>Hawaii Firearms Registry System — Licensed Firearms Dealer Portal</p>
        </div>
        {loading ? (
          <div style={{ fontSize: '0.875rem', color: '#616161' }}>Loading dealer info…</div>
        ) : dealer ? (
          <div style={{ background: '#e8f0f9', border: '1px solid #14558f', borderRadius: 4, padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
            <div style={{ fontWeight: 700, color: '#0d3f6b' }}>{dealer.name}</div>
            <div style={{ color: '#616161' }}>License: {dealer.licenseNumber}</div>
            <div style={{ color: '#616161' }}>📍 {dealer.city}, {dealer.state}</div>
            <span className="badge badge-active" style={{ marginTop: '0.25rem' }}>Active License</span>
          </div>
        ) : null}
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
        {loading ? (
          <p style={{ fontSize: '0.875rem', color: '#616161' }}>Loading transactions…</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Ticket No.</th><th>Date</th><th>Buyer</th><th>Type</th><th>Firearm</th><th>Status</th></tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: '#616161' }}>No transactions on record.</td></tr>
                ) : transactions.map(tx => (
                  <tr key={tx.id}>
                    <td><a href="#">{tx.ticketNumber}</a></td>
                    <td>{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '—'}</td>
                    <td>{tx.buyer ? `${tx.buyer.lastName}, ${tx.buyer.firstName}` : '—'}</td>
                    <td>{tx.type}</td>
                    <td>{tx.firearm ? `${tx.firearm.make} ${tx.firearm.model}` : '—'}</td>
                    <td>
                      <span className={`badge ${tx.status === 'completed' ? 'badge-active' : tx.status === 'rejected' ? 'badge-suspended' : 'badge-pending'}`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
