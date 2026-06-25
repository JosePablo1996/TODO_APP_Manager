// src/types/session.ts

/**
 * Interfaz para una sesión activa del usuario
 */
export interface Session {
  /** ID único de la sesión */
  id: string;
  /** Nombre del dispositivo (ej: "Mi iPhone", "Laptop Personal") */
  device_name: string;
  /** Tipo de dispositivo (mobile, desktop, tablet, web) */
  device_type: string;
  /** Marca del dispositivo (Apple, Samsung, Lenovo, etc.) */
  device_brand?: string;
  /** Modelo específico (iPhone 15 Pro, ThinkPad, etc.) */
  device_model?: string;
  /** Navegador utilizado */
  browser: string;
  /** Sistema operativo */
  os: string;
  /** Dirección IP */
  ip_address: string;
  /** Ubicación aproximada */
  location: string;
  /** Indica si es la sesión actual */
  is_current: boolean;
  /** Última actividad */
  last_activity: string;
  /** Fecha de creación de la sesión */
  created_at: string;
}

/**
 * Interfaz para el historial de accesos
 */
export interface LoginHistory {
  /** ID único del registro */
  id: string;
  /** Tipo de login (password, otp, passkey, 2fa) */
  login_type: string;
  /** Dirección IP */
  ip_address: string;
  /** Nombre del dispositivo */
  device_name: string;
  /** Tipo de dispositivo */
  device_type: string;
  /** Marca del dispositivo */
  device_brand?: string;
  /** Modelo del dispositivo */
  device_model?: string;
  /** Navegador utilizado */
  browser: string;
  /** Sistema operativo */
  os: string;
  /** Ubicación aproximada */
  location: string;
  /** Estado (success, failed, pending) */
  status: string;
  /** Fecha de creación */
  created_at: string;
}

/**
 * Interfaz para cambios de seguridad
 */
export interface SecurityChange {
  /** ID único del registro */
  id: string;
  /** Tipo de cambio (password_change, 2fa_enable, 2fa_disable, etc.) */
  change_type: string;
  /** Valor anterior (si aplica) */
  old_value: string | null;
  /** Valor nuevo (si aplica) */
  new_value: string | null;
  /** Dirección IP */
  ip_address: string;
  /** Ubicación aproximada */
  location: string;
  /** Estado */
  status: string;
  /** Fecha de creación */
  created_at: string;
}

/**
 * Estadísticas de seguridad del usuario
 */
export interface SecurityStats {
  /** Total de inicios de sesión */
  total_logins: number;
  /** Número de dispositivos únicos */
  unique_devices: number;
  /** Último inicio de sesión */
  last_login: {
    date: string;
    device: string;
    ip: string;
  } | null;
  /** Puntaje de seguridad (0-100) */
  security_score: number;
  /** Recomendaciones de seguridad */
  recommendations: string[];
  /** Si tiene passkey registrada */
  has_passkey?: boolean;
  /** Si tiene 2FA activado */
  has_2fa?: boolean;
  /** Tiempo desde la última contraseña (días) */
  days_since_password_change?: number;
}

/**
 * Estado de autenticación para verificar
 */
export interface AuthStatus {
  /** Si el usuario está autenticado */
  is_authenticated: boolean;
  /** ID del usuario */
  user_id?: string;
  /** Email del usuario */
  email?: string;
}