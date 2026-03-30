import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AdminBanner from './AdminBanner';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="app-shell">
      <Header />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <AdminBanner />
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-section-title">Resident Services</div>
      <SidebarLink to="/pta"          label="Permit to Acquire"      current={pathname} />
      <SidebarLink to="/pta/apply"    label="  Apply for PTA"        current={pathname} />
      <SidebarLink to="/pta/registration" label="  Register Firearm" current={pathname} />
      <SidebarLink to="/pta/loss-theft"   label="  Report Lost/Stolen" current={pathname} />
      <SidebarLink to="/pta/surrender"    label="  Surrender Firearm"  current={pathname} />

      <div className="sidebar-section-title">Licensing</div>
      <SidebarLink to="/licensing"         label="License to Carry"  current={pathname} />
      <SidebarLink to="/licensing/ltc"     label="  Apply for LTC"   current={pathname} />
      <SidebarLink to="/licensing/renewal" label="  LTC Renewal"     current={pathname} />

      <div className="sidebar-section-title">Dealer Portal</div>
      <SidebarLink to="/dealer"                label="Dealer Home"         current={pathname} />
      <SidebarLink to="/dealer/transaction"    label="  Process Sale"      current={pathname} />
      <SidebarLink to="/dealer/serial-request" label="  Request Serial #"  current={pathname} />
      <SidebarLink to="/dealer/history"        label="  Transaction History" current={pathname} />

      <div className="sidebar-section-title">Serialization</div>
      <SidebarLink to="/serialization" label="Serialize PMF" current={pathname} />

      <div className="sidebar-section-title">Law Enforcement</div>
      <SidebarLink to="/lawenforcement" label="State Files Portal" current={pathname} />

      <div className="sidebar-section-title">Administration</div>
      <SidebarLink to="/admin" label="Admin Panel" current={pathname} />

      {/* Help block */}
      <div style={{
        margin: '1.5rem 1rem 0',
        padding: '0.75rem',
        background: 'rgba(245,197,24,0.12)',
        border: '1px solid rgba(245,197,24,0.3)',
        borderRadius: 3,
        fontSize: '0.75rem',
        color: '#C8D4E8',
        lineHeight: 1.5,
      }}>
        <div style={{ fontWeight: 700, color: '#F5C518', marginBottom: '0.3rem' }}>Need Help?</div>
        firearms@honolulupd.org<br />
        (808) 529-3371<br />
        <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Mon–Fri 8 AM–4 PM HST</span>
      </div>
    </aside>
  );
}

function SidebarLink({ to, label, current }: { to: string; label: string; current: string }) {
  const isActive = current === to || (to !== '/' && current.startsWith(to));
  return (
    <Link to={to} className={`sidebar-link${isActive ? ' active' : ''}`}>
      {label}
    </Link>
  );
}
