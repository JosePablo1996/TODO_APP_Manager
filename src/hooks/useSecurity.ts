// src/hooks/useSecurity.ts

import { useState, useEffect, useCallback } from 'react';
import { sessionService } from '../services/sessionService';
import type { Session, LoginHistory, SecurityStats, SecurityChange } from '../types/session';

interface UseSecurityReturn {
  // Estados
  sessions: Session[];
  loginHistory: LoginHistory[];
  securityChanges: SecurityChange[];
  securityStats: SecurityStats | null;
  loading: boolean;
  error: string | null;
  
  // Acciones
  loadSessions: () => Promise<void>;
  loadLoginHistory: (limit?: number, offset?: number) => Promise<void>;
  loadSecurityStats: () => Promise<void>;
  loadSecurityChanges: (limit?: number, offset?: number) => Promise<void>;
  loadAllData: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<boolean>;
  revokeAllSessions: () => Promise<{ revoked_count: number }>;
  refreshData: () => Promise<void>;
  
  // Estados de carga específicos
  revokingSessionId: string | null;
  isRevokingAll: boolean;
}

export const useSecurity = (): UseSecurityReturn => {
  // Estados principales
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [securityChanges, setSecurityChanges] = useState<SecurityChange[]>([]);
  const [securityStats, setSecurityStats] = useState<SecurityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de carga específicos
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [isRevokingAll, setIsRevokingAll] = useState(false);

  // ============================================
  // FUNCIONES DE CARGA
  // ============================================

  /**
   * Cargar sesiones activas
   */
  const loadSessions = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const data = await sessionService.getSessions();
      setSessions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar sesiones';
      setError(message);
      console.error('Error loading sessions:', err);
    }
  }, []);

  /**
   * Cargar historial de accesos
   */
  const loadLoginHistory = useCallback(async (limit: number = 50, offset: number = 0): Promise<void> => {
    try {
      setError(null);
      const data = await sessionService.getLoginHistory(limit, offset);
      setLoginHistory(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar historial';
      setError(message);
      console.error('Error loading login history:', err);
    }
  }, []);

  /**
   * Cargar estadísticas de seguridad
   */
  const loadSecurityStats = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const data = await sessionService.getSecurityStats();
      setSecurityStats(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar estadísticas';
      setError(message);
      console.error('Error loading security stats:', err);
    }
  }, []);

  /**
   * Cargar cambios de seguridad
   */
  const loadSecurityChanges = useCallback(async (limit: number = 50, offset: number = 0): Promise<void> => {
    try {
      setError(null);
      const data = await sessionService.getSecurityChanges(limit, offset);
      setSecurityChanges(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar cambios de seguridad';
      setError(message);
      console.error('Error loading security changes:', err);
    }
  }, []);

  /**
   * Cargar todos los datos
   */
  const loadAllData = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadSessions(),
        loadLoginHistory(),
        loadSecurityStats(),
        loadSecurityChanges(),
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar datos de seguridad';
      setError(message);
      console.error('Error loading all security data:', err);
    } finally {
      setLoading(false);
    }
  }, [loadSessions, loadLoginHistory, loadSecurityStats, loadSecurityChanges]);

  // ============================================
  // FUNCIONES DE ACCIÓN
  // ============================================

  /**
   * Revocar una sesión específica
   */
  const revokeSession = useCallback(async (sessionId: string): Promise<boolean> => {
    setRevokingSessionId(sessionId);
    setError(null);
    
    try {
      const success = await sessionService.revokeSession(sessionId);
      
      if (success) {
        // Actualizar lista de sesiones
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      }
      
      return success;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al revocar sesión';
      setError(message);
      console.error('Error revoking session:', err);
      return false;
    } finally {
      setRevokingSessionId(null);
    }
  }, []);

  /**
   * Revocar todas las sesiones excepto la actual
   */
  const revokeAllSessions = useCallback(async (): Promise<{ revoked_count: number }> => {
    setIsRevokingAll(true);
    setError(null);
    
    try {
      const result = await sessionService.revokeAllSessions();
      
      // Actualizar lista de sesiones (solo queda la actual)
      if (result.revoked_count > 0) {
        setSessions(prev => prev.filter(s => s.is_current));
      }
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al revocar todas las sesiones';
      setError(message);
      console.error('Error revoking all sessions:', err);
      throw err;
    } finally {
      setIsRevokingAll(false);
    }
  }, []);

  /**
   * Refrescar todos los datos
   */
  const refreshData = useCallback(async (): Promise<void> => {
    await loadAllData();
  }, [loadAllData]);

  // ============================================
  // EFECTO DE CARGA INICIAL
  // ============================================

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ============================================
  // RETORNO
  // ============================================

  return {
    // Estados
    sessions,
    loginHistory,
    securityChanges,
    securityStats,
    loading,
    error,
    
    // Acciones
    loadSessions,
    loadLoginHistory,
    loadSecurityStats,
    loadSecurityChanges,
    loadAllData,
    revokeSession,
    revokeAllSessions,
    refreshData,
    
    // Estados de carga específicos
    revokingSessionId,
    isRevokingAll,
  };
};

export default useSecurity;