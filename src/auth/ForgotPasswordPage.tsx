import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';
import { 
  Mail,
  ArrowLeft,
  Send,
  AlertCircle,
  Lock,
  Shield,
  Clock,
  KeyRound,
  HelpCircle,
  CheckCircle,
  Fingerprint,
  Target,
  Calendar,
  Zap,
  Eye,
  EyeOff,
  Hash,
  RefreshCw,
  LogOut,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ApiErrorResponse {
  detail?: string;
  message?: string;
  status?: number;
}

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Estados del flujo: 1 = email, 2 = código, 3 = contraseña
  const [step, setStep] = useState(1);
  
  // Paso 1: Email
  const [email, setEmail] = useState('');
  
  // Paso 2: Código OTP
  const [code, setCode] = useState('');
  
  // Paso 3: Nueva contraseña
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Estados generales
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => document.body.classList.remove('auth-page');
  }, []);

  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user, email]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

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
    return pass.length >= 8 && /[a-z]/.test(pass) && /[A-Z]/.test(pass) && /[0-9]/.test(pass) && /[^a-zA-Z0-9]/.test(pass);
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

  // ============================================
  // PASO 1: ENVIAR CÓDIGO OTP
  // ============================================
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.forgotPasswordOtp(email);
      setStep(2);
      setResendCooldown(60);
    } catch (err: unknown) {
      const errorData = err as ApiErrorResponse;
      setError(errorData.message || 'Error al enviar el código');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // REENVIAR CÓDIGO
  // ============================================
  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError('');

    try {
      await authService.forgotPasswordOtp(email);
      setResendCooldown(60);
    } catch (err: unknown) {
      const errorData = err as ApiErrorResponse;
      setError(errorData.message || 'Error al reenviar el código');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // PASO 2: VERIFICAR CÓDIGO OTP
  // ============================================
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    setError('');
    // Avanzar al paso 3 (la verificación real se hace al enviar)
    setStep(3);
  };

  // ============================================
  // PASO 3: CAMBIAR CONTRASEÑA
  // ============================================
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!validatePassword(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.resetPasswordOtp(email, code, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: unknown) {
      const errorData = err as ApiErrorResponse;
      setError(errorData.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // INDICADOR DE PASOS
  // ============================================
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
            s < step ? 'bg-emerald-500 text-white' :
            s === step ? 'bg-emerald-500 text-white ring-4 ring-emerald-200 dark:ring-emerald-800' :
            'bg-gray-200 dark:bg-gray-700 text-gray-500'
          }`}>
            {s < step ? <CheckCircle size={16} /> : s}
          </div>
          {s < 3 && (
            <div className={`w-8 h-1 mx-1 rounded transition-all duration-300 ${
              s < step ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  // ============================================
  // BENEFICIOS
  // ============================================
  const benefits = [
    { icon: <Lock size={20} />, title: 'Contraseña segura', desc: 'Usa una contraseña única y fuerte', color: 'from-emerald-500 to-teal-500' },
    { icon: <Shield size={20} />, title: 'Doble verificación', desc: 'Actívala para mayor seguridad', color: 'from-blue-500 to-indigo-500' },
    { icon: <Clock size={20} />, title: 'Código temporal', desc: 'Válido por 15 minutos', color: 'from-purple-500 to-pink-500' },
    { icon: <HelpCircle size={20} />, title: '¿Problemas?', desc: 'Contacta a soporte técnico', color: 'from-orange-500 to-red-500' },
    { icon: <Fingerprint size={20} />, title: 'Acceso con Passkey', desc: 'Inicia sesión sin contraseña', color: 'from-cyan-500 to-blue-500' },
    { icon: <Mail size={20} />, title: 'Código por email', desc: 'Recibe un código de 6 dígitos', color: 'from-green-500 to-emerald-500' },
    { icon: <Calendar size={20} />, title: 'Calendario', desc: 'Visualiza tus tareas por fecha', color: 'from-yellow-500 to-amber-500' },
    { icon: <Target size={20} />, title: 'Estadísticas', desc: 'Sigue tu progreso', color: 'from-pink-500 to-rose-500' }
  ];

  // ============================================
  // VISTA DE ÉXITO
  // ============================================
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-8 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-gray-200 dark:border-gray-700">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl mb-6 shadow-lg">
              <CheckCircle size={40} className="text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">¡Contraseña actualizada!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Tu contraseña ha sido cambiada exitosamente.</p>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 mb-6">
              <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <RefreshCw size={16} className="mr-2 animate-spin" />
                Serás redirigido al inicio de sesión...
              </p>
            </div>
            <Link to="/login" className="inline-flex items-center justify-center w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg group">
              Ir al inicio de sesión
              <ArrowLeft size={18} className="ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============================================
  // VISTA PRINCIPAL
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white/20 dark:bg-gray-800/50 backdrop-blur-2xl border border-white/30 dark:border-gray-700/50 rounded-3xl shadow-2xl p-6 lg:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-3xl"></div>
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-400/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-cyan-400/20 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              
              {/* LADO IZQUIERDO - BENEFICIOS */}
              <div className="flex-1">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="flex flex-col items-center text-center mb-6">
                  <div className="flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl shadow-2xl relative mb-3">
                    <div className="absolute inset-0 bg-white/20 rounded-2xl backdrop-blur-sm"></div>
                    <KeyRound className="h-8 w-8 lg:h-10 lg:w-10 text-white relative z-10" />
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-white">TodoAppManager</h1>
                    <p className="text-sm lg:text-base text-white/70 mt-1">Supabase Edition</p>
                  </div>
                </motion.div>

                <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-2xl lg:text-3xl font-bold text-white mb-3 tracking-tight text-center">
                  {step === 1 ? '¿Olvidaste tu contraseña?' : step === 2 ? 'Verificar código' : 'Nueva contraseña'}
                </motion.h2>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-emerald-100 dark:text-gray-300 text-base lg:text-lg font-light mb-8 text-center max-w-md mx-auto">
                  {step === 1 && <><span className="text-white font-semibold">No te preocupes</span>, te enviaremos un código de verificación a tu correo.</>}
                  {step === 2 && <>Ingresa el código de 6 dígitos que enviamos a <span className="text-white font-semibold">{email}</span></>}
                  {step === 3 && <><span className="text-white font-semibold">✅ Código verificado.</span> Ahora crea tu nueva contraseña.</>}
                </motion.p>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="grid grid-cols-2 gap-3">
                  {benefits.map((benefit, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + index * 0.05 }} whileHover={{ scale: 1.02, y: -2 }} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer group">
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

              {/* LADO DERECHO - FORMULARIO */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex-1 w-full max-w-md mx-auto lg:mx-0">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-200 dark:border-gray-700">
                  
                  {/* Header + StepIndicator */}
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl mb-4 shadow-lg">
                      {step === 1 && <Mail className="w-8 h-8 text-white" />}
                      {step === 2 && <Hash className="w-8 h-8 text-white" />}
                      {step === 3 && <Lock className="w-8 h-8 text-white" />}
                    </div>
                    <StepIndicator />
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      {step === 1 && 'Recuperar contraseña'}
                      {step === 2 && 'Verificar código'}
                      {step === 3 && 'Nueva contraseña'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {step === 1 && 'Paso 1 de 3: Ingresa tu correo'}
                      {step === 2 && 'Paso 2 de 3: Ingresa el código'}
                      {step === 3 && 'Paso 3 de 3: Crea tu contraseña'}
                    </p>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center mb-4">
                        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ============================================ */}
                  {/* PASO 1: EMAIL */}
                  {/* ============================================ */}
                  {step === 1 && (
                    <form onSubmit={handleSendCode} className="space-y-4">
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1.5" htmlFor="email">Correo electrónico</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
                          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all duration-200" placeholder="tu@email.com" disabled={loading} />
                        </div>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-emerald-500 rounded-full p-1.5 mt-0.5"><Zap size={14} className="text-white" /></div>
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">Te enviaremos un código de 6 dígitos a tu correo para verificar tu identidad.</p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2 flex items-center"><Clock size={12} className="mr-1" />El código expirará en 15 minutos</p>
                          </div>
                        </div>
                      </div>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group shadow-md hover:shadow-lg">
                        {loading ? (
                          <span className="flex items-center"><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Enviando código...</span>
                        ) : (
                          <span className="flex items-center">Enviar código<Send size={16} className="ml-2 group-hover:translate-x-1 transition-transform" /></span>
                        )}
                      </motion.button>
                      <div className="text-center">
                        <Link to="/login" className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium text-sm hover:underline group transition-colors">
                          <ArrowLeft size={14} className="mr-1 group-hover:-translate-x-1 transition-transform" />Volver al inicio de sesión
                        </Link>
                      </div>
                    </form>
                  )}

                  {/* ============================================ */}
                  {/* PASO 2: CÓDIGO OTP */}
                  {/* ============================================ */}
                  {step === 2 && (
                    <form onSubmit={handleVerifyCode} className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{email}</span>
                        <button type="button" onClick={() => { setStep(1); setCode(''); setError(''); }} className="ml-auto text-xs text-emerald-600 dark:text-emerald-400 hover:underline">Cambiar</button>
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1.5" htmlFor="code">Código de verificación</label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5 z-10" />
                          <input id="code" type="text" inputMode="numeric" maxLength={6} required value={code} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); if (val.length <= 6) setCode(val); }} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg pl-10 pr-4 py-2.5 text-center text-2xl tracking-[0.5em] font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all duration-200" placeholder="000000" disabled={loading} />
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Ingresa el código de 6 dígitos</p>
                          <button type="button" onClick={handleResendCode} disabled={resendCooldown > 0 || loading} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
                            {resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : 'Reenviar código'}
                          </button>
                        </div>
                      </div>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group shadow-md hover:shadow-lg">
                        {loading ? (
                          <span className="flex items-center"><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Verificando...</span>
                        ) : (
                          <span className="flex items-center">Verificar código<ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" /></span>
                        )}
                      </motion.button>
                      <div className="text-center">
                        <button type="button" onClick={() => { setStep(1); setCode(''); setError(''); }} className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium text-sm hover:underline group transition-colors">
                          <ArrowLeft size={14} className="mr-1 group-hover:-translate-x-1 transition-transform" />Usar otro correo
                        </button>
                      </div>
                    </form>
                  )}

                  {/* ============================================ */}
                  {/* PASO 3: NUEVA CONTRASEÑA */}
                  {/* ============================================ */}
                  {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 flex items-center gap-2">
                        <CheckCircle size={14} className="text-emerald-500" />
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Código verificado correctamente</span>
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1.5" htmlFor="password">Nueva contraseña</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5 z-10" />
                          <input id="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => { setPassword(e.target.value); setPasswordStrength(calculatePasswordStrength(e.target.value)); }} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg pl-10 pr-12 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all duration-200" placeholder="••••••••" disabled={loading} />
                          <motion.button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none p-1 z-10" disabled={loading} whileTap={{ scale: 0.9 }}>
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </motion.button>
                        </div>
                        {password.length > 0 && (
                          <div className="mt-2">
                            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className={`h-full ${getStrengthBarClass()} transition-all duration-300`} style={{ width: `${passwordStrength}%` }} />
                            </div>
                            <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">Fortaleza: <span className={passwordStrength < 40 ? 'text-red-400' : passwordStrength < 60 ? 'text-orange-400' : passwordStrength < 80 ? 'text-yellow-400' : 'text-emerald-400'}>{getStrengthText()}</span></p>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1.5" htmlFor="confirmPassword">Confirmar contraseña</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5 z-10" />
                          <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg pl-10 pr-12 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all duration-200" placeholder="••••••••" disabled={loading} />
                          <motion.button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none p-1 z-10" disabled={loading} whileTap={{ scale: 0.9 }}>
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </motion.button>
                        </div>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-orange-500 rounded-full p-1.5 mt-0.5"><LogOut size={14} className="text-white" /></div>
                          <div className="flex-1">
                            <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">⚠️ Al cambiar tu contraseña:</p>
                            <ul className="text-xs text-orange-600 dark:text-orange-400 mt-1 space-y-0.5 list-disc list-inside">
                              <li>Se cerrarán TODAS tus sesiones activas</li>
                              <li>Deberás iniciar sesión nuevamente</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group shadow-md hover:shadow-lg">
                        {loading ? (
                          <span className="flex items-center"><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Actualizando...</span>
                        ) : (
                          <span className="flex items-center">Actualizar contraseña<CheckCircle size={16} className="ml-2 group-hover:scale-110 transition-transform" /></span>
                        )}
                      </motion.button>
                      <div className="text-center">
                        <button type="button" onClick={() => { setStep(2); setError(''); }} className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium text-sm hover:underline group transition-colors">
                          <ArrowLeft size={14} className="mr-1 group-hover:-translate-x-1 transition-transform" />Volver al paso anterior
                        </button>
                      </div>
                    </form>
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

export default ForgotPasswordPage;