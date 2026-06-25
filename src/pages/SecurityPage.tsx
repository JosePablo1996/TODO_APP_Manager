// src/pages/SecurityPage.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSecurity } from '../hooks/useSecurity';
import { useThemeClasses } from '../hooks/useThemeClasses';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import LeftMenu from '../components/LeftMenu';
import type { Notification } from '../components/Header';

// Iconos
import {
  ArrowLeft,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Fingerprint,
  Key,
  LogOut,
  History,
  AlertTriangle,
  Clock,
  Monitor,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  UserX,
  Mail,
  Activity,
  X,
  Globe
} from 'lucide-react';

// Componentes de seguridad
import { PasskeyManager } from '../components/webauthn/PasskeyManager';
import { TwoFactorManager } from '../components/profile/TwoFactorManager';
import { SessionList } from '../components/security/SessionManager';
import { AccessHistoryTable } from '../components/security/AccessHistory';

// Tipos
import type { LoginHistory } from '../types/session';

// ============================================
// CONSTANTES
// ============================================

const TABS = [
  { id: 'general', label: 'General', icon: Shield },
  { id: 'autenticacion', label: 'Autenticación', icon: Key },
  { id: 'sesiones', label: 'Sesiones', icon: Monitor },
  { id: 'inicios', label: 'Inicios de sesión', icon: History },
  { id: 'cambios', label: 'Cambios de seguridad', icon: ShieldCheck },
  { id: 'peligro', label: 'Peligro', icon: AlertTriangle },
] as const;

type TabId = typeof TABS[number]['id'];

// ============================================
// SUB-COMPONENTES
// ============================================

const StatCard: React.FC<{
  icon: React.ReactNode;
  value: string | number;
  label: string;
  subtitle?: string;
  color: string;
}> = ({ icon, value, label, subtitle, color }) => {
  const classes = useThemeClasses();
  
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20' },
    red: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-500/20' },
    gray: { bg: 'bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-500/20' },
  };

  const colors = colorMap[color] || colorMap.gray;

  return (
    <div className={`p-4 rounded-xl border ${colors.bg} ${colors.border} ${classes.bg.card}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors.bg}`}>
          <span className={colors.text}>{icon}</span>
        </div>
        <div>
          <p className={`text-2xl font-bold ${classes.text.primary}`}>{value}</p>
          <p className={`text-xs ${classes.text.muted}`}>{label}</p>
          {subtitle && <p className={`text-[10px] ${classes.text.muted}`}>{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const SecurityPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const classes = useThemeClasses();
  
  const {
    sessions,
    loginHistory,
    securityChanges,
    securityStats,
    loading,
    revokeSession,
    revokeAllSessions,
    refreshData,
    revokingSessionId,
    isRevokingAll
  } = useSecurity();

  // Estados UI
  const [notifications] = useState<Notification[]>([]);
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [showRevokeAllConfirm, setShowRevokeAllConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<LoginHistory | null>(null);

  // ✅ Valores seguros con fallback
  const securityScore = securityStats?.security_score ?? 0;
  const totalLogins = securityStats?.total_logins ?? 0;
  const uniqueDevices = securityStats?.unique_devices ?? 0;
  const has2fa = securityStats?.has_2fa ?? false;
  const hasPasskey = securityStats?.has_passkey ?? false;
  const lastLogin = securityStats?.last_login ?? null;

  // ✅ Nivel de seguridad
  const securityLevel = useMemo(() => {
    if (securityScore >= 80) return { label: 'Alta', color: 'text-emerald-500', icon: ShieldCheck, bg: 'bg-emerald-500/20' };
    if (securityScore >= 50) return { label: 'Media', color: 'text-amber-500', icon: ShieldAlert, bg: 'bg-amber-500/20' };
    return { label: 'Baja', color: 'text-red-500', icon: ShieldX, bg: 'bg-red-500/20' };
  }, [securityScore]);

  // ✅ Handlers
  const handleRevokeSession = useCallback(async (sessionId: string) => {
    await revokeSession(sessionId);
  }, [revokeSession]);

  const handleRevokeAll = useCallback(async () => {
    await revokeAllSessions();
    setShowRevokeAllConfirm(false);
  }, [revokeAllSessions]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleRefresh = useCallback(async () => {
    await refreshData();
  }, [refreshData]);

  const toggleLeftMenu = useCallback(() => {
    setIsLeftMenuOpen(prev => !prev);
  }, []);

  // ✅ Renderizar contenido según tab activo
  const renderContent = useCallback(() => {
    switch (activeTab) {
      case 'general':
        return (
          <motion.div
            key="general"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Nivel de seguridad */}
            <div className={`rounded-xl border p-4 ${classes.bg.card} ${classes.border.primary}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${securityLevel.bg}`}>
                  <securityLevel.icon className={`w-8 h-8 ${securityLevel.color}`} />
                </div>
                <div className="flex-1">
                  <h2 className={`text-lg font-bold ${classes.text.primary}`}>
                    Seguridad {securityLevel.label}
                  </h2>
                  <p className={`text-sm ${classes.text.muted}`}>Tu cuenta está protegida</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${securityLevel.color}`}>{securityScore}%</p>
                  <p className={`text-xs ${classes.text.muted}`}>Nivel de seguridad</p>
                </div>
              </div>
              <div className="mt-3 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    securityScore >= 80 ? 'bg-emerald-500' :
                    securityScore >= 50 ? 'bg-amber-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${securityScore}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                <span>0-40%</span>
                <span>41-70%</span>
                <span>71-100%</span>
              </div>
            </div>

            {/* Último acceso - SIN UBICACIÓN */}
            {lastLogin && (
              <div className={`rounded-xl border p-4 ${classes.bg.card} ${classes.border.primary}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <h3 className={`text-sm font-medium ${classes.text.primary}`}>Último acceso</h3>
                </div>
                <p className={`text-sm ${classes.text.primary}`}>
                  {new Date(lastLogin.date).toLocaleString()}
                </p>
                <p className={`text-xs ${classes.text.muted}`}>
                  {lastLogin.device} - {lastLogin.ip}
                </p>
              </div>
            )}

            {/* Estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                icon={<Activity className="w-4 h-4" />}
                value={totalLogins}
                label="Inicios de sesión"
                subtitle="Total de accesos"
                color="blue"
              />
              <StatCard
                icon={<Globe className="w-4 h-4" />}
                value={uniqueDevices}
                label="Dispositivos únicos"
                subtitle="Equipos conectados"
                color="purple"
              />
              <StatCard
                icon={<Shield className="w-4 h-4" />}
                value={has2fa ? 'Activado' : 'Desactivado'}
                label="2FA"
                subtitle="Doble factor activo"
                color={has2fa ? 'emerald' : 'red'}
              />
              <StatCard
                icon={<Fingerprint className="w-4 h-4" />}
                value={hasPasskey ? 'Activado' : 'Desactivado'}
                label="Passkey"
                subtitle="Autenticación biométrica"
                color={hasPasskey ? 'emerald' : 'red'}
              />
            </div>

            {/* Protección adicional */}
            <div className={`rounded-xl border p-4 ${classes.bg.card} ${classes.border.primary}`}>
              <h3 className={`text-sm font-medium mb-2 ${classes.text.primary}`}>Protección adicional</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-500" />
                  <span className={`text-sm ${classes.text.muted}`}>Alertas por correo</span>
                </div>
                <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full">
                  Activo
                </span>
              </div>
              <p className={`text-xs ${classes.text.muted} mt-1`}>
                Notificaciones ante accesos sospechosos
              </p>
            </div>
          </motion.div>
        );

      case 'autenticacion':
        return (
          <motion.div
            key="autenticacion"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className={`rounded-xl border overflow-hidden ${classes.bg.card} ${classes.border.primary}`}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className={`text-sm font-medium flex items-center gap-2 ${classes.text.primary}`}>
                  <Shield className="w-4 h-4 text-emerald-500" />
                  Autenticación de Dos Factores (2FA)
                </h3>
              </div>
              <div className="p-4">
                <TwoFactorManager />
              </div>
            </div>

            <div className={`rounded-xl border overflow-hidden ${classes.bg.card} ${classes.border.primary}`}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className={`text-sm font-medium flex items-center gap-2 ${classes.text.primary}`}>
                  <Fingerprint className="w-4 h-4 text-indigo-500" />
                  Claves de acceso (Passkeys)
                </h3>
              </div>
              <div className="p-4">
                <PasskeyManager />
              </div>
            </div>
          </motion.div>
        );

      case 'sesiones':
        return (
          <motion.div
            key="sesiones"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className={`rounded-xl border overflow-hidden ${classes.bg.card} ${classes.border.primary}`}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className={`text-sm font-medium flex items-center gap-2 ${classes.text.primary}`}>
                  <Monitor className="w-4 h-4 text-cyan-500" />
                  Sesiones activas ({sessions.length})
                </h3>
                {sessions.length > 1 && (
                  <button
                    onClick={() => setShowRevokeAllConfirm(true)}
                    className="text-xs px-3 py-1 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                  >
                    Cerrar todas
                  </button>
                )}
              </div>
              <div className="p-4">
                <SessionList
                  sessions={sessions}
                  onRevoke={handleRevokeSession}
                  revokingSessionId={revokingSessionId}
                  loading={loading}
                />
              </div>
            </div>
          </motion.div>
        );

      case 'inicios':
        return (
          <motion.div
            key="inicios"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className={`rounded-xl border overflow-hidden ${classes.bg.card} ${classes.border.primary}`}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className={`text-sm font-medium flex items-center gap-2 ${classes.text.primary}`}>
                  <History className="w-4 h-4 text-purple-500" />
                  Historial de accesos
                </h3>
              </div>
              <div className="p-4">
                <AccessHistoryTable
                  entries={loginHistory.filter(e => e.status === 'success')}
                  loading={loading}
                  onViewDetail={setSelectedEntry}
                />
              </div>
            </div>
          </motion.div>
        );

      case 'cambios':
        return (
          <motion.div
            key="cambios"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className={`rounded-xl border overflow-hidden ${classes.bg.card} ${classes.border.primary}`}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className={`text-sm font-medium flex items-center gap-2 ${classes.text.primary}`}>
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  Cambios de seguridad
                </h3>
              </div>
              <div className="p-4">
                {securityChanges.length === 0 ? (
                  <p className={`text-center text-sm ${classes.text.muted} py-8`}>
                    No hay cambios de seguridad registrados
                  </p>
                ) : (
                  <div className="space-y-3">
                    {securityChanges.map((change) => (
                      <div key={change.id} className={`p-3 rounded-lg border ${classes.border.primary}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className={`text-sm font-medium ${classes.text.primary}`}>
                              {change.change_type === 'password_change' && '🔑 Cambio de contraseña'}
                              {change.change_type === '2fa_enable' && '🔐 Activación de 2FA'}
                              {change.change_type === '2fa_disable' && '🔓 Desactivación de 2FA'}
                              {change.change_type === 'passkey_register' && '📱 Registro de Passkey'}
                              {change.change_type === 'passkey_delete' && '🗑️ Eliminación de Passkey'}
                              {!change.change_type.includes('password') && !change.change_type.includes('2fa') && !change.change_type.includes('passkey') && change.change_type}
                            </p>
                            <p className={`text-xs ${classes.text.muted}`}>
                              IP: {change.ip_address || 'Desconocida'}
                            </p>
                          </div>
                          <span className={`text-xs ${classes.text.muted}`}>
                            {new Date(change.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 'peligro':
        return (
          <motion.div
            key="peligro"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className={`rounded-xl border-2 border-red-500/30 overflow-hidden ${classes.bg.card}`}>
              <div className="bg-gradient-to-r from-red-500 to-pink-500 px-4 py-3">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  ZONA PELIGROSA
                </h3>
                <p className="text-red-100 text-xs">Las siguientes acciones son permanentes y no se pueden deshacer</p>
              </div>
              <div className="p-4 space-y-3">
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-red-500/20 hover:bg-red-500/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <LogOut className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-medium ${classes.text.primary}`}>Cerrar sesión</p>
                      <p className={`text-xs ${classes.text.muted}`}>Finalizar sesión en este dispositivo</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-red-500" />
                </button>

                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-red-500/20 hover:bg-red-500/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <UserX className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-medium ${classes.text.primary}`}>Eliminar cuenta</p>
                      <p className={`text-xs ${classes.text.muted}`}>Eliminar permanentemente tu cuenta y todos tus datos</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-red-500" />
                </button>
              </div>
              <div className="px-4 pb-4">
                <p className={`text-xs ${classes.text.muted} text-center`}>
                  ⚠️ Al eliminar tu cuenta, se borrarán todos tus datos de forma permanente. Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  }, [activeTab, classes, securityScore, securityLevel, lastLogin, totalLogins, uniqueDevices, has2fa, hasPasskey, sessions, loading, revokingSessionId, loginHistory, securityChanges, handleRevokeSession, handleRevokeAll]);

  // Crear objeto user seguro
  const safeUser = user ? {
    id: user.id,
    username: user.username,
    full_name: user.full_name || user.username,
    email: user.email,
    avatar: user.avatar,
    banner: user.banner,
    bio: user.bio,
    email_verified: user.email_verified || false,
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at
  } : null;

  if (!safeUser) return null;

  return (
    <div className={`min-h-screen ${classes.bg.primary}`}>
      <LeftMenu isOpen={isLeftMenuOpen} onClose={toggleLeftMenu} user={safeUser} onLogout={logout} />

      <div className="flex-1 flex flex-col">
        <Header
          user={safeUser}
          onLogout={logout}
          notifications={notifications}
          onMarkNotificationAsRead={() => {}}
          onClearAllNotifications={() => {}}
          onSearch={() => {}}
          onMenuToggle={toggleLeftMenu}
        />

        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <button
                onClick={() => navigate('/configuracion')}
                className={`p-2 rounded-lg transition-colors ${classes.bg.hover}`}
                aria-label="Volver a configuración"
              >
                <ArrowLeft className={`w-5 h-5 ${classes.icon.secondary}`} />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full" />
                <h1 className={`text-lg sm:text-xl font-bold flex items-center gap-2 ${classes.text.primary}`}>
                  <Shield className="text-emerald-500" size={20} />
                  Seguridad
                </h1>
              </div>
              <div className="flex-1" />
              <button
                onClick={handleRefresh}
                disabled={loading}
                className={`p-2 rounded-lg transition-colors ${classes.bg.hover} disabled:opacity-50`}
                aria-label="Refrescar"
              >
                <RefreshCw className={`w-5 h-5 ${classes.icon.secondary} ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Tabs */}
            <div className={`flex flex-wrap gap-1 p-1 rounded-xl border mb-4 ${classes.bg.card} ${classes.border.primary}`}>
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md'
                        : `${classes.text.secondary} hover:${classes.bg.hover}`
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Contenido */}
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Modales de confirmación */}
      <AnimatePresence>
        {/* Revocar todas */}
        {showRevokeAllConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRevokeAllConfirm(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`relative w-full max-w-md rounded-2xl overflow-hidden border ${classes.bg.card} ${classes.border.primary}`}
            >
              <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  Cerrar todas las sesiones
                </h3>
              </div>
              <div className="p-6">
                <p className={`text-center mb-2 ${classes.text.primary}`}>
                  ¿Estás seguro de que quieres cerrar todas las sesiones activas?
                </p>
                <p className={`text-center text-sm mb-6 ${classes.text.muted}`}>
                  Esto cerrará sesión en todos tus dispositivos excepto en este.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRevokeAllConfirm(false)}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${classes.button.secondary}`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleRevokeAll}
                    disabled={isRevokingAll}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isRevokingAll ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <LogOut className="w-5 h-5" />
                        Cerrar todas
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Cerrar sesión */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`relative w-full max-w-md rounded-2xl overflow-hidden border ${classes.bg.card} ${classes.border.primary}`}
            >
              <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <LogOut className="w-6 h-6" />
                  Cerrar sesión
                </h3>
              </div>
              <div className="p-6">
                <p className={`text-center mb-6 ${classes.text.primary}`}>
                  ¿Estás seguro de que quieres cerrar sesión?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${classes.button.secondary}`}
                  >
                    Cancelar
                  </button>
                  <button onClick={handleLogout} className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all font-medium flex items-center justify-center gap-2">
                    <LogOut className="w-5 h-5" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Eliminar cuenta */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`relative w-full max-w-md rounded-2xl overflow-hidden border ${classes.bg.card} ${classes.border.primary}`}
            >
              <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <UserX className="w-6 h-6" />
                  Eliminar cuenta
                </h3>
              </div>
              <div className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-red-500/20 rounded-full">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                </div>
                <p className={`text-center mb-2 ${classes.text.primary}`}>
                  ¿Estás seguro de que quieres eliminar tu cuenta?
                </p>
                <p className={`text-center text-sm mb-6 ${classes.text.muted}`}>
                  Esta acción es <strong className="text-red-500">irreversible</strong>.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${classes.button.secondary}`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      alert('Funcionalidad de eliminación de cuenta en desarrollo');
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <UserX className="w-5 h-5" />
                    Eliminar cuenta
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Detalle de acceso */}
        {selectedEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedEntry(null)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`relative w-full max-w-md rounded-2xl overflow-hidden border ${classes.bg.card} ${classes.border.primary}`}
            >
              <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Detalle del acceso</h3>
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className={`text-sm ${classes.text.muted}`}>Tipo</span>
                  <span className={`text-sm font-medium ${classes.text.primary}`}>{selectedEntry.login_type}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className={`text-sm ${classes.text.muted}`}>Dispositivo</span>
                  <span className={`text-sm font-medium ${classes.text.primary}`}>
                    {selectedEntry.device_name || selectedEntry.device_type || 'Desconocido'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className={`text-sm ${classes.text.muted}`}>Navegador</span>
                  <span className={`text-sm font-medium ${classes.text.primary}`}>
                    {selectedEntry.browser || 'Desconocido'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className={`text-sm ${classes.text.muted}`}>IP</span>
                  <span className={`text-sm font-medium ${classes.text.primary}`}>
                    {selectedEntry.ip_address || 'Desconocida'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className={`text-sm ${classes.text.muted}`}>Estado</span>
                  <span className={`text-sm font-medium ${
                    selectedEntry.status === 'success' ? 'text-emerald-500' :
                    selectedEntry.status === 'failed' ? 'text-red-500' :
                    'text-amber-500'
                  }`}>
                    {selectedEntry.status === 'success' ? '✅ Exitoso' :
                     selectedEntry.status === 'failed' ? '❌ Fallido' :
                     '⏳ Pendiente'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className={`text-sm ${classes.text.muted}`}>Fecha</span>
                  <span className={`text-sm font-medium ${classes.text.primary}`}>
                    {new Date(selectedEntry.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium hover:from-emerald-600 hover:to-cyan-600 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SecurityPage;