// src/App.jsx - TodoList Pro con coordinación de componentes existentes
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  CheckSquare, 
  Clock, 
  Target, 
  BarChart3, 
  Zap, 
  Plus,
  Trophy,
  Sparkles,
  FileText,
  AlertCircle,
  Calendar
} from 'lucide-react';

// Importar todos los componentes existentes
import TodoItem from './components/TodoItem';
import ConfettiSystem from './components/ConfettiSystem';
import AnimatedBackground from './components/AnimatedBackground';
import StatsCard from './components/StatsCard';
import FilterTabs from './components/FilterTabs';
import TodoInput from './components/TodoInput';
import FocusMode from './components/FocusMode';
import AchievementsDisplay from './components/AchievementsDisplay';
import { ToastContainer } from './components/ToastNotification';

// Importar todos los hooks existentes
import useNotifications from './hooks/useNotifications';
import { useStats } from './hooks/useStats';
import { useFilters } from './hooks/useFilters';
import { useAnimations } from './hooks/useAnimations';
import { useTodosStorage, useAppSettings } from './hooks/useLocalStorage';
import { useGamification } from './hooks/useGamification';

import './styles/App.css';

const TodoApp = () => {
  // Estados principales usando hooks existentes
  const [todos, setTodos] = useTodosStorage();
  const [appSettings] = useAppSettings();
  const [inputValue, setInputValue] = useState('');
  const [focusModeActive, setFocusModeActive] = useState(false);
  const [currentFocusTask, setCurrentFocusTask] = useState(null);
  const [showAchievements, setShowAchievements] = useState(false);
  
  // Referencias
  const inputRef = useRef(null);
  const lastCelebrationRef = useRef(null);
  const celebrationTriggeredRef = useRef(false);
  
  // Hooks especializados existentes
  const stats = useStats(todos);
  const filters = useFilters(todos);
  const animations = useAnimations();
  const gamification = useGamification(todos);
  
  // Hook de notificaciones
  const { 
    toasts, 
    removeToast, 
    addToast,
    smartMessages
  } = useNotifications({
    maxToasts: 3,
    defaultDuration: 3000,
    enableMotivational: false,
    rateLimitMs: 2000
  });

  // Efecto para manejar nuevos logros desbloqueados
  useEffect(() => {
    if (gamification.recentlyUnlocked && gamification.recentlyUnlocked.length > 0) {
      gamification.recentlyUnlocked.forEach(achievement => {
        addToast(`¡Logro desbloqueado: ${achievement.title}!`, 'success', 4000);
      });
    }
  }, [gamification.recentlyUnlocked, addToast]);

  // Detectar cuando se completan todas las tareas (SIN REPETIR)
  useEffect(() => {
    const allCompleted = stats.isAllCompleted && stats.totalTodos > 0;
    const shouldCelebrate = allCompleted && !celebrationTriggeredRef.current;
    
    if (shouldCelebrate) {
      celebrationTriggeredRef.current = true;
      lastCelebrationRef.current = Date.now();
      
      animations.startCelebration();
      smartMessages.celebration();
    }
    
    if (!allCompleted && celebrationTriggeredRef.current) {
      celebrationTriggeredRef.current = false;
    }
  }, [stats.isAllCompleted, stats.totalTodos, animations, smartMessages]);

  // Funciones simples para coordinar los componentes
  const addTodo = useCallback(() => {
    const text = inputValue.trim();
    if (!text) {
      animations.shakeElement('todo-input');
      addToast('Por favor escribe algo primero', 'error', 2000);
      return;
    }

    const newTodo = {
      id: Date.now() + Math.random(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
      priority: text.includes('!') ? 'high' : 'normal'
    };

    setTodos(prev => [...prev, newTodo]);
    setInputValue('');
    animations.animateItem(newTodo.id);
    
    addToast('Tarea agregada', 'success', 2000);
    inputRef.current?.focus();
  }, [inputValue, setTodos, animations, addToast]);

  // Alternar completado
  const toggleTodo = useCallback((id) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id
        ? { 
            ...todo, 
            completed: !todo.completed,
            completedAt: !todo.completed ? new Date().toISOString() : null 
          }
        : todo
    ));

    const todo = todos.find(t => t.id === id);
    if (todo && !todo.completed) {
      animations.animateItem(id);
      addToast('¡Tarea completada!', 'success', 2000);
    }
  }, [todos, setTodos, animations, addToast]);

  // Eliminar tarea
  const deleteTodo = useCallback((id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
    addToast('Tarea eliminada', 'info', 1500);
  }, [setTodos, addToast]);

  // Editar tarea
  const editTodo = useCallback((id, newText) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, text: newText } : todo
    ));
    addToast('Tarea actualizada', 'info', 1500);
  }, [setTodos, addToast]);

  // Establecer tarea de enfoque
  const setFocusTask = useCallback((todo) => {
    setCurrentFocusTask(todo);
    setFocusModeActive(true);
    addToast('Modo enfoque activado', 'info', 2000);
  }, [addToast]);

  // Manejar teclas
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      addTodo();
    } else if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      inputRef.current?.focus();
    }
  }, [addTodo]);

  const { filterOptions, filteredTodos } = filters;

  return (
    <>
      {/* Fondo animado sutil */}
      <AnimatedBackground 
        theme="auto"
        intensity="low"
        particleCount={30}
        enableParallax={appSettings.animations}
      />
      
      <div className={`app-container ${animations.celebrationMode ? 'celebration-mode' : ''}`}>
        {/* Sistema de Confetti controlado */}
        {animations.confettiTrigger && (
          <ConfettiSystem 
            key={animations.confettiTrigger.timestamp}
            trigger={animations.confettiTrigger} 
            type={animations.confettiTrigger?.type || 'default'}
            intensity="medium"
          />
        )}

        {/* Contenedor de Toasts */}
        <ToastContainer toasts={toasts} removeToast={removeToast} />

        {/* Header limpio */}
        <header className="app-header">
          <div className="header-content">
            <h1 className="app-title">
              TodoList
              <span className="app-title-accent">Pro</span>
              {animations.celebrationMode && (
                <Sparkles className="celebration-emoji" size={32} />
              )}
            </h1>
            <div className="header-actions">
              {gamification.userLevel && (
                <button 
                  onClick={() => setShowAchievements(true)}
                  className="btn btn-outline-primary btn-sm"
                  title="Ver logros"
                >
                  <Trophy size={16} />
                  Nivel {gamification.userLevel.level}
                </button>
              )}
            </div>
          </div>
          <p className="app-subtitle">
            {animations.celebrationMode 
              ? '¡Eres increíble! ¡Todas las tareas completadas!' 
              : 'Organiza tus tareas con estilo'
            }
          </p>
        </header>

        {/* Formulario principal */}
        <div className="todo-form-section">
          {/* Modo Enfoque - usando el componente existente */}
          <FocusMode 
            isActive={focusModeActive}
            onToggle={() => setFocusModeActive(!focusModeActive)}
            currentTask={currentFocusTask}
          />

          {/* Input principal */}
          <div className="input-section">
            <TodoInput
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onSubmit={addTodo}
              onKeyPress={handleKeyPress}
              placeholder="¿Qué quieres lograr hoy?"
              maxLength={200}
              showHints={true}
            />
            <button 
              onClick={addTodo}
              className="btn btn-primary add-btn"
              disabled={!inputValue.trim()}
            >
              <Plus className="btn-icon" size={20} />
              <span className="btn-text">Agregar</span>
            </button>
          </div>
        </div>

        {/* Estadísticas con iconos mejorados */}
        <div className="stats-section">
          <div className="stats-grid">
            <StatsCard
              icon={<FileText size={24} />}
              label="Total"
              value={stats.totalTodos}
              variant="primary"
            />
            <StatsCard
              icon={<Clock size={24} />}
              label="Pendientes"
              value={stats.pendingTodos}
              variant="warning"
            />
            <StatsCard
              icon={<CheckSquare size={24} />}
              label="Completadas"
              value={stats.completedTodos}
              variant="success"
            />
            <StatsCard
              icon={<BarChart3 size={24} />}
              label="Progreso"
              value={`${stats.completionPercentage}%`}
              variant="info"
              showProgress={true}
              progress={stats.completionPercentage}
            />
            <StatsCard
              icon={<Zap size={24} />}
              label="Puntos"
              value={gamification.totalPoints || 0}
              variant="warning"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="filters-section">
          <FilterTabs 
            options={filterOptions}
            activeFilter={filters.activeFilter}
            onFilterChange={filters.setActiveFilter}
            showBadges={true}
          />
        </div>

        {/* Lista de tareas */}
        <div className="todos-section">
          {filteredTodos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                {filters.activeFilter === 'completed' ? (
                  <CheckSquare size={64} className="text-success-500" />
                ) : filters.activeFilter === 'pending' ? (
                  <Clock size={64} className="text-warning-500" />
                ) : (
                  <FileText size={64} className="text-primary-500" />
                )}
              </div>
              <h3 className="empty-state-title">
                {filters.activeFilter === 'completed' 
                  ? '¡Aún no has completado ninguna tarea!'
                  : filters.activeFilter === 'pending'
                  ? '¡Excelente! No tienes tareas pendientes'
                  : '¡Empieza agregando tu primera tarea!'}
              </h3>
              <p className="empty-state-description">
                {filters.activeFilter === 'completed' 
                  ? 'Completa algunas tareas para verlas aquí'
                  : filters.activeFilter === 'pending'
                  ? 'Todas tus tareas están completadas'
                  : 'Escribe en el campo de arriba y presiona Agregar'}
              </p>
            </div>
          ) : (
            <div className="todos-list">
              {filteredTodos.map((todo, index) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={() => toggleTodo(todo.id)}
                  onDelete={() => deleteTodo(todo.id)}
                  onEdit={editTodo}
                  onFocus={() => setFocusTask(todo)}
                  animatingItems={animations.animatingItems}
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer con atajos */}
        <footer className="app-footer">
          <div className="shortcuts-info">
            <div className="shortcuts-text">
              <span className="hint-item">
                <kbd>Enter</kbd> para agregar
              </span>
              <span className="hint-item">
                <kbd>Ctrl</kbd> + <kbd>K</kbd> para enfocar
              </span>
              <span className="hint-item">
                <kbd>!</kbd> para prioridad alta
              </span>
            </div>
          </div>
          <div className="footer-stats">
            <span className="footer-stat">
              <BarChart3 size={14} style={{ display: 'inline', marginRight: '4px' }} />
              {stats.completionPercentage}% completado
            </span>
            <span className="footer-stat">
              <Zap size={14} style={{ display: 'inline', marginRight: '4px' }} />
              {gamification.totalPoints || 0} puntos
            </span>
            <span className="footer-stat">
              <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
              {stats.todayTodos} tareas hoy
            </span>
          </div>
        </footer>
      </div>

      {/* Modal de logros */}
      {showAchievements && (
        <AchievementsDisplay
          isOpen={showAchievements}
          onClose={() => setShowAchievements(false)}
          achievements={gamification.achievements}
          achievementDefinitions={gamification.achievementDefinitions}
          userLevel={gamification.userLevel}
          stats={gamification.detailedStats}
        />
      )}
    </>
  );
};

export default TodoApp;