// src/types/backup.ts

// ============================================
// TIPOS PARA BACKUP EN LA NUBE
// ============================================

/**
 * Backup completo desde el backend
 */
export interface CloudBackup {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  note_count: number;
  backup_type: 'manual' | 'automatic';
  device_name?: string;
  app_version?: string;
  created_at: string;
  notes_data?: Record<string, unknown>;
}

/**
 * Metadatos del backup (sin datos de notas, más ligero)
 */
export interface CloudBackupMetadata {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  note_count: number;
  backup_type: string;
  device_name?: string;
  app_version?: string;
  created_at: string;
}

/**
 * Información del límite de backups
 */
export interface CloudBackupLimitInfo {
  current: number;
  max: number;
  remaining: number;
  is_full: boolean;
  is_low: boolean;
}

/**
 * Estadísticas de backups en la nube
 */
export interface CloudBackupStats {
  total_backups: number;
  total_notes_backed_up: number;
  total_size_bytes: number;
  total_size_mb: number;
  latest_backup: { created_at: string; note_count: number } | null;
  limit: number;
  remaining_slots: number;
}

/**
 * Datos para crear un nuevo backup
 */
export interface CloudBackupCreateData {
  file_name: string;
  file_size: number;
  note_count: number;
  notes_data: Record<string, unknown>;
  backup_type?: 'manual' | 'automatic';
  device_name?: string;
  app_version?: string;
}

// ============================================
// TIPOS PARA BACKUPS LOCALES
// ============================================

/**
 * Entrada del historial de backups locales
 */
export interface BackupHistoryEntry {
  date: string;
  taskCount: number;
  fileName: string;
  timestamp: number;
}

/**
 * Backup local (para listar y seleccionar)
 */
export interface LocalBackup {
  id: string;
  file_name: string;
  file_size: number;
  note_count: number;
  created_at: string;
  date: string;
  taskCount: number;
  fileName: string;
  timestamp: number;
  is_selected?: boolean;
}

// ============================================
// TIPOS PARA SINCRONIZACIÓN
// ============================================

/**
 * Solicitud de sincronización
 */
export interface SyncRequest {
  local_backups: Array<{
    id: string;
    file_name: string;
    file_size: number;
    note_count: number;
    created_at: string;
    source: string;
  }>;
}

/**
 * Respuesta de sincronización
 */
export interface SyncResponse {
  synced_count: number;
  failed_count: number;
  cloud_backups_to_download: Array<{
    id: string;
    file_name: string;
    file_size: number;
    note_count: number;
    created_at: string;
    notes_data: Record<string, unknown>;
  }>;
  message: string;
}

// ============================================
// TIPOS PARA BACKUP DATA (JSON)
// ============================================

/**
 * Datos de tarea para backup (formato JSON)
 */
export interface BackupTaskData {
  title: string;
  description: string;
  completed: boolean;
  priority: string;
  category: string;
  due_date: string;
  color?: string;
  tags?: string[];
  icon?: string;
  size?: string;
  opacity?: string;
  borderRadius?: string;
}

/**
 * Estructura completa del archivo de backup
 */
export interface BackupData {
  version: string;
  exported_at: string;
  app: string;
  app_version: string;
  task_count: number;
  tasks: BackupTaskData[];
}

// ============================================
// TIPOS PARA COMPONENTES (ACTUALIZADOS)
// ============================================

/**
 * Props para componente de estadísticas
 */
export interface BackupStatsProps {
  taskCount: number;
  pendingCount: number;
  completedCount: number;
  totalBackups?: number;
  maxBackups?: number;
  totalSizeMB?: number;
}

/**
 * Props para lista de backups locales - ✅ ACTUALIZADO
 */
export interface BackupLocalListProps {
  backups: LocalBackup[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  onUploadSelected: () => void;
  onUploadAll: () => void;
  onDeleteLocal?: (backup: LocalBackup) => void;  // ✅ NUEVO: Eliminar backup local individual
  isUploading: boolean;
  isDeleting?: string | null;  // ✅ NUEVO: ID del backup que se está eliminando
}

/**
 * Props para lista de backups en la nube
 */
export interface BackupCloudListProps {
  backups: CloudBackupMetadata[];
  onDelete: (id: string) => void;
  onRestore: (backup: CloudBackupMetadata) => void;
  isDeleting: string | null;
  isRestoring: string | null;
}

/**
 * Props para el banner decorativo
 */
export interface BackupBannerProps {
  appVersion?: string;
}

/**
 * Props para las pestañas
 */
export interface BackupTabsProps {
  activeTab: 'general' | 'locals' | 'cloud';
  onTabChange: (tab: 'general' | 'locals' | 'cloud') => void;
}

/**
 * Props para el componente de sincronización manual
 */
export interface BackupSyncManualProps {
  onSync: () => void;
  isSyncing: boolean;
  pendingCount: number;
  lastSync?: string;
}

/**
 * Props para el componente de backup selectivo
 */
export interface BackupSelectiveProps {
  backups: CloudBackupMetadata[];
  onUploadSelected: (ids: string[]) => void;
  isUploading: boolean;
}