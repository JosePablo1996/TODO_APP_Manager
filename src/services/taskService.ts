// src/services/taskService.ts
import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

// ============================================
// INTERFACES
// ============================================

export interface TaskData {
  id?: string;
  title: string;
  description?: string;
  completed?: boolean;
  priority?: string;
  category?: string;
  due_date?: string;
  color?: string;
  tags?: string[];
  is_favorite?: boolean;
  is_archived?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TaskResponse {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: string;
  due_date?: string;
  category: string;
  tags: string[];
  color?: string;
  is_favorite?: boolean;
  is_archived?: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// SERVICIO DE TAREAS
// ============================================

class TaskService {
  private getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private getAxiosInstance() {
    const token = this.getToken();
    
    return axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  }

  // ============================================
  // OBTENER TODAS LAS TAREAS (SIN FILTROS)
  // ============================================

  async getAllTasks(): Promise<TaskResponse[]> {
    try {
      const axiosInstance = this.getAxiosInstance();
      const response = await axiosInstance.get('/api/tasks');
      console.log(`✅ [TASKS] ${response.data.length} tareas obtenidas`);
      return response.data;
    } catch (err) {
      const e = err as AxiosError;
      console.error('❌ [TASKS] Error obteniendo tareas:', e.message);
      throw {
        message: 'Error al obtener las tareas',
        status: e.response?.status || 500
      };
    }
  }

  // ============================================
  // CREAR UNA TAREA
  // ============================================

  async createTask(task: TaskData): Promise<TaskResponse> {
    try {
      const axiosInstance = this.getAxiosInstance();
      const response = await axiosInstance.post('/api/tasks', task);
      console.log(`✅ [TASKS] Tarea creada: ${response.data.id}`);
      return response.data;
    } catch (err) {
      const e = err as AxiosError;
      console.error('❌ [TASKS] Error creando tarea:', e.message);
      throw {
        message: 'Error al crear la tarea',
        status: e.response?.status || 500
      };
    }
  }

  // ============================================
  // ✅ NUEVO: ACTUALIZAR UNA TAREA
  // ============================================

  async updateTask(taskId: string, taskData: Partial<TaskData>): Promise<TaskResponse> {
    try {
      const axiosInstance = this.getAxiosInstance();
      const response = await axiosInstance.put(`/api/tasks/${taskId}`, taskData);
      console.log(`✅ [TASKS] Tarea ${taskId} actualizada`);
      return response.data;
    } catch (err) {
      const e = err as AxiosError;
      console.error('❌ [TASKS] Error actualizando tarea:', e.message);
      throw {
        message: 'Error al actualizar la tarea',
        status: e.response?.status || 500
      };
    }
  }

  // ============================================
  // ✅ NUEVO: ACTUALIZAR PARCIALMENTE UNA TAREA (PATCH)
  // ============================================

  async patchTask(taskId: string, taskData: Partial<TaskData>): Promise<TaskResponse> {
    try {
      const axiosInstance = this.getAxiosInstance();
      const response = await axiosInstance.patch(`/api/tasks/${taskId}`, taskData);
      console.log(`✅ [TASKS] Tarea ${taskId} actualizada parcialmente`);
      return response.data;
    } catch (err) {
      const e = err as AxiosError;
      console.error('❌ [TASKS] Error actualizando tarea parcialmente:', e.message);
      throw {
        message: 'Error al actualizar la tarea',
        status: e.response?.status || 500
      };
    }
  }

  // ============================================
  // ELIMINAR UNA TAREA
  // ============================================

  async deleteTask(taskId: string): Promise<void> {
    try {
      const axiosInstance = this.getAxiosInstance();
      await axiosInstance.delete(`/api/tasks/${taskId}`);
      console.log(`✅ [TASKS] Tarea ${taskId} eliminada`);
    } catch (err) {
      const e = err as AxiosError;
      console.error('❌ [TASKS] Error eliminando tarea:', e.message);
      throw {
        message: 'Error al eliminar la tarea',
        status: e.response?.status || 500
      };
    }
  }

  // ============================================
  // ✅ NUEVO: OBTENER UNA TAREA POR ID
  // ============================================

  async getTaskById(taskId: string): Promise<TaskResponse> {
    try {
      const axiosInstance = this.getAxiosInstance();
      const response = await axiosInstance.get(`/api/tasks/${taskId}`);
      console.log(`✅ [TASKS] Tarea ${taskId} obtenida`);
      return response.data;
    } catch (err) {
      const e = err as AxiosError;
      console.error('❌ [TASKS] Error obteniendo tarea:', e.message);
      throw {
        message: 'Error al obtener la tarea',
        status: e.response?.status || 500
      };
    }
  }

  // ============================================
  // CREAR MÚLTIPLES TAREAS (IMPORTACIÓN MASIVA)
  // ============================================

  async createTasksBatch(
    tasks: TaskData[],
    onProgress?: (current: number, total: number) => void
  ): Promise<number> {
    let importedCount = 0;
    const total = tasks.length;

    for (let i = 0; i < tasks.length; i++) {
      try {
        const rawTask = tasks[i];
        const cleanTask: TaskData = {
          title: rawTask.title,
          description: rawTask.description,
          completed: rawTask.completed,
          priority: rawTask.priority,
          category: rawTask.category,
          due_date: rawTask.due_date,
          color: rawTask.color,
          tags: rawTask.tags,
          is_favorite: rawTask.is_favorite,
          is_archived: rawTask.is_archived,
        };
        await this.createTask(cleanTask);
        importedCount++;
      } catch (err) {
        console.warn(`⚠️ [TASKS] Error importando tarea ${i + 1}:`, err);
      }
      
      if (onProgress) {
        onProgress(i + 1, total);
      }
      
      // Pequeña pausa para no sobrecargar el backend
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log(`✅ [TASKS] Importadas ${importedCount}/${total} tareas`);
    return importedCount;
  }

  // ============================================
  // ✅ NUEVO: ELIMINAR MÚLTIPLES TAREAS (BULK DELETE)
  // ============================================

  async deleteTasksBatch(taskIds: string[]): Promise<{ success: number; failed: number }> {
    let successCount = 0;
    let failedCount = 0;
    const total = taskIds.length;

    for (const taskId of taskIds) {
      try {
        await this.deleteTask(taskId);
        successCount++;
      } catch (err) {
        failedCount++;
        console.error(`❌ [TASKS] Error eliminando tarea ${taskId} en batch:`, err);
      }
    }

    console.log(`✅ [TASKS] Batch delete: ${successCount}/${total} éxito, ${failedCount} fallos`);
    return { success: successCount, failed: failedCount };
  }
}

const taskService = new TaskService();
export default taskService;