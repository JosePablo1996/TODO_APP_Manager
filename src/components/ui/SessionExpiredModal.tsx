// src/components/SessionExpiredModal.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, LogIn, Shield, Clock, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SessionExpiredModalProps {
  message?: string;
  onClose?: () => void;
  autoRedirect?: boolean;
  redirectDelay?: number;
  onRedirect?: () => void;
}

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({
  message = 'Tu sesión expiró por cambio de contraseña. Por favor, inicia sesión nuevamente.',
  onClose,
  autoRedirect = true,
  redirectDelay = 3000,
  onRedirect
}) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(Math.ceil(redirectDelay / 1000));
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!autoRedirect) return;

    const intervalTime = 100; // Actualizar cada 100ms para animación suave
    const totalSteps = redirectDelay / intervalTime;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const newProgress = 100 - (step / totalSteps) * 100;
      setProgress(Math.max(0, newProgress));
      
      const secondsLeft = Math.ceil((redirectDelay - (step * intervalTime)) / 1000);
      setCountdown(Math.max(0, secondsLeft));
      
      if (step >= totalSteps) {
        clearInterval(timer);
        handleRedirect();
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [autoRedirect, redirectDelay]);

  const handleRedirect = () => {
    if (onRedirect) {
      onRedirect();
    } else {
      setIsVisible(false);
      if (onClose) onClose();
      navigate('/login', { 
        replace: true,
        state: { 
          sessionExpired: true,
          message: message 
        }
      });
    }
  };

  const handleLoginNow = () => {
    setIsVisible(false);
    if (onClose) onClose();
    navigate('/login', { 
      replace: true,
      state: { 
        sessionExpired: true,
        message: message 
      }
    });
  };

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
          onClick={handleRedirect}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header con gradiente rojo/naranja */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 relative">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
              <div className="flex items-center space-x-3">
                <motion.div 
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/20 rounded-full p-2"
                >
                  <Shield className="h-6 w-6 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-white">Sesión cerrada por seguridad</h3>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6">
              {/* Icono de alerta animado */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex justify-center mb-4"
              >
                <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full p-3">
                  <AlertCircle className="h-8 w-8 text-orange-500 dark:text-orange-400" />
                </div>
              </motion.div>

              {/* Mensaje principal */}
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-700 dark:text-gray-300 text-center mb-4"
              >
                {message}
              </motion.p>

              {/* Información de seguridad */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 rounded-lg p-4 mb-6"
              >
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-orange-700 dark:text-orange-400 font-medium">
                      ¿Por qué sucedió esto?
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-500 mt-1">
                      Al cambiar tu contraseña, todas las sesiones activas se cierran automáticamente 
                      para proteger tu cuenta. Deberás iniciar sesión nuevamente con tu nueva contraseña.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Barra de progreso y contador */}
              {autoRedirect && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <RefreshCw size={14} className="mr-1 animate-spin" />
                      Redirigiendo automáticamente
                    </span>
                    <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                      {countdown} segundos
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                      initial={{ width: "100%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.1, ease: "linear" }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Botón de acción principal */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={handleLoginNow}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 group shadow-lg hover:shadow-xl"
              >
                <LogIn className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                <span>Iniciar sesión ahora</span>
              </motion.button>

              {/* Texto alternativo */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4"
              >
                Si tienes problemas, contacta con soporte
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SessionExpiredModal;