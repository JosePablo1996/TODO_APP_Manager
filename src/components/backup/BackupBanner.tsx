// src/components/backup/BackupBanner.tsx
import React from 'react';
import { Shield, Cloud, Database, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface BackupBannerProps {
  appVersion?: string;
}

export const BackupBanner: React.FC<BackupBannerProps> = ({ appVersion = '2.6.0' }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 shadow-xl">
      {/* Patrón de fondo decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />
      </div>
      
      {/* Efecto de brillo superior */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/20 to-transparent" />

      {/* Badge de versión en esquina superior derecha */}
      <div className="absolute top-3 right-3 z-20">
        <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/30 shadow-lg">
          <div className="flex items-center gap-2">
            <Cloud size={14} className="text-white/90" />
            <span className="text-white text-xs font-bold">v{appVersion}</span>
          </div>
        </div>
      </div>

      {/* Logo en esquina superior izquierda */}
      <div className="absolute top-3 left-3 z-20">
        <div className="relative">
          <div className="absolute inset-0 bg-white/20 rounded-xl blur-md" />
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
            <Shield size={20} className="text-white sm:w-6 sm:h-6" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles size={8} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Círculos decorativos flotantes */}
      <motion.div
        animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-white/10 blur-2xl"
      />
      <motion.div
        animate={{ y: [0, 8, 0], x: [0, -4, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-white/10 blur-2xl"
      />
      
      <div className="relative z-10 px-4 py-4 sm:px-6 sm:py-5">
        {/* Contenido centrado */}
        <div className="flex flex-col items-center justify-center text-center">
          {/* Título de la aplicación */}
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl sm:text-2xl font-bold text-white tracking-tight"
          >
            TodoAppManager
          </motion.h1>

          {/* Título secundario */}
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg font-semibold text-white/90 mt-1"
          >
            Sistema de Copias de Seguridad
          </motion.h2>
          
          {/* Subtítulo */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-md"
          >
            Tus tareas seguras en la nube con Supabase
          </motion.p>
        </div>

        {/* Barra decorativa inferior */}
        <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-center text-white/60 text-[10px] sm:text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Database size={12} />
              <span>Respaldos seguros</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/40" />
            <div className="flex items-center gap-1">
              <Shield size={12} />
              <span>RLS Protegido</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupBanner;