// ============================================
// TIPOS PARA CHANGELOG
// ============================================

export interface ChangeItem {
  description: string;
  details?: string[];
}

export interface VersionChange {
  category: string;
  icon: string; // Nombre del icono de Lucide
  color: string;
  items: ChangeItem[];
}

export interface Version {
  version: string;
  date: string;
  title: string;
  gradient: string;
  changes: VersionChange[];
  isLatest?: boolean;
}

export interface ThemeClasses {
  bg: {
    card: string;
    secondary: string;
    hover: string;
    primary: string;
  };
  border: {
    primary: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  icon: {
    secondary: string;
    primary: string;
  };
}