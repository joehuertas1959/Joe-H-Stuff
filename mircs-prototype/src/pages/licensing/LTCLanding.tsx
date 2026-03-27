// RFP-HPD-1954933: License to Carry (LTC) — HRS §134-9
// HPD-150A/B/C/D Forms — Concealed and Open Carry Licensing
// REQ: 120-Day Statutory Deadline Tracking, Appointment Scheduling, Status Notifications
import { useNavigate } from 'react-router-dom';

const MOCK_APPLICATIONS = [
  {
    appNo: 'LTC-2025-001847',
    type: 'License to Carry — Concealed',
    submitted: '2025-01-15',
    deadline: '2025-05-15',
    status: 'Under Review',
    daysLeft: 49,
    stage: 'Background Check',
  },
];

export default function LTCLanding() {
  const navigate = useNavigate();
  const totalDays = 120;
  const app = MOCK_APPLICATIONS[0];
  const daysElapsed = totalDays - app.daysLeft;
  const pct = Math.round((daysElapsed / totalDays) * 100);

  return (
    <div>
      <button className="back-nav" onClick={() => navigate('/')}>← Back to HPD Portal</button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: '#1B2A4A', marginBottom: '0.25rem' }}>License to Carry (LTC)</h1>
          <p style={{ color: '#5A7490' }}>
            Concealed and Open Carry Licensing &mdash; <strong>HRS §134-9</strong> &nbsp;|&nbsp; Forms HPD-150A/B/C/D
          </p>
        </div>
        <div style={{ background: '#FEF9EC', border: '1px solid #C9A84C', borderRadius: 6, padding: '0.75rem 1.25rem', fontSize: '0.875rem' }}>
          <div style={{ fontWeight: 700, color: '#1B2A4A' }}>Application Fee</div>
          <div style={{ color: '#B8860B', fontSize: '1.1rem', fontWeight: 700 }}>$100.00</div>
          <div style={{ color: '#5A7490', fontSize: '0.78rem' }}>Per HRS §134-9 / §134-9.6</div>
        </div>
      </div>

      {/* Active Application with 120-Day Deadline Tracker */}
      <div className="card" style={{ border: '1px solid #C9A84C' }}>
        <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span>Active Application — 120-Day Deadline Tracker (HRS §134-9)</span>
          <span className={`badge ${app.daysLeft <= 14 ? 'badge-suspended' : app.daysLeft <= 30 ? 'badge-pending' : 'badge-active'}`}>
            {app.daysLeft} days remaining
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <div><strong>App No.:</strong><br /><a href="#">{app.appNo}</a></div>
          <div><strong>Type:</strong><br />{app.type}</div>
          <div><strong>Submitted:</strong><br />{app.submitted}</div>
          <div><strong>Statutory Deadline:</strong><br /><span style={{ color: '#C9A84C', fontWeight: 700 }}>{app.deadline}</span></div>
          <div><strong>Current Stage:</strong><br />{app.stage}</div>
          <div><strong>Status:</strong><br /><span className="badge badge-pending">{app.status}</span></div>
        </div>

        {/* Deadline Progress Bar */}
        <div className="deadline-tracker">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#5A7490', marginBottom: '0.3rem' }}>
            <span>Day 0 — Application Submitted</span>
            <span style={{ color: pct >= 75 ? '#DC2626' : '#B8860B', fontWeight: 700 }}>{pct}% of 120 days elapsed</span>
            <span>Day 120 — Statutory Deadline</span>
          </div>
          <div style={{ background: '#E5E7EB', borderRadius: 8, height: 12, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              background: pct >= 75 ? '#DC2626' : pct >= 50 ? '#F59E0B' : '#C9A84C',
              borderRadius: 8,
              transition: 'width 0.3s',
            }} />
          </div>
          <div style={{ fontSize: '0.78rem', color: '#6A849C', marginTop: '0.3rem' }}>
            {daysElapsed} of 120 days elapsed &nbsp;|&nbsp; Deadline: {app.deadline}
          </div>
        </div>

        {/* Processing Stages */}
        <div style={{ display: 'flex', gap: '0.35rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {[
            'Application Received',
            'Fee Paid',
            'Background Check',
            'HPD Review',
            'Fingerprinting',
            'Interview',
            'Decision',
          ].map((stage, i) => {
            const done = i < 2;
            const active = stage === app.stage;
            return (
              <div key={stage} style={{
                padding: '0.3rem 0.65rem',
                borderRadius: 4,
                fontSize: '0.75rem',
                fontWeight: 600,
                background: done ? '#C9A84C' : active ? '#1B2A4A' : '#E5E7EB',
                color: done ? '#0F1A2E' : active ? '#fff' : '#6A849C',
                border: active ? '2px solid #C9A84C' : 'none',
              }}>
                {done ? '✓ ' : ''}{stage}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem' }}>
        {/* Quick Actions */}
        <div>
          <div className="card">
            <div className="card-title">Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="btn btn-gold" onClick={() => navigate('/licensing/ltc')}>
                📋 New LTC Application
              </button>
              <button className="btn btn-secondary">
                🔄 Renewal Application
              </button>
              <button className="btn btn-secondary">
                🗓️ Schedule Appointment
              </button>
              <button className="btn btn-secondary">
                📥 Upload Documents
              </button>
              <button className="btn btn-secondary">
                📬 Update Address
              </button>
              <button className="btn btn-secondary">
                🔍 Check Application Status
              </button>
            </div>
          </div>

          {/* LTC Requirements */}
          <div className="card" style={{ marginTop: '1rem' }}>
            <div className="card-title">LTC Requirements (HRS §134-9)</div>
            <div style={{ fontSize: '0.82rem', color: '#5A7490', lineHeight: 1.7 }}>
              <ul style={{ margin: '0 0 0 1rem', padding: 0 }}>
                <li>21+ years of age</li>
                <li>Hawaii resident</li>
                <li>Completed approved firearm safety course</li>
                <li>Fingerprinting at HPD Firearms Unit</li>
                <li>In-person interview</li>
                <li>No prohibited person status (HRS §134-7)</li>
                <li>Completed HPD-150A/B/C/D forms</li>
                <li>Mental Health Waiver (if applicable)</li>
                <li>$100 application fee</li>
              </ul>
            </div>
          </div>
        </div>

        {/* My Applications */}
        <div>
          <div className="card">
            <div className="card-title">My LTC Applications</div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>App No.</th>
                    <th>Type</th>
                    <th>Submitted</th>
                    <th>Deadline</th>
                    <th>Days Left</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_APPLICATIONS.map(a => (
                    <tr key={a.appNo}>
                      <td><a href="#">{a.appNo}</a></td>
                      <td style={{ fontSize: '0.82rem' }}>{a.type}</td>
                      <td>{a.submitted}</td>
                      <td style={{ color: '#B8860B', fontWeight: 600 }}>{a.deadline}</td>
                      <td>
                        <span className={`badge ${a.daysLeft <= 14 ? 'badge-suspended' : a.daysLeft <= 30 ? 'badge-pending' : 'badge-active'}`}>
                          {a.daysLeft}d
                        </span>
                      </td>
                      <td><span className="badge badge-pending">{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Appointment Scheduling */}
          <div className="card">
            <div className="card-title">Schedule an Appointment</div>
            <p style={{ fontSize: '0.875rem', color: '#5A7490', marginBottom: '1rem' }}>
              Fingerprinting and in-person interviews are required for all LTC applicants.
              Schedule at the HPD Firearms Unit.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { icon: '🖐️', title: 'Fingerprinting — LTC', desc: 'Required for all new LTC applications.' },
                { icon: '💬', title: 'In-Person Interview', desc: 'Scheduled after background check completion.' },
                { icon: '📄', title: 'Document Review', desc: 'Submit supporting documents in person.' },
                { icon: '📦', title: 'Document Pickup', desc: 'Pick up approved permit in person.' },
              ].map(appt => (
                <button
                  key={appt.title}
                  className="card"
                  style={{ padding: '0.85rem', margin: 0, cursor: 'pointer', textAlign: 'left', border: '1px solid #DCE4F0' }}
                >
                  <div style={{ fontSize: '1.25rem', marginBottom: '0.3rem' }}>{appt.icon}</div>
                  <div style={{ fontWeight: 700, color: '#1B2A4A', fontSize: '0.85rem' }}>{appt.title}</div>
                  <div style={{ fontSize: '0.78rem', color: '#5A7490' }}>{appt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Training Requirements */}
          <div className="card">
            <div className="card-title">Approved Training (HRS §134-9)</div>
            <div className="table-container">
              <table>
                <thead><tr><th>Training Type</th><th>Accepted</th></tr></thead>
                <tbody>
                  {[
                    ['NRA Basic Pistol Course', '✓'],
                    ['Hawaii Approved Firearms Safety Course', '✓'],
                    ['Law Enforcement Training', '✓'],
                    ['Military Training (DD-214 Required)', '✓'],
                    ['Hunter Education Certificate', '✓'],
                    ['Other HPD-Approved Course', '✓'],
                  ].map(([type, ok]) => (
                    <tr key={type}>
                      <td style={{ fontSize: '0.85rem' }}>{type}</td>
                      <td><span className="badge badge-approved">{ok}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
