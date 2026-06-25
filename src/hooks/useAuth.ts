// src/hooks/useAuth.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PublicKeyCredentialDescriptorJSON } from '@simplewebauthn/browser';
import authService from '../services/authService';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar?: string;
  banner?: string;
  bio?: string;
  email_verified?: boolean;
  created_at?: string;
  last_sign_in_at?: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface PasskeyLoginResult {
  success: boolean;
  user?: UserProfile;
  message?: string;
}

export interface PasskeyRegisterResult {
  success: boolean;
  message?: string;
}

export interface LoginResponse {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  user?: UserProfile;
  requires_2fa?: boolean;
  message?: string;
  user_id?: string;
}

const TOKEN_VERSION_ERROR_KEY = 'token_version_error_shown';

// ============================================
// ✅ PASO 1: FUNCIÓN CORREGIDA PARA OBTENER RP ID
// ============================================

/**
 * Obtiene el RP ID correcto según el entorno
 * - En desarrollo local (localhost): usa "localhost"
 * - En producción: usa el dominio del frontend
 */
function getCorrectRpId(): string {
  const hostname = window.location.hostname;
  
  // ✅ En desarrollo local (localhost), usar "localhost"
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('🏠 [WebAuthn] Entorno LOCAL detectado, RP ID: localhost');
    return 'localhost';
  }
  
  // ✅ En producción, usar el dominio del frontend
  // El RP ID debe ser el dominio del sitio web, no del backend
  console.log(`🌐 [WebAuthn] Entorno PRODUCCIÓN detectado, RP ID: ${hostname}`);
  return hostname;
}


export const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [tokenVersionError, setTokenVersionError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const loadingRef = useRef(false);

  const handleTokenVersionInvalid = useCallback((event: CustomEvent) => {
    const message = event.detail?.message || 'Tu sesión expiró por cambio de contraseña. Por favor, inicia sesión nuevamente.';
    console.log('🔐 Token version inválido detectado:', message);
    
    const lastShown = sessionStorage.getItem(TOKEN_VERSION_ERROR_KEY);
    const now = Date.now();
    
    if (lastShown && (now - parseInt(lastShown)) < 5000) {
      return;
    }
    
    sessionStorage.setItem(TOKEN_VERSION_ERROR_KEY, now.toString());
    setTokenVersionError(message);
    setUser(null);
    setIsAuthenticated(false);
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_at');
    
    setTimeout(() => {
      if (isMounted.current) {
        setTokenVersionError(null);
        sessionStorage.removeItem(TOKEN_VERSION_ERROR_KEY);
        navigate('/login', { replace: true, state: { sessionExpired: true, message } });
      }
    }, 3000);
  }, [navigate]);

  const loadUser = useCallback(async () => {
    if (loadingRef.current) {
      console.log('⚠️ loadUser: Ya en progreso, omitiendo...');
      return;
    }
    
    loadingRef.current = true;
    console.log('🔄 loadUser: Iniciando carga de usuario...');
    
    try {
      const authenticated = authService.isAuthenticated();
      console.log('🔍 loadUser: isAuthenticated =', authenticated);
      
      if (isMounted.current) {
        setIsAuthenticated(authenticated);
      }
      
      if (authenticated) {
        const userData = authService.getUserFromToken();
        console.log('🔍 loadUser: userData del token =', userData?.email);
        
        if (userData) {
          // Intentar obtener perfil completo de Supabase
          let profile = null;
          try {
            profile = await authService.getProfile();
            if (profile && isMounted.current) {
              console.log('✅ loadUser: Perfil completo cargado:', profile.email);
            }
          } catch (profileError) {
            console.warn('⚠️ loadUser: No se pudo cargar perfil de Supabase:', profileError);
          }
          
          if (isMounted.current) {
            if (profile) {
              // Usar datos del perfil de Supabase (prioridad)
              setUser({
                id: profile.id || userData.id,
                email: profile.email || userData.email,
                username: profile.username || userData.username,
                full_name: profile.full_name || userData.full_name || undefined,
                avatar: profile.avatar || userData.avatar || undefined,
                banner: profile.banner || userData.banner || undefined,
                bio: profile.bio || userData.bio || undefined,
                email_verified: profile.email_verified ?? userData.email_verified ?? false,
                created_at: profile.created_at || userData.created_at,
                last_sign_in_at: profile.last_sign_in_at || userData.last_sign_in_at,
              });
            } else {
              // Fallback: usar datos del token JWT
              console.log('✅ loadUser: Usando datos del token JWT');
              setUser({
                id: userData.id,
                email: userData.email,
                username: userData.username,
                full_name: userData.full_name || undefined,
                avatar: userData.avatar || undefined,
                banner: userData.banner || undefined,
                bio: userData.bio || undefined,
                email_verified: userData.email_verified ?? false,
                created_at: userData.created_at,
                last_sign_in_at: userData.last_sign_in_at,
              });
            }
          }
        } else {
          console.warn('⚠️ loadUser: No se pudo obtener userData del token');
          if (isMounted.current) {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } else {
        console.log('🔍 loadUser: Usuario no autenticado');
        if (isMounted.current) {
          setUser(null);
        }
      }
    } catch (err) {
      console.error('❌ loadUser: Error cargando usuario:', err);
      if (isMounted.current) {
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      loadingRef.current = false;
      console.log('✅ loadUser: Finalizado');
    }
  }, []);

  const saveTokens = useCallback((access_token: string, refresh_token?: string, expires_in?: number) => {
    console.log('💾 saveTokens: Guardando tokens...');
    localStorage.setItem('access_token', access_token);
    if (refresh_token) localStorage.setItem('refresh_token', refresh_token);
    if (expires_in) localStorage.setItem('token_expires_at', String(Date.now() + expires_in * 1000));
    console.log('✅ saveTokens: Tokens guardados exitosamente');
  }, []);

  const login = useCallback(async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
    console.log('🔐 login: Intentando login...');
    try {
      const response = await authService.login(credentials);
      console.log('📦 login: Respuesta recibida:', response);
      
      if (response.requires_2fa) {
        console.log('🔐 login: Usuario requiere 2FA');
        return {
          requires_2fa: true,
          message: response.message,
          user_id: response.user_id,
          user: response.user
        };
      }
      
      if (response.access_token) {
        saveTokens(response.access_token, response.refresh_token, response.expires_in);
        await loadUser();
        window.dispatchEvent(new CustomEvent('auth-change'));
      }
      
      return response;
    } catch (err) {
      console.error('❌ login: Error en login:', err);
      throw err;
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [loadUser, saveTokens]);

  const verify2FAAndLogin = useCallback(async (email: string, password: string, code: string): Promise<LoginResponse> => {
    setLoading(true);
    try {
      console.log('🔐 verify2FAAndLogin: Verificando código 2FA para:', email);
      const response = await authService.verify2FA(email, password, code);
      console.log('✅ verify2FAAndLogin: 2FA verificado exitosamente');
      
      if (response.access_token) {
        saveTokens(response.access_token, response.refresh_token, response.expires_in);
        if (isMounted.current) setIsAuthenticated(true);
        await loadUser();
        window.dispatchEvent(new CustomEvent('auth-change'));
      }
      
      return {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        expires_in: response.expires_in,
        user: response.user
      };
    } catch (err) {
      console.error('❌ verify2FAAndLogin: Error:', err);
      throw err;
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [loadUser, saveTokens]);

  const verifyOtpAndLogin = useCallback(async (email: string, code: string): Promise<LoginResponse> => {
    setLoading(true);
    try {
      console.log('🔐 verifyOtpAndLogin: Verificando OTP para:', email);
      const response = await authService.verifyOtp(email, code);
      console.log('✅ verifyOtpAndLogin: OTP verificado exitosamente');
      
      if (response.access_token) {
        saveTokens(response.access_token, response.refresh_token, response.expires_in);
        if (isMounted.current) setIsAuthenticated(true);
        await loadUser();
        window.dispatchEvent(new CustomEvent('auth-change'));
      }
      
      return {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        expires_in: response.expires_in,
        user: response.user
      };
    } catch (err) {
      console.error('❌ verifyOtpAndLogin: Error:', err);
      throw err;
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [loadUser, saveTokens]);

  const logout = useCallback(() => {
    console.log('🔓 logout: Cerrando sesión...');
    if (isMounted.current) {
      setUser(null);
      setIsAuthenticated(false);
      setTokenVersionError(null);
      setLoading(false);
    }
    authService.logout();
    window.dispatchEvent(new CustomEvent('auth-change'));
    navigate('/login', { replace: true });
  }, [navigate]);

  const refreshTokenIfNeeded = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) return false;
    try {
      const token = localStorage.getItem('access_token');
      if (!token) { logout(); return false; }
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const timeLeft = Math.floor((payload.exp - Date.now() / 1000) / 60);
        if (timeLeft > 5) return true;
      } catch { logout(); return false; }
      
      const refreshed = await authService.refreshToken();
      if (refreshed) { await loadUser(); return true; }
      else { logout(); return false; }
    } catch {
      logout();
      return false;
    }
  }, [isAuthenticated, logout, loadUser]);

  // ============================================
  // ✅ PASO 2 Y 3: registerPasskey y loginWithPasskey CORREGIDOS
  // ============================================

  const registerPasskey = useCallback(async (deviceName?: string): Promise<PasskeyRegisterResult> => {
    if (!isAuthenticated) return { success: false, message: 'Debes iniciar sesión primero' };
    const tokenValid = await refreshTokenIfNeeded();
    if (!tokenValid) return { success: false, message: 'Sesión expirada' };
    
    setPasskeyLoading(true);
    try {
      const options = await authService.webauthnRegisterBegin({ 
        device_name: deviceName || 'Mi Dispositivo', 
        device_type: 'web' 
      });
      
      const { startRegistration } = await import('@simplewebauthn/browser');
      
      // ✅ OBTENER EL RP ID CORRECTO SEGÚN EL ENTORNO
      const rpId = getCorrectRpId();
      console.log('🔑 registerPasskey: Usando RP ID:', rpId);
      
      const attestationResponse = await startRegistration({
        optionsJSON: {
          challenge: options.challenge,
          rp: { id: rpId, name: options.rp_name },  // ✅ Usar el RP ID correcto
          user: { 
            id: options.user_id, 
            name: options.username, 
            displayName: options.display_name 
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 }, 
            { type: 'public-key', alg: -257 }
          ],
          authenticatorSelection: { 
            residentKey: 'required', 
            userVerification: 'preferred' 
          },
          attestation: 'none',
        },
      });
      
      const result = await authService.webauthnRegisterComplete({
        credential_id: attestationResponse.id,
        client_data_json: attestationResponse.response.clientDataJSON,
        attestation_object: attestationResponse.response.attestationObject,
        device_name: deviceName || 'Mi Dispositivo', 
        device_type: 'web', 
        challenge: options.challenge,
      });
      
      if (result.success) { 
        window.dispatchEvent(new CustomEvent('passkeys-updated')); 
        return { success: true, message: result.message }; 
      } else { 
        return { success: false, message: result.message }; 
      }
    } catch (err: unknown) {
      let errorMessage = 'Error al registrar passkey';
      if (err instanceof Error) errorMessage = err.message;
      console.error('❌ registerPasskey: Error:', errorMessage);
      return { success: false, message: errorMessage };
    } finally { 
      setPasskeyLoading(false); 
    }
  }, [isAuthenticated, refreshTokenIfNeeded]);

  const loginWithPasskey = useCallback(async (email?: string): Promise<PasskeyLoginResult> => {
    setPasskeyLoading(true);
    try {
      console.log('🔑 loginWithPasskey: Iniciando...', email ? `para ${email}` : 'sin email');
      
      const options = await authService.webauthnLoginBegin({ email });
      const { startAuthentication } = await import('@simplewebauthn/browser');
      
      let allowCredentials: PublicKeyCredentialDescriptorJSON[] | undefined = undefined;
      if (options.allow_credentials?.length) {
        allowCredentials = options.allow_credentials.map((cred: { id: string; type: string }) => ({
          id: cred.id, 
          type: 'public-key' as const,
          transports: ['internal', 'hybrid', 'ble', 'nfc', 'usb'] as const,
        }));
      }
      
      // ✅ OBTENER EL RP ID CORRECTO SEGÚN EL ENTORNO
      const rpId = getCorrectRpId();
      console.log('🔑 loginWithPasskey: Usando RP ID:', rpId);
      
      const authResponse = await startAuthentication({
        optionsJSON: { 
          challenge: options.challenge, 
          rpId,  // ✅ Usar el RP ID correcto
          allowCredentials, 
          timeout: options.timeout || 60000, 
          userVerification: 'preferred' 
        },
      });
      
      const result = await authService.webauthnLoginComplete({
        credential_id: authResponse.id,
        client_data_json: authResponse.response.clientDataJSON,
        authenticator_data: authResponse.response.authenticatorData,
        signature: authResponse.response.signature,
        user_handle: authResponse.response.userHandle, 
        challenge: options.challenge,
      });
      
      if (result.success && result.access_token) {
        // Los tokens ya fueron guardados por authService.webauthnLoginComplete
        if (isMounted.current) setIsAuthenticated(true);
        await loadUser();
        window.dispatchEvent(new CustomEvent('auth-change'));
        
        const userProfile: UserProfile = {
          id: result.user?.id || '', 
          email: result.user?.email || '',
          username: result.user?.username || result.user?.email?.split('@')[0] || '',
          full_name: result.user?.full_name, 
          avatar: result.user?.avatar,
        };
        
        if (isMounted.current) { 
          setUser(userProfile); 
          setIsAuthenticated(true); 
        }
        
        return { 
          success: true, 
          user: userProfile, 
          message: result.message || 'Login exitoso con passkey' 
        };
      } else {
        return { 
          success: false, 
          message: result.message || 'Error al autenticar con passkey' 
        };
      }
    } catch (err: unknown) {
      let errorMessage = 'Error al iniciar sesión con passkey';
      if (err instanceof Error) {
        errorMessage = err.message;
        console.error('❌ loginWithPasskey: Error:', err.message);
      }
      return { success: false, message: errorMessage };
    } finally { 
      setPasskeyLoading(false); 
    }
  }, [loadUser]);

  const listPasskeys = useCallback(async () => {
    if (!isAuthenticated) return [];
    try { 
      return await authService.webauthnListCredentials(); 
    } catch { 
      return []; 
    }
  }, [isAuthenticated]);

  const deletePasskey = useCallback(async (credentialId: string): Promise<{ success: boolean; message?: string }> => {
    if (!isAuthenticated) return { success: false, message: 'Debes iniciar sesión primero' };
    try {
      const result = await authService.webauthnDeleteCredential(credentialId);
      if (result.success) window.dispatchEvent(new CustomEvent('passkeys-updated'));
      return result;
    } catch { 
      return { success: false, message: 'Error al eliminar passkey' }; 
    }
  }, [isAuthenticated]);

  const checkWebAuthnHealth = useCallback(async () => {
    try { 
      return await authService.webauthnHealthCheck(); 
    } catch { 
      return { status: 'error', rp_id: '', configured: false }; 
    }
  }, []);

  const refreshUser = useCallback(() => { 
    loadUser(); 
  }, [loadUser]);

  const updateLocalProfile = useCallback((updates: Partial<UserProfile>) => {
    if (user && isMounted.current) {
      setUser(prev => prev ? { ...prev, ...updates } : prev);
    }
  }, [user]);

  const isTokenExpiringSoon = useCallback((): boolean => {
    const expiresAt = localStorage.getItem('token_expires_at');
    if (!expiresAt) return true;
    return parseInt(expiresAt) - Date.now() < 5 * 60 * 1000;
  }, []);

  const clearTokenVersionError = useCallback(() => {
    setTokenVersionError(null);
    sessionStorage.removeItem(TOKEN_VERSION_ERROR_KEY);
  }, []);

  useEffect(() => {
    console.log('🔧 useEffect: Inicializando hook useAuth');
    isMounted.current = true;
    if (!loadingRef.current) loadUser();

    const handleAuthChange = () => { 
      console.log('📢 Evento auth-change recibido'); 
      loadUser(); 
    };
    
    const handleAuthLogout = () => {
      if (isMounted.current) { 
        setUser(null); 
        setIsAuthenticated(false); 
        setTokenVersionError(null); 
        setLoading(false); 
      }
      navigate('/login', { replace: true });
    };
    
    const handleTokenVersionInvalidEvent = (event: Event) => { 
      handleTokenVersionInvalid(event as CustomEvent); 
    };

    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('auth:logout', handleAuthLogout);
    window.addEventListener('auth:token_version_invalid', handleTokenVersionInvalidEvent);
    
    return () => {
      isMounted.current = false;
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('auth:logout', handleAuthLogout);
      window.removeEventListener('auth:token_version_invalid', handleTokenVersionInvalidEvent);
    };
  }, [loadUser, navigate, handleTokenVersionInvalid]);

  return {
    user,
    isAuthenticated,
    loading,
    passkeyLoading,
    tokenVersionError,
    login,
    verify2FAAndLogin,
    verifyOtpAndLogin,
    logout,
    refreshUser,
    updateLocalProfile,
    isTokenExpiringSoon,
    refreshTokenIfNeeded,
    clearTokenVersionError,
    loginWithPasskey,
    registerPasskey,
    listPasskeys,
    deletePasskey,
    checkWebAuthnHealth,
  };
};