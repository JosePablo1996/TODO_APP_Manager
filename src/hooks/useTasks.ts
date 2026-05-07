// src/hooks/useTasks.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import taskService from '../services/taskService';
import type { TaskResponse } from '../services/taskService';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'alta' | 'media' | 'baja';
  category: 'personal' | 'trabajo' | 'estudio' | 'otro';
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  deletedAt?: string;
  color?: string;
}

export const useTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const tasksLoadedRef = useRef(false);
  const isRefreshing = useRef(false);

  const userId = user?.id;

  // ✅ Convertir TaskResponse a Task
  const mapTaskFromApi = (apiTask: TaskResponse): Task => ({
    id: apiTask.id,
    title: apiTask.title,
    description: apiTask.description,
    completed: apiTask.completed,
    priority: (apiTask.priority === 'alta' || apiTask.priority === 'media' || apiTask.priority === 'baja') 
      ? apiTask.priority as 'alta' | 'media' | 'baja' 
      : 'media',
    category: (apiTask.category === 'personal' || apiTask.category === 'trabajo' || apiTask.category === 'estudio')
      ? apiTask.category as 'personal' | 'trabajo' | 'estudio'
      : 'otro',
    createdAt: apiTask.created_at,
    updatedAt: apiTask.updated_at,
    dueDate: apiTask.due_date,
    isFavorite: apiTask.is_favorite || false,
    isArchived: apiTask.is_archived || false,
    deletedAt: apiTask.deleted_at || undefined,
    color: apiTask.color,
  });

  // ✅ Convertir Task a TaskData para enviar al backend
  const mapTaskToApi = (task: Partial<Task>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiData: any = {};
    
    if (task.title !== undefined) apiData.title = task.title;
    if (task.description !== undefined) apiData.description = task.description;
    if (task.completed !== undefined) apiData.completed = task.completed;
    if (task.priority !== undefined) apiData.priority = task.priority;
    if (task.category !== undefined) apiData.category = task.category;
    if (task.dueDate !== undefined) apiData.due_date = task.dueDate;
    if (task.color !== undefined) apiData.color = task.color;
    
    return apiData;
  };

  // ✅ Cargar tareas desde el backend (con fallback a localStorage)
  const loadTasks = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    if (isRefreshing.current) return;
    isRefreshing.current = true;

    try {
      console.log('📡 [USE_TASKS] Cargando tareas del backend...');
      const apiTasks = await taskService.getAllTasks();
      const mappedTasks = apiTasks.map(mapTaskFromApi);
      setTasks(mappedTasks);
      
      // Guardar en localStorage como caché
      localStorage.setItem(`tasks_${userId}`, JSON.stringify(mappedTasks));
      console.log(`✅ [USE_TASKS] ${mappedTasks.length} tareas cargadas del backend`);
    } catch (error) {
      console.error('❌ [USE_TASKS] Error cargando del backend, usando caché local:', error);
      try {
        const savedTasks = localStorage.getItem(`tasks_${userId}`);
        if (savedTasks) {
          const parsedTasks = JSON.parse(savedTasks);
          setTasks(parsedTasks);
          console.log(`📦 [USE_TASKS] ${parsedTasks.length} tareas cargadas de caché local`);
        } else {
          setTasks([]);
        }
      } catch (localError) {
        console.error('❌ [USE_TASKS] Error cargando tareas locales:', localError);
        setTasks([]);
      }
    } finally {
      setLoading(false);
      setInitialized(true);
      tasksLoadedRef.current = true;
      isRefreshing.current = false;
    }
  }, [userId]);

  // ✅ Cargar tareas al iniciar
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // ✅ Recargar tareas cuando la ventana recupera el foco (sincronización)
  useEffect(() => {
    const handleFocus = () => {
      if (initialized && tasksLoadedRef.current) {
        console.log('🔄 [USE_TASKS] Ventana enfocada, recargando tareas...');
        loadTasks();
      }
    };
    
    const interval = setInterval(() => {
      if (initialized && tasksLoadedRef.current && !isRefreshing.current) {
        loadTasks();
      }
    }, 60000);

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [initialized, loadTasks]);

  // ✅ Función para forzar refresco manual
  const refreshTasks = useCallback(async () => {
    console.log('🔄 [USE_TASKS] Refresco manual solicitado');
    await loadTasks();
  }, [loadTasks]);

  // ✅ Guardar en localStorage como caché cuando cambien
  useEffect(() => {
    if (userId && initialized && tasksLoadedRef.current) {
      try {
        localStorage.setItem(`tasks_${userId}`, JSON.stringify(tasks));
      } catch (error) {
        console.error('❌ [USE_TASKS] Error guardando caché local:', error);
      }
    }
  }, [tasks, userId, initialized]);

  // ============================================
  // FUNCIONES DE TAREAS
  // ============================================

  // ✅ CREAR TAREA (conectado al backend)
  const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('📤 [USE_TASKS] Creando tarea en el backend:', task.title);
    
    try {
      // Preparar datos para el backend
      const taskData = {
        title: task.title,
        description: task.description || '',
        completed: task.completed || false,
        priority: task.priority || 'media',
        category: task.category || 'personal',
        due_date: task.dueDate || undefined,
        color: task.color || undefined,
      };

      // ✅ Llamar al backend PRIMERO
      const createdTask = await taskService.createTask(taskData);
      console.log('✅ [USE_TASKS] Tarea creada en backend:', createdTask.id);

      // Convertir la respuesta del backend a nuestro formato Task
      const newTask: Task = mapTaskFromApi(createdTask);

      // Agregar al estado local
      setTasks(prev => [newTask, ...prev]);
      
      return newTask;
    } catch (error) {
      console.error('❌ [USE_TASKS] Error creando tarea en backend:', error);
      
      // Fallback: crear tarea localmente si el backend falla
      console.warn('⚠️ [USE_TASKS] Creando tarea localmente como fallback');
      const now = new Date().toISOString();
      const localTask: Task = {
        ...task,
        id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        createdAt: now,
        updatedAt: now,
        isFavorite: task.isFavorite || false,
        isArchived: task.isArchived || false,
        deletedAt: undefined,
      };
      
      setTasks(prev => [localTask, ...prev]);
      return localTask;
    }
  }, []);

  // ✅ ACTUALIZAR TAREA (conectado al backend)
  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    console.log('📝 [USE_TASKS] Actualizando tarea:', id, updates);
    
    // Guardar estado anterior por si hay que revertir
    const previousTask = tasks.find(t => t.id === id);
    
    // Actualizar optimistamente en el estado local
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    ));

    // Intentar actualizar en el backend
    if (!id.startsWith('local-')) {
      try {
        const apiUpdates = mapTaskToApi(updates);
        await taskService.updateTask(id, apiUpdates);
        console.log('✅ [USE_TASKS] Tarea actualizada en backend:', id);
      } catch (error) {
        console.error('❌ [USE_TASKS] Error actualizando tarea en backend:', error);
        // Revertir cambios si falla
        if (previousTask) {
          setTasks(prev => prev.map(task => 
            task.id === id ? { ...previousTask } : task
          ));
        }
      }
    }
  }, [tasks]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  // ✅ TOGGLE TAREA (conectado al backend)
  const toggleTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newCompleted = !task.completed;
    
    // Actualizar optimistamente
    setTasks(prev => prev.map(t => 
      t.id === id 
        ? { ...t, completed: newCompleted, updatedAt: new Date().toISOString() }
        : t
    ));

    // Sincronizar con backend
    if (!id.startsWith('local-')) {
      try {
        await taskService.updateTask(id, { completed: newCompleted });
        console.log('✅ [USE_TASKS] Toggle completado en backend:', id);
      } catch (error) {
        console.error('❌ [USE_TASKS] Error toggle en backend:', error);
        // Revertir
        setTasks(prev => prev.map(t => 
          t.id === id 
            ? { ...t, completed: !newCompleted }
            : t
        ));
      }
    }
  }, [tasks]);

  const toggleFavorite = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newFavorite = !task.isFavorite;
    
    setTasks(prev => prev.map(t => 
      t.id === id 
        ? { ...t, isFavorite: newFavorite, updatedAt: new Date().toISOString() }
        : t
    ));

    // Sincronizar con backend si existe el endpoint
    if (!id.startsWith('local-')) {
      try {
        await taskService.updateTask(id, { is_favorite: newFavorite });
        console.log('✅ [USE_TASKS] Favorito actualizado en backend:', id);
      } catch (error) {
        console.warn('⚠️ [USE_TASKS] No se pudo sincronizar favorito con backend:', error);
      }
    }
  }, [tasks]);

  const toggleArchive = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newArchived = !task.isArchived;
    
    setTasks(prev => prev.map(t => 
      t.id === id 
        ? { ...t, isArchived: newArchived, updatedAt: new Date().toISOString() }
        : t
    ));

    // Sincronizar con backend si existe el endpoint
    if (!id.startsWith('local-')) {
      try {
        await taskService.updateTask(id, { is_archived: newArchived });
        console.log('✅ [USE_TASKS] Archivado actualizado en backend:', id);
      } catch (error) {
        console.warn('⚠️ [USE_TASKS] No se pudo sincronizar archivado con backend:', error);
      }
    }
  }, [tasks]);

  // ============================================
  // ✅ SOFT DELETE CONECTADO AL BACKEND
  // ============================================

  const softDeleteTask = useCallback(async (id: string) => {
    const previousTask = tasks.find(t => t.id === id);
    
    // Optimista: marcar como eliminada localmente
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        : task
    ));

    try {
      if (!id.startsWith('local-')) {
        await taskService.deleteTask(id);
        console.log(`✅ [USE_TASKS] Tarea ${id} eliminada del backend`);
      }
    } catch (error) {
      console.error('❌ [USE_TASKS] Error eliminando tarea del backend:', error);
      // Revertir si falla
      if (previousTask) {
        setTasks(prev => prev.map(task => 
          task.id === id 
            ? { ...previousTask }
            : task
        ));
      }
    }
  }, [tasks]);

  // ============================================
  // ✅ ELIMINACIÓN MASIVA (BULK SOFT DELETE)
  // ============================================

  const bulkSoftDelete = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return { success: 0, failed: 0 };

    console.log(`📤 [USE_TASKS] Eliminando ${ids.length} tareas en bulk`);

    // Guardar estado anterior por si hay que revertir
    const previousTasks = tasks.filter(t => ids.includes(t.id));
    let successCount = 0;
    let failedCount = 0;

    // ✅ Paso 1: Marcar todas como eliminadas en el estado local (optimista)
    const now = new Date().toISOString();
    setTasks(prev => prev.map(task => 
      ids.includes(task.id) 
        ? { ...task, deletedAt: now, updatedAt: now }
        : task
    ));

    // ✅ Paso 2: Eliminar una por una en el backend
    for (const id of ids) {
      try {
        if (!id.startsWith('local-')) {
          await taskService.deleteTask(id);
        }
        successCount++;
        console.log(`✅ [USE_TASKS] Tarea ${id} eliminada del backend (bulk)`);
      } catch (error) {
        failedCount++;
        console.error(`❌ [USE_TASKS] Error eliminando tarea ${id} del backend:`, error);
        // Revertir esta tarea específica
        const previousTask = previousTasks.find(t => t.id === id);
        if (previousTask) {
          setTasks(prev => prev.map(task => 
            task.id === id 
              ? { ...previousTask }
              : task
          ));
        }
      }
    }

    console.log(`✅ [USE_TASKS] Bulk delete completado: ${successCount} éxito, ${failedCount} fallos`);
    
    // Recargar tareas del backend para asegurar consistencia
    if (successCount > 0) {
      setTimeout(() => loadTasks(), 1000);
    }
    
    return { success: successCount, failed: failedCount };
  }, [tasks, loadTasks]);

  const restoreTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, deletedAt: undefined, updatedAt: new Date().toISOString() }
        : task
    ));
  }, []);

  const permanentDeleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const getDeletedTasks = useCallback(() => {
    return tasks.filter(task => task.deletedAt !== undefined);
  }, [tasks]);

  const getActiveTasks = useCallback(() => {
    return tasks.filter(task => task.deletedAt === undefined);
  }, [tasks]);

  const getTask = useCallback((id: string) => {
    return tasks.find(task => task.id === id);
  }, [tasks]);

  const getTasksByCategory = useCallback((category: Task['category']) => {
    return tasks.filter(task => task.category === category);
  }, [tasks]);

  const getTasksByPriority = useCallback((priority: Task['priority']) => {
    return tasks.filter(task => task.priority === priority);
  }, [tasks]);

  const getCompletedTasks = useCallback(() => {
    return tasks.filter(task => task.completed);
  }, [tasks]);

  const getPendingTasks = useCallback(() => {
    return tasks.filter(task => !task.completed);
  }, [tasks]);

  const getFavoriteTasks = useCallback(() => {
    return tasks.filter(task => task.isFavorite === true);
  }, [tasks]);

  const getArchivedTasks = useCallback(() => {
    return tasks.filter(task => task.isArchived === true);
  }, [tasks]);

  const getTasksDueToday = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task => task.dueDate?.split('T')[0] === today);
  }, [tasks]);

  const getTasksDueThisWeek = useCallback(() => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate <= nextWeek;
    });
  }, [tasks]);

  const getStats = useCallback(() => {
    const activeTasks = tasks.filter(t => t.deletedAt === undefined);
    const total = activeTasks.length;
    const completed = activeTasks.filter(t => t.completed).length;
    const pending = total - completed;
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const favorites = activeTasks.filter(t => t.isFavorite === true).length;
    const archived = activeTasks.filter(t => t.isArchived === true).length;
    const deleted = tasks.filter(t => t.deletedAt !== undefined).length;
    
    const byPriority = {
      alta: activeTasks.filter(t => t.priority === 'alta').length,
      media: activeTasks.filter(t => t.priority === 'media').length,
      baja: activeTasks.filter(t => t.priority === 'baja').length,
    };
    
    const byCategory = {
      personal: activeTasks.filter(t => t.category === 'personal').length,
      trabajo: activeTasks.filter(t => t.category === 'trabajo').length,
      estudio: activeTasks.filter(t => t.category === 'estudio').length,
      otro: activeTasks.filter(t => t.category === 'otro').length,
    };
    
    return {
      total, completed, pending, completionPercentage,
      byPriority, byCategory, favorites, archived, deleted,
    };
  }, [tasks]);

  const clearAllTasks = useCallback(() => {
    setTasks([]);
    if (userId) {
      localStorage.removeItem(`tasks_${userId}`);
    }
  }, [userId]);

  return {
    tasks,
    loading,
    initialized,
    refreshTasks,
    addTask,
    updateTask,
    deleteTask,
    softDeleteTask,
    bulkSoftDelete,
    restoreTask,
    permanentDeleteTask,
    toggleTask,
    toggleFavorite,
    toggleArchive,
    getTask,
    getTasksByCategory,
    getTasksByPriority,
    getCompletedTasks,
    getPendingTasks,
    getFavoriteTasks,
    getArchivedTasks,
    getActiveTasks,
    getDeletedTasks,
    getTasksDueToday,
    getTasksDueThisWeek,
    getStats,
    clearAllTasks,
  };
};