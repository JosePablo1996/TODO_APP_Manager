// src/pages/StatisticsPage.tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { useThemeClasses } from '../hooks/useThemeClasses';
import Header from '../components/Header';
import LeftMenu from '../components/LeftMenu';
import type { Notification } from '../components/Header';

// Componentes UI
import { StatCard } from '../components/stats/StatCard';
import { ProgressCircle } from '../components/stats/ProgressCircle';
import { WeeklySummary } from '../components/stats/WeeklySummary';

// Iconos
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  Flag,
  Award,
  Target,
  Zap,
  CalendarDays,
  PieChart,
  Sparkles,
  ListTodo
} from 'lucide-react';
import { motion } from 'framer-motion';

// Componente de gráfico de barras simple
const BarChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const classes = useThemeClasses();

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index}>
          <div className="flex justify-between text-sm mb-1">
            <span className={classes.text.secondary}>{item.label}</span>
            <span className={classes.text.primary}>{item.value}</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / maxValue) * 100}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`h-full rounded-full ${item.color}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente de gráfico de dona simple - VERSIÓN CORREGIDA CON REDUCE
const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[]; total: number }> = ({ data, total }) => {
  const classes = useThemeClasses();
  const size = 140;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calcular los ángulos de forma determinista usando reduce para evitar mutación
  const segments = useMemo(() => {
    return data.reduce((acc, item) => {
      const previousAngle = acc.length > 0 ? acc[acc.length - 1].endAngle : 0;
      const percentage = total > 0 ? (item.value / total) * 100 : 0;
      const startAngle = previousAngle;
      const endAngle = startAngle + percentage;
      
      acc.push({
        ...item,
        percentage,
        startAngle,
        endAngle,
        strokeDashoffset: circumference - (percentage / 100) * circumference
      });
      return acc;
    }, [] as Array<{
      label: string;
      value: number;
      color: string;
      percentage: number;
      startAngle: number;
      endAngle: number;
      strokeDashoffset: number;
    }>);
  }, [data, total, circumference]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {segments.map((segment, index) => (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={segment.color.replace('bg-', '').replace('/10', '')}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={segment.strokeDashoffset}
              strokeLinecap="round"
              style={{ transform: `rotate(${segment.startAngle * 3.6}deg)` }}
            />
          ))}
          {/* Círculo de fondo */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${classes.text.primary}`}>{total}</span>
          <span className={`text-xs ${classes.text.muted}`}>total</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${item.color}`} />
            <span className={`text-xs ${classes.text.secondary}`}>{item.label}</span>
            <span className={`text-xs font-medium ${classes.text.primary}`}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { tasks } = useTasks();
  const classes = useThemeClasses();

  // Estados locales
  const [notifications] = useState<Notification[]>([]);
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<'all' | 'week' | 'month'>('all');

  // Tareas filtradas por rango de tiempo
  const filteredTasks = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      if (timeRange === 'week') return taskDate >= startOfWeek;
      if (timeRange === 'month') return taskDate >= startOfMonth;
      return true;
    });
  }, [tasks, timeRange]);

  // Estadísticas filtradas
  const filteredStats = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const productivity = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const byPriority = {
      alta: filteredTasks.filter(t => t.priority === 'alta').length,
      media: filteredTasks.filter(t => t.priority === 'media').length,
      baja: filteredTasks.filter(t => t.priority === 'baja').length,
    };
    
    const byCategory = {
      personal: filteredTasks.filter(t => t.category === 'personal').length,
      trabajo: filteredTasks.filter(t => t.category === 'trabajo').length,
      estudio: filteredTasks.filter(t => t.category === 'estudio').length,
      otro: filteredTasks.filter(t => t.category === 'otro').length,
    };
    
    // Tareas por día de la semana (para gráfico)
    const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const tasksByDay = weekDays.map(day => ({
      label: day,
      value: filteredTasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        const dayIndex = taskDate.getDay();
        const mappedDay = dayIndex === 0 ? 6 : dayIndex - 1;
        return weekDays[mappedDay] === day;
      }).length,
      color: 'bg-emerald-500'
    }));
    
    // Tareas por hora del día (mañana, tarde, noche)
    const tasksByTime = [
      { label: 'Mañana (6-12)', value: filteredTasks.filter(task => {
        const hour = new Date(task.createdAt).getHours();
        return hour >= 6 && hour < 12;
      }).length, color: 'bg-amber-500' },
      { label: 'Tarde (12-19)', value: filteredTasks.filter(task => {
        const hour = new Date(task.createdAt).getHours();
        return hour >= 12 && hour < 19;
      }).length, color: 'bg-teal-500' },
      { label: 'Noche (19-6)', value: filteredTasks.filter(task => {
        const hour = new Date(task.createdAt).getHours();
        return hour >= 19 || hour < 6;
      }).length, color: 'bg-indigo-500' },
    ];
    
    return {
      total,
      completed,
      pending,
      completionRate,
      productivity,
      byPriority,
      byCategory,
      tasksByDay,
      tasksByTime
    };
  }, [filteredTasks]);

  // Datos para gráfico de prioridades
  const priorityChartData = [
    { label: 'Alta', value: filteredStats.byPriority.alta, color: 'bg-red-500' },
    { label: 'Media', value: filteredStats.byPriority.media, color: 'bg-amber-500' },
    { label: 'Baja', value: filteredStats.byPriority.baja, color: 'bg-emerald-500' },
  ];

  // Datos para gráfico de categorías
  const categoryChartData = [
    { label: 'Personal', value: filteredStats.byCategory.personal, color: 'bg-purple-500' },
    { label: 'Trabajo', value: filteredStats.byCategory.trabajo, color: 'bg-blue-500' },
    { label: 'Estudio', value: filteredStats.byCategory.estudio, color: 'bg-indigo-500' },
    { label: 'Otro', value: filteredStats.byCategory.otro, color: 'bg-gray-500' },
  ];

  // Handler para logout
  const handleLogout = (): void => {
    logout();
  };

  // Toggle del menú izquierdo
  const toggleLeftMenu = (): void => {
    setIsLeftMenuOpen(prev => !prev);
  };

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
          onSearch={() => {}}
        />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header de la página */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/')}
                  className={`p-2 rounded-lg transition-colors ${classes.bg.hover}`}
                  aria-label="Volver al inicio"
                >
                  <ArrowLeft className={`w-5 h-5 ${classes.icon.secondary}`} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-gradient-to-b from-emerald-500 via-teal-500 to-cyan-500 rounded-full" />
                  <h1 className={`text-2xl font-bold flex items-center gap-2 ${classes.text.primary}`}>
                    <BarChart3 className={classes.icon.primary} size={24} />
                    Estadísticas
                  </h1>
                </div>
              </div>

              {/* Selector de rango de tiempo */}
              <div className={`flex gap-1 p-1 rounded-lg border ${classes.bg.card} ${classes.border.primary}`}>
                <button
                  onClick={() => setTimeRange('all')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    timeRange === 'all'
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md'
                      : classes.text.secondary
                  }`}
                >
                  Todo
                </button>
                <button
                  onClick={() => setTimeRange('month')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    timeRange === 'month'
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md'
                      : classes.text.secondary
                  }`}
                >
                  Este mes
                </button>
                <button
                  onClick={() => setTimeRange('week')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    timeRange === 'week'
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md'
                      : classes.text.secondary
                  }`}
                >
                  Esta semana
                </button>
              </div>
            </div>

            {/* Tarjetas de métricas principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Total Tareas"
                value={filteredStats.total}
                icon={<ListTodo size={20} />}
                color="emerald"
              />
              <StatCard
                title="Completadas"
                value={filteredStats.completed}
                icon={<CheckCircle size={20} />}
                color="teal"
                trend={{ value: filteredStats.completionRate, positive: filteredStats.completionRate >= 50 }}
              />
              <StatCard
                title="Pendientes"
                value={filteredStats.pending}
                icon={<Clock size={20} />}
                color="amber"
              />
              <StatCard
                title="Tasa de Éxito"
                value={`${filteredStats.completionRate}%`}
                icon={<Target size={20} />}
                color="cyan"
              />
            </div>

            {/* Gráfico de progreso circular y productividad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className={`rounded-2xl border p-6 ${classes.bg.card} ${classes.border.primary}`}>
                <h3 className={`font-semibold mb-4 flex items-center gap-2 ${classes.text.primary}`}>
                  <Target size={18} className="text-emerald-500" />
                  Progreso General
                </h3>
                <ProgressCircle
                  percentage={filteredStats.completionRate}
                  label={`${filteredStats.completed} de ${filteredStats.total} tareas`}
                  subtitle={`Tasa de éxito: ${filteredStats.completionRate}%`}
                />
              </div>

              <div className={`rounded-2xl border p-6 ${classes.bg.card} ${classes.border.primary}`}>
                <h3 className={`font-semibold mb-4 flex items-center gap-2 ${classes.text.primary}`}>
                  <Zap size={18} className="text-amber-500" />
                  Productividad
                </h3>
                <div className="flex flex-col items-center justify-center h-48">
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${classes.text.primary}`}>
                      {filteredStats.productivity}%
                    </div>
                    <p className={`text-sm mt-2 ${classes.text.muted}`}>
                      de tareas completadas
                    </p>
                    {filteredStats.productivity >= 80 && (
                      <div className="mt-3 px-3 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-sm inline-flex items-center gap-1">
                        <Sparkles size={14} />
                        ¡Excelente rendimiento!
                      </div>
                    )}
                    {filteredStats.productivity >= 50 && filteredStats.productivity < 80 && (
                      <div className="mt-3 px-3 py-1 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full text-sm inline-flex items-center gap-1">
                        <TrendingUp size={14} />
                        Buen progreso, sigue así
                      </div>
                    )}
                    {filteredStats.productivity < 50 && filteredStats.total > 0 && (
                      <div className="mt-3 px-3 py-1 bg-red-500/20 text-red-600 dark:text-red-400 rounded-full text-sm inline-flex items-center gap-1">
                        <TrendingDown size={14} />
                        Puedes mejorar tu productividad
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Distribución por prioridad y categoría */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className={`rounded-2xl border p-6 ${classes.bg.card} ${classes.border.primary}`}>
                <h3 className={`font-semibold mb-4 flex items-center gap-2 ${classes.text.primary}`}>
                  <Flag size={18} className="text-red-500" />
                  Distribución por Prioridad
                </h3>
                <BarChart data={priorityChartData} />
              </div>

              <div className={`rounded-2xl border p-6 ${classes.bg.card} ${classes.border.primary}`}>
                <h3 className={`font-semibold mb-4 flex items-center gap-2 ${classes.text.primary}`}>
                  <PieChart size={18} className="text-purple-500" />
                  Distribución por Categoría
                </h3>
                <DonutChart data={categoryChartData} total={filteredStats.total} />
              </div>
            </div>

            {/* Actividad por día y hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className={`rounded-2xl border p-6 ${classes.bg.card} ${classes.border.primary}`}>
                <h3 className={`font-semibold mb-4 flex items-center gap-2 ${classes.text.primary}`}>
                  <CalendarDays size={18} className="text-cyan-500" />
                  Actividad por Día
                </h3>
                <div className="space-y-3">
                  {filteredStats.tasksByDay.map((day, index) => {
                    const maxValue = Math.max(...filteredStats.tasksByDay.map(d => d.value), 1);
                    return (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className={classes.text.secondary}>{day.label}</span>
                          <span className={classes.text.primary}>{day.value}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(day.value / maxValue) * 100}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={`rounded-2xl border p-6 ${classes.bg.card} ${classes.border.primary}`}>
                <h3 className={`font-semibold mb-4 flex items-center gap-2 ${classes.text.primary}`}>
                  <Clock size={18} className="text-amber-500" />
                  Actividad por Horario
                </h3>
                <BarChart data={filteredStats.tasksByTime} />
              </div>
            </div>

            {/* Resumen semanal */}
            <WeeklySummary tasks={filteredTasks} />

            {/* Footer con información adicional */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`mt-6 pt-6 border-t text-center ${classes.border.primary}`}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span className={`text-sm ${classes.text.secondary}`}>
                  Estadísticas basadas en {filteredStats.total} tareas
                </span>
              </div>
              <p className={`text-xs ${classes.text.muted}`}>
                {timeRange === 'all' && 'Mostrando todas las tareas desde el inicio'}
                {timeRange === 'month' && 'Mostrando tareas del mes actual'}
                {timeRange === 'week' && 'Mostrando tareas de la semana actual'}
              </p>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StatisticsPage;