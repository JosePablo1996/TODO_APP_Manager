// src/pages/ProfilePage.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { useThemeClasses } from '../hooks/useThemeClasses';
import { motion, AnimatePresence } from 'framer-motion';
import authService from '../services/authService';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Image as ImageIcon,
  ListTodo,
  BarChart3,
  Sparkles,
  Trash2,
  AlertCircle,
  CheckCircle,
  Heart
} from 'lucide-react';

// ============================================
// TIPOS
// ============================================

import type { UserProfile } from '../hooks/useAuth';

interface DeleteConfirmState {
  type: 'avatar' | 'banner' | null;
  visible: boolean;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
}

interface ProfileUpdates {
  full_name?: string;
  bio?: string;
  avatar?: string;
  banner?: string;
}

// ============================================
// COMPONENTES LOCALES
// ============================================

const LoadingSpinner: React.FC<{ size?: 'sm' | 'lg' | 'md'; text?: string }> = ({ size = 'md', text }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className={`${sizeClasses[size]} border-2 border-emerald-600 border-t-transparent rounded-full animate-spin`} />
      {text && <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>}
    </div>
  );
};

const Toast: React.FC<{
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-cyan-500'
  }[type];

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: AlertCircle
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 right-4 z-50 ${bgColor} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 max-w-md`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateLocalProfile } = useAuth();
  const { tasks } = useTasks();
  const classes = useThemeClasses();

  // Estados para los campos editables
  const [isEditing, setIsEditing] = useState(false);
  const [editedFullName, setEditedFullName] = useState('');
  const [editedBio, setEditedBio] = useState('');

  // Estados para imágenes
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<DeleteConfirmState>({ type: null, visible: false });

  // Estados para notificaciones
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'info', visible: false });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const currentUser = user as UserProfile | null;

  // ============================================
  // FUNCIONES AUXILIARES
  // ============================================

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, visible: true });
  }, []);

  // Calcular estadísticas de tareas
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
  };

  const progressPercentage = taskStats.total > 0
    ? Math.round((taskStats.completed / taskStats.total) * 100)
    : 0;

  // ============================================
  // EFECTOS
  // ============================================

  useEffect(() => {
    if (currentUser) {
      setEditedFullName(currentUser.full_name || currentUser.username || '');
      setEditedBio(currentUser.bio || '');
      if (currentUser.avatar) setAvatarPreview(currentUser.avatar);
      if (currentUser.banner) setBannerPreview(currentUser.banner);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const nameChanged = editedFullName !== (currentUser.full_name || currentUser.username || '');
    const bioChanged = editedBio !== (currentUser.bio || '');
    const avatarChanged = avatarFile !== null;
    const bannerChanged = bannerFile !== null;
    setHasUnsavedChanges(nameChanged || bioChanged || avatarChanged || bannerChanged);
  }, [editedFullName, editedBio, avatarFile, bannerFile, currentUser]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // ============================================
  // FUNCIONES DE MANEJO DE ARCHIVOS
  // ============================================

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('El avatar no debe exceder 2MB', 'error');
        return;
      }
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        showToast('Tipo de archivo no válido. Usa JPG, PNG o WEBP', 'error');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('El banner no debe exceder 5MB', 'error');
        return;
      }
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        showToast('Tipo de archivo no válido. Usa JPG, PNG o WEBP', 'error');
        return;
      }
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ============================================
  // FUNCIONES DE ACTUALIZACIÓN
  // ============================================

  const updateUserProfile = useCallback(async (updates: ProfileUpdates): Promise<void> => {
    await authService.updateProfile(updates);
    updateLocalProfile(updates);
  }, [updateLocalProfile]);

  const uploadImage = useCallback(async (file: File, type: 'avatar' | 'banner'): Promise<string> => {
    let result;
    if (type === 'avatar') {
      result = await authService.uploadAvatar(file);
    } else {
      result = await authService.uploadBanner(file);
    }
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return result.url || '';
  }, []);

  const deleteImage = useCallback(async (type: 'avatar' | 'banner'): Promise<void> => {
    if (type === 'avatar') {
      await authService.deleteAvatar();
    } else {
      await authService.deleteBanner();
    }
  }, []);

  // ============================================
  // MANEJADORES DE ACCIONES
  // ============================================

  const handleUploadAvatar = useCallback(async () => {
    if (!avatarFile) return;
    setIsUploadingAvatar(true);
    setUploadError(null);

    try {
      const url = await uploadImage(avatarFile, 'avatar');
      setAvatarPreview(url);
      setAvatarFile(null);
      await updateUserProfile({ avatar: url });
      showToast('Avatar actualizado correctamente', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al subir el avatar';
      setUploadError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  }, [avatarFile, uploadImage, updateUserProfile, showToast]);

  const handleUploadBanner = useCallback(async () => {
    if (!bannerFile) return;
    setIsUploadingBanner(true);
    setUploadError(null);

    try {
      const url = await uploadImage(bannerFile, 'banner');
      setBannerPreview(url);
      setBannerFile(null);
      await updateUserProfile({ banner: url });
      showToast('Banner actualizado correctamente', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al subir el banner';
      setUploadError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsUploadingBanner(false);
    }
  }, [bannerFile, uploadImage, updateUserProfile, showToast]);

  const handleDeleteAvatar = useCallback(async () => {
    setIsUploadingAvatar(true);
    try {
      await deleteImage('avatar');
      setAvatarPreview('');
      setShowDeleteConfirm({ type: null, visible: false });
      await updateUserProfile({ avatar: '' });
      showToast('Avatar eliminado correctamente', 'success');
    } catch {
      showToast('Error al eliminar el avatar', 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  }, [deleteImage, updateUserProfile, showToast]);

  const handleDeleteBanner = useCallback(async () => {
    setIsUploadingBanner(true);
    try {
      await deleteImage('banner');
      setBannerPreview('');
      setShowDeleteConfirm({ type: null, visible: false });
      await updateUserProfile({ banner: '' });
      showToast('Banner eliminado correctamente', 'success');
    } catch {
      showToast('Error al eliminar el banner', 'error');
    } finally {
      setIsUploadingBanner(false);
    }
  }, [deleteImage, updateUserProfile, showToast]);

  const handleSaveProfile = useCallback(async () => {
    try {
      if (avatarFile) await handleUploadAvatar();
      if (bannerFile) await handleUploadBanner();

      if (editedFullName !== (currentUser?.full_name || currentUser?.username || '') || editedBio !== (currentUser?.bio || '')) {
        await updateUserProfile({ full_name: editedFullName, bio: editedBio });
      }

      showToast('Perfil actualizado correctamente', 'success');
      setIsEditing(false);
      setHasUnsavedChanges(false);
    } catch (err) {
      showToast(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`, 'error');
    }
  }, [avatarFile, bannerFile, editedFullName, editedBio, currentUser, handleUploadAvatar, handleUploadBanner, updateUserProfile, showToast]);

  const handleCancelEdit = useCallback(() => {
    if (currentUser) {
      setEditedFullName(currentUser.full_name || currentUser.username || '');
      setEditedBio(currentUser.bio || '');
      setAvatarPreview(currentUser.avatar || '');
      setBannerPreview(currentUser.banner || '');
    }
    setAvatarFile(null);
    setBannerFile(null);
    setUploadError(null);
    setIsEditing(false);
    setHasUnsavedChanges(false);
  }, [currentUser]);

  const confirmDelete = useCallback((type: 'avatar' | 'banner') => {
    setShowDeleteConfirm({ type, visible: true });
  }, []);

  const cancelDelete = useCallback(() => {
    setShowDeleteConfirm({ type: null, visible: false });
  }, []);

  // ============================================
  // UTILIDADES DE FORMATO
  // ============================================

  const formatJoinDate = useCallback((): string => {
    if (currentUser?.created_at) {
      return new Date(currentUser.created_at).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    }
    return new Date().toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }, [currentUser]);

  const getDisplayName = useCallback((): string => {
    if (currentUser?.full_name) return currentUser.full_name;
    if (currentUser?.username) return currentUser.username;
    return 'Usuario';
  }, [currentUser]);

  const getInitials = useCallback((): string => {
    const displayName = getDisplayName();
    if (displayName === 'Usuario') return 'U';
    return displayName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }, [getDisplayName]);

  const getAvatarGradient = useCallback((): string => {
    const displayName = getDisplayName();
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
    return gradients[charCodeSum % gradients.length];
  }, [getDisplayName]);

  // ============================================
  // RENDER
  // ============================================

  if (!currentUser) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${classes.bg.primary}`}>
        <LoadingSpinner size="lg" text="Cargando perfil..." />
      </div>
    );
  }

  const displayName = getDisplayName();

  return (
    <div className={`min-h-screen ${classes.bg.primary} transition-colors duration-300`}>
      <AnimatePresence>
        {toast.visible && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(prev => ({ ...prev, visible: false }))}
          />
        )}
      </AnimatePresence>

      {/* Header - Mejorado */}
      <div className={`sticky top-0 z-10 backdrop-blur-xl border-b ${classes.border.primary} ${classes.bg.card}/90`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (hasUnsavedChanges && !window.confirm('Tienes cambios sin guardar. ¿Estás seguro?')) return;
                  navigate(-1);
                }}
                className={`p-2 rounded-xl transition-all duration-200 ${classes.bg.hover} group`}
                aria-label="Volver"
              >
                <ArrowLeft className={`w-5 h-5 ${classes.icon.secondary} group-hover:${classes.icon.primary} transition-colors`} />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div className="w-1 h-7 bg-gradient-to-b from-emerald-500 via-teal-500 to-cyan-500 rounded-full" />
                <h1 className={`text-xl font-bold flex items-center gap-2 ${classes.text.primary}`}>
                  <User className="w-5 h-5 text-emerald-500" />
                  Mi Perfil
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 flex items-center gap-2 font-medium"
                >
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">Editar perfil</span>
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancelEdit}
                    className={`px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 font-medium border ${classes.border.primary} ${classes.bg.hover}`}
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Cancelar</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveProfile}
                    disabled={!hasUnsavedChanges || isUploadingAvatar || isUploadingBanner}
                    className={`px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all duration-200 ${
                      hasUnsavedChanges && !isUploadingAvatar && !isUploadingBanner
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-emerald-500/20'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                    }`}
                  >
                    {isUploadingAvatar || isUploadingBanner ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span className="hidden sm:inline">Guardar</span>
                      </>
                    )}
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de cambios sin guardar - Mejorado */}
      <AnimatePresence>
        {hasUnsavedChanges && !isUploadingAvatar && !isUploadingBanner && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-20">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-amber-500 text-white px-5 py-2.5 rounded-full shadow-lg text-sm flex items-center gap-2 backdrop-blur-sm"
            >
              <AlertCircle className="w-4 h-4" />
              Tienes cambios sin guardar
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contenido principal */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`relative overflow-hidden rounded-3xl ${classes.bg.card} backdrop-blur-xl border ${classes.border.primary} shadow-xl hover:shadow-2xl transition-shadow duration-300`}
        >
          {/* Banner - Mejorado */}
          <div className="relative h-56 sm:h-64 md:h-80 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
            {bannerPreview ? (
              <img 
                src={bannerPreview} 
                alt="Banner de perfil" 
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={() => {
                  setBannerPreview('');
                  showToast('Error al cargar la imagen del banner', 'error');
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-emerald-600/80 via-teal-600/80 to-cyan-600/80">
                <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-white/40" />
              </div>
            )}
            
            {isEditing && (
              <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/40 opacity-0 hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => bannerInputRef.current?.click()}
                  className="px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center gap-2 font-medium border border-white/20"
                  disabled={isUploadingBanner}
                >
                  {isUploadingBanner ? <LoadingSpinner size="sm" /> : <><Camera className="w-5 h-5" /><span>Cambiar banner</span></>}
                </motion.button>
                {bannerPreview && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => confirmDelete('banner')}
                    className="px-6 py-3 bg-red-500/80 backdrop-blur-md text-white rounded-xl hover:bg-red-600/90 transition-all duration-200 flex items-center gap-2 font-medium border border-red-400/20"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>Eliminar</span>
                  </motion.button>
                )}
              </div>
            )}
            
            {isUploadingBanner && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <LoadingSpinner size="md" text="Subiendo banner..." />
              </div>
            )}
            
            <input
              type="file"
              ref={bannerInputRef}
              onChange={handleBannerChange}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              aria-label="Subir imagen de banner"
              title="Seleccionar imagen para banner"
            />
          </div>

          {/* Avatar - Mejorado */}
          <div className="relative px-6 pb-8">
            <div className="flex flex-col items-center -mt-14 sm:-mt-16 md:-mt-20">
              <div className="relative group">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="relative"
                >
                  <div className={`w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-gray-800 shadow-xl bg-gradient-to-br ${getAvatarGradient()} transition-all duration-300`}>
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar de usuario" 
                        className="w-full h-full object-cover"
                        onError={() => {
                          setAvatarPreview('');
                          showToast('Error al cargar la imagen del avatar', 'error');
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                        {getInitials()}
                      </div>
                    )}
                  </div>
                  
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                </motion.div>
                
                {isEditing && !isUploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => avatarInputRef.current?.click()}
                      className="p-3 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/30 transition-all duration-200 border border-white/20"
                    >
                      <Camera className="w-5 h-5" />
                    </motion.button>
                    {avatarPreview && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => confirmDelete('avatar')}
                        className="p-3 bg-red-500/80 backdrop-blur-md rounded-xl text-white hover:bg-red-600/90 transition-all duration-200 border border-red-400/20"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    )}
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarChange}
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                aria-label="Subir imagen de avatar"
                title="Seleccionar imagen para avatar"
              />

              {/* Información del usuario - Mejorada */}
              <div className="mt-5 text-center">
                <h2 className={`text-2xl sm:text-3xl font-bold ${classes.text.primary} tracking-tight`}>
                  {displayName}
                </h2>
                <p className={`text-sm mt-1.5 ${classes.text.secondary} flex items-center justify-center gap-1`}>
                  <Mail className="w-3.5 h-3.5 opacity-60" />
                  {currentUser.email}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                  <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-medium flex items-center gap-1.5 border border-emerald-500/20 backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    {currentUser.email_verified ? 'Verificado' : 'No verificado'}
                  </span>
                  <span className="px-4 py-1.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full text-xs font-medium flex items-center gap-1.5 border border-cyan-500/20 backdrop-blur-sm">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatJoinDate()}
                  </span>
                </div>
              </div>
            </div>

            {/* Mensaje de error - Mejorado */}
            <AnimatePresence>
              {uploadError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm text-center font-medium"
                >
                  {uploadError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Grid de información personal - Mejorado */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-xl border border-emerald-500/15 flex items-center gap-4 hover:border-emerald-500/30 transition-all duration-200">
                <div className="p-3 bg-emerald-500/15 rounded-xl">
                  <User className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <label htmlFor="name-input" className={`text-xs font-medium uppercase tracking-wider ${classes.text.muted} block mb-1`}>
                    Nombre completo
                  </label>
                  {isEditing ? (
                    <input
                      id="name-input"
                      type="text"
                      value={editedFullName}
                      onChange={(e) => setEditedFullName(e.target.value)}
                      className={`w-full bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:border-emerald-500 text-sm font-medium py-1 transition-colors ${classes.text.primary}`}
                      placeholder="Tu nombre"
                    />
                  ) : (
                    <p className={`text-base font-semibold ${classes.text.primary}`}>
                      {displayName}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-5 bg-gradient-to-br from-cyan-500/5 to-teal-500/5 rounded-xl border border-cyan-500/15 flex items-center gap-4 hover:border-cyan-500/30 transition-all duration-200">
                <div className="p-3 bg-cyan-500/15 rounded-xl">
                  <Mail className="w-5 h-5 text-cyan-500" />
                </div>
                <div className="flex-1">
                  <label htmlFor="email-display" className={`text-xs font-medium uppercase tracking-wider ${classes.text.muted} block mb-1`}>
                    Correo electrónico
                  </label>
                  <p id="email-display" className={`text-base font-semibold ${classes.text.primary} truncate`}>
                    {currentUser.email}
                  </p>
                </div>
              </div>

              <div className="p-5 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 rounded-xl border border-teal-500/15 flex items-center gap-4 md:col-span-2 hover:border-teal-500/30 transition-all duration-200">
                <div className="p-3 bg-teal-500/15 rounded-xl">
                  <Sparkles className="w-5 h-5 text-teal-500" />
                </div>
                <div className="flex-1">
                  <label htmlFor="bio-textarea" className={`text-xs font-medium uppercase tracking-wider ${classes.text.muted} block mb-1`}>
                    Biografía
                  </label>
                  {isEditing ? (
                    <textarea
                      id="bio-textarea"
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      rows={2}
                      className={`w-full bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:border-teal-500 text-sm resize-none py-1 transition-colors ${classes.text.primary}`}
                      placeholder="Cuéntanos sobre ti..."
                    />
                  ) : (
                    <p className={`text-sm ${classes.text.secondary} italic`}>
                      {editedBio || 'Sin biografía'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Barra de progreso - Mejorada */}
            {taskStats.total > 0 && (
              <div className="mt-8 p-5 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 rounded-xl border border-emerald-500/15">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/15 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <span className={`text-sm font-semibold uppercase tracking-wider ${classes.text.primary}`}>Progreso general</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-500">{progressPercentage}%</span>
                </div>
                <div 
                  className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={progressPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progreso de tareas: ${progressPercentage}% completado`}
                >
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                  />
                </div>
              </div>
            )}

            {/* Estadísticas - Mejoradas */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className={`text-sm font-semibold uppercase tracking-wider ${classes.text.muted} mb-5 flex items-center gap-2`}>
                <ListTodo className="w-4 h-4 text-emerald-500" />
                Resumen de tareas
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="p-5 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-xl border border-emerald-500/15 text-center hover:border-emerald-500/30 transition-all duration-200"
                >
                  <p className={`text-3xl font-bold ${classes.text.primary}`}>{taskStats.total}</p>
                  <p className={`text-xs font-medium uppercase tracking-wider mt-1 ${classes.text.muted}`}>Totales</p>
                </motion.div>
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="p-5 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-xl border border-green-500/15 text-center hover:border-green-500/30 transition-all duration-200"
                >
                  <p className={`text-3xl font-bold ${classes.text.primary}`}>{taskStats.completed}</p>
                  <p className={`text-xs font-medium uppercase tracking-wider mt-1 ${classes.text.muted}`}>Completadas</p>
                </motion.div>
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="p-5 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-xl border border-amber-500/15 text-center hover:border-amber-500/30 transition-all duration-200"
                >
                  <p className={`text-3xl font-bold ${classes.text.primary}`}>{taskStats.pending}</p>
                  <p className={`text-xs font-medium uppercase tracking-wider mt-1 ${classes.text.muted}`}>Pendientes</p>
                </motion.div>
              </div>
            </div>

            {/* Footer - Mejorado */}
            <div className="text-center pt-5 border-t border-gray-200 dark:border-gray-700 mt-8">
              <div className="flex items-center justify-center gap-2">
                <Heart className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
                <p className={`text-xs font-medium uppercase tracking-wider ${classes.text.muted}`}>Todo App Manager</p>
                <Heart className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal de confirmación - Mejorado */}
      <AnimatePresence>
        {showDeleteConfirm.visible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border ${classes.border.primary}`}
            >
              <h3 className={`text-xl font-bold ${classes.text.primary} mb-3`}>Confirmar eliminación</h3>
              <p className={`${classes.text.secondary} mb-6 leading-relaxed`}>
                ¿Estás seguro de que quieres eliminar tu {showDeleteConfirm.type === 'avatar' ? 'avatar' : 'banner'}? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className={`flex-1 px-4 py-3 rounded-xl transition-all duration-200 font-medium border ${classes.border.primary} ${classes.bg.hover}`}
                >
                  Cancelar
                </button>
                <button
                  onClick={showDeleteConfirm.type === 'avatar' ? handleDeleteAvatar : handleDeleteBanner}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg shadow-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;