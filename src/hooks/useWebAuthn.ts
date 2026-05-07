// src/hooks/useWebAuthn.ts
import { useCallback } from 'react';
import { useAuth } from './useAuth';
import type { WebAuthnCredential } from '../services/authService';

export interface WebAuthnState {
  isSupported: boolean;
  isAvailable: boolean;
}

export interface UseWebAuthnReturn {
  // Estados
  passkeyLoading: boolean;
  isAuthenticated: boolean;
  
  // Métodos
  registerPasskey: (deviceName?: string) => Promise<{ success: boolean; message?: string }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loginWithPasskey: (email?: string) => Promise<{ success: boolean; user?: any; message?: string }>;
  listPasskeys: () => Promise<WebAuthnCredential[]>;
  deletePasskey: (credentialId: string) => Promise<{ success: boolean; message?: string }>;
  checkHealth: () => Promise<{ status: string; rp_id: string; configured: boolean }>;
  isWebAuthnSupported: () => boolean;
}

/**
 * Hook específico para manejar funcionalidades de WebAuthn / Passkeys
 * 
 * @example
 * const { registerPasskey, loginWithPasskey, listPasskeys, isAuthenticated } = useWebAuthn();
 * 
 * // Verificar si el usuario está autenticado
 * if (isAuthenticated) {
 *   const passkeys = await listPasskeys();
 *   console.log('Passkeys:', passkeys);
 * }
 * 
 * // Registrar una nueva passkey
 * const result = await registerPasskey('Mi iPhone');
 * if (result.success) {
 *   console.log('Passkey registrada');
 * }
 * 
 * // Iniciar sesión con passkey
 * const loginResult = await loginWithPasskey('usuario@email.com');
 * if (loginResult.success) {
 *   console.log('Login exitoso', loginResult.user);
 * }
 */
export const useWebAuthn = (): UseWebAuthnReturn => {
  const {
    passkeyLoading,
    isAuthenticated,
    registerPasskey: registerPasskeyFromAuth,
    loginWithPasskey: loginWithPasskeyFromAuth,
    listPasskeys: listPasskeysFromAuth,
    deletePasskey: deletePasskeyFromAuth,
    checkWebAuthnHealth,
  } = useAuth();

  /**
   * Verifica si el navegador soporta WebAuthn
   */
  const isWebAuthnSupported = useCallback((): boolean => {
    return typeof window !== 'undefined' && 
           window.PublicKeyCredential !== undefined &&
           typeof window.PublicKeyCredential === 'function';
  }, []);

  /**
   * Registra una nueva passkey para el usuario actual
   * @param deviceName - Nombre opcional del dispositivo
   * @returns Resultado de la operación
   */
  const registerPasskey = useCallback(async (deviceName?: string) => {
    if (!isWebAuthnSupported()) {
      return { 
        success: false, 
        message: 'Tu navegador no soporta passkeys. Por favor, usa Chrome, Safari, Edge o Firefox actualizado.' 
      };
    }
    
    return await registerPasskeyFromAuth(deviceName);
  }, [registerPasskeyFromAuth, isWebAuthnSupported]);

  /**
   * Inicia sesión usando una passkey
   * @param email - Email opcional para identificar al usuario
   * @returns Resultado del login con los datos del usuario
   */
  const loginWithPasskey = useCallback(async (email?: string) => {
    if (!isWebAuthnSupported()) {
      return { 
        success: false, 
        message: 'Tu navegador no soporta passkeys. Por favor, usa Chrome, Safari, Edge o Firefox actualizado.' 
      };
    }
    
    return await loginWithPasskeyFromAuth(email);
  }, [loginWithPasskeyFromAuth, isWebAuthnSupported]);

  /**
   * Lista todas las passkeys registradas por el usuario actual
   * @returns Lista de credenciales
   */
  const listPasskeys = useCallback(async () => {
    return await listPasskeysFromAuth();
  }, [listPasskeysFromAuth]);

  /**
   * Elimina una passkey específica
   * @param credentialId - ID de la credencial a eliminar
   * @returns Resultado de la operación
   */
  const deletePasskey = useCallback(async (credentialId: string) => {
    return await deletePasskeyFromAuth(credentialId);
  }, [deletePasskeyFromAuth]);

  /**
   * Verifica el estado de salud del servicio WebAuthn en el backend
   * @returns Estado de configuración del backend
   */
  const checkHealth = useCallback(async () => {
    return await checkWebAuthnHealth();
  }, [checkWebAuthnHealth]);

  return {
    // Estados
    passkeyLoading,
    isAuthenticated,
    
    // Métodos
    registerPasskey,
    loginWithPasskey,
    listPasskeys,
    deletePasskey,
    checkHealth,
    isWebAuthnSupported,
  };
};

export default useWebAuthn;