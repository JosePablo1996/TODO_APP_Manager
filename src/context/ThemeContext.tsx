// src/context/ThemeContext.tsx
import { createContext } from 'react';
import type { ThemeContextType } from './themeTypes';

/**
 * Contexto para el tema de la aplicación (claro/oscuro)
 * 
 * Este contexto proporciona el estado del tema actual y la función para cambiarlo
 * a todos los componentes de la aplicación, incluyendo los componentes de WebAuthn.
 * 
 * @example
 * // Uso en un componente
 * const { theme, toggleTheme } = useContext(ThemeContext);
 */
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Exportar el nombre del contexto para debugging
ThemeContext.displayName = 'ThemeContext';