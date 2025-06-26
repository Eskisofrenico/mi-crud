// components/StatsCard.jsx - Tarjetas de estadísticas optimizadas
import React, { useEffect, useState, useRef } from 'react';

const StatsCard = ({ 
  icon, 
  label, 
  value, 
  maxValue, 
  color = 'primary',
  animate = true,
  showProgress = false,
  suffix = '',
  onClick,
  trend = null, // 'up', 'down', 'neutral'
  customValue = false // Para valores no numéricos como títulos
}) => {
  const [displayValue, setDisplayValue] = useState(customValue ? value : 0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  // Observador de intersección para animar cuando está visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animación de conteo para valores numéricos
  useEffect(() => {
    if (customValue) {
      setDisplayValue(value);
      return;
    }

    if (!isVisible || !animate || typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }

    const duration = 800;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(value, increment * step);
      setDisplayValue(Math.floor(current));

      if (step >= steps || current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, isVisible, animate, customValue]);

  // Obtener colores por variante
  const getColorClasses = () => {
    const colorMap = {
      primary: 'stats-card-primary',
      success: 'stats-card-success',
      warning: 'stats-card-warning',
      error: 'stats-card-error',
      info: 'stats-card-info'
    };
    return colorMap[color] || colorMap.primary;
  };

  // Obtener icono de tendencia
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'neutral': return '➡️';
      default: return null;
    }
  };

  // Calcular porcentaje de progreso
  const progressPercentage = maxValue && typeof displayValue === 'number' 
    ? Math.min((displayValue / maxValue) * 100, 100) 
    : 0;

  // Detectar si se alcanzó un objetivo
  const isGoalReached = showProgress && progressPercentage >= 100;

  return (
    <div
      ref={cardRef}
      className={`stats-card ${getColorClasses()} ${onClick ? 'stats-card-clickable' : ''} ${isVisible ? 'stats-card-visible' : ''} ${isGoalReached ? 'stats-card-goal-reached' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* Header con icono y tendencia */}
      <div className="stats-card-header">
        <div className="stats-card-icon" title={label}>
          {icon}
        </div>
        {trend && (
          <div className="stats-card-trend" title={`Tendencia: ${trend}`}>
            {getTrendIcon()}
          </div>
        )}
      </div>

      {/* Valor principal */}
      <div className="stats-card-value">
        {customValue ? (
          <div className="stats-card-custom-value">
            {displayValue}
          </div>
        ) : (
          <>
            <span className="stats-card-number">
              {typeof displayValue === 'number' 
                ? displayValue.toLocaleString('es-ES') 
                : displayValue
              }
            </span>
            {suffix && (
              <span className="stats-card-suffix">{suffix}</span>
            )}
          </>
        )}
      </div>

      {/* Label */}
      <div className="stats-card-label">
        {label}
      </div>

      {/* Barra de progreso opcional */}
      {showProgress && maxValue && typeof displayValue === 'number' && (
        <div className="stats-card-progress-container">
          <div className="stats-card-progress-bar">
            <div 
              className="stats-card-progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="stats-card-progress-text">
            {Math.round(progressPercentage)}%
          </div>
        </div>
      )}

      {/* Efecto de logro alcanzado */}
      {isGoalReached && (
        <div className="stats-card-achievement">
          <div className="achievement-glow" />
          <div className="achievement-sparkle">✨</div>
        </div>
      )}

      {/* Efecto de hover/click */}
      {onClick && (
        <div className="stats-card-hover-effect" />
      )}
    </div>
  );
};

// Componente auxiliar para progreso circular (más compacto)
const CircularProgress = ({ percentage, size = 40, strokeWidth = 3 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="circular-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="circular-progress-svg">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          opacity="0.2"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="circular-progress-circle"
        />
      </svg>
      <div className="circular-progress-text">
        {Math.round(percentage)}%
      </div>
    </div>
  );
};

// Hook para valores animados (más simple)
export const useAnimatedValue = (targetValue, duration = 800) => {
  const [value, setValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (typeof targetValue !== 'number') {
      setValue(targetValue);
      return;
    }

    setIsAnimating(true);
    let startTime = null;
    let startValue = value;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (targetValue - startValue) * easedProgress;

      setValue(Math.round(currentValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [targetValue, duration]);

  return { value, isAnimating };
};

export default StatsCard;