import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();

  return (
    <>
      {/* City & County of Honolulu Top Bar */}
      <div style={{ background: '#0F1A2E', color: '#C8D4E8', padding: '5px 0', fontSize: '0.78rem' }}>
        <div className="page-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>An Official Website of the City &amp; County of Honolulu</span>
          <span style={{ opacity: 0.75 }}>honolulu.gov</span>
        </div>
      </div>

      {/* HPD Gold Accent Bar */}
      <div className="hpd-accent-bar" />

      {/* Main Header */}
      <header style={{
        background: '#1B2A4A',
        borderBottom: '3px solid #C9A84C',
        boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
      }}>
        <div className="page-container" style={{
          padding: '0.85rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>
          {/* Logo / Branding */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none' }}>
            {/* HPD Badge Icon */}
            <div style={{
              background: 'linear-gradient(135deg, #C9A84C, #B8860B)',
              borderRadius: '50%',
              width: 50,
              height: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              border: '2px solid #D4A017',
            }}>
              🛡️
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#FFFFFF', lineHeight: 1.2, letterSpacing: '0.01em' }}>
                Honolulu Police Department
              </div>
              <div style={{ fontSize: '0.7rem', color: '#C9A84C', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Electronic Firearms Permit System
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
            <NavLink to="/" label="Home" current={location.pathname} />
            <NavLink to="/pta" label="Permit to Acquire" current={location.pathname} />
            <NavLink to="/licensing" label="License to Carry" current={location.pathname} />
            <NavLink to="/dealer" label="Dealer Portal" current={location.pathname} />
            <NavLink to="/lawenforcement" label="Law Enforcement" current={location.pathname} />
            <NavLink to="/admin" label="Admin" current={location.pathname} />
          </nav>
        </div>
      </header>
    </>
  );
}

function NavLink({ to, label, current }: { to: string; label: string; current: string }) {
  const isActive = current === to || (to !== '/' && current.startsWith(to));
  return (
    <Link
      to={to}
      style={{
        padding: '0.4rem 0.8rem',
        fontSize: '0.78rem',
        fontWeight: 600,
        textDecoration: 'none',
        borderRadius: 4,
        background: isActive ? '#C9A84C' : 'transparent',
        color: isActive ? '#0F1A2E' : '#C8D4E8',
        border: '1px solid ' + (isActive ? '#C9A84C' : 'transparent'),
        transition: 'all 0.15s',
        letterSpacing: '0.02em',
      }}
    >
      {label}
    </Link>
  );
}
