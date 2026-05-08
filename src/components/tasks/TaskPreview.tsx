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
 * @example
 * <TaskPreview
 *   title="Mi tarea"
 *   icon="Star"
 *   size="md"
 *   opacity="medium"
 *   borderRadius="medium"
 *   color="#10b981"
 *   priority="alta"
 *   category="personal"
 * />
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

  // Calcular opacidades
  const bgOpacityValue = parseFloat(opacityConfig.bgOpacity);
  const borderOpacityValue = parseFloat(opacityConfig.borderOpacity);

  // Colores calculados
  const borderColorRgba = getRgbaColor(color, borderOpacityValue);

  // Determinar color de borde según prioridad
  const getPriorityBorderColor = (): string => {
    switch (priority) {
      case 'alta': return getRgbaColor('#ef4444', borderOpacityValue);
      case 'media': return getRgbaColor('#f59e0b', borderOpacityValue);
      case 'baja': return getRgbaColor('#10b981', borderOpacityValue);
      default: return borderColorRgba;
    }
  };

  // Obtener emoji y etiqueta de prioridad
  const priorityConfig = {
    alta: { emoji: '🔴', label: 'Alta', colorHex: '#ef4444' },
    media: { emoji: '🟡', label: 'Media', colorHex: '#f59e0b' },
    baja: { emoji: '🟢', label: 'Baja', colorHex: '#10b981' },
  }[priority];

  // Obtener emoji y etiqueta de categoría
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

      {/* Tarjeta de preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          relative overflow-hidden transition-all duration-300
          ${borderRadiusConfig.class}
          ${sizeConfig.cardHeight}
          ${sizeConfig.cardPadding}
          ${classes.bg.card}
        `}
        style={{
          backgroundColor: color,
          '--bg-opacity': bgOpacityValue,
          '--border-opacity': borderOpacityValue,
          '--task-color': color,
          '--priority-border-color': getPriorityBorderColor(),
          borderLeft: `3px solid ${getPriorityBorderColor()}`,
          border: `1px solid ${borderColorRgba}`,
        } as React.CSSProperties}
      >
        {/* Barra de color lateral */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5"
          style={{ backgroundColor: color }}
        />

        {/* Overlay de opacidad para el fondo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: getRgbaColor(color, bgOpacityValue),
          }}
        />

        {/* Contenido de la tarjeta */}
        <div className={`relative flex ${sizeConfig.gap} pl-2`}>
          {/* Icono de la tarea */}
          <div
            className="flex-shrink-0 p-2 rounded-lg"
            style={{
              backgroundColor: getRgbaColor(color, bgOpacityValue * 2),
            }}
          >
            <IconMapper
              name={iconConfig.icon}
              size={sizeConfig.iconSize}
              className=""
            />
          </div>

          {/* Información de la tarea */}
          <div className="flex-1 min-w-0">
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

            {/* Descripción (solo en tamaños md y lg) */}
            {size !== 'sm' && description && (
              <p className={`text-xs mt-1 ${classes.text.muted} line-clamp-2`}>
                {description}
              </p>
            )}

            {/* Descripción placeholder cuando no hay */}
            {size !== 'sm' && !description && (
              <p className={`text-xs mt-1 ${classes.text.muted} italic`}>
                Sin descripción
              </p>
            )}

            {/* Badges de prioridad y categoría */}
            {showBadges && (
              <div className={`flex flex-wrap ${sizeConfig.gap} mt-2`}>
                {/* Badge de prioridad */}
                <span
                  className={`${sizeConfig.badgeSize} rounded-full font-medium flex items-center gap-1`}
                  style={{
                    backgroundColor: getRgbaColor(priorityConfig.colorHex, bgOpacityValue * 1.5),
                    color: classes.text.primary,
                  }}
                >
                  <span>{priorityConfig.emoji}</span>
                  <span>{priorityConfig.label}</span>
                </span>

                {/* Badge de categoría */}
                <span
                  className={`${sizeConfig.badgeSize} rounded-full font-medium flex items-center gap-1`}
                  style={{
                    backgroundColor: getRgbaColor(color, bgOpacityValue * 1.5),
                    color: classes.text.primary,
                  }}
                >
                  <span>{categoryConfig.emoji}</span>
                  <span>{categoryConfig.label}</span>
                </span>

                {/* Badge de fecha */}
                {dueDate && (
                  <span
                    className={`${sizeConfig.badgeSize} rounded-full font-medium flex items-center gap-1`}
                    style={{
                      backgroundColor: getRgbaColor(color, bgOpacityValue * 1.5),
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
            <div className="flex-shrink-0 flex items-center">
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