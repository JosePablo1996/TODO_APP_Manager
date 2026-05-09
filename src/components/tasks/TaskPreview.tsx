import React from 'react';
import { motion } from 'framer-motion';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { IconMapper } from '../changelog/IconMapper';
import {
  getIconConfig,
  getSizeConfig,
  getOpacityConfig,
  getBorderRadiusConfig,
  type TaskIconName,
  type TaskSizeValue,
  type TaskOpacityValue,
  type TaskBorderRadiusValue,
} from '../../data/taskCustomization';

// ============================================
// INTERFAZ DEL COMPONENTE
// ============================================

interface TaskPreviewProps {
  /** Título de la tarea (si está vacío, muestra placeholder) */
  title?: string;
  /** Descripción de la tarea */
  description?: string;
  /** Prioridad de la tarea */
  priority?: 'alta' | 'media' | 'baja';
  /** Categoría de la tarea */
  category?: 'personal' | 'trabajo' | 'estudio' | 'otro';
  /** Fecha límite */
  dueDate?: string;
  /** Icono seleccionado */
  icon?: TaskIconName;
  /** Tamaño seleccionado */
  size?: TaskSizeValue;
  /** Opacidad seleccionada */
  opacity?: TaskOpacityValue;
  /** Borde redondeado seleccionado */
  borderRadius?: TaskBorderRadiusValue;
  /** Color de fondo (hexadecimal) */
  color?: string;
  /** Si la tarea está completada */
  completed?: boolean;
  /** Si mostrar las badges de prioridad y categoría */
  showBadges?: boolean;
  /** Clases adicionales */
  className?: string;
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Convierte color hexadecimal a RGB
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const cleanHex = hex.replace('#', '');
  return {
    r: parseInt(cleanHex.substring(0, 2), 16),
    g: parseInt(cleanHex.substring(2, 4), 16),
    b: parseInt(cleanHex.substring(4, 6), 16),
  };
};

/**
 * Obtiene el color rgba con opacidad aplicada
 */
const getRgbaColor = (hex: string, opacity: number): string => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * TaskPreview
 * 
 * Componente que muestra una vista previa de cómo se verá una tarea
 * con todas las personalizaciones aplicadas (icono, tamaño, opacidad,
 * borde redondeado y color).
 * 
 * La vista previa ahora tiñe completamente el fondo con el color
 * seleccionado, igual que TaskItem y TaskCard.
 */
export const TaskPreview: React.FC<TaskPreviewProps> = ({
  title = '',
  description = '',
  priority = 'media',
  category = 'personal',
  dueDate = '',
  icon = 'CheckCircle',
  size = 'md',
  opacity = 'medium',
  borderRadius = 'medium',
  color = '#10b981',
  completed = false,
  showBadges = true,
  className = '',
}) => {
  const classes = useThemeClasses();

  // Obtener configuraciones
  const iconConfig = getIconConfig(icon);
  const sizeConfig = getSizeConfig(size);
  const opacityConfig = getOpacityConfig(opacity);
  const borderRadiusConfig = getBorderRadiusConfig(borderRadius);

  // 🎨 CORREGIDO: Aumentar opacidad para que el color sea más visible
  const bgOpacity = parseFloat(opacityConfig.bgOpacity) * 3;
  const borderOpacity = parseFloat(opacityConfig.borderOpacity) * 3;

  // Colores calculados
  const backgroundColor = getRgbaColor(color, Math.min(bgOpacity, 0.4));
  const borderColorRgba = getRgbaColor(color, Math.min(borderOpacity, 0.6));
  const iconBgColor = getRgbaColor(color, Math.min(bgOpacity * 1.5, 0.5));
  const badgeBgColor = getRgbaColor(color, Math.min(bgOpacity * 1.5, 0.35));

  // Determinar color de borde según prioridad
  const getPriorityBorderColor = (): string => {
    switch (priority) {
      case 'alta': return '#ef4444';
      case 'media': return '#f59e0b';
      case 'baja': return '#10b981';
      default: return color;
    }
  };

  // Configuración de prioridad
  const priorityConfig = {
    alta: { emoji: '🔴', label: 'Alta', colorHex: '#ef4444' },
    media: { emoji: '🟡', label: 'Media', colorHex: '#f59e0b' },
    baja: { emoji: '🟢', label: 'Baja', colorHex: '#10b981' },
  }[priority];

  // Configuración de categoría
  const categoryConfig = {
    personal: { emoji: '👤', label: 'Personal' },
    trabajo: { emoji: '💼', label: 'Trabajo' },
    estudio: { emoji: '📚', label: 'Estudio' },
    otro: { emoji: '📌', label: 'Otro' },
  }[category];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Etiqueta */}
      <label className={`block text-sm font-semibold ${classes.text.primary}`}>
        📋 Vista previa
      </label>

      {/* 🎨 Tarjeta de preview CON FONDO DE COLOR VISIBLE */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          relative overflow-hidden transition-all duration-300
          ${borderRadiusConfig.class}
        `}
      >
        {/* 🎨 CAPA DE FONDO CON COLOR (siempre visible) */}
        <div 
          className={`absolute inset-0 ${borderRadiusConfig.class}`}
          style={{ 
            backgroundColor: backgroundColor,
            border: `1px solid ${borderColorRgba}`,
          }}
        />

        {/* 🎨 BARRA LATERAL DE COLOR (viñeta) */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-2 ${borderRadiusConfig.class === 'rounded-none' ? '' : 'rounded-l-lg'}`}
          style={{ backgroundColor: getPriorityBorderColor() }}
        />

        {/* CONTENIDO DE LA TARJETA (sobre el fondo de color) */}
        <div className={`relative ${sizeConfig.cardPadding}`}>
          <div className={`flex ${sizeConfig.gap}`}>
            {/* Icono de la tarea */}
            <div
              className="flex-shrink-0 p-2 rounded-lg relative z-10"
              style={{ backgroundColor: iconBgColor }}
            >
              <IconMapper
                name={iconConfig.icon}
                size={sizeConfig.iconSize}
                className=""
              />
            </div>

            {/* Información de la tarea */}
            <div className="flex-1 min-w-0 relative z-10">
              {/* Título */}
              <h4
                className={`font-semibold ${sizeConfig.titleSize} ${classes.text.primary} truncate`}
                style={{
                  textDecoration: completed ? 'line-through' : 'none',
                  opacity: completed ? 0.6 : 1,
                }}
              >
                {title || 'Título de la tarea'}
              </h4>

              {/* Descripción (visible según tamaño) */}
              {size !== 'sm' && (
                <p className={`text-xs mt-1 ${classes.text.muted} line-clamp-2`}>
                  {description || 'Sin descripción'}
                </p>
              )}

              {/* Badges de prioridad y categoría */}
              {showBadges && (
                <div className={`flex flex-wrap ${sizeConfig.gap} mt-2`}>
                  {/* Badge de prioridad */}
                  <span
                    className={`${sizeConfig.badgeSize} rounded-full font-medium flex items-center gap-1 relative z-10`}
                    style={{
                      backgroundColor: getRgbaColor(priorityConfig.colorHex, 0.15),
                      color: classes.text.primary,
                    }}
                  >
                    <span>{priorityConfig.emoji}</span>
                    <span>{priorityConfig.label}</span>
                  </span>

                  {/* Badge de categoría */}
                  <span
                    className={`${sizeConfig.badgeSize} rounded-full font-medium flex items-center gap-1 relative z-10`}
                    style={{
                      backgroundColor: badgeBgColor,
                      color: classes.text.primary,
                    }}
                  >
                    <span>{categoryConfig.emoji}</span>
                    <span>{categoryConfig.label}</span>
                  </span>

                  {/* Badge de fecha */}
                  {dueDate && (
                    <span
                      className={`${sizeConfig.badgeSize} rounded-full font-medium flex items-center gap-1 relative z-10`}
                      style={{
                        backgroundColor: badgeBgColor,
                        color: classes.text.primary,
                      }}
                    >
                      <span>📅</span>
                      <span>
                        {new Date(dueDate + 'T00:00:00').toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Indicador de completado */}
            {completed && (
              <div className="flex-shrink-0 flex items-center relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Resumen de personalización aplicada */}
      <div
        className={`
          grid grid-cols-2 sm:grid-cols-4 gap-2
          p-3 rounded-xl border ${classes.bg.secondary} ${classes.border.primary}
        `}
      >
        <div className="text-center">
          <p className={`text-[10px] ${classes.text.muted}`}>Icono</p>
          <p className={`text-xs font-medium ${classes.text.primary}`}>
            {iconConfig.name}
          </p>
        </div>
        <div className="text-center">
          <p className={`text-[10px] ${classes.text.muted}`}>Tamaño</p>
          <p className={`text-xs font-medium ${classes.text.primary}`}>
            {sizeConfig.name}
          </p>
        </div>
        <div className="text-center">
          <p className={`text-[10px] ${classes.text.muted}`}>Intensidad</p>
          <p className={`text-xs font-medium ${classes.text.primary}`}>
            {opacityConfig.name}
          </p>
        </div>
        <div className="text-center">
          <p className={`text-[10px] ${classes.text.muted}`}>Borde</p>
          <p className={`text-xs font-medium ${classes.text.primary}`}>
            {borderRadiusConfig.name}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaskPreview;