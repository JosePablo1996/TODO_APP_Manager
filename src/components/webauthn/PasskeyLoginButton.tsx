// src/components/webauthn/PasskeyLoginButton.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface PasskeyLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  email?: string;
  fullWidth?: boolean;
}

export const PasskeyLoginButton: React.FC<PasskeyLoginButtonProps> = ({
  onSuccess,
  onError,
  className = '',
  variant = 'primary',
  size = 'md',
  showIcon = true,
  email,
  fullWidth = false,
}) => {
  const navigate = useNavigate();
  const { 
    loginWithPasskey, 
    passkeyLoading, 
    checkWebAuthnHealth, 
    refreshTokenIfNeeded 
  } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<{ status: string; configured: boolean } | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Verificar soporte y salud del backend
  useEffect(() => {
    const checkSupport = async () => {
      try {
        const isWebAuthnSupported = window.PublicKeyCredential !== undefined;
        
        if (!isWebAuthnSupported) {
          setIsSupported(false);
          return;
        }
        
        const health = await checkWebAuthnHealth();
        setHealthStatus(health);
        setIsSupported(health.configured);
        
      } catch (err) {
        console.error('Error verificando soporte de WebAuthn:', err);
        setIsSupported(false);
      }
    };
    
    checkSupport();
  }, [checkWebAuthnHealth]);

  // Función de login con passkey
  const handleLogin = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!isSupported) {
        throw new Error('Tu navegador no soporta passkeys');
      }
      
      if (healthStatus && !healthStatus.configured) {
        throw new Error('El servicio de passkeys no está configurado correctamente');
      }
      
      console.log('🔑 Iniciando login con passkey...');
      const result = await loginWithPasskey(email);
      
      if (result.success) {
        console.log('✅ Login con passkey exitoso');
        
        if (onSuccess) {
          onSuccess();
        }
        
        navigate('/', { replace: true });
        
      } else {
        console.error('❌ Error en login con passkey:', result.message);
        
        if (result.message?.includes('sesión') || result.message?.includes('expirado')) {
          const refreshed = await refreshTokenIfNeeded();
          if (refreshed && retryCount < 2) {
            setRetryCount(prev => prev + 1);
            console.log(`🔄 Reintentando login (${retryCount + 1}/2)...`);
            setTimeout(() => handleLogin(), 500);
            return;
          }
          setError(result.message || 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          if (onError) {
            onError(result.message || 'Tu sesión ha expirado');
          }
        } else {
          setError(result.message || 'Error al iniciar sesión con passkey');
          if (onError) {
            onError(result.message || 'Error al iniciar sesión con passkey');
          }
        }
      }
    } catch (err: unknown) {
      console.error('❌ Error inesperado en handleLogin:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión con passkey';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [isSupported, healthStatus, loginWithPasskey, email, onSuccess, onError, refreshTokenIfNeeded, retryCount, navigate]);

  // Reintentar login
  const handleRetry = useCallback(() => {
    setError(null);
    setRetryCount(0);
    handleLogin();
  }, [handleLogin]);

  // Variantes de estilo
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 focus:ring-indigo-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const icons = {
    primary: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
      </svg>
    ),
    secondary: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
      </svg>
    ),
    outline: (
      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
      </svg>
    ),
  };

  // Si no hay soporte, mostrar mensaje
  if (isSupported === false) {
    return (
      <div className={`passkey-not-supported ${className}`}>
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Tu navegador no soporta passkeys. Por favor, usa un navegador compatible (Chrome, Safari, Edge, Firefox).</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`passkey-login-button ${className}`}>
      <button
        onClick={handleLogin}
        disabled={loading || passkeyLoading || !isSupported}
        className={`
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          rounded-lg font-medium transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center gap-2
        `}
      >
        {loading || passkeyLoading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Autenticando...</span>
          </>
        ) : (
          <>
            {showIcon && icons[variant]}
            <span>Iniciar sesión con passkey</span>
          </>
        )}
      </button>

      {/* Mensaje de error con opción de reintentar */}
      {error && (
        <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-xs animate-shake">
          <div className="flex items-start gap-2">
            <svg className="w-3 h-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="flex-1">{error}</span>
            {error.includes('sesión') || error.includes('expirado') ? (
              <button
                onClick={handleRetry}
                className="text-red-700 dark:text-red-400 hover:text-red-900 text-xs underline ml-2"
              >
                Reintentar
              </button>
            ) : (
              <button
                onClick={() => setError(null)}
                className="text-red-700 dark:text-red-400 hover:text-red-900"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Información adicional */}
      {!loading && !passkeyLoading && isSupported && healthStatus?.configured && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 justify-center">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Usa huella digital, Face ID o PIN</span>
        </div>
      )}

      {/* Estado de salud del backend */}
      {healthStatus && !healthStatus.configured && (
        <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-xs">
          <p className="text-orange-700 dark:text-orange-400 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Servicio de passkeys no disponible temporalmente
          </p>
        </div>
      )}
    </div>
  );
};

export default PasskeyLoginButton;