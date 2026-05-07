// src/components/ui/QuickFilters.tsx
import { motion } from 'framer-motion';
import { X, Filter, ChevronDown } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface QuickFiltersProps {
  activeFilters: {
    status: 'all' | 'active' | 'completed';
    category: string;
    priority: string;
  };
  onFilterChange: (filterType: string, value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  categories?: { value: string; label: string; icon?: string }[];
  priorities?: { value: string; label: string; color?: string }[];
}

const defaultCategories = [
  { value: 'all', label: 'Todas', icon: '📋' },
  { value: 'personal', label: 'Personal', icon: '👤' },
  { value: 'trabajo', label: 'Trabajo', icon: '💼' },
  { value: 'estudio', label: 'Estudio', icon: '📚' },
  { value: 'otro', label: 'Otro', icon: '📌' },
];

const defaultPriorities = [
  { value: 'all', label: 'Todas', color: 'gray' },
  { value: 'alta', label: 'Alta', color: 'red' },
  { value: 'media', label: 'Media', color: 'amber' },
  { value: 'baja', label: 'Baja', color: 'emerald' },
];

const statusOptions = [
  { value: 'all', label: 'Todas', icon: '📋' },
  { value: 'active', label: 'Pendientes', icon: '⏳' },
  { value: 'completed', label: 'Completadas', icon: '✅' },
];

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    all: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600',
    active: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-600',
    completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-600',
  };
  return colors[status] || colors.all;
};

const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    all: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600',
    alta: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-300 dark:border-red-600',
    media: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-600',
    baja: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-600',
  };
  return colors[priority] || colors.all;
};

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    all: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600',
    personal: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-600',
    trabajo: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-600',
    estudio: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-600',
    otro: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600',
  };
  return colors[category] || colors.all;
};

export const QuickFilters: React.FC<QuickFiltersProps> = ({
  activeFilters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
  categories = defaultCategories,
  priorities = defaultPriorities,
}) => {
  const classes = useThemeClasses();

  const getFilterIcon = (type: string, value: string) => {
    if (type === 'status') {
      const option = statusOptions.find(o => o.value === value);
      return option?.icon || '📋';
    }
    if (type === 'category') {
      const option = categories.find(c => c.value === value);
      return option?.icon || '📌';
    }
    if (type === 'priority') {
      const option = priorities.find(p => p.value === value);
      return option?.label.charAt(0) || '⚡';
    }
    return '🔍';
  };

  const getFilterLabel = (type: string, value: string): string => {
    if (type === 'status') {
      const option = statusOptions.find(o => o.value === value);
      return option?.label || value;
    }
    if (type === 'category') {
      const option = categories.find(c => c.value === value);
      return option?.label || value;
    }
    if (type === 'priority') {
      const option = priorities.find(p => p.value === value);
      return option?.label || value;
    }
    return value;
  };

  const getFilterColor = (type: string, value: string): string => {
    if (type === 'status') return getStatusColor(value);
    if (type === 'category') return getCategoryColor(value);
    if (type === 'priority') return getPriorityColor(value);
    return '';
  };

  const activeFilterList = [
    { type: 'status', value: activeFilters.status, label: 'Estado' },
    { type: 'category', value: activeFilters.category, label: 'Categoría' },
    { type: 'priority', value: activeFilters.priority, label: 'Prioridad' },
  ].filter(filter => filter.value !== 'all');

  return (
    <div className="space-y-3">
      {/* Filtros rápidos - versión compacta */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Filter size={12} />
          <span>Filtros:</span>
        </div>

        {/* Filtro de estado */}
        <div className="relative">
          <select
            value={activeFilters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className={`text-xs px-2 py-1.5 rounded-lg border appearance-none cursor-pointer pr-6 ${getFilterColor('status', activeFilters.status)} ${classes.bg.input}`}
            aria-label="Filtrar por estado"
            title="Filtrar por estado"
          >
            {statusOptions.map(option => (
              <option key={`status-${option.value}`} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Filtro de categoría */}
        <div className="relative">
          <select
            value={activeFilters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
            className={`text-xs px-2 py-1.5 rounded-lg border appearance-none cursor-pointer pr-6 ${getFilterColor('category', activeFilters.category)} ${classes.bg.input}`}
            aria-label="Filtrar por categoría"
            title="Filtrar por categoría"
          >
            {categories.map(cat => (
              <option key={`category-${cat.value}`} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Filtro de prioridad */}
        <div className="relative">
          <select
            value={activeFilters.priority}
            onChange={(e) => onFilterChange('priority', e.target.value)}
            className={`text-xs px-2 py-1.5 rounded-lg border appearance-none cursor-pointer pr-6 ${getFilterColor('priority', activeFilters.priority)} ${classes.bg.input}`}
            aria-label="Filtrar por prioridad"
            title="Filtrar por prioridad"
          >
            {priorities.map(pri => (
              <option key={`priority-${pri.value}`} value={pri.value}>
                {pri.value !== 'all' && (
                  <span className={`inline-block w-2 h-2 rounded-full mr-1 bg-${pri.color}-500`} />
                )}
                {pri.label}
              </option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Botón limpiar filtros */}
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={onClearFilters}
            className="text-xs px-2 py-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 hover:bg-red-500/20 transition-colors flex items-center gap-1"
            aria-label="Limpiar todos los filtros"
            title="Limpiar todos los filtros"
          >
            <X size={12} />
            Limpiar
          </motion.button>
        )}
      </div>

      {/* Filtros activos mostrados como chips */}
      {activeFilterList.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">Activos:</span>
          {activeFilterList.map((filter, index) => (
            <motion.button
              key={`active-filter-${filter.type}-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => onFilterChange(filter.type, 'all')}
              className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-all hover:scale-105 ${getFilterColor(filter.type, filter.value)}`}
              aria-label={`Eliminar filtro de ${filter.label}`}
              title={`Eliminar filtro de ${filter.label}`}
            >
              <span>{getFilterIcon(filter.type, filter.value)}</span>
              <span>{filter.label}: {getFilterLabel(filter.type, filter.value)}</span>
              <X size={10} className="ml-0.5" />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};