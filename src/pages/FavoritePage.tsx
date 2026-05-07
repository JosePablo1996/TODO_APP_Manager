// src/pages/FavoritePage.tsx
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
  Star,
  Filter,
  CheckCircle,
  Clock,
  Flag,
  Sparkles,
  Heart
} from 'lucide-react';

// Tipos
import type { Task, TaskFilterStatus, TaskSortBy, TaskSortOrder, TaskViewMode } from '../types/task';

// Extender la interfaz Task para incluir isFavorite
interface FavoriteTask extends Task {
  isFavorite?: boolean;
}

const FavoritePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { 
    tasks, 
    deleteTask, 
    toggleTask,
    toggleFavorite
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

  // Filtrar solo tareas favoritas
  const favoriteTasks = useMemo(() => {
    return tasks.filter(task => (task as FavoriteTask).isFavorite === true);
  }, [tasks]);

  // Estadísticas de favoritos
  const stats = useMemo(() => {
    const total = favoriteTasks.length;
    const completed = favoriteTasks.filter(t => t.completed).length;
    const pending = total - completed;
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const byPriority = {
      alta: favoriteTasks.filter(t => t.priority === 'alta').length,
      media: favoriteTasks.filter(t => t.priority === 'media').length,
      baja: favoriteTasks.filter(t => t.priority === 'baja').length,
    };
    const byCategory = {
      personal: favoriteTasks.filter(t => t.category === 'personal').length,
      trabajo: favoriteTasks.filter(t => t.category === 'trabajo').length,
      estudio: favoriteTasks.filter(t => t.category === 'estudio').length,
      otro: favoriteTasks.filter(t => t.category === 'otro').length,
    };
    return { total, completed, pending, completionPercentage, byPriority, byCategory };
  }, [favoriteTasks]);

  // Filtrar y ordenar tareas favoritas
  const filteredTasks = useMemo(() => {
    const filtered = favoriteTasks.filter(task => {
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
  }, [favoriteTasks, filterStatus, searchQuery, selectedCategory, selectedPriority, sortBy, sortOrder]);

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
    const task = favoriteTasks.find(t => t.id === id);
    if (task && !task.completed) {
      setShowConfetti(true);
    }
    toggleTask(id);
  }, [favoriteTasks, toggleTask]);

  // Manejar eliminación suave de tarea (mover a papelera)
  const handleSoftDelete = useCallback((id: string) => {
    deleteTask(id);
  }, [deleteTask]);

  // Manejar toggle de favorito
  const handleToggleFavorite = useCallback((id: string) => {
    toggleFavorite(id);
  }, [toggleFavorite]);

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
    <div className={`min-h-screen ${classes.bg.primary} flex`}>
      {/* LeftMenu */}
      <LeftMenu 
        isOpen={isLeftMenuOpen}
        onClose={toggleLeftMenu}
        user={safeUser}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isLeftMenuOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <Header
          user={safeUser}
          onLogout={handleLogout}
          notifications={notifications}
          onMarkNotificationAsRead={() => {}}
          onClearAllNotifications={() => {}}
          onSearch={setSearchQuery}
        />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Confetti Effect */}
            <ConfettiEffect 
              isActive={showConfetti} 
              onComplete={() => setShowConfetti(false)} 
            />

            {/* Header de la página */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate('/')}
                className={`p-2 rounded-lg transition-colors ${classes.bg.hover}`}
                aria-label="Volver al inicio"
              >
                <ArrowLeft className={`w-5 h-5 ${classes.icon.secondary}`} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
                <h1 className={`text-2xl font-bold flex items-center gap-2 ${classes.text.primary}`}>
                  <Star className="text-amber-500 fill-amber-500" size={24} />
                  Mis Favoritos
                </h1>
              </div>
            </div>

            {/* Tarjetas de estadísticas de favoritos */}
            {stats.total > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard
                  title="Total Favoritos"
                  value={stats.total}
                  icon={<Star size={20} className="text-amber-500" />}
                  color="amber"
                />
                <StatCard
                  title="Completadas"
                  value={stats.completed}
                  icon={<CheckCircle size={20} />}
                  color="teal"
                  trend={{ value: stats.completionPercentage, positive: stats.completionPercentage >= 50 }}
                />
                <StatCard
                  title="Pendientes"
                  value={stats.pending}
                  icon={<Clock size={20} />}
                  color="amber"
                />
                <StatCard
                  title="Alta Prioridad"
                  value={stats.byPriority.alta}
                  icon={<Flag size={20} />}
                  color="red"
                />
              </div>
            )}

            {/* Mensaje cuando no hay favoritos */}
            {stats.total === 0 ? (
              <div className={`rounded-2xl border p-12 text-center ${classes.bg.card} ${classes.border.primary}`}>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Heart size={48} className="text-amber-500" />
                  </div>
                  <h2 className={`text-xl font-bold ${classes.text.primary}`}>No tienes tareas favoritas</h2>
                  <p className={`text-sm ${classes.text.secondary} max-w-md`}>
                    Marca una tarea como favorita usando la estrella en la lista de tareas para que aparezca aquí.
                  </p>
                  <button
                    onClick={() => navigate('/tareas')}
                    className={`mt-4 px-6 py-2 rounded-lg font-medium transition-all ${classes.button.primary}`}
                  >
                    Ir a mis tareas
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Filtros rápidos */}
                <div className={`rounded-xl shadow-md p-4 mb-6 ${classes.bg.card} ${classes.border.primary} border`}>
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Filter size={18} className={classes.icon.secondary} />
                      <span className={`font-medium ${classes.text.primary}`}>Filtros</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
                      <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                          const [newSortBy, newSortOrder] = e.target.value.split('-');
                          handleSortChange(newSortBy as TaskSortBy, newSortOrder as TaskSortOrder);
                        }}
                        className={`text-sm px-3 py-1.5 rounded-lg border ${classes.bg.input} ${classes.text.primary} ${classes.border.primary}`}
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

                {/* Lista de tareas favoritas */}
                <div className={`rounded-xl shadow-lg overflow-hidden ${classes.bg.card} ${classes.border.primary} border`}>
                  <div className={`p-4 border-b ${classes.border.primary} flex justify-between items-center`}>
                    <h3 className={`font-medium ${classes.text.primary}`}>
                      {filteredTasks.length} {filteredTasks.length === 1 ? 'tarea favorita' : 'tareas favoritas'}
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
                    <div className="text-center py-16">
                      <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${classes.bg.secondary}`}>
                        <Sparkles size={32} className={classes.icon.secondary} />
                      </div>
                      <h3 className={`text-lg font-medium mb-2 ${classes.text.primary}`}>No hay tareas favoritas</h3>
                      <p className={classes.text.secondary}>
                        {hasActiveFilters
                          ? 'No se encontraron tareas favoritas con esos filtros'
                          : 'Marca una tarea como favorita para que aparezca aquí'}
                      </p>
                    </div>
                  ) : viewMode === 'list' ? (
                    <div className={`divide-y ${classes.border.primary}`}>
                      {filteredTasks.map((task, index) => (
                        <TaskItem
                          key={`favorite-list-${task.id}-${index}`}
                          task={task}
                          onToggleComplete={handleToggleTask}
                          onSoftDelete={handleSoftDelete}
                          onToggleFavorite={handleToggleFavorite}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                      {filteredTasks.map((task, index) => (
                        <TaskCard
                          key={`favorite-card-${task.id}-${index}`}
                          task={task}
                          onToggleComplete={handleToggleTask}
                          onSoftDelete={handleSoftDelete}
                          onToggleFavorite={handleToggleFavorite}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default FavoritePage;