// src/App.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeProvider';
import { useAuth } from './hooks/useAuth';
import { AuthContext, useAuthContext } from './context/AuthContext';
import { SessionExpiredModal } from './components/ui/SessionExpiredModal';
import SplashScreen from './pages/SplashScreen';
import ProtectedPage from './pages/ProtectedPage';
import CreateTaskPage from './pages/CreateTaskPage';
import EditTaskPage from './pages/EditTaskPage';
import TrashPage from './pages/TrashPage';
import CalendarPage from './pages/CalendarPage';
import FavoritePage from './pages/FavoritePage';
import ArchivedPage from './pages/ArchivedPage';
import StatisticsPage from './pages/StatisticsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import BackupPage from './pages/BackupPage';        // ✅ NUEVO
import DeveloperPage from './pages/DeveloperPage';
import ChangelogPage from './pages/ChangelogPage';
import HelpPage from './pages/HelpPage';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import ForgotPasswordPage from './auth/ForgotPasswordPage';
import ResetPasswordPage from './auth/ResetPasswordPage';
import EmailOTPPage from './auth/EmailOTPPage';
import './index.css';

// ============================================
// PROVIDER DE AUTENTICACIÓN
// ============================================

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// COMPONENTE DE CARGA
// ============================================

const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Cargando...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-300 font-medium">{message}</p>
    </div>
  </div>
);

// ============================================
// RUTAS PROTEGIDAS
// ============================================

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen message="Verificando autenticación..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

// ============================================
// RUTAS PÚBLICAS
// ============================================

interface PublicRouteProps {
  children: React.ReactNode;
  allowAuthenticated?: boolean;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children, allowAuthenticated = false }) => {
  const { isAuthenticated, loading } = useAuthContext();
  const location = useLocation();

  const shouldRender = useMemo(() => {
    if (isAuthenticated && !allowAuthenticated) return false;
    if (loading) return false;
    return true;
  }, [isAuthenticated, loading, allowAuthenticated]);

  if (!shouldRender) {
    if (loading) {
      return <LoadingScreen message="Cargando..." />;
    }
    if (isAuthenticated && !allowAuthenticated) {
      return <Navigate to={location.state?.from || "/dashboard"} replace />;
    }
  }

  return <>{children}</>;
};

// ============================================
// RUTA RAÍZ CON SPLASH SCREEN
// ============================================

const RootRoute: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { isAuthenticated, loading } = useAuthContext();

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading || showSplash) {
    return <SplashScreen />;
  }

  const destination = isAuthenticated ? "/dashboard" : "/login";
  return <Navigate to={destination} replace />;
};

// ============================================
// COMPONENTE DE MANEJO DE SESIÓN EXPIRADA
// ============================================

const SessionExpiredHandler: React.FC = () => {
  const { tokenVersionError, clearTokenVersionError } = useAuthContext();

  if (!tokenVersionError) return null;

  return (
    <SessionExpiredModal
      message={tokenVersionError}
      autoRedirect={true}
      redirectDelay={3000}
      onClose={clearTokenVersionError}
    />
  );
};

// ============================================
// COMPONENTE PRINCIPAL DE RUTAS
// ============================================

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />

      {/* Rutas Públicas */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Página de inicio de sesión con OTP por email */}
      <Route
        path="/email-otp"
        element={
          <PublicRoute>
            <EmailOTPPage />
          </PublicRoute>
        }
      />

      {/* Rutas de recuperación de contraseña */}
      <Route
        path="/forgot-password"
        element={
          <PublicRoute allowAuthenticated={true}>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute allowAuthenticated={true}>
            <ResetPasswordPage />
          </PublicRoute>
        }
      />

      {/* ✅ NUEVO: Copia de Seguridad */}
      <Route
        path="/backup"
        element={
          <PrivateRoute>
            <BackupPage />
          </PrivateRoute>
        }
      />

      {/* Rutas Protegidas */}
      <Route path="/dashboard" element={<PrivateRoute><ProtectedPage /></PrivateRoute>} />
      <Route path="/tareas" element={<PrivateRoute><ProtectedPage /></PrivateRoute>} />
      <Route path="/crear-tarea" element={<PrivateRoute><CreateTaskPage /></PrivateRoute>} />
      <Route path="/editar-tarea/:id" element={<PrivateRoute><EditTaskPage /></PrivateRoute>} />
      <Route path="/papelera" element={<PrivateRoute><TrashPage /></PrivateRoute>} />
      <Route path="/favoritos" element={<PrivateRoute><FavoritePage /></PrivateRoute>} />
      <Route path="/archivados" element={<PrivateRoute><ArchivedPage /></PrivateRoute>} />
      <Route path="/calendario" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
      <Route path="/estadisticas" element={<PrivateRoute><StatisticsPage /></PrivateRoute>} />
      <Route path="/perfil" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/configuracion" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
      <Route path="/developer" element={<PrivateRoute><DeveloperPage /></PrivateRoute>} />
      <Route path="/changelog" element={<PrivateRoute><ChangelogPage /></PrivateRoute>} />
      <Route path="/ayuda" element={<PrivateRoute><HelpPage /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// ============================================
// COMPONENTE INTERNO (dentro del Router)
// ============================================

const AppContent: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
      <SessionExpiredHandler />
    </AuthProvider>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;