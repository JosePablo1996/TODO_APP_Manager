import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import {
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Shield,
  Lock,
  ArrowLeft,
  RefreshCw,
  XCircle,
  LogOut,
  Fingerprint,
  Target,
  Calendar,
  Zap,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ApiErrorResponse {
  detail?: string;
  message?: string;
  status?: number;
}

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [token, setToken] = useState<string | null>(null);
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => document.body.classList.remove('auth-page');
  }, []);

  useEffect(() => {
    const extractTokenFromHash = () => {
      const hash = window.location.hash.substring(1);
      
      if (!hash) {
        setValidToken(false);
        setCheckingToken(false);
        return;
      }
      
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const type = params.get('type');
      
      if (accessToken && type === 'recovery') {
        setToken(accessToken);
        setValidToken(true);
      } else {
        setValidToken(false);
      }
      
      setCheckingToken(false);
    };
    
    extractTokenFromHash();
  }, []);

  const calculatePasswordStrength = (pass: string): number => {
    let strength = 0;
    
    if (pass.length >= 8) strength += 20;
    if (/[a-z]/.test(pass)) strength += 20;
    if (/[A-Z]/.test(pass)) strength += 20;
    if (/[0-9]/.test(pass)) strength += 20;
    if (/[^a-zA-Z0-9]/.test(pass)) strength += 20;
    
    return Math.min(strength, 100);
  };

  const validatePassword = (pass: string): boolean => {
    const hasMinLength = pass.length >= 8;
    const hasLower = /[a-z]/.test(pass);
    const hasUpper = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSymbol = /[^a-zA-Z0-9]/.test(pass);
    
    return hasMinLength && hasLower && hasUpper && hasNumber && hasSymbol;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStrength = calculatePasswordStrength(e.target.value);
    setPasswordStrength(newStrength);
  };

  const getStrengthBarClass = (): string => {
    if (passwordStrength < 40) return 'bg-red-500';
    if (passwordStrength < 60) return 'bg-orange-500';
    if (passwordStrength < 80) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getStrengthText = (): string => {
    if (passwordStrength < 40) return 'Débil';
    if (passwordStrength < 60) return 'Regular';
    if (passwordStrength < 80) return 'Buena';
    return 'Excelente';
  };

  const getStrengthTextClass = (): string => {
    if (passwordStrength < 40) return 'text-red-400';
    if (passwordStrength < 60) return 'text-orange-400';
    if (passwordStrength < 80) return 'text-yellow-400';
    return 'text-emerald-400';
  };

  const validateBeforeConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!validatePassword(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos');
      return;
    }

    if (!token) {
      setError('Token no encontrado. Por favor, solicita un nuevo enlace de recuperación.');
      return;
    }

    setError('');
    setShowConfirmDialog(true);
  };

  const executePasswordChange = async () => {
    if (!token) return;
    
    setLoading(true);
    setError('');

    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
      
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_expires_at');
      
      window.dispatchEvent(new CustomEvent('auth-change'));
      
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: unknown) {
      const errorData = err as ApiErrorResponse;
      
      let errorMessage = 'Error al restablecer la contraseña';
      
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const handleConfirmChange = () => {
    setShowConfirmDialog(false);
    executePasswordChange();
  };

  const handleCancelChange = () => {
    setShowConfirmDialog(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    validateBeforeConfirm(e);
  };

  // Beneficios en grid (coherente con otras páginas)
  const benefits = [
    {
      icon: <Lock size={20} />,
      title: 'Mínimo 8 caracteres',
      desc: 'Usa una contraseña larga y segura',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: <Shield size={20} />,
      title: 'Combina caracteres',
      desc: 'Mayúsculas, minúsculas, números y símbolos',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: <CheckCircle size={20} />,
      title: 'Evita patrones',
      desc: 'No uses información personal',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Fingerprint size={20} />,
      title: 'Contraseña única',
      desc: 'No la reutilices en otros sitios',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: <Calendar size={20} />,
      title: 'Calendario',
      desc: 'Visualiza tus tareas por fecha',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: <Target size={20} />,
      title: 'Estadísticas',
      desc: 'Sigue tu progreso',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Zap size={20} />,
      title: 'Sincronización',
      desc: 'Accede desde cualquier dispositivo',
      color: 'from-yellow-500 to-amber-500'
    },
    {
      icon: <Mail size={20} />,
      title: 'Notificaciones',
      desc: 'Recibe alertas de seguridad',
      color: 'from-pink-500 to-rose-500'
    }
  ];

  if (checkingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl mb-6 shadow-lg animate-pulse">
            <RefreshCw size={40} className="text-white animate-spin" />
          </div>
          <p className="text-white dark:text-gray-200 text-lg font-medium">Verificando enlace de seguridad...</p>
        </motion.div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-8 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-gray-200 dark:border-gray-700">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl mb-6 shadow-lg">
              <XCircle size={40} className="text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Enlace inválido</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              El enlace de restablecimiento no es válido o ha expirado.
            </p>
            
            <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 dark:border-amber-400 p-4 rounded-lg text-left mb-6">
              <p className="text-sm text-amber-700 dark:text-amber-400 flex items-start">
                <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
                <span>
                  Los enlaces de recuperación expiran después de 1 hora por seguridad. 
                  Solicita uno nuevo para continuar.
                </span>
              </p>
            </div>

            <Link
              to="/forgot-password"
              className="inline-flex items-center justify-center w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg group"
            >
              <RefreshCw size={18} className="mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Solicitar nuevo enlace
            </Link>

            <div className="mt-4">
              <Link 
                to="/login" 
                className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium text-sm hover:underline group"
              >
                <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-8 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-gray-200 dark:border-gray-700">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl mb-6 shadow-lg"
            >
              <CheckCircle size={40} className="text-white" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">¡Contraseña actualizada!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Tu contraseña ha sido cambiada exitosamente.
            </p>
            
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 mb-6">
              <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <RefreshCw size={16} className="mr-2 animate-spin" />
                Serás redirigido al inicio de sesión...
              </p>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg group"
            >
              Ir al inicio de sesión
              <ArrowLeft size={18} className="ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/20 dark:bg-gray-800/50 backdrop-blur-2xl border border-white/30 dark:border-gray-700/50 rounded-3xl shadow-2xl p-6 lg:p-8 relative overflow-hidden"
          >
            {/* Efectos de fondo decorativos */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-3xl"></div>
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-400/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-cyan-400/20 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                
                {/* ============================================ */}
                {/* LADO IZQUIERDO - BENEFICIOS EN GRID */}
                {/* ============================================ */}
                <div className="flex-1">
                  {/* Logo y título - CENTRADOS */}
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="flex flex-col items-center text-center mb-6"
                  >
                    <div className="flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl shadow-2xl relative mb-3">
                      <div className="absolute inset-0 bg-white/20 rounded-2xl backdrop-blur-sm"></div>
                      <KeyRound className="h-8 w-8 lg:h-10 lg:w-10 text-white relative z-10" />
                    </div>
                    <div>
                      <h1 className="text-4xl lg:text-5xl font-bold text-white">
                        TodoAppManager
                      </h1>
                      <p className="text-sm lg:text-base text-white/70 mt-1">Supabase Edition</p>
                    </div>
                  </motion.div>

                  <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl lg:text-3xl font-bold text-white mb-3 tracking-tight text-center"
                  >
                    Crea una contraseña segura
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-emerald-100 dark:text-gray-300 text-base lg:text-lg font-light mb-8 text-center max-w-md mx-auto"
                  >
                    Protege tu cuenta con una contraseña fuerte y única
                  </motion.p>

                  {/* Beneficios en grid */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    {benefits.map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer group"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`bg-gradient-to-br ${benefit.color} p-2 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <span className="text-white">
                              {benefit.icon}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white text-sm lg:text-base truncate">
                              {benefit.title}
                            </h3>
                            <p className="text-xs text-emerald-100 dark:text-gray-400 line-clamp-2">
                              {benefit.desc}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* ============================================ */}
                {/* LADO DERECHO - FORMULARIO */}
                {/* ============================================ */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex-1 w-full max-w-md mx-auto lg:mx-0"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-200 dark:border-gray-700">
                    
                    {/* Header del formulario */}
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl mb-4 shadow-lg">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Nueva contraseña
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Ingresa tu nueva contraseña segura
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Mensaje de error */}
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center"
                          >
                            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span>{error}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Nueva Contraseña */}
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1.5" htmlFor="password">
                          Nueva contraseña
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5 z-10" />
                          <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              handlePasswordChange(e);
                            }}
                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg pl-10 pr-12 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all duration-200"
                            placeholder="••••••••"
                            disabled={loading}
                          />
                          <motion.button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none p-1 z-10"
                            disabled={loading}
                            whileTap={{ scale: 0.9 }}
                          >
                            <AnimatePresence mode="wait" initial={false}>
                              {showPassword ? (
                                <motion.div
                                  key="eye-open"
                                  initial={{ opacity: 0, rotate: -90 }}
                                  animate={{ opacity: 1, rotate: 0 }}
                                  exit={{ opacity: 0, rotate: 90 }}
                                  transition={{ duration: 0.15 }}
                                >
                                  <Eye className="h-5 w-5" />
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="eye-closed"
                                  initial={{ opacity: 0, rotate: 90 }}
                                  animate={{ opacity: 1, rotate: 0 }}
                                  exit={{ opacity: 0, rotate: -90 }}
                                  transition={{ duration: 0.15 }}
                                >
                                  <EyeOff className="h-5 w-5" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        </div>

                        {/* Barra de fortaleza */}
                        {password && password.length > 0 && (
                          <motion.div 
                            className="mt-3"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1">
                                <Shield size={12} className={passwordStrength < 40 ? 'text-red-400' : passwordStrength < 60 ? 'text-orange-400' : passwordStrength < 80 ? 'text-yellow-400' : 'text-emerald-400'} />
                                <span className="text-xs text-gray-500 dark:text-gray-400">Seguridad:</span>
                              </div>
                              <span className={`text-xs font-medium ${getStrengthTextClass()}`}>
                                {getStrengthText()}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${getStrengthBarClass()} transition-all duration-300`}
                                style={{ width: `${passwordStrength}%` }}
                              />
                            </div>
                            <div className="grid grid-cols-5 gap-1 mt-2">
                              {[
                                { label: '8+', test: password?.length >= 8 },
                                { label: 'a-z', test: /[a-z]/.test(password) },
                                { label: 'A-Z', test: /[A-Z]/.test(password) },
                                { label: '0-9', test: /[0-9]/.test(password) },
                                { label: '!@#', test: /[^a-zA-Z0-9]/.test(password) }
                              ].map((item, index) => (
                                <div key={index} className={`text-center ${item.test ? 'text-emerald-500' : 'text-gray-400 dark:text-gray-600'}`}>
                                  <CheckCircle size={12} className="mx-auto mb-0.5" />
                                  <span className="text-[0.6rem]">{item.label}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Confirmar Contraseña */}
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1.5" htmlFor="confirmPassword">
                          Confirmar contraseña
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5 z-10" />
                          <input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg pl-10 pr-12 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all duration-200"
                            placeholder="••••••••"
                            disabled={loading}
                          />
                          <motion.button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none p-1 z-10"
                            disabled={loading}
                            whileTap={{ scale: 0.9 }}
                          >
                            <AnimatePresence mode="wait" initial={false}>
                              {showConfirmPassword ? (
                                <motion.div
                                  key="eye-open"
                                  initial={{ opacity: 0, rotate: -90 }}
                                  animate={{ opacity: 1, rotate: 0 }}
                                  exit={{ opacity: 0, rotate: 90 }}
                                  transition={{ duration: 0.15 }}
                                >
                                  <Eye className="h-5 w-5" />
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="eye-closed"
                                  initial={{ opacity: 0, rotate: 90 }}
                                  animate={{ opacity: 1, rotate: 0 }}
                                  exit={{ opacity: 0, rotate: -90 }}
                                  transition={{ duration: 0.15 }}
                                >
                                  <EyeOff className="h-5 w-5" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        </div>
                      </div>

                      {/* Tarjeta informativa sobre cierre de sesiones */}
                      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-orange-500 rounded-full p-1.5 mt-0.5">
                            <LogOut size={14} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">
                              ⚠️ Al cambiar tu contraseña:
                            </p>
                            <ul className="text-xs text-orange-600 dark:text-orange-400 mt-1 space-y-0.5 list-disc list-inside">
                              <li>Se cerrarán TODAS tus sesiones activas</li>
                              <li>Deberás iniciar sesión nuevamente</li>
                              <li>Recibirás una notificación por email</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Botón de actualización */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group shadow-md hover:shadow-lg"
                      >
                        {loading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                            Actualizando...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            Actualizar contraseña
                            <CheckCircle size={16} className="ml-2 group-hover:scale-110 transition-transform" />
                          </span>
                        )}
                      </motion.button>

                      {/* Separador */}
                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                            ¿Cambiaste de opinión?
                          </span>
                        </div>
                      </div>

                      {/* Enlace a login */}
                      <div className="text-center">
                        <Link 
                          to="/login" 
                          className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium text-sm hover:underline group transition-colors"
                        >
                          <ArrowLeft size={14} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                          Cancelar y volver al inicio de sesión
                        </Link>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Diálogo de confirmación */}
      <AnimatePresence>
        {showConfirmDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
            onClick={handleCancelChange}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-full p-2">
                    <LogOut className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">¿Cerrar todas las sesiones activas?</h3>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Al cambiar tu contraseña, se cerrarán <strong>TODAS</strong> tus sesiones activas en todos los dispositivos.
                </p>
                
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-6">
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    <strong>Importante:</strong> Después del cambio, deberás iniciar sesión nuevamente con tu nueva contraseña en todos tus dispositivos.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCancelChange}
                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmChange}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg"
                  >
                    <LogOut size={16} />
                    <span>Continuar</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ResetPasswordPage;