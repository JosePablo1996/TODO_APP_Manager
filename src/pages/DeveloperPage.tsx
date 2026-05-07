// src/pages/DeveloperPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeClasses } from '../hooks/useThemeClasses';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Github, 
  Mail, 
  Code, 
  Sparkles, 
  Heart, 
  Globe, 
  Cpu, 
  Database, 
  Layout, 
  Zap, 
  Braces, 
  Server,
  Shield,
  Cloud,
  Key,
  Lock,
  Coffee,
  RefreshCw,
  Fingerprint,
  Binary,
  Award,
  Rocket,
  LogOut,
  Bell,
  Clock,
  Monitor,
  Trash2,
  BarChart,
  Smartphone,
  QrCode,
  Hash,
  Package,
  Info,
  FileText,
  ShieldCheck,
  Wifi,
  Layers
} from 'lucide-react';

// ============================================
// COMPONENTES AUXILIARES
// ============================================

const TechBadge = ({ name, icon: Icon, color }: { name: string; icon: React.ElementType; color: string }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    pink: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
    green: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    red: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    gray: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
    lime: 'bg-lime-500/10 text-lime-600 dark:text-lime-400 border-lime-500/20',
  };

  const iconColors: Record<string, string> = {
    blue: 'text-blue-500',
    cyan: 'text-cyan-500',
    pink: 'text-pink-500',
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    red: 'text-red-500',
    purple: 'text-purple-500',
    indigo: 'text-indigo-500',
    orange: 'text-orange-500',
    emerald: 'text-emerald-500',
    teal: 'text-teal-500',
    amber: 'text-amber-500',
    gray: 'text-gray-500',
    lime: 'text-lime-500',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`p-2 sm:p-3 rounded-xl border ${colorClasses[color] || colorClasses.indigo} flex items-center gap-2 group cursor-default`}
    >
      <div className={`p-1 rounded-full group-hover:scale-110 transition-transform duration-200`}>
        <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${iconColors[color] || iconColors.indigo}`} />
      </div>
      <span className="text-xs sm:text-sm font-medium truncate">{name}</span>
    </motion.div>
  );
};

const SocialButton = ({ 
  icon: Icon, 
  label, 
  username, 
  href, 
  bgColor 
}: { 
  icon: React.ElementType; 
  label: string; 
  username: string; 
  href: string; 
  bgColor: string;
}) => {
  const classes = useThemeClasses();
  
  return (
    <motion.a
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl border transition-all duration-200 flex items-center gap-3 group ${classes.bg.card} ${classes.border.primary} ${classes.bg.hover}`}
    >
      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </div>
      <div className="flex-1 text-left min-w-0">
        <span className={`font-medium block text-sm sm:text-base truncate ${classes.text.primary}`}>{label}</span>
        <span className={`text-xs truncate block ${classes.text.muted}`}>{username}</span>
      </div>
      <ArrowLeft className={`w-4 h-4 sm:w-5 sm:h-5 ${classes.icon.secondary} rotate-180 group-hover:translate-x-1 transition-transform flex-shrink-0`} />
    </motion.a>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const DeveloperPage: React.FC = () => {
  const navigate = useNavigate();
  const classes = useThemeClasses();
  const [imgError, setImgError] = useState(false);

  // Ruta de la imagen personalizada
  const developerAvatar = '/src/assets/developer-avatar.png';
  const avatarSrc = imgError || !developerAvatar ? null : developerAvatar;

  // ✅ Tecnologías ACTUALIZADAS - Análisis completo del backend (requirements.txt, config.py, models.py)
  const technologies = [
    // ============================================
    // FRONTEND - React / TypeScript
    // ============================================
    { name: 'React 19', icon: Code, color: 'blue' },
    { name: 'TypeScript 5.9', icon: Braces, color: 'blue' },
    { name: 'Tailwind CSS 3.4', icon: Layout, color: 'cyan' },
    { name: 'Framer Motion 12', icon: Sparkles, color: 'pink' },
    { name: 'Vite 8', icon: Zap, color: 'yellow' },
    { name: 'React Router v7', icon: Layout, color: 'red' },
    { name: 'React Hook Form', icon: FileText, color: 'pink' },
    { name: 'Lucide React', icon: Heart, color: 'red' },
    { name: 'Axios 1.13', icon: Zap, color: 'purple' },
    { name: 'QRCode React', icon: QrCode, color: 'cyan' },
    
    // ============================================
    // BACKEND - FastAPI / Python
    // ============================================
    { name: 'FastAPI 0.115', icon: Server, color: 'green' },
    { name: 'Python 3.14', icon: Code, color: 'blue' },
    { name: 'Uvicorn 0.34', icon: Zap, color: 'yellow' },
    { name: 'Pydantic 2.12', icon: Package, color: 'pink' },
    { name: 'Pydantic Settings', icon: Layers, color: 'purple' },
    { name: 'HTTPX 0.27', icon: Wifi, color: 'teal' },
    { name: 'Python-Multipart', icon: FileText, color: 'orange' },
    { name: 'Email Validator', icon: Mail, color: 'blue' },
    { name: 'Python-dotenv', icon: FileText, color: 'yellow' },
    { name: 'Loguru', icon: FileText, color: 'gray' },
    
    // ============================================
    // BASE DE DATOS Y AUTENTICACIÓN
    // ============================================
    { name: 'Supabase', icon: Database, color: 'emerald' },
    { name: 'PostgreSQL', icon: Database, color: 'blue' },
    { name: 'Supabase Auth', icon: Shield, color: 'purple' },
    { name: 'Supabase Storage', icon: Cloud, color: 'teal' },
    { name: 'Row Level Security', icon: ShieldCheck, color: 'green' },
    { name: 'Real-time', icon: RefreshCw, color: 'purple' },
    
    // ============================================
    // SEGURIDAD - JWT / Passkeys / 2FA
    // ============================================
    { name: 'WebAuthn', icon: Fingerprint, color: 'indigo' },
    { name: 'Passkeys', icon: Fingerprint, color: 'purple' },
    { name: '@simplewebauthn', icon: Binary, color: 'indigo' },
    { name: 'webauthn (Python)', icon: Lock, color: 'emerald' },
    { name: 'PyJWT 2.10', icon: Key, color: 'orange' },
    { name: 'Python-JOSE', icon: Key, color: 'amber' },
    { name: 'Cryptography 44', icon: Lock, color: 'red' },
    
    // ============================================
    // AUTENTICACIÓN 2FA Y OTP (v2.5.0)
    // ============================================
    { name: 'TOTP (2FA)', icon: Smartphone, color: 'amber' },
    { name: 'PyOTP 2.9', icon: Hash, color: 'orange' },
    { name: 'QR Code (SVG)', icon: QrCode, color: 'cyan' },
    { name: 'Google Authenticator', icon: Shield, color: 'green' },
    { name: 'OTP por Email', icon: Mail, color: 'blue' },
    { name: 'Jinja2 Templates', icon: Code, color: 'pink' },
    
    // ============================================
    // SEGURIDAD AVANZADA
    // ============================================
    { name: 'Token Version', icon: LogOut, color: 'red' },
    { name: 'Password History', icon: Clock, color: 'amber' },
    { name: 'Session Management', icon: Monitor, color: 'cyan' },
    { name: 'Email Notifications', icon: Bell, color: 'blue' },
    { name: 'Passlib[bcrypt]', icon: Lock, color: 'green' },
    { name: 'Rate Limiting', icon: Shield, color: 'orange' },
    
    // ============================================
    // SISTEMA DE PAPELERA (v2.3.0)
    // ============================================
    { name: 'Soft Delete', icon: Trash2, color: 'red' },
    { name: 'Trash System', icon: Monitor, color: 'orange' },
    
    // ============================================
    // ESTADÍSTICAS Y UTILIDADES
    // ============================================
    { name: 'Analytics', icon: BarChart, color: 'teal' },
    { name: 'UUID', icon: Hash, color: 'gray' },
  ];

  return (
    <div className={`min-h-screen ${classes.bg.primary}`}>
      {/* Header con estilo glass - Responsive */}
      <div className={`sticky top-0 z-10 backdrop-blur-xl border-b ${classes.bg.card} ${classes.border.primary}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 sm:h-16">
            <div className="flex items-center gap-3 sm:gap-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/configuracion')}
                className={`p-1.5 sm:p-2 rounded-xl transition-colors group ${classes.bg.hover}`}
                aria-label="Volver"
              >
                <ArrowLeft className={`w-5 h-5 sm:w-5 sm:h-5 ${classes.icon.secondary} group-hover:${classes.icon.primary}`} />
              </motion.button>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-1 h-6 sm:w-1.5 sm:h-8 bg-gradient-to-b from-emerald-500 via-teal-500 to-cyan-500 rounded-full" />
                <h1 className={`text-lg sm:text-xl font-bold ${classes.text.primary}`}>
                  Desarrollador
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner principal con gradiente - Responsive */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-3 sm:mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden rounded-xl sm:rounded-2xl shadow-xl"
        >
          <div className="w-full h-full flex flex-col items-center justify-center relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
            {/* Patrón de puntos decorativo */}
            <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] [background-size:20px_20px]" />
            
            <div className="relative z-10 flex flex-col items-center space-y-2 sm:space-y-4 px-4 text-center">
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-2xl tracking-tight">
                TodoApp<span className="text-emerald-300">Manager</span>
              </h2>
              
              {/* Badge de versión */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/30 shadow-2xl"
              >
                <Rocket className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                <span className="text-white font-bold text-xs sm:text-sm md:text-base">
                  Versión 2.5.0
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Avatar posicionado sobre el banner - Responsive */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          className="relative -mt-10 sm:-mt-12 flex justify-center"
        >
          <div className="relative">
            <div className={`w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full p-1 shadow-xl ${classes.bg.card}`}>
              <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center overflow-hidden">
                {avatarSrc ? (
                  <img 
                    src={avatarSrc}
                    alt="Foto de perfil - José Pablo Miranda"
                    className="w-full h-full object-cover rounded-full"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white" />
                )}
              </div>
            </div>
            {/* Badge de verificación */}
            <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-emerald-500 rounded-full p-0.5 sm:p-1 border-2 border-white dark:border-gray-800">
              <Award className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Badge del desarrollador con diseño mejorado */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center"
        >
          <div className="relative">
            {/* Borde con gradiente animado */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
            
            <div className="relative inline-flex flex-col items-center gap-3 px-6 sm:px-8 py-4 sm:py-5 rounded-2xl bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800 shadow-xl">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                </motion.div>
                <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  José Pablo Miranda Quintanilla
                </span>
              </div>
              
              <div className="flex flex-wrap items-center justify-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                  <Code className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Full Stack Developer
                  </span>
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ✅ SECCIÓN "SOBRE EL DESARROLLADOR" - CENTRADA CON ICONO A LA PAR */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-4 sm:mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex justify-center"
        >
          <div className={`max-w-3xl w-full p-5 sm:p-6 rounded-2xl border ${classes.bg.card} ${classes.border.primary} shadow-lg`}>
            {/* ✅ TÍTULO CENTRADO CON ICONO A LA PAR */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl shadow-md">
                <Info className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className={`text-lg sm:text-xl font-bold ${classes.text.primary}`}>
                Sobre el desarrollador
              </h3>
            </div>

            {/* Línea divisoria decorativa */}
            <div className="flex justify-center mb-4">
              <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent rounded-full" />
            </div>

            {/* Contenido */}
            <p className={`text-sm sm:text-base leading-relaxed text-center ${classes.text.muted} max-w-2xl mx-auto`}>
              Desarrollador de software apasionado por crear aplicaciones modernas y seguras. 
              Especializado en{' '}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">React 19</span>,{' '}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">TypeScript</span>,{' '}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">FastAPI</span> y{' '}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Supabase</span>.{' '}
              Experto en sistemas de autenticación avanzada incluyendo{' '}
              <span className="font-semibold text-cyan-600 dark:text-cyan-400">Passkeys (WebAuthn)</span>,{' '}
              <span className="font-semibold text-cyan-600 dark:text-cyan-400">2FA con TOTP</span>,{' '}
              <span className="font-semibold text-cyan-600 dark:text-cyan-400">OTP por email</span> y{' '}
              gestión de sesiones con cierre automático por cambio de contraseña.
            </p>
          </div>
        </motion.div>
      </div>

      {/* ✅ TECNOLOGÍAS UTILIZADAS - ACTUALIZADO CON GRID ORGANIZADO */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-xl border p-4 sm:p-6 ${classes.bg.card} ${classes.border.primary}`}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl shadow-md">
              <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h3 className={`text-lg sm:text-xl font-bold ${classes.text.primary}`}>
              Tecnologías utilizadas
            </h3>
          </div>
          
          {/* Línea divisoria decorativa */}
          <div className="flex justify-center mb-5">
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent rounded-full" />
          </div>

          {/* ✅ Sección: Frontend */}
          <div className="mb-5">
            <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${classes.text.secondary}`}>
              <Layout size={14} className="text-blue-500" />
              Frontend
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
              {technologies.filter(t => ['React 19', 'TypeScript 5.9', 'Tailwind CSS 3.4', 'Framer Motion 12', 'Vite 8', 'React Router v7', 'React Hook Form', 'Lucide React', 'Axios 1.13', 'QRCode React'].includes(t.name)).map((tech, index) => (
                <TechBadge key={`frontend-${index}`} name={tech.name} icon={tech.icon} color={tech.color} />
              ))}
            </div>
          </div>

          {/* ✅ Sección: Backend */}
          <div className="mb-5">
            <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${classes.text.secondary}`}>
              <Server size={14} className="text-green-500" />
              Backend (FastAPI / Python)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
              {technologies.filter(t => ['FastAPI 0.115', 'Python 3.14', 'Uvicorn 0.34', 'Pydantic 2.12', 'Pydantic Settings', 'HTTPX 0.27', 'Python-Multipart', 'Email Validator', 'Python-dotenv', 'Loguru'].includes(t.name)).map((tech, index) => (
                <TechBadge key={`backend-${index}`} name={tech.name} icon={tech.icon} color={tech.color} />
              ))}
            </div>
          </div>

          {/* ✅ Sección: Base de Datos y Autenticación */}
          <div className="mb-5">
            <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${classes.text.secondary}`}>
              <Database size={14} className="text-emerald-500" />
              Base de Datos y Autenticación
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3">
              {technologies.filter(t => ['Supabase', 'PostgreSQL', 'Supabase Auth', 'Supabase Storage', 'Row Level Security', 'Real-time'].includes(t.name)).map((tech, index) => (
                <TechBadge key={`db-${index}`} name={tech.name} icon={tech.icon} color={tech.color} />
              ))}
            </div>
          </div>

          {/* ✅ Sección: Seguridad */}
          <div className="mb-5">
            <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${classes.text.secondary}`}>
              <ShieldCheck size={14} className="text-indigo-500" />
              Seguridad (JWT / Passkeys / 2FA / Hashing)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
              {technologies.filter(t => ['WebAuthn', 'Passkeys', '@simplewebauthn', 'webauthn (Python)', 'PyJWT 2.10', 'Python-JOSE', 'Cryptography 44', 'Passlib[bcrypt]'].includes(t.name)).map((tech, index) => (
                <TechBadge key={`security-${index}`} name={tech.name} icon={tech.icon} color={tech.color} />
              ))}
            </div>
          </div>

          {/* ✅ Sección: 2FA y OTP */}
          <div className="mb-5">
            <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${classes.text.secondary}`}>
              <Smartphone size={14} className="text-amber-500" />
              2FA (TOTP) y OTP por Email
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
              {technologies.filter(t => ['TOTP (2FA)', 'PyOTP 2.9', 'QR Code (SVG)', 'Google Authenticator', 'OTP por Email', 'Jinja2 Templates', 'Rate Limiting'].includes(t.name)).map((tech, index) => (
                <TechBadge key={`2fa-${index}`} name={tech.name} icon={tech.icon} color={tech.color} />
              ))}
            </div>
          </div>

          {/* ✅ Sección: Otras funcionalidades */}
          <div>
            <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${classes.text.secondary}`}>
              <Layers size={14} className="text-purple-500" />
              Funcionalidades Avanzadas
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
              {technologies.filter(t => ['Token Version', 'Password History', 'Session Management', 'Email Notifications', 'Soft Delete', 'Trash System', 'Analytics', 'UUID'].includes(t.name)).map((tech, index) => (
                <TechBadge key={`features-${index}`} name={tech.name} icon={tech.icon} color={tech.color} />
              ))}
            </div>
          </div>

          {/* Contador de tecnologías */}
          <div className={`mt-5 pt-4 border-t ${classes.border.primary}`}>
            <p className={`text-xs text-center ${classes.text.muted}`}>
              <span className="font-bold text-emerald-500">{technologies.length}</span> tecnologías utilizadas para el desarrollo de TodoAppManager v2.5.0
            </p>
          </div>
        </motion.div>
      </div>

      {/* Sección "Conectar conmigo" - Responsive */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`border-t pt-6 sm:pt-8 ${classes.border.primary}`}
        >
          <h3 className={`text-xs sm:text-sm font-medium uppercase tracking-wider mb-3 sm:mb-4 text-center ${classes.text.secondary}`}>
            Conectar conmigo
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <SocialButton
              icon={Github}
              label="GitHub"
              username="@JosePablo1996"
              href="https://github.com/JosePablo1996"
              bgColor="bg-gray-900"
            />

            <SocialButton
              icon={Mail}
              label="Email"
              username="pabloquintanilla988@gmail.com"
              href="mailto:pabloquintanilla988@gmail.com"
              bgColor="bg-red-500"
            />

            <SocialButton
              icon={Globe}
              label="Website"
              username="jose-pablo-dev.com"
              href="https://jose-pablo-dev.com"
              bgColor="bg-purple-600"
            />

            <SocialButton
              icon={Coffee}
              label="Buy me a coffee"
              username="@jose_pablo"
              href="https://buymeacoffee.com/jose_pablo"
              bgColor="bg-amber-600"
            />
          </div>
        </motion.div>
      </div>

      {/* FOOTER - Diseño refinado y minimalista */}
      <div className="w-full mt-8 sm:mt-12 pb-6 sm:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center w-full px-3 sm:px-6"
        >
          <div className={`w-full max-w-5xl flex flex-col items-center gap-4 sm:gap-5 px-6 sm:px-10 py-6 sm:py-8 rounded-xl sm:rounded-2xl border ${classes.bg.card} ${classes.border.primary} shadow-sm`}>
            {/* Línea superior decorativa sutil */}
            <div className="w-20 sm:w-24 h-0.5 bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent"></div>
            
            {/* Badge de versión refinado */}
            <motion.span 
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20"
            >
              <Rocket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500/70" />
              <span className="text-sm sm:text-base font-medium text-emerald-600 dark:text-emerald-400">Versión 2.5.0</span>
            </motion.span>
            
            {/* Información del desarrollador - Estilo limpio */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className={`text-sm sm:text-base font-medium ${classes.text.primary}`}>
                  TodoAppManager
                </span>
                <span className={`text-xs sm:text-sm ${classes.text.muted}`}>·</span>
                <span className={`text-xs sm:text-sm ${classes.text.muted}`}>
                  Desarrollado por
                </span>
              </div>
              <span className="text-sm sm:text-base font-semibold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                José Pablo Miranda Quintanilla
              </span>
            </div>
            
            {/* Línea divisoria sutil */}
            <div className="w-16 sm:w-20 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
            
            {/* Copyright */}
            <p className={`text-center text-xs sm:text-sm ${classes.text.muted} opacity-60`}>
              © 2026 Todos los derechos reservados
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DeveloperPage;