// src/services/authService.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

// ============================================
// INTERFACES
// ============================================

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

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  full_name: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user_id: string;
  email: string;
  username: string;
  requires_email_verification: boolean;
}

export interface LoginResponse {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  user?: {
    id: string;
    email: string;
    username: string;
    full_name?: string;
    avatar?: string;
    email_verified: boolean;
  };
  requires_2fa?: boolean;
  message?: string;
  user_id?: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface WebAuthnRegistrationBeginRequest {
  device_name?: string;
  device_type?: string;
}

export interface WebAuthnRegistrationBeginResponse {
  challenge: string;
  user_id: string;
  username: string;
  display_name: string;
  rp_id: string;
  rp_name: string;
  attestation: string;
  pub_key_cred_params: Array<{ type: string; alg: number }>;
}

export interface WebAuthnRegistrationCompleteRequest {
  credential_id: string;
  client_data_json: string;
  attestation_object: string;
  device_name?: string;
  device_type?: string;
  challenge: string;
}

export interface WebAuthnRegistrationCompleteResponse {
  success: boolean;
  credential_id: string;
  message: string;
}

export interface WebAuthnLoginBeginRequest {
  email?: string;
}

export interface WebAuthnLoginBeginResponse {
  challenge: string;
  rp_id: string;
  allow_credentials: Array<{ id: string; type: string }> | null;
  timeout: number;
}

export interface WebAuthnLoginCompleteRequest {
  credential_id: string;
  client_data_json: string;
  authenticator_data: string;
  signature: string;
  user_handle?: string | null;
  challenge: string;
}

export interface WebAuthnLoginCompleteResponse {
  success: boolean;
  access_token: string | null;
  refresh_token: string | null;
  user: {
    id: string;
    email: string;
    username?: string;
    full_name?: string;
    avatar?: string;
  } | null;
  message: string;
}

export interface WebAuthnCredential {
  id: string;
  credential_id: string;
  device_name?: string;
  device_type?: string;
  created_at: string;
  last_used?: string;
}

export interface OtpSendResponse {
  message: string;
  expires_in: number;
}

export interface OtpVerifyResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    username: string;
    full_name?: string;
    avatar?: string;
    email_verified: boolean;
  };
}

export interface ForgotPasswordOtpResponse {
  message: string;
}

export interface ResetPasswordOtpResponse {
  message: string;
  success?: boolean;
}

export interface TwoFactorSetupResponse {
  secret: string;
  qr_code: string;
  provisioning_uri: string;
}

export interface TwoFactorEnableResponse {
  message: string;
  recovery_codes: string[];
}

export interface TwoFactorStatusResponse {
  enabled: boolean;
  has_recovery_codes: boolean;
}

export interface TwoFactorVerifyResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    username: string;
    full_name?: string;
    avatar?: string;
    email_verified: boolean;
  };
}

export interface ApiErrorResponse {
  detail?: string;
  message?: string;
  error?: string;
  status?: number;
}

export class TokenVersionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenVersionError';
  }
}

// ============================================
// CONSTANTES
// ============================================

const TOKEN_KEYS = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
  EXPIRES: 'token_expires_at',
} as const;

const PUBLIC_ENDPOINTS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/forgot-password',
  '/api/auth/forgot-password-otp',
  '/api/auth/reset-password',
  '/api/auth/reset-password-otp',
  '/api/webauthn/login/begin',
  '/api/webauthn/login/complete',
  '/api/auth/otp/send',
  '/api/auth/otp/verify',
  '/api/auth/2fa/verify',
];

// ============================================
// SERVICIO PRINCIPAL
// ============================================

class AuthService {
  private axiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    console.log('🔧 API_URL configurada:', API_URL || '(usando proxy con /api)');
    
    this.axiosInstance = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  // ✅ Suscribir callbacks para cuando el token se refresque
  private onTokenRefreshed(token: string): void {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  // ✅ Agregar callback a la cola de refresh
  private addRefreshSubscriber(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  private setupInterceptors(): void {
    // Interceptor de peticiones
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => 
          config.url?.includes(endpoint)
        );
        
        console.log(`📡 [REQUEST] ${config.method?.toUpperCase()} ${config.url}`);
        
        if (isPublicEndpoint) {
          config.withCredentials = false;
          console.log(`🔓 [PUBLIC] Endpoint público: ${config.url}`);
          if (config.headers) {
            delete config.headers.Authorization;
          }
        } else {
          config.withCredentials = true;
          const token = this.getToken();
          if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
            console.log(`🔐 [AUTH] Token añadido a ${config.url}`);
          } else {
            console.warn(`⚠️ [AUTH] No hay token para ${config.url}`);
          }
        }
        
        return config;
      },
      (error: AxiosError) => {
        console.error('❌ [REQUEST ERROR]', error.message);
        return Promise.reject(error);
      }
    );

    // Interceptor de respuestas
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(`✅ [RESPONSE] ${response.config.url} - ${response.status}`);
        return response;
      },
      async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
        if (!originalRequest) {
          return Promise.reject(error);
        }

        const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => 
          originalRequest.url?.includes(endpoint)
        );

        // ✅ Manejar token version inválido (cambio de contraseña)
        if (error.response?.status === 401 && 
            error.response?.data?.detail?.includes('session has expired due to password change')) {
          this.clearTokens();
          window.dispatchEvent(new CustomEvent('auth:token_version_invalid', {
            detail: { message: error.response?.data?.detail || 'Sesión expirada' }
          }));
          window.dispatchEvent(new CustomEvent('auth:logout'));
          return Promise.reject(new TokenVersionError(
            error.response?.data?.detail || 'Sesión expirada'
          ));
        }

        // ✅ Auto-refresh de token para endpoints protegidos
        if (error.response?.status === 401 && 
            !originalRequest._retry && 
            !isPublicEndpoint) {
          
          if (this.isRefreshing) {
            // Ya hay un refresh en progreso, esperar
            return new Promise((resolve) => {
              this.addRefreshSubscriber((token: string) => {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.axiosInstance(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshed = await this.refreshToken();
            if (refreshed) {
              const token = this.getToken();
              if (token) {
                this.onTokenRefreshed(token);
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.axiosInstance(originalRequest);
              }
            }
          } catch (refreshError) {
            console.error('❌ [AUTH] Error en refresh:', refreshError);
          } finally {
            this.isRefreshing = false;
          }

          // Si falla el refresh, limpiar y redirigir
          this.clearTokens();
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }

        console.error(`❌ [RESPONSE ERROR] ${originalRequest.url} - ${error.response?.status}`);
        return Promise.reject(error);
      }
    );
  }

  // ============================================
  // MÉTODOS DE AUTENTICACIÓN
  // ============================================

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await this.axiosInstance.post('/api/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });
      
      if (response.data.requires_2fa) {
        return {
          requires_2fa: true,
          message: response.data.message,
          user_id: response.data.user_id,
          user: response.data.user,
          access_token: '',
          refresh_token: '',
          token_type: 'bearer',
          expires_in: 0,
        };
      }

      const { access_token, refresh_token, token_type, expires_in, user } = response.data;
      
      if (!access_token) {
        throw new Error('No se recibió token de acceso');
      }

      this.saveTokens(access_token, refresh_token, expires_in);
      
      return {
        access_token,
        refresh_token: refresh_token || '',
        token_type: token_type || 'bearer',
        expires_in: expires_in || 3600,
        user,
      };
    } catch (err) {
      const e = err as AxiosError<ApiErrorResponse>;
      this.clearTokens();
      
      let msg = 'Error al iniciar sesión';
      if (e.response?.status === 401) {
        msg = e.response?.data?.detail || 'Credenciales incorrectas';
      } else if (e.response?.status === 503) {
        msg = 'Servicio no disponible. Intente más tarde.';
      } else if (e.code === 'ECONNABORTED') {
        msg = 'El servidor está tardando en responder. Intente de nuevo.';
      }
      
      throw {
        message: msg,
        status: e.response?.status || 500,
      };
    }
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH);
    if (!refreshToken) {
      console.warn('⚠️ [AUTH] No hay refresh token');
      return false;
    }

    try {
      console.log('🔄 [AUTH] Intentando refrescar token...');
      const response = await this.axiosInstance.post('/api/auth/refresh', {
        refresh_token: refreshToken,
      });

      if (response.data.access_token) {
        this.saveTokens(
          response.data.access_token,
          response.data.refresh_token,
          response.data.expires_in
        );
        console.log('✅ [AUTH] Token refrescado exitosamente');
        return true;
      }
      
      console.warn('⚠️ [AUTH] Respuesta de refresh sin token');
      return false;
    } catch (error) {
      console.error('❌ [AUTH] Error refrescando token:', error);
      return false;
    }
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH);
    
    if (refreshToken) {
      try {
        await this.axiosInstance.post('/api/auth/logout', {
          refresh_token: refreshToken,
        });
      } catch {
        // Ignorar errores en logout
      }
    }

    this.clearTokens();
    window.dispatchEvent(new CustomEvent('auth-change'));
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }

  // ============================================
  // UTILIDADES DE TOKENS
  // ============================================

  private saveTokens(access: string, refresh?: string, expiresIn?: number): void {
    localStorage.setItem(TOKEN_KEYS.ACCESS, access);
    if (refresh) localStorage.setItem(TOKEN_KEYS.REFRESH, refresh);
    if (expiresIn) {
      localStorage.setItem(TOKEN_KEYS.EXPIRES, String(Date.now() + expiresIn * 1000));
    }
  }

  private clearTokens(): void {
    localStorage.removeItem(TOKEN_KEYS.ACCESS);
    localStorage.removeItem(TOKEN_KEYS.REFRESH);
    localStorage.removeItem(TOKEN_KEYS.EXPIRES);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.ACCESS);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getUserFromToken(): UserProfile | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub || '',
        email: payload.email || '',
        username: payload.user_metadata?.username || 
                  payload.username || 
                  payload.email?.split('@')[0] || 
                  'Usuario',
        full_name: payload.user_metadata?.full_name || payload.full_name || undefined,
        avatar: payload.user_metadata?.avatar || payload.avatar || undefined,
        banner: payload.user_metadata?.banner || payload.banner || undefined,
        bio: payload.user_metadata?.bio || payload.bio || undefined,
        email_verified: payload.user_metadata?.email_verified || 
                        payload.email_verified || 
                        false,
        created_at: payload.created_at || undefined,
        last_sign_in_at: payload.last_sign_in_at || undefined,
      };
    } catch {
      return null;
    }
  }

  // ============================================
  // PERFIL
  // ============================================

  async getProfile(): Promise<UserProfile | null> {
    try {
      const token = this.getToken();
      if (!token) return null;
      
      const response = await this.axiosInstance.get('/api/users/profile');
      return response.data;
    } catch {
      return null;
    }
  }

  async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const response = await this.axiosInstance.put('/api/users/profile', profileData);
      return response.data;
    } catch {
      throw new Error('Error al actualizar perfil');
    }
  }

  // ============================================
  // OTP Y 2FA
  // ============================================

  async signInWithOtp(email: string): Promise<OtpSendResponse> {
    try {
      const response = await this.axiosInstance.post('/api/auth/otp/send', { email });
      return response.data;
    } catch (err) {
      const e = err as AxiosError<ApiErrorResponse>;
      throw {
        message: e.response?.data?.detail || 'Error al enviar código',
        status: e.response?.status || 500,
      };
    }
  }

  async verifyOtp(email: string, token: string): Promise<OtpVerifyResponse> {
    try {
      const response = await this.axiosInstance.post('/api/auth/otp/verify', {
        email,
        token,
      });
      
      const { access_token, refresh_token, expires_in } = response.data;
      this.saveTokens(access_token, refresh_token, expires_in);
      
      window.dispatchEvent(new CustomEvent('auth-change'));
      return response.data;
    } catch (err) {
      const e = err as AxiosError<ApiErrorResponse>;
      throw {
        message: e.response?.data?.detail || 'Error al verificar código',
        status: e.response?.status || 500,
      };
    }
  }

  async register(userData: RegisterData): Promise<RegisterResponse> {
    try {
      const response = await this.axiosInstance.post('/api/auth/register', userData);
      return {
        success: true,
        message: response.data.message || 'Registro exitoso',
        user_id: response.data.user_id,
        email: response.data.email,
        username: response.data.username,
        requires_email_verification: true,
      };
    } catch (err) {
      const e = err as AxiosError<ApiErrorResponse>;
      throw {
        message: e.response?.data?.detail || 'Error al registrar',
        status: e.response?.status || 500,
      };
    }
  }

  // ============================================
  // RECUPERACIÓN DE CONTRASEÑA
  // ============================================

  async forgotPassword(email: string) {
    const response = await this.axiosInstance.post('/api/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string) {
    const response = await this.axiosInstance.post('/api/auth/reset-password', {
      token,
      new_password: newPassword,
    });
    return response.data;
  }

  async forgotPasswordOtp(email: string): Promise<ForgotPasswordOtpResponse> {
    try {
      const response = await this.axiosInstance.post('/api/auth/forgot-password-otp', { email });
      return response.data;
    } catch (err) {
      const e = err as AxiosError<ApiErrorResponse>;
      throw {
        message: e.response?.data?.detail || 'Error al enviar el código de verificación',
        status: e.response?.status || 500,
      };
    }
  }

  async resetPasswordOtp(
    email: string,
    code: string,
    newPassword: string
  ): Promise<ResetPasswordOtpResponse> {
    try {
      const response = await this.axiosInstance.post('/api/auth/reset-password-otp', {
        email,
        code,
        new_password: newPassword,
      });
      return response.data;
    } catch (err) {
      const e = err as AxiosError<ApiErrorResponse>;
      throw {
        message: e.response?.data?.detail || 'Error al cambiar la contraseña',
        status: e.response?.status || 500,
      };
    }
  }

  // ============================================
  // CAMBIO DE CONTRASEÑA (AUTENTICADO)
  // ============================================

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await this.axiosInstance.post('/api/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  }

  // ============================================
  // 2FA (TOTP)
  // ============================================

  async setup2FA(password: string) {
    const response = await this.axiosInstance.post('/api/auth/2fa/setup', { password });
    return response.data;
  }

  async enable2FA(code: string) {
    const response = await this.axiosInstance.post('/api/auth/2fa/enable', { code });
    return response.data;
  }

  async verify2FA(email: string, password: string, code: string) {
    const response = await this.axiosInstance.post('/api/auth/2fa/verify', {
      email,
      password,
      code,
    });
    
    const { access_token, refresh_token, expires_in, user } = response.data;
    this.saveTokens(access_token, refresh_token, expires_in);
    
    window.dispatchEvent(new CustomEvent('auth-change'));
    return { access_token, refresh_token, expires_in, user };
  }

  async disable2FA(password: string, code: string) {
    const response = await this.axiosInstance.post('/api/auth/2fa/disable', {
      password,
      code,
    });
    return response.data;
  }

  async get2FAStatus(): Promise<TwoFactorStatusResponse> {
    try {
      const response = await this.axiosInstance.get('/api/auth/2fa/status');
      return response.data;
    } catch {
      return { enabled: false, has_recovery_codes: false };
    }
  }

  // ============================================
  // WEBAUTHN (PASSKEYS)
  // ============================================

  async webauthnRegisterBegin(request: WebAuthnRegistrationBeginRequest) {
    const token = this.getToken();
    if (!token) throw new Error('No hay sesión activa');
    
    const response = await this.axiosInstance.post(
      '/api/webauthn/register/begin',
      request,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async webauthnRegisterComplete(request: WebAuthnRegistrationCompleteRequest) {
    const token = this.getToken();
    if (!token) throw new Error('No hay sesión activa');
    
    const response = await this.axiosInstance.post(
      '/api/webauthn/register/complete',
      request,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async webauthnLoginBegin(request: WebAuthnLoginBeginRequest) {
    const response = await this.axiosInstance.post('/api/webauthn/login/begin', request);
    return response.data;
  }

  async webauthnLoginComplete(request: WebAuthnLoginCompleteRequest) {
    const response = await this.axiosInstance.post('/api/webauthn/login/complete', request);
    
    if (response.data.success && response.data.access_token) {
      this.saveTokens(
        response.data.access_token,
        response.data.refresh_token
      );
      window.dispatchEvent(new CustomEvent('auth-change'));
    }
    
    return response.data;
  }

  async webauthnListCredentials() {
    const token = this.getToken();
    if (!token) throw new Error('No hay sesión activa');
    
    const response = await this.axiosInstance.get(
      '/api/webauthn/credentials',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async webauthnDeleteCredential(credentialId: string) {
    const token = this.getToken();
    if (!token) throw new Error('No hay sesión activa');
    
    const response = await this.axiosInstance.delete(
      `/api/webauthn/credentials/${credentialId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async webauthnHealthCheck() {
    const response = await this.axiosInstance.get('/api/webauthn/health');
    return response.data;
  }

  // ============================================
  // AVATAR Y BANNER
  // ============================================

  async uploadAvatar(file: File) {
    try {
      if (!file.type.startsWith('image/')) {
        return { success: false, message: 'Solo se permiten imágenes' };
      }
      if (file.size > 2 * 1024 * 1024) {
        return { success: false, message: 'Máximo 2MB permitido' };
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await this.axiosInstance.post('/api/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });
      
      return {
        url: response.data.url,
        success: true,
        message: 'Avatar actualizado exitosamente',
      };
    } catch {
      return { success: false, message: 'Error al subir avatar' };
    }
  }

  async uploadBanner(file: File) {
    try {
      if (!file.type.startsWith('image/')) {
        return { success: false, message: 'Solo se permiten imágenes' };
      }
      if (file.size > 5 * 1024 * 1024) {
        return { success: false, message: 'Máximo 5MB permitido' };
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await this.axiosInstance.post('/api/users/banner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });
      
      return {
        url: response.data.url,
        success: true,
        message: 'Banner actualizado exitosamente',
      };
    } catch {
      return { success: false, message: 'Error al subir banner' };
    }
  }

  async deleteAvatar() {
    try {
      await this.axiosInstance.delete('/api/users/avatar');
      return { success: true, message: 'Avatar eliminado' };
    } catch {
      return { success: false, message: 'Error al eliminar avatar' };
    }
  }

  async deleteBanner() {
    try {
      await this.axiosInstance.delete('/api/users/banner');
      return { success: true, message: 'Banner eliminado' };
    } catch {
      return { success: false, message: 'Error al eliminar banner' };
    }
  }

  // ============================================
  // HEALTH CHECK
  // ============================================

  async healthCheck() {
    try {
      const response = await this.axiosInstance.get('/api/health', { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

const authService = new AuthService();
export default authService;