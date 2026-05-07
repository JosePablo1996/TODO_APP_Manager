// src/components/calendar/TaskCalendar.tsx
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Star } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import type { Task } from '../../types/task';

interface TaskCalendarProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskToggle?: (taskId: string) => void;
}

export const TaskCalendar: React.FC<TaskCalendarProps> = ({ 
  tasks, 
  onTaskClick, 
  onTaskToggle 
}) => {
  const classes = useThemeClasses();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Obtener año y mes actual
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Primer día del mes
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Último día del mes
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Días del mes anterior para completar la primera semana
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Generar días del calendario
  const calendarDays = useMemo(() => {
    const days: { date: Date; isCurrentMonth: boolean; tasks: Task[] }[] = [];
    
    // Días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(currentYear, currentMonth - 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        tasks: tasks.filter(task => {
          if (!task.dueDate) return false;
          const taskDate = new Date(task.dueDate);
          return taskDate.toDateString() === date.toDateString();
        })
      });
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      days.push({
        date,
        isCurrentMonth: true,
        tasks: tasks.filter(task => {
          if (!task.dueDate) return false;
          const taskDate = new Date(task.dueDate);
          return taskDate.toDateString() === date.toDateString();
        })
      });
    }

    // Días del mes siguiente para completar la cuadrícula (6 filas x 7 días = 42)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(currentYear, currentMonth + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        tasks: tasks.filter(task => {
          if (!task.dueDate) return false;
          const taskDate = new Date(task.dueDate);
          return taskDate.toDateString() === date.toDateString();
        })
      });
    }

    return days;
  }, [currentYear, currentMonth, startingDayOfWeek, daysInMonth, daysInPrevMonth, tasks]);

  // Tareas del día seleccionado
  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === selectedDate.toDateString();
    });
  }, [tasks, selectedDate]);

  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      alta: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30',
      media: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
      baja: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
    };
    return colors[priority] || colors.media;
  };

  const getPriorityIcon = (priority: string): React.ReactNode => {
    const icons: Record<string, string> = {
      alta: '🔴',
      media: '🟡',
      baja: '🟢'
    };
    return icons[priority] || '🟡';
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isOverdue = (task: Task): boolean => {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className={`rounded-2xl border ${classes.bg.card} ${classes.border.primary} overflow-hidden`}>
      {/* Header del calendario - Optimizado */}
      <div className={`p-2 border-b ${classes.border.primary}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CalendarIcon size={14} className={classes.icon.primary} />
            <h3 className={`font-semibold text-xs ${classes.text.primary}`}>Calendario de tareas</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={goToToday}
              className={`px-2 py-1 text-[10px] rounded-lg border transition-colors ${classes.bg.hover} ${classes.border.primary} ${classes.text.secondary}`}
              aria-label="Ir al día de hoy"
              title="Ir al día de hoy"
            >
              Hoy
            </button>
          </div>
        </div>
      </div>

      {/* Navegación del mes - Optimizado */}
      <div className={`p-2 flex items-center justify-between border-b ${classes.border.primary}`}>
        <div className="flex items-center gap-1">
          <button
            onClick={goToPreviousMonth}
            className={`p-1 rounded-lg transition-colors ${classes.bg.hover}`}
            aria-label="Mes anterior"
            title="Mes anterior"
          >
            <ChevronLeft size={16} className={classes.icon.secondary} />
          </button>
          <h2 className={`text-sm font-semibold ${classes.text.primary}`}>
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <button
            onClick={goToNextMonth}
            className={`p-1 rounded-lg transition-colors ${classes.bg.hover}`}
            aria-label="Mes siguiente"
            title="Mes siguiente"
          >
            <ChevronRight size={16} className={classes.icon.secondary} />
          </button>
        </div>
        <div className={`text-[10px] ${classes.text.muted}`}>
          {tasks.filter(t => t.dueDate).length} tareas con fecha
        </div>
      </div>

      {/* Días de la semana - Optimizado */}
      <div className="grid grid-cols-7 gap-0.5 px-2 pt-2">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className={`text-center text-[10px] font-medium py-1 ${classes.text.muted}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Cuadrícula de días - Optimizado */}
      <div className="grid grid-cols-7 gap-0.5 p-2 pt-1">
        {calendarDays.map((day, index) => {
          const hasTasks = day.tasks.length > 0;
          const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();
          const isCurrentDay = isToday(day.date);
          const urgentTasks = day.tasks.filter(t => t.priority === 'alta' && !t.completed).length;

          return (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedDate(day.date)}
              className={`
                relative aspect-square rounded-lg p-1 transition-all duration-200
                ${!day.isCurrentMonth ? 'opacity-40' : ''}
                ${isSelected ? 'ring-1 ring-emerald-500 bg-emerald-500/10' : classes.bg.hover}
                ${isCurrentDay ? 'ring-1 ring-amber-500' : ''}
                hover:shadow-sm
              `}
              aria-label={`${day.date.getDate()} de ${monthNames[day.date.getMonth()]}${hasTasks ? `, ${day.tasks.length} tareas` : ''}`}
              title={`${day.date.getDate()} de ${monthNames[day.date.getMonth()]}${hasTasks ? ` - ${day.tasks.length} tarea(s)` : ''}`}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span className={`text-xs font-medium ${isSelected ? classes.icon.primary : classes.text.primary}`}>
                  {day.date.getDate()}
                </span>
                
                {hasTasks && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {urgentTasks > 0 && (
                      <span className="w-1 h-1 rounded-full bg-red-500" />
                    )}
                    {day.tasks.filter(t => t.priority === 'media' && !t.completed).length > 0 && (
                      <span className="w-1 h-1 rounded-full bg-amber-500" />
                    )}
                    {day.tasks.filter(t => t.priority === 'baja' && !t.completed).length > 0 && (
                      <span className="w-1 h-1 rounded-full bg-emerald-500" />
                    )}
                    {day.tasks.filter(t => t.completed).length > 0 && (
                      <span className="w-1 h-1 rounded-full bg-blue-500" />
                    )}
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Detalle de tareas del día seleccionado - Optimizado */}
      <AnimatePresence>
        {selectedDate && selectedDateTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`border-t ${classes.border.primary}`}
          >
            <div className="p-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className={`text-xs font-medium ${classes.text.primary}`}>
                  Tareas para {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                </h4>
                <button
                  onClick={() => setSelectedDate(null)}
                  className={`text-[10px] px-1.5 py-0.5 rounded ${classes.bg.hover} ${classes.text.muted}`}
                  aria-label="Cerrar detalles"
                  title="Cerrar detalles"
                >
                  Cerrar
                </button>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {selectedDateTasks.map(task => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-2 rounded-lg border transition-all cursor-pointer ${getPriorityColor(task.priority)} ${task.completed ? 'opacity-60' : ''}`}
                    onClick={() => onTaskClick?.(task)}
                    aria-label={`Tarea: ${task.title}, prioridad ${task.priority}`}
                    title={`Tarea: ${task.title}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="text-[11px]">{getPriorityIcon(task.priority)}</span>
                          <h5 className={`text-xs font-medium ${task.completed ? 'line-through' : ''}`}>
                            {task.title}
                          </h5>
                          {task.isFavorite && (
                            <Star size={10} className="text-amber-500 fill-amber-500" />
                          )}
                        </div>
                        {task.description && (
                          <p className={`text-[10px] mt-0.5 line-clamp-1 ${classes.text.muted}`}>{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${classes.bg.secondary}`}>
                            {task.category}
                          </span>
                          {isOverdue(task) && !task.completed && (
                            <span className="text-[9px] text-red-500 flex items-center gap-0.5">
                              <Clock size={8} />
                              Vencida
                            </span>
                          )}
                        </div>
                      </div>
                      {onTaskToggle && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTaskToggle(task.id);
                          }}
                          className={`p-0.5 rounded transition-colors ${classes.bg.hover}`}
                          aria-label={task.completed ? "Marcar como pendiente" : "Marcar como completada"}
                          title={task.completed ? "Marcar como pendiente" : "Marcar como completada"}
                        >
                          {task.completed ? (
                            <span className="text-[11px]">✅</span>
                          ) : (
                            <span className="text-[11px]">○</span>
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leyenda - Optimizado */}
      <div className={`p-2 border-t ${classes.border.primary} flex flex-wrap items-center justify-center gap-2 text-[9px]`}>
        <div className="flex items-center gap-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <span className={classes.text.muted}>Alta</span>
        </div>
        <div className="flex items-center gap-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className={classes.text.muted}>Media</span>
        </div>
        <div className="flex items-center gap-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className={classes.text.muted}>Baja</span>
        </div>
        <div className="flex items-center gap-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className={classes.text.muted}>Completadas</span>
        </div>
      </div>
    </div>
  );
};