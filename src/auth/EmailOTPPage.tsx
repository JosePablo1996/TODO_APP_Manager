// src/auth/EmailOTPPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { useAuthContext } from '../context/AuthContext';
import { 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  ArrowLeft,
  Smartphone,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EmailOTPPage: React.FC = () => {
  const navigate = useNavigate();
  const { verifyOtpAndLogin } = useAuthContext();
  
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [codeExpired, setCodeExpired] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  
  const componentMounted = useRef(true);
  const redirectingRef = useRef(false);

  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => document.body.classList.remove('auth-page');
  }, []);

  useEffect(() => {
    componentMounted.current = true;
    return () => {
      componentMounted.current = false;
    };
  }, []);

  // Timer para countdown de reenvío
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => {
      if (componentMounted.current) {
        setCountdown(countdown - 1);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Timer para expiración del código
  useEffect(() => {
    if (step !== 'code') return;
    if (codeExpired) return;
    
    const timer = setTimeout(() => {
      if (componentMounted.current) {
        setCodeExpired(true);
        setError('El código ha expirado. Solicita uno nuevo.');
      }
    }, 15 * 60 * 1000);
    
    return () => clearTimeout(timer);
  }, [step, codeExpired]);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;
    
    setLoading(true);
    setError('');
    setSuccessMessage('');
    setCodeExpired(false);
    
    try {
      await authService.signInWithOtp(email);
      
      if (componentMounted.current) {
        setSuccessMessage('📧 ¡Código enviado! Revisa tu correo electrónico');
        setStep('code');
        setCountdown(60);
      }
      
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      const errorMessage = errorObj.message || 'Error al enviar el código. Intenta nuevamente.';
      if (componentMounted.current) {
        setError(errorMessage);
      }
    } finally {
      if (componentMounted.current) {
        setLoading(false);
      }
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading || redirectingRef.current) return;
    
    if (code.length !== 6) {
      setError('Por favor, ingresa el código de 6 dígitos completo');
      return;
    }
    
    setLoading(true);
    setError('');
    redirectingRef.current = true;
    setRedirecting(true);
    
    try {
      await verifyOtpAndLogin(email, code);
      
      setTimeout(() => {
        if (componentMounted.current) {
          navigate('/', { replace: true });
        }
      }, 500);
      
    } catch (err: unknown) {
      const errorObj = err as { message?: string; detail?: string };
      redirectingRef.current = false;
      
      if (componentMounted.current) {
        setRedirecting(false);
        
        let errorMsg = 'Código inválido o expirado. Verifica e intenta nuevamente.';
        
        if (errorObj.message?.includes('incorrecto') || errorObj.message?.includes('Invalid')) {
          errorMsg = 'Código incorrecto. Por favor, verifica el código que recibiste por email.';
        } else if (errorObj.message?.includes('expirado') || errorObj.message?.includes('expired')) {
          errorMsg = 'El código ha expirado. Solicita uno nuevo.';
          setCodeExpired(true);
        } else {
          errorMsg = errorObj.message || errorObj.detail || errorMsg;
        }
        
        setError(errorMsg);
      }
    } finally {
      if (componentMounted.current) {
        setLoading(false);
      }
    }
  };

  const resendCode = async () => {
    if (countdown > 0 || loading) return;
    
    setLoading(true);
    setError('');
    setSuccessMessage('');
    setCodeExpired(false);
    setCode('');
    
    try {
      await authService.signInWithOtp(email);
      
      if (componentMounted.current) {
        setSuccessMessage('✨ ¡Nuevo código enviado! Revisa tu correo');
        setCountdown(60);
      }
      
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      const errorMessage = errorObj.message || 'Error al reenviar el código';
      if (componentMounted.current) {
        setError(errorMessage);
      }
    } finally {
      if (componentMounted.current) {
        setLoading(false);
      }
    }
  };

  const goBackToEmail = () => {
    setStep('email');
    setError('');
    setCode('');
    setSuccessMessage('');
    setCodeExpired(false);
    setRedirecting(false);
  };

  const isVerifyButtonDisabled = loading || code.length !== 6 || redirecting;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 dark:bg-gray-800/30 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-3xl shadow-2xl p-6 lg:p-8 relative overflow-hidden"
        >
          {/* Efectos de fondo */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-3xl"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-400/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl shadow-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-3">
                <Smartphone size={16} className="text-emerald-300" />
                <span className="text-white text-sm font-medium">Código por Email</span>
              </div>
              <h1 className="text-2xl font-bold text-white drop-shadow-md">
                {step === 'email' ? 'Iniciar sesión con OTP' : 'Verificar código'}
              </h1>
              <p className="text-emerald-100 text-sm mt-2">
                {step === 'email' 
                  ? 'Recibe un código de 6 dígitos en tu correo electrónico' 
                  : `Código enviado a ${email}`}
              </p>
            </div>

            {/* Mensajes de error/éxito */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50/90 dark:bg-red-900/30 backdrop-blur-sm border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-4 text-sm flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-50/90 dark:bg-green-900/30 backdrop-blur-sm border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg mb-4 text-sm flex items-center"
                >
                  <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{successMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {redirecting && (
              <div className="bg-green-50/90 dark:bg-green-900/30 backdrop-blur-sm border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg mb-4 text-sm flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent"></div>
                <span>✅ ¡Login exitoso! Redirigiendo...</span>
              </div>
            )}

            {/* Formulario según el paso */}
            <AnimatePresence mode="wait">
              {step === 'email' ? (
                <motion.form
                  key="email-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={sendCode}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent placeholder-gray-400"
                        placeholder="tu@email.com"
                        required
                        disabled={loading || redirecting}
                        autoFocus
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || !email || redirecting}
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        Enviar código
                        <Mail size={16} />
                      </>
                    )}
                  </motion.button>

                  <Link
                    to="/login"
                    className="w-full mt-3 text-white/70 hover:text-white py-2.5 rounded-lg font-medium hover:bg-white/10 transition flex items-center justify-center gap-2 text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al inicio de sesión
                  </Link>
                </motion.form>
              ) : (
                <motion.form
                  key="code-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={verifyCode}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2 text-center">
                      Código de verificación
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, '');
                        setCode(numericValue.slice(0, 6));
                        setError('');
                      }}
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg px-4 py-3 text-center text-2xl tracking-[8px] font-mono focus:ring-2 focus:ring-emerald-400 focus:border-transparent placeholder-gray-400"
                      placeholder="123456"
                      maxLength={6}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      disabled={loading || redirecting}
                      autoFocus
                    />
                    <p className="text-xs text-emerald-200 mt-2 text-center">
                      Código ingresado: {code.length}/6 dígitos
                    </p>
                  </div>

                  <motion.button
                    whileHover={!isVerifyButtonDisabled ? { scale: 1.02 } : {}}
                    whileTap={!isVerifyButtonDisabled ? { scale: 0.98 } : {}}
                    type="submit"
                    disabled={isVerifyButtonDisabled}
                    className={`w-full font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
                      isVerifyButtonDisabled
                        ? 'bg-gray-400/50 text-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white'
                    }`}
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : redirecting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Redirigiendo...</span>
                      </>
                    ) : (
                      <>
                        Verificar y entrar
                        <ArrowRight size={16} />
                      </>
                    )}
                  </motion.button>

                  <div className="text-center space-y-2">
                    <button
                      type="button"
                      onClick={resendCode}
                      disabled={countdown > 0 || loading || redirecting}
                      className={`text-sm transition-colors ${
                        countdown > 0 || loading || redirecting
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-emerald-300 hover:text-emerald-200'
                      }`}
                    >
                      {countdown > 0 ? (
                        <span className="flex items-center justify-center gap-1">
                          <Clock size={14} />
                          Reenviar código en {countdown}s
                        </span>
                      ) : (
                        '📧 Reenviar código'
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={goBackToEmail}
                      disabled={redirecting}
                      className="block w-full text-sm text-white/60 hover:text-white/80 transition-colors disabled:opacity-50"
                    >
                      ← Usar otro correo electrónico
                    </button>
                  </div>

                  <Link
                    to="/login"
                    className="w-full mt-2 text-white/70 hover:text-white py-2 rounded-lg font-medium hover:bg-white/10 transition flex items-center justify-center gap-2 text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al inicio de sesión
                  </Link>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailOTPPage;