import React from 'react';
import { motion } from 'framer-motion';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { TASK_ICONS, getIconConfig, type TaskIconName } from '../../data/taskCustomization';
import { IconMapper } from '../changelog/IconMapper';

// ============================================
// INTERFAZ DEL COMPONENTE
// ============================================

interface TaskIconSelectorProps {
  /** Icono actualmente seleccionado */
  selectedIcon: TaskIconName;
  /** Callback al seleccionar un icono */
  onSelectIcon: (icon: TaskIconName) => void;
  /** Tamaño de los iconos en el selector */
  iconSize?: number;
  /** Número de columnas en la cuadrícula */
  columns?: 3 | 4 | 6;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * TaskIconSelector
 * 
 * Componente que muestra una cuadrícula de iconos seleccionables
 * para personalizar la apariencia de una tarea.
 * 
 * @example
 * <TaskIconSelector
 *   selectedIcon="CheckCircle"
 *   onSelectIcon={(icon) => setSelectedIcon(icon)}
 * />
 */
export const TaskIconSelector: React.FC<TaskIconSelectorProps> = ({
  selectedIcon,
  onSelectIcon,
  iconSize = 20,
  columns = 4,
}) => {
  const classes = useThemeClasses();

  // Obtener la configuración del icono seleccionado
  const selectedConfig = getIconConfig(selectedIcon);

  // Clases de grid según columnas
  const gridCols = {
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    6: 'grid-cols-6',
  }[columns];

  return (
    <div className="space-y-4">
      {/* Etiqueta */}
      <label className={`block text-sm font-semibold ${classes.text.primary}`}>
        🎨 Icono de la tarea
      </label>

      {/* Grid de iconos */}
      <div className={`grid ${gridCols} gap-2`}>
        {TASK_ICONS.map((iconConfig) => {
          const isSelected = selectedIcon === iconConfig.icon;

          return (
            <motion.button
              key={iconConfig.icon}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectIcon(iconConfig.icon as TaskIconName)}
              className={`
                relative flex flex-col items-center justify-center gap-1.5
                p-3 rounded-xl border-2 transition-all duration-200
                ${isSelected
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 shadow-md ring-2 ring-emerald-500/30'
                  : `${classes.border.primary} ${classes.bg.card} hover:border-emerald-400 hover:shadow-md`
                }
              `}
              aria-label={`Seleccionar icono ${iconConfig.name}`}
              title={iconConfig.name}
            >
              {/* Icono */}
              <div className={`
                p-2 rounded-lg transition-all duration-200
                ${isSelected
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }
              `}>
                <IconMapper
                  name={iconConfig.icon}
                  size={iconSize}
                  className={isSelected ? 'text-emerald-600 dark:text-emerald-400' : ''}
                />
              </div>

              {/* Nombre del icono (abreviado) */}
              <span className={`
                text-[10px] font-medium leading-tight text-center
                ${isSelected
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : classes.text.muted
                }
              `}>
                {iconConfig.name}
              </span>

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

      {/* Icono seleccionado actual */}
      <div className={`
        flex items-center gap-3 p-3 rounded-xl border
        ${classes.bg.secondary} ${classes.border.primary}
      `}>
        <div className="p-2 rounded-lg bg-emerald-500/20">
          <IconMapper
            name={selectedConfig.icon}
            size={18}
            className="text-emerald-600 dark:text-emerald-400"
          />
        </div>
        <div>
          <p className={`text-sm font-medium ${classes.text.primary}`}>
            {selectedConfig.name}
          </p>
          <p className={`text-xs ${classes.text.muted}`}>
            Icono seleccionado
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaskIconSelector;