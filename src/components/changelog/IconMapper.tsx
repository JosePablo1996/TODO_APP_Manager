import React from 'react';
import { 
  RefreshCw, Save, AlertTriangle, Trash2, Smartphone, 
  Mail, LayoutGrid, Server, Bug, Cloud, FileJson,
  SmartphoneNfc, Key, Shield, Fingerprint, LogOut, Bell,
  Clock, MonitorSmartphone, Menu, Eye, Wifi, Zap, Sparkles,
  Palette, Globe, Database, Code, Heart, Tag, Star,
  BarChart, ShieldCheck, Rocket
} from 'lucide-react';

// ============================================
// MAPA DE ICONOS LUCIDE
// ============================================
// Mapea nombres de iconos (strings) a componentes de Lucide React
// Esto permite referenciar iconos dinámicamente desde los datos

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  RefreshCw,
  Save,
  AlertTriangle,
  Trash2,
  Smartphone,
  Mail,
  LayoutGrid,
  Server,
  Bug,
  Cloud,
  FileJson,
  SmartphoneNfc,
  Key,
  Shield,
  Fingerprint,
  LogOut,
  Bell,
  Clock,
  MonitorSmartphone, // Reemplaza a DevicePhone (no existe en lucide-react)
  Menu,
  Eye,
  Wifi,
  Zap,
  Sparkles,
  Palette,
  Globe,
  Database,
  Code,
  Heart,
  Tag,
  Star,
  BarChart,
  ShieldCheck,
  Rocket,
};

// ============================================
// INTERFAZ DEL COMPONENTE
// ============================================

interface IconMapperProps {
  /** Nombre del icono (debe coincidir con una clave en iconMap) */
  name: string;
  /** Tamaño del icono en píxeles (default: 18) */
  size?: number;
  /** Clases CSS adicionales para el icono */
  className?: string;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * IconMapper
 * 
 * Componente utilitario que renderiza un icono de Lucide React
 * basado en su nombre (string). Esto permite que los datos del
 * changelog referencien iconos sin importar componentes directamente.
 * 
 * @example
 * <IconMapper name="RefreshCw" size={20} className="text-teal-500" />
 * 
 * @param name - Nombre del icono (ej: 'RefreshCw', 'Bug', 'Shield')
 * @param size - Tamaño en píxeles (opcional, default: 18)
 * @param className - Clases CSS adicionales (opcional)
 * @returns Componente del icono o null si no se encuentra
 */
export const IconMapper: React.FC<IconMapperProps> = ({ 
  name, 
  size = 18, 
  className 
}) => {
  // Buscar el componente en el mapa
  const IconComponent = iconMap[name];

  // Si no existe el icono, no renderizar nada
  if (!IconComponent) {
    // Solo mostrar advertencia en desarrollo
    if (import.meta.env.DEV) {
      console.warn(`IconMapper: Icono "${name}" no encontrado en el mapa de iconos.`);
    }
    return null;
  }

  // Renderizar el icono con las props proporcionadas
  return <IconComponent size={size} className={className} />;
};

export default IconMapper;