// src/components/profile/TwoFactorManager.tsx
import { useState, useEffect } from 'react';
import { 
  Shield, ShieldOff, AlertTriangle, CheckCircle, 
  AlertCircle, QrCode} from 'lucide-react';
import { TwoFactorSetup } from '../../auth/TwoFactorSetup';
import authService from '../../services/authService';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface TwoFactorManagerProps {
  onStatusChange?: (enabled: boolean) => void;
}

interface ApiError {
  message: string;
  status?: number;
  detail?: string;
}

export const TwoFactorManager = ({ onStatusChange }: TwoFactorManagerProps) => {
  const classes = useThemeClasses();
  const [isEnabled, setIsEnabled] = useState(false);
  const [hasRecoveryCodes, setHasRecoveryCodes] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Cargar estado de 2FA al montar el componente
  useEffect(() => {
    load2FAStatus();
  }, []);

  const load2FAStatus = async () => {
    setLoadingStatus(true);
    try {
      // ✅ Verificar que hay token antes de intentar
      const token = authService.getToken();
      if (!token) {
        console.log('🔐 No hay token, omitiendo carga de estado 2FA');
        setLoadingStatus(false);
        return;
      }
      
      console.log('🔐 Cargando estado 2FA...');
      const status = await authService.get2FAStatus();
      console.log('🔐 Estado 2FA recibido:', status);
      setIsEnabled(status.enabled);
      setHasRecoveryCodes(status.has_recovery_codes);
    } catch (err) {
      console.error('❌ Error cargando estado 2FA:', err);
      setIsEnabled(false);
      setHasRecoveryCodes(false);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleDisable = async () => {
    if (!password || !code) {
      setError('Completa todos los campos');
      return;
    }

    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await authService.disable2FA(password, code);
      setIsEnabled(false);
      setHasRecoveryCodes(false);
      if (onStatusChange) onStatusChange(false);
      setShowDisableModal(false);
      setPassword('');
      setCode('');
      setSuccessMessage('2FA ha sido desactivado exitosamente');
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Error al desactivar 2FA');
    } finally {
      setLoading(false);
    }
  };

  if (loadingStatus) {
    return (
      <div className="p-4 text-center">
        <div className="inline-block w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className={`text-sm mt-2 ${classes.text.secondary}`}>Cargando...</p>
      </div>
    );
  }

  if (showSetup) {
    return (
      <TwoFactorSetup
        onComplete={() => {
          setShowSetup(false);
          load2FAStatus();
          if (onStatusChange) onStatusChange(true);
          setSuccessMessage('2FA ha sido activado exitosamente');
          setTimeout(() => setSuccessMessage(''), 3000);
        }}
        onCancel={() => setShowSetup(false)}
      />
    );
  }

  return (
    <>
      {/* Estado actual */}
      <div className="space-y-4">
        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{successMessage}</span>
          </div>
        )}

        {/* Estado 2FA */}
        <div className={`flex items-center justify-between p-3 rounded-lg ${isEnabled ? 'bg-emerald-50 dark:bg-emerald-950/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isEnabled ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-gray-200 dark:bg-gray-700'}`}>
              {isEnabled ? (
                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <ShieldOff className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              )}
            </div>
            <div>
              <p className={`font-medium text-sm ${classes.text.primary}`}>
                {isEnabled ? '2FA Activado' : '2FA Desactivado'}
              </p>
              <p className={`text-xs ${classes.text.secondary}`}>
                {isEnabled 
                  ? 'Tu cuenta está protegida con autenticación de dos factores'
                  : 'Protege tu cuenta con una capa adicional de seguridad'}
              </p>
            </div>
          </div>
          {isEnabled && (
            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
              Activo
            </span>
          )}
        </div>

        {/* Información adicional cuando está activado */}
        {isEnabled && (
          <div className="space-y-3">
            <button
              onClick={() => setShowDisableModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition text-sm"
            >
              <ShieldOff className="w-4 h-4" />
              Desactivar 2FA
            </button>

            {!hasRecoveryCodes && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-xs text-yellow-800 dark:text-yellow-400">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  No tienes códigos de respaldo guardados. Te recomendamos generar unos nuevos.
                </p>
              </div>
            )}

            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-400">
                <QrCode className="w-4 h-4 inline mr-1" />
                <strong>¿Necesitas el código secreto?</strong> El código secreto solo está disponible durante la configuración inicial. 
                Si necesitas volver a escanear el QR, primero desactiva y luego vuelve a activar 2FA.
              </p>
            </div>
          </div>
        )}

        {/* Botón para activar 2FA */}
        {!isEnabled && (
          <button
            onClick={() => setShowSetup(true)}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2.5 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition flex items-center justify-center gap-2 text-sm"
          >
            <Shield className="w-4 h-4" />
            Activar 2FA
          </button>
        )}

        {/* Información educativa */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <details className="text-xs">
            <summary className={`cursor-pointer ${classes.text.secondary} hover:${classes.text.primary}`}>
              ¿Qué es la autenticación de dos factores?
            </summary>
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
              <p className={classes.text.secondary}>
                La autenticación de dos factores (2FA) añade una capa extra de seguridad a tu cuenta.
              </p>
              <p className={`font-medium text-xs ${classes.text.primary}`}>Beneficios:</p>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li className={classes.text.secondary}>Protege tu cuenta incluso si alguien obtiene tu contraseña</li>
                <li className={classes.text.secondary}>Los códigos de verificación cambian cada 30 segundos</li>
                <li className={classes.text.secondary}>Códigos de respaldo para recuperar acceso</li>
              </ul>
              <p className={`font-medium text-xs ${classes.text.primary} mt-2`}>Aplicaciones recomendadas:</p>
              <p className={classes.text.secondary}>Google Authenticator, Microsoft Authenticator, Authy</p>
            </div>
          </details>
        </div>
      </div>

      {/* Modal para desactivar 2FA */}
      {showDisableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <ShieldOff className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Desactivar 2FA</h3>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                ¿Estás seguro de que deseas desactivar la autenticación de dos factores? 
                Esto hará que tu cuenta sea menos segura.
              </p>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${classes.bg.input} ${classes.border.primary} ${classes.text.primary}`}
                    placeholder="Tu contraseña actual"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Código 2FA
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className={`w-full border rounded-lg px-3 py-2 text-sm text-center tracking-wider font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 ${classes.bg.input} ${classes.border.primary} ${classes.text.primary}`}
                    placeholder="123456"
                    maxLength={6}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Abre tu app de autenticación para obtener el código
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4 flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDisableModal(false);
                    setPassword('');
                    setCode('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDisable}
                  disabled={loading || !password || code.length !== 6}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Desactivando...' : 'Desactivar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TwoFactorManager;