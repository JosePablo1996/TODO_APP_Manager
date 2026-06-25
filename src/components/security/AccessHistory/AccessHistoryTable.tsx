// src/components/security/AccessHistory/AccessHistoryTable.tsx

import React from 'react';
import { useThemeClasses } from '../../../hooks/useThemeClasses';
import { 
  Smartphone, 
  Monitor, 
  Laptop, 
  Tablet, 
  Globe, 
  Eye,
  History,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Wifi
} from 'lucide-react';
import type { LoginHistory } from '../../../types/session';

// ✅ INTERFAZ CORRECTA CON entries
interface AccessHistoryTableProps {
  entries: LoginHistory[];
  loading: boolean;
  onViewDetail: (entry: LoginHistory) => void;
  onPageChange?: (page: number) => void;
  currentPage?: number;
  totalPages?: number;
}

const AccessHistoryTable: React.FC<AccessHistoryTableProps> = ({ 
  entries, 
  loading, 
  onViewDetail,
  onPageChange,
  currentPage = 1,
  totalPages = 1
}) => {
  const classes = useThemeClasses();
  
  const getDeviceIcon = (deviceType?: string) => {
    const type = deviceType?.toLowerCase() || '';
    if (type === 'mobile' || type === 'phone') return <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    if (type === 'tablet') return <Tablet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    if (type === 'laptop') return <Laptop className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    if (type === 'desktop') return <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    return <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
  };
  
  const getDeviceDisplayName = (entry: LoginHistory): string => {
    if (entry.device_brand && entry.device_model) {
      return `${entry.device_brand} ${entry.device_model}`;
    }
    if (entry.device_name && entry.device_name !== 'Dispositivo Desconocido') {
      return entry.device_name;
    }
    return entry.device_type || 'Desconocido';
  };
  
  const getStatusBadge = (status: string) => {
    if (status === 'success') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <span className="w-1 h-1 rounded-full bg-emerald-500" />
          Éxito
        </span>
      );
    }
    if (status === 'failed') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-red-500/20 text-red-600 dark:text-red-400">
          <span className="w-1 h-1 rounded-full bg-red-500" />
          Fallido
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
        <span className="w-1 h-1 rounded-full bg-amber-500" />
        Pendiente
      </span>
    );
  };
  
  const getLoginTypeText = (loginType: string) => {
    if (loginType === 'password') return 'Contraseña';
    if (loginType === 'otp') return 'Código OTP';
    if (loginType === 'passkey') return 'Passkey';
    if (loginType === '2fa') return 'Autenticación 2FA';
    if (loginType === '2fa_pending') return '2FA Pendiente';
    return loginType;
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12">
        <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-emerald-500" />
        <p className={`text-xs sm:text-sm mt-3 ${classes.text.muted}`}>Cargando historial...</p>
      </div>
    );
  }
  
  if (entries.length === 0) {
    return (
      <div className={`text-center py-8 sm:py-12 ${classes.bg.secondary} rounded-xl`}>
        <History className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 opacity-50" />
        <p className={`text-sm mt-3 ${classes.text.secondary}`}>No hay registros de acceso</p>
        <p className={`text-xs mt-1 ${classes.text.muted}`}>
          Los inicios de sesión aparecerán aquí cuando accedas a tu cuenta
        </p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto -mx-2 sm:mx-0">
      <div className="min-w-[640px] sm:min-w-full px-2 sm:px-0">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${classes.border.primary}`}>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-3 text-[10px] sm:text-xs font-medium whitespace-nowrap" style={{ color: classes.text.muted }}>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Fecha y hora
                </div>
              </th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-3 text-[10px] sm:text-xs font-medium whitespace-nowrap hidden sm:table-cell" style={{ color: classes.text.muted }}>
                Tipo
              </th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-3 text-[10px] sm:text-xs font-medium whitespace-nowrap" style={{ color: classes.text.muted }}>
                <div className="flex items-center gap-1">
                  {getDeviceIcon('desktop')}
                  Dispositivo
                </div>
              </th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-3 text-[10px] sm:text-xs font-medium whitespace-nowrap hidden sm:table-cell" style={{ color: classes.text.muted }}>
                Navegador
              </th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-3 text-[10px] sm:text-xs font-medium whitespace-nowrap hidden md:table-cell" style={{ color: classes.text.muted }}>
                <div className="flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  IP
                </div>
              </th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-3 text-[10px] sm:text-xs font-medium whitespace-nowrap" style={{ color: classes.text.muted }}>
                Estado
              </th>
              <th className="text-center py-2 sm:py-3 px-2 sm:px-3 text-[10px] sm:text-xs font-medium whitespace-nowrap" style={{ color: classes.text.muted }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className={`border-b ${classes.border.primary} hover:bg-white/5 transition-colors`}>
                {/* Fecha y hora */}
                <td className="py-2 sm:py-3 px-2 sm:px-3">
                  <span className={`text-[11px] sm:text-sm whitespace-nowrap ${classes.text.primary}`}>
                    {formatDate(entry.created_at)}
                  </span>
                </td>
                
                {/* Tipo de login */}
                <td className="py-2 sm:py-3 px-2 sm:px-3 hidden sm:table-cell">
                  <span className={`text-[11px] sm:text-sm ${classes.text.primary}`}>
                    {getLoginTypeText(entry.login_type)}
                  </span>
                </td>
                
                {/* Dispositivo */}
                <td className="py-2 sm:py-3 px-2 sm:px-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-gray-500">{getDeviceIcon(entry.device_type)}</span>
                    <span className={`text-[11px] sm:text-sm truncate max-w-[100px] sm:max-w-[150px] ${classes.text.primary}`}>
                      {getDeviceDisplayName(entry)}
                    </span>
                  </div>
                </td>
                
                {/* Navegador */}
                <td className="py-2 sm:py-3 px-2 sm:px-3 hidden sm:table-cell">
                  <span className={`text-[11px] sm:text-sm ${classes.text.primary}`}>
                    {entry.browser || 'Desconocido'}
                  </span>
                </td>
                
                {/* IP */}
                <td className="py-2 sm:py-3 px-2 sm:px-3 hidden md:table-cell">
                  <code className={`text-[10px] sm:text-xs ${classes.text.muted}`}>
                    {entry.ip_address || 'N/A'}
                  </code>
                </td>
                
                {/* Estado */}
                <td className="py-2 sm:py-3 px-2 sm:px-3">
                  {getStatusBadge(entry.status)}
                </td>
                
                {/* Acciones */}
                <td className="py-2 sm:py-3 px-2 sm:px-3 text-center">
                  <button
                    onClick={() => onViewDetail(entry)}
                    className="p-1 sm:p-1.5 rounded-lg transition-colors hover:bg-white/10"
                    style={{ color: classes.icon.primary }}
                    title="Ver detalles"
                    aria-label="Ver detalles"
                  >
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Paginación */}
        {totalPages > 1 && (
          <div className={`flex justify-center items-center gap-2 py-3 border-t ${classes.border.primary}`}>
            <button
              onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 hover:bg-white/10 ${classes.text.muted}`}
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className={`text-xs sm:text-sm ${classes.text.primary}`}>
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 hover:bg-white/10 ${classes.text.muted}`}
              aria-label="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessHistoryTable;