// ============================================
// DATOS DE PERSONALIZACIÓN DE TAREAS
// ============================================

/**
 * Opciones de iconos para personalizar tareas
 * Cada tarea puede tener un icono representativo
 */
export const TASK_ICONS = [
  { name: 'Tarea', icon: 'CheckCircle' },
  { name: 'Reunión', icon: 'Users' },
  { name: 'Importante', icon: 'Star' },
  { name: 'Idea', icon: 'Lightbulb' },
  { name: 'Compra', icon: 'ShoppingCart' },
  { name: 'Llamada', icon: 'Phone' },
  { name: 'Email', icon: 'Mail' },
  { name: 'Documento', icon: 'FileText' },
  { name: 'Viaje', icon: 'Plane' },
  { name: 'Salud', icon: 'Heart' },
  { name: 'Libro', icon: 'BookOpen' },
  { name: 'Código', icon: 'Code' },
] as const;

export type TaskIconName = typeof TASK_ICONS[number]['icon'];

/**
 * Opciones de tamaño para las tarjetas de tareas
 * Afecta la altura y el padding de la tarjeta
 */
export const TASK_SIZES = [
  { 
    name: 'Compacto', 
    value: 'sm', 
    description: 'Ideal para listas densas',
    cardHeight: 'min-h-[60px]', 
    cardPadding: 'p-2.5',
    titleSize: 'text-sm',
    iconSize: 14,
    gap: 'gap-1.5',
    badgeSize: 'text-[10px] px-1.5 py-0.5',
  },
  { 
    name: 'Normal', 
    value: 'md', 
    description: 'Equilibrio entre información y espacio',
    cardHeight: 'min-h-[80px]', 
    cardPadding: 'p-4',
    titleSize: 'text-base',
    iconSize: 18,
    gap: 'gap-2',
    badgeSize: 'text-xs px-2 py-1',
  },
  { 
    name: 'Expandido', 
    value: 'lg', 
    description: 'Máxima información visible',
    cardHeight: 'min-h-[100px]', 
    cardPadding: 'p-5',
    titleSize: 'text-lg',
    iconSize: 22,
    gap: 'gap-3',
    badgeSize: 'text-sm px-3 py-1.5',
  },
] as const;

export type TaskSizeValue = typeof TASK_SIZES[number]['value'];

/**
 * Opciones de opacidad para el color de fondo de las tareas
 * Controla qué tan visible es el color de la tarea
 */
export const TASK_OPACITIES = [
  { 
    name: 'Sutil', 
    value: 'low', 
    description: 'Color apenas visible',
    bgOpacity: '0.05',
    borderOpacity: '0.15',
    class: 'bg-opacity-[0.05] border-opacity-[0.15]',
  },
  { 
    name: 'Medio', 
    value: 'medium', 
    description: 'Color moderadamente visible',
    bgOpacity: '0.10',
    borderOpacity: '0.25',
    class: 'bg-opacity-[0.10] border-opacity-[0.25]',
  },
  { 
    name: 'Intenso', 
    value: 'high', 
    description: 'Color bien marcado',
    bgOpacity: '0.20',
    borderOpacity: '0.40',
    class: 'bg-opacity-[0.20] border-opacity-[0.40]',
  },
] as const;

export type TaskOpacityValue = typeof TASK_OPACITIES[number]['value'];

/**
 * Opciones de borde redondeado para las tarjetas de tareas
 * Controla el border-radius de la tarjeta
 */
export const TASK_BORDER_RADIUS = [
  { 
    name: 'Cuadrado', 
    value: 'none', 
    description: 'Esquinas rectas',
    class: 'rounded-none',
    previewClass: 'rounded-none',
  },
  { 
    name: 'Redondeado', 
    value: 'medium', 
    description: 'Esquinas suavemente redondeadas',
    class: 'rounded-xl',
    previewClass: 'rounded-lg',
  },
  { 
    name: 'Circular', 
    value: 'large', 
    description: 'Esquinas muy redondeadas',
    class: 'rounded-2xl',
    previewClass: 'rounded-xl',
  },
  { 
    name: 'Píldora', 
    value: 'full', 
    description: 'Completamente redondeado',
    class: 'rounded-3xl',
    previewClass: 'rounded-2xl',
  },
] as const;

export type TaskBorderRadiusValue = typeof TASK_BORDER_RADIUS[number]['value'];

// ============================================
// VALORES POR DEFECTO
// ============================================

/**
 * Configuración por defecto para nuevas tareas
 */
export const DEFAULT_TASK_CUSTOMIZATION = {
  /** Icono por defecto: Tarea simple */
  icon: 'CheckCircle' as TaskIconName,
  /** Tamaño por defecto: Normal */
  size: 'md' as TaskSizeValue,
  /** Opacidad por defecto: Medio */
  opacity: 'medium' as TaskOpacityValue,
  /** Borde redondeado por defecto: Redondeado */
  borderRadius: 'medium' as TaskBorderRadiusValue,
};

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Obtiene la configuración de un icono por su nombre
 */
export const getIconConfig = (iconName: string) => {
  return TASK_ICONS.find(icon => icon.icon === iconName) || TASK_ICONS[0];
};

/**
 * Obtiene la configuración de un tamaño por su valor
 */
export const getSizeConfig = (sizeValue: string) => {
  return TASK_SIZES.find(size => size.value === sizeValue) || TASK_SIZES[1]; // Default: Normal
};

/**
 * Obtiene la configuración de una opacidad por su valor
 */
export const getOpacityConfig = (opacityValue: string) => {
  return TASK_OPACITIES.find(opacity => opacity.value === opacityValue) || TASK_OPACITIES[1]; // Default: Medio
};

/**
 * Obtiene la configuración de borde redondeado por su valor
 */
export const getBorderRadiusConfig = (borderRadiusValue: string) => {
  return TASK_BORDER_RADIUS.find(br => br.value === borderRadiusValue) || TASK_BORDER_RADIUS[1]; // Default: Redondeado
};

/**
 * Aplica el color con la opacidad especificada
 * Retorna un objeto con las clases CSS necesarias
 */
export const getColorWithOpacity = (color: string, opacityValue: TaskOpacityValue) => {
  const opacityConfig = getOpacityConfig(opacityValue);
  
  // Convertir hex a rgb para aplicar opacidad
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, ${opacityConfig.bgOpacity})`,
    borderColor: `rgba(${r}, ${g}, ${b}, ${opacityConfig.borderOpacity})`,
    color: color,
  };
};