import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AuthGuard } from './components/AuthGuard';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminPipeline } from './pages/AdminPipeline';
import { AdminContacts } from './pages/AdminContacts';
import { PartnerDeals } from './pages/PartnerDeals';
import { ViewerPipeline } from './pages/ViewerPipeline';

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case 'admin': return <Navigate to="/admin/dashboard" replace />;
    case 'partner': return <Navigate to="/partner/deals" replace />;
    case 'viewer': return <Navigate to="/viewer/pipeline" replace />;
    default: return <Navigate to="/login" replace />;
  }
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="ml-56 p-8">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RoleRedirect />} />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={
        <AuthGuard roles={['admin']}>
          <AppLayout><AdminDashboard /></AppLayout>
        </AuthGuard>
      } />
      <Route path="/admin/pipeline" element={
        <AuthGuard roles={['admin']}>
          <AppLayout><AdminPipeline /></AppLayout>
        </AuthGuard>
      } />
      <Route path="/admin/contacts" element={
        <AuthGuard roles={['admin']}>
          <AppLayout><AdminContacts /></AppLayout>
        </AuthGuard>
      } />

      {/* Partner routes */}
      <Route path="/partner/deals" element={
        <AuthGuard roles={['partner', 'admin']}>
          <AppLayout><PartnerDeals /></AppLayout>
        </AuthGuard>
      } />

      {/* Viewer routes */}
      <Route path="/viewer/pipeline" element={
        <AuthGuard roles={['viewer', 'partner', 'admin']}>
          <AppLayout><ViewerPipeline /></AppLayout>
        </AuthGuard>
      } />

      {/* Fallback */}
      <Route path="/unauthorized" element={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-brand-text-bright mb-2">Geen toegang</h1>
            <p className="text-sm text-brand-text-dim">U heeft geen rechten voor deze pagina.</p>
          </div>
        </div>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
