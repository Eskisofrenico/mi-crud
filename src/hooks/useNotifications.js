// hooks/useNotifications.js - Hook de notificaciones con iconos profesionales
import { useState, useRef, useCallback } from 'react';

const useNotifications = (config = {}) => {
  const {
    maxToasts = 5,
    defaultDuration = 3000,
    enableMotivational = true,
    enableSounds = true,
    rateLimitMs = 1000
  } = config;

  const [toasts, setToasts] = useState([]);
  const toastCounter = useRef(0);
  const activeTimersRef = useRef(new Map());
  const lastNotificationRef = useRef(new Map());

  // Anti-spam: verificar si puede agregar notificación
  const canAddNotification = useCallback((type, message) => {
    const now = Date.now();
    const key = `${type}-${message}`;
    const lastTime = lastNotificationRef.current.get(key);
    
    if (lastTime && (now - lastTime) < rateLimitMs) {
      console.log(`🚫 Notificación bloqueada por anti-spam: ${type} - ${message}`);
      return false;
    }
    
    lastNotificationRef.current.set(key, now);
    return true;
  }, [rateLimitMs]);

  // Función principal para agregar toast
  const addToast = useCallback((message, type = 'info', duration = defaultDuration) => {
    // Anti-spam check
    if (!canAddNotification(type, message)) {
      return null;
    }

    // Limitar número de toasts
    if (toasts.length >= maxToasts) {
      console.log(`⚠️ Máximo de ${maxToasts} notificaciones alcanzado`);
      // Remover el más antiguo
      setToasts(prev => prev.slice(1));
    }

    const id = ++toastCounter.current;
    const timestamp = Date.now();
    
    const newToast = {
      id,
      message,
      type,
      duration,
      timestamp
    };

    // Agregar a la lista
    setToasts(prev => [...prev, newToast]);

    // Configurar auto-remove si no es persistente
    if (duration !== Infinity && duration > 0) {
      const timer = setTimeout(() => {
        removeToast(id);
      }, duration);
      
      activeTimersRef.current.set(id, timer);
    }

    // Reproducir sonido si está habilitado
    playNotificationSound(type);

    console.log(`📢 Toast agregado: ${type} - ${message} (ID: ${id})`);
    return id;
  }, [toasts.length, maxToasts, defaultDuration, canAddNotification]);

  // Remover toast específico
  const removeToast = useCallback((id) => {
    // Limpiar timer si existe
    const timer = activeTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      activeTimersRef.current.delete(id);
    }

    setToasts(prev => {
      console.log(`🗑️ Removiendo toast ID: ${id}`);
      return prev.filter(toast => toast.id !== id);
    });
  }, []);

  // Limpiar todas las notificaciones
  const clearAllToasts = useCallback(() => {
    // Limpiar todos los timers
    activeTimersRef.current.forEach(timer => clearTimeout(timer));
    activeTimersRef.current.clear();
    
    setToasts([]);
    console.log('🧹 Todas las notificaciones limpiadas');
  }, []);

  // Reproducir sonido de notificación
  const playNotificationSound = useCallback((type) => {
    if (!enableSounds || typeof window === 'undefined') return;

    try {
      // Web Audio API para sonidos sutiles
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Frecuencias diferentes para cada tipo
      const frequencies = {
        success: 523.25, // C5
        warning: 415.30, // G#4
        error: 349.23,   // F4
        info: 659.25     // E5
      };

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequencies[type] || frequencies.info, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn('No se pudo reproducir sonido de notificación:', error);
    }
  }, [enableSounds]);

  // Mensajes inteligentes con iconos profesionales (sin emojis)
  const smartMessages = {
    // Celebración (solo una vez)
    celebration: () => {
      const messages = [
        '¡Increíble! ¡Todas las tareas completadas!',
        '¡Excelente trabajo! ¡Todo terminado!',
        '¡Eres imparable! ¡Lista completada!',
        '¡Fantástico! ¡Objetivos cumplidos!'
      ];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      return addToast(randomMessage, 'success', 4000);
    },

    // Motivacional ocasional
    motivational: () => {
      if (!enableMotivational) return null;
      
      const messages = [
        '¡Sigue así!',
        '¡Vas genial!',
        '¡Imparable!',
        '¡Enfocado!'
      ];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      return addToast(randomMessage, 'success', 2000);
    },

    // Tarea agregada
    taskAdded: (taskText) => {
      const truncatedText = taskText.length > 30 ? 
        `${taskText.substring(0, 30)}...` : taskText;
      return addToast(`Tarea agregada: "${truncatedText}"`, 'success', 2000);
    },

    // Tarea completada
    taskCompleted: (taskText) => {
      const truncatedText = taskText.length > 30 ? 
        `${taskText.substring(0, 30)}...` : taskText;
      return addToast(`Tarea completada: "${truncatedText}"`, 'success', 2000);
    },

    // Tarea eliminada
    taskDeleted: () => {
      return addToast('Tarea eliminada', 'info', 1500);
    },

    // Tarea editada
    taskEdited: () => {
      return addToast('Tarea actualizada', 'info', 1500);
    },

    // Error genérico
    error: (message) => {
      return addToast(message, 'error', 3000);
    },

    // Información genérica
    info: (message) => {
      return addToast(message, 'info', 2500);
    },

    // Éxito genérico
    success: (message) => {
      return addToast(message, 'success', 2500);
    },

    // Advertencia genérica
    warning: (message) => {
      return addToast(message, 'warning', 3000);
    },

    // Modo enfoque activado
    focusModeActivated: (taskText) => {
      const truncatedText = taskText.length > 25 ? 
        `${taskText.substring(0, 25)}...` : taskText;
      return addToast(`Modo enfoque: "${truncatedText}"`, 'info', 2000);
    },

    // Modo enfoque desactivado
    focusModeDeactivated: () => {
      return addToast('Modo enfoque desactivado', 'info', 1500);
    },

    // Logro desbloqueado
    achievementUnlocked: (achievementName) => {
      return addToast(`¡Logro desbloqueado: ${achievementName}!`, 'success', 4000);
    },

    // Nivel subido
    levelUp: (newLevel) => {
      return addToast(`¡Nivel ${newLevel} alcanzado!`, 'success', 3000);
    },

    // Racha de productividad
    streak: (days) => {
      const dayText = days === 1 ? 'día' : 'días';
      return addToast(`¡Racha de ${days} ${dayText}!`, 'success', 2500);
    }
  };

  // Estado de las notificaciones
  const notificationState = {
    hasActiveToasts: toasts.length > 0,
    toastCount: toasts.length,
    canAddMore: toasts.length < maxToasts,
    isAtLimit: toasts.length >= maxToasts
  };

  return {
    // Estados
    toasts,
    notificationState,
    
    // Funciones principales
    addToast,
    removeToast,
    clearAllToasts,
    
    // Mensajes inteligentes
    smartMessages,
    
    // Configuración
    config: {
      maxToasts,
      defaultDuration,
      enableMotivational,
      enableSounds,
      rateLimitMs
    }
  };
};

export default useNotifications;