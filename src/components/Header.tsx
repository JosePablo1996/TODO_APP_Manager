// src/components/Header.tsx
import { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LeftMenu from './LeftMenu';
import RightMenu from './RightMenu';
import ThemeToggle from './ThemeToggle';
import { 
  Bell,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Check,
  Menu,
  Sun,
  Moon,
  Star,
  Edit3,
  Sparkles,
  Calendar,
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
}

const Header: React.FC<HeaderProps> = ({ 
  user, 
  onLogout, 
  notifications = [],
  onMarkNotificationAsRead,
  onClearAllNotifications,
  onSearch
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);
  const [isRightMenuOpen, setIsRightMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  
  const notificationsDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notificationsButtonRef = useRef<HTMLButtonElement>(null);

  // Determinar saludo según la hora
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const dayName = new Date().toLocaleDateString('es-ES', { weekday: 'long' });
    const formattedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    const date = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
    
    if (hour >= 5 && hour < 12) {
      return { 
        text: 'Buenos días', 
        icon: <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />,
        bgColor: 'bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-cyan-500/20',
        borderColor: 'border-emerald-200/50 dark:border-emerald-700/30',
        textColor: 'text-emerald-700 dark:text-emerald-300',
        accentColor: 'text-emerald-500',
        day: formattedDay,
        date: date,
        gradient: 'from-emerald-500 to-teal-500'
      };
    } else if (hour >= 12 && hour < 19) {
      return { 
        text: 'Buenas tardes', 
        icon: <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />,
        bgColor: 'bg-gradient-to-r from-teal-500/20 via-cyan-500/15 to-teal-500/20',
        borderColor: 'border-teal-200/50 dark:border-teal-700/30',
        textColor: 'text-teal-700 dark:text-teal-300',
        accentColor: 'text-teal-500',
        day: formattedDay,
        date: date,
        gradient: 'from-teal-500 to-cyan-500'
      };
    } else {
      return { 
        text: 'Buenas noches', 
        icon: <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />,
        bgColor: 'bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-indigo-500/20',
        borderColor: 'border-cyan-200/50 dark:border-cyan-700/30',
        textColor: 'text-cyan-700 dark:text-cyan-300',
        accentColor: 'text-cyan-500',
        day: formattedDay,
        date: date,
        gradient: 'from-cyan-500 to-blue-500'
      };
    }
  }, []);

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

  const handleAvatarError = () => {
    setAvatarError(true);
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
        className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-800/50"
      >
        <div className="mx-auto px-3 sm:px-4 lg:px-6">
          {/* Header superior - RESPONSIVE */}
          <div className="flex justify-between items-center h-12 sm:h-14 lg:h-16">
            {/* Logo y nombre - lado izquierdo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Botón para abrir menú lateral izquierdo */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLeftMenuOpen(true)}
                className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-300 text-gray-600 dark:text-gray-300 backdrop-blur-sm"
                aria-label="Abrir menú"
              >
                <Menu size={18} className="sm:w-[20px] sm:h-[20px] lg:w-[22px] lg:h-[22px]" />
              </motion.button>

              {/* Logo TodoApp - RESPONSIVE */}
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
                <div className="relative">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
                    <Edit3 size={16} className="sm:w-[20px] sm:h-[20px] lg:w-[22px] lg:h-[22px] text-white" />
                  </div>
                  <Star className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400 fill-yellow-400 animate-pulse" />
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent leading-tight">
                    TodoAppManager
                  </span>
                  <span className="text-[0.5rem] sm:text-[0.6rem] bg-emerald-100/80 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-1 sm:px-1.5 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50 inline-block w-fit leading-none backdrop-blur-sm">
                    organiza tu día
                  </span>
                </div>
              </Link>
            </div>

            {/* Acciones derecha - RESPONSIVE */}
            <div className="flex items-center space-x-1 sm:space-x-2">
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
                  className="relative p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-300 text-gray-600 dark:text-gray-300 backdrop-blur-sm"
                  aria-label="Notificaciones"
                >
                  <Bell size={18} className="sm:w-[20px] sm:h-[20px]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-[9px] sm:text-[10px] w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center rounded-full shadow-lg animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </motion.button>

                {/* Dropdown de notificaciones - RESPONSIVE */}
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

              {/* Botón para abrir menú lateral derecho - RESPONSIVE */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsRightMenuOpen(true)}
                className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg sm:rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-300 backdrop-blur-sm"
                aria-label="Abrir menú rápido"
                title="Menú rápido"
              >
                {/* Avatar pequeño - RESPONSIVE */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl overflow-hidden shadow-md ring-2 ring-white/50 dark:ring-gray-700/50">
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
                <ChevronDown size={14} className="sm:w-[16px] sm:h-[16px] text-gray-500" />
              </motion.button>
            </div>
          </div>

          {/* Barra de búsqueda con saludo - DESKTOP (md+) */}
          <div className="hidden md:block pb-3 lg:pb-4 relative z-10">
            {/* Saludo */}
            <div className="flex justify-center mb-2 lg:mb-3">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className={`inline-flex items-center gap-2 lg:gap-3 px-3 lg:px-5 py-1.5 lg:py-2 rounded-full border backdrop-blur-sm ${greeting.bgColor} ${greeting.borderColor} shadow-lg`}
              >
                <div className={`p-1 lg:p-1.5 rounded-full bg-white/60 dark:bg-gray-800/60 ${greeting.accentColor}`}>
                  {greeting.icon}
                </div>
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-1.5 lg:gap-2">
                    <span className={`text-sm lg:text-base font-bold ${greeting.textColor}`}>
                      {greeting.text}
                    </span>
                    <Sparkles size={12} className={`lg:w-[14px] lg:h-[14px] ${greeting.accentColor}`} />
                  </div>
                  <div className="flex items-center gap-1.5 lg:gap-2 text-[10px] lg:text-xs">
                    <Calendar size={9} className={`lg:w-[10px] lg:h-[10px] ${greeting.accentColor}`} />
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      {greeting.day}
                    </span>
                    <span className="text-gray-400 dark:text-gray-500">•</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {greeting.date}
                    </span>
                  </div>
                </div>
                <div className={`text-xs lg:text-sm font-semibold bg-gradient-to-r ${greeting.gradient} text-white px-2 lg:px-3 py-0.5 lg:py-1 rounded-full backdrop-blur-sm shadow-md`}>
                  {displayName.split(' ')[0]}
                </div>
              </motion.div>
            </div>

            {/* Barra de búsqueda */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-xl lg:max-w-2xl">
                <div className="absolute inset-y-0 left-0 pl-3 lg:pl-4 flex items-center pointer-events-none">
                  <Search size={16} className="lg:w-[18px] lg:h-[18px] text-gray-400" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  placeholder="Buscar tareas por título o descripción..."
                  className="w-full pl-10 lg:pl-12 pr-4 py-2 lg:py-3 text-sm bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-full focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-400/50 transition-all text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 shadow-md"
                />
              </div>
            </div>
          </div>

          {/* Versión MÓVIL (menor a md) - RESPONSIVE */}
          <div className="md:hidden pb-2 sm:pb-3 relative z-10">
            {/* Saludo para móvil - COMPACTO */}
            <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border backdrop-blur-sm ${greeting.bgColor} ${greeting.borderColor} mb-2 sm:mb-3 w-full`}>
              <div className={`p-1 rounded-full ${greeting.accentColor} flex-shrink-0`}>
                {greeting.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className={`text-[11px] sm:text-sm font-medium ${greeting.textColor} truncate`}>
                    {greeting.text}
                  </span>
                  <span className={`text-[10px] sm:text-xs ${greeting.textColor} opacity-80 truncate`}>
                    {greeting.day}
                  </span>
                </div>
                <span className={`text-[9px] sm:text-[10px] ${greeting.textColor} opacity-60 block`}>
                  {greeting.date}
                </span>
              </div>
              <span className={`text-[10px] sm:text-xs font-semibold bg-gradient-to-r ${greeting.gradient} text-white px-2 py-0.5 rounded-full backdrop-blur-sm flex-shrink-0`}>
                {displayName.split(' ')[0]}
              </span>
            </div>
            
            {/* Búsqueda móvil */}
            <div className="relative">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-[14px] h-[14px] sm:w-[16px] sm:h-[16px]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="Buscar tareas..."
                className="w-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-full py-2 sm:py-2.5 pl-8 sm:pl-9 pr-3 text-[13px] sm:text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-400/50 transition-all text-gray-700 dark:text-gray-200"
              />
            </div>
          </div>
        </div>
      </motion.header>
    </>
  );
};

export default Header;