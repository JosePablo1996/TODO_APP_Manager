import React, { useState } from 'react';
import { useThemeClasses } from '../hooks/useThemeClasses';
import { VersionCard } from '../components/changelog/VersionCard';
import { ChangelogHeader } from '../components/changelog/ChangelogHeader';
import { ChangelogFooter } from '../components/changelog/ChangelogFooter';
import { ScrollbarStyles } from '../components/changelog/ScrollbarStyles';
import { changelogVersions } from '../data/changelogData';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * ChangelogPage
 * 
 * Página principal del historial de cambios (changelog).
 * 
 * Estructura:
 * - Header sticky con botón volver
 * - Lista de tarjetas de versiones (expandibles)
 * - Footer con contador y créditos
 * 
 * Estado:
 * - expandedVersions: Set con las versiones actualmente expandidas
 * - Por defecto, la versión más reciente (v2.6.0) está expandida
 * 
 * Comportamiento:
 * - Solo una versión puede estar expandida a la vez
 * - Al hacer clic en una versión, se expande y las demás se colapsan
 */
const ChangelogPage: React.FC = () => {
  // ============================================
  // HOOKS
  // ============================================
  
  /** Clases de tema (claro/oscuro) */
  const classes = useThemeClasses();

  /** 
   * Set de versiones expandidas.
   * Solo una versión puede estar expandida a la vez.
   * Por defecto: v2.6.0 (la más reciente)
   */
  const [expandedVersion, setExpandedVersion] = useState<string | null>('2.6.0');

  // ============================================
  // MANEJADORES
  // ============================================

  /**
   * Alterna la expansión de una versión.
   * Si ya está expandida, la colapsa.
   * Si no, expande esta y colapsa las demás.
   */
  const toggleVersion = (version: string) => {
    setExpandedVersion(prev => 
      prev === version ? null : version
    );
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className={`min-h-screen ${classes.bg.primary}`}>
      {/* Header sticky con botón volver y título */}
      <ChangelogHeader classes={classes} />

      {/* Lista de versiones */}
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        {changelogVersions.map((version) => (
          <VersionCard
            key={version.version}
            version={version}
            isExpanded={expandedVersion === version.version}
            onToggle={() => toggleVersion(version.version)}
            classes={classes}
          />
        ))}

        {/* Footer con contador y créditos */}
        <ChangelogFooter
          versionCount={changelogVersions.length}
          lastUpdate="07 Mayo 2026"
          classes={classes}
        />
      </div>

      {/* Estilos CSS para scrollbar personalizada */}
      <ScrollbarStyles />
    </div>
  );
};

export default ChangelogPage;