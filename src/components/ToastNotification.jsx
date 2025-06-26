// components/ToastNotification.jsx - Sistema de notificaciones con iconos profesionales
import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle,     // Para success
  AlertCircle,     // Para error  
  AlertTriangle,   // Para warning
  Info,           // Para info
  X,              // Para cerrar
  Pause,          // Para pausado
  Trash2,         // Para limpiar todo
  Bell            // Para contador
} from 'lucide-react';

// Componente individual de Toast
const Toast = ({ toast, onRemove, index = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [timeLeft, setTimeLeft] = useState(toast.duration || 3000);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const progressRef = useRef(null);

  // Mostrar toast con animación de entrada
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  // Manejar temporizador con pausa
  useEffect(() => {
    if (isPaused || isRemoving || toast.duration === Infinity) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 100) {
          handleRemove();
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(timerRef.current);
  }, [isPaused, isRemoving, toast.duration]);

  // Función para remover con animación
  const handleRemove = () => {
    if (isRemoving) return;
    
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  // Pausar/reanudar al hover
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  // Obtener configuración por tipo con iconos profesionales
  const getToastConfig = (type) => {
    const configs = {
      success: {
        icon: <CheckCircle size={20} />,
        bgColor: 'var(--success-50)',
        borderColor: 'var(--success-500)',
        textColor: 'var(--success-800)',
        progressColor: 'var(--success-500)',
        iconColor: 'var(--success-600)'
      },
      error: {
        icon: <AlertCircle size={20} />,
        bgColor: 'var(--error-50)',
        borderColor: 'var(--error-500)',
        textColor: 'var(--error-800)',
        progressColor: 'var(--error-500)',
        iconColor: 'var(--error-600)'
      },
      warning: {
        icon: <AlertTriangle size={20} />,
        bgColor: 'var(--warning-50)',
        borderColor: 'var(--warning-500)',
        textColor: 'var(--warning-800)',
        progressColor: 'var(--warning-500)',
        iconColor: 'var(--warning-600)'
      },
      info: {
        icon: <Info size={20} />,
        bgColor: 'var(--info-50)',
        borderColor: 'var(--info-500)',
        textColor: 'var(--info-800)',
        progressColor: 'var(--info-500)',
        iconColor: 'var(--info-600)'
      }
    };
    return configs[type] || configs.info;
  };

  const config = getToastConfig(toast.type);
  const progressPercentage = toast.duration === Infinity ? 100 : 
    ((toast.duration - timeLeft) / toast.duration) * 100;

  return (
    <div
      className={`toast ${toast.type || 'info'} ${isVisible ? 'toast--visible' : ''} ${isRemoving ? 'toast--removing' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        backgroundColor: config.bgColor,
        borderLeftColor: config.borderColor,
        color: config.textColor,
        transform: `translateY(${isVisible ? 0 : -20}px)`,
        opacity: isVisible && !isRemoving ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      role="alert"
      aria-live="polite"
    >
      {/* Contenido principal */}
      <div className="toast-content">
        <div 
          className="toast-icon" 
          style={{ color: config.iconColor }}
          aria-hidden="true"
        >
          {config.icon}
        </div>
        <div className="toast-message">
          {toast.message}
        </div>
        <button
          onClick={handleRemove}
          className="toast-close"
          title="Cerrar notificación"
          aria-label="Cerrar notificación"
        >
          <X size={16} />
        </button>
      </div>

      {/* Barra de progreso */}
      {toast.duration !== Infinity && (
        <div className="toast-progress" aria-hidden="true">
          <div 
            className="toast-progress-bar"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: config.progressColor,
              opacity: isPaused ? 0.5 : 1
            }}
          />
        </div>
      )}

      {/* Indicador de pausa */}
      {isPaused && toast.duration !== Infinity && (
        <div className="toast-pause-indicator" aria-hidden="true">
          <Pause size={12} />
        </div>
      )}
    </div>
  );
};

// Contenedor principal de toasts
export const ToastContainer = ({ toasts, removeToast, position = 'top-right', maxVisible = 5 }) => {
  const [visibleToasts, setVisibleToasts] = useState([]);

  // Gestionar toasts visibles con límite
  useEffect(() => {
    const sortedToasts = [...toasts]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, maxVisible);
    
    setVisibleToasts(sortedToasts);
  }, [toasts, maxVisible]);

  // Limpiar todos los toasts
  const clearAll = () => {
    toasts.forEach(toast => removeToast(toast.id));
  };

  if (visibleToasts.length === 0) return null;

  const getContainerClasses = () => {
    return [
      'toast-container',
      `toast-container--${position}`
    ].join(' ');
  };

  return (
    <div className={getContainerClasses()} aria-label="Notificaciones">
      {/* Header con contador y acción limpiar */}
      {visibleToasts.length > 1 && (
        <div className="toast-header">
          <span className="toast-counter">
            <Bell size={14} />
            {visibleToasts.length} notificación{visibleToasts.length !== 1 ? 'es' : ''}
          </span>
          <button 
            onClick={clearAll}
            className="toast-clear-all"
            title="Limpiar todas las notificaciones"
          >
            <Trash2 size={14} />
            Limpiar todo
          </button>
        </div>
      )}

      {/* Lista de toasts */}
      <div className="toast-list">
        {visibleToasts.map((toast, index) => (
          <Toast
            key={toast.id}
            toast={toast}
            onRemove={removeToast}
            index={index}
          />
        ))}
      </div>

      {/* Indicador de más toasts ocultos */}
      {toasts.length > maxVisible && (
        <div className="toast-overflow-indicator">
          +{toasts.length - maxVisible} más
        </div>
      )}
    </div>
  );
};

// Hook para gestionar toasts con configuración avanzada
export const useToastManager = (config = {}) => {
  const {
    maxToasts = 5,
    defaultDuration = 3000,
    position = 'top-right',
    enableStacking = true,
    enableGrouping = false
  } = config;

  const [toasts, setToasts] = useState([]);
  const toastCounter = useRef(0);

  // Agregar toast con opciones avanzadas
  const addToast = (message, type = 'info', options = {}) => {
    const {
      duration = defaultDuration,
      persistent = false,
      action = null,
      groupKey = null
    } = options;

    // Si hay grouping, remover toasts del mismo grupo
    if (enableGrouping && groupKey) {
      setToasts(prev => prev.filter(t => t.groupKey !== groupKey));
    }

    const id = ++toastCounter.current;
    const newToast = {
      id,
      message,
      type,
      duration: persistent ? Infinity : duration,
      timestamp: Date.now(),
      groupKey,
      action
    };

    setToasts(prev => {
      const newToasts = enableStacking 
        ? [newToast, ...prev]
        : [newToast];
      
      // Limitar número máximo de toasts
      return newToasts.slice(0, maxToasts);
    });

    return id;
  };

  // Remover toast específico
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Limpiar todos los toasts
  const clearAllToasts = () => {
    setToasts([]);
  };

  // Actualizar toast existente
  const updateToast = (id, updates) => {
    setToasts(prev => prev.map(toast =>
      toast.id === id ? { ...toast, ...updates } : toast
    ));
  };

  // Métodos de conveniencia con iconos profesionales
  const success = (message, options) => addToast(message, 'success', options);
  const error = (message, options) => addToast(message, 'error', options);
  const warning = (message, options) => addToast(message, 'warning', options);
  const info = (message, options) => addToast(message, 'info', options);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    updateToast,
    success,
    error,
    warning,
    info,
    count: toasts.length
  };
};

// Componente de toast con acción personalizada
export const ActionToast = ({ message, action, onRemove, type = 'info' }) => {
  const getIcon = (type) => {
    const icons = {
      success: <CheckCircle size={20} />,
      error: <AlertCircle size={20} />,
      warning: <AlertTriangle size={20} />,
      info: <Info size={20} />
    };
    return icons[type] || icons.info;
  };

  return (
    <div className={`toast toast-action ${type}`}>
      <div className="toast-content">
        <div className="toast-icon">
          {getIcon(type)}
        </div>
        <span className="toast-message">{message}</span>
        <div className="toast-actions">
          {action && (
            <button
              onClick={action.handler}
              className="toast-action-btn"
            >
              {action.label}
            </button>
          )}
          <button
            onClick={onRemove}
            className="toast-close"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente para toasts de carga/progreso
export const ProgressToast = ({ 
  message, 
  progress = 0, 
  onCancel, 
  type = 'info' 
}) => {
  const getIcon = (type) => {
    const icons = {
      success: <CheckCircle size={20} />,
      error: <AlertCircle size={20} />,
      warning: <AlertTriangle size={20} />,
      info: <Info size={20} />
    };
    return icons[type] || icons.info;
  };

  return (
    <div className={`toast toast-progress ${type}`}>
      <div className="toast-content">
        <div className="toast-icon">
          {getIcon(type)}
        </div>
        <span className="toast-message">{message}</span>
        {onCancel && (
          <button onClick={onCancel} className="toast-close">
            <X size={16} />
          </button>
        )}
      </div>
      <div className="toast-progress">
        <div 
          className="toast-progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="toast-progress-text">
        {Math.round(progress)}%
      </div>
    </div>
  );
};

export default ToastContainer;