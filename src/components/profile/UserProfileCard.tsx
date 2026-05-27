// src/components/profile/UserProfileCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, Shield, Sparkles } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface UserProfileCardProps {
  displayName: string;
  displayEmail: string;
  avatarUrl?: string;
  isEmailVerified?: boolean;
  onAvatarError?: () => void;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  displayName,
  displayEmail,
  avatarUrl,
  isEmailVerified = false,
  onAvatarError
}) => {
  const classes = useThemeClasses();
  const [avatarError, setAvatarError] = React.useState(false);

  const getInitials = (): string => {
    if (displayName === 'Usuario') return 'U';
    const nameParts = displayName.split(' ').filter((part: string) => part.length > 0);
    if (nameParts.length === 0) return 'U';
    if (nameParts.length === 1) {
      return nameParts[0].substring(0, Math.min(2, nameParts[0].length)).toUpperCase();
    }
    return (nameParts[0][0] + (nameParts[1] ? nameParts[1][0] : '')).toUpperCase();
  };

  const getAvatarColor = (): string => {
    if (displayName === 'Usuario') return 'from-emerald-500 to-cyan-500';
    
    const gradients = [
      'from-emerald-500 to-cyan-500',
      'from-green-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-purple-500 to-pink-500',
      'from-blue-500 to-indigo-500',
      'from-yellow-500 to-orange-500',
      'from-cyan-500 to-blue-500',
      'from-teal-500 to-emerald-500',
      'from-violet-500 to-purple-500'
    ];
    
    const charCodeSum = displayName.split('').reduce((sum: number, char: string) => sum + char.charCodeAt(0), 0);
    const gradientIndex = charCodeSum % gradients.length;
    
    return gradients[gradientIndex];
  };

  const handleAvatarError = () => {
    setAvatarError(true);
    if (onAvatarError) onAvatarError();
  };

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-2xl overflow-hidden backdrop-blur-lg border ${classes.bg.card} ${classes.border.primary} shadow-xl relative`}
    >
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 pointer-events-none" />
      
      {/* Badge de verificado en la esquina superior derecha */}
      {isEmailVerified && (
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
          className="absolute top-3 right-3 z-10"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-md opacity-60" />
            <div className="relative bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full p-1.5 shadow-lg">
              <Shield size={14} className="text-white" />
            </div>
          </div>
        </motion.div>
      )}
      
      <div className="relative p-6 sm:p-8 flex flex-col items-center justify-center gap-4 sm:gap-5">
        {/* Avatar con efecto de glow - SIN PALOMITA */}
        <div className="relative group">
          <motion.div 
            className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full opacity-75 group-hover:opacity-100 blur-lg transition duration-300"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-2xl ring-4 ring-white dark:ring-gray-800">
            {avatarUrl && !avatarError ? (
              <img 
                src={avatarUrl} 
                alt={displayName}
                className="w-full h-full object-cover"
                onError={handleAvatarError}
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${getAvatarColor()} flex items-center justify-center text-white text-2xl sm:text-3xl font-bold`}>
                {getInitials()}
              </div>
            )}
          </div>
        </div>
        
        {/* Información del usuario */}
        <div className="text-center space-y-3">
          {/* Nombre del usuario con palomita junto */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <h2 
              className={`text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r ${isDark ? 'from-white to-gray-300' : 'from-gray-800 to-gray-600'} bg-clip-text text-transparent`}
              style={{
                fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                letterSpacing: '-0.02em'
              }}
            >
              {displayName}
            </h2>
            
            {/* Palomita de verificación mejorada junto al nombre */}
            {isEmailVerified && (
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, delay: 0.3 }}
                className="relative inline-flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-sm opacity-50" />
                <div className="relative bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full p-0.5 shadow-md">
                  <CheckCircle size={14} className="text-white" strokeWidth={2.5} />
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Correo electrónico dentro de un BADGE */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center"
          >
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${classes.border.primary} ${classes.bg.secondary} shadow-sm`}>
              <div className="p-0.5 rounded-full bg-emerald-500/15">
                <Mail size={12} className="text-emerald-500" />
              </div>
              <span 
                className={`text-xs sm:text-sm font-medium ${classes.text.primary}`}
                style={{
                  fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
                }}
              >
                {displayEmail}
              </span>
            </div>
          </motion.div>
          
          {/* Badge de cuenta verificada - con palomita mejorada */}
          {isEmailVerified && (
            <motion.div 
              initial={{ scale: 0, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.4 }}
              className="inline-flex items-center justify-center"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 shadow-sm backdrop-blur-sm">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-[2px]" />
                  <div className="relative bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full p-0.5">
                    <CheckCircle size={10} className="text-white" strokeWidth={3} />
                  </div>
                </div>
                <span 
                  className={`text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent`}
                  style={{
                    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                    letterSpacing: '0.01em'
                  }}
                >
                  Cuenta verificada
                </span>
                <Sparkles size={10} className="text-emerald-500" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Línea decorativa */}
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent rounded-full" />
      </div>
    </motion.div>
  );
};

export default UserProfileCard;