// RFP-HPD-1954933: HPD Dealer Portal — HRS §134-14
// Licensed Firearms Dealer Transactions, Inventory, Serial Number Requests
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDealers, getTransactions } from '../../api/client';

interface Dealer {
  id: string;
  name: string;
  licenseNumber: string;
  fflNumber: string | null;
  city: string;
  address: string;
  state: string;
  status: string;
  expiresAt: string | null;
}

interface Transaction {
  id: string;
  ticketNumber: string;
  type: string;
  status: string;
  createdAt: string;
  firearm: { make: string; model: string; type: string; serialNumber: string };
  buyer: { firstName: string; lastName: string } | null;
  seller: { firstName: string; lastName: string } | null;
  dealer: { licenseNumber: string; name: string } | null;
}

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
    desc: "Validate a customer's permit or license across all Hawaii counties before completing a sale.",
    path: '/dealer',
    hrsRef: 'HRS §134-2',
  },
];

function txStatusBadge(status: string) {
  const cls = status === 'completed' ? 'badge-approved'
    : status === 'pending' ? 'badge-pending'
    : status === 'rejected' ? 'badge-denied'
    : 'badge-pending';
  return <span className={`badge ${cls}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}

export default function DealerLanding() {
  const navigate = useNavigate();
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getDealers() as Promise<Dealer[]>, getTransactions() as Promise<Transaction[]>])
      .then(([dealers, txs]) => {
        setDealer(dealers[0] ?? null);
        setTransactions(txs.slice(0, 5));
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <button className="back-nav" onClick={() => navigate('/')}>← Back to HPD Portal</button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: '#1B2A4A', marginBottom: '0.25rem' }}>HPD Dealer Portal</h1>
          <p style={{ color: '#5A7490' }}>Licensed Firearms Dealer — Honolulu Police Department &nbsp;|&nbsp; HRS §134-14</p>
        </div>

        {/* Dealer info card — live from /api/dealers */}
        <div style={{ background: '#E8EEF5', border: '1px solid #B0C4DE', borderRadius: 6, padding: '0.75rem 1.25rem', fontSize: '0.875rem', minWidth: 220 }}>
          {loading ? (
            <p style={{ color: '#616161', margin: 0 }}>Loading dealer info…</p>
          ) : error ? (
            <p style={{ color: '#c62828', margin: 0, fontSize: '0.8rem' }}>Error: {error}</p>
          ) : dealer ? (
            <>
              <div style={{ fontWeight: 700, color: '#1B2A4A' }}>{dealer.name}</div>
              <div style={{ color: '#5A7490' }}>License: {dealer.licenseNumber}</div>
              {dealer.fflNumber && <div style={{ color: '#5A7490' }}>FFL: {dealer.fflNumber}</div>}
              <div style={{ color: '#5A7490' }}>📍 {dealer.city}, {dealer.state}</div>
              <div style={{ marginTop: '0.25rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span className={`badge ${dealer.status === 'active' ? 'badge-approved' : 'badge-pending'}`}>
                  {dealer.status.charAt(0).toUpperCase() + dealer.status.slice(1)} License
                </span>
                {dealer.expiresAt && (
                  <span style={{ fontSize: '0.72rem', color: '#6A849C' }}>
                    Expires: {new Date(dealer.expiresAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </>
          ) : (
            <p style={{ color: '#9e9e9e', margin: 0 }}>No dealer record found.</p>
          )}
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

      {/* Recent Activity — live from /api/transactions */}
      <div className="card">
        <div className="card-title">
          Recent Activity{dealer ? ` — ${dealer.name}` : ''}
        </div>
        {loading ? (
          <p style={{ color: '#616161', fontSize: '0.875rem', padding: '0.5rem 0' }}>Loading transactions…</p>
        ) : error ? (
          <div className="alert alert-danger" style={{ fontSize: '0.875rem' }}>Could not load transactions: {error}</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Ticket No.</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Firearm</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: '#9e9e9e', padding: '1rem' }}>
                      No transactions on record.
                    </td>
                  </tr>
                ) : (
                  transactions.map(tx => (
                    <tr key={tx.id}>
                      <td><a href="#">{tx.ticketNumber}</a></td>
                      <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td>
                        {tx.buyer
                          ? `${tx.buyer.lastName}, ${tx.buyer.firstName}`
                          : tx.seller
                          ? `${tx.seller.lastName}, ${tx.seller.firstName}`
                          : '—'}
                      </td>
                      <td>{tx.type}</td>
                      <td>{tx.firearm.make} {tx.firearm.model} ({tx.firearm.type})</td>
                      <td>{txStatusBadge(tx.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="alert alert-gold">
        <strong>Statewide Compliance (HRS §134-14):</strong> Before completing any sale, verify that the customer
        has a valid Permit to Acquire (PTA) issued by their county police department. PTAs are valid for
        <strong> 10 days</strong> from issuance. Use the Statewide License Validation tool to confirm
        permits issued by other Hawaii counties.
      </div>
    </div>
  );
}
