// RFP-HPD-1954933: Permit to Acquire (PTA) — HRS §134-2
// HPD-89 Form Workflow — Pistol/Revolver and Rifle/Shotgun
// REQ: PTA Application Submission, Status Tracking, Notifications
import { useNavigate } from 'react-router-dom';

const MOCK_PERMITS = [
  {
    number: 'PTA-2025-048812',
    type: 'Pistol / Revolver',
    status: 'Approved',
    issued: '2025-03-20',
    expires: '2025-03-30',
    dealer: 'Big Island Guns & Ammo',
  },
  {
    number: 'PTA-2025-038211',
    type: 'Rifle / Shotgun',
    status: 'Expired',
    issued: '2025-01-05',
    expires: '2025-01-15',
    dealer: 'Personal Purchase',
  },
];

export default function PTALanding() {
  const navigate = useNavigate();

  return (
    <div>
      <button className="back-nav" onClick={() => navigate('/')}>← Back to HPD Portal</button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: '#1B2A4A', marginBottom: '0.25rem' }}>Permit to Acquire (PTA)</h1>
          <p style={{ color: '#5A7490' }}>
            Apply for permission to purchase a firearm in the City &amp; County of Honolulu &mdash;{' '}
            <strong>HRS §134-2</strong> &nbsp;|&nbsp; Form HPD-89
          </p>
        </div>
        <div style={{ background: '#E8EEF5', border: '1px solid #B0C4DE', borderRadius: 6, padding: '0.75rem 1.25rem', fontSize: '0.875rem' }}>
          <div style={{ fontWeight: 700, color: '#1B2A4A' }}>Application Fee</div>
          <div style={{ color: '#5A7490' }}>Pistol / Revolver: <strong style={{ color: '#B8860B' }}>$26.00</strong></div>
          <div style={{ color: '#5A7490' }}>Rifle / Shotgun: <strong style={{ color: '#B8860B' }}>$26.00</strong></div>
        </div>
      </div>

      {/* Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { icon: '⏱️', title: 'Valid 10 Days', desc: 'Permits expire 10 days from date of issuance. Purchase must be completed within this window.' },
          { icon: '📋', title: 'HPD-89 Required', desc: 'Complete the official HPD-89 Permit to Acquire form. Electronic submission available here.' },
          { icon: '🔍', title: 'Background Check', desc: 'HPD conducts a mandatory background check per HRS §134-2 before issuing any PTA.' },
          { icon: '🏦', title: 'Secure Payment', desc: 'Pay the $26 application fee online via credit card or eCheck. Payment is non-refundable.' },
        ].map(item => (
          <div key={item.title} className="card" style={{ padding: '1rem', margin: 0 }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{item.icon}</div>
            <div style={{ fontWeight: 700, color: '#1B2A4A', marginBottom: '0.25rem', fontSize: '0.9rem' }}>{item.title}</div>
            <div style={{ fontSize: '0.82rem', color: '#5A7490', lineHeight: 1.5 }}>{item.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem' }}>
        {/* Quick Actions */}
        <div>
          <div className="card">
            <div className="card-title">Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="btn btn-gold" onClick={() => navigate('/pta/apply')}>
                📋 Apply for New PTA
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/pta/registration')}>
                📝 Register a Firearm
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/pta/loss-theft')}>
                🚨 Report Loss or Theft
              </button>
              <button className="btn btn-secondary">
                📥 Download HPD-89 (PDF)
              </button>
              <button className="btn btn-secondary">
                🔍 Check Application Status
              </button>
            </div>
          </div>

          {/* Eligibility */}
          <div className="card" style={{ marginTop: '1rem' }}>
            <div className="card-title">Eligibility (HRS §134-7)</div>
            <div style={{ fontSize: '0.82rem', color: '#5A7490', lineHeight: 1.7 }}>
              Applicant must be:
              <ul style={{ margin: '0.4rem 0 0 1rem', padding: 0 }}>
                <li>21+ years of age (pistol/revolver)</li>
                <li>18+ years of age (rifle/shotgun)</li>
                <li>Hawaii resident</li>
                <li>Not prohibited under HRS §134-7</li>
                <li>No felony convictions</li>
                <li>No domestic violence orders</li>
                <li>No mental health adjudications</li>
              </ul>
            </div>
          </div>
        </div>

        {/* My Permits */}
        <div>
          <div className="card">
            <div className="card-title">My Permits</div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Permit No.</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Issued</th>
                    <th>Expires</th>
                    <th>Dealer / Use</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PERMITS.map(p => (
                    <tr key={p.number}>
                      <td><a href="#">{p.number}</a></td>
                      <td style={{ fontSize: '0.82rem' }}>{p.type}</td>
                      <td>
                        <span className={`badge ${p.status === 'Approved' ? 'badge-approved' : 'badge-suspended'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>{p.issued}</td>
                      <td>{p.expires}</td>
                      <td style={{ fontSize: '0.82rem', color: '#5A7490' }}>{p.dealer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Process Steps */}
          <div className="card">
            <div className="card-title">How It Works — PTA Process</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { step: '1', title: 'Submit Application', desc: 'Complete the HPD-89 form online and pay the $26 fee.' },
                { step: '2', title: 'Background Check', desc: 'HPD reviews your application and conducts a NCIC/CJIS background check.' },
                { step: '3', title: 'Receive Permit', desc: 'If approved, your permit is issued electronically (valid 10 days).' },
                { step: '4', title: 'Purchase Firearm', desc: 'Present your permit at a licensed dealer. Dealer records the transaction.' },
                { step: '5', title: 'Register Firearm', desc: 'Register the acquired firearm with HPD within 5 days per HRS §134-3.' },
              ].map(s => (
                <div key={s.step} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{
                    background: '#C9A84C', color: '#0F1A2E', borderRadius: '50%',
                    width: 28, height: 28, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0,
                  }}>{s.step}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1B2A4A', fontSize: '0.875rem' }}>{s.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#5A7490' }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
