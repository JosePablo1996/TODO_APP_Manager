// src/pages/EditTaskPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { useThemeClasses } from '../hooks/useThemeClasses';
import Header from '../components/Header';
import LeftMenu from '../components/LeftMenu';
import type { Notification } from '../components/Header';

// Iconos
import {
  ArrowLeft,
  Save,
  Calendar,
  Flag,
  Palette,
  Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';

// Tipos
import type { Task } from '../types/task';

// Colores predefinidos para las tareas
const TASK_COLORS = [
  { name: 'Default', value: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-600' },
  { name: 'Blue', value: '#3b82f6', bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-600' },
  { name: 'Purple', value: '#8b5cf6', bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-600' },
  { name: 'Pink', value: '#ec4899', bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-600' },
  { name: 'Orange', value: '#f97316', bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-600' },
  { name: 'Red', value: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-600' },
  { name: 'Teal', value: '#14b8a6', bg: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-600' },
  { name: 'Cyan', value: '#06b6d4', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-600' },
  { name: 'Amber', value: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-600' },
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
        // Si el color existe pero no está en la lista predefinida
        setSelectedColor({ ...TASK_COLORS[0], value: task.color });
      }
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

    try {
      updateTask(id!, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        category,
        dueDate: dueDate || undefined,
        color: selectedColor.value,
      });
      
      navigate('/tareas');
    } catch (err) {
      setError('Error al actualizar la tarea');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      deleteTask(id!);
      navigate('/tareas');
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${classes.bg.primary} flex`}>
      <LeftMenu 
        isOpen={isLeftMenuOpen}
        onClose={toggleLeftMenu}
        user={safeUser}
        onLogout={handleLogout}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isLeftMenuOpen ? 'ml-64' : 'ml-20'}`}>
        <Header
          user={safeUser}
          onLogout={handleLogout}
          notifications={notifications}
          onMarkNotificationAsRead={() => {}}
          onClearAllNotifications={() => {}}
          onSearch={() => {}}
        />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/tareas')}
                  className={`p-2 rounded-lg transition-colors ${classes.bg.hover}`}
                  aria-label="Volver"
                  title="Volver"
                >
                  <ArrowLeft className={`w-5 h-5 ${classes.icon.secondary}`} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-gradient-to-b from-emerald-500 via-teal-500 to-cyan-500 rounded-full" />
                  <h1 className={`text-2xl font-bold flex items-center gap-2 ${classes.text.primary}`}>
                    <Save className={classes.icon.primary} size={24} />
                    Editar Tarea
                  </h1>
                </div>
              </div>
              
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                aria-label="Eliminar tarea"
                title="Eliminar tarea"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border ${classes.bg.card} ${classes.border.primary} overflow-hidden`}
              style={{
                backgroundColor: `${selectedColor.value}08`,
                borderTop: `3px solid ${selectedColor.value}`,
              }}
            >
              <div className="p-6 space-y-6">
                {/* Mensaje de error */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Título */}
                <div>
                  <label htmlFor="task-title" className={`block text-sm font-medium mb-2 ${classes.text.secondary}`}>
                    Título *
                  </label>
                  <input
                    id="task-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="¿Qué necesitas hacer?"
                    className={`w-full px-4 py-3 rounded-xl border ${classes.bg.input} ${classes.text.primary} ${classes.border.primary} focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all`}
                    aria-label="Título de la tarea"
                    autoFocus
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label htmlFor="task-description" className={`block text-sm font-medium mb-2 ${classes.text.secondary}`}>
                    Descripción
                  </label>
                  <textarea
                    id="task-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe tu tarea (opcional)"
                    rows={4}
                    className={`w-full px-4 py-3 rounded-xl border ${classes.bg.input} ${classes.text.primary} ${classes.border.primary} focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none`}
                    aria-label="Descripción de la tarea"
                  />
                </div>

                {/* Prioridad y Categoría */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="task-priority" className={`block text-sm font-medium mb-2 ${classes.text.secondary}`}>
                      <Flag size={14} className="inline mr-1" />
                      Prioridad
                    </label>
                    <select
                      id="task-priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as Task['priority'])}
                      className={`w-full px-4 py-3 rounded-xl border ${classes.bg.input} ${classes.text.primary} ${classes.border.primary} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      aria-label="Seleccionar prioridad"
                      title="Prioridad"
                    >
                      <option value="alta">🔴 Alta</option>
                      <option value="media">🟡 Media</option>
                      <option value="baja">🟢 Baja</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="task-category" className={`block text-sm font-medium mb-2 ${classes.text.secondary}`}>
                      Categoría
                    </label>
                    <select
                      id="task-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Task['category'])}
                      className={`w-full px-4 py-3 rounded-xl border ${classes.bg.input} ${classes.text.primary} ${classes.border.primary} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      aria-label="Seleccionar categoría"
                      title="Categoría"
                    >
                      <option value="personal">👤 Personal</option>
                      <option value="trabajo">💼 Trabajo</option>
                      <option value="estudio">📚 Estudio</option>
                      <option value="otro">📌 Otro</option>
                    </select>
                  </div>
                </div>

                {/* Fecha límite */}
                <div>
                  <label htmlFor="task-due-date" className={`block text-sm font-medium mb-2 ${classes.text.secondary}`}>
                    <Calendar size={14} className="inline mr-1" />
                    Fecha límite
                  </label>
                  <input
                    id="task-due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${classes.bg.input} ${classes.text.primary} ${classes.border.primary} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    aria-label="Fecha límite"
                    title="Fecha límite"
                  />
                </div>

                {/* Selector de color */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${classes.text.secondary}`}>
                    <Palette size={14} className="inline mr-1" />
                    Color de la tarea
                  </label>
                  <div className="grid grid-cols-5 sm:grid-cols-9 gap-3">
                    {TASK_COLORS.map((color) => (
                      <motion.button
                        key={color.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedColor(color)}
                        className={`
                          w-10 h-10 rounded-xl transition-all duration-200
                          ${selectedColor.value === color.value ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : ''}
                        `}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                        aria-label={`Seleccionar color ${color.name}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Vista previa */}
                <div className={`p-4 rounded-xl border ${selectedColor.bg} ${selectedColor.border} transition-all`}>
                  <p className={`text-sm font-medium ${selectedColor.text} mb-2`}>Vista previa</p>
                  <div 
                    className={`p-3 rounded-lg`}
                    style={{ backgroundColor: `${selectedColor.value}15` }}
                  >
                    <h4 className={`font-medium ${classes.text.primary}`}>
                      {title || 'Título de la tarea'}
                    </h4>
                    {description && (
                      <p className={`text-xs mt-1 ${classes.text.muted}`}>
                        {description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${selectedColor.bg} ${selectedColor.text}`}>
                        {priority === 'alta' ? '🔴 Alta' : priority === 'media' ? '🟡 Media' : '🟢 Baja'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${selectedColor.bg} ${selectedColor.text}`}>
                        {category === 'personal' && '👤 Personal'}
                        {category === 'trabajo' && '💼 Trabajo'}
                        {category === 'estudio' && '📚 Estudio'}
                        {category === 'otro' && '📌 Otro'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => navigate('/tareas')}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${classes.button.secondary}`}
                    aria-label="Cancelar edición"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !title.trim()}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      isSubmitting || !title.trim()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                        : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg'
                    }`}
                    aria-label="Guardar cambios"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Guardar cambios
                      </>
                    )}
                  </button>
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