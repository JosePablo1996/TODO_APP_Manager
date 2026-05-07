// src/hooks/useStorage.ts
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, unknown>;
}

interface DiagnosticResult {
  userId: string;
  supabaseSession: string;
  buckets: {
    list: string[];
    error?: string;
  };
  permissions: {
    avatars: PermissionCheck;
    banners: PermissionCheck;
  };
}

interface PermissionCheck {
  canList?: boolean;
  files?: number;
  error?: string;
}

interface UploadResponse {
  url: string;
  success: boolean;
  message?: string;
}

export const useStorage = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Obtener userId correctamente
  const userId = user?.id;

  // Validar archivo antes de subir
  const validateFile = (file: File, maxSizeMB: number = 10): string | null => {
    const MAX_SIZE = maxSizeMB * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return `El archivo no debe superar los ${maxSizeMB}MB. Tamaño actual: ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
    }

    const validTypes: string[] = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ];

    if (!validTypes.includes(file.type)) {
      return `Tipo de archivo no válido. Formatos aceptados: JPG, PNG, GIF, WEBP, SVG`;
    }

    return null;
  };

  // Generar nombre de archivo único con la estructura correcta
  const generateFilePath = (bucket: string, file: File): string => {
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    
    // Estructura correcta: userId/bucket/timestamp-random.ext
    return `${userId}/${bucket}/${timestamp}-${randomString}.${fileExt}`;
  };

  // Subir archivo genérico
  const uploadFile = async (
    file: File, 
    bucket: 'avatars' | 'banners',
    maxSizeMB: number = bucket === 'avatars' ? 2 : 5
  ): Promise<UploadResponse | null> => {
    if (!userId) {
      setError('Usuario no autenticado');
      return null;
    }

    const validationError = validateFile(file, maxSizeMB);
    if (validationError) {
      setError(validationError);
      return null;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const filePath = generateFilePath(bucket, file);
      
      console.log(`📤 Subiendo ${bucket} a Supabase...`, { 
        filePath, 
        size: file.size, 
        type: file.type,
        bucket,
        userId 
      });

      // Simular progreso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Subir a Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });

      clearInterval(progressInterval);

      if (uploadError) {
        console.error('❌ Error detallado de Supabase:', uploadError);
        
        if (uploadError.message.includes('row-level security')) {
          throw new Error('Error de permisos: No tienes acceso para subir a esta carpeta.');
        } else if (uploadError.message.includes('duplicate')) {
          throw new Error('El archivo ya existe. Intenta con otro nombre.');
        } else if (uploadError.message.includes('size')) {
          throw new Error(`El archivo excede el tamaño máximo de ${maxSizeMB}MB.`);
        } else {
          throw new Error(uploadError.message || 'Error al subir a Supabase');
        }
      }

      if (!data) {
        throw new Error('No se recibieron datos de Supabase');
      }

      console.log('✅ Archivo subido exitosamente a Supabase:', data);

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      console.log('🔗 URL pública generada:', publicUrl);

      setUploadProgress(100);

      return {
        url: publicUrl,
        success: true,
        message: `${bucket === 'avatars' ? 'Avatar' : 'Banner'} subido correctamente`
      };
      
    } catch (err) {
      console.error(`❌ Error en upload${bucket === 'avatars' ? 'Avatar' : 'Banner'}:`, err);
      setError(err instanceof Error ? err.message : `Error al subir ${bucket}`);
      return null;
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // Subir avatar
  const uploadAvatar = async (file: File): Promise<string | null> => {
    const result = await uploadFile(file, 'avatars', 2);
    return result?.url || null;
  };

  // Subir banner
  const uploadBanner = async (file: File): Promise<string | null> => {
    const result = await uploadFile(file, 'banners', 5);
    return result?.url || null;
  };

  // Eliminar archivo
  const deleteFile = async (url: string, bucket: 'avatars' | 'banners'): Promise<boolean> => {
    if (!userId) {
      setError('Usuario no autenticado');
      return false;
    }

    try {
      // Extraer el path de la URL
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      if (!fileName) {
        throw new Error('URL inválida');
      }

      const filePath = `${userId}/${bucket}/${fileName}`;

      console.log(`🗑️ Eliminando ${bucket} de Supabase...`, { filePath });

      // Eliminar de Supabase Storage
      const { error: deleteError } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (deleteError) {
        console.error('❌ Error eliminando de Supabase:', deleteError);
        throw new Error(deleteError.message || 'Error al eliminar de Supabase');
      }

      console.log(`✅ ${bucket} eliminado de Supabase`);
      return true;
      
    } catch (err) {
      console.error(`❌ Error eliminando ${bucket}:`, err);
      setError(err instanceof Error ? err.message : `Error al eliminar ${bucket}`);
      return false;
    }
  };

  // Wrappers específicos
  const deleteAvatar = (url: string): Promise<boolean> => deleteFile(url, 'avatars');
  const deleteBanner = (url: string): Promise<boolean> => deleteFile(url, 'banners');

  // Función para diagnosticar problemas de storage
  const diagnoseStorage = async (): Promise<DiagnosticResult | { error: string }> => {
    if (!userId) return { error: 'Usuario no autenticado' };

    try {
      const results: DiagnosticResult = {
        userId: userId,
        supabaseSession: 'Inactiva',
        buckets: {
          list: []
        },
        permissions: {
          avatars: {},
          banners: {}
        }
      };

      // Verificar sesión de Supabase
      const { data: { session } } = await supabase.auth.getSession();
      results.supabaseSession = session ? 'Activa' : 'Inactiva';

      // Listar buckets disponibles
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      results.buckets.list = buckets?.map(b => b.name) || [];
      if (bucketsError) {
        results.buckets.error = bucketsError.message;
      }

      // Verificar si puede listar su carpeta de avatares
      try {
        const { data: avatarFiles, error: avatarError } = await supabase.storage
          .from('avatars')
          .list(`${userId}/avatars`);
        
        results.permissions.avatars = {
          canList: !avatarError,
          files: avatarFiles?.length || 0,
          error: avatarError?.message
        };
      } catch (error) {
        const err = error as Error;
        results.permissions.avatars = { error: err.message };
      }

      // Verificar si puede listar su carpeta de banners
      try {
        const { data: bannerFiles, error: bannerError } = await supabase.storage
          .from('banners')
          .list(`${userId}/banners`);
        
        results.permissions.banners = {
          canList: !bannerError,
          files: bannerFiles?.length || 0,
          error: bannerError?.message
        };
      } catch (error) {
        const err = error as Error;
        results.permissions.banners = { error: err.message };
      }

      console.log('🔍 Diagnóstico de Storage:', results);
      return results;

    } catch (error) {
      const err = error as Error;
      console.error('Error en diagnóstico:', err);
      return { error: err.message };
    }
  };

  // Obtener URLs de los archivos de un usuario
  const listUserFiles = async (bucket: 'avatars' | 'banners'): Promise<string[]> => {
    if (!userId) return [];

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(`${userId}/${bucket}`);

      if (error) throw error;

      const files = (data as StorageFile[]) || [];
      
      // Generar URLs públicas
      const urls = files.map(file => {
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(`${userId}/${bucket}/${file.name}`);
        return publicUrl;
      });
      
      return urls;
    } catch (error) {
      console.error(`Error listando archivos de ${bucket}:`, error);
      return [];
    }
  };

  // Verificar si los buckets existen
  const checkBuckets = async (): Promise<{ avatars: boolean; banners: boolean }> => {
    const result = { avatars: false, banners: false };
    
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (error) throw error;
      
      const bucketNames = buckets.map(b => b.name);
      result.avatars = bucketNames.includes('avatars');
      result.banners = bucketNames.includes('banners');
      
      return result;
    } catch (error) {
      console.error('Error verificando buckets:', error);
      return result;
    }
  };

  return {
    // Estados
    uploading,
    error,
    uploadProgress,
    
    // Métodos principales
    uploadAvatar,
    uploadBanner,
    deleteAvatar,
    deleteBanner,
    listUserFiles,
    diagnoseStorage,
    checkBuckets,
    
    // Constantes
    MAX_FILE_SIZE_AVATAR: 2 * 1024 * 1024, // 2MB
    MAX_FILE_SIZE_BANNER: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'] as const
  };
};