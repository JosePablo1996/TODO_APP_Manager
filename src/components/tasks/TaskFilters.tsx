// src/components/tasks/TaskCard.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Circle, 
  Trash2, 
  Edit, 
  Calendar, 
  Clock, 
  Star
} from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import type { Task } from '../../types/task';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onSaveEdit: (id: string, updates: Partial<Task>) => void;
  onToggleFavorite?: (id: string) => void;
  isEditing: boolean;
  editData: {
    title: string;
    description: string;
    priority: Task['priority'];
    category: Task['category'];
    dueDate: string;
  };
  setEditData: (data: {
    title: string;
    description: string;
    priority: Task['priority'];
    category: Task['category'];
    dueDate: string;
  }) => void;
  cancelEdit: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onDelete,
  onEdit,
  onSaveEdit,
  onToggleFavorite,
  isEditing,
  editData,
  setEditData,
  cancelEdit,
}) => {
  const classes = useThemeClasses();
  const [isHovered, setIsHovered] = useState(false);

  const getPriorityStyle = (priority: string): string => {
    const styles: Record<string, string> = {
      alta: 'bg-red-500/10 text-red-600 dark:text-red-400',
      media: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      baja: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`p-4 rounded-xl border ${classes.bg.card} ${classes.border.primary} shadow-sm hover:shadow-lg transition-all duration-200`}
    >
      {isEditing ? (
        // Modo edición
        <div className="space-y-3">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            className={`form-input ${classes.bg.input} ${classes.text.primary} ${classes.border.primary}`}
            placeholder="Título"
            aria-label="Editar título de la tarea"
            autoFocus
          />
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            className={`form-textarea ${classes.bg.input} ${classes.text.primary} ${classes.border.primary}`}
            placeholder="Descripción"
            rows={2}
            aria-label="Editar descripción de la tarea"
          />
          <select
            value={editData.priority}
            onChange={(e) => setEditData({ ...editData, priority: e.target.value as Task['priority'] })}
            className={`form-select ${classes.bg.input} ${classes.text.primary} ${classes.border.primary}`}
            aria-label="Seleccionar prioridad de la tarea"
            title="Prioridad"
          >
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
          <select
            value={editData.category}
            onChange={(e) => setEditData({ ...editData, category: e.target.value as Task['category'] })}
            className={`form-select ${classes.bg.input} ${classes.text.primary} ${classes.border.primary}`}
            aria-label="Seleccionar categoría de la tarea"
            title="Categoría"
          >
            <option value="personal">Personal</option>
            <option value="trabajo">Trabajo</option>
            <option value="estudio">Estudio</option>
            <option value="otro">Otro</option>
          </select>
          <input
            type="date"
            value={editData.dueDate}
            onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
            className={`form-input ${classes.bg.input} ${classes.text.primary} ${classes.border.primary}`}
            aria-label="Editar fecha límite"
            title="Fecha límite"
          />
          <div className="flex gap-2">
            <button 
              onClick={() => onSaveEdit(task.id, editData)} 
              className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-2 rounded-lg hover:shadow-md transition-all"
              aria-label="Guardar cambios"
            >
              Guardar
            </button>
            <button 
              onClick={cancelEdit} 
              className={`flex-1 py-2 rounded-lg ${classes.button.secondary}`}
              aria-label="Cancelar edición"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Header con checkbox y acciones */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleComplete(task.id)}
                className="mt-1 flex-shrink-0"
                aria-label={task.completed ? "Marcar como pendiente" : "Marcar como completada"}
                title={task.completed ? "Marcar como pendiente" : "Marcar como completada"}
              >
                {task.completed ? (
                  <Check size={18} className="text-emerald-500" />
                ) : (
                  <Circle size={18} className={classes.icon.secondary} />
                )}
              </button>
              <span className={`text-xs px-2 py-1 rounded-full ${getPriorityStyle(task.priority)}`}>
                {task.priority}
              </span>
            </div>
            <div className={`flex gap-1 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              {onToggleFavorite && (
                <button
                  onClick={() => onToggleFavorite(task.id)}
                  className={`p-1 rounded ${classes.bg.hover} ${task.isFavorite ? 'text-amber-500' : classes.icon.secondary}`}
                  aria-label={task.isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
                  title={task.isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
                >
                  <Star size={14} fill={task.isFavorite ? "currentColor" : "none"} />
                </button>
              )}
              <button
                onClick={() => onEdit(task)}
                className={`p-1 rounded ${classes.bg.hover}`}
                aria-label="Editar tarea"
                title="Editar tarea"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className={`p-1 rounded hover:text-red-500 ${classes.bg.hover}`}
                aria-label="Eliminar tarea"
                title="Eliminar tarea"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Título y descripción */}
          <h4 className={`font-medium mb-1 ${task.completed ? 'line-through ' + classes.text.muted : classes.text.primary}`}>
            {task.title}
          </h4>
          {task.description && (
            <p className={`text-xs mb-2 line-clamp-2 ${classes.text.muted}`}>{task.description}</p>
          )}

          {/* Badges y fecha */}
          <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
            <span className={`text-xs px-2 py-1 rounded ${getCategoryStyle(task.category)}`}>
              {task.category}
            </span>
            {task.dueDate && (
              <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${isOverdue() ? 'bg-red-500/10 text-red-500' : isDueSoon() ? 'bg-amber-500/10 text-amber-500' : classes.bg.secondary} ${classes.text.muted}`}>
                <Calendar size={10} />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
            {isDueSoon() && !task.completed && !isOverdue() && (
              <span className="text-xs px-2 py-1 rounded bg-amber-500/10 text-amber-500 flex items-center gap-1">
                <Clock size={10} />
                Pronto vence
              </span>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
};