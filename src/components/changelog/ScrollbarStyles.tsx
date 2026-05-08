import React from 'react';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * ScrollbarStyles
 * 
 * Componente que inyecta estilos CSS personalizados para la barra de scroll
 * en navegadores WebKit (Chrome, Safari, Edge).
 * 
 * Características:
 * - Scrollbar de 8px de ancho
 * - Track transparente con bordes redondeados
 * - Thumb con gradiente emerald-teal-cyan
 * - Efecto hover que oscurece el gradiente
 * - Soporte para modo oscuro (gradiente más claro)
 * 
 * ⚠️ Solo funciona en navegadores basados en WebKit.
 * En Firefox se usa scrollbar-color y scrollbar-width (no incluido aquí).
 */
export const ScrollbarStyles: React.FC = () => (
  <style>{`
    /* ============================================
       SCROLLBAR PERSONALIZADA - WEBKIT
       ============================================ */
    
    /* Contenedor principal de la scrollbar */
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
    }

    /* Track (fondo de la scrollbar) */
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
      border-radius: 10px;
    }

    /* Thumb (barra deslizante) - Tema claro */
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #10b981, #14b8a6, #06b6d4);
      border-radius: 10px;
      transition: all 0.3s ease;
    }

    /* Thumb hover - Tema claro */
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #059669, #0d9488, #0891b2);
    }

    /* Thumb - Modo oscuro (colores más brillantes) */
    .dark .custom-scrollbar::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #34d399, #2dd4bf, #22d3ee);
    }

    /* Thumb hover - Modo oscuro */
    .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #6ee7b7, #5eead4, #67e8f9);
    }
  `}</style>
);

export default ScrollbarStyles;