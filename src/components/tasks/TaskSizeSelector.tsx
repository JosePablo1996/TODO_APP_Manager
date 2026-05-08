import React from 'react';
import { motion } from 'framer-motion';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { TASK_SIZES, getSizeConfig, type TaskSizeValue } from '../../data/taskCustomization';
import { LayoutGrid, Rows, Maximize2 } from 'lucide-react';

// ============================================
// INTERFAZ DEL COMPONENTE
// ============================================

interface TaskSizeSelectorProps {
  /** Tamaño actualmente seleccionado */
  selectedSize: TaskSizeValue;
  /** Callback al seleccionar un tamaño */
  onSelectSize: (size: TaskSizeValue) => void;
}

// ============================================
// ICONOS POR TAMAÑO
// ============================================

const SIZE_ICONS: Record<TaskSizeValue, React.ReactNode> = {
  sm: <Rows size={16} />,
  md: <LayoutGrid size={16} />,
  lg: <Maximize2 size={16} />,
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * TaskSizeSelector
 * 
 * Componente que muestra opciones de tamaño para las tarjetas de tareas.
 * Permite elegir entre Compacto, Normal y Expandido.
 * 
 * @example
 * <TaskSizeSelector
 *   selectedSize="md"
 *   onSelectSize={(size) => setSelectedSize(size)}
 * />
 */
export const TaskSizeSelector: React.FC<TaskSizeSelectorProps> = ({
  selectedSize,
  onSelectSize,
}) => {
  const classes = useThemeClasses();

  // Obtener la configuración del tamaño seleccionado
  const selectedConfig = getSizeConfig(selectedSize);

  return (
    <div className="space-y-4">
      {/* Etiqueta */}
      <label className={`block text-sm font-semibold ${classes.text.primary}`}>
        📐 Tamaño de la tarjeta
      </label>

      {/* Opciones de tamaño */}
      <div className="grid grid-cols-3 gap-2">
        {TASK_SIZES.map((sizeConfig) => {
          const isSelected = selectedSize === sizeConfig.value;

          return (
            <motion.button
              key={sizeConfig.value}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectSize(sizeConfig.value)}
              className={`
                relative flex flex-col items-center justify-center gap-2
                p-4 rounded-xl border-2 transition-all duration-200
                ${isSelected
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 shadow-md ring-2 ring-emerald-500/30'
                  : `${classes.border.primary} ${classes.bg.card} hover:border-emerald-400 hover:shadow-md`
                }
              `}
              aria-label={`Seleccionar tamaño ${sizeConfig.name}`}
              title={sizeConfig.description}
            >
              {/* Representación visual del tamaño */}
              <div className={`
                w-full rounded-lg border-2 transition-all duration-200
                ${isSelected
                  ? 'border-emerald-500 bg-emerald-500/20'
                  : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800'
                }
                ${sizeConfig.value === 'sm' ? 'h-8' : ''}
                ${sizeConfig.value === 'md' ? 'h-12' : ''}
                ${sizeConfig.value === 'lg' ? 'h-16' : ''}
              `}>
                {/* Barras simulando contenido */}
                <div className="flex flex-col gap-1 p-2 h-full justify-center">
                  <div className={`
                    rounded-full
                    ${isSelected ? 'bg-emerald-400' : 'bg-gray-300 dark:bg-gray-600'}
                    ${sizeConfig.value === 'sm' ? 'h-1 w-3/4' : ''}
                    ${sizeConfig.value === 'md' ? 'h-1.5 w-4/5' : ''}
                    ${sizeConfig.value === 'lg' ? 'h-2 w-5/6' : ''}
                  `} />
                  {(sizeConfig.value === 'md' || sizeConfig.value === 'lg') && (
                    <div className={`
                      rounded-full w-1/2
                      ${isSelected ? 'bg-emerald-300' : 'bg-gray-200 dark:bg-gray-500'}
                      ${sizeConfig.value === 'md' ? 'h-1' : ''}
                      ${sizeConfig.value === 'lg' ? 'h-1.5' : ''}
                    `} />
                  )}
                  {sizeConfig.value === 'lg' && (
                    <div className={`
                      rounded-full w-2/3 h-1.5
                      ${isSelected ? 'bg-emerald-200' : 'bg-gray-200 dark:bg-gray-500'}
                    `} />
                  )}
                </div>
              </div>

              {/* Icono y nombre */}
              <div className="flex items-center gap-1.5">
                <span className={isSelected ? 'text-emerald-600 dark:text-emerald-400' : classes.text.muted}>
                  {SIZE_ICONS[sizeConfig.value]}
                </span>
                <span className={`
                  text-xs font-medium
                  ${isSelected
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : classes.text.muted
                  }
                `}>
                  {sizeConfig.name}
                </span>
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

      {/* Información del tamaño seleccionado */}
      <div className={`
        flex items-center gap-3 p-3 rounded-xl border
        ${classes.bg.secondary} ${classes.border.primary}
      `}>
        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          {SIZE_ICONS[selectedConfig.value]}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${classes.text.primary}`}>
            {selectedConfig.name}
          </p>
          <p className={`text-xs ${classes.text.muted}`}>
            {selectedConfig.description}
          </p>
        </div>
        {/* Indicador de altura */}
        <div className={`
          px-2 py-1 rounded-lg text-xs font-medium
          bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300
        `}>
          {selectedConfig.cardHeight.replace('min-h-[', '').replace(']', '')}
        </div>
      </div>
    </div>
  );
};

export default TaskSizeSelector;