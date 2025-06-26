// hooks/useLocalStorage.js - Hook optimizado para localStorage
import { useState, useEffect, useCallback, useRef } from 'react';

export const useLocalStorage = (key, initialValue, options = {}) => {
  const {
    serializer = JSON,
    syncAcrossTabs = true,
    compression = false,
    errorHandler = console.error
  } = options;

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
        // Datos corruptos, usar valor inicial
        console.warn(`Datos corruptos en localStorage para la clave: ${key}`);
        return initialValue;
      }
    } catch (error) {
      errorHandler(error);
      return initialValue;
    }
  });

  const isInitialMount = useRef(true);

  // Función para establecer valor
  const setValue = useCallback((value) => {
    try {
      // Permitir función de callback como setState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
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

  // Función para eliminar valor
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      errorHandler(error);
    }
  }, [key, initialValue, errorHandler]);

  // Sincronización entre pestañas
  useEffect(() => {
    if (!syncAcrossTabs) return;

    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          let parsed = serializer.parse(e.newValue);
          
          if (compression && parsed.compressed) {
            parsed = decompressData(parsed.data);
          }

          setStoredValue(parsed);
        } catch (error) {
          errorHandler(error);
        }
      }
    };

    const handleCustomEvent = (e) => {
      setStoredValue(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(`localStorage-${key}`, handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(`localStorage-${key}`, handleCustomEvent);
    };
  }, [key, serializer, compression, syncAcrossTabs, errorHandler]);

  // Evitar guardar en el primer render
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setValue(storedValue);
  }, [storedValue]);

  return [storedValue, setValue, removeValue];
};

// Funciones auxiliares
const validateData = (data, template) => {
  // Validación básica de estructura
  if (Array.isArray(template)) {
    return Array.isArray(data);
  }
  
  if (typeof template === 'object' && template !== null) {
    return typeof data === 'object' && data !== null;
  }
  
  return typeof data === typeof template;
};

const shouldCompress = (data) => {
  // Comprimir si los datos son grandes (>5KB)
  const size = new Blob([JSON.stringify(data)]).size;
  return size > 5120; // 5KB
};

const compressData = (data) => {
  // Compresión simple usando LZ-string si está disponible
  // En un proyecto real, podrías usar una librería como lz-string
  return JSON.stringify(data);
};

const decompressData = (compressedData) => {
  // Descompresión correspondiente
  return JSON.parse(compressedData);
};

// Hook especializado para todos
export const useTodosStorage = () => {
  return useLocalStorage('todos', [], {
    syncAcrossTabs: true,
    compression: true,
    errorHandler: (error) => {
      console.error('Error en almacenamiento de todos:', error);
      // Aquí podrías enviar el error a un servicio de logging
    }
  });
};

// Hook para configuraciones de la app
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
