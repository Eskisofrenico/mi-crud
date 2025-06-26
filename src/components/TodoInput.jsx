// components/TodoInput.jsx - Input mejorado con fecha límite y categorías personalizables
import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { 
  AlertCircle, 
  Lightbulb, 
  Keyboard, 
  Hash,
  Sparkles,
  Timer,
  Briefcase,
  Home,
  Dumbbell,
  BookOpen,
  ShoppingCart,
  Users,
  Calendar,
  Plus,
  X,
  Check,
  Clock,
  Settings
} from 'lucide-react';

const TodoInput = forwardRef(({
  value = '',
  onChange,
  onSubmit,
  onKeyPress,
  placeholder = '¿Qué quieres lograr hoy?',
  maxLength = 200,
  showHints = true,
  showCharacterCount = true,
  autoFocus = false,
  disabled = false,
  onCategoryUpdate // Nueva prop para actualizar categorías
}, ref) => {
  
  const [isFocused, setIsFocused] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);
  
  // Estados para gestión de categorías
  const [customCategories, setCustomCategories] = useState(() => {
    const saved = localStorage.getItem('customCategories');
    return saved ? JSON.parse(saved) : {};
  });
  const [newCategoryWord, setNewCategoryWord] = useState('');
  const [selectedCategoryForWord, setSelectedCategoryForWord] = useState('');

  const internalRef = useRef(null);
  const inputRef = ref || internalRef;

  // Categorías base (ahora extensibles)
  const [categories, setCategories] = useState({
    trabajo: {
      keywords: ['trabajo', 'reunión', 'proyecto', 'email', 'llamada', 'oficina', 'informe', 'presentación'],
      icon: <Briefcase size={14} />,
      color: 'var(--primary-500)',
      name: 'Trabajo'
    },
    hogar: {
      keywords: ['casa', 'hogar', 'limpieza', 'cocina', 'compras', 'mercado', 'familia'],
      icon: <Home size={14} />,
      color: 'var(--success-500)',
      name: 'Hogar'
    },
    salud: {
      keywords: ['ejercicio', 'gym', 'correr', 'deporte', 'salud', 'médico', 'vitaminas'],
      icon: <Dumbbell size={14} />,
      color: 'var(--warning-500)',
      name: 'Salud'
    },
    estudio: {
      keywords: ['estudiar', 'curso', 'libro', 'aprender', 'universidad', 'examen'],
      icon: <BookOpen size={14} />,
      color: 'var(--info-500)',
      name: 'Estudio'
    },
    compras: {
      keywords: ['comprar', 'tienda', 'supermercado', 'shopping'],
      icon: <ShoppingCart size={14} />,
      color: 'var(--purple-500)',
      name: 'Compras'
    },
    reuniones: {
      keywords: ['reunión', 'cita', 'encuentro', 'junta', 'meeting'],
      icon: <Users size={14} />,
      color: 'var(--blue-500)',
      name: 'Reuniones'
    }
  });

  // Cargar categorías personalizadas
  useEffect(() => {
    const savedCustom = localStorage.getItem('customCategories');
    if (savedCustom) {
      const custom = JSON.parse(savedCustom);
      setCategories(prev => {
        const updated = { ...prev };
        Object.keys(custom).forEach(categoryKey => {
          if (updated[categoryKey]) {
            updated[categoryKey].keywords = [
              ...new Set([...updated[categoryKey].keywords, ...custom[categoryKey]])
            ];
          }
        });
        return updated;
      });
    }
  }, []);

  // Detectar categoría automáticamente
  const detectCategory = (text) => {
    const lowerText = text.toLowerCase();
    
    for (const [key, category] of Object.entries(categories)) {
      if (category.keywords.some(keyword => lowerText.includes(keyword))) {
        return category;
      }
    }
    return null;
  };

  // Detectar prioridad
  const detectPriority = (text) => {
    const hasUrgentMarkers = text.includes('!') || 
                           text.toLowerCase().includes('urgente') ||
                           text.toLowerCase().includes('importante') ||
                           text.toLowerCase().includes('deadline') ||
                           text.toLowerCase().includes('asap');
    
    return hasUrgentMarkers ? 'high' : 'normal';
  };

  // Agregar palabra a categoría
  const addWordToCategory = () => {
    if (!newCategoryWord.trim() || !selectedCategoryForWord) return;

    const word = newCategoryWord.trim().toLowerCase();
    const categoryKey = selectedCategoryForWord;

    // Actualizar categorías locales
    setCategories(prev => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        keywords: [...new Set([...prev[categoryKey].keywords, word])]
      }
    }));

    // Guardar en localStorage
    const newCustomCategories = {
      ...customCategories,
      [categoryKey]: [...(customCategories[categoryKey] || []), word]
    };
    setCustomCategories(newCustomCategories);
    localStorage.setItem('customCategories', JSON.stringify(newCustomCategories));

    // Limpiar formulario
    setNewCategoryWord('');
    setSelectedCategoryForWord('');
    
    // Notificar al componente padre si existe callback
    onCategoryUpdate?.(newCustomCategories);
  };

  // Manejar cambios en el input
  const handleChange = (e) => {
    const newValue = e.target.value;
    
    if (hasError) setHasError(false);
    
    if (newValue.length > maxLength) {
      setHasError(true);
      return;
    }
    
    if (typingTimeout) clearTimeout(typingTimeout);
    
    if (newValue.length > 2) {
      const timeout = setTimeout(() => {
        setShowSuggestions(true);
      }, 300);
      setTypingTimeout(timeout);
    } else {
      setShowSuggestions(false);
    }
    
    onChange?.(e);
  };

  // Manejar envío de tarea
  const handleSubmit = () => {
    if (!value.trim()) {
      triggerShake();
      return;
    }

    // Crear objeto de tarea con fecha límite si está seleccionada
    const taskData = {
      text: value.trim(),
      deadline: selectedDate || null,
      priority: detectPriority(value),
      category: detectCategory(value)?.name || null
    };

    onSubmit?.(taskData);
    setSelectedDate('');
    setShowSuggestions(false);
    setShowDatePicker(false);
  };

  // Manejar teclas
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      setShowDatePicker(false);
      setShowCategoryManager(false);
      inputRef.current?.blur();
    }
    
    onKeyPress?.(e);
  };

  // Trigger animación de shake
  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 600);
  };

  // Auto-focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [typingTimeout]);

  // Calcular métricas
  const characterPercentage = (value.length / maxLength) * 100;
  const isNearLimit = characterPercentage > 80;
  const isOverLimit = characterPercentage > 100;
  const currentCategory = detectCategory(value);
  const currentPriority = detectPriority(value);

  // Formatear fecha para mostrar
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Hoy';
    if (date.toDateString() === tomorrow.toDateString()) return 'Mañana';
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const inputClasses = [
    'todo-input-enhanced',
    isFocused && 'focused',
    isShaking && 'shaking',
    hasError && 'error',
    value.trim() && 'has-value'
  ].filter(Boolean).join(' ');

  return (
    <div className="todo-input-container-enhanced">
      <div className="todo-input-wrapper-enhanced">
        {/* Input principal */}
        <div className="input-field-container">
          <textarea
            ref={inputRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setTimeout(() => {
                setIsFocused(false);
                setShowSuggestions(false);
              }, 200);
            }}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
            className={inputClasses}
            rows={1}
            style={{ resize: 'none', overflow: 'hidden' }}
          />

          {/* Botones de acción rápida */}
          <div className="input-actions">
            {/* Agregar fecha límite */}
            <button
              type="button"
              className={`action-btn ${selectedDate ? 'active' : ''}`}
              onClick={() => setShowDatePicker(!showDatePicker)}
              title="Agregar fecha límite"
            >
              <Calendar size={16} />
              {selectedDate && <span className="action-badge">{formatDateForDisplay(selectedDate)}</span>}
            </button>

            {/* Gestionar categorías */}
            <button
              type="button"
              className="action-btn"
              onClick={() => setShowCategoryManager(!showCategoryManager)}
              title="Gestionar categorías"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Indicadores debajo del input */}
        <div className="input-indicators-enhanced">
          {/* Indicador de categoría */}
          {currentCategory && (
            <div 
              className="category-indicator-enhanced"
              style={{ backgroundColor: currentCategory.color + '15', borderColor: currentCategory.color }}
            >
              <span className="category-icon">{currentCategory.icon}</span>
              <span className="category-text">Detectado como: <strong>{currentCategory.name}</strong></span>
            </div>
          )}

          {/* Indicador de prioridad */}
          {currentPriority === 'high' && (
            <div className="priority-indicator-enhanced">
              <AlertCircle size={16} />
              <span>Prioridad alta</span>
            </div>
          )}

          {/* Contador de caracteres */}
          {showCharacterCount && (
            <div className={`character-counter-enhanced ${isNearLimit ? 'near-limit' : ''} ${isOverLimit ? 'over-limit' : ''}`}>
              {value.length}/{maxLength}
            </div>
          )}
        </div>

        {/* Selector de fecha límite */}
        {showDatePicker && (
          <div className="date-picker-container">
            <div className="date-picker-header">
              <Clock size={16} />
              <span>Fecha límite</span>
              <button onClick={() => setShowDatePicker(false)} className="close-btn">
                <X size={14} />
              </button>
            </div>
            <div className="date-picker-content">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="date-input"
              />
              <div className="date-quick-actions">
                <button onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}>
                  Hoy
                </button>
                <button onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setSelectedDate(tomorrow.toISOString().split('T')[0]);
                }}>
                  Mañana
                </button>
                <button onClick={() => {
                  const nextWeek = new Date();
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  setSelectedDate(nextWeek.toISOString().split('T')[0]);
                }}>
                  Próxima semana
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gestor de categorías */}
        {showCategoryManager && (
          <div className="category-manager-container">
            <div className="category-manager-header">
              <Settings size={16} />
              <span>Gestionar categorías</span>
              <button onClick={() => setShowCategoryManager(false)} className="close-btn">
                <X size={14} />
              </button>
            </div>
            <div className="category-manager-content">
              <div className="add-word-section">
                <h4>Agregar palabra clave</h4>
                <div className="add-word-form">
                  <input
                    type="text"
                    placeholder="Nueva palabra clave..."
                    value={newCategoryWord}
                    onChange={(e) => setNewCategoryWord(e.target.value)}
                    className="word-input"
                  />
                  <select
                    value={selectedCategoryForWord}
                    onChange={(e) => setSelectedCategoryForWord(e.target.value)}
                    className="category-select"
                  >
                    <option value="">Seleccionar categoría</option>
                    {Object.entries(categories).map(([key, category]) => (
                      <option key={key} value={key}>{category.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={addWordToCategory}
                    disabled={!newCategoryWord.trim() || !selectedCategoryForWord}
                    className="add-word-btn"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="categories-overview">
                <h4>Palabras clave por categoría</h4>
                <div className="categories-grid">
                  {Object.entries(categories).map(([key, category]) => (
                    <div key={key} className="category-item">
                      <div className="category-header">
                        {category.icon}
                        <span>{category.name}</span>
                      </div>
                      <div className="category-keywords">
                        {category.keywords.map((keyword, index) => (
                          <span key={index} className="keyword-tag">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sugerencias inteligentes */}
        {showSuggestions && value.length > 2 && (
          <div className="smart-suggestions-enhanced">
            {currentCategory && (
              <div className="suggestion-item primary">
                <Sparkles size={16} />
                <span>Detectado como: <strong>{currentCategory.name}</strong></span>
              </div>
            )}
            
            <div className="suggestion-item clickable" onClick={() => setShowDatePicker(true)}>
              <Timer size={16} />
              <span>Agregar fecha límite</span>
            </div>
            
            <div className="suggestion-item clickable" onClick={() => setShowCategoryManager(true)}>
              <Plus size={16} />
              <span>Personalizar categorías</span>
            </div>
          </div>
        )}

        {/* Hints de teclado */}
        {showHints && isFocused && !showSuggestions && (
          <div className="input-hints-enhanced">
            <div className="hint-item">
              <Keyboard size={12} />
              <kbd>Enter</kbd> para agregar
            </div>
            <div className="hint-item">
              <Hash size={12} />
              <kbd>!</kbd> para prioridad alta
            </div>
            <div className="hint-item">
              <Lightbulb size={12} />
              Palabras clave detectan categoría
            </div>
          </div>
        )}

        {/* Mensaje de error */}
        {hasError && (
          <div className="validation-message-enhanced">
            <AlertCircle size={16} />
            Máximo {maxLength} caracteres permitidos
          </div>
        )}

        {/* Barra de progreso de caracteres */}
        {value.length > 0 && (
          <div className="character-progress-enhanced">
            <div 
              className="progress-bar-enhanced"
              style={{ 
                width: `${Math.min(characterPercentage, 100)}%`,
                backgroundColor: isOverLimit ? 'var(--error-500)' : 
                                isNearLimit ? 'var(--warning-500)' : 
                                'var(--primary-500)'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
});

export default TodoInput;