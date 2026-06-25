// src/pages/SettingsPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useThemeClasses } from '../hooks/useThemeClasses';
import { useAuth } from '../hooks/useAuth';
import { PasskeyManager } from '../components/webauthn/PasskeyManager';
import { TwoFactorManager } from '../components/profile/TwoFactorManager';
import UserProfileCard from '../components/profile/UserProfileCard';
import { 
  Lock, ChevronDown, KeyRound, AlertCircle,
  Moon, Sun, Bell, SortAsc, Save, Grid, List, 
  User, Info, Heart, Shield, 
  ArrowLeft, ChevronRight, Sparkles, LogOut, Fingerprint, Settings,
  HardDrive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// COMPONENTES AUXILIARES
// ============================================

const SectionHeader = ({ title, icon }: { title: string; icon?: React.ReactNode }) => {
  const classes = useThemeClasses();
  
  return (
    <div className="flex items-center gap-2 mb-3 px-2">
      <div className="w-1 h-5 bg-gradient-to-b from-emerald-500 via-teal-500 to-cyan-500 rounded-full" />
      <h2 className={`text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${classes.text.secondary}`}>
        {icon && <span className={classes.icon.secondary}>{icon}</span>}
        {title}
      </h2>
    </div>
  );
};

const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const classes = useThemeClasses();
  
  return (
    <div className={`rounded-xl sm:rounded-2xl backdrop-blur-lg border overflow-hidden mb-4 sm:mb-6 ${classes.bg.card} ${classes.border.primary} ${className}`}>
      {children}
    </div>
  );
};

const SettingsTile = ({
  icon,
  iconColor,
  title,
  subtitle,
  trailing,
  onClick,
  showArrow = true,
  className = '',
}: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
  showArrow?: boolean;
  className?: string;
}) => {
  const classes = useThemeClasses();
  
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 cursor-pointer transition-colors border-b last:border-b-0 ${classes.border.primary} ${classes.bg.hover} ${className}`}
    >
      <div className={`p-2 sm:p-3 rounded-xl ${iconColor} flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`font-medium text-sm sm:text-base truncate ${classes.text.primary}`}>{title}</h3>
        {subtitle && (
          <p className={`text-xs sm:text-sm truncate ${classes.text.secondary}`}>{subtitle}</p>
        )}
      </div>
      {trailing || (showArrow && (
        <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 ${classes.icon.secondary} flex-shrink-0`} />
      ))}
    </div>
  );
};

const ThemeToggle = ({ isDark, toggleTheme }: { isDark: boolean; toggleTheme: () => void }) => {
  return (
    <button
      onClick={toggleTheme}
      className={`
        w-12 sm:w-14 h-7 sm:h-8 rounded-2xl relative transition-all duration-300
        ${isDark 
          ? 'bg-gradient-to-r from-indigo-800 to-purple-800' 
          : 'bg-gradient-to-r from-orange-400 to-amber-600'
        }
        border ${isDark ? 'border-white/20' : 'border-white/50'}
        shadow-lg
      `}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      <motion.div
        className={`
          absolute top-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white shadow-md
          flex items-center justify-center
        `}
        animate={{ left: isDark ? '1.5rem' : '0.25rem' }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <span className="text-xs">
          {isDark ? '🌙' : '☀️'}
        </span>
      </motion.div>
    </button>
  );
};

const Switch = ({ enabled, onChange }: { enabled: boolean; onChange: (value: boolean) => void }) => {
  const classes = useThemeClasses();
  
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`
        w-10 sm:w-12 h-5 sm:h-6 rounded-full relative transition-all duration-300
        ${enabled ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md' : `${classes.bg.secondary} shadow-inner`}
      `}
      aria-label={enabled ? 'Desactivar' : 'Activar'}
      title={enabled ? 'Desactivar' : 'Activar'}
    >
      <motion.div
        className="absolute top-0.5 sm:top-1 w-4 h-4 sm:w-4 sm:h-4 rounded-full bg-white shadow-md"
        animate={{ left: enabled ? '1.25rem' : '0.125rem' }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      />
    </button>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const classes = useThemeClasses();
  
  // ✅ Detectar si es desarrollo local
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.includes('192.168.');
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedSortOrder, setSelectedSortOrder] = useState('Fecha de modificación');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [defaultView, setDefaultView] = useState<'grid' | 'list'>('grid');
  const [showPasswordDropdown, setShowPasswordDropdown] = useState(false);
  const [showPasskeyDropdown, setShowPasskeyDropdown] = useState(false);
  const [show2FADropdown, setShow2FADropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const sortOptions = [
    'Fecha de modificación',
    'Fecha de creación',
    'Título (A-Z)',
    'Título (Z-A)',
  ];

  const handleResetPassword = () => {
    setShowPasswordDropdown(false);
    setShowResetConfirm(true);
  };

  const confirmResetPassword = () => {
    setShowResetConfirm(false);
    navigate('/forgot-password');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isDark = theme === 'dark';

  const displayName = user?.full_name || user?.username || 'Usuario';
  const displayEmail = user?.email || 'usuario@todoappmanager.com';
  const avatarUrl = user?.avatar;
  const isEmailVerified = user?.email_verified || false;

  return (
    <div className={`min-h-screen ${classes.bg.primary}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 backdrop-blur-xl border-b ${classes.border.primary} ${classes.bg.card}`}>
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className={`p-1.5 sm:p-2 rounded-xl transition-colors ${classes.bg.hover}`}
              aria-label="Volver al inicio"
              title="Volver al inicio"
            >
              <ArrowLeft className={`w-5 h-5 sm:w-6 sm:h-6 ${classes.icon.secondary}`} />
            </motion.button>
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 via-teal-500 to-cyan-500 rounded-full" />
              <h1 className={`text-lg sm:text-xl font-bold flex items-center gap-2 ${classes.text.primary}`}>
                <Settings size={18} className="text-emerald-500" />
                Configuración
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* PERFIL DEL USUARIO */}
        <SectionHeader title="Perfil" icon={<User size={14} />} />
        <UserProfileCard
          displayName={displayName}
          displayEmail={displayEmail}
          avatarUrl={avatarUrl}
          isEmailVerified={isEmailVerified}
          onAvatarError={() => setAvatarError(true)}
        />

        {/* APARIENCIA */}
        <SectionHeader title="Apariencia" icon={<Sun size={14} />} />
        <GlassCard>
          <SettingsTile
            icon={<Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />}
            iconColor="bg-indigo-500/10"
            title="Modo oscuro"
            subtitle="Cambiar entre tema claro y oscuro"
            trailing={<ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />}
            showArrow={false}
          />
        </GlassCard>

        {/* NOTIFICACIONES */}
        <SectionHeader title="Notificaciones" icon={<Bell size={14} />} />
        <GlassCard>
          <SettingsTile
            icon={<Bell className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />}
            iconColor="bg-orange-500/10"
            title="Notificaciones"
            subtitle="Recibir alertas de tareas"
            trailing={<Switch enabled={notificationsEnabled} onChange={setNotificationsEnabled} />}
            showArrow={false}
          />
        </GlassCard>

        {/* ORDENAR TAREAS */}
        <SectionHeader title="Ordenar tareas" icon={<SortAsc size={14} />} />
        <GlassCard>
          <SettingsTile
            icon={<SortAsc className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />}
            iconColor="bg-purple-500/10"
            title="Ordenar por"
            subtitle={selectedSortOrder}
            trailing={
              <select
                value={selectedSortOrder}
                onChange={(e) => setSelectedSortOrder(e.target.value)}
                className={`px-3 py-2 rounded-lg text-xs sm:text-sm border ${classes.bg.input} ${classes.text.primary} ${classes.border.primary} focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-sm`}
                onClick={(e) => e.stopPropagation()}
                aria-label="Seleccionar orden de tareas"
                title="Ordenar tareas"
              >
                {sortOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            }
            showArrow={false}
          />
        </GlassCard>

        {/* AJUSTES GENERALES */}
        <SectionHeader title="Ajustes generales" icon={<Save size={14} />} />
        <GlassCard>
          <SettingsTile
            icon={<Save className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />}
            iconColor="bg-green-500/10"
            title="Auto-guardado"
            subtitle="Guardar automáticamente al crear tareas"
            trailing={<Switch enabled={autoSaveEnabled} onChange={setAutoSaveEnabled} />}
            showArrow={false}
          />

          <SettingsTile
            icon={defaultView === 'grid' ? <Grid className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500" /> : <List className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500" />}
            iconColor="bg-teal-500/10"
            title="Vista predeterminada"
            subtitle={defaultView === 'grid' ? 'Grid' : 'Lista'}
            trailing={
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => { e.stopPropagation(); setDefaultView('grid'); }}
                  className={`p-2 rounded-lg transition-all duration-200 ${defaultView === 'grid' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' : classes.bg.secondary}`}
                  aria-label="Vista grid"
                  title="Vista grid"
                >
                  <Grid className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => { e.stopPropagation(); setDefaultView('list'); }}
                  className={`p-2 rounded-lg transition-all duration-200 ${defaultView === 'list' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' : classes.bg.secondary}`}
                  aria-label="Vista lista"
                  title="Vista lista"
                >
                  <List className="w-4 h-4" />
                </motion.button>
              </div>
            }
            showArrow={false}
          />
        </GlassCard>

        {/* ============================================ */}
        {/* SEGURIDAD - SECCIÓN ACTUALIZADA              */}
        {/* ============================================ */}
        <SectionHeader title="Seguridad" icon={<Shield size={14} />} />
        <GlassCard>
          {/* ✅ PASSKEYS - SOLO EN LOCALHOST */}
          {isLocalhost && (
            <>
              <motion.div
                whileHover={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                onClick={() => setShowPasskeyDropdown(!showPasskeyDropdown)}
                className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 cursor-pointer transition-colors border-b ${classes.border.primary}`}
              >
                <div className="p-2 sm:p-3 rounded-xl bg-indigo-500/10 flex-shrink-0">
                  <Fingerprint className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium text-sm sm:text-base ${classes.text.primary}`}>
                    Claves de acceso (Passkeys)
                  </h3>
                  <p className={`text-xs sm:text-sm truncate ${classes.text.secondary}`}>
                    Usa tu huella digital, Face ID o PIN para iniciar sesión
                  </p>
                </div>
                <motion.div 
                  animate={{ rotate: showPasskeyDropdown ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className={`${classes.icon.secondary} flex-shrink-0`}
                >
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.div>
              </motion.div>

              <AnimatePresence>
                {showPasskeyDropdown && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={`p-3 sm:p-4 border-t ${classes.border.primary} bg-gradient-to-br from-indigo-500/5 to-purple-500/5`}>
                      <PasskeyManager />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* ✅ 2FA - SIEMPRE VISIBLE */}
          <motion.div
            whileHover={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
            onClick={() => setShow2FADropdown(!show2FADropdown)}
            className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 cursor-pointer transition-colors border-b ${classes.border.primary}`}
          >
            <div className="p-2 sm:p-3 rounded-xl bg-emerald-500/10 flex-shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium text-sm sm:text-base ${classes.text.primary}`}>
                Autenticación de Dos Factores (2FA)
              </h3>
              <p className={`text-xs sm:text-sm truncate ${classes.text.secondary}`}>
                Protege tu cuenta con un código adicional
              </p>
            </div>
            <motion.div 
              animate={{ rotate: show2FADropdown ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className={`${classes.icon.secondary} flex-shrink-0`}
            >
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.div>
          </motion.div>

          <AnimatePresence>
            {show2FADropdown && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className={`p-3 sm:p-4 border-t ${classes.border.primary} bg-gradient-to-br from-emerald-500/5 to-teal-500/5`}>
                  <TwoFactorManager />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ✅ NUEVO: GESTIÓN DE SEGURIDAD UNIFICADA */}
          <SettingsTile
            icon={<Shield className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />}
            iconColor="bg-emerald-500/10"
            title="Centro de Seguridad"
            subtitle="Gestiona toda la seguridad de tu cuenta"
            onClick={() => navigate('/seguridad')}
          />

          {/* COPIA DE SEGURIDAD */}
          <SettingsTile
            icon={<HardDrive className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500" />}
            iconColor="bg-teal-500/10"
            title="Copia de Seguridad"
            subtitle="Exporta e importa tus tareas"
            onClick={() => navigate('/backup')}
          />

          {/* CAMBIAR CONTRASEÑA */}
          <motion.div
            whileHover={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
            onClick={() => setShowPasswordDropdown(!showPasswordDropdown)}
            className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 cursor-pointer transition-colors border-b ${classes.border.primary}`}
          >
            <div className="p-2 sm:p-3 rounded-xl bg-purple-500/10 flex-shrink-0">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium text-sm sm:text-base ${classes.text.primary}`}>Cambiar contraseña</h3>
              <p className={`text-xs sm:text-sm truncate ${classes.text.secondary}`}>
                {displayEmail}
              </p>
            </div>
            <motion.div 
              animate={{ rotate: showPasswordDropdown ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className={`${classes.icon.secondary} flex-shrink-0`}
            >
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.div>
          </motion.div>

          <AnimatePresence>
            {showPasswordDropdown && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className={`p-3 sm:p-4 border-t ${classes.border.primary} bg-gradient-to-br from-purple-500/5 to-pink-500/5`}>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-amber-500/20 rounded-full flex-shrink-0">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className={`text-xs sm:text-sm ${classes.text.secondary}`}>
                        <span className="font-semibold">¿Olvidaste tu contraseña?</span>
                        <br />
                        Te enviaremos un enlace seguro a tu correo electrónico.
                      </p>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => { e.stopPropagation(); handleResetPassword(); }}
                    className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium text-sm sm:text-base">Recuperar contraseña</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CERRAR SESIÓN */}
          <motion.div
            whileHover={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
            onClick={() => setShowLogoutConfirm(true)}
            className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 cursor-pointer transition-colors`}
          >
            <div className="p-2 sm:p-3 rounded-xl bg-red-500/10 flex-shrink-0">
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium text-sm sm:text-base text-red-500`}>Cerrar Sesión</h3>
              <p className={`text-xs sm:text-sm truncate ${classes.text.secondary}`}>
                Salir de tu cuenta
              </p>
            </div>
            <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 ${classes.icon.secondary} flex-shrink-0`} />
          </motion.div>
        </GlassCard>

        {/* ACERCA DE */}
        <SectionHeader title="Acerca de" icon={<Info size={14} />} />
        <GlassCard>
          <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
            <div className="p-2 sm:p-3 rounded-xl bg-blue-400/10 flex-shrink-0">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium text-sm sm:text-base ${classes.text.primary}`}>Versión</h3>
              <p className={`text-xs sm:text-sm truncate ${classes.text.secondary}`}>
                TodoAppManager v2.6.0 - Supabase Edition
              </p>
            </div>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
        </GlassCard>

        {/* REGISTRO DE CAMBIOS */}
        <SectionHeader title="Actualizaciones" icon={<Info size={14} />} />
        <GlassCard>
          <SettingsTile
            icon={<Heart className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />}
            iconColor="bg-amber-500/10"
            title="Registro de cambios"
            subtitle="Ver todas las novedades de TodoAppManager"
            onClick={() => navigate('/changelog')}
          />
        </GlassCard>

        {/* INFORMACIÓN DEL DESARROLLADOR */}
        <SectionHeader title="Desarrollador" icon={<User size={14} />} />
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className={`rounded-xl sm:rounded-2xl p-6 sm:p-8 backdrop-blur-lg border bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 ${classes.border.primary} shadow-lg`}
        >
          <div className="flex flex-col items-center text-center mb-5 sm:mb-6">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 mb-3 sm:mb-4 shadow-lg"
            >
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </motion.div>
            <h3 className={`font-semibold text-base sm:text-lg mb-1 ${classes.text.primary}`}>Desarrollado con ❤️ por</h3>
            <p className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">
              José Pablo Miranda Quintanilla
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/developer')}
            className={`w-full py-2.5 sm:py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 shadow-lg text-sm sm:text-base`}
            aria-label="Ver perfil del desarrollador"
            title="Perfil del desarrollador"
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
            Ver perfil del desarrollador
          </motion.button>
        </motion.div>
      </div>

      {/* Modal de confirmación de cierre de sesión */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowLogoutConfirm(false)}
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`relative w-full max-w-md rounded-2xl overflow-hidden ${classes.bg.card} border shadow-2xl`}
            >
              <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <LogOut className="w-6 h-6" />
                  Cerrar sesión
                </h3>
              </div>

              <div className="p-6">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="p-0.5 bg-gradient-to-r from-red-400 to-pink-400 rounded-full">
                      {avatarUrl && !avatarError ? (
                        <img 
                          src={avatarUrl} 
                          alt={displayName}
                          className="w-20 h-20 rounded-full object-cover"
                          onError={() => setAvatarError(true)}
                        />
                      ) : (
                        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${(() => {
                          if (displayName === 'Usuario') return 'from-emerald-500 to-cyan-500';
                          const gradients = ['from-emerald-500 to-cyan-500', 'from-green-500 to-teal-500', 'from-orange-500 to-red-500', 'from-purple-500 to-pink-500', 'from-blue-500 to-indigo-500', 'from-yellow-500 to-orange-500', 'from-cyan-500 to-blue-500', 'from-teal-500 to-emerald-500', 'from-violet-500 to-purple-500'];
                          const charCodeSum = displayName.split('').reduce((sum: number, char: string) => sum + char.charCodeAt(0), 0);
                          return gradients[charCodeSum % gradients.length];
                        })()} flex items-center justify-center text-white text-2xl font-bold`}>
                          {(() => {
                            if (displayName === 'Usuario') return 'U';
                            const nameParts = displayName.split(' ').filter(p => p.length > 0);
                            if (nameParts.length === 0) return 'U';
                            if (nameParts.length === 1) return nameParts[0].substring(0, Math.min(2, nameParts[0].length)).toUpperCase();
                            return (nameParts[0][0] + (nameParts[1] ? nameParts[1][0] : '')).toUpperCase();
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <p className={`text-lg font-semibold mb-2 ${classes.text.primary}`}>
                    ¿Cerrar sesión, {displayName.split(' ')[0]}?
                  </p>
                  <p className={`text-sm ${classes.text.secondary}`}>
                    Podrás volver a iniciar sesión cuando quieras
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${classes.button.secondary}`}
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Salir
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de confirmación para recuperar contraseña */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowResetConfirm(false)}
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`relative w-full max-w-md rounded-2xl overflow-hidden ${classes.bg.card} border shadow-2xl`}
            >
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-6 h-6" />
                  Recuperar contraseña
                </h3>
              </div>

              <div className="p-6">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white">
                    <KeyRound className="w-10 h-10" />
                  </div>
                </div>

                <div className="text-center mb-6">
                  <p className={`text-lg font-semibold mb-2 ${classes.text.primary}`}>
                    ¿Recuperar contraseña?
                  </p>
                  <p className={`text-sm ${classes.text.secondary}`}>
                    Serás redirigido a la página de recuperación.
                    <br />
                    <span className="font-medium text-purple-500">Continuarás con la sesión abierta</span>
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${classes.button.secondary}`}
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmResetPassword}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <KeyRound className="w-5 h-5" />
                    Continuar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;