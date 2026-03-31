import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import UnifiedPortal from './pages/UnifiedPortal';
import FA10Landing from './pages/fa10/FA10Landing';
import PersonalSaleTransfer from './pages/fa10/PersonalSaleTransfer';
import FirearmRegistration from './pages/fa10/FirearmRegistration';
import LossOrTheft from './pages/fa10/LossOrTheft';
import DealerLanding from './pages/dealer/DealerLanding';
import DealerTransaction from './pages/dealer/DealerTransaction';
import DealerSerialRequest from './pages/dealer/DealerSerialRequest';
import SerializationRequest from './pages/serialization/SerializationRequest';
import PortalLanding from './pages/portal/PortalLanding';
import LicenseApplication from './pages/portal/LicenseApplication';
import StateFilesLanding from './pages/statefiles/StateFilesLanding';
import AdminPanel from './pages/admin/AdminPanel';

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <p style={{ color: '#616161' }}>This screen is part of the prototype scope and will be built in a subsequent sprint.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<UnifiedPortal />} />
          <Route path="/fa10" element={<FA10Landing />} />
          <Route path="/fa10/personal-sale" element={<PersonalSaleTransfer />} />
          <Route path="/fa10/registration" element={<FirearmRegistration />} />
          <Route path="/fa10/loss-theft" element={<LossOrTheft />} />
          <Route path="/fa10/inheritance" element={<PlaceholderPage title="Inheritance Transaction" />} />
          <Route path="/fa10/surrender" element={<PlaceholderPage title="Surrender Firearm to Police" />} />
          <Route path="/fa10/license-validation" element={<PlaceholderPage title="Generate Firearms License Validation" />} />
          <Route path="/dealer" element={<DealerLanding />} />
          <Route path="/dealer/transaction" element={<DealerTransaction />} />
          <Route path="/dealer/serial-request" element={<DealerSerialRequest />} />
          <Route path="/dealer/pending" element={<PlaceholderPage title="Manage Pending Transactions" />} />
          <Route path="/dealer/history" element={<PlaceholderPage title="View Previous Transactions" />} />
          <Route path="/serialization" element={<SerializationRequest />} />
          <Route path="/portal" element={<PortalLanding />} />
          <Route path="/portal/apply" element={<LicenseApplication />} />
          <Route path="/statefiles" element={<StateFilesLanding />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<PlaceholderPage title="Page Not Found" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
