// src/auth/TwoFactorVerification.tsx
import { useState, useEffect, useRef } from 'react';
import { Shield, AlertCircle, ArrowLeft, Key, CheckCircle, User, Sparkles, Lock, Smartphone, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '../context/AuthContext';

interface TwoFactorVerificationProps {
  email: string;
  password: string;
  userAvatar?: string;
  userFullName?: string;
  onSuccess: () => void;
  onError?: (error: string) => void;
  onBack?: () => void;
}

export const TwoFactorVerification = ({
  email,
  password,
  userAvatar,
  userFullName,
  onSuccess,
  onError,
  onBack
}: TwoFactorVerificationProps) => {
  const { verify2FAAndLogin } = useAuthContext();
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [focusedInput, setFocusedInput] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    document.body.style.overflow = 'auto';
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (digits) {
      const newCode = [...code];
      for (let i = 0; i < digits.length; i++) {
        if (i < 6) {
          newCode[i] = digits[i];
        }
      }
      setCode(newCode);
      
      const lastIndex = Math.min(digits.length, 5);
      inputRefs.current[lastIndex]?.focus();
    }
  };

  const getFullCode = (): string => {
    return code.join('');
  };

  // ============================================
  // VERIFICACIÓN USANDO EL HOOK CENTRALIZADO
  // ============================================

  const handleVerify = async () => {
    const fullCode = getFullCode();
    
    if (fullCode.length !== 6) {
      setError('Ingresa el código de 6 dígitos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // ✅ USAR EL MÉTODO DEL HOOK useAuthContext
      await verify2FAAndLogin(email, password, fullCode);
      
      // Si llegamos aquí, la verificación fue exitosa
      console.log('✅ TwoFactorVerification: Verificación exitosa');
      setIsSuccess(true);
      
      // El hook ya disparó auth-change y guardó los tokens
      
      setTimeout(() => {
        onSuccess();
      }, 1500);
      
    } catch (err: unknown) {
      const errorObj = err as { message?: string; detail?: string };
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      let errorMsg = errorObj.message || errorObj.detail || 'Código 2FA inválido';
      
      if (newAttempts >= 3) {
        errorMsg = 'Demasiados intentos fallidos. Por favor, vuelve a iniciar sesión.';
        if (onError) onError(errorMsg);
        setTimeout(() => {
          if (onBack) onBack();
        }, 2000);
      }
      
      setError(errorMsg);
      if (onError) onError(errorMsg);
      
      // Limpiar el código para reintentar
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const setInputRef = (index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-emerald-500 to-teal-500',
      'from-blue-500 to-indigo-500',
      'from-purple-500 to-pink-500',
      'from-orange-500 to-red-500',
      'from-cyan-500 to-blue-500',
      'from-green-500 to-emerald-500',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[Math.abs(index) % colors.length];
  };

  // ============================================
  // PANTALLA DE ÉXITO
  // ============================================

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="text-center"
        >
          <div className="relative">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 360]
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-28 h-28 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
            >
              <CheckCircle className="w-14 h-14 text-white" />
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">¡Verificación exitosa!</h2>
          <p className="text-emerald-100 text-lg mb-4">Redirigiendo al dashboard...</p>
          <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto" />
        </motion.div>
      </div>
    );
  }

  // ============================================
  // PANTALLA PRINCIPAL DE VERIFICACIÓN
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 dark:bg-gray-800/30 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-3xl shadow-2xl p-6 lg:p-8 relative overflow-hidden"
        >
          {/* Efectos de fondo */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-3xl"></div>
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-400/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-cyan-400/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
              
              {/* ============================================ */}
              {/* LADO IZQUIERDO - INFORMACIÓN DEL USUARIO */}
              {/* ============================================ */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex-1 text-center"
              >
                {/* Logo */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl shadow-2xl flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-white/20 rounded-2xl backdrop-blur-sm"></div>
                    <Shield className="w-10 h-10 text-white relative z-10" />
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-col items-center gap-2 mb-6">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-md rounded-full border border-emerald-400/40 shadow-lg"
                  >
                    <h1 className="text-2xl lg:text-3xl font-bold text-white drop-shadow-md">
                      Verificación 2FA
                    </h1>
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-emerald-100 text-base font-light"
                  >
                    Protege tu cuenta con autenticación de dos factores
                  </motion.p>
                </div>

                {/* Tarjeta de usuario */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  className="relative group max-w-sm mx-auto"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300" />
                  
                  <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
                    {/* Avatar */}
                    <div className="flex justify-center -mt-12 mb-4">
                      <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full blur-md opacity-60" />
                        {userAvatar && !avatarError ? (
                          <motion.img 
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            src={userAvatar} 
                            alt={userFullName || email}
                            className="relative w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-xl object-cover"
                            onError={() => setAvatarError(true)}
                          />
                        ) : (
                          <motion.div 
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${getAvatarColor(userFullName || email)} flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-xl`}
                          >
                            {userFullName ? (
                              <span className="text-3xl font-bold text-white">
                                {getInitials(userFullName)}
                              </span>
                            ) : (
                              <User className="w-12 h-12 text-white" />
                            )}
                          </motion.div>
                        )}
                      </div>
                    </div>
                    
                    {/* Nombre */}
                    {userFullName && (
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white text-center mb-1">
                        {userFullName}
                      </h3>
                    )}
                    
                    {/* Email */}
                    <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 mb-3">
                      <Lock size={14} className="text-emerald-500" />
                      <p className="text-sm font-medium break-all">
                        {email}
                      </p>
                    </div>

                    {/* Línea divisoria */}
                    <div className="w-12 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full mx-auto mb-3" />

                    {/* Badge de verificación */}
                    <div className="flex justify-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-full border border-emerald-200 dark:border-emerald-700">
                        <Shield size={14} className="text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                          Verificación requerida
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* ============================================ */}
              {/* LADO DERECHO - FORMULARIO DE VERIFICACIÓN */}
              {/* ============================================ */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex-1 w-full max-w-md"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 lg:p-8">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl mb-3 shadow-lg">
                      <Smartphone className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                      Ingresa el código
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Código de 6 dígitos de Google Authenticator
                    </p>
                  </div>

                  {/* Campos de código */}
                  <div className="mb-6">
                    <div className="flex justify-center gap-2 sm:gap-3">
                      {code.map((digit, index) => (
                        <motion.input
                          key={index}
                          ref={setInputRef(index)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={index === 0 ? handlePaste : undefined}
                          onFocus={() => setFocusedInput(index)}
                          onBlur={() => setFocusedInput(null)}
                          className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 rounded-xl transition-all duration-200 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white
                            ${focusedInput === index 
                              ? 'border-emerald-500 ring-4 ring-emerald-500/20 shadow-lg scale-105' 
                              : digit 
                                ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' 
                                : 'border-gray-300 dark:border-gray-600'
                            }
                            focus:outline-none`}
                          disabled={loading}
                          autoComplete="off"
                          aria-label={`Dígito ${index + 1}`}
                          placeholder="•"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Mensaje de error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-4"
                      >
                        <div className="flex items-start gap-2 text-red-700 dark:text-red-400">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{error}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Intentos restantes */}
                  <AnimatePresence>
                    {attempts > 0 && attempts < 3 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 mb-4"
                      >
                        <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                          <Key className="w-4 h-4" />
                          <span className="text-sm">
                            Intentos restantes: <strong>{3 - attempts}</strong> de 3
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Botón de verificación */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleVerify}
                    disabled={loading || getFullCode().length !== 6}
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg text-base"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        Verificar y acceder
                        <CheckCircle size={18} />
                      </>
                    )}
                  </motion.button>

                  {/* Botón para volver */}
                  {onBack && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onBack}
                      disabled={loading}
                      className="w-full mt-4 text-gray-600 dark:text-gray-400 py-2.5 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2 text-sm border border-gray-200 dark:border-gray-600"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Volver al login
                    </motion.button>
                  )}

                  {/* Sección de ayuda */}
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <details className="group">
                      <summary className="text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 text-sm text-center list-none flex items-center justify-center gap-1">
                        <HelpCircle size={14} className="text-emerald-500" />
                        <span>¿Cómo obtener el código?</span>
                        <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="mt-3 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl text-emerald-800 dark:text-emerald-300 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                            <span className="text-white text-xs font-bold">1</span>
                          </div>
                          <p className="text-sm">
                            <strong>Abre Google Authenticator</strong><br />
                            <span className="text-emerald-700 dark:text-emerald-400">O cualquier app compatible (Authy, Microsoft Authenticator)</span>
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                            <span className="text-white text-xs font-bold">2</span>
                          </div>
                          <p className="text-sm">
                            <strong>Busca la cuenta de TodoAppManager</strong><br />
                            <span className="text-emerald-700 dark:text-emerald-400">Identificada con tu correo electrónico</span>
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                            <span className="text-white text-xs font-bold">3</span>
                          </div>
                          <p className="text-sm">
                            <strong>Ingresa el código de 6 dígitos</strong><br />
                            <span className="text-emerald-700 dark:text-emerald-400">El código se actualiza cada 30 segundos</span>
                          </p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800">
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2">
                            <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                            <span>Si no configuraste 2FA, contacta a soporte para recuperar tu cuenta.</span>
                          </p>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TwoFactorVerification;