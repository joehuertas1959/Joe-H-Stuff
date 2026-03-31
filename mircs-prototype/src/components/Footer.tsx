export default function Footer() {
  return (
    <footer style={{
      background: '#0d3f6b',
      color: '#c8d8e8',
      padding: '2rem 0 1rem',
      marginTop: '2rem',
      fontSize: '0.875rem',
    }}>
      <div className="page-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, marginBottom: '0.5rem' }}>DCJIS</div>
            <div>Massachusetts Department of Criminal Justice Information Services</div>
            <div style={{ marginTop: '0.5rem' }}>200 Arlington Street, Suite 2200<br />Chelsea, MA 02150</div>
            <div style={{ marginTop: '0.5rem' }}>(617) 660-4640</div>
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, marginBottom: '0.5rem' }}>Resources</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <a href="#" style={{ color: '#8ab4d8' }}>Firearms Services</a>
              <a href="#" style={{ color: '#8ab4d8' }}>User Guide</a>
              <a href="#" style={{ color: '#8ab4d8' }}>Terms of Use</a>
              <a href="#" style={{ color: '#8ab4d8' }}>Privacy Policy</a>
            </div>
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, marginBottom: '0.5rem' }}>Help</div>
            <div>FRB Support: frb@mass.gov</div>
            <div style={{ marginTop: '0.3rem' }}>Monday–Friday, 9 AM–5 PM</div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#8ab4d8' }}>
              988 Suicide &amp; Crisis Lifeline: <strong style={{ color: '#fff' }}>Call 988</strong>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #2a5a8a', paddingTop: '1rem', fontSize: '0.8rem', color: '#8ab4d8', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span>&copy; 2026 Commonwealth of Massachusetts</span>
          <span>MIRCS Unified Portal — Prototype v1.1</span>
        </div>
      </div>
    </footer>
  );
}
