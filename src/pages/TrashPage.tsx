// src/pages/TrashPage.tsx
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { useThemeClasses } from '../hooks/useThemeClasses';
import Header from '../components/Header';
import LeftMenu from '../components/LeftMenu';
import type { Notification } from '../components/Header';

// Componentes UI
import { QuickFilters } from '../components/ui/QuickFilters';
import { ConfettiEffect } from '../components/ui/ConfettiEffect';
import { ViewToggle } from '../components/layout/ViewToggle';
import { StatCard } from '../components/stats/StatCard';

// Iconos
import {
  ArrowLeft,
  Trash2,
  Filter,
  Clock,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Star,
  Archive,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Tipos
import type { Task, TaskFilterStatus, TaskSortBy, TaskSortOrder, TaskViewMode } from '../types/task';

// Tipo para las clases del tema
interface ThemeClasses {
  bg: {
    primary: string;
    card: string;
    secondary: string;
    hover: string;
    input: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  border: {
    primary: string;
  };
  button: {
    primary: string;
    secondary: string;
  };
  icon: {
    secondary: string;
  };
}

// Modal de confirmación para eliminación permanente
const PermanentDeleteModal: React.FC<{
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
        className={`relative w-full max-w-md rounded-2xl overflow-hidden ${classes.bg.card} border-2 shadow-2xl`}
      >
        <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Eliminar permanentemente
          </h3>
        </div>
        <div className="p-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-500/20 rounded-full">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <p className={`text-center mb-6 ${classes.text.primary}`}>
            ¿Estás seguro de que quieres eliminar permanentemente{taskTitle ? ` "${taskTitle}"` : ''}?
            <br />
            <span className={`text-sm ${classes.text.muted}`}>Esta acción no se puede deshacer.</span>
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
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Eliminar permanentemente
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Modal para vaciar papelera
const EmptyTrashModal: React.FC<{
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
        className={`relative w-full max-w-md rounded-2xl overflow-hidden ${classes.bg.card} border-2 shadow-2xl`}
      >
        <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Vaciar papelera
          </h3>
        </div>
        <div className="p-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-500/20 rounded-full">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <p className={`text-center mb-2 ${classes.text.primary}`}>
            ¿Estás seguro de vaciar la papelera?
          </p>
          <p className={`text-center text-sm mb-6 ${classes.text.muted}`}>
            Se eliminarán permanentemente <span className="font-bold text-red-500">{count}</span> tarea{count !== 1 ? 's' : ''}. Esta acción no se puede deshacer.
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
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Vaciar papelera
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Componente para vista lista de tareas en papelera
const TrashItem: React.FC<{ 
  task: Task; 
  onRestore: () => void; 
  onPermanentDelete: () => void; 
  classes: ThemeClasses;
  isProcessing?: boolean;
}> = ({ task, onRestore, onPermanentDelete, classes, isProcessing }) => {
  const getDeletedDate = () => {
    if (!task.deletedAt) return '';
    const date = new Date(task.deletedAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
    return `Hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) > 1 ? 'es' : ''}`;
  };

  const getPriorityStyle = (priority: string) => {
    const styles: Record<string, string> = {
      alta: 'bg-red-500/10 text-red-500',
      media: 'bg-amber-500/10 text-amber-500',
      baja: 'bg-emerald-500/10 text-emerald-500'
    };
    return styles[priority] || styles.media;
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

  return (
    <div className={`p-3 sm:p-4 transition-all duration-200 ${classes.bg.hover} border-b border-gray-100 dark:border-gray-800 last:border-b-0`}>
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
            <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${getPriorityStyle(task.priority)}`}>
              {task.priority}
            </span>
            <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${classes.bg.secondary} ${classes.text.muted}`}>
              {getCategoryIcon(task.category)} {task.category}
            </span>
            {task.isFavorite && (
              <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-amber-500/10 text-amber-500">
                <Star size={10} className="inline mr-1" />
                Favorita
              </span>
            )}
            {task.isArchived && (
              <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-gray-500/10 text-gray-500">
                <Archive size={10} className="inline mr-1" />
                Archivada
              </span>
            )}
            <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-gray-500/10 ${classes.text.muted}`}>
              <Clock size={10} className="inline mr-1" />
              {getDeletedDate()}
            </span>
          </div>
          <h4 className={`text-sm sm:text-base font-medium ${task.completed ? 'line-through ' + classes.text.muted : classes.text.primary}`}>
            {task.title}
          </h4>
          {task.description && (
            <p className={`text-xs sm:text-sm mt-1 line-clamp-1 ${classes.text.muted}`}>{task.description}</p>
          )}
        </div>
        <div className="flex gap-1.5 sm:gap-2">
          <button
            onClick={onRestore}
            disabled={isProcessing}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${classes.bg.hover} text-emerald-500 hover:text-emerald-600 disabled:opacity-50`}
            title="Restaurar"
          >
            <RotateCcw size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button
            onClick={onPermanentDelete}
            disabled={isProcessing}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${classes.bg.hover} text-red-500 hover:text-red-600 disabled:opacity-50`}
            title="Eliminar permanentemente"
          >
            <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente para vista grid de tareas en papelera
const TrashCard: React.FC<{ 
  task: Task; 
  onRestore: () => void; 
  onPermanentDelete: () => void; 
  classes: ThemeClasses;
  isProcessing?: boolean;
}> = ({ task, onRestore, onPermanentDelete, classes, isProcessing }) => {
  const getDeletedDate = () => {
    if (!task.deletedAt) return '';
    const date = new Date(task.deletedAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
    return `Hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) > 1 ? 'es' : ''}`;
  };

  const getPriorityStyle = (priority: string) => {
    const styles: Record<string, string> = {
      alta: 'bg-red-500/10 text-red-500',
      media: 'bg-amber-500/10 text-amber-500',
      baja: 'bg-emerald-500/10 text-emerald-500'
    };
    return styles[priority] || styles.media;
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

  return (
    <div className={`p-3 sm:p-4 rounded-xl border ${classes.bg.card} ${classes.border.primary} shadow-sm hover:shadow-lg transition-all duration-200`}>
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
        <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${getPriorityStyle(task.priority)}`}>
          {task.priority}
        </span>
        <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${classes.bg.secondary} ${classes.text.muted}`}>
          {getCategoryIcon(task.category)} {task.category}
        </span>
        {task.isFavorite && (
          <Star size={12} className="text-amber-500 fill-amber-500" />
        )}
        <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${classes.bg.secondary} ${classes.text.muted}`}>
          <Clock size={10} className="inline mr-1" />
          {getDeletedDate()}
        </span>
      </div>
      <h4 className={`text-sm sm:text-base font-medium mb-1 ${task.completed ? 'line-through ' + classes.text.muted : classes.text.primary}`}>
        {task.title}
      </h4>
      {task.description && (
        <p className={`text-xs sm:text-sm mb-3 line-clamp-2 ${classes.text.muted}`}>{task.description}</p>
      )}
      <div className={`flex items-center justify-between pt-3 border-t ${classes.border.primary}`}>
        <div className="flex gap-1.5 sm:gap-2">
          <button
            onClick={onRestore}
            disabled={isProcessing}
            className={`p-1.5 rounded-lg ${classes.bg.hover} text-emerald-500 disabled:opacity-50`}
            title="Restaurar"
          >
            <RotateCcw size={14} className="sm:w-[16px] sm:h-[16px]" />
          </button>
          <button
            onClick={onPermanentDelete}
            disabled={isProcessing}
            className={`p-1.5 rounded-lg ${classes.bg.hover} text-red-500 disabled:opacity-50`}
            title="Eliminar permanentemente"
          >
            <Trash2 size={14} className="sm:w-[16px] sm:h-[16px]" />
          </button>
        </div>
        {task.completed && (
          <CheckCircle size={14} className="text-emerald-500" />
        )}
      </div>
    </div>
  );
};

const TrashPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { 
    restoreTask, 
    permanentDeleteTask,
    getDeletedTasks  } = useTasks();
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
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Obtener tareas eliminadas
  const deletedTasks = getDeletedTasks();

  // Estadísticas de la papelera
  const stats = useMemo(() => {
    const total = deletedTasks.length;
    let maxDays = 0;
    for (const task of deletedTasks) {
      if (task.deletedAt) {
        const deletedDate = new Date(task.deletedAt);
        const currentDate = new Date();
        const diffDays = Math.floor((currentDate.getTime() - deletedDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > maxDays) {
          maxDays = diffDays;
        }
      }
    }
    const totalCompleted = deletedTasks.filter(t => t.completed).length;
    const totalPending = total - totalCompleted;
    return { total, totalDays: maxDays, totalCompleted, totalPending };
  }, [deletedTasks]);

  // Filtrar y ordenar tareas eliminadas
  const filteredTasks = useMemo(() => {
    const filtered = deletedTasks.filter(task => {
      if (filterStatus === 'active' && task.completed) return false;
      if (filterStatus === 'completed' && !task.completed) return false;
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
      return true;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = a.deletedAt ? new Date(a.deletedAt).getTime() : 0;
        const dateB = b.deletedAt ? new Date(b.deletedAt).getTime() : 0;
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
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
  }, [deletedTasks, filterStatus, searchQuery, selectedCategory, selectedPriority, sortBy, sortOrder]);

  const hasActiveFilters = useMemo(() => {
    return filterStatus !== 'all' || 
           selectedCategory !== 'all' || 
           selectedPriority !== 'all' || 
           searchQuery !== '';
  }, [filterStatus, selectedCategory, selectedPriority, searchQuery]);

  const clearFilters = useCallback(() => {
    setFilterStatus('all');
    setSelectedCategory('all');
    setSelectedPriority('all');
    setSearchQuery('');
  }, []);

  const handleFilterChange = useCallback((filterType: string, value: string) => {
    if (filterType === 'status') setFilterStatus(value as TaskFilterStatus);
    else if (filterType === 'category') setSelectedCategory(value);
    else if (filterType === 'priority') setSelectedPriority(value);
  }, []);

  const handleSortChange = useCallback((sort: TaskSortBy, order: TaskSortOrder) => {
    setSortBy(sort);
    setSortOrder(order);
  }, []);

  const handleRestore = useCallback(async (id: string) => {
    setIsProcessing(true);
    try {
      restoreTask(id);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } finally {
      setIsProcessing(false);
    }
  }, [restoreTask]);

  const handleRestoreAll = useCallback(async () => {
    if (deletedTasks.length === 0) return;
    setIsProcessing(true);
    try {
      deletedTasks.forEach(task => restoreTask(task.id));
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } finally {
      setIsProcessing(false);
    }
  }, [deletedTasks, restoreTask]);

  const handlePermanentDelete = useCallback((task: Task) => {
    setModalTask(task);
  }, []);

  const confirmPermanentDelete = useCallback(async () => {
    if (modalTask) {
      setIsProcessing(true);
      try {
        permanentDeleteTask(modalTask.id);
        setModalTask(null);
      } finally {
        setIsProcessing(false);
      }
    }
  }, [modalTask, permanentDeleteTask]);

  const handleClearAll = useCallback(() => {
    setShowEmptyModal(true);
  }, []);

  const confirmEmptyTrash = useCallback(async () => {
    setIsProcessing(true);
    try {
      deletedTasks.forEach(task => permanentDeleteTask(task.id));
      setShowEmptyModal(false);
    } finally {
      setIsProcessing(false);
    }
  }, [deletedTasks, permanentDeleteTask]);

  const handleLogout = () => logout();
  const toggleLeftMenu = () => setIsLeftMenuOpen(prev => !prev);

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

  if (!safeUser) return null;

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
          onSearch={setSearchQuery}
          onMenuToggle={toggleLeftMenu}
        />

        {/* Page Content - CERO MÁRGENES */}
        <main className="flex-1 overflow-auto">
          <div className="w-full px-2 sm:px-3 py-2 sm:py-3">
            {/* Header de la página */}
            <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <button 
                  onClick={() => navigate('/tareas')} 
                  className={`p-1.5 sm:p-2 rounded-lg transition-colors ${classes.bg.hover}`}
                  title="Volver a mis tareas"
                >
                  <ArrowLeft className={`w-4 h-4 sm:w-5 sm:h-5 ${classes.icon.secondary}`} />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-red-500 to-pink-500 rounded-full" />
                  <h1 className={`text-base sm:text-xl font-bold flex items-center gap-2 ${classes.text.primary}`}>
                    <Trash2 className="text-red-500" size={16} />
                    Papelera
                  </h1>
                </div>
                {deletedTasks.length > 0 && (
                  <span className="px-1.5 sm:px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full text-[10px] sm:text-xs">
                    {deletedTasks.length}
                  </span>
                )}
              </div>
              {deletedTasks.length > 0 && (
                <button
                  onClick={handleClearAll}
                  disabled={isProcessing}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all flex items-center gap-1 sm:gap-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 disabled:opacity-50`}
                >
                  <Trash2 size={12} className="sm:w-[14px] sm:h-[14px]" />
                  Vaciar papelera
                </button>
              )}
            </div>

            {/* Tarjetas de estadísticas compactas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
              <StatCard title="Tareas eliminadas" value={stats.total} icon={<Trash2 size={14} />} color="gray" />
              <StatCard title="Completadas" value={stats.totalCompleted} icon={<CheckCircle size={14} />} color="teal" />
              <StatCard title="Pendientes" value={stats.totalPending} icon={<Clock size={14} />} color="amber" />
              <StatCard title="Días en papelera" value={stats.totalDays} icon={<Calendar size={14} />} color="cyan" />
            </div>

            {deletedTasks.length === 0 ? (
              <div className={`rounded-xl border p-6 sm:p-8 text-center ${classes.bg.card} ${classes.border.primary}`}>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-500/10 flex items-center justify-center">
                    <Trash2 size={32} className="text-gray-500" />
                  </div>
                  <h2 className={`text-base sm:text-xl font-bold ${classes.text.primary}`}>Papelera vacía</h2>
                  <p className={`text-xs sm:text-sm ${classes.text.secondary} max-w-md`}>
                    Las tareas que elimines aparecerán aquí. Puedes restaurarlas o eliminarlas permanentemente.
                  </p>
                  <button 
                    onClick={() => navigate('/tareas')} 
                    className={`mt-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${classes.button.primary}`}
                  >
                    Ir a mis tareas
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Filtros rápidos - compactos */}
                <div className={`rounded-lg shadow-md p-2 sm:p-3 mb-3 sm:mb-4 ${classes.bg.card} ${classes.border.primary} border`}>
                  <div className="flex items-center justify-between mb-2 sm:mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-1">
                      <Filter size={12} className={classes.icon.secondary} />
                      <span className={`text-xs font-medium ${classes.text.primary}`}>Filtros</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
                      <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                          const [newSortBy, newSortOrder] = e.target.value.split('-');
                          handleSortChange(newSortBy as TaskSortBy, newSortOrder as TaskSortOrder);
                        }}
                        className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-1 rounded-lg border ${classes.bg.input} ${classes.text.primary} ${classes.border.primary}`}
                        title="Ordenar tareas"
                        aria-label="Ordenar tareas"
                      >
                        <option value="date-desc">📅 Más recientes</option>
                        <option value="date-asc">📅 Más antiguas</option>
                        <option value="priority-desc">⚠️ Mayor prioridad</option>
                        <option value="priority-asc">⚠️ Menor prioridad</option>
                        <option value="title-asc">🔤 A-Z</option>
                        <option value="title-desc">🔤 Z-A</option>
                      </select>
                    </div>
                  </div>
                  <QuickFilters
                    activeFilters={{ status: filterStatus, category: selectedCategory, priority: selectedPriority }}
                    onFilterChange={handleFilterChange}
                    onClearFilters={clearFilters}
                    hasActiveFilters={hasActiveFilters}
                  />
                </div>

                {/* Botón restaurar todo */}
                <div className="flex justify-end mb-2 sm:mb-3">
                  <button
                    onClick={handleRestoreAll}
                    disabled={isProcessing}
                    className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all flex items-center gap-1 sm:gap-1.5 ${classes.button.secondary} disabled:opacity-50`}
                  >
                    <RotateCcw size={12} className="sm:w-[14px] sm:h-[14px]" />
                    Restaurar todas
                  </button>
                </div>

                {/* Lista de tareas */}
                <div className={`rounded-lg shadow-md overflow-hidden ${classes.bg.card} ${classes.border.primary} border`}>
                  <div className={`p-2 sm:p-3 border-b ${classes.border.primary} flex justify-between items-center`}>
                    <h3 className={`text-xs sm:text-sm font-medium ${classes.text.primary}`}>
                      {filteredTasks.length} {filteredTasks.length === 1 ? 'tarea eliminada' : 'tareas eliminadas'}
                      {hasActiveFilters && ' filtradas'}
                    </h3>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className={`text-[10px] px-1.5 sm:px-2 py-0.5 rounded ${classes.bg.hover} ${classes.text.muted}`}>
                        Limpiar
                      </button>
                    )}
                  </div>

                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center ${classes.bg.secondary}`}>
                        <Sparkles size={20} className={classes.icon.secondary} />
                      </div>
                      <h3 className={`text-sm sm:text-base font-medium mb-1 ${classes.text.primary}`}>No hay tareas eliminadas</h3>
                      <p className={`text-[10px] sm:text-xs ${classes.text.secondary}`}>
                        {hasActiveFilters ? 'No se encontraron tareas con esos filtros' : 'Las tareas que elimines aparecerán aquí'}
                      </p>
                    </div>
                  ) : viewMode === 'list' ? (
                    <div className={`divide-y ${classes.border.primary}`}>
                      <AnimatePresence>
                        {filteredTasks.map((task, index) => (
                          <motion.div
                            key={`trash-list-${task.id}-${index}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                          >
                            <TrashItem
                              task={task}
                              onRestore={() => handleRestore(task.id)}
                              onPermanentDelete={() => handlePermanentDelete(task)}
                              classes={classes as ThemeClasses}
                              isProcessing={isProcessing}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 p-2 sm:p-3">
                      <AnimatePresence>
                        {filteredTasks.map((task, index) => (
                          <motion.div
                            key={`trash-card-${task.id}-${index}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                          >
                            <TrashCard
                              task={task}
                              onRestore={() => handleRestore(task.id)}
                              onPermanentDelete={() => handlePermanentDelete(task)}
                              classes={classes as ThemeClasses}
                              isProcessing={isProcessing}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Mensaje informativo compacto */}
                <div className="mt-3 sm:mt-4">
                  <div className={`rounded-lg overflow-hidden bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-sm border border-amber-500/20 p-2 sm:p-3`}>
                    <div className="flex items-start gap-1.5 sm:gap-2">
                      <Info size={12} className="text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className={`text-[10px] sm:text-xs font-semibold ${classes.text.primary} mb-0.5`}>Información importante</h4>
                        <p className={`text-[9px] sm:text-[11px] ${classes.text.secondary}`}>
                          Las tareas en la papelera se pueden restaurar. Se eliminan permanentemente solo cuando confirmas la acción.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modal de confirmación para eliminación permanente */}
      <PermanentDeleteModal
        isOpen={modalTask !== null}
        onClose={() => setModalTask(null)}
        onConfirm={confirmPermanentDelete}
        taskTitle={modalTask?.title}
        isProcessing={isProcessing}
      />

      {/* Modal para vaciar papelera */}
      <EmptyTrashModal
        isOpen={showEmptyModal}
        onClose={() => setShowEmptyModal(false)}
        onConfirm={confirmEmptyTrash}
        count={deletedTasks.length}
        isProcessing={isProcessing}
      />

      {/* Confetti al restaurar tareas */}
      <ConfettiEffect isActive={showConfetti} onComplete={() => setShowConfetti(false)} />
    </div>
  );
};

export default TrashPage;