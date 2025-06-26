// components/FocusMode.jsx - Modo enfoque con iconos profesionales
import React, { useState, useEffect, useRef } from 'react';
import {
  Target,
  Play,
  Pause,
  Square,
  RotateCcw,
  Minimize2,
  Maximize2,
  Settings,
  Volume2,
  VolumeX,
  CheckCircle,
  Clock,
  Coffee,
  Brain,
  Zap
} from 'lucide-react';

const FocusMode = ({ isActive, onToggle, currentTask }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutos en segundos
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState('focus'); // 'focus', 'shortBreak', 'longBreak'
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoStartBreaks, setAutoStartBreaks] = useState(false);
  const [notifications, setNotifications] = useState(true);
  
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Configuraciones de tiempo por sesión
  const sessionConfig = {
    focus: { duration: 25 * 60, label: 'Enfoque', icon: <Brain size={20} /> },
    shortBreak: { duration: 5 * 60, label: 'Descanso Corto', icon: <Coffee size={20} /> },
    longBreak: { duration: 15 * 60, label: 'Descanso Largo', icon: <Coffee size={20} /> }
  };

  // Inicializar tiempo cuando cambia el tipo de sesión
  useEffect(() => {
    setTimeLeft(sessionConfig[sessionType].duration);
    setIsRunning(false);
  }, [sessionType]);

  // Timer principal
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  // Completar sesión
  const handleSessionComplete = () => {
    setIsRunning(false);
    
    // Reproducir sonido si está habilitado
    if (soundEnabled) {
      playNotificationSound();
    }
    
    // Mostrar notificación si está habilitado
    if (notifications && 'Notification' in window) {
      new Notification(`¡Sesión de ${sessionConfig[sessionType].label} completada!`, {
        icon: '/favicon.ico',
        body: currentTask ? `Tarea: ${currentTask.text}` : 'Tiempo para un descanso'
      });
    }

    // Lógica de sesiones automáticas
    if (sessionType === 'focus') {
      setSessionsCompleted(prev => prev + 1);
      const newSessions = sessionsCompleted + 1;
      
      // Cada 4 sesiones, descanso largo
      const nextSessionType = newSessions % 4 === 0 ? 'longBreak' : 'shortBreak';
      setSessionType(nextSessionType);
      
      if (autoStartBreaks) {
        setTimeout(() => setIsRunning(true), 2000);
      }
    } else {
      setSessionType('focus');
    }
  };

  // Reproducir sonido de notificación
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn('No se pudo reproducir el sonido:', error);
    }
  };

  // Formatear tiempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calcular progreso del círculo
  const totalTime = sessionConfig[sessionType].duration;
  const progress = ((totalTime - timeLeft) / totalTime) * 360;

  // Controles del timer
  const startPause = () => setIsRunning(!isRunning);
  const reset = () => {
    setIsRunning(false);
    setTimeLeft(sessionConfig[sessionType].duration);
  };
  const stop = () => {
    setIsRunning(false);
    setTimeLeft(sessionConfig[sessionType].duration);
    setSessionType('focus');
  };

  // Solicitar permisos de notificación
  useEffect(() => {
    if (notifications && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [notifications]);

  if (!isActive) {
    return (
      <button
        onClick={onToggle}
        className="btn btn-outline-primary btn-sm"
        title="Activar modo enfoque"
      >
        <Target size={16} />
        Modo Enfoque
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="focus-mode-minimized">
        <div className="minimized-content">
          <button
            onClick={() => setIsMinimized(false)}
            className="btn btn-ghost btn-sm"
            title="Expandir modo enfoque"
          >
            <Maximize2 size={16} />
          </button>
          <div className="minimized-timer">
            {formatTime(timeLeft)}
          </div>
          <div className="minimized-session">
            {sessionConfig[sessionType].icon}
          </div>
          <button
            onClick={startPause}
            className="btn btn-ghost btn-sm"
            title={isRunning ? 'Pausar' : 'Iniciar'}
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="focus-mode-panel">
      {/* Header */}
      <div className="focus-header">
        <h3 className="focus-title">
          <Target size={24} />
          Modo Enfoque
        </h3>
        <div className="focus-header-actions">
          <button
            onClick={() => setIsMinimized(true)}
            className="btn btn-ghost btn-sm"
            title="Minimizar"
          >
            <Minimize2 size={16} />
          </button>
          <button
            onClick={onToggle}
            className="btn btn-ghost btn-sm"
            title="Cerrar modo enfoque"
          >
            ×
          </button>
        </div>
      </div>

      {/* Tarea actual */}
      {currentTask && (
        <div className="current-task">
          <h4>
            <CheckCircle size={16} />
            Tarea Actual
          </h4>
          <p>{currentTask.text}</p>
        </div>
      )}

      {/* Timer circular */}
      <div className="timer-display">
        <div 
          className="timer-circle"
          style={{
            background: `conic-gradient(var(--primary-500) ${progress}deg, var(--gray-200) ${progress}deg)`
          }}
        >
          <div className="timer-inner">
            <div className="session-label">
              {sessionConfig[sessionType].icon}
              {sessionConfig[sessionType].label}
            </div>
            <div className="time-text">
              {formatTime(timeLeft)}
            </div>
            <div className="session-progress">
              Sesión {sessionsCompleted + 1}
            </div>
          </div>
        </div>
      </div>

      {/* Controles principales */}
      <div className="timer-controls">
        <button
          onClick={reset}
          className="btn btn-secondary"
          title="Reiniciar timer"
          disabled={!isRunning && timeLeft === sessionConfig[sessionType].duration}
        >
          <RotateCcw size={20} />
          Reiniciar
        </button>
        
        <button
          onClick={startPause}
          className={`btn ${isRunning ? 'btn-warning' : 'btn-primary'} btn-lg`}
          title={isRunning ? 'Pausar' : 'Iniciar'}
        >
          {isRunning ? <Pause size={24} /> : <Play size={24} />}
          {isRunning ? 'Pausar' : 'Iniciar'}
        </button>
        
        <button
          onClick={stop}
          className="btn btn-secondary"
          title="Detener sesión"
          disabled={!isRunning && timeLeft === sessionConfig[sessionType].duration}
        >
          <Square size={20} />
          Detener
        </button>
      </div>

      {/* Tipos de sesión */}
      <div className="session-types">
        {Object.entries(sessionConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setSessionType(key)}
            className={`session-btn ${sessionType === key ? 'active' : ''}`}
            disabled={isRunning}
            style={{ 
              borderColor: sessionType === key ? 'var(--primary-500)' : undefined,
              backgroundColor: sessionType === key ? 'var(--primary-50)' : undefined
            }}
          >
            {config.icon}
            {config.label}
          </button>
        ))}
      </div>

      {/* Estadísticas de sesión */}
      <div className="session-stats">
        <div className="stat-item">
          <span className="stat-label">
            <Zap size={16} />
            Sesiones completadas:
          </span>
          <span className="stat-value">{sessionsCompleted}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">
            <Clock size={16} />
            Tiempo enfocado hoy:
          </span>
          <span className="stat-value">{Math.floor(sessionsCompleted * 25 / 60)}h {(sessionsCompleted * 25) % 60}m</span>
        </div>
      </div>

      {/* Configuración rápida */}
      <div className="quick-settings">
        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
            />
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            Sonidos
          </label>
        </div>
        
        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={autoStartBreaks}
              onChange={(e) => setAutoStartBreaks(e.target.checked)}
            />
            <Play size={16} />
            Auto-iniciar descansos
          </label>
        </div>
        
        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
            <Settings size={16} />
            Notificaciones
          </label>
        </div>
      </div>
    </div>
  );
};

export default FocusMode;