// src/components/tasks/TaskItem.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { 
  Check, 
  Circle, 
  Calendar, 
  Star,
  Archive,
  Trash2,
  Edit,
  Square,
  CheckSquare,
  Undo2
} from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { IconMapper } from '../changelog/IconMapper';
import { CircularMenu } from '../ui/CircularMenu';
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
import type { Task } from '../../types/task';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onSoftDelete: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onToggleArchive?: (id: string) => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

interface PriorityStyle {
  bg: string;
  text: string;
  border: string;
  dot: string;
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Convierte color hexadecimal a rgba con opacidad
 */
const hexToRgba = (hex: string, opacity: number): string => {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onSoftDelete,
  onToggleFavorite,
  onToggleArchive,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect,
}) => {
  const navigate = useNavigate();
  const classes = useThemeClasses();
  const [showMenu, setShowMenu] = useState(false);

  // 🎨 Obtener configuraciones de personalización
  const taskColor = task.color || '#10b981';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const taskIcon = ((task as any).icon || 'CheckCircle') as TaskIconName;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const taskSize = ((task as any).size || 'md') as TaskSizeValue;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const taskOpacity = ((task as any).opacity || 'medium') as TaskOpacityValue;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const taskBorderRadius = ((task as any).borderRadius || 'medium') as TaskBorderRadiusValue;

  const iconConfig = getIconConfig(taskIcon);
  const sizeConfig = getSizeConfig(taskSize);
  const opacityConfig = getOpacityConfig(taskOpacity);
  const borderRadiusConfig = getBorderRadiusConfig(taskBorderRadius);

  // 🎨 CORREGIDO: Aumentar opacidad para que el color sea más visible
  // Multiplicamos por 3 para que sea más notorio el tinte
  const bgOpacity = parseFloat(opacityConfig.bgOpacity) * 3;
  const borderOpacity = parseFloat(opacityConfig.borderOpacity) * 3;

  // Colores calculados
  const backgroundColor = hexToRgba(taskColor, Math.min(bgOpacity, 0.4)); // Máximo 40% de opacidad
  const borderColorRgba = hexToRgba(taskColor, Math.min(borderOpacity, 0.6)); // Máximo 60% de opacidad
  const iconBgColor = hexToRgba(taskColor, Math.min(bgOpacity * 1.5, 0.5));

  // Estados para swipe
  const x = useMotionValue(0);
  const swipeThreshold = 80;

  // Opacidad para fondos de swipe
  const opacityLeft = useTransform(x, [-100, -20], [1, 0]);
  const opacityRight = useTransform(x, [20, 100], [0, 1]);

  // Manejar fin del swipe
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    
    if (offset > swipeThreshold) {
      onToggleComplete(task.id);
    } else if (offset < -swipeThreshold) {
      onSoftDelete(task.id);
    }
  };

  const getPriorityStyle = (priority: string): PriorityStyle => {
    const styles: Record<string, PriorityStyle> = {
      alta: {
        bg: 'bg-red-500/10',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
        dot: 'bg-red-500'
      },
      media: {
        bg: 'bg-amber-500/10',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500'
      },
      baja: {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800',
        dot: 'bg-emerald-500'
      }
    };
    return styles[priority] || styles.media;
  };

  const getCategoryStyle = (category: string): string => {
    const styles: Record<string, string> = {
      personal: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      trabajo: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      estudio: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      otro: 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
    };
    return styles[category] || styles.otro;
  };

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      personal: '👤',
      trabajo: '💼',
      estudio: '📚',
      otro: '📌'
    };
    return icons[category] || '📌';
  };

  const isDueSoon = (): boolean => {
    if (!task.dueDate || task.completed) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  const isOverdue = (): boolean => {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  };

  const priorityStyles = getPriorityStyle(task.priority);

  const handleCardClick = () => {
    if (isSelectionMode) {
      onToggleSelect?.(task.id);
      return;
    }
    navigate(`/editar-tarea/${task.id}`);
  };

  const menuItems = [
    {
      icon: Star,
      label: task.isFavorite ? 'Quitar favorito' : 'Añadir favorito',
      color: '#f59e0b',
      action: () => onToggleFavorite?.(task.id),
      active: task.isFavorite || false,
    },
    {
      icon: Archive,
      label: task.isArchived ? 'Desarchivar' : 'Archivar',
      color: '#8b5cf6',
      action: () => onToggleArchive?.(task.id),
      active: task.isArchived || false,
    },
    {
      icon: Edit,
      label: 'Editar',
      color: '#3b82f6',
      action: () => {
        setShowMenu(false);
        navigate(`/editar-tarea/${task.id}`);
      },
      active: false,
    },
    {
      icon: Trash2,
      label: 'Mover a papelera',
      color: '#ef4444',
      action: () => {
        setShowMenu(false);
        onSoftDelete(task.id);
      },
      active: false,
    },
  ];

  const getCenterColor = (): string => {
    if (task.priority === 'alta') return '#ef4444';
    if (task.priority === 'media') return '#f59e0b';
    return '#10b981';
  };

  // 🎨 Determinar si la tarea tiene personalización para mostrar el icono
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasCustomization = (task as any).icon || (task as any).size || (task as any).opacity || (task as any).borderRadius;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2 }}
        className="relative overflow-hidden"
        style={{ touchAction: 'pan-y' }}
      >
        {/* Fondo izquierda - Eliminar (rojo) */}
        <motion.div
          className="absolute inset-y-0 left-0 flex items-center justify-start px-6 rounded-lg"
          style={{ 
            background: 'linear-gradient(90deg, rgba(239,68,68,0.9), rgba(239,68,68,0.3))', 
            opacity: opacityLeft.get()
          }}
        >
          <div className="flex items-center gap-2 text-white">
            <Trash2 size={22} />
            <span className="text-sm font-semibold">Eliminar</span>
          </div>
        </motion.div>

        {/* Fondo derecha - Completar/Reabrir (verde) */}
        <motion.div
          className="absolute inset-y-0 right-0 flex items-center justify-end px-6 rounded-lg"
          style={{ 
            background: 'linear-gradient(270deg, rgba(16,185,129,0.9), rgba(16,185,129,0.3))', 
            opacity: opacityRight.get()
          }}
        >
          <div className="flex items-center gap-2 text-white">
            <span className="text-sm font-semibold">{task.completed ? 'Reabrir' : 'Completar'}</span>
            {task.completed ? <Undo2 size={22} /> : <Check size={22} />}
          </div>
        </motion.div>

        {/* 🎨 Tarjeta deslizable CON FONDO DE COLOR VISIBLE */}
        <motion.div
          drag={isSelectionMode ? false : 'x'}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          style={{ x }}
          onDragEnd={handleDragEnd}
          onClick={handleCardClick}
          className={`
            relative z-10 cursor-pointer
            transition-all duration-200 
            last:border-b-0
            ${borderRadiusConfig.class}
          `}
          whileTap={{ cursor: 'grabbing' }}
        >
          {/* 🎨 CAPA DE FONDO CON COLOR (siempre visible) */}
          <div 
            className={`absolute inset-0 ${borderRadiusConfig.class}`}
            style={{ 
              backgroundColor: backgroundColor,
              borderBottom: `1px solid ${borderColorRgba}`,
            }}
          />
          
          {/* 🎨 BARRA LATERAL DE COLOR (viñeta) */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-2 ${borderRadiusConfig.class === 'rounded-none' ? '' : 'rounded-l-lg'}`}
            style={{ backgroundColor: taskColor }}
          />

          {/* CONTENIDO DE LA TARJETA (sobre el fondo de color) */}
          <div className={`relative p-4 ${sizeConfig.cardPadding}`}>
            <div className={`flex items-start ${sizeConfig.gap}`}>
              {/* Checkbox de selección o completado */}
              {isSelectionMode ? (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect?.(task.id);
                  }}
                  className="mt-0.5 flex-shrink-0 relative z-10"
                  aria-label={isSelected ? "Deseleccionar" : "Seleccionar"}
                >
                  {isSelected ? (
                    <CheckSquare size={20} className="text-emerald-500" />
                  ) : (
                    <Square size={20} className={`${classes.icon.secondary} hover:text-emerald-500 transition-colors`} />
                  )}
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete(task.id);
                  }}
                  className="mt-0.5 flex-shrink-0 relative z-10"
                  aria-label={task.completed ? "Marcar como pendiente" : "Marcar como completada"}
                >
                  {task.completed ? (
                    <Check size={20} className="text-emerald-500" />
                  ) : (
                    <Circle size={20} className={`${classes.icon.secondary} hover:text-emerald-500 transition-colors`} />
                  )}
                </motion.button>
              )}

              {/* 🎨 Icono personalizado de la tarea */}
              {hasCustomization && (
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
              )}
              
              {/* Contenido principal */}
              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${priorityStyles.bg} ${priorityStyles.text} border ${priorityStyles.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${priorityStyles.dot}`} />
                    {task.priority}
                  </div>
                  
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryStyle(task.category)}`}>
                    {getCategoryIcon(task.category)}{task.category}
                  </span>
                  
                  {task.isFavorite && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-500">
                      <Star size={10} fill="currentColor" />Favorita
                    </span>
                  )}
                  
                  {task.isArchived && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-500/10 text-gray-500">
                      <Archive size={10} />Archivada
                    </span>
                  )}
                  
                  {task.dueDate && !task.completed && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      isOverdue() 
                        ? 'bg-red-500/10 text-red-500 border border-red-500/30' 
                        : isDueSoon() 
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                        : `${classes.bg.secondary} ${classes.text.muted}`
                    }`}>
                      <Calendar size={10} />
                      {new Date(task.dueDate).toLocaleDateString()}
                      {isOverdue() && ' · Vencida'}
                      {isDueSoon() && !isOverdue() && ' · Pronto vence'}
                    </span>
                  )}
                </div>
                
                {/* 🎨 Título con tamaño personalizado */}
                <h4 className={`${sizeConfig.titleSize} font-medium ${task.completed ? 'line-through ' + classes.text.muted : classes.text.primary}`}>
                  {task.title}
                </h4>
                
                {/* 🎨 Descripción (visible según tamaño) */}
                {task.description && taskSize !== 'sm' && (
                  <p className={`text-xs mt-1 line-clamp-2 ${task.completed ? classes.text.muted : classes.text.secondary}`}>
                    {task.description}
                  </p>
                )}
                
                <div className="flex items-center gap-1.5 mt-2">
                  <Calendar size={12} className={classes.icon.secondary} />
                  <span className={`text-xs ${classes.text.muted}`}>
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Menú de tres puntos (solo en modo normal) */}
              {!isSelectionMode && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(true);
                  }}
                  className="p-2 rounded-xl transition-all duration-300 flex-shrink-0 relative z-10"
                  style={{
                    backgroundColor: priorityStyles.bg,
                    color: priorityStyles.text,
                    border: `1px solid ${priorityStyles.border}`,
                  }}
                  aria-label="Abrir menú de opciones"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Menú circular */}
      <CircularMenu
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        items={menuItems}
        centerColor={getCenterColor()}
      />
    </>
  );
};