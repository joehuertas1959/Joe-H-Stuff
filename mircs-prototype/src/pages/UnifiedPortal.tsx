// REQ-0001, REQ-0094–0098, REQ-0125
import { useNavigate } from 'react-router-dom';

const apps = [
  { icon: '🔫', title: 'FA-10 Gun Transaction Portal', desc: 'Report personal sales, transfers, registrations, loss or theft of firearms. Open to all users.', path: '/fa10', color: '#14558f', loginRequired: false },
  { icon: '🏪', title: 'MIRCS Dealer Application', desc: 'Licensed firearms dealers: enter transactions, register inventory, and request serial numbers.', path: '/dealer', color: '#388557', loginRequired: true },
  { icon: '📋', title: 'MIRCS Firearms Licensing Portal', desc: 'Apply for or renew a firearms license, check application status, retrieve your PIN.', path: '/portal', color: '#5a3e9c', loginRequired: true },
  { icon: '🔢', title: 'Serialization Module', desc: 'Request a unique firearm serial number from DCJIS for privately made firearms.', path: '/serialization', color: '#c47800', loginRequired: true },
  { icon: '🚔', title: 'State Hot Files Platform', desc: 'Law enforcement and police departments: enter surrendered, seized, and disposed firearms.', path: '/statefiles', color: '#1a6b5c', loginRequired: true },
  { icon: '⚙️', title: 'Admin / DCJIS Tools', desc: 'Manage global messages, reference data, and system configuration.', path: '/admin', color: '#616161', loginRequired: true },
];

export default function UnifiedPortal() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="card" style={{ background: 'linear-gradient(135deg, #0d3f6b, #14558f)', color: '#fff', border: 'none' }}>
        <h1 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '0.5rem' }}>Welcome to the Massachusetts Firearms Registry</h1>
        <p style={{ color: '#c8d8e8', marginBottom: '1rem', maxWidth: 700 }}>
          This unified portal consolidates firearms licensing, transactions, and registration services for the Commonwealth of Massachusetts in compliance with{' '}
          <strong style={{ color: '#fff' }}>An Act Modernizing Firearms Laws (Chapter 135, Acts of 2024)</strong>.
        </p>
        <p style={{ color: '#c8d8e8', fontSize: '0.9rem' }}>
          🔗 Visit <a href="#" style={{ color: '#8ab4d8' }}>mass.gov/firearms-services</a> for additional information and resources.
        </p>
      </div>
      <div className="alert alert-warning">
        <strong>⚠️ Important:</strong> As of October 2, 2025, all firearms transfers, sales, and new acquisitions must be registered electronically through this portal. Paper FA-10 forms are no longer accepted.{' '}
        <a href="#">Learn more about registration requirements.</a>
      </div>
      <h2 style={{ color: '#0d3f6b', marginBottom: '1rem' }}>Available Services</h2>
      <div className="apps-grid">
        {apps.map(app => (
          <button key={app.path} className="app-card" onClick={() => navigate(app.path)} style={{ textAlign: 'left', border: `1px solid ${app.color}22`, cursor: 'pointer' }}>
            <div className="app-card-icon" style={{ color: app.color }}>{app.icon}</div>
            <div className="app-card-title" style={{ color: app.color }}>{app.title}</div>
            <div className="app-card-desc">{app.desc}</div>
            {app.loginRequired && <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#9e9e9e' }}>🔒 Login required</div>}
          </button>
        ))}
      </div>
      <div className="card">
        <div className="card-title">Quick Links &amp; Resources</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {[
            { icon: '📰', label: 'Report a Lost or Stolen Firearm', href: '/fa10' },
            { icon: '🎓', label: 'Firearms Safety Certificate', href: '/portal' },
            { icon: '📞', label: 'Contact Firearms Records Bureau', href: 'mailto:frb@mass.gov' },
            { icon: '📖', label: 'User Guide &amp; Help Documentation', href: '#' },
            { icon: '⚖️', label: 'Massachusetts Firearms Laws (MGL c.140)', href: '#' },
            { icon: '📅', label: 'License Renewal', href: '/portal' },
          ].map(q => (
            <a key={q.label} href={q.href} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem', borderRadius: 4, background: '#f2f2f2', textDecoration: 'none', color: '#14558f', fontSize: '0.875rem', fontWeight: 600, border: '1px solid #e0e0e0' }}>
              <span>{q.icon}</span><span dangerouslySetInnerHTML={{ __html: q.label }} />
            </a>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div className="card">
          <div className="card-title">Terms of Use</div>
          <p style={{ fontSize: '0.875rem', color: '#616161' }}>By accessing this portal, you agree to use it solely for lawful purposes in connection with Massachusetts firearms licensing and transaction reporting. Unauthorized use or misrepresentation may result in criminal penalties under M.G.L. c.140.</p>
        </div>
        <div className="card">
          <div className="card-title">Contact &amp; Support</div>
          <p style={{ fontSize: '0.875rem', color: '#616161', marginBottom: '0.5rem' }}><strong>Firearms Records Bureau (FRB)</strong><br />Email: frb@mass.gov<br />Phone: (617) 660-4640<br />Hours: Monday–Friday, 9 AM–5 PM</p>
          <p style={{ fontSize: '0.875rem', color: '#616161' }}>For technical issues, contact the DCJIS Help Desk.</p>
        </div>
      </div>
    </div>
  );
}
