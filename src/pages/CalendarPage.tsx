// src/pages/CalendarPage.tsx
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { useThemeClasses } from '../hooks/useThemeClasses';
import Header from '../components/Header';
import LeftMenu from '../components/LeftMenu';
import type { Notification } from '../components/Header';

// Iconos
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Star,
  X,
  CheckCircle,
  Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ViewMode = 'month' | 'week';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'alta' | 'media' | 'baja';
  category: 'personal' | 'trabajo' | 'estudio' | 'otro';
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  isFavorite?: boolean;
}

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { tasks, toggleTask } = useTasks();
  const classes = useThemeClasses();

  // Estados
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);
  const [notifications] = useState<Notification[]>([]);

  // Obtener tareas para una fecha específica
  const getTasksForDate = useCallback((date: Date): Task[] => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  }, [tasks]);

  // Verificar si es hoy
  const isToday = useCallback((date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }, []);

  // Obtener año y mes actual
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Generar días del calendario mensual
  const monthDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: CalendarDay[] = [];

    // Días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(currentYear, currentMonth - 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isToday(date),
        tasks: getTasksForDate(date),
      });
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isToday(date),
        tasks: getTasksForDate(date),
      });
    }

    // Días del mes siguiente (para completar 42 días - 6 semanas)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(currentYear, currentMonth + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isToday(date),
        tasks: getTasksForDate(date),
      });
    }

    return days;
  }, [currentYear, currentMonth, getTasksForDate, isToday]);

  // Generar días de la semana actual
  const weekDays = useMemo(() => {
    const today = new Date(currentDate);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);

    const days: CalendarDay[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push({
        date,
        isCurrentMonth: date.getMonth() === currentMonth,
        isToday: isToday(date),
        tasks: getTasksForDate(date),
      });
    }
    return days;
  }, [currentDate, currentMonth, getTasksForDate, isToday]);

  // Navegación
  const goToPrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(newDate);
    }
    setSelectedDate(null);
  };

  const goToNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(newDate);
    }
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  // Formatear título del mes/año
  const getTitle = () => {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    if (viewMode === 'month') {
      return `${monthNames[currentMonth]} ${currentYear}`;
    } else {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + (currentDate.getDay() === 0 ? -6 : 1));
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getFullYear()}`;
      } else {
        return `${monthNames[startOfWeek.getMonth()]} - ${monthNames[endOfWeek.getMonth()]} ${endOfWeek.getFullYear()}`;
      }
    }
  };

  // Obtener estilo de prioridad
  const getPriorityStyle = (priority: string): string => {
    const styles: Record<string, string> = {
      alta: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
      media: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      baja: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
    };
    return styles[priority] || styles.media;
  };

  // Días de la semana
  const weekDaysNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Tareas del día seleccionado
  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  // Handler para logout
  const handleLogout = () => {
    logout();
  };

  // Toggle del menú izquierdo
  const toggleLeftMenu = useCallback(() => {
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
          onSearch={() => {}}
        />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header del calendario */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/')}
                  className={`p-2 rounded-lg transition-colors ${classes.bg.hover}`}
                  aria-label="Volver al inicio"
                >
                  <ArrowLeft className={`w-5 h-5 ${classes.icon.secondary}`} />
                </button>
                <div className="flex items-center gap-2">
                  <CalendarIcon size={24} className={classes.icon.primary} />
                  <h1 className={`text-2xl font-bold ${classes.text.primary}`}>Calendario</h1>
                </div>
              </div>

              {/* Vista toggle */}
              <div className={`flex gap-1 p-1 rounded-lg ${classes.bg.card} border ${classes.border.primary}`}>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'month'
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md'
                      : classes.text.secondary
                  }`}
                >
                  Mensual
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'week'
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md'
                      : classes.text.secondary
                  }`}
                >
                  Semanal
                </button>
              </div>
            </div>

            {/* Navegación del calendario */}
            <div className={`rounded-xl border p-4 mb-6 ${classes.bg.card} ${classes.border.primary}`}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPrevious}
                    className={`p-2 rounded-lg transition-colors ${classes.bg.hover}`}
                    aria-label="Mes anterior"
                  >
                    <ChevronLeft size={20} className={classes.icon.secondary} />
                  </button>
                  <button
                    onClick={goToToday}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${classes.button.secondary}`}
                  >
                    Hoy
                  </button>
                  <button
                    onClick={goToNext}
                    className={`p-2 rounded-lg transition-colors ${classes.bg.hover}`}
                    aria-label="Mes siguiente"
                  >
                    <ChevronRight size={20} className={classes.icon.secondary} />
                  </button>
                </div>
                <h2 className={`text-xl font-semibold ${classes.text.primary}`}>
                  {getTitle()}
                </h2>
                <div className="w-24" />
              </div>
            </div>

            {/* Vista Mensual */}
            {viewMode === 'month' && (
              <div className={`rounded-xl border overflow-hidden ${classes.bg.card} ${classes.border.primary}`}>
                {/* Días de la semana */}
                <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
                  {weekDaysNames.map((day, index) => (
                    <div
                      key={index}
                      className={`py-3 text-center text-sm font-medium ${classes.text.muted}`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Días del mes */}
                <div className="grid grid-cols-7 auto-rows-fr">
                  {monthDays.map((day, index) => {
                    const hasTasks = day.tasks.length > 0;
                    const isSelected = selectedDate?.toDateString() === day.date.toDateString();
                    const urgentTasks = day.tasks.filter(t => t.priority === 'alta' && !t.completed).length;

                    return (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedDate(day.date)}
                        className={`
                          relative min-h-[100px] p-2 border-b border-r border-gray-200 dark:border-gray-700
                          transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50
                          ${!day.isCurrentMonth ? 'opacity-40' : ''}
                          ${isSelected ? 'ring-2 ring-emerald-500 bg-emerald-500/5' : ''}
                          ${day.isToday ? 'ring-2 ring-amber-500' : ''}
                        `}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`text-sm font-medium ${isSelected ? classes.icon.primary : classes.text.primary}`}>
                            {day.date.getDate()}
                          </span>
                          {hasTasks && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                              {day.tasks.length}
                            </span>
                          )}
                        </div>

                        {/* Indicadores de tareas */}
                        {hasTasks && (
                          <div className="mt-2 space-y-1">
                            {day.tasks.slice(0, 2).map(task => (
                              <div
                                key={task.id}
                                className={`text-xs truncate px-1.5 py-0.5 rounded ${getPriorityStyle(task.priority)} ${task.completed ? 'line-through opacity-60' : ''}`}
                              >
                                {task.title}
                              </div>
                            ))}
                            {day.tasks.length > 2 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 pl-1.5">
                                +{day.tasks.length - 2} más
                              </div>
                            )}
                          </div>
                        )}

                        {/* Puntos de prioridad */}
                        {hasTasks && day.tasks.length <= 2 && (
                          <div className="flex gap-0.5 mt-1">
                            {urgentTasks > 0 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            )}
                            {day.tasks.filter(t => t.priority === 'media' && !t.completed).length > 0 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            )}
                            {day.tasks.filter(t => t.priority === 'baja' && !t.completed).length > 0 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            )}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Vista Semanal */}
            {viewMode === 'week' && (
              <div className={`rounded-xl border overflow-hidden ${classes.bg.card} ${classes.border.primary}`}>
                {/* Días de la semana */}
                <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
                  {weekDays.map((day, index) => (
                    <div
                      key={index}
                      className={`py-3 text-center border-r last:border-r-0 ${classes.border.primary}`}
                    >
                      <div className={`text-sm font-medium ${classes.text.muted}`}>
                        {weekDaysNames[day.date.getDay()]}
                      </div>
                      <button
                        onClick={() => setSelectedDate(day.date)}
                        className={`
                          mt-1 w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-medium
                          transition-all hover:scale-105
                          ${day.isToday ? 'bg-amber-500 text-white' : classes.bg.hover}
                          ${selectedDate?.toDateString() === day.date.toDateString() ? 'ring-2 ring-emerald-500' : ''}
                        `}
                      >
                        {day.date.getDate()}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Tareas por día */}
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {weekDays.map((day, index) => {
                    const dayTasks = getTasksForDate(day.date);
                    const isSelected = selectedDate?.toDateString() === day.date.toDateString();

                    return (
                      <div
                        key={index}
                        className={`p-3 ${isSelected ? 'bg-emerald-500/5' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-medium ${classes.text.secondary}`}>
                            {weekDaysNames[day.date.getDay()]} {day.date.getDate()} de {day.date.toLocaleDateString('es-ES', { month: 'long' })}
                          </span>
                          {dayTasks.length > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                              {dayTasks.length} tareas
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          {dayTasks.length === 0 ? (
                            <p className={`text-sm ${classes.text.muted} py-2 text-center`}>
                              No hay tareas para este día
                            </p>
                          ) : (
                            dayTasks.map(task => (
                              <div
                                key={task.id}
                                className={`p-3 rounded-lg border transition-all hover:shadow-md ${getPriorityStyle(task.priority)} ${task.completed ? 'opacity-60' : ''}`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <button
                                        onClick={() => toggleTask(task.id)}
                                        className="flex-shrink-0"
                                      >
                                        {task.completed ? (
                                          <CheckCircle size={16} className="text-emerald-500" />
                                        ) : (
                                          <Circle size={16} className={classes.icon.secondary} />
                                        )}
                                      </button>
                                      <h4 className={`font-medium ${task.completed ? 'line-through ' + classes.text.muted : classes.text.primary}`}>
                                        {task.title}
                                      </h4>
                                      {task.isFavorite && (
                                        <Star size={12} className="text-amber-500 fill-amber-500" />
                                      )}
                                    </div>
                                    {task.description && (
                                      <p className={`text-xs mt-1 ml-6 ${classes.text.muted}`}>
                                        {task.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-3 mt-2 ml-6">
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityStyle(task.priority)}`}>
                                        {task.priority}
                                      </span>
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${classes.bg.secondary}`}>
                                        {task.category}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Modal de tareas del día seleccionado */}
            <AnimatePresence>
              {selectedDate && selectedDateTasks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                  onClick={() => setSelectedDate(null)}
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setSelectedDate(null)}
                  />
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className={`relative w-full max-w-md rounded-2xl overflow-hidden ${classes.bg.card} border-2 shadow-2xl`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white">
                          {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </h3>
                        <button
                          onClick={() => setSelectedDate(null)}
                          className="p-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                          aria-label="Cerrar"
                        >
                          <X size={18} className="text-white" />
                        </button>
                      </div>
                      <p className="text-white/80 text-sm mt-1">
                        {selectedDateTasks.length} {selectedDateTasks.length === 1 ? 'tarea programada' : 'tareas programadas'}
                      </p>
                    </div>

                    <div className="p-4 max-h-96 overflow-y-auto space-y-2">
                      {selectedDateTasks.map(task => (
                        <div
                          key={task.id}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${getPriorityStyle(task.priority)} ${task.completed ? 'opacity-60' : ''}`}
                        >
                          <div className="flex items-start gap-2">
                            <button
                              onClick={() => toggleTask(task.id)}
                              className="mt-0.5"
                            >
                              {task.completed ? (
                                <CheckCircle size={18} className="text-emerald-500" />
                              ) : (
                                <Circle size={18} className={classes.icon.secondary} />
                              )}
                            </button>
                            <div className="flex-1">
                              <h4 className={`font-medium ${task.completed ? 'line-through ' + classes.text.muted : classes.text.primary}`}>
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className={`text-xs mt-1 ${classes.text.muted}`}>{task.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityStyle(task.priority)}`}>
                                  {task.priority}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${classes.bg.secondary}`}>
                                  {task.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Leyenda */}
            <div className={`mt-6 p-4 rounded-xl border ${classes.bg.card} ${classes.border.primary}`}>
              <h3 className={`text-sm font-medium mb-3 ${classes.text.primary}`}>Leyenda</h3>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className={classes.text.secondary}>Alta prioridad</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className={classes.text.secondary}>Media prioridad</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className={classes.text.secondary}>Baja prioridad</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 ring-1 ring-emerald-500" />
                  <span className={classes.text.secondary}>Día seleccionado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500 ring-1 ring-amber-500" />
                  <span className={classes.text.secondary}>Día actual</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CalendarPage;