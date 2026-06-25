// src/services/sessionService.ts

import type { Session, LoginHistory, SecurityChange, SecurityStats, AuthStatus } from '../types/session';

// ============================================
// CONFIGURACIÓN DE API
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// ============================================
// FUNCIONES AUXILIARES
// ============================================

const getToken = (): string | null => {
  return localStorage.getItem('access_token');
};

const getHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

/**
 * Obtiene el nombre legible del dispositivo combinando marca y modelo
 */
export const getDeviceDisplayName = (device: { 
  device_brand?: string; 
  device_model?: string; 
  device_name?: string 
}): string => {
  if (device.device_model && device.device_model !== "Dispositivo Desconocido") {
    if (device.device_brand && device.device_brand !== "Desconocido") {
      return `${device.device_brand} ${device.device_model}`;
    }
    return device.device_model;
  }
  return device.device_name || 'Dispositivo desconocido';
};

/**
 * Obtiene el emoji correspondiente a la marca del dispositivo
 */
export const getDeviceBrandEmoji = (brand?: string): string => {
  const emojis: Record<string, string> = {
    'Apple': '🍎',
    'Samsung': '📱',
    'Xiaomi': '📱',
    'POCO': '📱',
    'OnePlus': '📱',
    'Google': '🔍',
    'Huawei': '📱',
    'Honor': '📱',
    'Lenovo': '💻',
    'Dell': '💻',
    'HP': '💻',
    'ASUS': '💻',
    'Microsoft': '🪟',
    'Motorola': '📱',
    'Nokia': '📱',
    'Sony': '📱',
  };
  return brand ? emojis[brand] || '💻' : '💻';
};

/**
 * Obtiene el color asociado a la marca del dispositivo
 */
export const getDeviceBrandColor = (brand?: string): string => {
  const colors: Record<string, string> = {
    'Apple': '#A2AAAD',
    'Samsung': '#1428A0',
    'Xiaomi': '#FF6900',
    'POCO': '#FF6900',
    'OnePlus': '#EB0029',
    'Google': '#4285F4',
    'Huawei': '#FF0000',
    'Honor': '#005EFF',
    'Lenovo': '#E2231A',
    'Dell': '#007DB8',
    'HP': '#0096D6',
    'ASUS': '#005AA9',
    'Microsoft': '#F25022',
    'Motorola': '#5B5B5B',
    'Nokia': '#124191',
    'Sony': '#000000',
  };
  return brand ? colors[brand] || '#666666' : '#666666';
};

// ============================================
// SERVICIO DE SESIONES
// ============================================

export const sessionService = {
  /**
   * Obtener todas las sesiones activas del usuario
   */
  getSessions: async (): Promise<Session[]> => {
    try {
      const token = getToken();
      if (!token) {
        console.warn('⚠️ No hay token para obtener sesiones');
        return [];
      }

      const response = await fetch(`${API_BASE_URL}/api/sessions`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error al obtener sesiones: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting sessions:', error);
      return [];
    }
  },

  /**
   * Revocar una sesión específica
   */
  revokeSession: async (sessionId: string): Promise<boolean> => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No hay token para revocar sesión');
      }

      const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error al revocar sesión: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error revoking session:', error);
      throw error;
    }
  },

  /**
   * Revocar todas las sesiones excepto la actual
   */
  revokeAllSessions: async (): Promise<{ revoked_count: number }> => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No hay token para revocar sesiones');
      }

      const response = await fetch(`${API_BASE_URL}/api/sessions/revoke-all`, {
        method: 'POST',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error al revocar sesiones: ${response.status}`);
      }

      const data = await response.json();
      return { revoked_count: data.revoked_count || 0 };
    } catch (error) {
      console.error('Error revoking all sessions:', error);
      throw error;
    }
  },

  /**
   * Obtener historial de inicios de sesión
   */
  getLoginHistory: async (limit: number = 50, offset: number = 0): Promise<LoginHistory[]> => {
    try {
      const token = getToken();
      if (!token) {
        return [];
      }

      const response = await fetch(
        `${API_BASE_URL}/api/sessions/login-history?limit=${limit}&offset=${offset}`,
        {
          method: 'GET',
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Error al obtener historial de login: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting login history:', error);
      return [];
    }
  },

  /**
   * Obtener historial de cambios de seguridad
   */
  getSecurityChanges: async (limit: number = 50, offset: number = 0): Promise<SecurityChange[]> => {
    try {
      const token = getToken();
      if (!token) {
        return [];
      }

      const response = await fetch(
        `${API_BASE_URL}/api/sessions/security-changes?limit=${limit}&offset=${offset}`,
        {
          method: 'GET',
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Error al obtener cambios de seguridad: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting security changes:', error);
      return [];
    }
  },

  /**
   * Obtener estadísticas de seguridad
   */
  getSecurityStats: async (): Promise<SecurityStats> => {
    try {
      const token = getToken();
      if (!token) {
        return {
          total_logins: 0,
          unique_devices: 0,
          last_login: null,
          security_score: 0,
          recommendations: ['Inicia sesión para ver estadísticas de seguridad'],
          has_passkey: false,
          has_2fa: false,
        };
      }

      const response = await fetch(`${API_BASE_URL}/api/sessions/security-stats`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error al obtener estadísticas de seguridad: ${response.status}`);
      }

      const data = await response.json();
      return {
        total_logins: data.total_logins ?? 0,
        unique_devices: data.unique_devices ?? 0,
        last_login: data.last_login ?? null,
        security_score: data.security_score ?? 0,
        recommendations: data.recommendations ?? [],
        has_passkey: data.has_passkey ?? false,
        has_2fa: data.has_2fa ?? false,
        days_since_password_change: data.days_since_password_change ?? null,
      };
    } catch (error) {
      console.error('Error getting security stats:', error);
      return {
        total_logins: 0,
        unique_devices: 0,
        last_login: null,
        security_score: 0,
        recommendations: ['No se pudieron cargar las estadísticas de seguridad'],
        has_passkey: false,
        has_2fa: false,
      };
    }
  },

  /**
   * Verificar estado de autenticación
   */
  checkAuthStatus: async (): Promise<AuthStatus> => {
    try {
      const token = getToken();
      if (!token) {
        return { is_authenticated: false };
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        return { is_authenticated: false };
      }

      const data = await response.json();
      return {
        is_authenticated: true,
        user_id: data.user_id,
        email: data.email,
      };
    } catch (error) {
      console.error('Error checking auth status:', error);
      return { is_authenticated: false };
    }
  },

  /**
   * Obtener actividad reciente del usuario
   */
  getRecentActivity: async (limit: number = 20): Promise<{ 
    login_history: LoginHistory[]; 
    security_changes: SecurityChange[] 
  }> => {
    try {
      const [loginHistory, securityChanges] = await Promise.all([
        sessionService.getLoginHistory(limit, 0),
        sessionService.getSecurityChanges(limit, 0),
      ]);

      return { login_history: loginHistory, security_changes: securityChanges };
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return { login_history: [], security_changes: [] };
    }
  },
};

export default sessionService;