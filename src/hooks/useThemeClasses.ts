import { useTheme } from './useTheme';

type ThemeClasses = {
  isDark: boolean;
  theme: 'light' | 'dark';
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    muted: string;
  };
  bg: {
    primary: string;
    secondary: string;
    card: string;
    input: string;
    hover: string;
  };
  border: {
    primary: string;
    secondary: string;
    focus: string;
  };
  button: {
    primary: string;
    secondary: string;
    success: string;
    danger: string;
    warning: string;
  };
  icon: {
    primary: string;
    secondary: string;
    accent: string;
  };
  status: {
    success: string;
    error: string;
    warning: string;
    info: string;
    successBg: string;
    errorBg: string;
    warningBg: string;
    infoBg: string;
  };
};

export const useThemeClasses = (): ThemeClasses => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return {
    isDark,
    theme,
    
    text: {
      primary: isDark ? 'text-gray-100' : 'text-gray-900',
      secondary: isDark ? 'text-gray-200' : 'text-gray-600',
      tertiary: isDark ? 'text-gray-300' : 'text-gray-500',
      muted: isDark ? 'text-gray-400' : 'text-gray-400',
    },
    
    bg: {
      primary: isDark ? 'bg-gray-900' : 'bg-white',
      secondary: isDark ? 'bg-gray-800/80' : 'bg-gray-50',
      card: isDark ? 'bg-gray-800/90' : 'bg-white/90',
      input: isDark ? 'bg-gray-800/70' : 'bg-white/70',
      hover: isDark ? 'hover:bg-gray-700/70' : 'hover:bg-gray-100/80',
    },
    
    border: {
      primary: isDark ? 'border-gray-700/60' : 'border-gray-200/60',
      secondary: isDark ? 'border-gray-800/60' : 'border-gray-100/60',
      focus: isDark ? 'focus:border-emerald-500' : 'focus:border-emerald-600',
    },
    
    button: {
      // Botón primario - Gradiente Supabase
      primary: isDark 
        ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white shadow-lg' 
        : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-md',
      
      // Botón secundario - Estilo outline/ghost
      secondary: isDark
        ? 'bg-gray-700/80 hover:bg-gray-600/80 text-gray-200 backdrop-blur-sm border border-gray-600/50'
        : 'bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 backdrop-blur-sm border border-gray-200/50',
      
      // Botón éxito - Emerald
      success: isDark
        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
        : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md',
      
      // Botón peligro - Red
      danger: isDark
        ? 'bg-red-600 hover:bg-red-700 text-white shadow-md'
        : 'bg-red-500 hover:bg-red-600 text-white shadow-md',
      
      // Botón advertencia - Amber
      warning: isDark
        ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md'
        : 'bg-amber-500 hover:bg-amber-600 text-white shadow-md',
    },
    
    icon: {
      // Icono primario - Emerald (color principal)
      primary: isDark ? 'text-emerald-400' : 'text-emerald-600',
      // Icono secundario - Gris
      secondary: isDark ? 'text-gray-400' : 'text-gray-500',
      // Icono acento - Cyan/Teal (para destacar)
      accent: isDark ? 'text-cyan-400' : 'text-cyan-600',
    },
    
    status: {
      // Éxito - Emerald
      success: isDark ? 'text-emerald-400' : 'text-emerald-600',
      // Error - Red
      error: isDark ? 'text-red-400' : 'text-red-600',
      // Advertencia - Amber
      warning: isDark ? 'text-amber-400' : 'text-amber-600',
      // Información - Cyan
      info: isDark ? 'text-cyan-400' : 'text-cyan-600',
      // Fondos de estado
      successBg: isDark ? 'bg-emerald-900/30' : 'bg-emerald-50',
      errorBg: isDark ? 'bg-red-900/30' : 'bg-red-50',
      warningBg: isDark ? 'bg-amber-900/30' : 'bg-amber-50',
      infoBg: isDark ? 'bg-cyan-900/30' : 'bg-cyan-50',
    },
  };
};