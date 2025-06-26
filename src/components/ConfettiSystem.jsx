// components/ConfettiSystem.jsx - Sistema de confetti sin bugs
import React, { useEffect, useState, useRef, useCallback } from 'react';

const ConfettiSystem = ({ 
  trigger, 
  type = 'default',
  intensity = 'medium',
  enableSound = false,
  duration = 5000 // Duración máxima del efecto
}) => {
  const [particles, setParticles] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const cleanupTimeoutRef = useRef(null);

  // Configuraciones por tipo e intensidad
  const getConfig = useCallback(() => {
    const intensityMultiplier = {
      low: 0.5,
      medium: 1,
      high: 1.5
    }[intensity] || 1;

    const baseConfigs = {
      default: {
        count: Math.floor(15 * intensityMultiplier),
        colors: ['#667eea', '#764ba2', '#f093fb'],
        shapes: ['circle', 'square'],
        physics: { gravity: 0.3, wind: 0.1 }
      },
      completion: {
        count: Math.floor(30 * intensityMultiplier),
        colors: ['#00d4aa', '#00b894', '#10b981', '#34d399'],
        shapes: ['circle', 'star', 'heart'],
        physics: { gravity: 0.2, wind: 0.05 }
      },
      rainbow: {
        count: Math.floor(25 * intensityMultiplier),
        colors: ['#ff6b35', '#f093fb', '#667eea', '#00d4aa', '#fbbf24', '#ef4444'],
        shapes: ['circle', 'triangle', 'square'],
        physics: { gravity: 0.4, wind: 0.2 }
      },
      starburst: {
        count: Math.floor(20 * intensityMultiplier),
        colors: ['#fbbf24', '#f59e0b', '#f093fb', '#8b5cf6'],
        shapes: ['star', 'sparkle'],
        physics: { gravity: 0.1, wind: 0 }
      }
    };

    return baseConfigs[type] || baseConfigs.default;
  }, [type, intensity]);

  // Crear partícula individual
  const createParticle = useCallback((config, canvas) => {
    const colors = config.colors;
    const shapes = config.shapes;
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      vx: (Math.random() - 0.5) * 8,
      vy: -Math.random() * 8 - 5,
      size: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      life: 1,
      decay: Math.random() * 0.01 + 0.005,
      physics: config.physics
    };
  }, []);

  // Dibujar partícula en canvas
  const drawParticle = useCallback((ctx, particle) => {
    ctx.save();
    
    // Aplicar transformaciones
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);
    ctx.globalAlpha = particle.life;
    
    // Configurar estilo
    ctx.fillStyle = particle.color;
    ctx.strokeStyle = particle.color;
    ctx.lineWidth = 2;
    
    const halfSize = particle.size / 2;
    
    // Dibujar según la forma
    switch (particle.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, halfSize, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'square':
        ctx.fillRect(-halfSize, -halfSize, particle.size, particle.size);
        break;
        
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -halfSize);
        ctx.lineTo(-halfSize, halfSize);
        ctx.lineTo(halfSize, halfSize);
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'star':
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
          const x = Math.cos(angle) * halfSize;
          const y = Math.sin(angle) * halfSize;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          
          const innerAngle = angle + Math.PI / 5;
          const innerX = Math.cos(innerAngle) * halfSize * 0.5;
          const innerY = Math.sin(innerAngle) * halfSize * 0.5;
          ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'heart':
        ctx.beginPath();
        ctx.arc(-halfSize/2, -halfSize/2, halfSize/2, 0, Math.PI * 2);
        ctx.arc(halfSize/2, -halfSize/2, halfSize/2, 0, Math.PI * 2);
        ctx.moveTo(0, halfSize);
        ctx.lineTo(-halfSize, 0);
        ctx.lineTo(halfSize, 0);
        ctx.closePath();
        ctx.fill();
        break;
        
      default:
        ctx.beginPath();
        ctx.arc(0, 0, halfSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
  }, []);

  // Actualizar física de partícula
  const updateParticle = useCallback((particle) => {
    // Aplicar gravedad y viento
    particle.vy += particle.physics.gravity;
    particle.vx += particle.physics.wind * (Math.random() - 0.5);
    
    // Actualizar posición
    particle.x += particle.vx;
    particle.y += particle.vy;
    
    // Actualizar rotación
    particle.rotation += particle.rotationSpeed;
    
    // Actualizar vida
    particle.life -= particle.decay;
    
    return particle.life > 0 && particle.y < window.innerHeight + 50;
  }, []);

  // Loop de animación principal
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive) return;
    
    const ctx = canvas.getContext('2d');
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Actualizar y dibujar partículas
    setParticles(prevParticles => {
      const activeParticles = prevParticles
        .map(particle => updateParticle(particle))
        .filter(particle => particle !== false);
      
      // Dibujar partículas activas
      activeParticles.forEach(particle => {
        if (particle) drawParticle(ctx, particle);
      });
      
      // Si no quedan partículas, detener animación
      if (activeParticles.length === 0) {
        setIsActive(false);
        return [];
      }
      
      return activeParticles.filter(p => p);
    });
    
    // Continuar animación
    if (isActive) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isActive, updateParticle, drawParticle]);

  // Inicializar confetti cuando se recibe un trigger
  useEffect(() => {
    if (!trigger) return;
    
    console.log(`🎊 Iniciando confetti: ${type}`);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Configurar canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const config = getConfig();
    
    // Crear partículas
    const newParticles = [];
    for (let i = 0; i < config.count; i++) {
      newParticles.push(createParticle(config, canvas));
    }
    
    setParticles(newParticles);
    setIsActive(true);
    
    // Cleanup automático después de la duración máxima
    cleanupTimeoutRef.current = setTimeout(() => {
      setIsActive(false);
      setParticles([]);
      console.log('🧹 Confetti cleanup automático');
    }, duration);
    
  }, [trigger, type, getConfig, createParticle, duration]);

  // Iniciar animación cuando se activa
  useEffect(() => {
    if (isActive && particles.length > 0) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isActive, particles.length, animate]);

  // Cleanup al desmontar o cambiar
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
        cleanupTimeoutRef.current = null;
      }
      setParticles([]);
      setIsActive(false);
      console.log('🧹 Confetti desmontado');
    };
  }, []);

  // Redimensionar canvas
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // No renderizar si no está activo
  if (!isActive && particles.length === 0) {
    return null;
  }

  return (
    <div 
      className="confetti-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000,
        overflow: 'hidden'
      }}
    >
      <canvas 
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      />
      
      {/* Indicador de debug (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && isActive && (
        <div style={{
          position: 'absolute',
          top: 20,
          right: 20,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          🎊 {particles.length} partículas activas
        </div>
      )}
    </div>
  );
};

export default ConfettiSystem;