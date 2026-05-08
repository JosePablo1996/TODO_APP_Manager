// src/pages/CreateTaskPage.tsx
import { useState } from 'react';
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
  Plus,
  Calendar,
  Flag,
  Palette,
  Sparkles,
  ChevronDown} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Tipos
import type { Task } from '../types/task';

// Colores predefinidos para las tareas
const TASK_COLORS = [
  { name: 'Default', value: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-600 dark:text-emerald-400' },
  { name: 'Blue', value: '#3b82f6', bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-600 dark:text-blue-400' },
  { name: 'Purple', value: '#8b5cf6', bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-600 dark:text-purple-400' },
  { name: 'Pink', value: '#ec4899', bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-600 dark:text-pink-400' },
  { name: 'Orange', value: '#f97316', bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-600 dark:text-orange-400' },
  { name: 'Red', value: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-600 dark:text-red-400' },
  { name: 'Teal', value: '#14b8a6', bg: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-600 dark:text-teal-400' },
  { name: 'Cyan', value: '#06b6d4', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-600 dark:text-cyan-400' },
  { name: 'Amber', value: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-600 dark:text-amber-400' },
];

const CreateTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { addTask } = useTasks();
  const classes = useThemeClasses();

  // Estados del formulario
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('media');
  const [category, setCategory] = useState<Task['category']>('personal');
  const [dueDate, setDueDate] = useState('');
  const [selectedColor, setSelectedColor] = useState(TASK_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Estados UI
  const [notifications] = useState<Notification[]>([]);
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);

  // Handlers
  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('El título es requerido');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        completed: false,
        priority,
        category,
        dueDate: dueDate || undefined,
        color: selectedColor.value,
      });
      
      navigate('/dashboard');
    } catch (err) {
      setError('Error al crear la tarea');
      console.error('❌ [CREATE_TASK] Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const toggleLeftMenu = () => {
    setIsLeftMenuOpen(prev => !prev);
  };

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

  // Determinar color del borde según prioridad
  const getPriorityBorderColor = () => {
    switch (priority) {
      case 'alta': return 'border-red-400 dark:border-red-600';
      case 'media': return 'border-yellow-400 dark:border-yellow-600';
      case 'baja': return 'border-green-400 dark:border-green-600';
      default: return classes.border.primary;
    }
  };

  const isFormValid = title.trim().length > 0 && !isSubmitting;

  return (
    <div className={`min-h-screen ${classes.bg.primary} flex`}>
      {/* LeftMenu */}
      <LeftMenu 
        isOpen={isLeftMenuOpen}
        onClose={toggleLeftMenu}
        user={safeUser}
        onLogout={handleLogout}
      />

      {/* Contenido principal con margen dinámico */}
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

        {/* ✅ Contenido principal corregido */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            
            {/* Header mejorado */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-6 sm:mb-8"
            >
              <motion.button
                whileHover={{ scale: 1.05, x: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
                className={`p-2.5 rounded-xl transition-all ${classes.bg.hover} border ${classes.border.primary} flex-shrink-0`}
                aria-label="Volver"
                title="Volver a tareas"
              >
                <ArrowLeft className={`w-5 h-5 ${classes.icon.secondary}`} />
              </motion.button>
              
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-1.5 h-8 bg-gradient-to-b from-emerald-500 via-teal-500 to-cyan-500 rounded-full flex-shrink-0" />
                <div className="min-w-0">
                  <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2 sm:gap-3 ${classes.text.primary}`}>
                    <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent truncate">
                      Crear Nueva Tarea
                    </span>
                    <Sparkles className="text-emerald-500 flex-shrink-0" size={20} />
                  </h1>
                  <p className={`text-xs sm:text-sm mt-1 ${classes.text.muted}`}>
                    Completa los detalles para organizar tu tarea
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Formulario - Diseño mejorado */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`rounded-2xl sm:rounded-3xl border-2 shadow-lg sm:shadow-xl overflow-hidden ${classes.bg.card} ${classes.border.primary}`}
            >
              {/* Banner superior con gradiente */}
              <div className="h-1.5 sm:h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

              <div className="p-4 sm:p-6 lg:p-8">
                {/* Mensaje de error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-5 sm:mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-3 sm:p-4 rounded-lg text-xs sm:text-sm flex items-center gap-2 sm:gap-3"
                    >
                      <span className="text-base sm:text-lg flex-shrink-0">⚠️</span>
                      <span className="truncate">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                  {/* Columna principal - Campos del formulario */}
                  <div className="lg:col-span-2 space-y-5 sm:space-y-6">
                    {/* Título */}
                    <div>
                      <label htmlFor="task-title" className={`block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 ${classes.text.primary}`}>
                        Título <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="task-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="¿Qué necesitas hacer?"
                        className={`w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border-2 ${classes.bg.input} ${classes.text.primary} ${classes.border.primary} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm sm:text-base`}
                        aria-label="Título de la tarea"
                        autoFocus
                      />
                    </div>

                    {/* Descripción */}
                    <div>
                      <label htmlFor="task-description" className={`block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 ${classes.text.primary}`}>
                        Descripción
                      </label>
                      <textarea
                        id="task-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe tu tarea (opcional)"
                        rows={4}
                        className={`w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border-2 ${classes.bg.input} ${classes.text.primary} ${classes.border.primary} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none text-sm sm:text-base`}
                        aria-label="Descripción de la tarea"
                      />
                    </div>

                    {/* Grid de 2 columnas para Prioridad y Categoría */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      {/* Prioridad */}
                      <div>
                        <label htmlFor="task-priority" className={`block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 ${classes.text.primary}`}>
                          <Flag size={14} className="inline mr-1.5" />
                          Prioridad
                        </label>
                        <div className="relative">
                          <select
                            id="task-priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as Task['priority'])}
                            className={`w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border-2 appearance-none cursor-pointer ${classes.bg.input} ${classes.text.primary} ${classes.border.primary} focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm sm:text-base`}
                            aria-label="Seleccionar prioridad"
                            title="Prioridad"
                          >
                            <option value="alta">🔴 Alta - Máxima prioridad</option>
                            <option value="media">🟡 Media - Prioridad normal</option>
                            <option value="baja">🟢 Baja - Puede esperar</option>
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <ChevronDown className={`w-4 h-4 ${classes.icon.secondary}`} />
                          </div>
                        </div>
                      </div>

                      {/* Categoría */}
                      <div>
                        <label htmlFor="task-category" className={`block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 ${classes.text.primary}`}>
                          Categoría
                        </label>
                        <div className="relative">
                          <select
                            id="task-category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value as Task['category'])}
                            className={`w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border-2 appearance-none cursor-pointer ${classes.bg.input} ${classes.text.primary} ${classes.border.primary} focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm sm:text-base`}
                            aria-label="Seleccionar categoría"
                            title="Categoría"
                          >
                            <option value="personal">👤 Personal</option>
                            <option value="trabajo">💼 Trabajo</option>
                            <option value="estudio">📚 Estudio</option>
                            <option value="otro">📌 Otro</option>
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <ChevronDown className={`w-4 h-4 ${classes.icon.secondary}`} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Fecha límite */}
                    <div>
                      <label htmlFor="task-due-date" className={`block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 ${classes.text.primary}`}>
                        <Calendar size={14} className="inline mr-1.5" />
                        Fecha límite
                      </label>
                      <input
                        id="task-due-date"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className={`w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border-2 ${classes.bg.input} ${classes.text.primary} ${classes.border.primary} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all cursor-pointer text-sm sm:text-base`}
                        aria-label="Fecha límite"
                        title="Fecha límite"
                      />
                    </div>
                  </div>

                  {/* Columna lateral - Color y Vista previa */}
                  <div className="lg:col-span-1 space-y-5 sm:space-y-6">
                    {/* Selector de color */}
                    <div className={`p-4 sm:p-5 rounded-xl border-2 ${classes.bg.secondary} ${classes.border.primary}`}>
                      <label className={`block text-xs sm:text-sm font-semibold mb-3 sm:mb-4 ${classes.text.primary}`}>
                        <Palette size={14} className="inline mr-1.5" />
                        Color de la tarea
                      </label>
                      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                        {TASK_COLORS.map((color) => (
                          <motion.button
                            key={color.value}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedColor(color)}
                            className={`
                              w-full aspect-square rounded-xl transition-all duration-200 shadow-md
                              ${selectedColor.value === color.value 
                                ? 'ring-4 ring-offset-2 ring-emerald-500 scale-105' 
                                : 'hover:shadow-lg'
                              }
                            `}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                            aria-label={`Seleccionar color ${color.name}`}
                          />
                        ))}
                      </div>
                      <p className={`text-[10px] sm:text-xs mt-3 sm:mt-4 text-center ${classes.text.muted}`}>
                        Color seleccionado: <span style={{ color: selectedColor.value }} className="font-medium">{selectedColor.name}</span>
                      </p>
                    </div>

                    {/* Vista previa mejorada */}
                    <div className={`p-4 sm:p-5 rounded-xl border-2 ${getPriorityBorderColor()} ${selectedColor.bg} transition-all duration-300`}>
                      <p className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-3 ${selectedColor.text}`}>
                        📋 Vista previa
                      </p>
                      <div className={`p-3 sm:p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-inner`}>
                        <h4 className={`font-semibold text-sm sm:text-base truncate ${classes.text.primary}`}>
                          {title || 'Título de la tarea'}
                        </h4>
                        {description && (
                          <p className={`text-xs sm:text-sm mt-2 ${classes.text.muted} line-clamp-2`}>
                            {description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                          <span className={`text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium ${selectedColor.bg} ${selectedColor.text} border ${selectedColor.border}`}>
                            {priority === 'alta' ? '🔴 Alta' : priority === 'media' ? '🟡 Media' : '🟢 Baja'}
                          </span>
                          <span className={`text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium ${selectedColor.bg} ${selectedColor.text} border ${selectedColor.border}`}>
                            {category === 'personal' && '👤 Personal'}
                            {category === 'trabajo' && '💼 Trabajo'}
                            {category === 'estudio' && '📚 Estudio'}
                            {category === 'otro' && '📌 Otro'}
                          </span>
                          {dueDate && (
                            <span className={`text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium ${selectedColor.bg} ${selectedColor.text} border ${selectedColor.border}`}>
                              📅 {new Date(dueDate + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 pt-5 sm:pt-6 border-t-2 border-dashed ${classes.border.primary}`}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/dashboard')}
                    className={`px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl font-semibold transition-all order-2 sm:order-1 ${classes.button.secondary} border-2 text-sm sm:text-base`}
                    aria-label="Cancelar creación"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={isFormValid ? { scale: 1.02 } : {}}
                    whileTap={isFormValid ? { scale: 0.98 } : {}}
                    onClick={handleSubmit}
                    disabled={!isFormValid}
                    className={`flex-1 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 sm:gap-3 order-1 sm:order-2 text-sm sm:text-base ${
                      !isFormValid
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                        : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 shadow-lg hover:shadow-xl'
                    }`}
                    aria-label="Crear tarea"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creando tarea...
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        Crear tarea
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateTaskPage;
