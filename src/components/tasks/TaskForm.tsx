// src/components/tasks/TaskCard.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Circle, 
  Calendar, 
  Star,
  Archive,
  Trash2,
  Edit
} from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { CircularMenu } from '../ui/CircularMenu';
import type { Task } from '../../types/task';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onToggleFavorite?: (id: string) => void;
  onToggleArchive?: (id: string) => void;
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
  onDelete,
  onEdit,
  onToggleFavorite,
  onToggleArchive,
}) => {
  const classes = useThemeClasses();
  const [showMenu, setShowMenu] = useState(false);

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

  // Opciones del menú circular
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
      action: () => onEdit(task),
      active: false,
    },
    {
      icon: Trash2,
      label: 'Eliminar',
      color: '#ef4444',
      action: () => onDelete(task.id),
      active: false,
    },
  ];

  // Determinar el color del centro del menú basado en la prioridad
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
        whileHover={{ y: -4, scale: 1.02 }}
        className={`p-4 rounded-xl border ${classes.bg.card} ${classes.border.primary} shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer`}
        style={{
          backgroundColor: task.color ? `${task.color}08` : undefined,
          borderTop: task.color ? `3px solid ${task.color}` : undefined,
        }}
        onClick={() => onEdit(task)}
      >
        {/* Header con checkbox y prioridad */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Checkbox con animación */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(task.id);
              }}
              className="flex-shrink-0"
              aria-label={task.completed ? "Marcar como pendiente" : "Marcar como completada"}
              title={task.completed ? "Marcar como pendiente" : "Marcar como completada"}
            >
              {task.completed ? (
                <Check size={18} className="text-emerald-500" />
              ) : (
                <Circle size={18} className={classes.icon.secondary} />
              )}
            </motion.button>
            
            {/* Badge de prioridad mejorado */}
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${priorityStyles.bg} ${priorityStyles.text} border ${priorityStyles.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priorityStyles.dot}`} />
              {task.priority}
            </div>
            
            {/* Indicador de favorito en header */}
            {task.isFavorite && (
              <Star size={12} className="text-amber-500 fill-amber-500" />
            )}
          </div>
          
          {/* Botón de tres puntos para abrir menú circular */}
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
            title="Opciones"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" 
              />
            </svg>
          </motion.button>
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
          
          {/* Fecha límite mejorada */}
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

      {/* Menú circular centrado */}
      <CircularMenu
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        items={menuItems}
        centerColor={getCenterColor()}
      />
    </>
  );
};