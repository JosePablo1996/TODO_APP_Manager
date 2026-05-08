// src/types/task.ts

import type { TaskIconName, TaskSizeValue, TaskOpacityValue, TaskBorderRadiusValue } from '../data/taskCustomization';

/**
 * Interfaz principal de Tarea
 * Representa una tarea en la aplicación TodoApp
 */
export interface Task {
  /** Identificador único de la tarea */
  id: string;
  
  /** Título de la tarea (requerido) */
  title: string;
  
  /** Descripción detallada de la tarea (opcional) */
  description?: string;
  
  /** Estado de la tarea: completada o pendiente */
  completed: boolean;
  
  /** Nivel de prioridad de la tarea */
  priority: 'alta' | 'media' | 'baja';
  
  /** Categoría a la que pertenece la tarea */
  category: 'personal' | 'trabajo' | 'estudio' | 'otro';
  
  /** Fecha de creación en formato ISO */
  createdAt: string;
  
  /** Fecha de última actualización en formato ISO */
  updatedAt: string;
  
  /** Fecha límite de la tarea (opcional) en formato YYYY-MM-DD */
  dueDate?: string;
  
  /** Indica si la tarea está marcada como favorita */
  isFavorite?: boolean;
  
  /** Indica si la tarea está archivada */
  isArchived?: boolean;
  
  /** Fecha de eliminación (soft delete) - undefined si no está eliminada */
  deletedAt?: string;
  
  /** Color personalizado de la tarea (opcional) en formato hexadecimal */
  color?: string;

  // ============================================
  // 🎨 NUEVOS CAMPOS DE PERSONALIZACIÓN (v2.6.0)
  // ============================================

  /** Icono personalizado de la tarea */
  icon?: TaskIconName;

  /** Tamaño de la tarjeta de tarea */
  size?: TaskSizeValue;

  /** Opacidad del color de fondo */
  opacity?: TaskOpacityValue;

  /** Estilo de borde redondeado */
  borderRadius?: TaskBorderRadiusValue;
}

/**
 * Tipo para la prioridad de una tarea
 */
export type TaskPriority = Task['priority'];

/**
 * Tipo para la categoría de una tarea
 */
export type TaskCategory = Task['category'];

/**
 * Tipo para el estado de filtro de tareas
 */
export type TaskFilterStatus = 'all' | 'active' | 'completed';

/**
 * Tipo para el criterio de ordenamiento
 */
export type TaskSortBy = 'date' | 'priority' | 'title';

/**
 * Tipo para el orden de ordenamiento
 */
export type TaskSortOrder = 'asc' | 'desc';

/**
 * Tipo para el modo de visualización
 */
export type TaskViewMode = 'list' | 'grid';

// ============================================
// 🎨 NUEVOS TIPOS DE PERSONALIZACIÓN
// ============================================

/**
 * Configuración completa de personalización de una tarea
 */
export interface TaskCustomization {
  /** Icono personalizado */
  icon: TaskIconName;
  /** Tamaño de la tarjeta */
  size: TaskSizeValue;
  /** Opacidad del color de fondo */
  opacity: TaskOpacityValue;
  /** Estilo de borde redondeado */
  borderRadius: TaskBorderRadiusValue;
}

/**
 * Datos necesarios para crear una nueva tarea
 */
export interface CreateTaskData {
  title: string;
  description?: string;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  color?: string;
  /** 🎨 Personalización de la tarea */
  icon?: TaskIconName;
  size?: TaskSizeValue;
  opacity?: TaskOpacityValue;
  borderRadius?: TaskBorderRadiusValue;
}

/**
 * Datos necesarios para actualizar una tarea
 */
export interface UpdateTaskData {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: TaskPriority;
  category?: TaskCategory;
  dueDate?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  color?: string;
  /** 🎨 Personalización de la tarea */
  icon?: TaskIconName;
  size?: TaskSizeValue;
  opacity?: TaskOpacityValue;
  borderRadius?: TaskBorderRadiusValue;
}

/**
 * Estadísticas de tareas
 */
export interface TaskStats {
  /** Total de tareas */
  total: number;
  
  /** Tareas completadas */
  completed: number;
  
  /** Tareas pendientes */
  pending: number;
  
  /** Porcentaje de completado */
  completionPercentage: number;
  
  /** Distribución por prioridad */
  byPriority: {
    alta: number;
    media: number;
    baja: number;
  };
  
  /** Distribución por categoría */
  byCategory: {
    personal: number;
    trabajo: number;
    estudio: number;
    otro: number;
  };
  
  /** Tareas favoritas */
  favorites: number;
  
  /** Tareas archivadas */
  archived: number;
  
  /** Tareas en papelera */
  deleted?: number;
}

/**
 * Filtros para listar tareas
 */
export interface TaskFilters {
  status?: TaskFilterStatus;
  category?: string;
  priority?: string;
  searchQuery?: string;
  sortBy?: TaskSortBy;
  sortOrder?: TaskSortOrder;
  startDate?: string;
  endDate?: string;
  onlyFavorites?: boolean;
  onlyArchived?: boolean;
  onlyDeleted?: boolean;
}

/**
 * Props para componentes de lista de tareas
 */
export interface TaskListProps {
  tasks: Task[];
  onTaskToggle: (id: string) => void;
  onTaskDelete: (id: string) => void;
  onTaskEdit: (task: Task) => void;
  onTaskUpdate: (id: string, updates: UpdateTaskData) => void;
  onToggleFavorite?: (id: string) => void;
  onToggleArchive?: (id: string) => void;
  viewMode?: TaskViewMode;
  loading?: boolean;
}

/**
 * Props para componente de tarjeta de tarea
 */
export interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onFavorite?: () => void;
  onArchive?: () => void;
  isEditing?: boolean;
  editData?: {
    title: string;
    description: string;
    priority: TaskPriority;
    category: TaskCategory;
    dueDate: string;
  };
  onEditSave?: (updates: UpdateTaskData) => void;
  onEditCancel?: () => void;
  onEditChange?: (data: Partial<Task>) => void;
}

/**
 * Constantes para prioridades
 */
export const PRIORITIES: { value: TaskPriority; label: string; color: string; icon: string }[] = [
  { value: 'alta', label: 'Alta', color: 'red', icon: '🔴' },
  { value: 'media', label: 'Media', color: 'amber', icon: '🟡' },
  { value: 'baja', label: 'Baja', color: 'emerald', icon: '🟢' },
];

/**
 * Constantes para categorías
 */
export const CATEGORIES: { value: TaskCategory; label: string; icon: string; color: string }[] = [
  { value: 'personal', label: 'Personal', icon: '👤', color: 'purple' },
  { value: 'trabajo', label: 'Trabajo', icon: '💼', color: 'blue' },
  { value: 'estudio', label: 'Estudio', icon: '📚', color: 'indigo' },
  { value: 'otro', label: 'Otro', icon: '📌', color: 'gray' },
];

/**
 * Función helper para obtener el color de prioridad
 */
export const getPriorityColor = (priority: TaskPriority): string => {
  const colors: Record<TaskPriority, string> = {
    alta: 'red',
    media: 'amber',
    baja: 'emerald',
  };
  return colors[priority] || 'gray';
};

/**
 * Función helper para obtener el color de categoría
 */
export const getCategoryColor = (category: TaskCategory): string => {
  const colors: Record<TaskCategory, string> = {
    personal: 'purple',
    trabajo: 'blue',
    estudio: 'indigo',
    otro: 'gray',
  };
  return colors[category] || 'gray';
};

/**
 * Función helper para obtener el icono de prioridad
 */
export const getPriorityIcon = (priority: TaskPriority): string => {
  const icons: Record<TaskPriority, string> = {
    alta: '🔴',
    media: '🟡',
    baja: '🟢',
  };
  return icons[priority] || '🟡';
};

/**
 * Función helper para obtener el icono de categoría
 */
export const getCategoryIcon = (category: TaskCategory): string => {
  const icons: Record<TaskCategory, string> = {
    personal: '👤',
    trabajo: '💼',
    estudio: '📚',
    otro: '📌',
  };
  return icons[category] || '📌';
};

/**
 * Función helper para verificar si una tarea está vencida
 */
export const isTaskOverdue = (task: Task): boolean => {
  if (!task.dueDate || task.completed) return false;
  return new Date(task.dueDate) < new Date();
};

/**
 * Función helper para verificar si una tarea vence pronto (próximos 3 días)
 */
export const isTaskDueSoon = (task: Task): boolean => {
  if (!task.dueDate || task.completed) return false;
  const dueDate = new Date(task.dueDate);
  const today = new Date();
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 3 && diffDays >= 0;
};

/**
 * Función helper para verificar si una tarea está eliminada
 */
export const isTaskDeleted = (task: Task): boolean => {
  return task.deletedAt !== undefined;
};

/**
 * Función helper para obtener el tiempo desde que fue eliminada
 */
export const getDeletedTimeAgo = (task: Task): string => {
  if (!task.deletedAt) return '';
  const deletedDate = new Date(task.deletedAt);
  const now = new Date();
  const diffMs = now.getTime() - deletedDate.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return 'hace unos segundos';
  if (diffMinutes < 60) return `hace ${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`;
  if (diffHours < 24) return `hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
  if (diffDays < 30) return `hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
  return `eliminada el ${deletedDate.toLocaleDateString()}`;
};

// ============================================
// 🎨 NUEVAS FUNCIONES HELPER DE PERSONALIZACIÓN
// ============================================

/**
 * Obtiene la configuración de personalización por defecto para nuevas tareas
 */
export const getDefaultTaskCustomization = (): TaskCustomization => {
  return {
    icon: 'CheckCircle',
    size: 'md',
    opacity: 'medium',
    borderRadius: 'medium',
  };
};

/**
 * Combina la personalización por defecto con la proporcionada
 */
export const mergeTaskCustomization = (
  customization?: Partial<TaskCustomization>
): TaskCustomization => {
  const defaults = getDefaultTaskCustomization();
  return {
    icon: customization?.icon || defaults.icon,
    size: customization?.size || defaults.size,
    opacity: customization?.opacity || defaults.opacity,
    borderRadius: customization?.borderRadius || defaults.borderRadius,
  };
};