import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PublicLayout } from './components/layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

import { HomePage } from './pages/public/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { PatientsPage } from './pages/admin/patients/PatientsPage';
import { AppointmentsPage } from './pages/admin/appointments/AppointmentsPage';
import { ActivitiesPage } from './pages/admin/activities/ActivitiesPage';
import { ProfilePage } from './pages/admin/profile/ProfilePage';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          {/* Rotas Públicas */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
          </Route>

          {/* Autenticação */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rotas Privadas / Administrativas */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="pacientes" element={<PatientsPage />} />
            <Route path="atendimentos" element={<AppointmentsPage />} />
            <Route path="atividades" element={<ActivitiesPage />} />
            <Route path="perfil" element={<ProfilePage />} />
          </Route>

          {/* Fallback de 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
