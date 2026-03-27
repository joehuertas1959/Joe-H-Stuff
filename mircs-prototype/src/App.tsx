import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import UnifiedPortal from './pages/UnifiedPortal';
import PTALanding from './pages/pta/PTALanding';
import PTAApplication from './pages/pta/PTAApplication';
import FirearmRegistration from './pages/fa10/FirearmRegistration';
import LossOrTheft from './pages/fa10/LossOrTheft';
import DealerLanding from './pages/dealer/DealerLanding';
import DealerTransaction from './pages/dealer/DealerTransaction';
import DealerSerialRequest from './pages/dealer/DealerSerialRequest';
import SerializationRequest from './pages/serialization/SerializationRequest';
import LTCLanding from './pages/licensing/LTCLanding';
import LTCApplication from './pages/licensing/LTCApplication';
import StateFilesLanding from './pages/statefiles/StateFilesLanding';
import AdminPanel from './pages/admin/AdminPanel';

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <p style={{ color: '#616161' }}>This module is included in the prototype scope and will be fully built in a subsequent sprint.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* HPD Unified Portal */}
          <Route path="/" element={<UnifiedPortal />} />

          {/* Permit to Acquire (PTA) — HRS §134-2 */}
          <Route path="/pta" element={<PTALanding />} />
          <Route path="/pta/apply" element={<PTAApplication />} />
          <Route path="/pta/registration" element={<FirearmRegistration />} />
          <Route path="/pta/loss-theft" element={<LossOrTheft />} />
          <Route path="/pta/surrender" element={<PlaceholderPage title="Surrender Firearm to HPD" />} />

          {/* License to Carry (LTC) — HRS §134-9 */}
          <Route path="/licensing" element={<LTCLanding />} />
          <Route path="/licensing/ltc" element={<LTCApplication />} />
          <Route path="/licensing/renewal" element={<PlaceholderPage title="LTC Renewal Application" />} />

          {/* HPD Dealer Portal — HRS §134-14 */}
          <Route path="/dealer" element={<DealerLanding />} />
          <Route path="/dealer/transaction" element={<DealerTransaction />} />
          <Route path="/dealer/serial-request" element={<DealerSerialRequest />} />
          <Route path="/dealer/history" element={<PlaceholderPage title="View Previous Transactions" />} />

          {/* Serialization Module — Privately Made Firearms */}
          <Route path="/serialization" element={<SerializationRequest />} />

          {/* Law Enforcement Portal */}
          <Route path="/lawenforcement" element={<StateFilesLanding />} />

          {/* Admin — HPD Tools */}
          <Route path="/admin" element={<AdminPanel />} />

          {/* 404 */}
          <Route path="*" element={<PlaceholderPage title="Page Not Found" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
