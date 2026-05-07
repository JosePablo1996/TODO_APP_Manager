// src/components/RightMenu.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeClasses } from '../hooks/useThemeClasses';
import { useTheme } from '../hooks/useTheme';
import { useTasks } from '../hooks/useTasks';
import type { UserProfile } from '../services/authService';
import {
  X,
  User,
  Settings,
  LogOut,
  RefreshCw,
  HelpCircle,
  Users,
  Sparkles,
  Wifi,
  WifiOff,
  Bell,
  BellOff,
  Star,
  Archive,
  Plus,
  Calendar as CalendarIcon,
  BarChart3,
  CheckCircle,
  Clock,
  AlertCircle,
  Mail,
  ChevronRight,
  Trash2
} from 'lucide-react';

interface RightMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onLogout: () => void;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
  color: string;
  action?: 'toggle';
  badge?: React.ReactNode;
}

interface MenuSection {
  title: string;
  icon: React.ReactNode;
  items: MenuItem[];
}

const RightMenu: React.FC<RightMenuProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
}) => {
  const navigate = useNavigate();
  const classes = useThemeClasses();
  useTheme();
  const { tasks, getDeletedTasks } = useTasks();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showNotifications, setShowNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');


  // Obtener nombre y email del usuario
  const displayName = user?.full_name || user?.username || 'Usuario';
  const displayEmail = user?.email || 'usuario@todoapp.com';
  const avatarUrl = user?.avatar;

  // Obtener tareas en papelera
  const deletedTasks = getDeletedTasks();
  const deletedCount = deletedTasks.length;

  // Obtener iniciales para avatar
  const getInitials = (): string => {
    if (displayName === 'Usuario') return 'U';
    const nameParts = displayName.split(' ').filter(part => part.length > 0);
    if (nameParts.length === 0) return 'U';
    if (nameParts.length === 1) {
      return nameParts[0].substring(0, Math.min(2, nameParts[0].length)).toUpperCase();
    }
    return (nameParts[0][0] + (nameParts[1] ? nameParts[1][0] : '')).toUpperCase();
  };

  // Obtener color de fondo para avatar
  const getAvatarColor = (): string => {
    if (displayName === 'Usuario') return 'from-emerald-500 to-cyan-500';
    const gradients = [
      'from-emerald-500 to-teal-500',
      'from-teal-500 to-cyan-500',
      'from-cyan-500 to-blue-500',
      'from-green-500 to-emerald-500',
      'from-emerald-500 to-cyan-500',
      'from-teal-500 to-emerald-500',
      'from-cyan-500 to-teal-500',
      'from-blue-500 to-cyan-500',
      'from-emerald-600 to-teal-600'
    ];
    const charCodeSum = displayName.split('').reduce((sum: number, char: string) => sum + char.charCodeAt(0), 0);
    const gradientIndex = charCodeSum % gradients.length;
    return gradients[gradientIndex];
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
      setShowLogoutModal(false);
      onClose();
      navigate('/login');
    } catch {
      console.error('Error al cerrar sesión');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Función de sincronización
  const handleSync = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      try {
        const userId = user?.id;
        if (userId) {
          const savedTasks = localStorage.getItem(`tasks_${userId}`);
          if (savedTasks) {
            const parsedTasks = JSON.parse(savedTasks);
            console.log('✅ Sincronización completada:', parsedTasks.length, 'tareas');
          }
        }
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 2000);
      } catch {
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    }, 1500);
  };

  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
    console.log('Notificaciones:', !showNotifications ? 'activadas' : 'desactivadas');
  };

  const handleToggleAutoSync = () => {
    setAutoSync(!autoSync);
    console.log('Sincronización automática:', !autoSync ? 'activada' : 'desactivada');
  };

  // Estadísticas rápidas
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const favoriteTasks = tasks.filter(t => t.isFavorite).length;

  // Obtener color de gradiente para items
  const getItemGradient = (color: string) => {
    const gradients: Record<string, string> = {
      blue: 'from-blue-400 to-blue-600',
      purple: 'from-purple-400 to-purple-600',
      green: 'from-green-400 to-green-600',
      yellow: 'from-yellow-400 to-yellow-600',
      red: 'from-red-400 to-red-600',
      indigo: 'from-indigo-400 to-indigo-600',
      pink: 'from-pink-400 to-pink-600',
      teal: 'from-teal-400 to-teal-600',
      gray: 'from-gray-400 to-gray-600',
      orange: 'from-orange-400 to-orange-600',
      cyan: 'from-cyan-400 to-cyan-600',
      emerald: 'from-emerald-400 to-emerald-600',
    };
    return gradients[color] || 'from-blue-400 to-purple-500';
  };

  // Obtener color de fondo para iconos
  const getIconBgColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500/20',
      purple: 'bg-purple-500/20',
      green: 'bg-green-500/20',
      yellow: 'bg-yellow-500/20',
      red: 'bg-red-500/20',
      indigo: 'bg-indigo-500/20',
      pink: 'bg-pink-500/20',
      teal: 'bg-teal-500/20',
      gray: 'bg-gray-500/20',
      orange: 'bg-orange-500/20',
      cyan: 'bg-cyan-500/20',
      emerald: 'bg-emerald-500/20',
    };
    return colors[color] || 'bg-blue-500/20';
  };

  // Secciones del menú derecho (sin la sección de Apariencia)
  const menuSections: MenuSection[] = [
    {
      title: 'Perfil',
      icon: <User className="w-4 h-4" />,
      items: [
        {
          icon: <User className="w-5 h-5" />,
          label: 'Mi Perfil',
          description: displayEmail,
          onClick: () => navigate('/perfil'),
          color: 'emerald',
        },
        {
          icon: <Settings className="w-5 h-5" />,
          label: 'Configuración',
          description: 'Personaliza tu experiencia',
          onClick: () => navigate('/configuracion'),
          color: 'teal',
        },
      ],
    },
    {
      title: 'Acciones Rápidas',
      icon: <Sparkles className="w-4 h-4" />,
      items: [
        {
          icon: <Plus className="w-5 h-5" />,
          label: 'Crear tarea',
          description: 'Agregar una nueva tarea',
          onClick: () => navigate('/crear-tarea'),
          color: 'emerald',
        },
        {
          icon: <Star className="w-5 h-5" />,
          label: 'Mis favoritos',
          description: `${favoriteTasks} tareas favoritas`,
          onClick: () => navigate('/favoritos'),
          color: 'amber',
        },
        {
          icon: <Archive className="w-5 h-5" />,
          label: 'Archivados',
          description: 'Tareas completadas',
          onClick: () => navigate('/archivados'),
          color: 'gray',
        },
        {
          icon: <Trash2 className="w-5 h-5" />,
          label: 'Papelera',
          description: `${deletedCount} tareas eliminadas`,
          onClick: () => navigate('/papelera'),
          color: 'gray',
        },
        {
          icon: <CalendarIcon className="w-5 h-5" />,
          label: 'Calendario',
          description: 'Vista mensual de tareas',
          onClick: () => navigate('/calendario'),
          color: 'cyan',
        },
        {
          icon: <BarChart3 className="w-5 h-5" />,
          label: 'Estadísticas',
          description: 'Análisis de progreso',
          onClick: () => navigate('/estadisticas'),
          color: 'indigo',
        },
      ],
    },
    {
      title: 'Sincronización',
      icon: <RefreshCw className="w-4 h-4" />,
      items: [
        {
          icon: syncStatus === 'syncing' ? <RefreshCw className="w-5 h-5 animate-spin" /> : 
                syncStatus === 'success' ? <CheckCircle className="w-5 h-5" /> : 
                syncStatus === 'error' ? <AlertCircle className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />,
          label: syncStatus === 'syncing' ? 'Sincronizando...' : 
                 syncStatus === 'success' ? '¡Sincronizado!' : 
                 syncStatus === 'error' ? 'Error al sincronizar' : 'Sincronizar ahora',
          description: `${totalTasks} tareas · ${completedTasks} completadas`,
          onClick: handleSync,
          color: syncStatus === 'error' ? 'red' : 'teal',
          badge: syncStatus === 'syncing' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 
                 syncStatus === 'success' ? <CheckCircle className="w-4 h-4" /> : undefined,
        },
        {
          icon: autoSync ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />,
          label: autoSync ? 'Sincronización automática' : 'Sin sincronización automática',
          description: autoSync ? 'Activada' : 'Desactivada',
          onClick: handleToggleAutoSync,
          color: autoSync ? 'emerald' : 'gray',
          action: 'toggle',
        },
      ],
    },
    {
      title: 'Notificaciones',
      icon: <Bell className="w-4 h-4" />,
      items: [
        {
          icon: showNotifications ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />,
          label: showNotifications ? 'Notificaciones activadas' : 'Notificaciones silenciadas',
          description: showNotifications ? 'Recibir alertas' : 'Sin alertas',
          onClick: handleToggleNotifications,
          color: showNotifications ? 'amber' : 'gray',
          action: 'toggle',
        },
      ],
    },
    {
      title: 'Ayuda',
      icon: <HelpCircle className="w-4 h-4" />,
      items: [
        {
          icon: <HelpCircle className="w-5 h-5" />,
          label: 'Centro de ayuda',
          description: 'Guías y soporte',
          onClick: () => navigate('/ayuda'),
          color: 'blue',
        },
        {
          icon: <Users className="w-5 h-5" />,
          label: 'Desarrollador',
          description: 'Información técnica',
          onClick: () => navigate('/developer'),
          color: 'purple',
        },
        {
          icon: <Clock className="w-5 h-5" />,
          label: 'Cambios recientes',
          description: 'v2.5.0 · Novedades',
          onClick: () => navigate('/changelog'),
          color: 'gray',
        },
      ],
    },
    {
      title: 'Sesión',
      icon: <LogOut className="w-4 h-4" />,
      items: [
        {
          icon: <LogOut className="w-5 h-5" />,
          label: 'Cerrar sesión',
          description: 'Salir de tu cuenta',
          onClick: handleLogoutClick,
          color: 'red',
        },
      ],
    },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-gradient-to-tl from-emerald-900/60 via-teal-900/40 to-cyan-900/60 backdrop-blur-md" />
      </motion.div>

      {/* Menú lateral derecho */}
      <motion.div
        initial={{ x: 400 }}
        animate={{ x: 0 }}
        exit={{ x: 400 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className={`fixed top-0 right-0 h-full w-96 z-50 overflow-y-auto ${classes.bg.card} backdrop-blur-xl shadow-2xl rounded-l-3xl border-l border-white/20`}
      >
        {/* Header del menú con gradiente */}
        <div className="sticky top-0 z-20 p-4">
          <div className="relative h-40 rounded-2xl overflow-hidden">
            {/* Fondo con gradiente */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600"></div>
            
            {/* Efectos decorativos */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-400/20 rounded-full blur-3xl"></div>
            
            {/* Botón de cerrar */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-3 left-3 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-200 border border-white/30 z-30"
              aria-label="Cerrar menú"
            >
              <X className="w-4 h-4 text-white" />
            </motion.button>

            {/* Contenido del header - Avatar y datos del usuario */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full overflow-hidden shadow-xl ring-4 ring-white/50 mb-3">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${getAvatarColor()} flex items-center justify-center text-white text-2xl font-bold`}>
                    {getInitials()}
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold text-white mb-1 drop-shadow-lg">
                {displayName}
              </h2>
              <div className="flex items-center gap-1 text-white/80 text-sm">
                <Mail className="w-3 h-3" />
                {displayEmail}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido del menú */}
        <div className="px-4 pb-6">
          {/* Estadísticas rápidas */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6 p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 backdrop-blur-sm rounded-xl border border-white/20"
          >
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalTasks}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{completedTasks}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Completadas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingTasks}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Pendientes</p>
              </div>
            </div>
          </motion.div>

          {/* Secciones del menú */}
          <AnimatePresence mode="wait">
            {menuSections.map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="mb-6"
              >
                {/* Título de sección */}
                <div className="flex items-center gap-2 mb-2 px-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-emerald-400 via-teal-400 to-cyan-400 rounded-full" />
                  <span className={`text-xs font-bold uppercase tracking-wider ${classes.text.muted}`}>
                    {section.title}
                  </span>
                  {section.icon && (
                    <span className="text-emerald-400/60">
                      {section.icon}
                    </span>
                  )}
                </div>

                {/* Items de la sección */}
                <div className="space-y-1">
                  {section.items.map((item, itemIdx) => {
                    const gradient = getItemGradient(item.color);
                    const iconBg = getIconBgColor(item.color);
                    const isHovered = hoveredItem === `right-${idx}-${itemIdx}`;
                    
                    return (
                      <motion.button
                        key={itemIdx}
                        whileHover={{ scale: 1.02, x: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onHoverStart={() => setHoveredItem(`right-${idx}-${itemIdx}`)}
                        onHoverEnd={() => setHoveredItem(null)}
                        onClick={item.onClick}
                        className={`
                          w-full flex items-center gap-3 px-3 py-3 rounded-xl
                          transition-all duration-200 relative overflow-hidden group
                          hover:bg-white/5
                        `}
                      >
                        {/* Efecto de hover gradiente */}
                        {isHovered && (
                          <motion.div
                            layoutId="rightHoverBackground"
                            className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-10`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.1 }}
                            exit={{ opacity: 0 }}
                          />
                        )}
                        
                        {/* Icono con fondo */}
                        <div className={`relative z-10 p-2 rounded-xl ${iconBg} transition-all duration-200 group-hover:scale-110`}>
                          <span className={`text-${item.color}-500 dark:text-${item.color}-400`}>
                            {item.icon}
                          </span>
                        </div>
                        
                        {/* Label y descripción */}
                        <div className="flex-1 text-left relative z-10">
                          <span className={`block text-sm font-medium ${classes.text.primary}`}>
                            {item.label}
                          </span>
                          {item.description && (
                            <span className={`block text-xs mt-0.5 ${classes.text.muted}`}>
                              {item.description}
                            </span>
                          )}
                        </div>
                        
                        {/* Badge o indicador de estado */}
                        {item.badge && (
                          <span className={`relative z-10 px-2 py-0.5 rounded-lg text-xs font-medium ${iconBg} text-${item.color}-600 dark:text-${item.color}-400`}>
                            {item.badge}
                          </span>
                        )}
                        
                        {/* Indicador de toggle */}
                        {item.action === 'toggle' && (
                          <div className={`relative z-10 w-8 h-4 rounded-full transition-colors duration-200 ${
                            item.color === 'gray' 
                              ? 'bg-gray-400' 
                              : `bg-${item.color}-500`
                          }`}>
                            <motion.div
                              className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-md"
                              animate={{ x: item.color === 'gray' ? 4 : 16 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          </div>
                        )}
                        
                        {/* Flecha decorativa */}
                        <ChevronRight className={`relative z-10 w-4 h-4 ${classes.icon.secondary} group-hover:translate-x-1 transition-transform`} />
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <p className={`text-xs text-center ${classes.text.muted}`}>
                TodoAppManager v2.5.0 · Supabase Edition
              </p>
            </div>
            <p className={`text-xs text-center ${classes.text.muted} mt-1`}>
              {new Date().toLocaleDateString()}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Modal de confirmación de cierre de sesión */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleCancelLogout}
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`relative w-full max-w-md rounded-2xl overflow-hidden ${classes.bg.card} border-2 shadow-2xl`}
            >
              <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <LogOut className="w-6 h-6" />
                  Cerrar sesión
                </h3>
              </div>

              <div className="p-6">
                <div className="flex justify-center mb-6">
                  <div className="p-0.5 bg-gradient-to-r from-red-400 to-pink-400 rounded-full">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="w-20 h-20 rounded-full object-cover" />
                    ) : (
                      <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getAvatarColor()} flex items-center justify-center text-white text-2xl font-bold`}>
                        {getInitials()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center mb-6">
                  <p className={`text-lg font-semibold mb-2 ${classes.text.primary}`}>
                    ¿Cerrar sesión, {displayName.split(' ')[0]}?
                  </p>
                  <p className={`text-sm ${classes.text.secondary}`}>
                    Podrás volver a iniciar sesión cuando quieras
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCancelLogout}
                    disabled={isLoggingOut}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${classes.button.secondary}`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmLogout}
                    disabled={isLoggingOut}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all font-medium flex items-center justify-center gap-2"
                  >
                    {isLoggingOut ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Cerrando...</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="w-5 h-5" />
                        <span>Cerrar sesión</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RightMenu;