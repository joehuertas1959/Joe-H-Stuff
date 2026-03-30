import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  return (
    <>
      {/* ── Emergency / Top Bar ──────────────────────────────────────────── */}
      <div style={{
        background: '#F5C518',
        color: '#002060',
        padding: '5px 0',
        fontSize: '0.78rem',
        fontWeight: 700,
      }}>
        <div style={{
          maxWidth: 1320,
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>EMERGENCY  911  OR CONTACT  (808) 529-3111</span>
          {/* Social icons (text labels as placeholders) */}
          <div style={{ display: 'flex', gap: '0.9rem', fontSize: '0.78rem' }}>
            <span style={{ cursor: 'pointer' }}>f</span>
            <span style={{ cursor: 'pointer' }}>in</span>
            <span style={{ cursor: 'pointer' }}>▶</span>
            <span style={{ cursor: 'pointer' }}>𝕏</span>
          </div>
        </div>
      </div>

      {/* ── Main Header ─────────────────────────────────────────────────── */}
      <header style={{ background: '#002060' }}>
        <div style={{
          maxWidth: 1320,
          margin: '0 auto',
          padding: '0.75rem 1.5rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          {/* Badge / Seal */}
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #F5C518 0%, #C9A84C 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.2rem',
            flexShrink: 0,
            border: '3px solid #F5C518',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}>🛡️</div>

          {/* Title block */}
          <div>
            <div style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              color: '#F5C518',
              letterSpacing: '0.02em',
              lineHeight: 1.1,
              textTransform: 'uppercase',
            }}>
              Honolulu Police Department
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: '#F5C518',
              letterSpacing: '0.18em',
              fontWeight: 600,
              opacity: 0.85,
              marginTop: '0.15rem',
            }}>
              KA &#699;OIHANA M&#256;KA&#699;I O HONOLULU
            </div>
          </div>
        </div>

        {/* ── Navigation bar ───────────────────────────────────────────── */}
        <nav style={{
          maxWidth: 1320,
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 0,
          marginTop: '0.5rem',
        }}>
          <NavItem to="/" label="HOME" />
          <Pipe />
          <NavItem to="/pta" label="PERMIT TO ACQUIRE" />
          <Pipe />
          <NavItem to="/licensing" label="LICENSE TO CARRY" />
          <Pipe />
          <NavItem to="/dealer" label="DEALER PORTAL" />
          <Pipe />
          <NavItem to="/lawenforcement" label="LAW ENFORCEMENT" />
          <Pipe />
          <NavItem to="/serialization" label="SERIALIZATION" />
          <Pipe />
          <NavItem to="/admin" label="ADMIN" />
        </nav>
      </header>
    </>
  );
}

function Pipe() {
  return (
    <span style={{ color: '#8DA4C0', padding: '0 0.1rem', fontSize: '0.78rem', userSelect: 'none' }}>|</span>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  return (
    <Link
      to={to}
      style={{
        display: 'inline-block',
        padding: '0.55rem 0.7rem',
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.04em',
        textDecoration: 'none',
        color: isActive ? '#F5C518' : '#FFFFFF',
        borderBottom: isActive ? '3px solid #F5C518' : '3px solid transparent',
        transition: 'color 0.12s, border-color 0.12s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </Link>
  );
}
