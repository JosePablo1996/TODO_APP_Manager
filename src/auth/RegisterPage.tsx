import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import authService from '../services/authService';
import type { RegisterData } from '../services/authService';
import { 
  Eye, 
  EyeOff, 
  CheckCircle, 
  Zap, 
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  Shield,
  Sparkles,
  Lock,
  Star,
  Calendar,
  Target,
  Fingerprint,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Interfaz para el formulario de registro
interface RegisterForm {
  username: string;
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}

// Interfaz para el error de la API
interface ApiError {
  message?: string;
  response?: {
    data?: {
      detail?: string;
      errorMessage?: string;
    };
    status?: number;
  };
}

// Tipo para la fortaleza de la contraseña
type PasswordStrength = 'empty' | 'weak' | 'medium' | 'strong' | 'very-strong';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  
  const { register, handleSubmit, watch, formState: { errors, isSubmitting }, setError: setFormError, clearErrors } = useForm<RegisterForm>();
  
  const password = watch('password', '');
  const confirmPassword = watch('confirmPassword', '');

  // Función para calcular la fortaleza de la contraseña
  const getPasswordStrength = (pass: string): PasswordStrength => {
    if (!pass) return 'empty';
    
    let score = 0;
    
    // Longitud
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;
    if (pass.length >= 16) score += 1;
    
    // Complejidad
    if (/[a-z]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pass)) score += 2;
    
    // Combinaciones
    const hasUpperAndLower = /[a-z]/.test(pass) && /[A-Z]/.test(pass);
    const hasLettersAndNumbers = /[a-zA-Z]/.test(pass) && /[0-9]/.test(pass);
    const hasSpecialAndAnything = /[^a-zA-Z0-9]/.test(pass);
    
    if (hasUpperAndLower) score += 1;
    if (hasLettersAndNumbers) score += 1;
    if (hasSpecialAndAnything) score += 1;
    
    if (score <= 3) return 'weak';
    if (score <= 6) return 'medium';
    if (score <= 9) return 'strong';
    return 'very-strong';
  };

  const strengthConfig = {
    empty: {
      label: '',
      color: 'bg-gray-300 dark:bg-gray-600',
      textColor: 'text-gray-500',
      icon: null,
      percentage: 0,
      gradient: 'from-gray-400 to-gray-500'
    },
    weak: {
      label: 'Débil',
      color: 'bg-red-500',
      textColor: 'text-red-500',
      icon: ShieldX,
      percentage: 25,
      gradient: 'from-red-500 to-red-600'
    },
    medium: {
      label: 'Media',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-500',
      icon: ShieldAlert,
      percentage: 50,
      gradient: 'from-yellow-500 to-orange-500'
    },
    strong: {
      label: 'Fuerte',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-500',
      icon: ShieldCheck,
      percentage: 75,
      gradient: 'from-emerald-500 to-teal-500'
    },
    'very-strong': {
      label: 'Muy Fuerte',
      color: 'bg-cyan-500',
      textColor: 'text-cyan-500',
      icon: ShieldCheck,
      percentage: 100,
      gradient: 'from-cyan-500 to-blue-500'
    }
  };

  const currentStrength = getPasswordStrength(password);
  const strength = strengthConfig[currentStrength];
  const StrengthIcon = strength.icon;

  // Validar contraseña manualmente
  const validatePassword = (pass: string): boolean => {
    const hasMinLength = pass.length >= 8;
    const hasLower = /[a-z]/.test(pass);
    const hasUpper = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSymbol = /[^a-zA-Z0-9]/.test(pass);
    
    return hasMinLength && hasLower && hasUpper && hasNumber && hasSymbol;
  };

  // Efecto para validar la contraseña en tiempo real
  useEffect(() => {
    if (password) {
      if (validatePassword(password)) {
        clearErrors('password');
      } else {
        setFormError('password', {
          type: 'manual',
          message: 'Debe contener mayúsculas, minúsculas, número y símbolo'
        });
      }
    }
  }, [password, clearErrors, setFormError]);

  const onSubmit = async (data: RegisterForm): Promise<void> => {
    try {
      setError('');
      setSuccess('');
      
      // Validar fortaleza mínima
      const strength = getPasswordStrength(data.password);
      if (strength === 'weak' || strength === 'medium') {
        setError('La contraseña debe ser más fuerte. Usa una combinación de mayúsculas, minúsculas, números y símbolos.');
        return;
      }
      
      const registerData: RegisterData = {
        username: data.username,
        email: data.email,
        full_name: data.fullName,
        password: data.password
      };
      
      const response = await authService.register(registerData);
      
      console.log('✅ Registro exitoso:', response);
      
      setSuccess('✅ Cuenta creada exitosamente. Revisa tu email para confirmar tu cuenta antes de iniciar sesión.');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err: unknown) {
      const apiError = err as ApiError;
      console.error('❌ Error en registro:', apiError);
      
      const errorMessage = 
        apiError.response?.data?.detail || 
        apiError.response?.data?.errorMessage || 
        apiError.message || 
        'Error al registrar usuario. Por favor, intenta de nuevo.';
      
      setError(errorMessage);
    }
  };

  // Beneficios organizados en grid (coherente con LoginPage)
  const benefits = [
    {
      icon: <CheckCircle size={20} />,
      title: 'Gratis para siempre',
      desc: 'Sin costos ocultos, sin sorpresas',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: <Fingerprint size={20} />,
      title: 'Acceso con Passkey',
      desc: 'Inicia sesión con huella digital o Face ID',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: <KeyRound size={20} />,
      title: 'Código por email',
      desc: 'Recibe un código de 6 dígitos',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Shield size={20} />,
      title: 'Tus datos seguros',
      desc: 'Protegemos tu privacidad con Supabase',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: <Zap size={20} />,
      title: 'Sincronización',
      desc: 'Accede desde cualquier dispositivo',
      color: 'from-yellow-500 to-amber-500'
    },
    {
      icon: <Star size={20} />,
      title: 'Tareas favoritas',
      desc: 'Marca tus tareas más importantes',
      color: 'from-pink-500 to-rose-500'
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
      desc: 'Sigue tu progreso y productividad',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  // Requisitos de contraseña
  const passwordRequirements = [
    { label: 'Mínimo 8 caracteres', test: password.length >= 8 },
    { label: 'Una mayúscula', test: /[A-Z]/.test(password) },
    { label: 'Una minúscula', test: /[a-z]/.test(password) },
    { label: 'Un número', test: /[0-9]/.test(password) },
    { label: 'Un símbolo', test: /[^a-zA-Z0-9]/.test(password) }
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
                    <Sparkles className="h-8 w-8 lg:h-10 lg:w-10 text-white relative z-10" />
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
                  Únete a nuestra comunidad
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-emerald-100 dark:text-gray-300 text-base lg:text-lg font-light mb-8 text-center max-w-md mx-auto"
                >
                  Organiza tus tareas y alcanza tus metas de manera fácil y rápida
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
              {/* LADO DERECHO - FORMULARIO MEJORADO */}
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
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                      Crear una cuenta nueva
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Es rápido y fácil - ¡Comienza ahora!
                    </p>
                  </div>

                  {/* Mensajes de error/éxito */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-4 text-sm flex items-center"
                      >
                        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}

                    {success && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-xl mb-4 text-sm flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{success}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Nombre Completo */}
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1.5" htmlFor="fullName">
                        Nombre completo
                      </label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5 transition-colors group-focus-within:text-emerald-500" />
                        <input
                          id="fullName"
                          type="text"
                          {...register('fullName', { 
                            required: 'El nombre completo es requerido',
                            minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                          })}
                          className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all duration-200"
                          placeholder="Tu nombre completo"
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.fullName && (
                        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center">
                          <AlertCircle size={12} className="mr-1" />
                          {errors.fullName.message}
                        </p>
                      )}
                    </div>

                    {/* Usuario */}
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1.5" htmlFor="username">
                        Usuario
                      </label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5 transition-colors group-focus-within:text-emerald-500" />
                        <input
                          id="username"
                          type="text"
                          {...register('username', { 
                            required: 'El usuario es requerido',
                            minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                            pattern: { 
                              value: /^[a-zA-Z0-9_]+$/, 
                              message: 'Solo letras, números y guión bajo' 
                            }
                          })}
                          className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all duration-200"
                          placeholder="usuario123"
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.username && (
                        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center">
                          <AlertCircle size={12} className="mr-1" />
                          {errors.username.message}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1.5" htmlFor="email">
                        Correo electrónico
                      </label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5 transition-colors group-focus-within:text-emerald-500" />
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
                          className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all duration-200"
                          placeholder="ejemplo@correo.com"
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center">
                          <AlertCircle size={12} className="mr-1" />
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Contraseña */}
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1.5" htmlFor="password">
                        Contraseña
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5 z-10 transition-colors group-focus-within:text-emerald-500" />
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          {...register('password', { 
                            required: 'La contraseña es requerida',
                            validate: (value) => validatePassword(value) || 'Debe contener mayúsculas, minúsculas, número y símbolo'
                          })}
                          className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl pl-10 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all duration-200"
                          placeholder="••••••••"
                          disabled={isSubmitting}
                        />
                        <motion.button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none p-1 z-10"
                          disabled={isSubmitting}
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
                      
                      {/* Barra de fortaleza mejorada */}
                      {password && password.length > 0 && (
                        <motion.div 
                          className="mt-3"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              {StrengthIcon && (
                                <StrengthIcon className={`w-4 h-4 ${strength.textColor}`} />
                              )}
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Fortaleza:
                              </span>
                            </div>
                            <span className={`text-xs font-semibold ${strength.textColor}`}>
                              {strength.label}
                            </span>
                          </div>
                          
                          {/* Barra de progreso con gradiente */}
                          <div className="relative h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${strength.percentage}%` }}
                              transition={{ duration: 0.3 }}
                              className={`absolute inset-y-0 left-0 bg-gradient-to-r ${strength.gradient} rounded-full`}
                            />
                            {/* Segmentos visuales */}
                            <div className="absolute inset-0 flex">
                              <div className="flex-1 border-r border-white/20"></div>
                              <div className="flex-1 border-r border-white/20"></div>
                              <div className="flex-1 border-r border-white/20"></div>
                              <div className="flex-1"></div>
                            </div>
                          </div>
                          
                          {/* Lista de requisitos */}
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                              Requisitos de seguridad:
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              {passwordRequirements.map((req, index) => (
                                <div key={index} className="flex items-center gap-1.5">
                                  {req.test ? (
                                    <CheckCircle size={12} className="text-emerald-500 flex-shrink-0" />
                                  ) : (
                                    <XCircle size={12} className="text-gray-400 flex-shrink-0" />
                                  )}
                                  <span className={`text-xs ${req.test ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {req.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                      {errors.password && (
                        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center">
                          <AlertCircle size={12} className="mr-1" />
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    {/* Confirmar Contraseña */}
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1.5" htmlFor="confirmPassword">
                        Confirmar Contraseña
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5 z-10 transition-colors group-focus-within:text-emerald-500" />
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          {...register('confirmPassword', { 
                            required: 'Confirma tu contraseña',
                            validate: (value: string) => 
                              value === password || 'Las contraseñas no coinciden'
                          })}
                          className={`w-full bg-gray-50 dark:bg-gray-700 border-2 text-gray-900 dark:text-white rounded-xl pl-10 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all duration-200 ${
                            confirmPassword && password 
                              ? confirmPassword === password 
                                ? 'border-emerald-500 dark:border-emerald-500' 
                                : 'border-red-500 dark:border-red-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="••••••••"
                          disabled={isSubmitting}
                        />
                        <motion.button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none p-1 z-10"
                          disabled={isSubmitting}
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
                        
                        {/* Icono de validación */}
                        {confirmPassword && password && (
                          <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                            {confirmPassword === password ? (
                              <CheckCircle size={16} className="text-emerald-500" />
                            ) : (
                              <XCircle size={16} className="text-red-500" />
                            )}
                          </div>
                        )}
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center">
                          <AlertCircle size={12} className="mr-1" />
                          {errors.confirmPassword.message}
                        </p>
                      )}
                      
                      {/* Mensaje de coincidencia */}
                      {confirmPassword && password && confirmPassword === password && (
                        <motion.p 
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center"
                        >
                          <CheckCircle size={12} className="mr-1" />
                          Las contraseñas coinciden
                        </motion.p>
                      )}
                    </div>

                    {/* Nota sobre verificación de email */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-xl border-2 border-emerald-200 dark:border-emerald-800">
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                        <Mail size={14} className="flex-shrink-0 mt-0.5" />
                        <span>
                          <strong className="font-semibold">Importante:</strong> Recibirás un email de confirmación. Verifica tu cuenta antes de iniciar sesión.
                        </span>
                      </p>
                    </div>

                    {/* Términos y condiciones */}
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        Al registrarte, aceptas nuestras{' '}
                        <a href="#" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium transition-colors">Condiciones</a>,{' '}
                        <a href="#" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium transition-colors">Política de privacidad</a> y{' '}
                        <a href="#" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium transition-colors">Política de cookies</a>.
                      </p>
                    </div>

                    {/* Botón de Registro */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group shadow-lg hover:shadow-xl"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                          Registrando...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          Registrarte
                          <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </motion.button>

                    {/* Separador */}
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                          ¿Ya tienes una cuenta?
                        </span>
                      </div>
                    </div>

                    {/* Enlace a login */}
                    <div className="text-center">
                      <Link 
                        to="/login" 
                        className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium text-sm hover:underline group transition-colors"
                      >
                        Iniciar sesión
                        <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
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
  );
};

export default RegisterPage;