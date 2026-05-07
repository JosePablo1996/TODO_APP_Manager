// src/components/tasks/TaskCard.tsx
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
import { CircularMenu } from '../ui/CircularMenu';
import type { Task } from '../../types/task';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onSoftDelete: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onToggleArchive?: (id: string) => void;
  // ✅ NUEVO: Props para modo selección
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

export const TaskCard: React.FC<TaskCardProps> = ({
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

  // ✅ Estados para swipe
  const x = useMotionValue(0);
  const swipeThreshold = 80;

  // ✅ Opacidad para fondos de swipe
  const opacityLeft = useTransform(x, [-100, -20], [1, 0]);
  const opacityRight = useTransform(x, [20, 100], [0, 1]);

  // ✅ Manejar fin del swipe
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

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative overflow-hidden rounded-xl"
        style={{ touchAction: 'pan-y' }}
      >
        {/* Fondo izquierda - Eliminar (rojo) */}
        <motion.div
          className="absolute inset-y-0 left-0 flex items-center justify-center px-4 rounded-xl"
          style={{ background: 'linear-gradient(90deg, rgba(239,68,68,0.9), rgba(239,68,68,0.3))', opacity: opacityLeft }}
        >
          <div className="flex flex-col items-center gap-1 text-white">
            <Trash2 size={24} />
            <span className="text-xs font-semibold">Eliminar</span>
          </div>
        </motion.div>

        {/* Fondo derecha - Completar/Reabrir (verde) */}
        <motion.div
          className="absolute inset-y-0 right-0 flex items-center justify-center px-4 rounded-xl"
          style={{ background: 'linear-gradient(270deg, rgba(16,185,129,0.9), rgba(16,185,129,0.3))', opacity: opacityRight }}
        >
          <div className="flex flex-col items-center gap-1 text-white">
            {task.completed ? <Undo2 size={24} /> : <Check size={24} />}
            <span className="text-xs font-semibold">{task.completed ? 'Reabrir' : 'Completar'}</span>
          </div>
        </motion.div>

        {/* Tarjeta deslizable */}
        <motion.div
          drag={isSelectionMode ? false : 'x'}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          whileHover={isSelectionMode ? {} : { y: -4, scale: 1.02 }}
          style={{ x }}
          onDragEnd={handleDragEnd}
          onClick={handleCardClick}
          className={`p-4 border ${classes.bg.card} ${classes.border.primary} shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer relative z-10`}
        >
          {/* Header con checkbox y prioridad */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {/* Checkbox de selección o completado */}
              {isSelectionMode ? (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect?.(task.id);
                  }}
                  className="flex-shrink-0"
                  aria-label={isSelected ? "Deseleccionar" : "Seleccionar"}
                >
                  {isSelected ? (
                    <CheckSquare size={18} className="text-emerald-500" />
                  ) : (
                    <Square size={18} className={`${classes.icon.secondary} hover:text-emerald-500 transition-colors`} />
                  )}
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete(task.id);
                  }}
                  className="flex-shrink-0"
                  aria-label={task.completed ? "Marcar como pendiente" : "Marcar como completada"}
                >
                  {task.completed ? (
                    <Check size={18} className="text-emerald-500" />
                  ) : (
                    <Circle size={18} className={classes.icon.secondary} />
                  )}
                </motion.button>
              )}
              
              {/* Badge de prioridad */}
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${priorityStyles.bg} ${priorityStyles.text} border ${priorityStyles.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${priorityStyles.dot}`} />
                {task.priority}
              </div>
              
              {/* Indicador de favorito */}
              {task.isFavorite && (
                <Star size={12} className="text-amber-500 fill-amber-500" />
              )}
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
                className="p-1.5 rounded-lg transition-all duration-300 flex-shrink-0"
                style={{
                  backgroundColor: `${priorityStyles.bg}`,
                  color: priorityStyles.text,
                  border: `1px solid ${priorityStyles.border}`,
                }}
                aria-label="Abrir menú de opciones"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </motion.button>
            )}
          </div>

          {/* Título y descripción */}
          <h4 className={`font-medium mb-1 ${task.completed ? 'line-through ' + classes.text.muted : classes.text.primary}`}>
            {task.title}
          </h4>
          {task.description && (
            <p className={`text-xs mb-2 line-clamp-2 ${classes.text.muted}`}>
              {task.description}
            </p>
          )}

          {/* Badges y fecha */}
          <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
            {/* Categoría */}
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${getCategoryStyle(task.category)}`}>
              {getCategoryIcon(task.category)}
              {task.category}
            </span>
            
            {/* Fecha límite */}
            {task.dueDate && !task.completed && (
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${
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
            
            {/* Badge de archivada */}
            {task.isArchived && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-500/10 text-gray-500 border border-gray-500/30">
                <Archive size={10} />
                Archivada
              </span>
            )}
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