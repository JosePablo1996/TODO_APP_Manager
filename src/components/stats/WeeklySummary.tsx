// src/components/stats/WeeklySummary.tsx
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, CheckCircle, Clock, Calendar, Award } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import type { Task } from '../../types/task';

interface WeeklySummaryProps {
  tasks: Task[];
}

export const WeeklySummary: React.FC<WeeklySummaryProps> = ({ tasks }) => {
  const classes = useThemeClasses();

  // Calcular estadísticas semanales
  const weeklyStats = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);

    const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const dailyData: { day: string; completed: number; created: number; date: Date }[] = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      
      const tasksOnDay = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate.toDateString() === currentDate.toDateString();
      });
      
      const completedOnDay = tasks.filter(task => {
        if (!task.completed) return false;
        const completedDate = new Date(task.updatedAt);
        return completedDate.toDateString() === currentDate.toDateString();
      });

      dailyData.push({
        day: weekDays[i],
        completed: completedOnDay.length,
        created: tasksOnDay.length,
        date: currentDate,
      });
    }

    const totalCreated = dailyData.reduce((sum, d) => sum + d.created, 0);
    const totalCompleted = dailyData.reduce((sum, d) => sum + d.completed, 0);
    const previousWeekTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      const lastWeek = new Date(startOfWeek);
      lastWeek.setDate(startOfWeek.getDate() - 7);
      return taskDate >= lastWeek && taskDate < startOfWeek;
    }).length;

    const completionRate = totalCreated > 0 ? Math.round((totalCompleted / totalCreated) * 100) : 0;
    const trend = totalCreated - previousWeekTasks;
    const isPositive = trend >= 0;

    // Días más productivos
    const bestDay = [...dailyData].sort((a, b) => b.completed - a.completed)[0];
    const worstDay = [...dailyData].sort((a, b) => a.completed - b.completed)[0];

    // Calcular racha actual
    let currentStreak = 0;
    for (let i = 0; i < dailyData.length; i++) {
      if (dailyData[i].completed > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    const maxCompleted = Math.max(...dailyData.map(d => d.completed));
    const maxHeight = 32; // Reducido de 40 a 32

    return {
      dailyData,
      totalCreated,
      totalCompleted,
      completionRate,
      trend,
      isPositive,
      bestDay,
      worstDay,
      currentStreak,
      maxCompleted,
      maxHeight,
    };
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className={`rounded-2xl border p-4 text-center ${classes.bg.card} ${classes.border.primary}`}>
        <div className="flex flex-col items-center gap-1.5">
          <Calendar size={28} className={classes.icon.secondary} />
          <p className={`text-xs ${classes.text.secondary}`}>
            Aún no hay tareas para mostrar estadísticas semanales
          </p>
          <p className={`text-[10px] ${classes.text.muted}`}>
            Agrega tu primera tarea para comenzar a ver tu progreso
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border ${classes.bg.card} ${classes.border.primary} overflow-hidden`}>
      {/* Header - Padding reducido */}
      <div className={`p-2 border-b ${classes.border.primary}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Calendar size={12} className={classes.icon.primary} />
            <h3 className={`font-semibold text-[11px] ${classes.text.primary}`}>Resumen Semanal</h3>
          </div>
          <div className={`flex items-center gap-0.5 text-[9px] ${classes.text.muted}`}>
            <span>{new Date().toLocaleDateString('es-ES', { month: 'long' })}</span>
          </div>
        </div>
      </div>

      <div className="p-2 space-y-2"> {/* Reducido de p-3 a p-2, space-y-3 a space-y-2 */}
        {/* Métricas principales - Gap reducido */}
        <div className="grid grid-cols-2 gap-1.5">
          <div className={`p-1.5 rounded-xl ${classes.bg.secondary}`}>
            <div className="flex items-center justify-between mb-0.5">
              <span className={`text-[9px] ${classes.text.muted}`}>Tareas creadas</span>
              <CheckCircle size={10} className="text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className={`text-sm font-bold ${classes.text.primary}`}>{weeklyStats.totalCreated}</span>
              <span className={`text-[8px] ${weeklyStats.isPositive ? 'text-emerald-500' : 'text-red-500'} flex items-center`}>
                {weeklyStats.trend !== 0 && (
                  weeklyStats.isPositive ? <TrendingUp size={8} /> : <TrendingDown size={8} />
                )}
                {weeklyStats.trend !== 0 && Math.abs(weeklyStats.trend)}
              </span>
            </div>
            <p className={`text-[8px] ${classes.text.muted}`}>vs semana anterior</p>
          </div>

          <div className={`p-1.5 rounded-xl ${classes.bg.secondary}`}>
            <div className="flex items-center justify-between mb-0.5">
              <span className={`text-[9px] ${classes.text.muted}`}>Completadas</span>
              <Award size={10} className="text-amber-500" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className={`text-sm font-bold ${classes.text.primary}`}>{weeklyStats.totalCompleted}</span>
              <span className={`text-[8px] ${classes.text.muted}`}>/ {weeklyStats.totalCreated}</span>
            </div>
            <div className="mt-0.5 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all"
                style={{ width: `${weeklyStats.completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Gráfico de barras semanal */}
        <div>
          <div className="flex items-center gap-1 mb-1.5">
            <Clock size={10} className={classes.icon.secondary} />
            <span className={`text-[9px] font-medium ${classes.text.secondary}`}>Actividad diaria</span>
          </div>
          <div className="flex justify-between items-end gap-0.5">
            {weeklyStats.dailyData.map((day, index) => {
              const height = weeklyStats.maxCompleted > 0
                ? (day.completed / weeklyStats.maxCompleted) * weeklyStats.maxHeight
                : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-0.5">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="w-full rounded-t transition-all cursor-pointer group relative"
                    style={{ height }}
                  >
                    <div
                      className={`w-full h-full rounded-t transition-all ${
                        day.completed > 0
                          ? 'bg-gradient-to-t from-emerald-500 to-cyan-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0.5 px-1 py-0.5 bg-gray-900 text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {day.day}: {day.completed} tareas
                    </div>
                  </motion.div>
                  <span className={`text-[8px] ${classes.text.muted}`}>{day.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estadísticas adicionales - Gap reducido */}
        <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-dashed border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className={`text-xs font-bold ${classes.text.primary}`}>{weeklyStats.currentStreak}</div>
            <div className={`text-[8px] ${classes.text.muted}`}>días consecutivos</div>
          </div>
          <div className="text-center">
            <div className={`text-xs font-bold ${classes.text.primary}`}>{weeklyStats.completionRate}%</div>
            <div className={`text-[8px] ${classes.text.muted}`}>tasa de éxito</div>
          </div>
          {weeklyStats.bestDay && weeklyStats.bestDay.completed > 0 && (
            <div className="text-center">
              <div className={`text-xs font-bold ${classes.text.primary}`}>{weeklyStats.bestDay.day}</div>
              <div className={`text-[8px] ${classes.text.muted}`}>día más productivo</div>
            </div>
          )}
          {weeklyStats.worstDay && weeklyStats.worstDay.completed === 0 && (
            <div className="text-center">
              <div className={`text-xs font-bold ${classes.text.primary}`}>{weeklyStats.worstDay.day}</div>
              <div className={`text-[8px] ${classes.text.muted}`}>día sin actividad</div>
            </div>
          )}
        </div>

        {/* Mensaje motivacional - Padding reducido */}
        {weeklyStats.completionRate >= 80 && weeklyStats.totalCreated > 0 && (
          <div className={`p-1.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 text-center`}>
            <p className={`text-[9px] font-medium ${classes.text.primary}`}>
              🎉 ¡Excelente semana! Has completado el {weeklyStats.completionRate}% de tus tareas
            </p>
          </div>
        )}

        {weeklyStats.completionRate < 50 && weeklyStats.totalCreated > 0 && (
          <div className={`p-1.5 rounded-xl bg-amber-500/10 text-center`}>
            <p className={`text-[9px] font-medium ${classes.text.primary}`}>
              💪 ¡Ánimo! Puedes mejorar tu productividad esta semana
            </p>
          </div>
        )}
      </div>
    </div>
  );
};