import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ROLES } from './types/user.types';
import PublicRoute from './components/layout/PublicRoute';
import { Toaster } from 'sonner';
import { HelmetProvider } from 'react-helmet-async';
import ProtectedRoute from './components/ui/ProtectedRoute';
import NotFoundPage from './pages/errors/NotFoundPage';
import UnauthorizedPage from './pages/errors/UnauthorizedPage';
import { PageTitleProvider } from './contexts/PageTitleContext';

// Layout
import MainLayout from './components/layout/MainLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import AdminDashboardPage from './pages/Admin/Dashboard';
import AdminSemesterPage from './pages/Admin/Semester';
import AdminFakultasPage from './pages/Admin/Fakultas';
import AdminProdiPage from './pages/Admin/Prodi';
import { AdminUserPage } from './pages/Admin/User';

// Validator Pages
const ValidatorDashboard = () => <h2>Selamat Datang di Dashboard Validator</h2>;

function App() {
  return (
    <HelmetProvider>
      <PageTitleProvider>
        <Router>
          <AuthProvider>
            <Toaster richColors position="top-right" />
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicRoute />}>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
              </Route>

              {/* Grup Rute Admin */}
              <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
                <Route element={<MainLayout />}>
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                  {/* <Route path="/admin/user" element={<AdminUserPage />} /> */}
                  <Route path="/admin/semester" element={<AdminSemesterPage />} />
                  <Route path="/admin/fakultas" element={<AdminFakultasPage />} />
                  <Route path="/admin/prodi" element={<AdminProdiPage />} />
                </Route>
              </Route>

              {/* Error / Fallback Routes */}
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AuthProvider>
        </Router>
      </PageTitleProvider>
    </HelmetProvider>
  );
}

export default App;
