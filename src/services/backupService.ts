// src/services/backupService.ts
import axios, { AxiosError } from 'axios';
import type {
  CloudBackup,
  CloudBackupMetadata,
  CloudBackupLimitInfo,
  CloudBackupStats,
  CloudBackupCreateData,
  SyncRequest,
  SyncResponse,
  BackupHistoryEntry,
} from '../types/backup';

const API_URL = import.meta.env.VITE_API_URL || '';

// ============================================
// SERVICIO DE BACKUP
// ============================================

class BackupService {
  private getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private getHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async request<T>(method: string, url: string, data?: unknown): Promise<T> {
    try {
      const response = await axios({
        method,
        url: `${API_URL}${url}`,
        headers: this.getHeaders(),
        data,
        timeout: 60000,
      });
      return response.data;
    } catch (err) {
      const error = err as AxiosError<{ detail?: string; message?: string }>;
      throw new Error(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        `Error en ${method} ${url}`
      );
    }
  }

  // ============================================
  // BACKUP EN LA NUBE
  // ============================================

  /**
   * Guarda un backup en la nube
   */
  async saveBackup(backupData: CloudBackupCreateData): Promise<CloudBackup> {
    return this.request<CloudBackup>('POST', '/api/backup/cloud', backupData);
  }

  /**
   * Obtiene todos los backups del usuario (solo metadatos)
   */
  async getAllBackups(): Promise<CloudBackupMetadata[]> {
    return this.request<CloudBackupMetadata[]>('GET', '/api/backup/cloud');
  }

  /**
   * Obtiene un backup específico por ID (incluye datos)
   */
  async getBackup(backupId: string): Promise<CloudBackup> {
    return this.request<CloudBackup>('GET', `/api/backup/cloud/${backupId}`);
  }

  /**
   * Elimina un backup de la nube
   */
  async deleteBackup(backupId: string): Promise<{ success: boolean; message: string; already_deleted?: boolean }> {
    return this.request<{ success: boolean; message: string; already_deleted?: boolean }>(
      'DELETE',
      `/api/backup/cloud/${backupId}`
    );
  }

  /**
   * Sincroniza backups locales con la nube
   * @param local_backups - Lista de backups locales (el backend espera snake_case)
   */
  async syncBackups(local_backups: SyncRequest['local_backups']): Promise<SyncResponse> {
    return this.request<SyncResponse>('POST', '/api/backup/cloud/sync', { local_backups });
  }

  /**
   * Obtiene información del límite de backups
   */
  async getBackupLimitInfo(): Promise<CloudBackupLimitInfo> {
    return this.request<CloudBackupLimitInfo>('GET', '/api/backup/cloud/limit/info');
  }

  /**
   * Obtiene estadísticas de backups
   */
  async getBackupStats(): Promise<CloudBackupStats> {
    return this.request<CloudBackupStats>('GET', '/api/backup/cloud/stats');
  }

  // ============================================
  // UTILIDADES LOCALES
  // ============================================

  /**
   * Obtiene la lista de backups locales guardados en localStorage
   */
  getLocalBackups(): BackupHistoryEntry[] {
    try {
      const saved = localStorage.getItem('todoapp_backup_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  /**
   * Guarda un backup local en el historial
   */
  addLocalBackup(taskCount: number, fileName: string): void {
    const now = new Date();
    const entry: BackupHistoryEntry = {
      date: `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
      taskCount,
      fileName,
      timestamp: Date.now(),
    };
    const history = this.getLocalBackups();
    const newHistory = [entry, ...history].slice(0, 10);
    localStorage.setItem('todoapp_backup_history', JSON.stringify(newHistory));
  }

  /**
   * Limpia todo el historial de backups locales
   */
  clearLocalBackupHistory(): void {
    localStorage.removeItem('todoapp_backup_history');
  }

  /**
   * Obtiene la fecha del último backup
   */
  getLastBackupInfo(): { date: string | null; taskCount: number | null } {
    const history = this.getLocalBackups();
    if (history.length === 0) {
      return { date: null, taskCount: null };
    }
    const latest = history[0];
    return { date: latest.date, taskCount: latest.taskCount };
  }

  /**
   * Convierte BackupHistoryEntry a objeto para sincronización
   */
  convertToSyncEntry(entry: BackupHistoryEntry): {
    id: string;
    file_name: string;
    file_size: number;
    note_count: number;
    created_at: string;
    source: string;
  } {
    return {
      id: `local-${entry.timestamp}`,
      file_name: entry.fileName,
      file_size: 0,
      note_count: entry.taskCount,
      created_at: new Date(entry.timestamp).toISOString(),
      source: 'local',
    };
  }
}

export const backupService = new BackupService();
export default backupService;