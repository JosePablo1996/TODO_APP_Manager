import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeClasses } from '../hooks/useThemeClasses';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Sparkles, 
  HelpCircle,
  BookOpen,
  MessageCircle,
  Mail,
  Github,
  ChevronDown,
  Search,
  Settings,
  Key,
  Shield,
  Heart,
  AlertCircle,
  CheckCircle,
  Zap,
  X,
  Coffee,
  Users,
  Lightbulb,
  Rocket,
  Clock,
  Target,
  Info,
  LayoutGrid,
  Smartphone,
  Cloud,
  Fingerprint,
  Bell,
  RefreshCw,
  Save,
  BarChart} from 'lucide-react';

// ============================================
// COMPONENTES AUXILIARES
// ============================================

const SectionHeader = ({ title, icon }: { title: string; icon?: React.ReactNode }) => {
  const classes = useThemeClasses();
  
  return (
    <div className="flex items-center gap-2 mb-4 px-2">
      <div className="w-1 h-5 bg-gradient-to-b from-emerald-500 via-teal-500 to-cyan-500 rounded-full" />
      <h2 className={`text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${classes.text.secondary}`}>
        {icon && <span className={classes.icon.secondary}>{icon}</span>}
        {title}
      </h2>
    </div>
  );
};

const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const classes = useThemeClasses();
  
  return (
    <motion.div 
      whileHover={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
      className={`rounded-2xl backdrop-blur-xl border overflow-hidden mb-6 ${classes.bg.card} ${classes.border.primary} shadow-lg ${className}`}
    >
      {children}
    </motion.div>
  );
};

const HelpTile = ({
  icon,
  iconColor,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
  onClick?: () => void;
}) => {
  const classes = useThemeClasses();
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-5 rounded-xl border cursor-pointer transition-all duration-200 ${classes.bg.card} ${classes.border.primary} hover:shadow-xl`}
    >
      <div className="flex items-start gap-4">
        <motion.div 
          whileHover={{ rotate: 5 }}
          className={`p-3 rounded-xl ${iconColor} shadow-md`}
        >
          {icon}
        </motion.div>
        <div className="flex-1">
          <h3 className={`font-semibold text-base ${classes.text.primary}`}>{title}</h3>
          <p className={`text-sm mt-1.5 ${classes.text.muted} leading-relaxed`}>{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

const FaqItem = ({ 
  question, 
  answer 
}: { 
  question: string; 
  answer: string | string[];
}) => {
  const classes = useThemeClasses();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border-b last:border-b-0 ${classes.border.primary}`}>
      <motion.button
        whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-5 text-left transition-all`}
        aria-label={isOpen ? `Cerrar respuesta de: ${question}` : `Abrir respuesta de: ${question}`}
      >
        <span className={`font-medium ${classes.text.primary}`}>{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className={`${classes.icon.secondary}`}
        >
          <ChevronDown size={18} />
        </motion.div>
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className={`px-5 pb-5 ${classes.text.secondary}`}>
              {Array.isArray(answer) ? (
                <ul className="space-y-2.5">
                  {answer.map((item, index) => (
                    <li key={index} className="text-sm flex items-start gap-3">
                      <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-relaxed">{answer}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Modal de guía rápida mejorado
const GuideModal = ({ 
  isOpen, 
  onClose, 
  title, 
  icon, 
  steps,
  tips 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  icon: React.ReactNode;
  steps: string[];
  tips?: string[];
}) => {
  const classes = useThemeClasses();

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`relative w-full max-w-lg rounded-2xl overflow-hidden ${classes.bg.card} border-2 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-5">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 10 }}
              className="p-3 bg-white/20 rounded-xl"
            >
              {icon}
            </motion.div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-5 right-5 p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            aria-label="Cerrar modal"
          >
            <X size={18} className="text-white" />
          </motion.button>
        </div>

        <div className="p-6">
          {/* Pasos a seguir */}
          <div className="mb-6">
            <h4 className={`font-semibold mb-4 flex items-center gap-2 text-base ${classes.text.primary}`}>
              <Zap size={18} className="text-emerald-500" />
              Pasos a seguir:
            </h4>
            <ul className="space-y-3">
              {steps.map((step, index) => (
                <motion.li 
                  key={index} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <span className={`w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold flex items-center justify-center mt-0.5 flex-shrink-0 shadow-md`}>
                    {index + 1}
                  </span>
                  <span className={`text-sm ${classes.text.secondary} leading-relaxed`}>{step}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Consejos adicionales */}
          {tips && tips.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20`}
            >
              <h4 className={`font-semibold mb-3 flex items-center gap-2 ${classes.text.primary}`}>
                <Lightbulb size={16} className="text-amber-500" />
                Consejos útiles:
              </h4>
              <ul className="space-y-2">
                {tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-amber-500 mt-0.5">💡</span>
                    <span className={classes.text.muted}>{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Botón de cerrar */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className={`w-full mt-6 py-3 rounded-xl font-medium transition-all bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 shadow-lg`}
          >
            ¡Entendido!
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const HelpPage: React.FC = () => {
  const navigate = useNavigate();
  const classes = useThemeClasses();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'acerca' | 'guia' | 'faq' | 'contacto'>('acerca');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Características principales de TodoAppManager
  const features = [
    {
      icon: <LayoutGrid className="w-5 h-5 text-emerald-500" />,
      iconColor: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20',
      title: 'Gestión de Tareas',
      description: 'Crea, edita, organiza y prioriza tus tareas diarias con un sistema intuitivo de arrastrar y soltar.',
      details: 'Categoriza por Personal, Trabajo, Estudio y más. Establece prioridades y fechas límite.',
    },
    {
      icon: <Smartphone className="w-5 h-5 text-teal-500" />,
      iconColor: 'bg-gradient-to-br from-teal-500/20 to-cyan-500/20',
      title: 'Multiplataforma',
      description: 'Accede a tus tareas desde cualquier dispositivo. Sincronización en tiempo real entre web y móvil.',
      details: 'Disponible en navegador web y aplicación móvil. Tus datos siempre actualizados.',
    },
    {
      icon: <Cloud className="w-5 h-5 text-cyan-500" />,
      iconColor: 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20',
      title: 'Sincronización en la Nube',
      description: 'Todas tus tareas se sincronizan automáticamente con el backend. Nunca pierdes tu información.',
      details: 'Backup automático, restauración de datos y exportación/importación de tareas en formato JSON.',
    },
    {
      icon: <Fingerprint className="w-5 h-5 text-indigo-500" />,
      iconColor: 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20',
      title: 'Seguridad Avanzada',
      description: 'Protege tu cuenta con autenticación biométrica, 2FA y códigos OTP por email.',
      details: 'Passkeys, autenticación de dos factores (TOTP), inicio de sesión sin contraseña y más.',
    },
    {
      icon: <Bell className="w-5 h-5 text-amber-500" />,
      iconColor: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20',
      title: 'Notificaciones',
      description: 'Recibe alertas cuando crees, actualices o completes tareas. Mantente al día.',
      details: 'Sistema de notificaciones en tiempo real con indicador de no leídas.',
    },
    {
      icon: <RefreshCw className="w-5 h-5 text-purple-500" />,
      iconColor: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
      title: 'Papelera y Recuperación',
      description: 'Elimina tareas con soft delete. Recupéralas de la papelera cuando lo necesites.',
      details: 'Las tareas eliminadas se conservan 30 días. Eliminación masiva y restauración con un clic.',
    },
    {
      icon: <Save className="w-5 h-5 text-green-500" />,
      iconColor: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
      title: 'Copia de Seguridad',
      description: 'Realiza backups completos de tus tareas con un solo clic. Restaura cuando quieras.',
      details: 'Backup automático con barra de progreso, exportación manual a JSON e importación.',
    },
    {
      icon: <BarChart className="w-5 h-5 text-blue-500" />,
      iconColor: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
      title: 'Estadísticas y Calendario',
      description: 'Visualiza tu productividad con gráficos. Organiza tus tareas en el calendario.',
      details: 'Dashboard de estadísticas, vista semanal/mensual, racha de productividad y más.',
    },
  ];

  // Guías rápidas con contenido detallado
  const quickGuides = [
    {
      id: 'primeros-pasos',
      icon: <Rocket className="w-5 h-5 text-amber-500" />,
      iconColor: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20',
      title: 'Primeros pasos',
      description: 'Guía básica para comenzar a usar TodoAppManager',
      steps: [
        'Regístrate o inicia sesión con tu cuenta',
        'En la página principal, haz clic en "+ Nueva tarea"',
        'Completa los detalles de tu primera tarea',
        'Organiza tus tareas por categorías y prioridades',
        'Marca las tareas como completadas cuando termines'
      ],
      tips: [
        'Puedes editar cualquier tarea haciendo clic en ella',
        'Usa el buscador para encontrar tareas rápidamente',
        'Las tareas se sincronizan automáticamente en todos tus dispositivos'
      ]
    },
    {
      id: 'autenticacion',
      icon: <Key className="w-5 h-5 text-emerald-500" />,
      iconColor: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20',
      title: 'Autenticación y 2FA',
      description: 'Cómo iniciar sesión y proteger tu cuenta',
      steps: [
        'Usa tu email y contraseña para iniciar sesión',
        'Activa la autenticación de dos factores (2FA) desde Configuración',
        'Escanea el código QR con Google Authenticator',
        'Ingresa el código de 6 dígitos para completar el login',
        'Si olvidaste tu contraseña, usa "¿Olvidaste tu contraseña?"'
      ],
      tips: [
        'La autenticación 2FA protege tu cuenta de accesos no autorizados',
        'Guarda tus códigos de respaldo en un lugar seguro',
        'Puedes usar Passkeys para un inicio de sesión más rápido'
      ]
    },
    {
      id: 'seguridad',
      icon: <Shield className="w-5 h-5 text-cyan-500" />,
      iconColor: 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20',
      title: 'Seguridad',
      description: 'Consejos para mantener tu cuenta segura',
      steps: [
        'Usa contraseñas de al menos 8 caracteres con símbolos',
        'Combina mayúsculas, minúsculas, números y caracteres especiales',
        'No uses la misma contraseña en múltiples servicios',
        'Activa la verificación en dos pasos (2FA)',
        'Revisa regularmente tu actividad de inicio de sesión'
      ],
      tips: [
        'Al cambiar tu contraseña, todas tus sesiones se cerrarán automáticamente',
        'Recibirás una notificación por email cuando cambies tu contraseña',
        'Si sospechas actividad sospechosa, cambia tu contraseña inmediatamente'
      ]
    },
    {
      id: 'configuracion',
      icon: <Settings className="w-5 h-5 text-teal-500" />,
      iconColor: 'bg-gradient-to-br from-teal-500/20 to-green-500/20',
      title: 'Configuración',
      description: 'Personaliza tu experiencia en TodoAppManager',
      steps: [
        'Accede a Configuración desde el menú lateral',
        'Cambia entre modo claro y oscuro con el toggle',
        'Configura tu perfil: foto, nombre y biografía',
        'Gestiona tus Passkeys y autenticación 2FA',
        'Elige cómo ordenar tus tareas: por fecha, título o prioridad'
      ],
      tips: [
        'Puedes subir tu avatar desde la sección de perfil',
        'Las preferencias se guardan automáticamente',
        'Activa el auto-guardado para no perder cambios'
      ]
    }
  ];

  // Preguntas frecuentes actualizadas
  const faqs = [
    {
      question: '📝 ¿Cómo creo una nueva tarea?',
      answer: [
        'En la página principal, haz clic en el botón "+ Nueva tarea"',
        'Completa el título de la tarea',
        'Opcionalmente puedes añadir descripción, prioridad, categoría y fecha límite',
        'Haz clic en "Agregar tarea" para guardarla',
      ],
    },
    {
      question: '🔐 ¿Cómo activo la autenticación de dos factores (2FA)?',
      answer: [
        'Ve a Configuración > Seguridad',
        'Expande la sección "Autenticación de Dos Factores (2FA)"',
        'Haz clic en "Configurar 2FA"',
        'Escanea el código QR con Google Authenticator o Authy',
        'Ingresa el código de verificación para confirmar',
        'Guarda tus códigos de respaldo en un lugar seguro',
      ],
    },
    {
      question: '🔑 ¿Qué son las Passkeys y cómo las uso?',
      answer: [
        'Las Passkeys te permiten iniciar sesión con huella digital, Face ID o PIN',
        'Ve a Configuración > Seguridad > Claves de acceso',
        'Haz clic en "Registrar nueva Passkey"',
        'Sigue las instrucciones de tu dispositivo',
        'La próxima vez podrás iniciar sesión sin contraseña',
      ],
    },
    {
      question: '🌙 ¿Cómo cambio entre modo claro y oscuro?',
      answer: [
        'En Configuración > Apariencia, usa el toggle de Modo oscuro',
        'O haz clic en el botón de sol/luna en la esquina superior',
        'La preferencia se guardará automáticamente',
      ],
    },
    {
      question: '🔍 ¿Cómo filtro y busco tareas?',
      answer: [
        'Usa la barra de búsqueda en la parte superior',
        'Puedes buscar por título o descripción',
        'Los filtros te permiten organizar por estado, categoría y prioridad',
      ],
    },
    {
      question: '🗑️ ¿Cómo elimino o archivo una tarea?',
      answer: [
        'Desliza la tarea hacia la izquierda para eliminarla',
        'O usa el checkbox para seleccionar múltiples tareas y eliminarlas',
        'Las tareas eliminadas van a la papelera',
        'Puedes recuperarlas desde la sección de Papelera',
      ],
    },
    {
      question: '💾 ¿Cómo hago una copia de seguridad de mis tareas?',
      answer: [
        'Ve a Configuración > Copia de Seguridad',
        'Usa "Backup Automático" para guardar todas tus tareas',
        'O "Exportar Manual" para descargar un archivo JSON',
        'Puedes restaurar tus tareas desde cualquier backup guardado',
        'También puedes importar tareas desde un archivo JSON',
      ],
    },
    {
      question: '👤 ¿Cómo actualizo mi foto de perfil?',
      answer: [
        'Ve a la página de perfil desde el menú lateral',
        'Haz clic en el botón de cámara sobre tu avatar',
        'Selecciona una imagen desde tu dispositivo',
        'La imagen se subirá automáticamente',
      ],
    },
    {
      question: '📊 ¿Cómo veo mis estadísticas?',
      answer: [
        'Desde el menú lateral, selecciona "Estadísticas"',
        'Podrás ver tu progreso, tareas completadas y productividad',
        'Los gráficos te muestran tu rendimiento semanal y mensual',
      ],
    },
    {
      question: '📱 ¿La app funciona en el móvil?',
      answer: [
        '¡Sí! TodoAppManager es completamente responsive',
        'Accede desde tu navegador móvil a la misma URL',
        'Todas las funcionalidades están optimizadas para pantallas táctiles',
        'Usa gestos swipe para completar o eliminar tareas rápidamente',
      ],
    },
  ];

  // Filtrar FAQs por búsqueda
  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (Array.isArray(faq.answer) && faq.answer.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const handleGuideClick = (guideId: string) => {
    setActiveModal(guideId);
  };

  const getActiveGuide = () => {
    return quickGuides.find(guide => guide.id === activeModal);
  };

  const activeGuide = getActiveGuide();

  return (
    <>
      <div className={`min-h-screen ${classes.bg.primary}`}>
        {/* Header mejorado */}
        <div className={`sticky top-0 z-10 backdrop-blur-xl border-b ${classes.border.primary} ${classes.bg.card}`}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/configuracion')}
                className={`p-2.5 rounded-xl transition-colors ${classes.bg.hover}`}
                aria-label="Volver a configuración"
                title="Volver a configuración"
              >
                <ArrowLeft className={`w-5 h-5 ${classes.icon.secondary}`} />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-7 bg-gradient-to-b from-emerald-500 via-teal-500 to-cyan-500 rounded-full" />
                <h1 className={`text-xl font-bold flex items-center gap-2 ${classes.text.primary}`}>
                  <HelpCircle className="text-emerald-500" size={22} />
                  Centro de Ayuda
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Banner de bienvenida mejorado */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 shadow-xl"
          >
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className="relative z-10 flex flex-col items-center text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-14 h-14 text-white mb-4" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">¿Cómo podemos ayudarte?</h2>
              <p className="text-white/90 text-base max-w-lg">
                Encuentra respuestas a tus preguntas y guías para aprovechar al máximo TodoAppManager
              </p>
            </div>
          </motion.div>

          {/* Buscador mejorado */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`relative ${classes.bg.card} ${classes.border.primary} border rounded-xl p-2 shadow-md`}
          >
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${classes.icon.secondary}`} size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en el centro de ayuda..."
              className={`w-full pl-12 pr-10 py-3.5 bg-transparent border-none focus:outline-none ${classes.text.primary} placeholder:${classes.text.muted} text-base`}
              aria-label="Buscar en el centro de ayuda"
            />
            {searchQuery && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                onClick={() => setSearchQuery('')}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full ${classes.bg.hover}`}
                aria-label="Limpiar búsqueda"
                title="Limpiar búsqueda"
              >
                <X size={16} className={classes.icon.secondary} />
              </motion.button>
            )}
          </motion.div>

          {/* Tabs de navegación mejorados */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`flex gap-2 p-1.5 rounded-xl border ${classes.bg.card} ${classes.border.primary} shadow-md overflow-x-auto`}
          >
            {[
              { id: 'acerca', icon: Info, label: 'Acerca de' },
              { id: 'guia', icon: BookOpen, label: 'Guías Rápidas' },
              { id: 'faq', icon: MessageCircle, label: 'Preguntas Frecuentes' },
              { id: 'contacto', icon: Mail, label: 'Contacto' }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                    : `${classes.text.secondary} hover:${classes.bg.hover}`
                }`}
                aria-label={`Ver ${tab.label}`}
              >
                <tab.icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Contenido según tab */}
          <AnimatePresence mode="wait">
            {/* NUEVA SECCIÓN: ACERCA DE TODOAPPMANAGER */}
            {activeTab === 'acerca' && (
              <motion.div
                key="acerca"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <SectionHeader title="¿Qué es TodoAppManager?" icon={<Info size={14} />} />
                
                {/* Descripción principal */}
                <GlassCard>
                  <div className="p-6 md:p-8">
                    <div className="flex items-start gap-4 mb-6">
                      <motion.div 
                        whileHover={{ rotate: 10 }}
                        className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-xl flex-shrink-0"
                      >
                        <LayoutGrid className="w-8 h-8 text-white" />
                      </motion.div>
                      <div>
                        <h3 className={`text-xl font-bold mb-3 ${classes.text.primary}`}>
                          Tu gestor de tareas inteligente
                        </h3>
                        <p className={`text-sm leading-relaxed ${classes.text.secondary}`}>
                          <strong className={classes.text.primary}>TodoAppManager</strong> es una aplicación web y móvil 
                          diseñada para ayudarte a organizar tu vida diaria. Gestiona tus tareas personales, laborales 
                          y de estudio en un solo lugar, con sincronización en tiempo real entre todos tus dispositivos.
                        </p>
                      </div>
                    </div>

                    <div className={`p-5 rounded-xl border ${classes.bg.secondary} ${classes.border.primary} mb-6`}>
                      <p className={`text-sm leading-relaxed ${classes.text.secondary}`}>
                        Desarrollada con tecnologías modernas como <strong className={classes.text.primary}>React + TypeScript</strong> en el 
                        frontend y <strong className={classes.text.primary}>FastAPI + Supabase</strong> en el backend, TodoAppManager 
                        ofrece una experiencia fluida, segura y responsive. La aplicación incluye autenticación avanzada 
                        con Passkeys biométricas, verificación en dos pasos (2FA), inicio de sesión sin contraseña por 
                        OTP, copias de seguridad, papelera con soft delete, estadísticas de productividad y mucho más.
                      </p>
                    </div>

                    {/* Características principales */}
                    <h4 className={`font-semibold mb-4 flex items-center gap-2 ${classes.text.primary}`}>
                      <Sparkles size={18} className="text-emerald-500" />
                      Características principales
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          className={`p-4 rounded-xl border transition-all ${classes.bg.card} ${classes.border.primary} hover:shadow-md`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2.5 rounded-lg ${feature.iconColor} flex-shrink-0`}>
                              {feature.icon}
                            </div>
                            <div>
                              <h5 className={`font-semibold text-sm ${classes.text.primary}`}>{feature.title}</h5>
                              <p className={`text-xs mt-1 ${classes.text.muted} leading-relaxed`}>{feature.description}</p>
                              <p className={`text-xs mt-1.5 ${classes.text.secondary} leading-relaxed`}>{feature.details}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </GlassCard>

                {/* Versión y tecnología */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={`p-6 rounded-xl border bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 ${classes.border.primary}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
                      <Info className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className={`font-semibold text-base ${classes.text.primary}`}>
                        Versión actual: v2.6.0
                      </h3>
                      <p className={`text-sm mt-1 ${classes.text.muted} leading-relaxed`}>
                        Esta versión incluye sincronización completa con backend, sistema de copia de seguridad 
                        (backup/restore), eliminación masiva con swipe, reset de contraseña por OTP y múltiples 
                        mejoras de rendimiento y seguridad. Desarrollada con React 18, TypeScript, FastAPI, 
                        Supabase y Tailwind CSS.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'guia' && (
              <motion.div
                key="guia"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <SectionHeader title="Guías rápidas" icon={<BookOpen size={14} />} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {quickGuides.map((guide, index) => (
                    <HelpTile 
                      key={index}
                      icon={guide.icon}
                      iconColor={guide.iconColor}
                      title={guide.title}
                      description={guide.description}
                      onClick={() => handleGuideClick(guide.id)}
                    />
                  ))}
                </div>
                
                {/* Consejo rápido */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className={`p-6 rounded-xl border bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 ${classes.border.primary}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
                      <Target className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className={`font-semibold text-lg ${classes.text.primary}`}>Consejo rápido</h3>
                      <p className={`text-sm mt-2 ${classes.text.muted} leading-relaxed`}>
                        Puedes acceder rápidamente a tus tareas más importantes usando la sección de "Favoritos".
                        Solo marca la estrella en cualquier tarea para agregarla a tus favoritos.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'faq' && (
              <motion.div
                key="faq"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <SectionHeader title="Preguntas Frecuentes" icon={<MessageCircle size={14} />} />
                
                {filteredFaqs.length > 0 ? (
                  <GlassCard>
                    {filteredFaqs.map((faq, index) => (
                      <FaqItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                  </GlassCard>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-center py-16 rounded-2xl border ${classes.bg.card} ${classes.border.primary}`}
                  >
                    <AlertCircle className={`w-14 h-14 mx-auto mb-4 ${classes.icon.secondary} opacity-50`} />
                    <p className={`text-lg ${classes.text.primary}`}>No se encontraron resultados</p>
                    <p className={`text-sm mt-1 ${classes.text.muted}`}>para "{searchQuery}"</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSearchQuery('')}
                      className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-medium shadow-md"
                      aria-label="Limpiar búsqueda"
                    >
                      Limpiar búsqueda
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'contacto' && (
              <motion.div
                key="contacto"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <SectionHeader title="Contacto y Soporte" icon={<Mail size={14} />} />
                
                <GlassCard>
                  <div className="p-6 md:p-8 space-y-8">
                    <div className="text-center">
                      <motion.div 
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-5 shadow-xl"
                      >
                        <Users className="w-12 h-12 text-white" />
                      </motion.div>
                      <h3 className={`text-xl font-bold mb-2 ${classes.text.primary}`}>¿Necesitas ayuda personalizada?</h3>
                      <p className={`text-sm ${classes.text.secondary} max-w-md mx-auto`}>
                        Estoy aquí para ayudarte. Puedes contactarme por cualquiera de estos medios.
                      </p>
                    </div>

                    {/* Datos de contacto */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.a
                        whileHover={{ scale: 1.02, y: -2 }}
                        href="mailto:pabloquintanilla988@gmail.com"
                        className={`p-5 rounded-xl border flex items-center gap-4 ${classes.bg.card} ${classes.border.primary} hover:shadow-lg transition-all`}
                      >
                        <div className="p-3.5 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20">
                          <Mail className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold ${classes.text.primary}`}>Correo electrónico</h4>
                          <p className={`text-sm ${classes.text.muted} break-all`}>pabloquintanilla988@gmail.com</p>
                        </div>
                      </motion.a>

                      <motion.a
                        whileHover={{ scale: 1.02, y: -2 }}
                        href="https://github.com/JosePablo1996"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-5 rounded-xl border flex items-center gap-4 ${classes.bg.card} ${classes.border.primary} hover:shadow-lg transition-all`}
                      >
                        <div className="p-3.5 rounded-xl bg-gradient-to-br from-gray-800/20 to-gray-900/20">
                          <Github className="w-6 h-6 text-gray-800 dark:text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold ${classes.text.primary}`}>GitHub</h4>
                          <p className={`text-sm ${classes.text.muted}`}>@JosePablo1996</p>
                        </div>
                      </motion.a>
                    </div>

                    {/* Invitación a ver proyectos */}
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      className={`p-5 rounded-xl border bg-gradient-to-br from-purple-500/5 to-pink-500/5 ${classes.border.primary}`}
                    >
                      <div className="flex items-center gap-4">
                        <Coffee className="w-8 h-8 text-amber-500" />
                        <div>
                          <p className={`text-sm ${classes.text.secondary}`}>
                            ¿Quieres ver más de mis proyectos? Visita mi perfil de GitHub para descubrir otras aplicaciones y contribuciones open source.
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Tiempo de respuesta */}
                    <div className={`border-t pt-6 ${classes.border.primary}`}>
                      <h4 className={`font-medium text-center mb-4 ${classes.text.primary}`}>
                        <Clock size={16} className="inline mr-2" />
                        Tiempo de respuesta estimado
                      </h4>
                      <div className="flex justify-center gap-6 text-sm">
                        <div className="text-center">
                          <div className={`text-2xl font-bold text-emerald-500`}>&lt; 24h</div>
                          <div className={`text-xs ${classes.text.muted}`}>Email</div>
                        </div>
                        <div className={`w-px h-8 ${classes.border.primary}`} />
                        <div className="text-center">
                          <div className={`text-2xl font-bold text-emerald-500`}>&lt; 12h</div>
                          <div className={`text-xs ${classes.text.muted}`}>GitHub</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer mejorado */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`mt-10 pt-6 border-t text-center ${classes.border.primary}`}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
              </motion.div>
              <span className={`text-sm ${classes.text.secondary}`}>
                Centro de ayuda de TodoAppManager v2.6.0 - Supabase Edition
              </span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              >
                <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
              </motion.div>
            </div>
            <p className={`text-xs ${classes.text.muted}`}>
              ¿No encuentras lo que buscas? Contáctame directamente y te ayudaré a resolver tu consulta.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Modal de guía rápida */}
      <AnimatePresence>
        {activeModal && activeGuide && (
          <GuideModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            title={activeGuide.title}
            icon={activeGuide.icon}
            steps={activeGuide.steps}
            tips={activeGuide.tips}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default HelpPage;