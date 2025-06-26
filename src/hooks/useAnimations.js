// hooks/useAnimations.js - Hook para gestión de animaciones sin bugs
import { useState, useCallback, useRef, useEffect } from 'react';

export const useAnimations = () => {
  const [animatingItems, setAnimatingItems] = useState(new Set());
  const [confettiTrigger, setConfettiTrigger] = useState(null);
  const [celebrationMode, setCelebrationMode] = useState(false);
  const [shakeElements, setShakeElements] = useState(new Set());
  
  // Referencias para control de estado
  const celebrationTimeoutRef = useRef(null);
  const confettiTimeoutRef = useRef(null);
  const lastConfettiRef = useRef(0);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
      }
      if (confettiTimeoutRef.current) {
        clearTimeout(confettiTimeoutRef.current);
      }
    };
  }, []);

  // Animar elemento específico
  const animateItem = useCallback((id, duration = 600) => {
    setAnimatingItems(prev => new Set([...prev, id]));
    
    setTimeout(() => {
      setAnimatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, duration);
  }, []);

  // Activar confetti con control de duplicados
  const triggerConfetti = useCallback((type = 'default', delay = 0) => {
    const now = Date.now();
    
    // Evitar confetti demasiado frecuente (mínimo 1 segundo entre activaciones)
    if (now - lastConfettiRef.current < 1000) {
      console.log('🚫 Confetti bloqueado por rate limit');
      return;
    }
    
    lastConfettiRef.current = now;
    
    // Limpiar confetti anterior
    setConfettiTrigger(null);
    
    // Aplicar delay y activar nuevo confetti
    confettiTimeoutRef.current = setTimeout(() => {
      const trigger = { 
        type, 
        timestamp: Date.now(),
        id: Math.random().toString(36).substr(2, 9)
      };
      
      setConfettiTrigger(trigger);
      console.log(`🎊 Confetti activado: ${type} - ${trigger.id}`);
      
      // Auto-limpiar después de 6 segundos
      setTimeout(() => {
        setConfettiTrigger(null);
        console.log(`🧹 Confetti auto-limpiado: ${trigger.id}`);
      }, 6000);
      
    }, delay);
  }, []);

  // Activar modo celebración controlado
  const startCelebration = useCallback((duration = 8000) => {
    // Evitar celebraciones múltiples
    if (celebrationMode) {
      console.log('🚫 Celebración ya activa');
      return;
    }
    
    console.log('🎉 Iniciando modo celebración');
    setCelebrationMode(true);
    
    // Secuencia de confetti escalonada
    triggerConfetti('completion', 200);
    
    // Limpiar celebración después de la duración
    celebrationTimeoutRef.current = setTimeout(() => {
      setCelebrationMode(false);
      setConfettiTrigger(null);
      console.log('🏁 Celebración terminada');
    }, duration);
  }, [celebrationMode, triggerConfetti]);

  // Hacer temblar elemento
  const shakeElement = useCallback((elementId, duration = 600) => {
    setShakeElements(prev => new Set([...prev, elementId]));
    
    setTimeout(() => {
      setShakeElements(prev => {
        const newSet = new Set(prev);
        newSet.delete(elementId);
        return newSet;
      });
    }, duration);
  }, []);

  // Detener celebración manualmente
  const stopCelebration = useCallback(() => {
    if (celebrationTimeoutRef.current) {
      clearTimeout(celebrationTimeoutRef.current);
      celebrationTimeoutRef.current = null;
    }
    
    setCelebrationMode(false);
    setConfettiTrigger(null);
    console.log('⏹️ Celebración detenida manualmente');
  }, []);

  // Limpiar todas las animaciones
  const clearAllAnimations = useCallback(() => {
    setAnimatingItems(new Set());
    setShakeElements(new Set());
    stopCelebration();
    console.log('🧹 Todas las animaciones limpiadas');
  }, [stopCelebration]);

  // Estado para debug
  const animationState = {
    hasAnimatingItems: animatingItems.size > 0,
    animatingItemsCount: animatingItems.size,
    hasShakingElements: shakeElements.size > 0,
    shakingElementsCount: shakeElements.size,
    isCelebrating: celebrationMode,
    hasActiveConfetti: confettiTrigger !== null,
    lastConfettiTime: lastConfettiRef.current
  };

  return {
    // Estados principales
    animatingItems,
    confettiTrigger,
    celebrationMode,
    shakeElements,
    
    // Funciones de control
    animateItem,
    triggerConfetti,
    startCelebration,
    stopCelebration,
    shakeElement,
    clearAllAnimations,
    
    // Estado de debug
    animationState
  };
};

export default useAnimations;