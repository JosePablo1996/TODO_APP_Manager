// src/components/security/SessionManager/SessionItem.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { useThemeClasses } from '../../../hooks/useThemeClasses';
import { 
  Smartphone, 
  Monitor, 
  Laptop, 
  Tablet, 
  Globe, 
  Trash2, 
  CheckCircle,
  Loader2,
  Clock,
  Wifi
} from 'lucide-react';
import type { Session } from '../../../types/session';

interface SessionItemProps {
  session: Session;
  onRevoke: (sessionId: string) => void;
  isRevoking: boolean;
}

const SessionItem: React.FC<SessionItemProps> = ({ session, onRevoke, isRevoking }) => {
  const classes = useThemeClasses();

  const getDeviceIcon = (deviceType?: string) => {
    const type = deviceType?.toLowerCase() || '';
    if (type === 'mobile' || type === 'phone') return <Smartphone className="w-5 h-5" />;
    if (type === 'tablet') return <Tablet className="w-5 h-5" />;
    if (type === 'laptop') return <Laptop className="w-5 h-5" />;
    if (type === 'desktop') return <Monitor className="w-5 h-5" />;
    return <Globe className="w-5 h-5" />;
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Ahora mismo';
      if (diffMins < 60) return `Hace ${diffMins} min`;
      if (diffHours < 24) return `Hace ${diffHours} h`;
      if (diffDays < 7) return `Hace ${diffDays} d`;
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const getDeviceInfo = (): string => {
    const parts = [];
    if (session.device_brand && session.device_brand !== 'Desconocido') {
      parts.push(session.device_brand);
    }
    if (session.device_model && session.device_model !== 'Dispositivo Desconocido') {
      parts.push(session.device_model);
    }
    if (parts.length === 0 && session.device_name) {
      parts.push(session.device_name);
    }
    return parts.join(' ') || 'Dispositivo desconocido';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-4 rounded-xl border transition-all duration-200 ${
        session.is_current 
          ? 'border-emerald-500/50 bg-emerald-500/5' 
          : `${classes.bg.card} ${classes.border.primary}`
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icono del dispositivo */}
        <div className={`p-2.5 rounded-xl flex-shrink-0 ${
          session.is_current 
            ? 'bg-emerald-500/20 text-emerald-500' 
            : `${classes.bg.secondary} ${classes.icon.secondary}`
        }`}>
          {getDeviceIcon(session.device_type)}
        </div>

        {/* Información del dispositivo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={`font-semibold text-sm ${classes.text.primary}`}>
              {getDeviceInfo()}
            </h4>
            {session.is_current && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-medium">
                <Wifi className="w-3 h-3" />
                Actual
              </span>
            )}
          </div>

          {/* Detalles técnicos - ✅ SIN UBICACIÓN */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
            {session.browser && session.browser !== 'Desconocido' && (
              <span className={`text-xs ${classes.text.muted}`}>
                🌐 {session.browser}
              </span>
            )}
            {session.os && session.os !== 'Desconocido' && (
              <span className={`text-xs ${classes.text.muted}`}>
                💻 {session.os}
              </span>
            )}
            {session.ip_address && session.ip_address !== 'Desconocida' && (
              <span className={`text-xs ${classes.text.muted}`}>
                📍 {session.ip_address}
              </span>
            )}
            {/* ❌ ELIMINADO: location */}
          </div>

          {/* Última actividad */}
          <div className="flex items-center gap-1 mt-2 text-xs">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className={classes.text.muted}>
              Última actividad: {formatDate(session.last_activity)}
            </span>
            <span className={`text-[10px] ${classes.text.muted}`}>
              · {new Date(session.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Botón de revocar */}
        {!session.is_current && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onRevoke(session.id)}
            disabled={isRevoking}
            className={`p-2 rounded-xl transition-all flex-shrink-0 ${
              isRevoking
                ? 'opacity-50 cursor-not-allowed'
                : 'text-red-500 hover:bg-red-500/10'
            }`}
            title="Revocar sesión"
          >
            {isRevoking ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </motion.button>
        )}

        {session.is_current && (
          <div className="p-2 flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SessionItem;