// src/pages/EditTaskPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { useThemeClasses } from '../hooks/useThemeClasses';
import Header from '../components/Header';
import LeftMenu from '../components/LeftMenu';
import { TaskIconSelector } from '../components/tasks/TaskIconSelector';
import { TaskSizeSelector } from '../components/tasks/TaskSizeSelector';
import { TaskOpacitySelector } from '../components/tasks/TaskOpacitySelector';
import { TaskPreview } from '../components/tasks/TaskPreview';
import type { Notification } from '../components/Header';

// Iconos
import {
  ArrowLeft,
  Save,
  Calendar,
  Flag,
  Palette,
  Trash2,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Tipos
import type { Task } from '../types/task';
import type {
  TaskIconName,
  TaskSizeValue,
  TaskOpacityValue,
  TaskBorderRadiusValue,
} from '../data/taskCustomization';
import { TASK_BORDER_RADIUS } from '../data/taskCustomization';

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

const EditTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const { tasks, updateTask, deleteTask } = useTasks();
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
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  // 🎨 Estados de personalización
  const [selectedIcon, setSelectedIcon] = useState<TaskIconName>('CheckCircle');
  const [selectedSize, setSelectedSize] = useState<TaskSizeValue>('md');
  const [selectedOpacity, setSelectedOpacity] = useState<TaskOpacityValue>('medium');
  const [selectedBorderRadius, setSelectedBorderRadius] = useState<TaskBorderRadiusValue>('medium');

  // Estados UI
  const [notifications] = useState<Notification[]>([]);
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);

  // Cargar tarea existente
  useEffect(() => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setCategory(task.category);
      setDueDate(task.dueDate || '');
      
      // Buscar el color correspondiente
      const colorMatch = TASK_COLORS.find(c => c.value === task.color);
      if (colorMatch) {
        setSelectedColor(colorMatch);
      } else if (task.color) {
        setSelectedColor({ ...TASK_COLORS[0], value: task.color });
      }

      // 🎨 Cargar personalización existente o usar defaults
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSelectedIcon((task as any).icon || 'CheckCircle');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSelectedSize((task as any).size || 'md');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSelectedOpacity((task as any).opacity || 'medium');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSelectedBorderRadius((task as any).borderRadius || 'medium');
    } else if (tasks.length > 0) {
      setError('Tarea no encontrada');
    }
    setLoading(false);
  }, [id, tasks]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('El título es requerido');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await updateTask(id!, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        category,
        dueDate: dueDate || undefined,
        color: selectedColor.value,
        icon: selectedIcon,
        size: selectedSize,
        opacity: selectedOpacity,
        borderRadius: selectedBorderRadius,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any); // Temporal hasta que se actualice el tipo en useTasks
      
      setSuccessMessage('✅ Tarea actualizada correctamente');
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } catch (err) {
      setError('Error al actualizar la tarea');
      console.error('❌ [EDIT_TASK] Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea? Esta acción la moverá a la papelera.')) {
      try {
        await deleteTask(id!);
        navigate('/dashboard');
      } catch (err) {
        setError('Error al eliminar la tarea');
        console.error('❌ [DELETE_TASK] Error:', err);
      }
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

  if (loading) {
    return (
      <div className={`min-h-screen ${classes.bg.primary} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto mb-4" />
          <p className={`text-sm ${classes.text.muted}`}>Cargando tarea...</p>
        </div>
      </div>
    );
  }

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

      <div className="flex-1 flex flex-col transition-all duration-300">
        {/* Header */}
        <Header
          user={safeUser}
          onLogout={handleLogout}
          notifications={notifications}
          onMarkNotificationAsRead={() => {}}
          onClearAllNotifications={() => {}}
          onSearch={() => {}}
        />

        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
            
            {/* Header mejorado */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6 md:mb-8"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <motion.button
                  whileHover={{ scale: 1.05, x: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/dashboard')}
                  className={`p-2 sm:p-2.5 rounded-xl transition-all ${classes.bg.hover} border ${classes.border.primary} flex-shrink-0`}
                  aria-label="Volver"
                  title="Volver a tareas"
                >
                  <ArrowLeft className={`w-4 h-4 sm:w-5 sm:h-5 ${classes.icon.secondary}`} />
                </motion.button>
                
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-gradient-to-b from-emerald-500 via-teal-500 to-cyan-500 rounded-full flex-shrink-0" />
                  <div className="min-w-0">
                    <h1 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-1.5 sm:gap-2 md:gap-3 ${classes.text.primary}`}>
                      <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent truncate">
                        Editar Tarea
                      </span>
                      <Sparkles className="text-emerald-500 flex-shrink-0" size={16} />
                    </h1>
                    <p className={`text-[11px] sm:text-xs md:text-sm mt-0.5 sm:mt-1 ${classes.text.muted}`}>
                      Modifica los detalles de tu tarea
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Botón eliminar */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDelete}
                className="p-2 sm:p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors border border-red-500/30 flex-shrink-0"
                aria-label="Eliminar tarea"
                title="Eliminar tarea"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </motion.div>

            {/* Formulario */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`rounded-xl sm:rounded-2xl md:rounded-3xl border-2 shadow-lg sm:shadow-xl overflow-hidden ${classes.bg.card} ${classes.border.primary}`}
              style={{
                borderTop: `3px solid ${selectedColor.value}`,
              } as React.CSSProperties}
            >
              <div className="h-1 sm:h-1.5 md:h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

              <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                {/* Mensaje de error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-4 sm:mb-5 md:mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-2.5 sm:p-3 md:p-4 rounded-lg text-[11px] sm:text-xs md:text-sm flex items-center gap-2 sm:gap-3"
                    >
                      <span className="text-sm sm:text-base md:text-lg flex-shrink-0">⚠️</span>
                      <span className="truncate">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Mensaje de éxito */}
                <AnimatePresence>
                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-4 sm:mb-5 md:mb-6 bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 text-emerald-700 dark:text-emerald-400 p-2.5 sm:p-3 md:p-4 rounded-lg text-[11px] sm:text-xs md:text-sm flex items-center gap-2 sm:gap-3"
                    >
                      <span className="text-sm sm:text-base md:text-lg flex-shrink-0">✅</span>
                      <span className="truncate">{successMessage}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                  {/* Columna principal - Campos del formulario */}
                  <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
                    {/* Título */}
                    <div>
                      <label htmlFor="task-title" className={`block text-[11px] sm:text-xs md:text-sm font-semibold mb-1 sm:mb-1.5 md:mb-2 ${classes.text.primary}`}>
                        Título <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="task-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="¿Qué necesitas hacer?"
                        className={`w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-3.5 rounded-lg sm:rounded-xl border-2 ${classes.bg.input} ${classes.text.primary} ${classes.border.primary} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm md:text-base`}
                        aria-label="Título de la tarea"
                        autoFocus
                      />
                    </div>

                    {/* Descripción */}
                    <div>
                      <label htmlFor="task-description" className={`block text-[11px] sm:text-xs md:text-sm font-semibold mb-1 sm:mb-1.5 md:mb-2 ${classes.text.primary}`}>
                        Descripción
                      </label>
                      <textarea
                        id="task-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe tu tarea (opcional)"
                        rows={4}
                        className={`w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-3.5 rounded-lg sm:rounded-xl border-2 ${classes.bg.input} ${classes.text.primary} ${classes.border.primary} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none text-sm md:text-base`}
                        aria-label="Descripción de la tarea"
                      />
                    </div>

                    {/* Grid de 2 columnas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                      {/* Prioridad */}
                      <div>
                        <label htmlFor="task-priority" className={`block text-[11px] sm:text-xs md:text-sm font-semibold mb-1 sm:mb-1.5 md:mb-2 ${classes.text.primary}`}>
                          <Flag size={14} className="inline mr-1.5" />
                          Prioridad
                        </label>
                        <div className="relative">
                          <select
                            id="task-priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as Task['priority'])}
                            className={`w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-3.5 rounded-lg sm:rounded-xl border-2 appearance-none cursor-pointer ${classes.bg.input} ${classes.text.primary} ${classes.border.primary} focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm md:text-base`}
                            aria-label="Seleccionar prioridad"
                          >
                            <option value="alta">🔴 Alta - Máxima prioridad</option>
                            <option value="media">🟡 Media - Prioridad normal</option>
                            <option value="baja">🟢 Baja - Puede esperar</option>
                          </select>
                          <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${classes.icon.secondary}`} />
                          </div>
                        </div>
                      </div>

                      {/* Categoría */}
                      <div>
                        <label htmlFor="task-category" className={`block text-[11px] sm:text-xs md:text-sm font-semibold mb-1 sm:mb-1.5 md:mb-2 ${classes.text.primary}`}>
                          Categoría
                        </label>
                        <div className="relative">
                          <select
                            id="task-category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value as Task['category'])}
                            className={`w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-3.5 rounded-lg sm:rounded-xl border-2 appearance-none cursor-pointer ${classes.bg.input} ${classes.text.primary} ${classes.border.primary} focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm md:text-base`}
                            aria-label="Seleccionar categoría"
                          >
                            <option value="personal">👤 Personal</option>
                            <option value="trabajo">💼 Trabajo</option>
                            <option value="estudio">📚 Estudio</option>
                            <option value="otro">📌 Otro</option>
                          </select>
                          <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${classes.icon.secondary}`} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Fecha límite */}
                    <div>
                      <label htmlFor="task-due-date" className={`block text-[11px] sm:text-xs md:text-sm font-semibold mb-1 sm:mb-1.5 md:mb-2 ${classes.text.primary}`}>
                        <Calendar size={14} className="inline mr-1.5" />
                        Fecha límite
                      </label>
                      <input
                        id="task-due-date"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className={`w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-3.5 rounded-lg sm:rounded-xl border-2 ${classes.bg.input} ${classes.text.primary} ${classes.border.primary} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all cursor-pointer text-sm md:text-base`}
                        aria-label="Fecha límite"
                      />
                    </div>

                    {/* 🎨 Selector de Icono */}
                    <TaskIconSelector
                      selectedIcon={selectedIcon}
                      onSelectIcon={setSelectedIcon}
                    />

                    {/* 🎨 Selector de Tamaño */}
                    <TaskSizeSelector
                      selectedSize={selectedSize}
                      onSelectSize={setSelectedSize}
                    />

                    {/* 🎨 Selector de Opacidad */}
                    <TaskOpacitySelector
                      selectedOpacity={selectedOpacity}
                      onSelectOpacity={setSelectedOpacity}
                      previewColor={selectedColor.value}
                    />
                  </div>

                  {/* Columna lateral - Personalización y Vista previa */}
                  <div className="lg:col-span-1 space-y-4 sm:space-y-5 md:space-y-6">
                    {/* Selector de color */}
                    <div className={`p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl border-2 ${classes.bg.secondary} ${classes.border.primary}`}>
                      <label className={`block text-[11px] sm:text-xs md:text-sm font-semibold mb-2 sm:mb-3 md:mb-4 ${classes.text.primary}`}>
                        <Palette size={14} className="inline mr-1.5" />
                        Color de la tarea
                      </label>
                      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 md:gap-3">
                        {TASK_COLORS.map((color) => (
                          <motion.button
                            key={color.value}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedColor(color)}
                            className={`
                              w-full aspect-square rounded-lg sm:rounded-xl transition-all duration-200 shadow-md
                              ${selectedColor.value === color.value 
                                ? 'ring-3 sm:ring-4 ring-offset-1 sm:ring-offset-2 ring-emerald-500 scale-105' 
                                : 'hover:shadow-lg'
                              }
                            `}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                            aria-label={`Seleccionar color ${color.name}`}
                          />
                        ))}
                      </div>
                      <p className={`text-[9px] sm:text-[10px] md:text-xs mt-2 sm:mt-3 md:mt-4 text-center ${classes.text.muted}`}>
                        Color seleccionado: <span className="font-medium" style={{ color: selectedColor.value }}>{selectedColor.name}</span>
                      </p>
                    </div>

                    {/* 🎨 Selector de Borde Redondeado */}
                    <div className={`p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl border-2 ${classes.bg.secondary} ${classes.border.primary}`}>
                      <label className={`block text-[11px] sm:text-xs md:text-sm font-semibold mb-2 sm:mb-3 md:mb-4 ${classes.text.primary}`}>
                        🔲 Estilo de borde
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {TASK_BORDER_RADIUS.map((borderStyle) => {
                          const isSelected = selectedBorderRadius === borderStyle.value;
                          return (
                            <motion.button
                              key={borderStyle.value}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setSelectedBorderRadius(borderStyle.value)}
                              className={`
                                p-3 rounded-lg border-2 transition-all duration-200 text-center
                                ${isSelected
                                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 shadow-md ring-2 ring-emerald-500/30'
                                  : `${classes.border.primary} ${classes.bg.card} hover:border-emerald-400`
                                }
                                ${borderStyle.value === 'none' ? 'rounded-none' : ''}
                                ${borderStyle.value === 'medium' ? 'rounded-lg' : ''}
                                ${borderStyle.value === 'large' ? 'rounded-xl' : ''}
                                ${borderStyle.value === 'full' ? 'rounded-3xl' : ''}
                              `}
                              aria-label={`Seleccionar borde ${borderStyle.name}`}
                              title={borderStyle.description}
                            >
                              <div className={`
                                w-full h-8 mx-auto mb-1.5 border-2
                                ${isSelected ? 'border-emerald-500 bg-emerald-500/20' : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800'}
                                ${borderStyle.value === 'none' ? 'rounded-none' : ''}
                                ${borderStyle.value === 'medium' ? 'rounded-md' : ''}
                                ${borderStyle.value === 'large' ? 'rounded-lg' : ''}
                                ${borderStyle.value === 'full' ? 'rounded-2xl' : ''}
                              `} />
                              <span className={`text-[10px] sm:text-xs font-medium ${
                                isSelected ? 'text-emerald-600 dark:text-emerald-400' : classes.text.muted
                              }`}>
                                {borderStyle.name}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 🎨 Vista previa unificada */}
                    <TaskPreview
                      title={title}
                      description={description}
                      priority={priority}
                      category={category}
                      dueDate={dueDate}
                      icon={selectedIcon}
                      size={selectedSize}
                      opacity={selectedOpacity}
                      borderRadius={selectedBorderRadius}
                      color={selectedColor.value}
                      showBadges={true}
                    />
                  </div>
                </div>

                {/* Botones de acción */}
                <div className={`flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 mt-5 sm:mt-6 md:mt-8 pt-4 sm:pt-5 md:pt-6 border-t-2 border-dashed ${classes.border.primary}`}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/dashboard')}
                    className={`px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-3.5 rounded-lg sm:rounded-xl font-semibold transition-all order-2 sm:order-1 ${classes.button.secondary} border-2 text-sm md:text-base`}
                    aria-label="Cancelar edición"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={isFormValid ? { scale: 1.02 } : {}}
                    whileTap={isFormValid ? { scale: 0.98 } : {}}
                    onClick={handleSubmit}
                    disabled={!isFormValid}
                    className={`flex-1 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-3.5 rounded-lg sm:rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 order-1 sm:order-2 text-sm md:text-base ${
                      !isFormValid
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                        : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 shadow-lg hover:shadow-xl'
                    }`}
                    aria-label="Guardar cambios"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Guardar cambios
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

export default EditTaskPage;