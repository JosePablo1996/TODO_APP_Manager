// src/hooks/useDebounce.ts
import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para debounce de valores
 * Útil para búsquedas en tiempo real, evitando múltiples llamadas
 * 
 * @param value - Valor a debounce
 * @param delay - Tiempo de espera en milisegundos (default: 500ms)
 * @returns Valor debounced
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     searchTasks(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Versión con callback para cuando se necesita ejecutar una función al debounce
 * 
 * @example
 * const debouncedSearch = useDebounceCallback((term: string) => {
 *   searchTasks(term);
 * }, 500);
 * 
 * onChange={(e) => debouncedSearch(e.target.value)}
 */
export function useDebounceCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const debouncedFunction = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const newTimeoutId = setTimeout(() => {
        callback(...args);
      }, delay);
      setTimeoutId(newTimeoutId);
    },
    [callback, delay, timeoutId]
  );

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return debouncedFunction;
}

/**
 * Versión con promesa para cuando se necesita esperar el resultado
 * 
 * @example
 * const debouncedSearch = useDebouncePromise(async (term: string) => {
 *   const results = await searchAPI(term);
 *   return results;
 * }, 500);
 */
export function useDebouncePromise<T extends (...args: unknown[]) => Promise<unknown>>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [resolve, setResolve] = useState<((value: ReturnType<T>) => void) | null>(null);
  const [reject, setReject] = useState<((reason?: unknown) => void) | null>(null);

  const debouncedFunction = useCallback(
    (...args: Parameters<T>): Promise<ReturnType<T>> => {
      return new Promise<ReturnType<T>>((res, rej) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        setResolve(() => res);
        setReject(() => rej);
        
        const newTimeoutId = setTimeout(async () => {
          try {
            const result = await callback(...args);
            if (resolve) {
              // Aseguramos que result sea del tipo correcto
              resolve(result as ReturnType<T>);
            }
          } catch (error) {
            if (reject) {
              reject(error);
            }
          } finally {
            setResolve(null);
            setReject(null);
          }
        }, delay);
        
        setTimeoutId(newTimeoutId);
      });
    },
    [callback, delay, timeoutId, resolve, reject]
  );

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return debouncedFunction;
}