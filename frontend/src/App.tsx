import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import MeetingDetailPage from './pages/MeetingDetailPage';

function App() {
  return (
    <Routes>
      {/* Public Marketing Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* App Workspace Routes */}
      <Route
        path="/app"
        element={
          <Layout>
            <DashboardPage />
          </Layout>
        }
      />
      <Route
        path="/app/upload"
        element={
          <Layout>
            <UploadPage />
          </Layout>
        }
      />
      <Route
        path="/app/meetings/:id"
        element={
          <Layout>
            <MeetingDetailPage />
          </Layout>
        }
      />

      {/* Legacy route redirects for seamless navigation */}
      <Route path="/upload" element={<Navigate to="/app/upload" replace />} />
      <Route path="/meetings/:id" element={<Navigate to="/app/meetings/:id" replace />} />
    </Routes>
  );
}

export default App;

