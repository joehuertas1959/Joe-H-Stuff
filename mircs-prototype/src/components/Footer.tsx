export default function Footer() {
  return (
    <footer style={{
      background: '#0F1A2E',
      color: '#8DA4C0',
      padding: '2rem 0 1rem',
      marginTop: '2rem',
      fontSize: '0.875rem',
      borderTop: '3px solid #C9A84C',
    }}>
      <div className="page-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ color: '#C9A84C', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Honolulu Police Department
            </div>
            <div style={{ color: '#8DA4C0', lineHeight: 1.6 }}>
              Firearms Unit<br />
              801 South Beretania Street<br />
              Honolulu, Hawai'i 96813
            </div>
            <div style={{ marginTop: '0.5rem' }}>(808) 529-3371</div>
          </div>

          <div>
            <div style={{ color: '#C9A84C', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Resources
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <a href="#" style={{ color: '#8DA4C0' }}>HPD Firearms Unit Website</a>
              <a href="#" style={{ color: '#8DA4C0' }}>Hawaii Revised Statutes (HRS §134)</a>
              <a href="#" style={{ color: '#8DA4C0' }}>Rules of the Chief of Police</a>
              <a href="#" style={{ color: '#8DA4C0' }}>Privacy Policy</a>
              <a href="#" style={{ color: '#8DA4C0' }}>Terms of Use</a>
            </div>
          </div>

          <div>
            <div style={{ color: '#C9A84C', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Help &amp; Support
            </div>
            <div style={{ lineHeight: 1.7 }}>
              firearms@honolulupd.org<br />
              Monday–Friday, 8 AM–4 PM HST<br />
              <span style={{ fontSize: '0.8rem', color: '#6A849C' }}>Closed State Holidays</span>
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#8DA4C0' }}>
              Crisis Support: <strong style={{ color: '#fff' }}>Call 988</strong>
            </div>
          </div>

          <div>
            <div style={{ color: '#C9A84C', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Legal
            </div>
            <div style={{ fontSize: '0.8rem', lineHeight: 1.7 }}>
              Providing false information on a firearms application is a violation of Hawaii law and may result in criminal prosecution.
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
              RFP-HPD-1954933
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid #2A3D5A',
          paddingTop: '1rem',
          fontSize: '0.8rem',
          color: '#6A849C',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          <span>© {new Date().getFullYear()} City &amp; County of Honolulu. All rights reserved.</span>
          <span>HPD Electronic Firearms Permit System — Prototype v1.0</span>
        </div>
      </div>
    </footer>
  );
}
