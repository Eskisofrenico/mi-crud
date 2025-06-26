// components/AchievementsDisplay.jsx - Panel de logros con iconos profesionales
import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Star,
  Zap,
  Target,
  Clock,
  CheckCircle,
  TrendingUp,
  Calendar,
  Flame,
  Crown,
  Diamond,
  Sparkles,
  X,
  ChevronRight,
  BarChart3,
  Users,
  Brain,
  Coffee,
  Rocket,
  Shield
} from 'lucide-react';

const AchievementsDisplay = ({ 
  isOpen, 
  onClose, 
  achievements = [], 
  achievementDefinitions = [],
  userLevel = {}, 
  stats = {} 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [animating, setAnimating] = useState(false);

  // Activar animación al abrir
  useEffect(() => {
    if (isOpen) {
      setAnimating(true);
      const timer = setTimeout(() => setAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Obtener icono de logro desde las definiciones
  const getAchievementIcon = (achievementId) => {
    const definition = achievementDefinitions.find(def => def.id === achievementId);
    if (!definition || !definition.icon) {
      return <Star size={24} />;
    }
    
    const IconComponent = definition.icon;
    return <IconComponent size={24} style={{ color: definition.iconColor || '#6b7280' }} />;
  };

  // Calcular progreso al siguiente nivel
  const getNextLevelProgress = () => {
    if (!userLevel.currentXP || !userLevel.nextLevelXP) return 0;
    return Math.min((userLevel.currentXP / userLevel.nextLevelXP) * 100, 100);
  };

  // Obtener icono de nivel
  const getLevelIcon = (level) => {
    if (level >= 50) return <Crown className="text-yellow-500" size={32} />;
    if (level >= 30) return <Diamond className="text-purple-500" size={32} />;
    if (level >= 20) return <Award className="text-blue-500" size={32} />;
    if (level >= 10) return <Medal className="text-green-500" size={32} />;
    return <Trophy className="text-orange-500" size={32} />;
  };

  // Logros recientes (últimos 5)
  const recentAchievements = achievements
    .filter(achievement => achievement.unlockedAt)
    .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
    .slice(0, 5);

  // Categorías de logros
  const achievementCategories = [
    {
      id: 'productivity',
      name: 'Productividad',
      icon: <Target size={20} />,
      achievements: achievements.filter(a => {
        const def = achievementDefinitions.find(d => d.id === a.id);
        return def?.category === 'productivity';
      })
    },
    {
      id: 'consistency',
      name: 'Consistencia',
      icon: <Calendar size={20} />,
      achievements: achievements.filter(a => {
        const def = achievementDefinitions.find(d => d.id === a.id);
        return def?.category === 'consistency';
      })
    },
    {
      id: 'milestones',
      name: 'Hitos',
      icon: <Trophy size={20} />,
      achievements: achievements.filter(a => {
        const def = achievementDefinitions.find(d => d.id === a.id);
        return def?.category === 'milestones';
      })
    },
    {
      id: 'special',
      name: 'Especiales',
      icon: <Sparkles size={20} />,
      achievements: achievements.filter(a => {
        const def = achievementDefinitions.find(d => d.id === a.id);
        return def?.category === 'special';
      })
    },
    {
      id: 'focus',
      name: 'Enfoque',
      icon: <Brain size={20} />,
      achievements: achievements.filter(a => {
        const def = achievementDefinitions.find(d => d.id === a.id);
        return def?.category === 'focus';
      })
    }
  ];

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="achievements-backdrop">
      <div className={`achievements-modal ${animating ? 'modal-animating' : ''}`}>
        {/* Header */}
        <div className="achievements-header">
          <div className="header-content">
            <h2 className="modal-title">
              <Trophy size={28} />
              Panel de Logros
            </h2>
            <div className="header-stats">
              <div className="stat-item">
                <Award size={16} />
                {achievements.filter(a => a.unlocked).length} Logros
              </div>
              <div className="stat-item">
                <Zap size={16} />
                {userLevel.currentXP || 0} XP
              </div>
              <div className="stat-item">
                <Star size={16} />
                Nivel {userLevel.level || 1}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        {/* Tabs de navegación */}
        <div className="achievements-tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          >
            <BarChart3 className="tab-icon" size={18} />
            <span className="tab-label">Resumen</span>
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
          >
            <Trophy className="tab-icon" size={18} />
            <span className="tab-label">Logros</span>
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
          >
            <TrendingUp className="tab-icon" size={18} />
            <span className="tab-label">Progreso</span>
          </button>
        </div>

        {/* Contenido de tabs */}
        <div className="achievements-content">
          {/* Tab: Resumen */}
          {activeTab === 'overview' && (
            <div className="tab-panel">
              {/* Información del nivel actual */}
              <div className="level-overview">
                <div className="level-display">
                  <div className="level-icon">
                    {getLevelIcon(userLevel.level || 1)}
                  </div>
                  <div className="level-info">
                    <h3 className="level-title">
                      Nivel {userLevel.level || 1}
                    </h3>
                    <p className="level-subtitle">
                      {userLevel.title || 'Novato Organizador'}
                    </p>
                    <div className="level-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${getNextLevelProgress()}%` }}
                        />
                      </div>
                      <span className="progress-text">
                        {userLevel.currentXP || 0} / {userLevel.nextLevelXP || 100} XP
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logros recientes */}
              <div className="recent-achievements">
                <h4>
                  <CheckCircle size={20} />
                  Logros Recientes
                </h4>
                {recentAchievements.length > 0 ? (
                  <div className="achievements-list">
                    {recentAchievements.map(achievement => (
                      <div key={achievement.id} className="achievement-item recent">
                        <div className="achievement-icon">
                          {getAchievementIcon(achievement.id)}
                        </div>
                        <div className="achievement-content">
                          <h5 className="achievement-title">{achievement.title}</h5>
                          <p className="achievement-description">{achievement.description}</p>
                          <div className="achievement-meta">
                            <span className="achievement-points">+{achievement.points} XP</span>
                            <span className="achievement-date">{formatDate(achievement.unlockedAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <Trophy size={48} className="empty-icon" />
                    <p>¡Empieza a completar tareas para desbloquear logros!</p>
                  </div>
                )}
              </div>

              {/* Próximos objetivos */}
              <div className="next-achievements">
                <h4>
                  <Target size={20} />
                  Próximos Objetivos
                </h4>
                <div className="next-goals">
                  {achievementDefinitions
                    .filter(def => !achievements.find(a => a.id === def.id))
                    .slice(0, 3)
                    .map(goal => {
                      const IconComponent = goal.icon;
                      return (
                        <div key={goal.id} className="goal-card">
                          <div className="goal-header">
                            <div className="goal-icon">
                              <IconComponent size={20} style={{ color: goal.iconColor }} />
                            </div>
                            <h5 className="goal-title">{goal.title}</h5>
                          </div>
                          <p className="goal-description">{goal.description}</p>
                          <div className="goal-reward">
                            <Zap size={14} />
                            {goal.points} XP
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Logros */}
          {activeTab === 'achievements' && (
            <div className="tab-panel">
              <div className="achievements-overview">
                <div className="achievements-stats">
                  <div className="stat-card">
                    <Trophy size={24} />
                    <div className="stat-info">
                      <span className="stat-number">{achievements.filter(a => a.unlocked).length}</span>
                      <span className="stat-label">Desbloqueados</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <Target size={24} />
                    <div className="stat-info">
                      <span className="stat-number">{achievementDefinitions.length}</span>
                      <span className="stat-label">Total</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <Zap size={24} />
                    <div className="stat-info">
                      <span className="stat-number">
                        {achievements.reduce((total, a) => total + (a.points || 0), 0)}
                      </span>
                      <span className="stat-label">XP Total</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logros por categoría */}
              {achievementCategories.map(category => (
                <div key={category.id} className="achievement-category">
                  <h4 className="category-title">
                    {category.icon}
                    {category.name}
                    <span className="category-count">
                      ({category.achievements.length}/{achievementDefinitions.filter(def => def.category === category.id).length})
                    </span>
                  </h4>
                  <div className="achievements-grid">
                    {achievementDefinitions
                      .filter(def => def.category === category.id)
                      .map(achievement => {
                        const unlocked = achievements.find(a => a.id === achievement.id);
                        const IconComponent = achievement.icon;
                        
                        return (
                          <div
                            key={achievement.id}
                            className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`}
                          >
                            <div className="achievement-icon">
                              <IconComponent 
                                size={24} 
                                style={{ 
                                  color: unlocked ? achievement.iconColor : '#9ca3af',
                                  opacity: unlocked ? 1 : 0.5
                                }} 
                              />
                            </div>
                            <div className="achievement-content">
                              <h5 className="achievement-title">{achievement.title}</h5>
                              <p className="achievement-description">{achievement.description}</p>
                              <div className="achievement-meta">
                                <span className="achievement-points">+{achievement.points} XP</span>
                                {unlocked && unlocked.unlockedAt && (
                                  <span className="achievement-date">{formatDate(unlocked.unlockedAt)}</span>
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

          {/* Tab: Progreso */}
          {activeTab === 'progress' && (
            <div className="tab-panel">
              <div className="progress-overview">
                <h3>
                  <TrendingUp size={24} />
                  Tu Progreso
                </h3>
                
                <div className="stats-sections">
                  <div className="stats-section">
                    <h4 className="section-title">
                      <BarChart3 size={20} />
                      Estadísticas Generales
                    </h4>
                    <div className="stats-list">
                      <div className="stat-row">
                        <span className="stat-label">Total de tareas:</span>
                        <span className="stat-value">{stats.totalTasks || 0}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Completadas:</span>
                        <span className="stat-value">{stats.totalCompleted || 0}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Tasa de éxito:</span>
                        <span className="stat-value">
                          {stats.totalTasks ? Math.round((stats.totalCompleted / stats.totalTasks) * 100) : 0}%
                        </span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Experiencia total:</span>
                        <span className="stat-value">{userLevel.experience || 0} XP</span>
                      </div>
                    </div>
                  </div>

                  <div className="stats-section">
                    <h4 className="section-title">
                      <Flame size={20} />
                      Rachas y Consistencia
                    </h4>
                    <div className="stats-list">
                      <div className="stat-row">
                        <span className="stat-label">Racha actual:</span>
                        <span className="stat-value">{stats.currentStreak || 0} días</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Racha más larga:</span>
                        <span className="stat-value">{stats.longestStreak || 0} días</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Días activos:</span>
                        <span className="stat-value">{stats.activeDays || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="stats-section">
                    <h4 className="section-title">
                      <Award size={20} />
                      Logros y Puntos
                    </h4>
                    <div className="stats-list">
                      <div className="stat-row">
                        <span className="stat-label">Logros desbloqueados:</span>
                        <span className="stat-value">
                          {achievements.filter(a => a.unlocked).length}/{achievementDefinitions.length}
                        </span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Puntos de logros:</span>
                        <span className="stat-value">
                          {achievements.reduce((total, a) => total + (a.points || 0), 0)} XP
                        </span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Progreso general:</span>
                        <span className="stat-value">
                          {Math.round((achievements.filter(a => a.unlocked).length / achievementDefinitions.length) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementsDisplay;