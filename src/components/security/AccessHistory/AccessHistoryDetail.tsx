// src/components/security/AccessHistory/AccessHistoryDetail.tsx

import React from 'react';
import { useThemeClasses } from '../../../hooks/useThemeClasses';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, 
  Monitor, 
  Laptop, 
  Tablet, 
  Globe, 
  X,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Wifi,
  Shield
} from 'lucide-react';
import type { LoginHistory } from '../../../types/session';

interface AccessHistoryDetailProps {
  entry: LoginHistory | null;
  onClose: () => void;
}

const AccessHistoryDetail: React.FC<AccessHistoryDetailProps> = ({ entry, onClose }) => {
  const classes = useThemeClasses();
  
  if (!entry) return null;
  
  const getDeviceIcon = (deviceType?: string) => {
    const type = deviceType?.toLowerCase() || '';
    if (type === 'mobile' || type === 'phone') return <Smartphone className="w-10 h-10 sm:w-12 sm:h-12" />;
    if (type === 'tablet') return <Tablet className="w-10 h-10 sm:w-12 sm:h-12" />;
    if (type === 'laptop') return <Laptop className="w-10 h-10 sm:w-12 sm:h-12" />;
    if (type === 'desktop') return <Monitor className="w-10 h-10 sm:w-12 sm:h-12" />;
    return <Globe className="w-10 h-10 sm:w-12 sm:h-12" />;
  };
  
  const getStatusIcon = (status: string) => {
    if (status === 'success') return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    if (status === 'failed') return <XCircle className="w-5 h-5 text-red-500" />;
    return <Clock className="w-5 h-5 text-amber-500" />;
  };
  
  const getLoginTypeText = (loginType: string) => {
    if (loginType === 'password') return 'Contraseña';
    if (loginType === 'otp') return 'Código OTP';
    if (loginType === 'passkey') return 'Passkey (Biométrico)';
    if (loginType === '2fa') return 'Autenticación 2FA';
    if (loginType === '2fa_pending') return '2FA Pendiente';
    return loginType;
  };
  
  const getStatusText = (status: string) => {
    if (status === 'success') return 'Exitoso';
    if (status === 'failed') return 'Fallido';
    return 'Pendiente';
  };
  
  const getDeviceDisplayName = (): string => {
    // Prioridad: brand + model, luego device_name, luego device_type
    if (entry.device_brand && entry.device_model) {
      return `${entry.device_brand} ${entry.device_model}`;
    }
    if (entry.device_name && entry.device_name !== 'Dispositivo Desconocido') {
      return entry.device_name;
    }
    return entry.device_type || 'Desconocido';
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };
  
  // ✅ SOLO MOSTRAMOS ESTOS CAMPOS:
  // - Tipo de acceso
  // - Dispositivo (combina brand + model)
  // - Navegador
  // - Sistema operativo
  // - Dirección IP
  // - Estado
  // - Fecha y hora
  // ✅ ELIMINADOS: Tipo de dispositivo, Ubicación
  const detailSections = [
    { 
      label: 'Tipo de acceso', 
      value: getLoginTypeText(entry.login_type), 
      icon: <Shield className="w-4 h-4" /> 
    },
    { 
      label: 'Dispositivo', 
      value: getDeviceDisplayName(), 
      icon: getDeviceIcon(entry.device_type) 
    },
    { 
      label: 'Navegador', 
      value: entry.browser || 'Desconocido', 
      icon: <Globe className="w-4 h-4" /> 
    },
    { 
      label: 'Sistema operativo', 
      value: entry.os || 'Desconocido', 
      icon: <Monitor className="w-4 h-4" /> 
    },
    { 
      label: 'Dirección IP', 
      value: entry.ip_address || 'Desconocida', 
      icon: <Wifi className="w-4 h-4" /> 
    },
    { 
      label: 'Estado', 
      value: getStatusText(entry.status), 
      icon: getStatusIcon(entry.status) 
    },
    { 
      label: 'Fecha y hora', 
      value: formatDate(entry.created_at), 
      icon: <Calendar className="w-4 h-4" /> 
    },
  ];
  
  return (
    <AnimatePresence>
      {entry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={onClose} 
          />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`relative rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border ${classes.bg.card} ${classes.border.primary}`}
            style={{
              backdropFilter: 'blur(20px)'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    {getDeviceIcon(entry.device_type)}
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white">Detalle del acceso</h2>
                    <p className="text-emerald-100 text-xs">Información del dispositivo</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg transition-colors hover:bg-white/20"
                  style={{ color: 'rgba(255,255,255,0.8)' }}
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-3">
                {detailSections.map((section, idx) => (
                  <div 
                    key={idx} 
                    className={`flex justify-between items-center py-2 border-b ${classes.border.primary}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`${classes.text.muted}`}>
                        {section.icon}
                      </span>
                      <span className={`text-xs sm:text-sm ${classes.text.secondary}`}>
                        {section.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {section.label === 'Estado' && section.icon}
                      <span className={`text-xs sm:text-sm font-medium text-right ${classes.text.primary}`}>
                        {section.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Footer */}
            <div className={`p-3 sm:p-4 border-t ${classes.border.primary}`}>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl transition-colors text-sm font-medium bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AccessHistoryDetail;