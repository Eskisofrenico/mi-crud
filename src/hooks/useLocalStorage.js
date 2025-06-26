// ===================================================
// SOLUCIÓN RÁPIDA: Reemplaza useLocalStorage.js
// ===================================================

// hooks/useLocalStorage.js - Hook optimizado SIN bucle infinito
import { useState, useEffect, useCallback, useRef } from 'react';

export const useLocalStorage = (key, initialValue, options = {}) => {
  const {
    serializer = JSON,
    syncAcrossTabs = true,
    compression = false,
    errorHandler = console.error
  } = options;

  // ✅ CORRECCIÓN: Solo inicializar una vez
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      
      if (item === null) {
        return initialValue;
      }

      let parsed = serializer.parse(item);
      
      // Descomprimir si es necesario
      if (compression && parsed.compressed) {
        parsed = decompressData(parsed.data);
      }

      // Validar datos recuperados
      if (validateData(parsed, initialValue)) {
        return parsed;
      } else {
        console.warn(`Datos corruptos en localStorage para la clave: ${key}`);
        return initialValue;
      }
    } catch (error) {
      errorHandler(error);
      return initialValue;
    }
  });

  // ✅ CORRECCIÓN: Usar ref para evitar dependencias circulares
  const setValueRef = useRef();

  // ✅ CORRECCIÓN: setValue que no cause bucles
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // ✅ Solo actualizar si el valor realmente cambió
      if (JSON.stringify(valueToStore) === JSON.stringify(storedValue)) {
        return;
      }
      
      setStoredValue(valueToStore);

      // Comprimir datos si es necesario
      let dataToSave = valueToStore;
      if (compression && shouldCompress(valueToStore)) {
        dataToSave = {
          compressed: true,
          data: compressData(valueToStore)
        };
      }

      window.localStorage.setItem(key, serializer.stringify(dataToSave));

      // Disparar evento personalizado para sincronización
      if (syncAcrossTabs) {
        window.dispatchEvent(new CustomEvent(`localStorage-${key}`, {
          detail: valueToStore
        }));
      }
    } catch (error) {
      errorHandler(error);
    }
  }, [key, storedValue, serializer, compression, syncAcrossTabs, errorHandler]);

  // Guardar referencia
  setValueRef.current = setValue;

  // Función para eliminar valor
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      errorHandler(error);
    }
  }, [key, initialValue, errorHandler]);

  // ✅ CORRECCIÓN: Sincronización sin bucles
  useEffect(() => {
    if (!syncAcrossTabs) return;

    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          let parsed = serializer.parse(e.newValue);
          
          if (compression && parsed.compressed) {
            parsed = decompressData(parsed.data);
          }

          // ✅ Solo actualizar si es diferente
          if (JSON.stringify(parsed) !== JSON.stringify(storedValue)) {
            setStoredValue(parsed);
          }
        } catch (error) {
          errorHandler(error);
        }
      }
    };

    const handleCustomEvent = (e) => {
      // ✅ Solo actualizar si es diferente
      if (JSON.stringify(e.detail) !== JSON.stringify(storedValue)) {
        setStoredValue(e.detail);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(`localStorage-${key}`, handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(`localStorage-${key}`, handleCustomEvent);
    };
  }, [key, serializer, compression, syncAcrossTabs, errorHandler]); // ✅ REMOVIDO storedValue de las dependencias

  // ✅ ELIMINADO: Este useEffect que causaba el bucle
  // useEffect(() => {
  //   if (isInitialMount.current) {
  //     isInitialMount.current = false;
  //     return;
  //   }
  //   setValue(storedValue); // ❌ ESTO CAUSABA EL BUCLE
  // }, [storedValue]);

  return [storedValue, setValue, removeValue];
};

// Funciones auxiliares (sin cambios)
const validateData = (data, template) => {
  if (Array.isArray(template)) {
    return Array.isArray(data);
  }
  
  if (typeof template === 'object' && template !== null) {
    return typeof data === 'object' && data !== null;
  }
  
  return typeof data === typeof template;
};

const shouldCompress = (data) => {
  const size = new Blob([JSON.stringify(data)]).size;
  return size > 5120; // 5KB
};

const compressData = (data) => {
  return JSON.stringify(data);
};

const decompressData = (compressedData) => {
  return JSON.parse(compressedData);
};

// Hook especializado para todos (sin cambios)
export const useTodosStorage = () => {
  return useLocalStorage('todos', [], {
    syncAcrossTabs: true,
    compression: true,
    errorHandler: (error) => {
      console.error('Error en almacenamiento de todos:', error);
    }
  });
};

// Hook para configuraciones de la app (sin cambios)
export const useAppSettings = () => {
  const defaultSettings = {
    theme: 'light',
    animations: true,
    notifications: true,
    autoSave: true,
    dailyGoal: 5,
    celebrationEffects: true
  };

  return useLocalStorage('app-settings', defaultSettings, {
    syncAcrossTabs: true
  });
};

