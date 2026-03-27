// RFP-HPD-1954933: Electronic Firearms Permit Application System
// REQ: Unified Portal Landing Page — City & County of Honolulu
// REQ: Modern and Responsive UI — HPD Design Standards
// REQ: Consistent Terms of Use and Privacy Policy
// REQ: Provide Contact Information
import { useNavigate } from 'react-router-dom';

const apps = [
  {
    icon: '📋',
    title: 'Permit to Acquire (PTA)',
    desc: 'Apply for a permit to acquire a pistol, revolver, rifle, or shotgun. Required for all firearm purchases in Honolulu.',
    path: '/pta',
    hrsRef: 'HRS §134-2',
    fee: '$26',
    loginRequired: false,
  },
  {
    icon: '🪪',
    title: 'License to Carry (LTC)',
    desc: 'Apply for a concealed or open carry license. Includes HPD-150A/B/C/D forms and 120-day processing tracking.',
    path: '/licensing',
    hrsRef: 'HRS §134-9',
    fee: '$100',
    loginRequired: true,
  },
  {
    icon: '🏪',
    title: 'Dealer Portal',
    desc: 'Licensed firearms dealers: enter sale transactions, manage inventory, and request serial numbers for PMFs.',
    path: '/dealer',
    hrsRef: 'HRS §134-14',
    fee: null,
    loginRequired: true,
  },
  {
    icon: '🚔',
    title: 'Law Enforcement Portal',
    desc: 'HPD officers: register, surrender, seize, and manage change of custody for firearms. Statewide hot files access.',
    path: '/lawenforcement',
    hrsRef: 'HRS §134-3',
    fee: null,
    loginRequired: true,
  },
  {
    icon: '🔢',
    title: 'Serialization — PMF',
    desc: 'Request a unique Hawaii serial number for privately made firearms (3D printed, CNC, kit-built) per HRS §134-27.',
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

const stats = [
  { label: 'PTAs Issued Annually', value: '~11,000', sub: 'Pistol & Revolver' },
  { label: 'LTCs Processed Annually', value: '~1,600', sub: 'Concealed & Open Carry' },
  { label: 'Statutory Processing Deadline', value: '120 days', sub: 'HRS §134-9 (LTC)' },
  { label: 'PTA Application Fee', value: '$26', sub: 'All firearm types' },
];

export default function UnifiedPortal() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #0F1A2E 0%, #1B2A4A 60%, #2B5FA8 100%)',
        color: '#fff',
        border: 'none',
        borderLeft: '4px solid #C9A84C',
        padding: '2rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{
            background: 'linear-gradient(135deg, #C9A84C, #B8860B)',
            borderRadius: '50%',
            width: 64, height: 64,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', flexShrink: 0,
            boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
          }}>🛡️</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ color: '#fff', fontSize: '1.6rem', marginBottom: '0.4rem', lineHeight: 1.2 }}>
              HPD Electronic Firearms Permit System
            </h1>
            <p style={{ color: '#C8D4E8', marginBottom: '0.75rem', maxWidth: 680, lineHeight: 1.6 }}>
              The official online portal for firearm permits and licensing with the{' '}
              <strong style={{ color: '#C9A84C' }}>Honolulu Police Department, City &amp; County of Honolulu</strong>.
              Serving residents, dealers, and law enforcement under Hawaii Revised Statutes Chapter 134.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-gold"
                onClick={() => navigate('/pta/apply')}
                style={{ fontWeight: 700 }}
              >
                Apply for Permit to Acquire →
              </button>
              <button
                className="btn"
                style={{ background: 'transparent', color: '#C8D4E8', border: '1px solid #4A6A9A' }}
                onClick={() => navigate('/licensing')}
              >
                License to Carry Application
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-number">{s.value}</div>
            <div style={{ fontWeight: 700, color: '#1B2A4A', fontSize: '0.82rem', marginBottom: '0.2rem' }}>{s.label}</div>
            <div style={{ fontSize: '0.75rem', color: '#6A849C' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Important Notice */}
      <div className="alert alert-gold">
        <strong>Important Notice (HRS §134-2):</strong> All residents of the City &amp; County of Honolulu
        must obtain a Permit to Acquire from HPD before purchasing any firearm from a dealer or private party.
        Permits are valid for 10 days from the date of issuance.{' '}
        <a href="#" style={{ color: '#B8860B' }}>View eligibility requirements →</a>
      </div>

      {/* Application Cards */}
      <h2 style={{ color: '#1B2A4A', marginBottom: '1rem', fontSize: '1.15rem', fontWeight: 700 }}>Available Services</h2>
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
                <span style={{ fontSize: '0.72rem', background: '#E8EEF5', color: '#1B2A4A', borderRadius: 3, padding: '0.2rem 0.45rem', fontWeight: 600 }}>
                  {app.hrsRef}
                </span>
              )}
              {app.fee && (
                <span style={{ fontSize: '0.72rem', background: '#FEF3CD', color: '#8B6914', borderRadius: 3, padding: '0.2rem 0.45rem', fontWeight: 600 }}>
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
            <QuickLink icon="📰" label="Report a Lost or Stolen Firearm" href="/pta/loss-theft" />
            <QuickLink icon="🗓️" label="Schedule an Appointment — LTC Fingerprinting" href="/licensing" />
            <QuickLink icon="📖" label="Hawaii Revised Statutes (HRS §134)" href="#" />
            <QuickLink icon="📄" label="Download HPD-89 (PTA Form)" href="#" />
            <QuickLink icon="📄" label="Download HPD-150A (LTC Application)" href="#" />
            <QuickLink icon="🏛️" label="Rules of the Chief of Police" href="#" />
          </div>
        </div>

        <div className="card">
          <div className="card-title">Contact &amp; Support — HPD Firearms Unit</div>
          <p style={{ fontSize: '0.875rem', color: '#444', marginBottom: '0.75rem', lineHeight: 1.7 }}>
            <strong>Honolulu Police Department — Firearms Unit</strong><br />
            801 South Beretania Street<br />
            Honolulu, Hawai'i 96813<br /><br />
            <strong>Phone:</strong> (808) 529-3371<br />
            <strong>Email:</strong> firearms@honolulupd.org<br />
            <strong>Hours:</strong> Monday–Friday, 8 AM–4 PM HST<br />
            <span style={{ fontSize: '0.8rem', color: '#6A849C' }}>Closed State Holidays</span>
          </p>
          <div style={{ padding: '0.6rem 0.75rem', background: '#FEF3CD', borderRadius: 4, borderLeft: '3px solid #C9A84C', fontSize: '0.82rem', color: '#7A5C0A' }}>
            <strong>Mental Health Crisis Support:</strong> Call or text <strong>988</strong>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Terms of Use</div>
          <p style={{ fontSize: '0.875rem', color: '#616161', lineHeight: 1.65 }}>
            By accessing this portal, you agree to use it solely for lawful purposes in connection
            with Hawaii firearms permitting and licensing. Providing false information on a firearms
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
    <a
      href={href}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.55rem 0.75rem', borderRadius: 4,
        background: '#F2F5FA', textDecoration: 'none',
        color: '#1B2A4A', fontSize: '0.875rem', fontWeight: 600,
        border: '1px solid #DCE4F0',
        transition: 'background 0.15s',
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </a>
  );
}
