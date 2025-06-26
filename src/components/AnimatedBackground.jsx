// components/AnimatedBackground.jsx - Sistema de fondo animado con Canvas
import React, { useEffect, useRef, useState } from 'react';

const AnimatedBackground = ({ 
  theme = 'auto', 
  intensity = 'medium',
  particleCount = 50,
  enableParallax = true 
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [currentTheme, setCurrentTheme] = useState('light');

  // Detectar tema del sistema
  useEffect(() => {
    if (theme === 'auto') {
      const updateTheme = () => {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setCurrentTheme(isDark ? 'dark' : 'light');
      };
      
      updateTheme();
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateTheme);
      
      return () => mediaQuery.removeEventListener('change', updateTheme);
    } else {
      setCurrentTheme(theme);
    }
  }, [theme]);

  // Configuración de partículas basada en intensidad
  const getConfig = () => {
    const configs = {
      low: { particles: Math.floor(particleCount * 0.5), speed: 0.5, size: 1 },
      medium: { particles: particleCount, speed: 1, size: 1.5 },
      high: { particles: Math.floor(particleCount * 1.5), speed: 1.5, size: 2 }
    };
    return configs[intensity] || configs.medium;
  };

  // Colores por tema
  const getThemeColors = () => {
    if (currentTheme === 'dark') {
      return {
        particles: ['rgba(147, 197, 253, 0.4)', 'rgba(196, 181, 253, 0.4)', 'rgba(252, 165, 165, 0.4)'],
        gradient: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1), transparent)',
        glow: 'rgba(59, 130, 246, 0.2)'
      };
    }
    return {
      particles: ['rgba(59, 130, 246, 0.3)', 'rgba(168, 85, 247, 0.3)', 'rgba(34, 197, 94, 0.3)'],
      gradient: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.05), rgba(168, 85, 247, 0.05), transparent)',
      glow: 'rgba(168, 85, 247, 0.15)'
    };
  };

  // Clase de partícula
  class Particle {
    constructor(canvas, config, colors) {
      this.canvas = canvas;
      this.config = config;
      this.colors = colors;
      this.reset();
      this.age = Math.random() * 1000;
    }

    reset() {
      this.x = Math.random() * this.canvas.width;
      this.y = Math.random() * this.canvas.height;
      this.vx = (Math.random() - 0.5) * this.config.speed;
      this.vy = (Math.random() - 0.5) * this.config.speed;
      this.size = Math.random() * this.config.size + 0.5;
      this.color = this.colors.particles[Math.floor(Math.random() * this.colors.particles.length)];
      this.life = Math.random() * 100 + 50;
      this.decay = Math.random() * 0.02 + 0.005;
    }

    update(mouse, enableParallax) {
      this.age++;
      
      // Movimiento base
      this.x += this.vx;
      this.y += this.vy;

      // Efecto parallax con el mouse
      if (enableParallax && mouse) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const force = (100 - distance) / 100;
          this.x += dx * force * 0.01;
          this.y += dy * force * 0.01;
        }
      }

      // Movimiento ondulatorio
      this.x += Math.sin(this.age * 0.01) * 0.5;
      this.y += Math.cos(this.age * 0.015) * 0.3;

      // Decrementar vida
      this.life -= this.decay;

      // Reposicionar si sale del canvas
      if (this.x < 0) this.x = this.canvas.width;
      if (this.x > this.canvas.width) this.x = 0;
      if (this.y < 0) this.y = this.canvas.height;
      if (this.y > this.canvas.height) this.y = 0;

      // Regenerar si muere
      if (this.life <= 0) {
        this.reset();
      }
    }

    draw(ctx) {
      const alpha = Math.max(0, this.life / 100);
      
      ctx.save();
      ctx.globalAlpha = alpha;
      
      // Glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      
      // Particle
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      
      ctx.restore();
    }
  }

  // Tracking del mouse
  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Inicialización y animación del canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const config = getConfig();
    const colors = getThemeColors();

    // Configurar tamaño del canvas
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Inicializar partículas
    particlesRef.current = Array.from({ length: config.particles }, 
      () => new Particle(canvas, config, colors)
    );

    // Loop de animación
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Actualizar y dibujar partículas
      particlesRef.current.forEach(particle => {
        particle.update(mouseRef.current, enableParallax);
        particle.draw(ctx);
      });

      // Conectar partículas cercanas
      drawConnections(ctx, particlesRef.current, colors.glow);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentTheme, intensity, particleCount, enableParallax]);

  // Dibujar conexiones entre partículas
  const drawConnections = (ctx, particles, glowColor) => {
    const maxDistance = 120;
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          const alpha = (1 - distance / maxDistance) * 0.2;
          
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = glowColor;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  };

  return (
    <div className="animated-background">
      <canvas
        ref={canvasRef}
        className="background-canvas"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          pointerEvents: 'none',
          background: getThemeColors().gradient
        }}
      />
      
      {/* Overlay gradient para mejor legibilidad */}
      <div 
        className="background-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          background: currentTheme === 'dark' 
            ? 'radial-gradient(circle at center, transparent 40%, rgba(15, 23, 42, 0.8) 100%)'
            : 'radial-gradient(circle at center, transparent 40%, rgba(248, 250, 252, 0.8) 100%)',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
