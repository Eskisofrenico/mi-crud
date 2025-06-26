// components/FilterTabs.jsx - Filtros con iconos profesionales
import React, { useRef, useEffect, useState } from 'react';
import { 
  FileText, 
  Clock, 
  CheckSquare, 
  Calendar,
  AlertTriangle 
} from 'lucide-react';

const FilterTabs = ({ 
  options = [], 
  activeFilter = 'all', 
  onFilterChange, 
  showBadges = true,
  layout = 'horizontal' // 'horizontal' | 'vertical'
}) => {
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const tabsRef = useRef(null);
  const indicatorRef = useRef(null);

  // Mapeo de iconos para cada filtro
  const getFilterIcon = (filterKey) => {
    const iconMap = {
      all: <FileText size={18} />,
      pending: <Clock size={18} />,
      completed: <CheckSquare size={18} />,
      today: <Calendar size={18} />,
      important: <AlertTriangle size={18} />
    };
    
    return iconMap[filterKey] || <FileText size={18} />;
  };

  // Mapeo de etiquetas más amigables
  const getFilterLabel = (filterKey) => {
    const labelMap = {
      all: 'Todas',
      pending: 'Pendientes', 
      completed: 'Completadas',
      today: 'Hoy',
      important: 'Importantes'
    };
    
    return labelMap[filterKey] || filterKey;
  };

  // Actualizar posición del indicador
  useEffect(() => {
    const updateIndicator = () => {
      if (!tabsRef.current) return;
      
      const activeTab = tabsRef.current.querySelector(`[data-filter="${activeFilter}"]`);
      if (!activeTab) return;
      
      const tabsRect = tabsRef.current.getBoundingClientRect();
      const activeRect = activeTab.getBoundingClientRect();
      
      if (layout === 'horizontal') {
        setIndicatorStyle({
          left: activeRect.left - tabsRect.left,
          width: activeRect.width,
          height: '100%',
          top: 0
        });
      } else {
        setIndicatorStyle({
          top: activeRect.top - tabsRect.top,
          height: activeRect.height,
          width: '100%',
          left: 0
        });
      }
    };

    // Delay para asegurar que el DOM esté listo
    const timeoutId = setTimeout(updateIndicator, 50);
    
    // También actualizar en resize
    window.addEventListener('resize', updateIndicator);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [activeFilter, layout, options]);

  // Manejar clic en tab
  const handleTabClick = (filterKey) => {
    if (onFilterChange) {
      onFilterChange(filterKey);
    }
  };

  // Manejar navegación por teclado
  const handleKeyDown = (e, filterKey) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTabClick(filterKey);
    }
    
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const currentIndex = options.findIndex(opt => opt.key === activeFilter);
      const direction = e.key === 'ArrowRight' ? 1 : -1;
      const newIndex = (currentIndex + direction + options.length) % options.length;
      handleTabClick(options[newIndex].key);
    }
  };

  return (
    <div 
      className={`filter-tabs ${layout === 'vertical' ? 'filter-tabs--vertical' : ''}`}
      ref={tabsRef}
      role="tablist"
      aria-label="Filtros de tareas"
    >
      {/* Indicador animado */}
      <div 
        ref={indicatorRef}
        className="filter-indicator"
        style={indicatorStyle}
        aria-hidden="true"
      />
      
      {/* Tabs */}
      {options.map((option) => {
        const isActive = activeFilter === option.key;
        const badgeCount = option.count || 0;
        
        return (
          <button
            key={option.key}
            data-filter={option.key}
            className={`filter-tab ${isActive ? 'filter-tab--active' : ''}`}
            onClick={() => handleTabClick(option.key)}
            onKeyDown={(e) => handleKeyDown(e, option.key)}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${option.key}`}
            tabIndex={isActive ? 0 : -1}
            title={`Ver ${getFilterLabel(option.key).toLowerCase()}`}
          >
            {/* Icono */}
            <span className="filter-tab-icon">
              {getFilterIcon(option.key)}
            </span>
            
            {/* Texto */}
            <span className="filter-tab-text">
              {getFilterLabel(option.key)}
            </span>
            
            {/* Badge con contador */}
            {showBadges && badgeCount > 0 && (
              <span 
                className={`filter-tab-badge ${badgeCount !== option.lastCount ? 'filter-tab-badge--animating' : ''}`}
                aria-label={`${badgeCount} tareas`}
              >
                {badgeCount > 99 ? '99+' : badgeCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default FilterTabs;