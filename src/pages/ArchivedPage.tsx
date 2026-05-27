// src/pages/ArchivedPage.tsx
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { useThemeClasses } from '../hooks/useThemeClasses';
import Header from '../components/Header';
import LeftMenu from '../components/LeftMenu';
import type { Notification } from '../components/Header';

// Componentes UI
import { TaskItem } from '../components/tasks/TaskItem';
import { TaskCard } from '../components/tasks/TaskCard';
import { QuickFilters } from '../components/ui/QuickFilters';
import { ConfettiEffect } from '../components/ui/ConfettiEffect';
import { ViewToggle } from '../components/layout/ViewToggle';
import { StatCard } from '../components/stats/StatCard';

// Iconos
import {
  ArrowLeft,
  Archive,
  Filter,
  CheckCircle,
  Clock,
  Flag,
  Sparkles,
  FolderOpen,
  RotateCcw
} from 'lucide-react';

// Tipos
import type { Task, TaskFilterStatus, TaskSortBy, TaskSortOrder, TaskViewMode } from '../types/task';

// Extender la interfaz Task para incluir isArchived
interface ArchivedTask extends Task {
  isArchived?: boolean;
}

const ArchivedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { 
    tasks, 
    updateTask, 
    deleteTask, 
    toggleTask,
    toggleArchive
  } = useTasks();
  const classes = useThemeClasses();

  // Estados locales
  const [notifications] = useState<Notification[]>([]);
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskFilterStatus>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [sortBy, setSortBy] = useState<TaskSortBy>('date');
  const [sortOrder, setSortOrder] = useState<TaskSortOrder>('desc');
  const [viewMode, setViewMode] = useState<TaskViewMode>('list');
  const [showConfetti, setShowConfetti] = useState(false);

  // Filtrar solo tareas archivadas
  const archivedTasks = useMemo(() => {
    return tasks.filter(task => (task as ArchivedTask).isArchived === true);
  }, [tasks]);

  // Estadísticas de archivados
  const stats = useMemo(() => {
    const total = archivedTasks.length;
    const completed = archivedTasks.filter(t => t.completed).length;
    const pending = total - completed;
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const byPriority = {
      alta: archivedTasks.filter(t => t.priority === 'alta').length,
      media: archivedTasks.filter(t => t.priority === 'media').length,
      baja: archivedTasks.filter(t => t.priority === 'baja').length,
    };
    const byCategory = {
      personal: archivedTasks.filter(t => t.category === 'personal').length,
      trabajo: archivedTasks.filter(t => t.category === 'trabajo').length,
      estudio: archivedTasks.filter(t => t.category === 'estudio').length,
      otro: archivedTasks.filter(t => t.category === 'otro').length,
    };
    return { total, completed, pending, completionPercentage, byPriority, byCategory };
  }, [archivedTasks]);

  // Filtrar y ordenar tareas archivadas
  const filteredTasks = useMemo(() => {
    const filtered = archivedTasks.filter(task => {
      // Filtro por estado
      if (filterStatus === 'active' && task.completed) return false;
      if (filterStatus === 'completed' && !task.completed) return false;
      
      // Filtro por búsqueda
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      // Filtro por categoría
      if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;
      
      // Filtro por prioridad
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
      
      return true;
    });

    // Ordenar tareas
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc' 
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'priority') {
        const priorityOrder = { alta: 3, media: 2, baja: 1 };
        return sortOrder === 'desc'
          ? priorityOrder[b.priority] - priorityOrder[a.priority]
          : priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sortBy === 'title') {
        return sortOrder === 'desc'
          ? b.title.localeCompare(a.title)
          : a.title.localeCompare(b.title);
      }
      return 0;
    });

    return filtered;
  }, [archivedTasks, filterStatus, searchQuery, selectedCategory, selectedPriority, sortBy, sortOrder]);

  // Verificar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return filterStatus !== 'all' || 
           selectedCategory !== 'all' || 
           selectedPriority !== 'all' || 
           searchQuery !== '';
  }, [filterStatus, selectedCategory, selectedPriority, searchQuery]);

  // Limpiar todos los filtros
  const clearFilters = useCallback(() => {
    setFilterStatus('all');
    setSelectedCategory('all');
    setSelectedPriority('all');
    setSearchQuery('');
  }, []);

  // Manejar cambio de filtros
  const handleFilterChange = useCallback((filterType: string, value: string) => {
    if (filterType === 'status') {
      setFilterStatus(value as TaskFilterStatus);
    } else if (filterType === 'category') {
      setSelectedCategory(value);
    } else if (filterType === 'priority') {
      setSelectedPriority(value);
    }
  }, []);

  // Manejar cambio de ordenamiento
  const handleSortChange = useCallback((sort: TaskSortBy, order: TaskSortOrder) => {
    setSortBy(sort);
    setSortOrder(order);
  }, []);

  // Manejar toggle de tarea con confeti
  const handleToggleTask = useCallback((id: string) => {
    const task = archivedTasks.find(t => t.id === id);
    if (task && !task.completed) {
      setShowConfetti(true);
    }
    toggleTask(id);
  }, [archivedTasks, toggleTask]);

  // Manejar eliminación suave de tarea (mover a papelera)
  const handleSoftDelete = useCallback((id: string) => {
    deleteTask(id);
  }, [deleteTask]);

  // Manejar restauración de tarea (desarchivar)
  const handleRestoreTask = useCallback((id: string) => {
    toggleArchive(id);
  }, [toggleArchive]);

  // Manejar restauración de todas las tareas
  const handleRestoreAllTasks = useCallback(() => {
    filteredTasks.forEach(task => handleRestoreTask(task.id));
  }, [filteredTasks, handleRestoreTask]);

  // Manejar toggle de favorito (opcional)
  const handleToggleFavorite = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      updateTask(id, { isFavorite: !task.isFavorite });
    }
  }, [tasks, updateTask]);

  // Handler para logout
  const handleLogout = (): void => {
    logout();
  };

  // Toggle del menú izquierdo
  const toggleLeftMenu = useCallback((): void => {
    setIsLeftMenuOpen(prev => !prev);
  }, []);

  // Crear objeto user seguro
  const safeUser = user ? {
    id: user.id,
    username: user.username,
    full_name: user.full_name || user.username,
    email: user.email,
    avatar: user.avatar,
    banner: user.banner,
    bio: user.bio,
    email_verified: user.email_verified || false,
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at
  } : null;

  // Si no hay usuario, mostrar null (redirigirá a login)
  if (!safeUser) {
    return null;
  }

  return (
    <div className={`min-h-screen ${classes.bg.primary}`}>
      {/* LeftMenu - Overlay puro */}
      <LeftMenu 
        isOpen={isLeftMenuOpen}
        onClose={toggleLeftMenu}
        user={safeUser}
        onLogout={handleLogout}
      />

      {/* Main Content - SIN MÁRGENES IZQUIERDOS */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header
          user={safeUser}
          onLogout={handleLogout}
          notifications={notifications}
          onMarkNotificationAsRead={() => {}}
          onClearAllNotifications={() => {}}
          onSearch={setSearchQuery}
          onMenuToggle={toggleLeftMenu}
        />

        {/* Page Content - CERO MÁRGENES */}
        <main className="flex-1 overflow-auto">
          <div className="w-full px-2 sm:px-3 py-2 sm:py-3">
            {/* Confetti Effect */}
            <ConfettiEffect 
              isActive={showConfetti} 
              onComplete={() => setShowConfetti(false)} 
            />

            {/* Header de la página - compacto */}
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <button
                onClick={() => navigate('/')}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${classes.bg.hover}`}
                aria-label="Volver al inicio"
              >
                <ArrowLeft className={`w-4 h-4 sm:w-5 sm:h-5 ${classes.icon.secondary}`} />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-gray-500 to-gray-600 rounded-full" />
                <h1 className={`text-lg sm:text-xl font-bold flex items-center gap-2 ${classes.text.primary}`}>
                  <Archive className="text-gray-500" size={18} />
                  Tareas Archivadas
                </h1>
              </div>
            </div>

            {/* Tarjetas de estadísticas de archivados - compactas */}
            {stats.total > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-5">
                <StatCard
                  title="Total Archivadas"
                  value={stats.total}
                  icon={<Archive size={16} className="text-gray-500" />}
                  color="gray"
                />
                <StatCard
                  title="Completadas"
                  value={stats.completed}
                  icon={<CheckCircle size={16} />}
                  color="teal"
                  trend={{ value: stats.completionPercentage, positive: stats.completionPercentage >= 50 }}
                />
                <StatCard
                  title="Pendientes"
                  value={stats.pending}
                  icon={<Clock size={16} />}
                  color="amber"
                />
                <StatCard
                  title="Alta Prioridad"
                  value={stats.byPriority.alta}
                  icon={<Flag size={16} />}
                  color="red"
                />
              </div>
            )}

            {/* Mensaje cuando no hay archivados */}
            {stats.total === 0 ? (
              <div className={`rounded-xl border p-6 sm:p-8 text-center ${classes.bg.card} ${classes.border.primary}`}>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-500/10 flex items-center justify-center">
                    <FolderOpen size={32} className="text-gray-500" />
                  </div>
                  <h2 className={`text-lg sm:text-xl font-bold ${classes.text.primary}`}>No hay tareas archivadas</h2>
                  <p className={`text-xs sm:text-sm ${classes.text.secondary} max-w-md`}>
                    Las tareas que archives aparecerán aquí. Puedes restaurarlas cuando quieras.
                  </p>
                  <button
                    onClick={() => navigate('/tareas')}
                    className={`mt-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-lg font-medium transition-all text-sm ${classes.button.primary}`}
                  >
                    Ir a mis tareas
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Filtros rápidos - compactos */}
                <div className={`rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-5 ${classes.bg.card} ${classes.border.primary} border`}>
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <Filter size={14} className={classes.icon.secondary} />
                      <span className={`text-sm font-medium ${classes.text.primary}`}>Filtros</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
                      <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                          const [newSortBy, newSortOrder] = e.target.value.split('-');
                          handleSortChange(newSortBy as TaskSortBy, newSortOrder as TaskSortOrder);
                        }}
                        className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-lg border ${classes.bg.input} ${classes.text.primary} ${classes.border.primary}`}
                        aria-label="Ordenar tareas"
                        title="Ordenar tareas"
                      >
                        <option value="date-desc">📅 Más recientes</option>
                        <option value="date-asc">📅 Más antiguas</option>
                        <option value="priority-desc">⚠️ Mayor prioridad</option>
                        <option value="priority-asc">⚠️ Menor prioridad</option>
                        <option value="title-asc">🔤 Título A-Z</option>
                        <option value="title-desc">🔤 Título Z-A</option>
                      </select>
                    </div>
                  </div>

                  <QuickFilters
                    activeFilters={{
                      status: filterStatus,
                      category: selectedCategory,
                      priority: selectedPriority,
                    }}
                    onFilterChange={handleFilterChange}
                    onClearFilters={clearFilters}
                    hasActiveFilters={hasActiveFilters}
                  />
                </div>

                {/* Lista de tareas archivadas */}
                <div className={`rounded-lg shadow-md overflow-hidden ${classes.bg.card} ${classes.border.primary} border`}>
                  <div className={`p-3 sm:p-4 border-b ${classes.border.primary} flex justify-between items-center`}>
                    <h3 className={`text-sm font-medium ${classes.text.primary}`}>
                      {filteredTasks.length} {filteredTasks.length === 1 ? 'tarea archivada' : 'tareas archivadas'}
                      {hasActiveFilters && ' filtradas'}
                    </h3>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className={`text-xs px-2 py-1 rounded ${classes.bg.hover} ${classes.text.muted}`}
                        aria-label="Limpiar todos los filtros"
                        title="Limpiar todos los filtros"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>

                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-12 sm:py-16">
                      <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${classes.bg.secondary}`}>
                        <Sparkles size={24} className={classes.icon.secondary} />
                      </div>
                      <h3 className={`text-base sm:text-lg font-medium mb-1 ${classes.text.primary}`}>No hay tareas archivadas</h3>
                      <p className={`text-xs sm:text-sm ${classes.text.secondary}`}>
                        {hasActiveFilters
                          ? 'No se encontraron tareas archivadas con esos filtros'
                          : 'Las tareas que archives aparecerán aquí'}
                      </p>
                    </div>
                  ) : viewMode === 'list' ? (
                    <div className={`divide-y ${classes.border.primary}`}>
                      {filteredTasks.map((task, index) => (
                        <TaskItem
                          key={`archived-list-${task.id}-${index}`}
                          task={task}
                          onToggleComplete={handleToggleTask}
                          onSoftDelete={handleSoftDelete}
                          onToggleFavorite={handleToggleFavorite}
                          onToggleArchive={handleRestoreTask}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
                      {filteredTasks.map((task, index) => (
                        <TaskCard
                          key={`archived-card-${task.id}-${index}`}
                          task={task}
                          onToggleComplete={handleToggleTask}
                          onSoftDelete={handleSoftDelete}
                          onToggleFavorite={handleToggleFavorite}
                          onToggleArchive={handleRestoreTask}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Botón para restaurar todas las tareas */}
                {filteredTasks.length > 0 && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleRestoreAllTasks}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${classes.button.secondary}`}
                      aria-label="Restaurar todas las tareas"
                      title="Restaurar todas las tareas"
                    >
                      <RotateCcw size={14} />
                      Restaurar todas
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ArchivedPage;