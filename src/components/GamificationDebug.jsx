// components/GamificationDebug.jsx - Panel de debug para verificar sincronización
import React, { useState } from 'react';
import { 
  Bug, 
  Refresh, 
  Check, 
  X, 
  Info,
  Zap,
  Trophy,
  Target
} from 'lucide-react';

const GamificationDebug = ({ 
  todos = [], 
  gamification = {}, 
  stats = {},
  isVisible = false,
  onToggle 
}) => {
  const [expanded, setExpanded] = useState(false);

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="debug-toggle"
        title="Mostrar panel de debug"
      >
        <Bug size={16} />
      </button>
    );
  }

  // Verificaciones de sincronización
  const checks = [
    {
      id: 'todos-count',
      name: 'Conteo de tareas',
      status: todos.length === stats.totalTodos ? 'success' : 'error',
      expected: todos.length,
      actual: stats.totalTodos,
      description: 'El hook useStats debe coincidir con el array de todos'
    },
    {
      id: 'completed-count',
      name: 'Tareas completadas',
      status: todos.filter(t => t.completed).length === stats.completedTodos ? 'success' : 'error',
      expected: todos.filter(t => t.completed).length,
      actual: stats.completedTodos,
      description: 'Las tareas completadas deben coincidir'
    },
    {
      id: 'achievements-check',
      name: 'Sistema de logros',
      status: gamification.achievements && Array.isArray(gamification.achievements) ? 'success' : 'error',
      expected: 'Array de logros',
      actual: typeof gamification.achievements,
      description: 'Los logros deben ser un array válido'
    },
    {
      id: 'level-check',
      name: 'Sistema de niveles',
      status: gamification.userLevel && gamification.userLevel.level ? 'success' : 'error',
      expected: 'Objeto con nivel',
      actual: gamification.userLevel?.level || 'undefined',
      description: 'El usuario debe tener un nivel válido'
    },
    {
      id: 'points-check',
      name: 'Sistema de puntos',
      status: typeof gamification.userLevel?.experience === 'number' ? 'success' : 'error',
      expected: 'Número',
      actual: typeof gamification.userLevel?.experience,
      description: 'La experiencia debe ser un número'
    }
  ];

  const passedChecks = checks.filter(check => check.status === 'success').length;
  const totalChecks = checks.length;

  // Calcular estadísticas en tiempo real
  const realTimeStats = {
    totalTodos: todos.length,
    completedTodos: todos.filter(t => t.completed).length,
    pendingTodos: todos.filter(t => !t.completed).length,
    completionRate: todos.length > 0 ? Math.round((todos.filter(t => t.completed).length / todos.length) * 100) : 0
  };

  // Información de gamificación
  const gamificationInfo = {
    achievements: gamification.achievements?.length || 0,
    unlockedAchievements: gamification.achievements?.filter(a => a.unlocked || a.unlockedAt)?.length || 0,
    userLevel: gamification.userLevel?.level || 1,
    experience: gamification.userLevel?.experience || 0,
    currentStreak: gamification.streaks?.current || 0,
    longestStreak: gamification.streaks?.longest || 0
  };

  return (
    <div className={`debug-panel ${expanded ? 'expanded' : 'collapsed'}`}>
      {/* Header */}
      <div className="debug-header" onClick={() => setExpanded(!expanded)}>
        <div className="debug-title">
          <Bug size={16} />
          <span>Debug Gamificación</span>
          <span className={`status-badge ${passedChecks === totalChecks ? 'success' : 'error'}`}>
            {passedChecks}/{totalChecks}
          </span>
        </div>
        <button className="debug-close" onClick={onToggle}>
          <X size={14} />
        </button>
      </div>

      {/* Contenido expandible */}
      {expanded && (
        <div className="debug-content">
          {/* Verificaciones de sincronización */}
          <div className="debug-section">
            <h4>
              <Check size={16} />
              Verificaciones de Sincronización
            </h4>
            <div className="checks-list">
              {checks.map(check => (
                <div key={check.id} className={`check-item ${check.status}`}>
                  <div className="check-icon">
                    {check.status === 'success' ? 
                      <Check size={14} /> : 
                      <X size={14} />
                    }
                  </div>
                  <div className="check-content">
                    <div className="check-name">{check.name}</div>
                    <div className="check-details">
                      <span>Esperado: {check.expected}</span>
                      <span>Actual: {check.actual}</span>
                    </div>
                    <div className="check-description">{check.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estadísticas en tiempo real */}
          <div className="debug-section">
            <h4>
              <Info size={16} />
              Estadísticas en Tiempo Real
            </h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total de tareas:</span>
                <span className="stat-value">{realTimeStats.totalTodos}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Completadas:</span>
                <span className="stat-value">{realTimeStats.completedTodos}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pendientes:</span>
                <span className="stat-value">{realTimeStats.pendingTodos}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Tasa de completado:</span>
                <span className="stat-value">{realTimeStats.completionRate}%</span>
              </div>
            </div>
          </div>

          {/* Información de gamificación */}
          <div className="debug-section">
            <h4>
              <Trophy size={16} />
              Estado de Gamificación
            </h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Nivel actual:</span>
                <span className="stat-value">{gamificationInfo.userLevel}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Experiencia:</span>
                <span className="stat-value">{gamificationInfo.experience} XP</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Logros totales:</span>
                <span className="stat-value">{gamificationInfo.achievements}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Logros desbloqueados:</span>
                <span className="stat-value">{gamificationInfo.unlockedAchievements}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Racha actual:</span>
                <span className="stat-value">{gamificationInfo.currentStreak} días</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Racha más larga:</span>
                <span className="stat-value">{gamificationInfo.longestStreak} días</span>
              </div>
            </div>
          </div>

          {/* Estado de LocalStorage */}
          <div className="debug-section">
            <h4>
              <Refresh size={16} />
              Estado de LocalStorage
            </h4>
            <div className="storage-info">
              <div className="storage-item">
                <span className="storage-key">achievements:</span>
                <span className="storage-value">
                  {localStorage.getItem('achievements') ? 'Configurado' : 'No configurado'}
                </span>
              </div>
              <div className="storage-item">
                <span className="storage-key">user-level:</span>
                <span className="storage-value">
                  {localStorage.getItem('user-level') ? 'Configurado' : 'No configurado'}
                </span>
              </div>
              <div className="storage-item">
                <span className="storage-key">streaks:</span>
                <span className="storage-value">
                  {localStorage.getItem('streaks') ? 'Configurado' : 'No configurado'}
                </span>
              </div>
              <div className="storage-item">
                <span className="storage-key">gamification-stats:</span>
                <span className="storage-value">
                  {localStorage.getItem('gamification-stats') ? 'Configurado' : 'No configurado'}
                </span>
              </div>
            </div>
          </div>

          {/* Acciones de debug */}
          <div className="debug-actions">
            <button 
              className="debug-btn"
              onClick={() => {
                console.log('=== DEBUG GAMIFICATION ===');
                console.log('Todos:', todos);
                console.log('Stats:', stats);
                console.log('Gamification:', gamification);
                console.log('Real-time stats:', realTimeStats);
                console.log('Gamification info:', gamificationInfo);
              }}
            >
              <Info size={14} />
              Log en Consola
            </button>
            <button 
              className="debug-btn warning"
              onClick={() => {
                if (confirm('¿Estás seguro de que quieres resetear toda la gamificación?')) {
                  localStorage.removeItem('achievements');
                  localStorage.removeItem('user-level');
                  localStorage.removeItem('streaks');
                  localStorage.removeItem('gamification-stats');
                  localStorage.removeItem('lastKnownLevel');
                  window.location.reload();
                }
              }}
            >
              <Refresh size={14} />
              Reset Gamificación
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationDebug;