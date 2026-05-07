// src/components/ui/CircularMenu.tsx
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { X } from 'lucide-react';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  color: string;
  action: () => void;
  active?: boolean;
}

interface CircularMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
  centerColor?: string;
  centerIcon?: React.ReactNode;
}

const menuVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.5
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { 
      type: "spring", 
      damping: 20, 
      stiffness: 200,
      duration: 0.4 
    }
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: { 
      duration: 0.2 
    }
  }
};

export const CircularMenu: React.FC<CircularMenuProps> = ({
  isOpen,
  onClose,
  items,
  centerColor = '#10b981',
  centerIcon
}) => {
  const menuSize = 280;
  const itemCount = items.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Contenedor del menú centrado */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative pointer-events-auto"
              style={{ width: menuSize, height: menuSize }}
            >
              {/* Botón central */}
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ delay: 0.1, type: "spring", damping: 15, stiffness: 200 }}
                onClick={onClose}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl cursor-pointer z-10"
                style={{
                  background: `linear-gradient(135deg, ${centerColor}, ${centerColor}CC)`,
                  color: '#fff',
                  border: '3px solid rgba(255,255,255,0.8)',
                  boxShadow: `0 10px 25px -5px ${centerColor}`,
                }}
              >
                {centerIcon || <X className="w-7 h-7" />}
              </motion.button>

              {/* Ítems del menú circular */}
              {items.map((item, index) => {
                const angle = (index * 360) / itemCount - 90;
                const radius = menuSize * 0.35;
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;
                const Icon = item.icon;

                return (
                  <motion.button
                    key={index}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{
                      scale: 1,
                      x: x,
                      y: y,
                      transition: {
                        delay: 0.1 + index * 0.03,
                        type: 'spring',
                        stiffness: 350,
                        damping: 18
                      }
                    }}
                    exit={{ scale: 0, x: 0, y: 0 }}
                    whileHover={{ scale: 1.15, transition: { duration: 0.1 } }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      item.action();
                      onClose();
                    }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center shadow-xl cursor-pointer transition-all z-20"
                    style={{
                      background: item.active ? item.color : '#fff',
                      color: item.active ? '#fff' : item.color,
                      border: item.active ? '3px solid rgba(255,255,255,0.8)' : `3px solid ${item.color}`,
                      boxShadow: `0 8px 20px -4px ${item.color}`,
                    }}
                    title={item.label}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};