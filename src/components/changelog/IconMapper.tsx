import React from 'react';
import { 
  RefreshCw, Save, AlertTriangle, Trash2, Smartphone, 
  Mail, LayoutGrid, Server, Bug, Cloud, FileJson,
  SmartphoneNfc, Key, Shield, Fingerprint, LogOut, Bell,
  Clock, MonitorSmartphone, Menu, Eye, Wifi, Zap, Sparkles,
  Palette, Globe, Database, Code, Heart, Tag, Star,
  BarChart, ShieldCheck, Rocket,
  // 🎨 NUEVOS: Iconos para personalización de tareas
  CheckCircle, Users, Lightbulb, ShoppingCart, Phone,
  FileText, Plane, BookOpen, Droplets, Droplet, Waves,
  Rows, Maximize2
} from 'lucide-react';

// ============================================
// MAPA DE ICONOS LUCIDE
// ============================================
// Mapea nombres de iconos (strings) a componentes de Lucide React
// Esto permite referenciar iconos dinámicamente desde los datos

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  // Iconos existentes (changelog y UI general)
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
  MonitorSmartphone,
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

  // 🎨 NUEVOS: Iconos para el selector de iconos de tareas (TaskIconSelector)
  CheckCircle,      // Tarea general
  Users,            // Reunión
  Lightbulb,        // Idea
  ShoppingCart,     // Compra
  Phone,            // Llamada
  FileText,         // Documento
  Plane,            // Viaje
  BookOpen,         // Libro/Estudio

  // 🎨 NUEVOS: Iconos para el selector de opacidad (TaskOpacitySelector)
  Droplets,         // Sutil (baja opacidad)
  Droplet,          // Medio (opacidad media)
  Waves,            // Intenso (alta opacidad)

  // 🎨 NUEVOS: Iconos para el selector de tamaño (TaskSizeSelector)
  Rows,             // Compacto
  Maximize2,        // Expandido
  // LayoutGrid ya existe arriba para tamaño Normal
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
 * changelog y los selectores de personalización referencien iconos
 * sin importar componentes directamente.
 * 
 * Iconos disponibles: 47 iconos de Lucide React
 * 
 * @example
 * <IconMapper name="RefreshCw" size={20} className="text-teal-500" />
 * <IconMapper name="CheckCircle" size={18} />
 * <IconMapper name="Droplets" size={16} />
 * 
 * @param name - Nombre del icono (ej: 'RefreshCw', 'Bug', 'Shield', 'CheckCircle')
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