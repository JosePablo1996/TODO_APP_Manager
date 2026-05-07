// src/components/ui/ConfettiEffect.tsx
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiEffectProps {
  isActive: boolean;
  duration?: number;
  onComplete?: () => void;
}

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  rotation: number;
  xOffset: number;
  yOffset: number;
  borderRadius: string;
}

// Generar piezas de confeti de forma determinista (fuera del componente para evitar recreación)
const generateConfettiPieces = (): ConfettiPiece[] => {
  const colors = [
    '#10b981', // emerald
    '#14b8a6', // teal
    '#06b6d4', // cyan
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
  ];

  const pieces: ConfettiPiece[] = [];
  
  for (let i = 0; i < 50; i++) {
    const left = (i * 7) % 100;
    const delay = ((i * 13) % 50) / 100;
    const durationVariation = 0.8 + ((i * 17) % 50) / 100;
    const size = 6 + ((i * 11) % 8);
    const rotation = (i * 37) % 360;
    const xOffset = ((i * 23) % 40) - 20;
    const yOffset = ((i * 29) % 40) - 20;
    const isCircle = (i * 41) % 2 === 0;
    
    pieces.push({
      id: i,
      left,
      delay,
      duration: durationVariation,
      size,
      color: colors[i % colors.length],
      rotation,
      xOffset,
      yOffset,
      borderRadius: isCircle ? '50%' : '2px',
    });
  }
  
  return pieces;
};

// Piezas de confeti pre-generadas
const CONFETTI_PIECES = generateConfettiPieces();

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({
  isActive,
  duration = 2000,
  onComplete,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Usar useEffect con un patrón que evita setState sincrónico directo
  useEffect(() => {
    if (isActive) {
      // Pequeño retraso para permitir que el efecto se complete
      const startTimer = setTimeout(() => {
        setShowConfetti(true);
      }, 0);
      
      const endTimer = setTimeout(() => {
        setShowConfetti(false);
        onComplete?.();
      }, duration);
      
      timeoutRef.current = endTimer;
      
      return () => {
        clearTimeout(startTimer);
        clearTimeout(endTimer);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    } else {
      // Si se desactiva antes de tiempo, limpiar
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowConfetti(false);
    }
  }, [isActive, duration, onComplete]);

  // Retornar null si no hay confeti activo
  if (!showConfetti) {
    return null;
  }

  return (
    <AnimatePresence>
      {/* Confeti flotante */}
      {CONFETTI_PIECES.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            y: '100vh',
            x: `${piece.left}%`,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: '-20vh',
            x: `${piece.left + piece.xOffset}%`,
            rotate: piece.rotation + piece.yOffset,
            opacity: 0,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'easeOut',
          }}
          className="fixed z-[200] pointer-events-none"
          style={{
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: piece.borderRadius,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        />
      ))}

      {/* Efecto de explosión central */}
      <motion.div
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 z-[199] pointer-events-none"
      />

      {/* Texto animado */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 0 }}
        animate={{ scale: 1, opacity: 1, y: -50 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ duration: 0.3, type: 'spring' }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] pointer-events-none text-center"
      >
        <div className="text-5xl mb-2">🎉</div>
        <div className="text-lg font-bold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 rounded-full shadow-lg">
          ¡Tarea completada!
        </div>
      </motion.div>
    </AnimatePresence>
  );
};