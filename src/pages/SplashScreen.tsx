// src/pages/SplashScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, CheckCircle, Target, Calendar, Zap, Edit3, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user, loading: isLoading } = useAuth();
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const navigationTriggered = useRef(false);

  const isDarkMode = theme === 'dark';

  // Frases motivacionales que rotan
  const phrases = [
    'Organiza tu día, alcanza tus metas ✨',
    'Cada tarea completada es un logro 🎯',
    'Tu productividad comienza aquí 🚀',
    'Convierte tus ideas en acciones 💡',
    'El éxito está en los detalles 📋'
  ];

  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setCurrentPhrase(prev => (prev + 1) % phrases.length);
    }, 3000);
    return () => clearInterval(phraseInterval);
  }, [phrases.length]);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 6000;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(interval);
        setIsComplete(true);
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isComplete && !isLoading && !navigationTriggered.current) {
      navigationTriggered.current = true;
      
      const completeTimer = setTimeout(() => {
        setFadeOut(true);
        
        const navigateTimer = setTimeout(() => {
          if (user) {
            navigate('/dashboard');
          } else {
            navigate('/login');
          }
        }, 500);
        
        return () => clearTimeout(navigateTimer);
      }, 300);
      
      return () => clearTimeout(completeTimer);
    }
  }, [isComplete, isLoading, user, navigate]);

  const floatingIcons = [
    { Icon: CheckCircle, delay: 0, x: '8%', y: '12%', size: 20 },
    { Icon: Target, delay: 2, x: '90%', y: '10%', size: 22 },
    { Icon: Calendar, delay: 4, x: '85%', y: '88%', size: 18 },
    { Icon: Zap, delay: 1, x: '12%', y: '85%', size: 20 },
    { Icon: Sparkles, delay: 3, x: '50%', y: '92%', size: 16 },
  ];

  const backgroundClass = isDarkMode
    ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-teal-900'
    : 'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500';

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        transition-opacity duration-700 ${backgroundClass}
        ${fadeOut ? 'opacity-0' : 'opacity-100'}
      `}
    >
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-radial from-white to-transparent"
        />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.06 }}
          transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
          className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-gradient-radial from-white to-transparent"
        />

        {floatingIcons.map(({ Icon, delay, x, y, size }, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: [0.2, 0.5, 0.2],
              y: [0, -15, 0],
            }}
            transition={{
              opacity: { duration: 4, delay, repeat: Infinity },
              y: { duration: 5, delay, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute text-white/12"
            style={{ left: x, top: y }}
          >
            <Icon size={size} />
          </motion.div>
        ))}

        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 0.3, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + (i % 2),
              delay: i * 0.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{
              left: `${(i * 10) % 100}%`,
              top: `${(i * 13) % 100}%`,
            }}
          />
        ))}
      </div>

      {/* Contenido principal - COMPACTO */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 h-screen flex flex-col items-center justify-center">
        
        {/* SECCIÓN SUPERIOR: Logo y nombre - TAMAÑOS REDUCIDOS */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          {/* Logo */}
          <motion.div 
            animate={{ 
              boxShadow: [
                '0 0 20px rgba(255,255,255,0.1)',
                '0 0 35px rgba(255,255,255,0.25)',
                '0 0 20px rgba(255,255,255,0.1)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="relative mb-4"
          >
            <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-xl">
              <Edit3 size={28} className="text-white" />
              <Star className="absolute -top-1.5 -right-1.5 w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
            </div>
          </motion.div>

          {/* Nombre de la app */}
          <div className="flex flex-col items-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg tracking-tight">
              TodoAppManager
            </h1>
            
            <span className="text-[0.55rem] sm:text-xs bg-white/15 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full border border-white/20 mt-1">
              organiza tu día
            </span>
          </div>
          
          <p className="text-xs sm:text-sm text-emerald-100/90 font-light tracking-wide mt-2">
            Organiza • Prioriza • Logra
          </p>
        </motion.div>

        {/* Espacio reducido */}
        <div className="h-6 sm:h-8" />

        {/* SECCIÓN CENTRAL: Frase motivacional */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center w-full"
        >
          <motion.div
            key={currentPhrase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-white/8 backdrop-blur-md border border-white/20 shadow-lg max-w-[95%] sm:max-w-lg"
          >
            <p className="text-white text-sm sm:text-base font-medium text-center">
              {phrases[currentPhrase]}
            </p>
          </motion.div>
        </motion.div>

        {/* Espacio reducido */}
        <div className="h-5 sm:h-6" />

        {/* SECCIÓN: Características */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-1.5 sm:gap-2"
        >
          {[
            { icon: CheckCircle, text: 'Tareas' },
            { icon: Calendar, text: 'Calendario' },
            { icon: Target, text: 'Objetivos' },
            { icon: Zap, text: 'Productividad' }
          ].map(({ icon: Icon, text }, index) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.08 }}
              whileHover={{ scale: 1.03 }}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/8 backdrop-blur-sm border border-white/15"
            >
              <Icon size={12} className="sm:w-3.5 sm:h-3.5 text-white/80" />
              <span className="text-white text-[0.6rem] sm:text-xs font-medium">{text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Espacio flexible */}
        <div className="flex-1 min-h-[20px] max-h-[40px]" />

        {/* SECCIÓN INFERIOR: Barra de carga y footer - COMPACTO */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full flex flex-col items-center space-y-3 sm:space-y-4 pb-4"
        >
          {/* Barra de carga */}
          <div className="w-full max-w-xs sm:max-w-sm">
            <div className="flex justify-between mb-1.5">
              <span className="text-white/70 text-[0.6rem] sm:text-xs font-light tracking-wide flex items-center gap-1.5">
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ⚡
                </motion.span>
                {progress >= 100 ? '¡Listo!' : 'Cargando...'}
              </span>
              <motion.span 
                className="text-white text-xs sm:text-sm font-semibold"
                animate={{ scale: progress === 100 ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.3 }}
              >
                {Math.round(progress)}%
              </motion.span>
            </div>
            
            {/* Barra de progreso */}
            <div className="relative w-full h-2 bg-white/15 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-white via-emerald-200 to-cyan-300 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.05, ease: "linear" }}
              >
                {progress < 100 && (
                  <motion.div
                    className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '400%'] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  />
                )}
              </motion.div>
            </div>
          </div>

          {/* Badge de versión */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-md border border-white/25"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles size={10} className="text-white/80" />
              <span className="text-white/90 text-[0.5rem] sm:text-[0.6rem] font-semibold tracking-wider">
                VERSIÓN 2.5.0
              </span>
              <div className="w-1 h-1 rounded-full bg-emerald-300 animate-pulse" />
            </div>
          </motion.div>

          {/* Footer con créditos */}
          <div className="pt-1">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="px-3 sm:px-4 py-1.5 rounded-full bg-white/8 backdrop-blur-md border border-white/20"
            >
              <div className="flex items-center gap-1.5 text-white/80">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span className="text-[0.5rem] sm:text-[0.6rem] font-light">
                  Desarrollado con <span className="text-emerald-200">❤️</span> por José Pablo Miranda
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SplashScreen;