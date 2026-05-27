// src/components/widgets/GreetingWidget.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Cloud, CloudRain, CloudSnow, Wind, Sparkles, Clock as ClockIcon } from 'lucide-react';

interface GreetingWidgetProps {
  userName?: string;
  className?: string;
  compact?: boolean;
}

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  feelsLike: number;
}

const GreetingWidget: React.FC<GreetingWidgetProps> = ({ 
  userName = 'Usuario',
  className = '',
  compact = false
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  // Actualizar la hora cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Simular obtención del clima
  useEffect(() => {
    const mockWeather: WeatherData = {
      temp: 24,
      condition: 'Soleado',
      icon: 'sun',
      feelsLike: 26
    };
    
    setTimeout(() => {
      setWeather(mockWeather);
      setLoading(false);
    }, 500);
  }, []);

  // Determinar saludo según la hora (sin colores llamativos)
  const getGreeting = () => {
    const hour = currentTime.getHours();
    
    if (hour >= 5 && hour < 12) {
      return 'Buenos días';
    } else if (hour >= 12 && hour < 19) {
      return 'Buenas tardes';
    } else {
      return 'Buenas noches';
    }
  };

  // Formatear hora en 12 horas
  const formatTime = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  // Formatear fecha
  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    };
    const date = currentTime.toLocaleDateString('es-ES', options);
    return date.charAt(0).toUpperCase() + date.slice(1).replace(',', ' -');
  };

  // Obtener nombre completo del usuario
  const getFullName = () => {
    if (!userName || userName === 'Usuario') return 'Usuario';
    if (userName.includes(' ')) {
      return userName;
    }
    return userName;
  };

  // Obtener solo el primer nombre para el saludo compacto
  const getFirstName = () => {
    if (!userName || userName === 'Usuario') return 'Usuario';
    return userName.split(' ')[0];
  };

  // Obtener icono del clima (colores suaves)
  const getWeatherIcon = () => {
    if (!weather) return <Cloud className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />;
    
    switch (weather.icon) {
      case 'sun':
        return <Sun className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />;
      case 'cloud':
        return <Cloud className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />;
      case 'rain':
        return <CloudRain className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />;
      case 'snow':
        return <CloudSnow className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-500" />;
      case 'wind':
        return <Wind className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />;
      default:
        return <Sun className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />;
    }
  };

  const greetingText = getGreeting();

  // Versión compacta para móvil
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`w-full ${className}`}
        role="region"
        aria-label="Widget de saludo y clima"
      >
        <div className="flex items-center justify-between p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 shadow-sm">
              {greetingText === 'Buenos días' && <Sun className="w-4 h-4 text-amber-500" />}
              {greetingText === 'Buenas tardes' && <Sun className="w-4 h-4 text-amber-500" />}
              {greetingText === 'Buenas noches' && <Moon className="w-4 h-4 text-indigo-400" />}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {greetingText}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  {formatDate()}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-0.5">
                  <ClockIcon size={8} className="text-gray-400" />
                  <span className="text-[10px] font-mono text-gray-600 dark:text-gray-400">
                    {formatTime()}
                  </span>
                </div>
                {!loading && weather && (
                  <div className="flex items-center gap-0.5">
                    {getWeatherIcon()}
                    <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
                      {weather.temp}°
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles size={10} className="text-gray-400" />
            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
              {getFirstName()}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Versión completa para desktop - COLORES NEUTROS Y LEGIBLES
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full ${className}`}
      role="region"
      aria-label="Widget de saludo y clima"
    >
      <div className="relative overflow-hidden rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-md">
        {/* Efectos decorativos sutiles */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 pointer-events-none" />
        
        {/* Borde decorativo superior */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-t-xl" />
        
        <div className="relative py-3 px-4 sm:py-4 sm:px-6">
          {/* Fila 1: Saludo + Fecha */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 shadow-sm">
              {greetingText === 'Buenos días' && <Sun className="w-5 h-5 text-amber-500" />}
              {greetingText === 'Buenas tardes' && <Sun className="w-5 h-5 text-amber-500" />}
              {greetingText === 'Buenas noches' && <Moon className="w-5 h-5 text-indigo-400" />}
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 tracking-wide">
              {greetingText}
            </h2>
            <span 
              className="text-[10px] sm:text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700"
              aria-label="Fecha actual"
            >
              {formatDate()}
            </span>
          </div>

          {/* Fila 2: Nombre del usuario */}
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Sparkles size={12} className="text-gray-400" aria-hidden="true" />
            <span 
              className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 tracking-wide"
              style={{
                fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
              }}
              aria-label={`Bienvenido, ${getFullName()}`}
            >
              {getFullName()}
            </span>
          </div>

          {/* Fila 3: Hora y clima */}
          <div className="flex items-center justify-center gap-5 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-1.5">
              <ClockIcon size={12} className="text-gray-400" aria-hidden="true" />
              <div>
                <span className="text-sm font-mono font-medium text-gray-700 dark:text-gray-300">
                  {formatTime()}
                </span>
                <span className="sr-only">Hora local</span>
              </div>
            </div>
            
            {!loading && weather && (
              <div className="flex items-center gap-1.5">
                <div className="p-0.5 rounded bg-gray-100 dark:bg-gray-700">
                  {getWeatherIcon()}
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {weather.temp}°
                  </span>
                  <span className="text-[8px] text-gray-500">C</span>
                  <span className="sr-only">grados centígrados</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GreetingWidget;