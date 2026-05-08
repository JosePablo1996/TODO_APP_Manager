// src/components/LeftMenu.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard,
  Archive,
  Star,
  Settings,
  LogOut,
  X,
  CheckSquare,
  Calendar,
  BarChart3,
  HelpCircle,
  Mail,
  Shield,
  AlertCircle,
  ChevronRight,
  Sparkles,
  User,
  TrendingUp,
  FolderOpen,
  Plus,
  Trash2
} from 'lucide-react';
import type { UserProfile } from '../services/authService';

interface LeftMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onLogout: () => void;
}

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  badge?: number | string;
  description?: string;
}

interface MenuSection {
  title: string;
  icon?: React.ReactNode;
  hidden?: boolean;
  items: MenuItem[];
}

const LeftMenu: React.FC<LeftMenuProps> = ({ isOpen, onClose, user, onLogout }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  // Obtener nombre para mostrar
  const displayName = React.useMemo(() => {
    if (user?.full_name) return user.full_name;
    if (user?.username) return user.username;
    return 'Usuario';
  }, [user]);

  // Obtener email para mostrar
  const displayEmail = React.useMemo(() => {
    if (user?.email) return user.email;
    return 'usuario@todoapp.com';
  }, [user]);

  // Obtener avatar URL
  const avatarUrl = user?.avatar;

  // Obtener roles
  const userRoles = React.useMemo(() => {
    return user?.email === 'admin@todoapp.com' ? ['admin'] : ['user'];
  }, [user]);

  // Obtener iniciales para avatar por defecto
  const getInitials = (): string => {
    if (displayName === 'Usuario') return 'U';
    
    const nameParts = displayName.split(' ').filter(part => part.length > 0);
    
    if (nameParts.length === 0) return 'U';
    
    if (nameParts.length === 1) {
      const singleName = nameParts[0];
      return singleName.substring(0, Math.min(2, singleName.length)).toUpperCase();
    }
    
    return (nameParts[0][0] + (nameParts[1] ? nameParts[1][0] : '')).toUpperCase();
  };

  // Obtener color de fondo basado en el nombre del usuario
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
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleAvatarError = () => {
    setAvatarError(true);
  };

  const menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: '/dashboard',
      color: 'emerald',
      description: 'Resumen de actividades',
    },
    {
      label: 'Mis Tareas',
      icon: <CheckSquare className="w-5 h-5" />,
      path: '/tareas',
      color: 'teal',
      description: 'Gestiona tus tareas',
      badge: 0,
    },
    {
      label: 'Crear Tarea',
      icon: <Plus className="w-5 h-5" />,
      path: '/crear-tarea',
      color: 'emerald',
      description: 'Crear una nueva tarea',
    },
    {
      label: 'Calendario',
      icon: <Calendar className="w-5 h-5" />,
      path: '/calendario',
      color: 'cyan',
      description: 'Vista mensual',
    },
    {
      label: 'Favoritos',
      icon: <Star className="w-5 h-5" />,
      path: '/favoritos',
      color: 'amber',
      description: 'Tareas importantes',
    },
    {
      label: 'Archivados',
      icon: <Archive className="w-5 h-5" />,
      path: '/archivados',
      color: 'gray',
      description: 'Tareas completadas',
    },
    {
      label: 'Papelera',
      icon: <Trash2 className="w-5 h-5" />,
      path: '/papelera',
      color: 'gray',
      description: 'Tareas eliminadas',
    },
    {
      label: 'Estadísticas',
      icon: <TrendingUp className="w-5 h-5" />,
      path: '/estadisticas',
      color: 'indigo',
      description: 'Análisis de progreso',
    },
    {
      label: 'Configuración',
      icon: <Settings className="w-5 h-5" />,
      path: '/configuracion',
      color: 'slate',
      description: 'Ajustes de cuenta',
    },
    {
      label: 'Ayuda',
      icon: <HelpCircle className="w-5 h-5" />,
      path: '/ayuda',
      color: 'purple',
      description: 'Centro de ayuda',
    },
  ];

  const menuSections: MenuSection[] = [
    {
      title: 'Principal',
      icon: <Sparkles className="w-4 h-4" />,
      items: menuItems.slice(0, 3),
    },
    {
      title: 'Organización',
      icon: <FolderOpen className="w-4 h-4" />,
      items: menuItems.slice(3, 7),
    },
    {
      title: 'Análisis',
      icon: <BarChart3 className="w-4 h-4" />,
      items: [menuItems[7]],
    },
    {
      title: 'Configuración',
      icon: <Settings className="w-4 h-4" />,
      items: menuItems.slice(8, 10),
    },
  ];

  const getColorClasses = (color: string): { bg: string; hover: string; text: string; border: string; gradient: string } => {
    const colors: Record<string, { bg: string; hover: string; text: string; border: string; gradient: string }> = {
      emerald: { 
        bg: 'bg-emerald-500/10', 
        hover: 'hover:bg-emerald-500/20', 
        text: 'text-emerald-400', 
        border: 'border-emerald-500/20',
        gradient: 'from-emerald-500 to-teal-500'
      },
      teal: { 
        bg: 'bg-teal-500/10', 
        hover: 'hover:bg-teal-500/20', 
        text: 'text-teal-400', 
        border: 'border-teal-500/20',
        gradient: 'from-teal-500 to-cyan-500'
      },
      cyan: { 
        bg: 'bg-cyan-500/10', 
        hover: 'hover:bg-cyan-500/20', 
        text: 'text-cyan-400', 
        border: 'border-cyan-500/20',
        gradient: 'from-cyan-500 to-blue-500'
      },
      amber: { 
        bg: 'bg-amber-500/10', 
        hover: 'hover:bg-amber-500/20', 
        text: 'text-amber-400', 
        border: 'border-amber-500/20',
        gradient: 'from-amber-500 to-orange-500'
      },
      gray: { 
        bg: 'bg-gray-500/10', 
        hover: 'hover:bg-gray-500/20', 
        text: 'text-gray-400', 
        border: 'border-gray-500/20',
        gradient: 'from-gray-500 to-gray-600'
      },
      indigo: { 
        bg: 'bg-indigo-500/10', 
        hover: 'hover:bg-indigo-500/20', 
        text: 'text-indigo-400', 
        border: 'border-indigo-500/20',
        gradient: 'from-indigo-500 to-purple-500'
      },
      slate: { 
        bg: 'bg-slate-500/10', 
        hover: 'hover:bg-slate-500/20', 
        text: 'text-slate-400', 
        border: 'border-slate-500/20',
        gradient: 'from-slate-500 to-gray-500'
      },
      purple: { 
        bg: 'bg-purple-500/10', 
        hover: 'hover:bg-purple-500/20', 
        text: 'text-purple-400', 
        border: 'border-purple-500/20',
        gradient: 'from-purple-500 to-pink-500'
      },
    };
    return colors[color] || colors.emerald;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleOverlayKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay con degradado y blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-label="Cerrar menú"
        role="button"
        tabIndex={0}
        onKeyDown={handleOverlayKeyDown}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/60 via-teal-900/40 to-cyan-900/60 backdrop-blur-md" />
      </motion.div>
      
      {/* Menú lateral - SIN BORDE */}
      <motion.div
        initial={{ x: -400 }}
        animate={{ x: 0 }}
        exit={{ x: -400 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed top-0 left-0 h-full w-96 z-50 overflow-y-auto bg-gray-900/95 backdrop-blur-xl shadow-2xl rounded-r-3xl"
      >
        {/* Header del menú con gradiente estilo Supabase */}
        <div className="sticky top-0 z-20 p-4">
          <div className="relative h-56 rounded-2xl overflow-hidden">
            {/* Fondo con gradiente Supabase */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600"></div>
            
            {/* Efectos decorativos */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
            
            {/* Botón de cerrar */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-200 border border-white/30 z-30"
              aria-label="Cerrar menú"
              title="Cerrar menú"
            >
              <X className="w-4 h-4 text-white" />
            </motion.button>

            {/* Contenido del header */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* Avatar clickeable */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  navigate('/perfil');
                  onClose();
                }}
                className="relative group mb-3"
                aria-label="Ir a mi perfil"
              >
                <div className="w-24 h-24 rounded-full border-4 border-white/50 overflow-hidden shadow-xl ring-4 ring-white/30">
                  {avatarUrl && !avatarError ? (
                    <img 
                      src={avatarUrl} 
                      alt={displayName} 
                      className="w-full h-full object-cover"
                      onError={handleAvatarError}
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${getAvatarColor()} flex items-center justify-center text-white text-3xl font-bold`}>
                      {getInitials()}
                    </div>
                  )}
                </div>
                {/* Badge de edición */}
                <div className="absolute -bottom-1 -right-1 p-1.5 bg-white/30 backdrop-blur-sm rounded-full border border-white/50">
                  <User className="w-3 h-3 text-white" />
                </div>
              </motion.button>

              {/* Nombre del usuario */}
              <motion.h2 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-bold text-white mb-1 drop-shadow-lg"
              >
                {displayName}
              </motion.h2>

              {/* Email del usuario */}
              <motion.p 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-sm text-white/80 mb-2 drop-shadow flex items-center gap-1"
              >
                <Mail className="w-3 h-3" />
                {displayEmail}
              </motion.p>

              {/* Rol del usuario */}
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm border border-white/30"
              >
                <Shield className="w-3 h-3 text-white/80" />
                <span className="text-xs text-white/80">
                  {userRoles.includes('admin') ? 'Administrador' : 'Usuario'}
                </span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Contenido del menú */}
        <div className="px-4 pb-6 relative z-10">
          {/* Secciones del menú */}
          <AnimatePresence mode="wait">
            {menuSections.map((section, idx) => {
              if (section.hidden) return null;
              
              return (
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
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
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
                      const colors = getColorClasses(item.color);
                      const isHovered = hoveredItem === `${idx}-${itemIdx}`;
                      
                      return (
                        <motion.button
                          key={itemIdx}
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          onHoverStart={() => setHoveredItem(`${idx}-${itemIdx}`)}
                          onHoverEnd={() => setHoveredItem(null)}
                          onClick={() => handleNavigation(item.path)}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative overflow-hidden group"
                          aria-label={`Ir a ${item.label}`}
                          title={item.label}
                        >
                          {/* Efecto de hover gradiente */}
                          {isHovered && (
                            <motion.div
                              layoutId="hoverBackground"
                              className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} opacity-10`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.1 }}
                              exit={{ opacity: 0 }}
                            />
                          )}
                          
                          {/* Icono con fondo */}
                          <div className={`relative z-10 p-2 rounded-xl ${colors.bg} transition-all duration-200 group-hover:scale-110`}>
                            <span className={colors.text}>
                              {item.icon}
                            </span>
                          </div>
                          
                          {/* Label y descripción */}
                          <div className="flex-1 text-left relative z-10">
                            <span className="block text-sm font-medium text-gray-200">
                              {item.label}
                            </span>
                            {item.description && (
                              <span className="block text-xs mt-0.5 text-gray-500">
                                {item.description}
                              </span>
                            )}
                          </div>
                          
                          {/* Badge para contadores */}
                          {item.badge !== undefined && item.badge !== null && (
                            <>
                              {typeof item.badge === 'number' && item.badge > 0 ? (
                                <span className={`relative z-10 px-2 py-0.5 rounded-lg text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
                                  {item.badge}
                                </span>
                              ) : typeof item.badge === 'number' && item.badge === 0 ? (
                                <span className={`relative z-10 px-2 py-0.5 rounded-lg text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20`}>
                                  0
                                </span>
                              ) : (
                                item.badge
                              )}
                            </>
                          )}
                          
                          {/* Flecha decorativa */}
                          <ChevronRight className={`relative z-10 w-4 h-4 transition-all duration-200 text-gray-600 group-hover:translate-x-1 ${colors.text}`} />
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Sección de cierre de sesión */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <div className="border-t border-gray-800 my-4"></div>
            
            <motion.button
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setHoveredItem('logout')}
              onHoverEnd={() => setHoveredItem(null)}
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative overflow-hidden group"
            >
              {hoveredItem === 'logout' && (
                <motion.div
                  layoutId="hoverBackground"
                  className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 opacity-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.1 }}
                  exit={{ opacity: 0 }}
                />
              )}
              
              <div className="relative z-10 p-2 rounded-xl bg-red-500/10 transition-all duration-200 group-hover:scale-110">
                <LogOut className="w-5 h-5 text-red-400" />
              </div>
              
              <div className="flex-1 text-left relative z-10">
                <span className="block text-sm font-medium text-red-400">
                  Cerrar Sesión
                </span>
                <span className="block text-xs mt-0.5 text-gray-500">
                  Salir de tu cuenta
                </span>
              </div>
              
              <AlertCircle className="relative z-10 w-4 h-4 text-red-400/50" />
            </motion.button>
          </motion.div>

          {/* Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 pt-4 border-t border-gray-800"
          >
            <div className="flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <p className="text-xs text-center text-gray-500">
                TodoAppManager v2.6.0 · Supabase Edition
              </p>
            </div>
            <p className="text-xs text-center text-gray-600 mt-1">
              Tu espacio de tareas personal
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
            {/* Overlay del modal */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleCancelLogout}
            />
            
            {/* Contenido del modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md rounded-2xl overflow-hidden bg-gray-800/95 backdrop-blur-xl border-2 border-white/30 shadow-2xl"
            >
              {/* Header con gradiente */}
              <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <LogOut className="w-6 h-6" />
                  Cerrar sesión
                </h3>
              </div>

              <div className="p-6">
                {/* Avatar centrado */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="p-0.5 bg-gradient-to-r from-red-400 to-pink-400 rounded-full">
                      {avatarUrl && !avatarError ? (
                        <img 
                          src={avatarUrl} 
                          alt={displayName} 
                          className="w-20 h-20 rounded-full object-cover"
                          onError={handleAvatarError}
                        />
                      ) : (
                        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getAvatarColor()} flex items-center justify-center text-white text-2xl font-bold`}>
                          {getInitials()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mensaje de confirmación */}
                <div className="text-center mb-6">
                  <p className="text-lg font-semibold text-white mb-2">
                    ¿Cerrar sesión, {displayName.split(' ')[0]}?
                  </p>
                  <p className="text-sm text-gray-400">
                    Podrás volver a iniciar sesión cuando quieras
                  </p>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancelLogout}
                    disabled={isLoggingOut}
                    className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors disabled:opacity-50 font-medium"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirmLogout}
                    disabled={isLoggingOut}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all disabled:opacity-50 font-medium flex items-center justify-center gap-2"
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
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LeftMenu;