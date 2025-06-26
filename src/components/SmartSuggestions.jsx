// components/SmartSuggestions.jsx - Sugerencias inteligentes con iconos profesionales
import React, { useState, useEffect, useRef } from 'react';
import {
  Lightbulb,
  TrendingUp,
  Users,
  Clock,
  Target,
  Sparkles,
  ChevronRight,
  X,
  Brain,
  Zap
} from 'lucide-react';

const SmartSuggestions = ({ 
  suggestions = [], 
  onSelectSuggestion,
  isVisible = false,
  onClose,
  maxSuggestions = 6 
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const suggestionsRef = useRef(null);

  // Manejar navegación con teclado
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (suggestions[selectedIndex]) {
            onSelectSuggestion(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose?.();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, suggestions, selectedIndex, onSelectSuggestion, onClose]);

  // Reset selection cuando cambian las sugerencias
  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions]);

  // Obtener color del tipo de sugerencia
  const getSuggestionTypeColor = (type) => {
    const colors = {
      contextual: '#3b82f6',    // azul
      category: '#22c55e',      // verde
      autocomplete: '#8b5cf6',  // púrpura
      personalized: '#f59e0b',  // amarillo
      pattern: '#ef4444'        // rojo
    };
    return colors[type] || '#6b7280';
  };

  // Obtener etiqueta del tipo
  const getSuggestionTypeLabel = (type) => {
    const labels = {
      contextual: 'Contextual',
      category: 'Categoría',
      autocomplete: 'Autocompletar',
      personalized: 'Personal',
      pattern: 'Patrón'
    };
    return labels[type] || 'Sugerencia';
  };

  // Renderizar icono de sugerencia
  const renderSuggestionIcon = (suggestion) => {
    // Si la sugerencia tiene un icono específico (componente de Lucide)
    if (suggestion.icon) {
      const IconComponent = suggestion.icon;
      return <IconComponent size={16} />;
    }

    // Iconos por defecto según el tipo
    switch (suggestion.type) {
      case 'contextual':
        return <Clock size={16} />;
      case 'category':
        return <Target size={16} />;
      case 'autocomplete':
        return <Zap size={16} />;
      case 'personalized':
        return <Brain size={16} />;
      case 'pattern':
        return <TrendingUp size={16} />;
      default:
        return <Lightbulb size={16} />;
    }
  };

  if (!isVisible || suggestions.length === 0) return null;

  const displaySuggestions = suggestions.slice(0, maxSuggestions);

  return (
    <div className="smart-suggestions" ref={suggestionsRef}>
      {/* Header */}
      <div className="suggestions-header">
        <div className="header-content">
          <Sparkles size={16} />
          <span className="header-title">Sugerencias Inteligentes</span>
          <span className="suggestions-count">
            {displaySuggestions.length}
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="close-btn">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Lista de sugerencias */}
      <div className="suggestions-list">
        {displaySuggestions.map((suggestion, index) => (
          <div
            key={`${suggestion.text}-${index}`}
            className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
            onClick={() => onSelectSuggestion(suggestion)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div className="suggestion-content">
              <div className="suggestion-main">
                <span className="suggestion-icon">
                  {renderSuggestionIcon(suggestion)}
                </span>
                <span className="suggestion-text">{suggestion.text}</span>
              </div>
              <div className="suggestion-meta">
                <span 
                  className="suggestion-type"
                  style={{ color: getSuggestionTypeColor(suggestion.type) }}
                >
                  {getSuggestionTypeLabel(suggestion.type)}
                </span>
                {suggestion.category && (
                  <span className="suggestion-category">
                    {suggestion.category}
                  </span>
                )}
                {suggestion.confidence && (
                  <span className="suggestion-confidence">
                    {Math.round(suggestion.confidence * 100)}%
                  </span>
                )}
              </div>
            </div>
            <ChevronRight size={14} className="suggestion-arrow" />
          </div>
        ))}
      </div>

      {/* Consejos de navegación */}
      <div className="suggestions-footer">
        <div className="navigation-tips">
          <span className="tip">
            <kbd>↑↓</kbd> Navegar
          </span>
          <span className="tip">
            <kbd>Enter</kbd> Seleccionar
          </span>
          <span className="tip">
            <kbd>Esc</kbd> Cerrar
          </span>
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar insights de productividad
export const ProductivityInsights = ({ insights, onClose }) => {
  if (!insights) return null;

  const getInsightIcon = (type) => {
    switch (type) {
      case 'today':
        return <Calendar size={16} />;
      case 'weekly':
        return <TrendingUp size={16} />;
      case 'category':
        return <Target size={16} />;
      case 'focus':
        return <Brain size={16} />;
      default:
        return <Lightbulb size={16} />;
    }
  };

  return (
    <div className="productivity-insights">
      <div className="insights-header">
        <h4>
          <Brain size={18} />
          Insights de Productividad
        </h4>
        <button onClick={onClose} className="close-btn">
          <X size={16} />
        </button>
      </div>
      
      <div className="insights-content">
        <div className="insight-item">
          <span className="insight-icon">
            {getInsightIcon('today')}
          </span>
          <div className="insight-text">
            <strong>Tareas de hoy:</strong> {insights.todayTasks}
          </div>
        </div>
        
        <div className="insight-item">
          <span className="insight-icon">
            {getInsightIcon('weekly')}
          </span>
          <div className="insight-text">
            <strong>Completado esta semana:</strong> {Math.round(insights.weeklyCompletion)}%
          </div>
        </div>
        
        <div className="insight-item">
          <span className="insight-icon">
            {getInsightIcon('category')}
          </span>
          <div className="insight-text">
            <strong>Categoría más activa:</strong> {insights.mostActiveCategory}
          </div>
        </div>
        
        <div className="insight-item">
          <span className="insight-icon">
            {getInsightIcon('focus')}
          </span>
          <div className="insight-text">
            <strong>Sugerencia:</strong> {insights.suggestedFocus}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar estadísticas de categorías
export const CategoryStats = ({ categories, onClose }) => {
  if (!categories || Object.keys(categories).length === 0) return null;

  return (
    <div className="category-stats">
      <div className="stats-header">
        <h4>
          <Target size={18} />
          Estadísticas por Categoría
        </h4>
        <button onClick={onClose} className="close-btn">
          <X size={16} />
        </button>
      </div>
      
      <div className="stats-content">
        {Object.entries(categories).map(([category, data]) => {
          const IconComponent = data.icon;
          return (
            <div key={category} className="category-stat-item">
              <div className="category-info">
                <span className="category-icon">
                  <IconComponent size={16} style={{ color: data.color }} />
                </span>
                <span className="category-name">{data.name}</span>
              </div>
              <div className="category-metrics">
                <span className="metric">
                  <strong>{data.count || 0}</strong> tareas
                </span>
                <span className="metric">
                  {Math.round(data.completionRate || 0)}% completado
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Componente principal mejorado con múltiples paneles
export const SmartSuggestionsPanel = ({
  suggestions = [],
  insights = null,
  categoryStats = null,
  onSelectSuggestion,
  isVisible = false,
  onClose
}) => {
  const [activePanel, setActivePanel] = useState('suggestions');

  if (!isVisible) return null;

  return (
    <div className="smart-suggestions-panel">
      {/* Tabs */}
      <div className="panel-tabs">
        <button
          className={`tab-btn ${activePanel === 'suggestions' ? 'active' : ''}`}
          onClick={() => setActivePanel('suggestions')}
        >
          <Lightbulb size={14} />
          Sugerencias
        </button>
        {insights && (
          <button
            className={`tab-btn ${activePanel === 'insights' ? 'active' : ''}`}
            onClick={() => setActivePanel('insights')}
          >
            <Brain size={14} />
            Insights
          </button>
        )}
        {categoryStats && (
          <button
            className={`tab-btn ${activePanel === 'stats' ? 'active' : ''}`}
            onClick={() => setActivePanel('stats')}
          >
            <TrendingUp size={14} />
            Estadísticas
          </button>
        )}
      </div>

      {/* Contenido */}
      <div className="panel-content">
        {activePanel === 'suggestions' && (
          <SmartSuggestions
            suggestions={suggestions}
            onSelectSuggestion={onSelectSuggestion}
            isVisible={true}
            onClose={onClose}
          />
        )}
        {activePanel === 'insights' && insights && (
          <ProductivityInsights
            insights={insights}
            onClose={onClose}
          />
        )}
        {activePanel === 'stats' && categoryStats && (
          <CategoryStats
            categories={categoryStats}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};

export default SmartSuggestions;