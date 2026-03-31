import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();

  return (
    <>
      <div style={{ background: '#14558f', color: '#fff', padding: '4px 0', fontSize: '0.8rem' }}>
        <div className="page-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>An official website of the Commonwealth of Massachusetts</span>
          <span style={{ opacity: 0.75 }}>mass.gov</span>
        </div>
      </div>
      <header style={{ background: '#fff', borderBottom: '3px solid #14558f', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div className="page-container" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div style={{ background: '#14558f', color: '#fff', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
              🏑
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0d3f6b', lineHeight: 1.2 }}>Massachusetts Firearms Registry</div>
              <div style={{ fontSize: '0.75rem', color: '#616161' }}>Department of Criminal Justice Information Services (DCJIS)</div>
            </div>
          </Link>
          <nav style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
            <NavLink to="/" label="Unified Portal" current={location.pathname} />
            <NavLink to="/fa10" label="FA-10 Transactions" current={location.pathname} />
            <NavLink to="/dealer" label="MIRCS Dealer" current={location.pathname} />
            <NavLink to="/portal" label="MIRCS Portal" current={location.pathname} />
            <NavLink to="/serialization" label="Serialization" current={location.pathname} />
            <NavLink to="/statefiles" label="State Hot Files" current={location.pathname} />
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
        padding: '0.4rem 0.75rem',
        fontSize: '0.8rem',
        fontWeight: 600,
        textDecoration: 'none',
        borderRadius: 4,
        background: isActive ? '#14558f' : 'transparent',
        color: isActive ? '#fff' : '#14558f',
        border: '1px solid ' + (isActive ? '#14558f' : 'transparent'),
        transition: 'all 0.15s',
      }}
    >
      {label}
    </Link>
  );
}
