// src/pages/ProtectedPage.tsx
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { useDebounce } from '../hooks/useDebounce';
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
import { ProgressCircle } from '../components/stats/ProgressCircle';
import { WeeklySummary } from '../components/stats/WeeklySummary';
import { TaskCalendar } from '../components/calendar/TaskCalendar';

// Iconos
import {
  CheckCircle,
  Clock,
  ListTodo,
  Flag,
  Calendar,
  TrendingUp,
  Award,
  BarChart3,
  Sparkles,
  Filter,
  Zap,
  Plus,
  ClipboardList,
  Trash2,
  AlertTriangle,
  Square,
  CheckSquare,
  X,
  CheckCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Tipos
import type { Task, TaskFilterStatus, TaskSortBy, TaskSortOrder, TaskViewMode } from '../types/task';

// Clave para localStorage
const STORAGE_KEYS = {
  VIEW_MODE: 'todoapp_view_mode',
  SORT_BY: 'todoapp_sort_by',
  SORT_ORDER: 'todoapp_sort_order',
  FILTER_STATUS: 'todoapp_filter_status',
  SELECTED_CATEGORY: 'todoapp_selected_category',
  SELECTED_PRIORITY: 'todoapp_selected_priority',
  ACTIVE_TAB: 'todoapp_active_tab'
};

// ✅ Modal de confirmación para mover a papelera (individual)
const ConfirmDeleteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle?: string;
  isProcessing?: boolean;
}> = ({ isOpen, onClose, onConfirm, taskTitle, isProcessing }) => {
  const classes = useThemeClasses();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`relative w-full max-w-md rounded-2xl overflow-hidden ${classes.bg.card} shadow-2xl`}
      >
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Mover a papelera
          </h3>
        </div>
        <div className="p-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-amber-500/20 rounded-full">
              <Trash2 className="w-8 h-8 text-amber-500" />
            </div>
          </div>
          <p className={`text-center mb-2 ${classes.text.primary}`}>
            ¿Estás seguro de que quieres mover esta tarea a la papelera?
          </p>
          {taskTitle && (
            <p className={`text-center text-sm font-medium mb-4 ${classes.text.secondary}`}>
              "{taskTitle}"
            </p>
          )}
          <p className={`text-center text-sm mb-6 ${classes.text.muted}`}>
            La tarea se moverá a la papelera donde podrás restaurarla más tarde o eliminarla permanentemente.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${classes.button.secondary} disabled:opacity-50`}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Mover a papelera
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ✅ Modal de confirmación para eliminación masiva (BulkDeleteModal)
const BulkDeleteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
  isProcessing?: boolean;
}> = ({ isOpen, onClose, onConfirm, count, isProcessing }) => {
  const classes = useThemeClasses();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`relative w-full max-w-md rounded-2xl overflow-hidden ${classes.bg.card} shadow-2xl`}
      >
        <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Eliminación masiva
          </h3>
        </div>
        <div className="p-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-500/20 rounded-full">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <p className={`text-center mb-2 ${classes.text.primary}`}>
            ¿Estás seguro de que quieres mover {count} {count === 1 ? 'tarea' : 'tareas'} a la papelera?
          </p>
          <p className={`text-center text-sm mb-6 ${classes.text.muted}`}>
            Las tareas se moverán a la papelera donde podrás restaurarlas más tarde o eliminarlas permanentemente.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${classes.button.secondary} disabled:opacity-50`}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Eliminar {count}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ProtectedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const { 
    tasks, 
    softDeleteTask,
    bulkSoftDelete,
    toggleTask, 
    toggleFavorite,
    toggleArchive,
    getStats 
  } = useTasks();
  const classes = useThemeClasses();
  
  // Estados locales
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // ✅ Nuevos estados para selección masiva
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  
  // Preferencias persistentes
  const [filterStatus, setFilterStatus] = useState<TaskFilterStatus>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FILTER_STATUS);
    return (saved === 'all' || saved === 'active' || saved === 'completed') ? saved : 'all';
  });
  
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_CATEGORY) || 'all';
  });
  
  const [selectedPriority, setSelectedPriority] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_PRIORITY) || 'all';
  });
  
  const [sortBy, setSortBy] = useState<TaskSortBy>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SORT_BY);
    return (saved === 'date' || saved === 'priority' || saved === 'title') ? saved as TaskSortBy : 'date';
  });
  
  const [sortOrder, setSortOrder] = useState<TaskSortOrder>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SORT_ORDER);
    return (saved === 'asc' || saved === 'desc') ? saved : 'desc';
  });
  
  const [viewMode, setViewMode] = useState<TaskViewMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
    return (saved === 'grid' || saved === 'list') ? saved : 'list';
  });
  
  const [activeTab, setActiveTab] = useState<'tasks' | 'stats' | 'calendar'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
    return (saved === 'tasks' || saved === 'stats' || saved === 'calendar') ? saved : 'tasks';
  });
  
  const [showConfetti, setShowConfetti] = useState(false);
  
  // ✅ Estados para el modal de confirmación individual
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // ✅ Estado para procesamiento de eliminación masiva
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Debounce para búsqueda
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Estadísticas
  const stats = getStats();

  // Filtrar tareas activas (no archivadas Y no eliminadas)
  const activeTasks = useMemo(() => {
    return tasks.filter(task => task.isArchived !== true && task.deletedAt === undefined);
  }, [tasks]);

  // Filtrar y ordenar tareas activas
  const filteredTasks = useMemo(() => {
    const filtered = activeTasks.filter(task => {
      if (filterStatus === 'active' && task.completed) return false;
      if (filterStatus === 'completed' && !task.completed) return false;
      if (debouncedSearch && !task.title.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
      if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
      return true;
    });

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
  }, [activeTasks, filterStatus, debouncedSearch, selectedCategory, selectedPriority, sortBy, sortOrder]);

  // Verificar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return filterStatus !== 'all' || 
           selectedCategory !== 'all' || 
           selectedPriority !== 'all' || 
           searchQuery !== '';
  }, [filterStatus, selectedCategory, selectedPriority, searchQuery]);

  // ✅ Verificar si todas las tareas filtradas están seleccionadas
  const areAllFilteredTasksSelected = useMemo(() => {
    if (filteredTasks.length === 0) return false;
    return filteredTasks.every(task => selectedTaskIds.has(task.id));
  }, [filteredTasks, selectedTaskIds]);

  // Guardar preferencias
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FILTER_STATUS, filterStatus);
  }, [filterStatus]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_CATEGORY, selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_PRIORITY, selectedPriority);
  }, [selectedPriority]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SORT_BY, sortBy);
  }, [sortBy]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SORT_ORDER, sortOrder);
  }, [sortOrder]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
  }, [activeTab]);

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
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
      setShowConfetti(true);
    }
    toggleTask(id);
  }, [tasks, toggleTask]);

  // ✅ Mostrar modal de confirmación antes de mover a papelera (individual)
  const handleSoftDeleteClick = useCallback((task: Task) => {
    setTaskToDelete(task);
    setShowConfirmModal(true);
  }, []);

  // ✅ Ejecutar el soft delete después de confirmar (individual)
  const confirmSoftDelete = useCallback(async () => {
    if (taskToDelete) {
      setIsProcessing(true);
      try {
        softDeleteTask(taskToDelete.id);
        setShowConfirmModal(false);
        setTaskToDelete(null);
      } finally {
        setIsProcessing(false);
      }
    }
  }, [taskToDelete, softDeleteTask]);

  // Manejar toggle de favorito
  const handleToggleFavorite = useCallback((id: string) => {
    toggleFavorite(id);
  }, [toggleFavorite]);

  // Manejar toggle de archivado
  const handleToggleArchive = useCallback((id: string) => {
    toggleArchive(id);
  }, [toggleArchive]);

  // Manejar click en tarea desde calendario
  const handleTaskClick = useCallback((task: Task) => {
    console.log('Task clicked:', task);
  }, []);

  // Generar ID para notificaciones
  const generateId = (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Agregar notificación
  const addNotification = useCallback((type: Notification['type'], taskTitle: string): void => {
    const newNotification: Notification = {
      id: generateId(),
      type,
      taskTitle,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 20));
  }, []);

  // Handler para logout
  const handleLogout = (): void => {
    logout();
  };

  // Toggle del menú izquierdo
  const toggleLeftMenu = useCallback((): void => {
    setIsLeftMenuOpen(prev => !prev);
  }, []);

  // ✅ Handler para entrar en modo selección
  const handleEnterSelectionMode = useCallback(() => {
    setIsSelectionMode(true);
    setSelectedTaskIds(new Set());
  }, []);

  // ✅ Handler para toggle de selección de una tarea
  const handleToggleSelect = useCallback((taskId: string) => {
    setSelectedTaskIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  }, []);

  // ✅ Handler para seleccionar/deseleccionar todas las tareas filtradas
  const handleSelectAll = useCallback(() => {
    if (areAllFilteredTasksSelected) {
      setSelectedTaskIds(new Set());
    } else {
      const allIds = filteredTasks.map(task => task.id);
      setSelectedTaskIds(new Set(allIds));
    }
  }, [filteredTasks, areAllFilteredTasksSelected]);

  // ✅ Handler para cancelar el modo selección
  const handleCancelSelection = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedTaskIds(new Set());
  }, []);

  // ✅ Handler para abrir modal de confirmación masiva
  const handleBulkDelete = useCallback(() => {
    if (selectedTaskIds.size > 0) {
      setShowBulkDeleteModal(true);
    }
  }, [selectedTaskIds]);

  // ✅ Handler para confirmar eliminación masiva
  const confirmBulkDelete = useCallback(async () => {
    setIsBulkProcessing(true);
    try {
      bulkSoftDelete(Array.from(selectedTaskIds));
      setShowBulkDeleteModal(false);
      setIsSelectionMode(false);
      setSelectedTaskIds(new Set());
      // Notificación de éxito
      addNotification('complete', `${selectedTaskIds.size} tarea(s) movida(s) a papelera`);
    } finally {
      setIsBulkProcessing(false);
    }
  }, [selectedTaskIds, bulkSoftDelete, addNotification]);

  // Efecto para notificaciones al completar tarea
  useEffect(() => {
    const lastCompletedTask = tasks.find(t => t.completed);
    if (lastCompletedTask) {
      const timer = setTimeout(() => {
        addNotification('complete', lastCompletedTask.title);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [tasks, addNotification]);

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

  // Si está cargando, mostrar spinner
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar null
  if (!isAuthenticated || !safeUser) {
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
          onMarkNotificationAsRead={(id: string) => {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
          }}
          onClearAllNotifications={() => setNotifications([])}
          onSearch={setSearchQuery}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto pb-20">
          <div className="max-w-7xl mx-auto px-2 py-2">
            {/* Confetti Effect */}
            <ConfettiEffect 
              isActive={showConfetti} 
              onComplete={() => setShowConfetti(false)} 
            />

            {/* Tabs de navegación - SIN BORDE */}
            <div className={`flex gap-1 p-0.5 rounded-lg mb-2 ${classes.bg.card}`}>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`flex-1 py-1 px-2 rounded-md text-[11px] font-medium transition-all duration-200 flex items-center justify-center gap-1 ${
                  activeTab === 'tasks'
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-sm'
                    : classes.text.secondary
                }`}
              >
                <ListTodo size={12} />
                Mis Tareas
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex-1 py-1 px-2 rounded-md text-[11px] font-medium transition-all duration-200 flex items-center justify-center gap-1 ${
                  activeTab === 'stats'
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-sm'
                    : classes.text.secondary
                }`}
              >
                <BarChart3 size={12} />
                Estadísticas
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`flex-1 py-1 px-2 rounded-md text-[11px] font-medium transition-all duration-200 flex items-center justify-center gap-1 ${
                  activeTab === 'calendar'
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-sm'
                    : classes.text.secondary
                }`}
              >
                <Calendar size={12} />
                Calendario
              </button>
            </div>

            {/* Contenido según tab */}
            <AnimatePresence mode="wait">
              {activeTab === 'tasks' && (
                <motion.div
                  key="tasks"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Tarjetas de estadísticas con círculo de progreso */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-1.5 mb-2">
                    <StatCard
                      title="Total Tareas"
                      value={stats.total}
                      icon={<ListTodo size={12} />}
                      color="emerald"
                    />
                    <StatCard
                      title="Completadas"
                      value={stats.completed}
                      icon={<CheckCircle size={12} />}
                      color="teal"
                      trend={{ value: stats.completionPercentage, positive: stats.completionPercentage >= 50 }}
                    />
                    <div className="flex justify-center items-center">
                      <ProgressCircle
                        percentage={stats.completionPercentage}
                        label="Progreso total"
                        subtitle={`${stats.completed} de ${stats.total} tareas`}
                        size={70}
                      />
                    </div>
                    <StatCard
                      title="Pendientes"
                      value={stats.pending}
                      icon={<Clock size={12} />}
                      color="amber"
                    />
                    <StatCard
                      title="Alta Prioridad"
                      value={stats.byPriority.alta}
                      icon={<Flag size={12} />}
                      color="red"
                    />
                  </div>

                  {/* Botón para crear nueva tarea */}
                  {!isSelectionMode && (
                    <div className="mb-2">
                      <button
                        onClick={() => navigate('/crear-tarea')}
                        className="w-full py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 group text-xs"
                      >
                        <Plus size={14} />
                        <span>Crear nueva tarea</span>
                      </button>
                    </div>
                  )}

                  {/* Filtros rápidos - solo si hay tareas - SIN BORDE */}
                  {stats.total > 0 && (
                    <div className={`rounded-lg shadow-sm p-1.5 mb-2 ${classes.bg.card}`}>
                      <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                        <div className="flex items-center gap-0.5">
                          <Filter size={10} className={classes.icon.secondary} />
                          <span className={`text-[9px] font-medium ${classes.text.primary}`}>Filtros</span>
                          {hasActiveFilters && (
                            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {/* ✅ Botón de modo selección */}
                          {!isSelectionMode ? (
                            <button
                              onClick={handleEnterSelectionMode}
                              className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium transition-all ${classes.button.secondary} flex items-center gap-1`}
                            >
                              <CheckCheck size={10} />
                              Seleccionar
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={handleSelectAll}
                                className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium transition-all ${classes.button.secondary} flex items-center gap-1`}
                              >
                                {areAllFilteredTasksSelected ? (
                                  <Square size={10} />
                                ) : (
                                  <CheckSquare size={10} />
                                )}
                                Todos
                              </button>
                              <button
                                onClick={handleCancelSelection}
                                className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium transition-all ${classes.button.secondary} flex items-center gap-1`}
                              >
                                <X size={10} />
                                Cancelar
                              </button>
                            </>
                          )}
                          {!isSelectionMode && <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />}
                          <select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                              const [newSortBy, newSortOrder] = e.target.value.split('-');
                              handleSortChange(newSortBy as TaskSortBy, newSortOrder as TaskSortOrder);
                            }}
                            className={`text-[9px] px-1.5 py-0.5 rounded-md ${classes.bg.input} ${classes.text.primary}`}
                          >
                            <option value="date-desc">📅 Recientes</option>
                            <option value="date-asc">📅 Antiguas</option>
                            <option value="priority-desc">⚠️ Mayor prioridad</option>
                            <option value="priority-asc">⚠️ Menor prioridad</option>
                            <option value="title-asc">🔤 A-Z</option>
                            <option value="title-desc">🔤 Z-A</option>
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
                  )}

                  {/* Lista de tareas - SIN BORDE */}
                  <div className={`rounded-lg shadow-sm overflow-hidden ${classes.bg.card}`}>
                    {stats.total > 0 ? (
                      <>
                        <div className={`p-1.5 flex justify-between items-center`}>
                          <h3 className={`text-[10px] font-medium ${classes.text.primary}`}>
                            {filteredTasks.length} {filteredTasks.length === 1 ? 'tarea' : 'tareas'}
                            {hasActiveFilters && ' filtradas'}
                            {isSelectionMode && ` · ${selectedTaskIds.size} seleccionada(s)`}
                          </h3>
                          {hasActiveFilters && !isSelectionMode && (
                            <button
                              onClick={clearFilters}
                              className={`text-[9px] px-1.5 py-0.5 rounded ${classes.bg.hover} ${classes.text.muted}`}
                            >
                              Limpiar
                            </button>
                          )}
                        </div>

                        {filteredTasks.length === 0 ? (
                          <div className="text-center py-8">
                            <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${classes.bg.secondary}`}>
                              <Sparkles size={20} className={classes.icon.secondary} />
                            </div>
                            <h3 className={`text-xs font-medium mb-0.5 ${classes.text.primary}`}>No hay tareas con esos filtros</h3>
                            <p className={`text-[9px] ${classes.text.secondary}`}>
                              Prueba con otros filtros o limpia la búsqueda
                            </p>
                            <button
                              onClick={clearFilters}
                              className={`mt-1.5 px-2.5 py-1 rounded-md text-[9px] font-medium transition-all ${classes.button.secondary}`}
                            >
                              Limpiar filtros
                            </button>
                          </div>
                        ) : viewMode === 'list' ? (
                          <div className={`divide-y ${classes.border.primary}`}>
                            <AnimatePresence>
                              {filteredTasks.map((task, index) => (
                                <TaskItem
                                  key={`task-list-${task.id}-${index}`}
                                  task={task}
                                  onToggleComplete={handleToggleTask}
                                  onSoftDelete={() => handleSoftDeleteClick(task)}
                                  onToggleFavorite={handleToggleFavorite}
                                  onToggleArchive={handleToggleArchive}
                                  isSelectionMode={isSelectionMode}
                                  isSelected={selectedTaskIds.has(task.id)}
                                  onToggleSelect={handleToggleSelect}
                                />
                              ))}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 p-1.5">
                            <AnimatePresence>
                              {filteredTasks.map((task, index) => (
                                <TaskCard
                                  key={`task-card-${task.id}-${index}`}
                                  task={task}
                                  onToggleComplete={handleToggleTask}
                                  onSoftDelete={() => handleSoftDeleteClick(task)}
                                  onToggleFavorite={handleToggleFavorite}
                                  onToggleArchive={handleToggleArchive}
                                  isSelectionMode={isSelectionMode}
                                  isSelected={selectedTaskIds.has(task.id)}
                                  onToggleSelect={handleToggleSelect}
                                />
                              ))}
                            </AnimatePresence>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <div className="flex justify-center mb-3">
                          <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 flex items-center justify-center">
                              <ClipboardList className="w-10 h-10 text-emerald-500/60" strokeWidth={1.5} />
                            </div>
                            <div className="absolute -top-1 -right-1">
                              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                            </div>
                          </div>
                        </div>
                        <h3 className={`text-base font-bold mb-1 ${classes.text.primary}`}>
                          ¡No tienes tareas!
                        </h3>
                        <p className={`text-[11px] ${classes.text.secondary} max-w-md mx-auto mb-3`}>
                          Crea tu primera tarea para comenzar a organizar tu día.
                        </p>
                        <button
                          onClick={() => navigate('/crear-tarea')}
                          className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg font-medium hover:shadow-md transition-all flex items-center gap-1.5 group text-xs mx-auto"
                        >
                          <Plus size={14} className="group-hover:rotate-90 transition-transform" />
                          Crear mi primera tarea
                        </button>
                        <div className="mt-2">
                          <div className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/5 rounded-full">
                            <Zap size={10} className="text-emerald-500" />
                            <span className={`text-[9px] ${classes.text.muted}`}>
                              Organiza, prioriza y cumple tus metas
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'stats' && (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  {stats.total === 0 ? (
                    <div className={`rounded-2xl p-6 text-center ${classes.bg.card}`}>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-14 h-14 rounded-full bg-gray-500/10 flex items-center justify-center">
                          <BarChart3 size={28} className="text-gray-500" />
                        </div>
                        <h2 className={`text-base font-bold ${classes.text.primary}`}>Sin datos estadísticos</h2>
                        <p className={`text-[11px] ${classes.text.secondary} max-w-md`}>
                          Crea tu primera tarea para comenzar a ver estadísticas.
                        </p>
                        <button 
                          onClick={() => navigate('/crear-tarea')} 
                          className={`mt-1 px-3 py-1 rounded-lg font-medium transition-all text-[11px] ${classes.button.primary}`}
                        >
                          Crear mi primera tarea
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <WeeklySummary tasks={tasks} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className={`rounded-xl p-2 ${classes.bg.card}`}>
                          <h3 className={`font-semibold mb-1.5 flex items-center gap-1 text-[11px] ${classes.text.primary}`}>
                            <TrendingUp size={12} className="text-emerald-500" />
                            Distribución por prioridad
                          </h3>
                          <div className="space-y-1">
                            {[
                              { label: 'Alta', value: stats.byPriority.alta, color: 'bg-red-500' },
                              { label: 'Media', value: stats.byPriority.media, color: 'bg-amber-500' },
                              { label: 'Baja', value: stats.byPriority.baja, color: 'bg-emerald-500' }
                            ].map((item, idx) => (
                              <div key={idx}>
                                <div className="flex justify-between text-[10px] mb-0.5">
                                  <span className={classes.text.secondary}>{item.label}</span>
                                  <span className={classes.text.primary}>{item.value}</span>
                                </div>
                                <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                                    style={{ width: `${stats.total > 0 ? (item.value / stats.total) * 100 : 0}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className={`rounded-xl p-2 ${classes.bg.card}`}>
                          <h3 className={`font-semibold mb-1.5 flex items-center gap-1 text-[11px] ${classes.text.primary}`}>
                            <Award size={12} className="text-amber-500" />
                            Distribución por categoría
                          </h3>
                          <div className="space-y-1">
                            {Object.entries(stats.byCategory).map(([category, count]) => (
                              <div key={category}>
                                <div className="flex justify-between text-[10px] mb-0.5">
                                  <span className={classes.text.secondary}>
                                    {category === 'personal' && '👤 '}
                                    {category === 'trabajo' && '💼 '}
                                    {category === 'estudio' && '📚 '}
                                    {category === 'otro' && '📌 '}
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                  </span>
                                  <span className={classes.text.primary}>{count}</span>
                                </div>
                                <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                                    style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {activeTab === 'calendar' && (
                <motion.div
                  key="calendar"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <TaskCalendar
                    tasks={tasks}
                    onTaskClick={handleTaskClick}
                    onTaskToggle={handleToggleTask}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* ✅ Barra flotante de acciones para selección masiva */}
      <AnimatePresence>
        {isSelectionMode && selectedTaskIds.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
          >
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl ${classes.bg.card} border ${classes.border.primary} backdrop-blur-xl bg-opacity-90`}>
              <span className={`text-sm font-medium ${classes.text.primary}`}>
                {selectedTaskIds.size} seleccionada(s)
              </span>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 transition-all text-sm font-medium flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 size={14} />
                Eliminar
              </button>
              <button
                onClick={handleCancelSelection}
                className={`px-3 py-1.5 rounded-lg transition-all text-sm font-medium flex items-center gap-1.5 ${classes.button.secondary}`}
              >
                <X size={14} />
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Modal de confirmación para mover a papelera (individual) */}
      <ConfirmDeleteModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setTaskToDelete(null);
        }}
        onConfirm={confirmSoftDelete}
        taskTitle={taskToDelete?.title}
        isProcessing={isProcessing}
      />

      {/* ✅ Modal de confirmación para eliminación masiva */}
      <BulkDeleteModal
        isOpen={showBulkDeleteModal}
        onClose={() => {
          setShowBulkDeleteModal(false);
        }}
        onConfirm={confirmBulkDelete}
        count={selectedTaskIds.size}
        isProcessing={isBulkProcessing}
      />
    </div>
  );
};

export default ProtectedPage;