// RFP-HPD-1954933: Electronic Firearms Registry System
// REQ: Unified Portal Landing Page — City & County of Honolulu
// REQ: Consistent Terms of Use and Privacy Policy
// REQ: Provide Contact Information
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStats } from '../api/client';

const apps = [
  {
    icon: '📋',
    title: 'Firearm Transactions (FA-10)',
    desc: 'Register a firearm, report a personal sale or transfer, or report loss or theft. Required for all acquisitions under HRS §134-3.',
    path: '/fa10',
    hrsRef: 'HRS §134-3',
    fee: null,
    loginRequired: false,
  },
  {
    icon: '🪪',
    title: 'Licensing Portal',
    desc: 'Apply for a License to Carry (LTC) — concealed or open carry. Includes 120-day processing tracking per HRS §134-9.',
    path: '/portal',
    hrsRef: 'HRS §134-9',
    fee: '$100',
    loginRequired: true,
  },
  {
    icon: '🏪',
    title: 'Dealer Portal',
    desc: 'Licensed firearms dealers: enter sale transactions, manage inventory, and request HIFRB serial numbers for PMFs.',
    path: '/dealer',
    hrsRef: 'HRS §134-14',
    fee: null,
    loginRequired: true,
  },
  {
    icon: '🚔',
    title: 'State Files',
    desc: 'HPD officers: access statewide hot files, register seized firearms, and manage change of custody records.',
    path: '/statefiles',
    hrsRef: 'HRS §134-3',
    fee: null,
    loginRequired: true,
  },
  {
    icon: '🔢',
    title: 'Serialization — PMF',
    desc: 'Request a unique Hawaii HIFRB serial number for privately made firearms (3D printed, CNC, kit-built) per HRS §134-27.',
    path: '/serialization',
    hrsRef: 'HRS §134-27',
    fee: null,
    loginRequired: true,
  },
  {
    icon: '⚙️',
    title: 'Admin — HPD Tools',
    desc: 'System administration: manage messages, reference data, denial reasons, and statewide configuration.',
    path: '/admin',
    hrsRef: null,
    fee: null,
    loginRequired: true,
  },
];

interface AdminStats { permits: number; licenses: number }

export default function UnifiedPortal() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    getAdminStats().then(setStats).catch(() => {});
  }, []);

  const statCards = [
    { label: 'PTAs on File',                  value: stats ? String(stats.permits)  : '—', sub: 'Permits to Acquire' },
    { label: 'LTCs on File',                  value: stats ? String(stats.licenses) : '—', sub: 'Concealed & Open Carry' },
    { label: 'Statutory Processing Deadline', value: '120 days',                            sub: 'HRS §134-9 (LTC)' },
    { label: 'PTA Application Fee',           value: '$26',                                 sub: 'All firearm types' },
  ];

  return (
    <div>
      {/* Hero Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #0d3f6b 0%, #14558f 70%, #1a6aad 100%)',
        color: '#fff', border: 'none', borderLeft: '4px solid #f5a623', padding: '2rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{
            background: 'linear-gradient(135deg, #f5a623, #d4891a)',
            borderRadius: '50%', width: 64, height: 64,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', flexShrink: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
          }}>🛡️</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ color: '#fff', fontSize: '1.6rem', marginBottom: '0.4rem', lineHeight: 1.2 }}>
              HPD Electronic Firearms Registry System
            </h1>
            <p style={{ color: '#c8d8ec', marginBottom: '0.75rem', maxWidth: 680, lineHeight: 1.6 }}>
              Official online portal for firearm registration and licensing with the{' '}
              <strong style={{ color: '#f5a623' }}>Honolulu Police Department, City &amp; County of Honolulu</strong>.
              Serving residents, dealers, and law enforcement under Hawaii Revised Statutes Chapter 134.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate('/fa10/registration')} style={{ fontWeight: 700 }}>
                Register a Firearm →
              </button>
              <button
                className="btn btn-secondary"
                style={{ background: 'transparent', color: '#c8d8ec', border: '1px solid #4a7aaa' }}
                onClick={() => navigate('/portal')}
              >
                Apply for License to Carry
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {statCards.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-number">{s.value}</div>
            <div style={{ fontWeight: 700, color: '#0d3f6b', fontSize: '0.82rem', marginBottom: '0.2rem' }}>{s.label}</div>
            <div style={{ fontSize: '0.75rem', color: '#6a849c' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Important Notice */}
      <div className="alert alert-info">
        <strong>Important Notice (HRS §134-3):</strong> All residents of Hawaii must register every firearm
        with the county chief of police within 5 days of acquisition. Failure to register is a misdemeanor.{' '}
        <a href="#">View registration requirements →</a>
      </div>

      {/* Application Cards */}
      <h2 style={{ color: '#0d3f6b', marginBottom: '1rem', fontSize: '1.15rem', fontWeight: 700 }}>Available Services</h2>
      <div className="apps-grid">
        {apps.map(app => (
          <button
            key={app.path}
            className="app-card"
            onClick={() => navigate(app.path)}
            style={{ textAlign: 'left', cursor: 'pointer' }}
          >
            <div className="app-card-icon">{app.icon}</div>
            <div className="app-card-title">{app.title}</div>
            <div className="app-card-desc">{app.desc}</div>
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {app.hrsRef && (
                <span style={{ fontSize: '0.72rem', background: '#e8f0f9', color: '#0d3f6b', borderRadius: 3, padding: '0.2rem 0.45rem', fontWeight: 600 }}>
                  {app.hrsRef}
                </span>
              )}
              {app.fee && (
                <span style={{ fontSize: '0.72rem', background: '#fff8e1', color: '#7a5a00', borderRadius: 3, padding: '0.2rem 0.45rem', fontWeight: 600 }}>
                  Fee: {app.fee}
                </span>
              )}
              {app.loginRequired && (
                <span style={{ fontSize: '0.72rem', color: '#9e9e9e', marginLeft: 'auto' }}>🔒 Login required</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Quick Links & Contact */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        <div className="card">
          <div className="card-title">Quick Links &amp; Resources</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <QuickLink icon="📰" label="Report a Lost or Stolen Firearm" href="/fa10/loss-theft" />
            <QuickLink icon="📝" label="Register a Firearm (FA-10)" href="/fa10/registration" />
            <QuickLink icon="📖" label="Hawaii Revised Statutes (HRS §134)" href="#" />
            <QuickLink icon="📄" label="Download FA-10 Form (PDF)" href="#" />
            <QuickLink icon="📄" label="Download LTC Application (HPD-150A)" href="#" />
            <QuickLink icon="🏛️" label="Rules of the Chief of Police — HPD" href="#" />
          </div>
        </div>

        <div className="card">
          <div className="card-title">Contact &amp; Support — HPD Firearms Unit</div>
          <p style={{ fontSize: '0.875rem', color: '#444', marginBottom: '0.75rem', lineHeight: 1.7 }}>
            <strong>Honolulu Police Department — Firearms Unit</strong><br />
            801 South Beretania Street<br />
            Honolulu, Hawai&#699;i 96813<br /><br />
            <strong>Phone:</strong> (808) 529-3371<br />
            <strong>Email:</strong> firearms@honolulupd.org<br />
            <strong>Hours:</strong> Monday–Friday, 8 AM–4 PM HST<br />
            <span style={{ fontSize: '0.8rem', color: '#6a849c' }}>Closed State Holidays</span>
          </p>
          <div style={{ padding: '0.6rem 0.75rem', background: '#fff8e1', borderRadius: 4, borderLeft: '3px solid #f5a623', fontSize: '0.82rem', color: '#7a5a00' }}>
            <strong>Mental Health Crisis Support:</strong> Call or text <strong>988</strong>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Terms of Use</div>
          <p style={{ fontSize: '0.875rem', color: '#616161', lineHeight: 1.65 }}>
            By accessing this portal, you agree to use it solely for lawful purposes in connection
            with Hawaii firearms registration and licensing. Providing false information on a firearms
            application is a violation of Hawaii law and may result in criminal prosecution under
            HRS §134. Unauthorized use or misrepresentation may result in denial, revocation, or
            criminal penalties.
          </p>
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#9e9e9e' }}>
            RFP-HPD-1954933 &nbsp;|&nbsp; System Version: Prototype v1.0
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickLink({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <a href={href} style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.55rem 0.75rem', borderRadius: 4,
      background: '#f2f5fa', textDecoration: 'none',
      color: '#0d3f6b', fontSize: '0.875rem', fontWeight: 600,
      border: '1px solid #dce4f0',
    }}>
      <span>{icon}</span><span>{label}</span>
    </a>
  );
}
