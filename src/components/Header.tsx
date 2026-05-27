// src/components/Header.tsx
import { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LeftMenu from './LeftMenu';
import RightMenu from './RightMenu';
import ThemeToggle from './ThemeToggle';
import GreetingWidget from './widgets/GreetingWidget';
import { 
  Bell,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Check,
  Menu,
  Star,
  Edit3,
  ChevronDown
} from 'lucide-react';
import type { UserProfile } from '../services/authService';

// Tipos para notificaciones
export interface Notification {
  id: string;
  type: 'create' | 'update' | 'delete' | 'complete';
  taskTitle: string;
  timestamp: Date;
  read: boolean;
}

interface HeaderProps {
  user: UserProfile | null;
  onLogout: () => void;
  notifications?: Notification[];
  onMarkNotificationAsRead?: (id: string) => void;
  onClearAllNotifications?: () => void;
  onSearch?: (query: string) => void;
  onMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  user, 
  onLogout, 
  notifications = [],
  onMarkNotificationAsRead,
  onClearAllNotifications,
  onSearch,
  onMenuToggle
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);
  const [isRightMenuOpen, setIsRightMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  
  const notificationsDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notificationsButtonRef = useRef<HTMLButtonElement>(null);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = () => {
    if (onSearch) onSearch(searchQuery);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch(type) {
      case 'create': return <CheckCircle size={14} className="text-emerald-400" />;
      case 'update': return <Clock size={14} className="text-teal-400" />;
      case 'delete': return <AlertCircle size={14} className="text-red-400" />;
      case 'complete': return <Check size={14} className="text-emerald-400" />;
      default: return <Bell size={14} className="text-gray-400" />;
    }
  };

  const getNotificationMessage = (notification: Notification): string => {
    switch(notification.type) {
      case 'create': return `Nueva tarea creada: "${notification.taskTitle}"`;
      case 'update': return `Tarea actualizada: "${notification.taskTitle}"`;
      case 'delete': return `Tarea eliminada: "${notification.taskTitle}"`;
      case 'complete': return `Tarea completada: "${notification.taskTitle}"`;
      default: return `Acción en tarea: "${notification.taskTitle}"`;
    }
  };

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    return `Hace ${diffDays} d`;
  };

  // Obtener nombre para mostrar
  const displayName = useMemo(() => {
    if (user?.full_name) return user.full_name;
    if (user?.username) return user.username;
    return 'Usuario';
  }, [user]);

  // Obtener avatar URL
  const avatarUrl = user?.avatar;

  // Obtener iniciales para avatar (fallback)
  const getInitials = (): string => {
    if (displayName === 'Usuario') return 'U';
    const nameParts = displayName.split(' ').filter((part: string) => part.length > 0);
    if (nameParts.length === 0) return 'U';
    if (nameParts.length === 1) {
      return nameParts[0].substring(0, Math.min(2, nameParts[0].length)).toUpperCase();
    }
    return (nameParts[0][0] + (nameParts[1] ? nameParts[1][0] : '')).toUpperCase();
  };

  // Obtener color de fondo para avatar
  const getAvatarColor = (): string => {
    if (displayName === 'Usuario') return 'from-amber-400 to-orange-500';
    
    const gradients = [
      'from-amber-400 to-orange-500',
      'from-amber-500 to-orange-600',
      'from-orange-400 to-red-500',
      'from-yellow-400 to-amber-500',
      'from-emerald-400 to-teal-500',
      'from-teal-400 to-cyan-500',
      'from-cyan-400 to-blue-500',
      'from-blue-400 to-indigo-500',
      'from-indigo-400 to-purple-500',
      'from-purple-400 to-pink-500'
    ];
    
    const charCodeSum = displayName.split('').reduce((sum: number, char: string) => sum + char.charCodeAt(0), 0);
    const gradientIndex = charCodeSum % gradients.length;
    
    return gradients[gradientIndex];
  };

  const handleAvatarError = () => {
    setAvatarError(true);
  };

  // Manejar apertura de menú
  const handleMenuToggle = () => {
    if (onMenuToggle) {
      onMenuToggle();
    } else {
      setIsLeftMenuOpen(true);
    }
  };

  return (
    <>
      {/* LeftMenu Component */}
      <LeftMenu 
        isOpen={isLeftMenuOpen}
        onClose={() => setIsLeftMenuOpen(false)}
        user={user}
        onLogout={onLogout}
      />

      {/* RightMenu Component */}
      <RightMenu
        isOpen={isRightMenuOpen}
        onClose={() => setIsRightMenuOpen(false)}
        user={user}
        onLogout={onLogout}
      />

      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="sticky top-0 z-40 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 shadow-xl"
      >
        <div className="mx-auto px-3 sm:px-4 lg:px-6">
          {/* Widget de saludo - Solo visible en desktop */}
          <div className="hidden md:block pt-3 pb-2">
            <GreetingWidget 
              userName={displayName}
            />
          </div>

          {/* Header superior */}
          <div className="flex justify-between items-center h-12 sm:h-14 lg:h-16">
            {/* Logo y nombre - CON NUEVOS COLORES */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Botón para abrir menú */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMenuToggle}
                className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-white/20 transition-all duration-300 text-white backdrop-blur-sm"
                aria-label="Abrir menú"
              >
                <Menu size={18} className="sm:w-[20px] sm:h-[20px] lg:w-[22px] lg:h-[22px]" />
              </motion.button>

              {/* Logo - CON NUEVO COLOR (blanco con destello) */}
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
                <div className="relative">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
                    <Edit3 size={16} className="sm:w-[20px] sm:h-[20px] lg:w-[22px] lg:h-[22px] text-emerald-600" />
                  </div>
                  <Star className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400 fill-yellow-400 animate-pulse" />
                </div>
                
                {/* Nombre de la aplicación - CON NUEVOS COLORES */}
                <div className="flex flex-col">
                  <span className="text-sm sm:text-xl lg:text-2xl font-bold text-white drop-shadow-lg tracking-tight">
                    TodoAppManager
                  </span>
                  <span className="text-[0.5rem] sm:text-[0.6rem] bg-white/20 text-white/90 px-1 sm:px-1.5 py-0.5 rounded-full border border-white/30 inline-block w-fit leading-none backdrop-blur-sm">
                    organiza tu día
                  </span>
                </div>
              </Link>
            </div>

            {/* Acciones derecha */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Barra de búsqueda móvil */}
              <div className="relative md:hidden">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/70 w-3.5 h-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  placeholder="Buscar..."
                  className="w-28 sm:w-32 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full py-1.5 pl-7 pr-2 text-xs text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 transition-all"
                />
              </div>

              {/* Theme Toggle */}
              <div className="scale-90 sm:scale-95">
                <ThemeToggle />
              </div>
              
              {/* Notificaciones */}
              <div className="relative" ref={notificationsDropdownRef}>
                <motion.button
                  ref={notificationsButtonRef}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-white/20 transition-all duration-300 text-white backdrop-blur-sm"
                  aria-label="Notificaciones"
                >
                  <Bell size={18} className="sm:w-[20px] sm:h-[20px]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-yellow-400 text-emerald-800 text-[9px] sm:text-[10px] w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center rounded-full shadow-lg animate-pulse font-bold">
                      {unreadCount}
                    </span>
                  )}
                </motion.button>

                {/* Dropdown de notificaciones */}
                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-[20rem] sm:w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl py-1 border border-gray-200/50 dark:border-gray-800/50 z-50"
                      style={{ zIndex: 9999 }}
                    >
                      <div className="px-3 sm:px-4 py-2 border-b border-gray-200/50 dark:border-gray-800/50 flex justify-between items-center">
                        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                          <Bell size={12} className="text-emerald-500" />
                          Notificaciones
                        </h3>
                        {notifications.length > 0 && (
                          <button
                            onClick={onClearAllNotifications}
                            className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium transition-colors"
                          >
                            Limpiar todo
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 sm:max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="text-center py-6 sm:py-8 px-4">
                            <Bell size={24} className="sm:w-[28px] sm:h-[28px] text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">No hay notificaciones</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all cursor-pointer border-b border-gray-100/50 dark:border-gray-800/50 last:border-b-0 ${
                                !notification.read ? 'bg-emerald-50/30 dark:bg-emerald-900/20' : ''
                              }`}
                              onClick={() => onMarkNotificationAsRead?.(notification.id)}
                            >
                              <div className="flex items-start gap-2">
                                <div className="mt-0.5">
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-800 dark:text-gray-200">
                                    {getNotificationMessage(notification)}
                                  </p>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                    <Clock size={8} />
                                    {formatTimestamp(notification.timestamp)}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full mt-1 flex-shrink-0"></div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Botón para abrir menú lateral derecho */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsRightMenuOpen(true)}
                className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg sm:rounded-xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                aria-label="Abrir menú rápido"
                title="Menú rápido"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl overflow-hidden shadow-md ring-2 ring-white/50">
                  {avatarUrl && !avatarError ? (
                    <img 
                      src={avatarUrl} 
                      alt={displayName}
                      className="w-full h-full object-cover"
                      onError={handleAvatarError}
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${getAvatarColor()} flex items-center justify-center text-white text-xs sm:text-sm font-bold`}>
                      {getInitials()}
                    </div>
                  )}
                </div>
                <ChevronDown size={14} className="sm:w-[16px] sm:h-[16px] text-white" />
              </motion.button>
            </div>
          </div>

          {/* Barra de búsqueda desktop */}
          <div className="hidden md:block pb-3">
            <div className="flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={14} className="text-white/70" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  placeholder="Buscar tareas por título o descripción..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white/20 backdrop-blur-sm border border-white/30 rounded-full focus:ring-2 focus:ring-white/50 transition-all text-white placeholder-white/60 shadow-md"
                />
              </div>
            </div>
          </div>

          {/* Versión MÓVIL - Widget compacto */}
          <div className="md:hidden pb-3">
            <GreetingWidget 
              userName={displayName}
              compact={true}
            />
          </div>
        </div>
      </motion.header>
    </>
  );
};

export default Header;