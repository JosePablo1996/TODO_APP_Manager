import React from 'react';
import { motion } from 'framer-motion';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { TASK_OPACITIES, getOpacityConfig, type TaskOpacityValue } from '../../data/taskCustomization';
import { Droplets, Droplet, Waves } from 'lucide-react';

// ============================================
// INTERFAZ DEL COMPONENTE
// ============================================

interface TaskOpacitySelectorProps {
  /** Opacidad actualmente seleccionada */
  selectedOpacity: TaskOpacityValue;
  /** Callback al seleccionar una opacidad */
  onSelectOpacity: (opacity: TaskOpacityValue) => void;
  /** Color base para la vista previa (hexadecimal) */
  previewColor?: string;
}

// ============================================
// ICONOS POR NIVEL DE OPACIDAD
// ============================================

const OPACITY_ICONS: Record<TaskOpacityValue, React.ReactNode> = {
  low: <Droplets size={16} />,
  medium: <Droplet size={16} />,
  high: <Waves size={16} />,
};

// ============================================
// FUNCIÓN AUXILIAR
// ============================================

/**
 * Convierte un color hexadecimal a RGB para aplicar opacidad
 */
const hexToRgba = (hex: string, opacity: number): string => {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * TaskOpacitySelector
 * 
 * Componente que muestra opciones de opacidad para el color de fondo
 * de las tarjetas de tareas. Permite elegir entre Sutil, Medio e Intenso.
 * 
 * @example
 * <TaskOpacitySelector
 *   selectedOpacity="medium"
 *   onSelectOpacity={(opacity) => setSelectedOpacity(opacity)}
 *   previewColor="#10b981"
 * />
 */
export const TaskOpacitySelector: React.FC<TaskOpacitySelectorProps> = ({
  selectedOpacity,
  onSelectOpacity,
  previewColor = '#10b981',
}) => {
  const classes = useThemeClasses();

  // Obtener la configuración de la opacidad seleccionada
  const selectedConfig = getOpacityConfig(selectedOpacity);

  return (
    <div className="space-y-4">
      {/* Etiqueta */}
      <label className={`block text-sm font-semibold ${classes.text.primary}`}>
        💧 Intensidad del color
      </label>

      {/* Opciones de opacidad */}
      <div className="grid grid-cols-3 gap-2">
        {TASK_OPACITIES.map((opacityConfig) => {
          const isSelected = selectedOpacity === opacityConfig.value;

          // Calcular color con opacidad
          const bgOpacity = parseFloat(opacityConfig.bgOpacity);
          const borderOpacity = parseFloat(opacityConfig.borderOpacity);

          return (
            <motion.button
              key={opacityConfig.value}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectOpacity(opacityConfig.value)}
              className={`
                relative flex flex-col items-center justify-center gap-2.5
                p-4 rounded-xl border-2 transition-all duration-200
                ${isSelected
                  ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                  : `${classes.border.primary} ${classes.bg.card} hover:border-emerald-400 hover:shadow-md`
                }
              `}
              style={{
                backgroundColor: isSelected 
                  ? hexToRgba(previewColor, bgOpacity)
                  : undefined,
                borderColor: isSelected
                  ? previewColor
                  : undefined,
              }}
              aria-label={`Seleccionar opacidad ${opacityConfig.name}`}
              title={opacityConfig.description}
            >
              {/* Representación visual de la opacidad */}
              <div className="flex flex-col items-center gap-2">
                {/* Círculos concéntricos que muestran la intensidad */}
                <div className="relative w-10 h-10">
                  {/* Círculo exterior */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      backgroundColor: hexToRgba(previewColor, bgOpacity),
                      border: `2px solid ${hexToRgba(previewColor, borderOpacity)}`,
                    }}
                  />
                  
                  {/* Círculo interior (más opaco) */}
                  <div
                    className="absolute inset-2 rounded-full"
                    style={{
                      backgroundColor: hexToRgba(previewColor, bgOpacity * 1.5),
                    }}
                  />
                  
                  {/* Punto central */}
                  <div
                    className="absolute inset-[30%] rounded-full"
                    style={{
                      backgroundColor: hexToRgba(previewColor, bgOpacity * 3),
                    }}
                  />
                </div>

                {/* Icono y nombre */}
                <div className="flex items-center gap-1.5">
                  <span className={isSelected ? 'text-emerald-600 dark:text-emerald-400' : classes.text.muted}>
                    {OPACITY_ICONS[opacityConfig.value]}
                  </span>
                  <span className={`
                    text-xs font-medium
                    ${isSelected
                      ? 'text-gray-800 dark:text-gray-200'
                      : classes.text.muted
                    }
                  `}>
                    {opacityConfig.name}
                  </span>
                </div>
              </div>

              {/* Indicador de selección */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-md"
                >
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Información de la opacidad seleccionada */}
      <div className={`
        flex items-center gap-3 p-3 rounded-xl border
        ${classes.bg.secondary} ${classes.border.primary}
      `}>
        {/* Preview del color con la opacidad */}
        <div
          className="w-10 h-10 rounded-lg flex-shrink-0 border-2"
          style={{
            backgroundColor: hexToRgba(previewColor, parseFloat(selectedConfig.bgOpacity)),
            borderColor: hexToRgba(previewColor, parseFloat(selectedConfig.borderOpacity)),
          }}
        />
        
        <div className="flex-1">
          <p className={`text-sm font-medium ${classes.text.primary}`}>
            {selectedConfig.name}
          </p>
          <p className={`text-xs ${classes.text.muted}`}>
            {selectedConfig.description}
          </p>
        </div>

        {/* Porcentajes */}
        <div className="flex items-center gap-2 text-xs">
          <div className="text-center">
            <span className={`font-medium ${classes.text.primary}`}>
              {Math.round(parseFloat(selectedConfig.bgOpacity) * 100)}%
            </span>
            <span className={`block text-[10px] ${classes.text.muted}`}>Fondo</span>
          </div>
          <div className={`w-px h-8 ${classes.border.primary}`} />
          <div className="text-center">
            <span className={`font-medium ${classes.text.primary}`}>
              {Math.round(parseFloat(selectedConfig.borderOpacity) * 100)}%
            </span>
            <span className={`block text-[10px] ${classes.text.muted}`}>Borde</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskOpacitySelector;