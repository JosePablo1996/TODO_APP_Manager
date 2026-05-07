// src/components/ui/Portal.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
}

export const Portal = ({ children }: PortalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Pequeño delay para asegurar que el DOM está listo
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    
    return () => {
      clearTimeout(timer);
      setMounted(false);
    };
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
};

export default Portal;