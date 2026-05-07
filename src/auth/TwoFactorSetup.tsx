// src/auth/TwoFactorSetup.tsx
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, Copy, Check, AlertCircle, Download, X, QrCode } from 'lucide-react';
import authService from '../services/authService';
import Portal from '../components/ui/Portal';

interface ApiError {
  message: string;
  status?: number;
  detail?: string;
}

interface TwoFactorSetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export const TwoFactorSetup = ({ onComplete, onCancel }: TwoFactorSetupProps) => {
  const [step, setStep] = useState<'password' | 'verify' | 'complete'>('password');
  const [secret, setSecret] = useState('');
  const [provisioningUri, setProvisioningUri] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [password, setPassword] = useState('');

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const startSetup = async () => {
    if (!password) {
      setError('Ingresa tu contraseña para continuar');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await authService.setup2FA(password);
      setSecret(response.secret);
      setProvisioningUri(response.provisioning_uri);
      setStep('verify');
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Error al configurar 2FA');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (verificationCode.length !== 6) {
      setError('Ingresa el código de 6 dígitos');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await authService.enable2FA(verificationCode);
      setRecoveryCodes(response.recovery_codes);
      setStep('complete');
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Código inválido. Verifica el código en tu aplicación de autenticación.');
    } finally {
      setLoading(false);
    }
  };

  const copyRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadRecoveryCodes = () => {
    const element = document.createElement('a');
    const content = recoveryCodes.join('\n');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `recovery_codes_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleComplete = () => {
    if (onComplete) onComplete();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  // Modal - Paso 1: Contraseña
  if (step === 'password') {
    return (
      <Portal>
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCancel();
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Configurar 2FA
                </h2>
              </div>
              <button
                onClick={handleCancel}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-4">
                Ingresa tu contraseña para continuar con la configuración.
              </p>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && startSetup()}
                placeholder="Tu contraseña actual"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
                autoFocus
              />

              {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-4 flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={startSetup}
                disabled={loading || !password}
                className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {loading ? 'Verificando...' : 'Continuar'}
              </button>
            </div>
          </div>
        </div>
      </Portal>
    );
  }

  // Modal - Paso 2: QR y Verificación
  if (step === 'verify') {
    return (
      <Portal>
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setStep('password');
              setPassword('');
            }
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Escanear QR
                </h2>
              </div>
              <button
                onClick={() => {
                  setStep('password');
                  setPassword('');
                }}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              {/* QR Code */}
              <div className="flex justify-center mb-4">
                {provisioningUri ? (
                  <div className="bg-white rounded-xl p-3 shadow-md border border-gray-200 dark:border-gray-700">
                    <QRCodeSVG 
                      value={provisioningUri}
                      size={200}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                ) : (
                  <div className="w-[200px] h-[200px] bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Secret manual */}
              <div className="text-center mb-5">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Código manual:
                </p>
                <code className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg break-all text-gray-700 dark:text-gray-300">
                  {secret}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(secret);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
                >
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-500" />}
                </button>
              </div>

              {/* Verification code input */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Código de verificación
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Abre Google Authenticator para obtener el código
                </p>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-4 flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={verifyAndEnable}
                disabled={loading || verificationCode.length !== 6}
                className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {loading ? 'Verificando...' : 'Activar 2FA'}
              </button>
            </div>
          </div>
        </div>
      </Portal>
    );
  }

  // Modal - Paso 3: Códigos de respaldo
  return (
    <Portal>
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={(e) => {
          if (e.target === e.currentTarget) handleComplete();
        }}
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4">
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                ¡2FA Activado!
              </h2>
            </div>
            <button
              onClick={handleComplete}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-5">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-400 text-sm mb-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Guarda estos códigos de respaldo
              </h3>
              <p className="text-xs text-yellow-700 dark:text-yellow-500 mb-3">
                Úsalos si pierdes acceso a tu app de autenticación.
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 font-mono text-xs border border-yellow-200 dark:border-yellow-800 max-h-36 overflow-y-auto">
                {recoveryCodes.map((rc, i) => (
                  <div key={i} className="py-1 text-gray-800 dark:text-gray-200 text-center">
                    {rc}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={copyRecoveryCodes}
                  className="flex-1 text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 py-1.5 border border-emerald-600 dark:border-emerald-500 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? '¡Copiado!' : 'Copiar'}
                </button>
                <button
                  onClick={downloadRecoveryCodes}
                  className="flex-1 text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 py-1.5 border border-emerald-600 dark:border-emerald-500 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition"
                >
                  <Download size={14} />
                  Descargar
                </button>
              </div>
            </div>

            <button
              onClick={handleComplete}
              className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition"
            >
              Entendido, cerrar
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default TwoFactorSetup;