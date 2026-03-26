import type { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import AdminBanner from './AdminBanner';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main className="main-content" style={{ flex: 1 }}>
        <div className="page-container">
          <AdminBanner />
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
