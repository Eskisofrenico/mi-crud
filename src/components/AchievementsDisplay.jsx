// components/AchievementsDisplay.jsx - Sistema de logros completo
import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Medal, 
  Star, 
  Target, 
  Flame, 
  Zap, 
  CheckCircle, 
  X, 
  Award,
  Crown,
  Calendar,
  TrendingUp,
  Lock
} from 'lucide-react';

// Definiciones de logros (inspirado en taskr)
const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first-task',
    title: 'Primer Paso',
    description: 'Completa tu primera tarea',
    icon: Target,
    category: 'milestones',
    iconColor: '#10b981',
    points: 10,
    condition: (stats) => stats.totalCompleted >= 1
  },
  {
    id: 'task-5',
    title: 'En Marcha',
    description: 'Completa 5 tareas',
    icon: Zap,
    category: 'productivity',
    iconColor: '#3b82f6',
    points: 25,
    condition: (stats) => stats.totalCompleted >= 5
  },
  {
    id: 'task-10',
    title: 'Productivo',
    description: 'Completa 10 tareas',
    icon: CheckCircle,
    category: 'productivity',
    iconColor: '#f59e0b',
    points: 50,
    condition: (stats) => stats.totalCompleted >= 10
  },
  {
    id: 'task-25',
    title: 'Imparable',
    description: 'Completa 25 tareas',
    icon: Award,
    category: 'milestones',
    iconColor: '#8b5cf6',
    points: 100,
    condition: (stats) => stats.totalCompleted >= 25
  },
  {
    id: 'task-50',
    title: 'Maestro de Tareas',
    description: 'Completa 50 tareas',
    icon: Crown,
    category: 'milestones',
    iconColor: '#f59e0b',
    points: 200,
    condition: (stats) => stats.totalCompleted >= 50
  },
  {
    id: 'streak-3',
    title: 'Constante',
    description: 'Mantén una racha de 3 días',
    icon: Flame,
    category: 'consistency',
    iconColor: '#ef4444',
    points: 75,
    condition: (stats) => stats.currentStreak >= 3
  },
  {
    id: 'streak-7',
    title: 'Disciplinado',
    description: 'Mantén una racha de 7 días',
    icon: Calendar,
    category: 'consistency',
    iconColor: '#f97316',
    points: 150,
    condition: (stats) => stats.currentStreak >= 7
  },
  {
    id: 'perfectionist',
    title: 'Perfeccionista',
    description: 'Alcanza 100% de progreso',
    icon: Star,
    category: 'special',
    iconColor: '#eab308',
    points: 300,
    condition: (stats) => stats.totalTasks > 0 && stats.totalCompleted === stats.totalTasks
  }
];

const AchievementsDisplay = ({ 
  isOpen, 
  onClose, 
  achievements = [], 
  achievementDefinitions = [],
  userLevel = {}, 
  stats = {},
  gamification = {}
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Calcular logros desbloqueados basado en estadísticas actuales
  const unlockedAchievements = useMemo(() => {
    return ACHIEVEMENT_DEFINITIONS.filter(achievement => 
      achievement.condition(stats)
    ).map(achievement => ({
      ...achievement,
      unlocked: true,
      unlockedAt: new Date().toISOString() // En un caso real, esto vendría de la base de datos
    }));
  }, [stats]);

  // Calcular progreso del usuario usando datos de gamification
  const userProgress = useMemo(() => {
    // Usar EXACTAMENTE los mismos puntos que el dashboard
    const totalPoints = gamification.totalPoints || 0;
    const currentLevel = gamification.userLevel?.level || 1;
    const currentExperience = gamification.userLevel?.experience || 0;
    const levelInfo = gamification.levelInfo || { nextLevelXP: 100, progress: 0 };
    
    // Debug: verificar que los puntos coincidan
    console.log('Modal - Puntos totales:', totalPoints);
    console.log('Modal - Gamification completo:', gamification);
    
    return {
      level: currentLevel,
      totalPoints, // Estos deben ser exactamente los mismos que en el footer
      currentLevelPoints: currentExperience,
      nextLevelPoints: levelInfo.nextLevelXP || 100,
      progress: levelInfo.progress || 0
    };
  }, [gamification]);

  // Categorizar logros
  const categorizedAchievements = useMemo(() => {
    const categories = {
      milestones: { name: 'Hitos', icon: Trophy, achievements: [] },
      productivity: { name: 'Productividad', icon: Zap, achievements: [] },
      consistency: { name: 'Consistencia', icon: Flame, achievements: [] },
      special: { name: 'Especiales', icon: Crown, achievements: [] }
    };

    ACHIEVEMENT_DEFINITIONS.forEach(achievement => {
      const isUnlocked = unlockedAchievements.some(ua => ua.id === achievement.id);
      categories[achievement.category].achievements.push({
        ...achievement,
        unlocked: isUnlocked
      });
    });

    return categories;
  }, [unlockedAchievements]);

  if (!isOpen) return null;

  return (
    <div className="achievements-backdrop">
      <div className="achievements-modal">
        {/* Header */}
        <div className="achievements-header">
          <div className="header-content">
            <h2 className="modal-title">
              <Trophy size={28} />
              Panel de Logros
            </h2>
            <div className="header-stats">
              <div className="stat-item">
                <Trophy size={16} />
                {unlockedAchievements.length} / {ACHIEVEMENT_DEFINITIONS.length} Logros
              </div>
              <div className="stat-item">
                <Medal size={16} />
                {userProgress.totalPoints} Puntos
              </div>
              <div className="stat-item">
                <Crown size={16} />
                Nivel {userProgress.level}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="achievements-tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          >
            <TrendingUp size={18} />
            <span>Resumen</span>
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
          >
            <Trophy size={18} />
            <span>Logros</span>
          </button>
        </div>

        {/* Content */}
        <div className="achievements-content">
          {activeTab === 'overview' && (
            <div className="tab-panel">
              {/* Progress Overview */}
              <div className="level-overview">
                <div className="level-display">
                  <div className="level-icon">
                    <Crown size={32} style={{ color: '#f59e0b' }} />
                  </div>
                  <div className="level-info">
                    <h3>Nivel {userProgress.level}</h3>
                    <p>Organizador {userProgress.level > 5 ? 'Avanzado' : 'Novato'}</p>
                    <div className="level-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${userProgress.progress}%` }}
                        />
                      </div>
                      <span className="progress-text">
                        {userProgress.currentLevelPoints} / {userProgress.nextLevelPoints} puntos
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Achievements */}
              <div className="recent-achievements">
                <h4>
                  <Medal size={20} />
                  Logros Recientes
                </h4>
                {unlockedAchievements.length > 0 ? (
                  <div className="achievements-list">
                    {unlockedAchievements.slice(-3).reverse().map(achievement => {
                      const IconComponent = achievement.icon;
                      return (
                        <div key={achievement.id} className="achievement-item recent">
                          <div className="achievement-icon">
                            <IconComponent size={24} style={{ color: achievement.iconColor }} />
                          </div>
                          <div className="achievement-content">
                            <h5>{achievement.title}</h5>
                            <p>{achievement.description}</p>                          <div className="achievement-meta">
                            <span className="achievement-points">
                              <Zap size={12} />
                              +{achievement.points} pts
                            </span>
                          </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-state">
                    <Trophy size={48} />
                    <p>¡Completa tareas para desbloquear logros!</p>
                  </div>
                )}
              </div>

              {/* Next Achievements */}
              <div className="next-achievements">
                <h4>
                  <Target size={20} />
                  Próximos Objetivos
                </h4>
                <div className="next-goals">
                  {ACHIEVEMENT_DEFINITIONS
                    .filter(def => !unlockedAchievements.some(ua => ua.id === def.id))
                    .slice(0, 3)
                    .map(goal => {
                      const IconComponent = goal.icon;
                      return (
                        <div key={goal.id} className="goal-card">
                          <div className="goal-header">
                            <div className="goal-icon">
                              <IconComponent size={20} style={{ color: '#9ca3af' }} />
                            </div>
                            <h5>{goal.title}</h5>
                          </div>
                          <p>{goal.description}</p>
                          <div className="goal-reward">
                            <Medal size={14} />
                            {goal.points} pts
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="tab-panel">
              {/* Categories */}
              {Object.entries(categorizedAchievements).map(([categoryId, category]) => (
                <div key={categoryId} className="achievement-category">
                  <h4 className="category-title">
                    <category.icon size={20} />
                    {category.name}
                    <span className="category-count">
                      ({category.achievements.filter(a => a.unlocked).length}/{category.achievements.length})
                    </span>
                  </h4>
                  <div className="achievements-grid">
                    {category.achievements.map(achievement => {
                      const IconComponent = achievement.icon;
                      return (
                        <div
                          key={achievement.id}
                          className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                        >
                          <div className="achievement-icon">
                            <IconComponent 
                              size={24} 
                              style={{ 
                                color: achievement.unlocked ? achievement.iconColor : '#9ca3af',
                                opacity: achievement.unlocked ? 1 : 0.5
                              }} 
                            />
                          </div>
                          <div className="achievement-content">
                            <h5>{achievement.title}</h5>
                            <p>{achievement.description}</p>
                            <div className="achievement-meta">
                              <span className="achievement-points">
                                <Zap size={12} />
                                +{achievement.points} pts
                              </span>
                              {!achievement.unlocked && (
                                <div className="locked-indicator">
                                  <Lock size={12} />
                                  Bloqueado
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementsDisplay;