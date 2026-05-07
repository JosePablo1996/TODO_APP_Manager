// src/auth/LoginPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthContext } from '../context/AuthContext';
import { PasskeyLoginButton } from '../components/webauthn/PasskeyLoginButton';
import { TwoFactorVerification } from './TwoFactorVerification';
import { 
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Zap,
  Star,
  Calendar,
  Target,
  Fingerprint,
  Smartphone,
  KeyRound,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  ShieldCheck,
  ShieldAlert,
  ShieldX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginForm {
  email: string;
  password: string;
}

interface ApiError {
  response?: {
    data?: {
      detail?: string;
      error_description?: string;
      error?: string;
    };
    status?: number;
  };
  message?: string;
  detail?: string;
}

type LoginStep = 'credentials' | '2fa';
type PasswordStrength = 'empty' | 'weak' | 'medium' | 'strong' | 'very-strong';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthContext();
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passkeySuccessMessage, setPasskeySuccessMessage] = useState('');
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);
  const [showAlternativeMethods, setShowAlternativeMethods] = useState(false);
  const [selectedAlternativeMethod, setSelectedAlternativeMethod] = useState<'none' | 'passkey'>('none');
  const [passwordValue, setPasswordValue] = useState('');
  
  // ✅ Detectar si es desarrollo local
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.includes('192.168.');
  
  // Estado para 2FA
  const [loginStep, setLoginStep] = useState<LoginStep>('credentials');
  const [pendingCredentials, setPendingCredentials] = useState<{ 
    email: string; 
    password: string;
    userAvatar?: string;
    userFullName?: string;
  } | null>(null);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<LoginForm>();

  const watchedPassword = watch('password', '');
  
  useEffect(() => {
    setPasswordValue(watchedPassword);
  }, [watchedPassword]);

  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => document.body.classList.remove('auth-page');
  }, []);

  useEffect(() => {
    const state = location.state as { sessionExpired?: boolean; message?: string } | null;
    if (state?.sessionExpired) {
      const message = state.message || 'Tu sesión expiró por cambio de contraseña. Por favor, inicia sesión nuevamente.';
      setSessionExpiredMessage(message);
      window.history.replaceState({}, document.title);
      
      const timer = setTimeout(() => {
        setSessionExpiredMessage(null);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPasswordStrength = useCallback((password: string): PasswordStrength => {
    if (!password) return 'empty';
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 2;
    
    const hasUpperAndLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
    const hasLettersAndNumbers = /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
    const hasSpecialAndAnything = /[^a-zA-Z0-9]/.test(password);
    
    if (hasUpperAndLower) score += 1;
    if (hasLettersAndNumbers) score += 1;
    if (hasSpecialAndAnything) score += 1;
    
    if (score <= 3) return 'weak';
    if (score <= 6) return 'medium';
    if (score <= 9) return 'strong';
    return 'very-strong';
  }, []);

  const strengthConfig = {
    empty: { label: '', color: 'bg-gray-300 dark:bg-gray-600', textColor: 'text-gray-500', icon: null, percentage: 0 },
    weak: { label: 'Débil', color: 'bg-red-500', textColor: 'text-red-500', icon: ShieldX, percentage: 25 },
    medium: { label: 'Media', color: 'bg-yellow-500', textColor: 'text-yellow-500', icon: ShieldAlert, percentage: 50 },
    strong: { label: 'Fuerte', color: 'bg-emerald-500', textColor: 'text-emerald-500', icon: ShieldCheck, percentage: 75 },
    'very-strong': { label: 'Muy Fuerte', color: 'bg-cyan-500', textColor: 'text-cyan-500', icon: ShieldCheck, percentage: 100 }
  };

  const currentStrength = getPasswordStrength(passwordValue);
  const strength = strengthConfig[currentStrength];
  const StrengthIcon = strength.icon;

  // ============================================
  // MANEJO DEL ENVÍO DEL FORMULARIO
  // ============================================
  const onSubmit = async (data: LoginForm): Promise<void> => {
    try {
      setError('');
      setPasskeySuccessMessage('');
      setSessionExpiredMessage(null);
      setLocalLoading(true);
      
      console.log('📤 LoginPage: Enviando credenciales...');
      const response = await login({ email: data.email, password: data.password });
      
      console.log('📥 LoginPage: Respuesta recibida:', JSON.stringify(response, null, 2));
      
      if (response && response.requires_2fa) {
        console.log('🔐 LoginPage: ¡Se requiere 2FA! Cambiando a paso 2FA...');
        
        const userData = response.user;
        
        setPendingCredentials({ 
          email: data.email, 
          password: data.password,
          userAvatar: userData?.avatar,
          userFullName: userData?.full_name
        });
        
        setLocalLoading(false);
        
        setTimeout(() => {
          setLoginStep('2fa');
        }, 100);
        
        return;
      }
      
      console.log('✅ LoginPage: Login exitoso, redirigiendo...');
      setLocalLoading(false);
      navigate('/', { replace: true });
      
    } catch (err: unknown) {
      const apiError = err as ApiError;
      console.error('❌ LoginPage: Error en login:', apiError);
      
      const errorMessage = 
        apiError.response?.data?.detail ||
        apiError.response?.data?.error_description ||
        apiError.detail ||
        apiError.message || 
        'Error al iniciar sesión. Verifica tus credenciales.';
      
      setError(errorMessage);
      setLocalLoading(false);
    }
  };

  const handle2FASuccess = useCallback((): void => {
    console.log('🔐 LoginPage: 2FA exitoso, redirigiendo...');
    setPendingCredentials(null);
    setLoginStep('credentials');
    navigate('/', { replace: true });
  }, [navigate]);

  const handle2FABack = useCallback((): void => {
    console.log('🔐 LoginPage: Volviendo al login desde 2FA');
    setLoginStep('credentials');
    setPendingCredentials(null);
    setError('');
    setLocalLoading(false);
  }, []);

  const handlePasskeySuccess = useCallback((): void => {
    setPasskeySuccessMessage('✅ Inicio de sesión exitoso con passkey. Redirigiendo...');
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 1500);
  }, [navigate]);

  const handlePasskeyError = useCallback((errorMessage: string): void => {
    setError(errorMessage);
  }, []);

  const togglePasswordVisibility = useCallback((): void => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleAlternativeMethods = useCallback((): void => {
    setShowAlternativeMethods(prev => {
      if (!prev) {
        setSelectedAlternativeMethod('none');
      }
      return !prev;
    });
  }, []);

  const selectAlternativeMethod = useCallback((method: 'passkey'): void => {
    setSelectedAlternativeMethod(method);
  }, []);

  console.log('📍 LoginPage render:', { 
    loginStep, 
    hasPendingCredentials: !!pendingCredentials,
    localLoading,
    error: error ? 'Sí' : 'No',
    isLocalhost
  });

  // ============================================
  // RENDERIZADO CONDICIONAL PARA 2FA
  // ============================================
  if (loginStep === '2fa' && pendingCredentials && !localLoading) {
    console.log('🔐 LoginPage: Renderizando TwoFactorVerification con:', {
      email: pendingCredentials.email,
      hasAvatar: !!pendingCredentials.userAvatar,
      hasFullName: !!pendingCredentials.userFullName
    });
    return (
      <TwoFactorVerification
        email={pendingCredentials.email}
        password={pendingCredentials.password}
        userAvatar={pendingCredentials.userAvatar}
        userFullName={pendingCredentials.userFullName}
        onSuccess={handle2FASuccess}
        onError={(errorMsg) => setError(errorMsg)}
        onBack={handle2FABack}
      />
    );
  }

  const benefits = [
    { icon: <CheckCircle size={20} />, title: 'Acceso instantáneo', desc: 'Tus tareas siempre disponibles', color: 'from-emerald-500 to-teal-500' },
    { icon: <Fingerprint size={20} />, title: 'Acceso con Passkey', desc: 'Inicia sesión con huella digital o Face ID', color: 'from-blue-500 to-indigo-500' },
    { icon: <KeyRound size={20} />, title: 'Código por email', desc: 'Recibe un código de 6 dígitos', color: 'from-purple-500 to-pink-500' },
    { icon: <Shield size={20} />, title: 'Autenticación 2FA', desc: 'Protección con Google Authenticator', color: 'from-orange-500 to-red-500' },
    { icon: <Zap size={20} />, title: 'Sincronización', desc: 'Accede desde cualquier dispositivo', color: 'from-yellow-500 to-amber-500' },
    { icon: <Star size={20} />, title: 'Tareas favoritas', desc: 'Marca tus tareas más importantes', color: 'from-pink-500 to-rose-500' },
    { icon: <Calendar size={20} />, title: 'Calendario', desc: 'Visualiza tus tareas por fecha', color: 'from-cyan-500 to-blue-500' },
    { icon: <Target size={20} />, title: 'Estadísticas', desc: 'Sigue tu progreso y productividad', color: 'from-green-500 to-emerald-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/20 dark:bg-gray-800/50 backdrop-blur-2xl border border-white/30 dark:border-gray-700/50 rounded-3xl shadow-2xl p-6 lg:p-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-3xl"></div>
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-400/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-cyan-400/20 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              
              <div className="flex-1">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="flex flex-col items-center text-center mb-6"
                >
                  <div className="flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl shadow-2xl relative mb-3">
                    <div className="absolute inset-0 bg-white/20 rounded-2xl backdrop-blur-sm"></div>
                    <Sparkles className="h-8 w-8 lg:h-10 lg:w-10 text-white relative z-10" />
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-white">TodoAppManager</h1>
                    <p className="text-sm lg:text-base text-white/70 mt-1">Supabase Edition</p>
                  </div>
                </motion.div>

                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl lg:text-3xl font-bold text-white mb-3 tracking-tight text-center"
                >
                  Bienvenido de vuelta
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-emerald-100 dark:text-gray-300 text-base lg:text-lg font-light mb-8 text-center max-w-md mx-auto"
                >
                  Organiza tus tareas y alcanza tus metas de manera fácil y rápida
                </motion.p>

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
                          <span className="text-white">{benefit.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-sm lg:text-base truncate">{benefit.title}</h3>
                          <p className="text-xs text-emerald-100 dark:text-gray-400 line-clamp-2">{benefit.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex-1 w-full max-w-md mx-auto lg:mx-0"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-200 dark:border-gray-700">
                  
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl mb-4 shadow-lg">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Iniciar sesión</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ingresa tus credenciales para continuar</p>
                  </div>

                  <AnimatePresence>
                    {sessionExpiredMessage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        className="mb-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg overflow-hidden"
                      >
                        <div className="p-3">
                          <div className="flex items-start gap-3">
                            <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-orange-800 dark:text-orange-300 font-medium text-sm">{sessionExpiredMessage}</p>
                              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Por favor, inicia sesión nuevamente</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-4 text-sm flex items-center"
                      >
                        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {passkeySuccessMessage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg mb-4 text-sm flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{passkeySuccessMessage}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ============================================ */}
                  {/* FORMULARIO DE LOGIN */}
                  {/* ============================================ */}
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1.5" htmlFor="email">
                        Correo electrónico
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
                        <input
                          id="email"
                          type="email"
                          {...register('email', { 
                            required: 'El email es requerido',
                            pattern: { 
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                              message: 'Email inválido' 
                            }
                          })}
                          className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all duration-200"
                          placeholder="ejemplo@correo.com"
                          disabled={localLoading}
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center">
                          <AlertCircle size={12} className="mr-1" />
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1.5" htmlFor="password">
                        Contraseña
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5 z-10" />
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          {...register('password', { 
                            required: 'La contraseña es requerida',
                            minLength: { value: 8, message: 'Mínimo 8 caracteres' }
                          })}
                          className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg pl-10 pr-12 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all duration-200"
                          placeholder="••••••••"
                          disabled={localLoading}
                        />
                        <motion.button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none p-1 z-10"
                          disabled={localLoading}
                          whileTap={{ scale: 0.9 }}
                        >
                          {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                        </motion.button>
                      </div>
                      {passwordValue && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              {StrengthIcon && <StrengthIcon className={`w-4 h-4 ${strength.textColor}`} />}
                              <span className={`text-xs font-medium ${strength.textColor}`}>{strength.label}</span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{passwordValue.length} caracteres</span>
                          </div>
                          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${strength.percentage}%` }}
                              transition={{ duration: 0.3 }}
                              className={`absolute inset-y-0 left-0 ${strength.color} rounded-full`}
                            />
                          </div>
                        </motion.div>
                      )}
                      {errors.password && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center">
                          <AlertCircle size={12} className="mr-1" />
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <Link to="/forgot-password" className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline inline-flex items-center transition-colors">
                        <Lock size={14} className="mr-1" />
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={localLoading}
                      className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group shadow-md hover:shadow-lg"
                    >
                      {localLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                          Iniciando...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          Iniciar sesión
                          <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </motion.button>

                    {/* ✅ Botón "Más opciones" - SOLO EN LOCALHOST */}
                    {isLocalhost && (
                      <div className="relative">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={toggleAlternativeMethods}
                          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                            showAlternativeMethods
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                              : 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 text-purple-700 dark:text-purple-300 border-2 border-purple-300 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500'
                          }`}
                        >
                          <MoreHorizontal size={18} className={showAlternativeMethods ? 'text-white' : 'text-purple-500'} />
                          <span className={showAlternativeMethods ? 'text-white' : ''}>Más opciones de inicio de sesión</span>
                          {showAlternativeMethods ? <ChevronUp size={18} className="text-white" /> : <ChevronDown size={18} className="text-purple-500" />}
                        </motion.button>
                      </div>
                    )}

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">¿Nuevo en TodoAppManager?</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <Link to="/register" className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium text-sm hover:underline group transition-colors">
                        Crear una cuenta nueva
                        <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </form>
                  {/* ✅ FIN DEL FORMULARIO DE LOGIN */}

                  {/* ============================================ */}
                  {/* ✅ DROPDOWN DE MÉTODOS ALTERNATIVOS - SOLO EN LOCALHOST */}
                  {/* ============================================ */}
                  {isLocalhost && (
                    <AnimatePresence>
                      {showAlternativeMethods && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: 'auto', y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="mt-3 overflow-hidden"
                        >
                          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-700 space-y-3">
                            <p className="text-xs text-center text-purple-600 dark:text-purple-400 font-medium mb-1">Selecciona un método alternativo</p>
                            
                            {/* ✅ Botón Passkey */}
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => selectAlternativeMethod('passkey')}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                                selectedAlternativeMethod === 'passkey'
                                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25'
                                  : 'bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                              }`}
                            >
                              <div className={`p-2.5 rounded-xl ${selectedAlternativeMethod === 'passkey' ? 'bg-white/20' : 'bg-blue-500/10'}`}>
                                <Fingerprint size={20} className={selectedAlternativeMethod === 'passkey' ? 'text-white' : 'text-blue-500'} />
                              </div>
                              <div className="flex-1 text-left">
                                <span className={`font-semibold text-sm ${selectedAlternativeMethod === 'passkey' ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>Passkey</span>
                                <p className={`text-xs ${selectedAlternativeMethod === 'passkey' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>Huella digital, Face ID o PIN</p>
                              </div>
                              {selectedAlternativeMethod === 'passkey' && <CheckCircle size={18} className="text-white" />}
                            </motion.button>

                            {/* ✅ Botón OTP */}
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => navigate('/email-otp')}
                              className="w-full flex items-center gap-3 p-3 rounded-xl transition-all bg-white dark:bg-gray-800 border-2 border-emerald-200 dark:border-emerald-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            >
                              <div className="p-2.5 rounded-xl bg-emerald-500/10">
                                <Smartphone size={20} className="text-emerald-500" />
                              </div>
                              <div className="flex-1 text-left">
                                <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">Código OTP</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Recibe un código por email</p>
                              </div>
                              <ArrowRight size={16} className="text-emerald-500" />
                            </motion.button>

                            {/* ✅ Passkey (si se selecciona) */}
                            <AnimatePresence>
                              {selectedAlternativeMethod === 'passkey' && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-3">
                                  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-blue-200 dark:border-blue-700 shadow-inner">
                                    <PasskeyLoginButton onSuccess={handlePasskeySuccess} onError={handlePasskeyError} variant="outline" size="md" fullWidth showIcon />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                  
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;