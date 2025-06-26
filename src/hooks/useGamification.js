// hooks/useGamification.js - Sistema de gamificación con iconos profesionales
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import {
  Target,        // first-task
  Sunrise,       // early-bird
  Moon,          // night-owl
  Flame,         // streak-3, streak-7, streak-30
  Calendar,      // streak-7
  CalendarDays,  // streak-30
  Trophy,        // daily-goal
  Zap,           // power-user
  Medal,         // century
  Award,         // half-thousand
  Palette,       // organization-master
  Rocket,        // speed-demon
  FolderOpen,    // categorizer
  Shield,        // weekend-warrior
  Clock,         // time-based achievements
  Star,          // milestones
  Crown,         // high-level achievements
  Diamond,       // special achievements
  CheckCircle,   // completion-based
  TrendingUp,    // progress-based
  Users,         // social achievements
  Brain,         // focus achievements
  Coffee,        // productivity boosts
  Sparkles       // special effects
} from 'lucide-react';

export const useGamification = (todos = []) => {
  // Estados persistentes
  const [achievements, setAchievements] = useLocalStorage('achievements', []);
  const [userLevel, setUserLevel] = useLocalStorage('user-level', {
    level: 1,
    experience: 0,
    title: 'Novato Organizador'
  });
  const [streaks, setStreaks] = useLocalStorage('streaks', {
    current: 0,
    longest: 0,
    lastCompleted: null
  });
  const [gamificationStats, setGamificationStats] = useLocalStorage('gamification-stats', {
    totalTasksCompleted: 0,
    totalPointsEarned: 0,
    firstTaskDate: null,
    bestProductiveDay: 0,
    categoriesUsed: new Set()
  });

  // Estados temporales
  const [recentlyUnlocked, setRecentlyUnlocked] = useState([]);

  // Configuración del sistema
  const config = {
    pointsPerTask: 10,
    bonusMultipliers: {
      important: 1.5,
      longTask: 1.3,
      streak: 1.2,
      category: 1.1
    },
    levelThresholds: [
      { level: 1, threshold: 0, title: 'Novato Organizador' },
      { level: 2, threshold: 100, title: 'Aprendiz Productivo' },
      { level: 3, threshold: 300, title: 'Organizador Competente' },
      { level: 4, threshold: 600, title: 'Maestro de Tareas' },
      { level: 5, threshold: 1000, title: 'Ninja de la Productividad' },
      { level: 6, threshold: 1500, title: 'Gurú de la Organización' },
      { level: 7, threshold: 2200, title: 'Leyenda de la Eficiencia' },
      { level: 8, threshold: 3000, title: 'Emperador del Tiempo' },
      { level: 9, threshold: 4000, title: 'Maestro Supremo' },
      { level: 10, threshold: 5500, title: 'Dios de la Productividad' }
    ]
  };

  // Definición de logros con iconos profesionales
  const achievementDefinitions = useMemo(() => [
    {
      id: 'first-task',
      title: '¡Primer Paso!',
      description: 'Completa tu primera tarea',
      icon: Target,
      iconColor: '#3b82f6',
      category: 'milestones',
      points: 50,
      condition: (todos, stats) => stats.totalTasksCompleted >= 1
    },
    {
      id: 'early-bird',
      title: 'Madrugador',
      description: 'Completa una tarea antes de las 8 AM',
      icon: Sunrise,
      iconColor: '#f59e0b',
      category: 'special',
      points: 75,
      condition: (todos) => {
        const earlyTasks = todos.filter(t => {
          if (!t.completed) return false;
          const hour = new Date(t.createdAt).getHours();
          return hour < 8;
        });
        return earlyTasks.length > 0;
      }
    },
    {
      id: 'night-owl',
      title: 'Búho Nocturno',
      description: 'Completa una tarea después de las 10 PM',
      icon: Moon,
      iconColor: '#6366f1',
      category: 'special',
      points: 75,
      condition: (todos) => {
        const lateTasks = todos.filter(t => {
          if (!t.completed) return false;
          const hour = new Date(t.createdAt).getHours();
          return hour >= 22;
        });
        return lateTasks.length > 0;
      }
    },
    {
      id: 'streak-3',
      title: 'Constancia',
      description: 'Mantén una racha de 3 días',
      icon: Flame,
      iconColor: '#ef4444',
      category: 'consistency',
      points: 100,
      condition: (todos, stats, streaks) => streaks.current >= 3
    },
    {
      id: 'streak-7',
      title: 'Una Semana Completa',
      description: 'Mantén una racha de 7 días',
      icon: Calendar,
      iconColor: '#22c55e',
      category: 'consistency',
      points: 200,
      condition: (todos, stats, streaks) => streaks.current >= 7
    },
    {
      id: 'streak-30',
      title: 'Mes Productivo',
      description: 'Mantén una racha de 30 días',
      icon: CalendarDays,
      iconColor: '#8b5cf6',
      category: 'consistency',
      points: 500,
      condition: (todos, stats, streaks) => streaks.current >= 30
    },
    {
      id: 'daily-goal',
      title: 'Meta Diaria',
      description: 'Completa 5 tareas en un día',
      icon: Trophy,
      iconColor: '#f59e0b',
      category: 'productivity',
      points: 150,
      condition: (todos) => {
        const today = new Date().toDateString();
        const todayCompleted = todos.filter(t => 
          t.completed && new Date(t.createdAt).toDateString() === today
        ).length;
        return todayCompleted >= 5;
      }
    },
    {
      id: 'power-user',
      title: 'Usuario Avanzado',
      description: 'Completa 10 tareas en un día',
      icon: Zap,
      iconColor: '#eab308',
      category: 'productivity',
      points: 300,
      condition: (todos) => {
        const today = new Date().toDateString();
        const todayCompleted = todos.filter(t => 
          t.completed && new Date(t.createdAt).toDateString() === today
        ).length;
        return todayCompleted >= 10;
      }
    },
    {
      id: 'century',
      title: 'Centurión',
      description: 'Completa 100 tareas en total',
      icon: Medal,
      iconColor: '#dc2626',
      category: 'milestones',
      points: 1000,
      condition: (todos, stats) => stats.totalTasksCompleted >= 100
    },
    {
      id: 'half-thousand',
      title: 'Medio Millar',
      description: 'Completa 500 tareas en total',
      icon: Award,
      iconColor: '#7c3aed',
      category: 'milestones',
      points: 2500,
      condition: (todos, stats) => stats.totalTasksCompleted >= 500
    },
    {
      id: 'organization-master',
      title: 'Maestro de la Organización',
      description: 'Usa emojis en 10 tareas diferentes',
      icon: Palette,
      iconColor: '#ec4899',
      category: 'special',
      points: 200,
      condition: (todos) => {
        const emojiTasks = todos.filter(t => 
          /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu.test(t.text)
        );
        return emojiTasks.length >= 10;
      }
    },
    {
      id: 'speed-demon',
      title: 'Demonio de la Velocidad',
      description: 'Completa 3 tareas en menos de 5 minutos',
      icon: Rocket,
      iconColor: '#f97316',
      category: 'productivity',
      points: 300,
      condition: (todos) => {
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        const recentCompleted = todos.filter(t => {
          if (!t.completed) return false;
          const completedTime = new Date(t.createdAt).getTime();
          return completedTime > fiveMinutesAgo;
        });
        return recentCompleted.length >= 3;
      }
    },
    {
      id: 'categorizer',
      title: 'Organizador Categórico',
      description: 'Crea tareas en 5 categorías diferentes',
      icon: FolderOpen,
      iconColor: '#059669',
      category: 'special',
      points: 250,
      condition: (todos, stats) => {
        const categories = detectAllCategories(todos);
        return categories.size >= 5;
      }
    },
    {
      id: 'weekend-warrior',
      title: 'Guerrero del Fin de Semana',
      description: 'Completa tareas en sábado y domingo',
      icon: Shield,
      iconColor: '#0891b2',
      category: 'consistency',
      points: 150,
      condition: (todos) => {
        const weekendTasks = todos.filter(t => {
          if (!t.completed) return false;
          const day = new Date(t.createdAt).getDay();
          return day === 0 || day === 6; // Domingo o sábado
        });
        return weekendTasks.length > 0;
      }
    },
    // Logros adicionales con iconos profesionales
    {
      id: 'focus-master',
      title: 'Maestro del Enfoque',
      description: 'Usa el modo enfoque 10 veces',
      icon: Brain,
      iconColor: '#8b5cf6',
      category: 'focus',
      points: 200,
      condition: (todos, stats) => stats.focusSessionsCompleted >= 10
    },
    {
      id: 'break-taker',
      title: 'Tomador de Descansos',
      description: 'Completa tareas durante diferentes horas del día',
      icon: Coffee,
      iconColor: '#a3a3a3',
      category: 'productivity',
      points: 150,
      condition: (todos) => {
        const hours = new Set();
        todos.filter(t => t.completed).forEach(t => {
          hours.add(new Date(t.createdAt).getHours());
        });
        return hours.size >= 8;
      }
    },
    {
      id: 'perfectionist',
      title: 'Perfeccionista',
      description: 'Completa todas las tareas sin eliminar ninguna',
      icon: Diamond,
      iconColor: '#06b6d4',
      category: 'special',
      points: 400,
      condition: (todos) => {
        return todos.length >= 20 && todos.every(t => t.completed);
      }
    },
    {
      id: 'legend',
      title: 'Leyenda',
      description: 'Alcanza el nivel 10',
      icon: Crown,
      iconColor: '#fbbf24',
      category: 'milestones',
      points: 5000,
      condition: (todos, stats, streaks, userLevel) => userLevel.level >= 10
    }
  ], []);

  // Calcular puntos de una tarea
  const calculateTaskPoints = useCallback((todo) => {
    let basePoints = config.pointsPerTask;
    let multiplier = 1;

    // Bonificación por tarea importante
    const isImportant = todo.text.length > 50 || 
      ['importante', 'urgente', 'proyecto', 'reunión', 'deadline'].some(keyword => 
        todo.text.toLowerCase().includes(keyword)
      );
    
    if (isImportant) {
      multiplier *= config.bonusMultipliers.important;
    }

    // Bonificación por tarea larga
    if (todo.text.length > 100) {
      multiplier *= config.bonusMultipliers.longTask;
    }

    // Bonificación por uso de emojis (indica esfuerzo)
    const emojiCount = (todo.text.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length;
    if (emojiCount > 0) {
      multiplier *= (1 + emojiCount * 0.1);
    }

    // Bonificación por categoría
    if (detectTaskCategory(todo.text)) {
      multiplier *= config.bonusMultipliers.category;
    }

    // Bonificación por racha
    if (streaks.current > 0) {
      multiplier *= (1 + streaks.current * 0.05); // 5% por día de racha
    }

    return Math.round(basePoints * multiplier);
  }, [streaks.current]);

  // Detectar categoría de tarea
  const detectTaskCategory = useCallback((text) => {
    const lowerText = text.toLowerCase();
    const categories = {
      trabajo: ['trabajo', 'reunión', 'proyecto', 'email', 'llamada', 'presentación'],
      personal: ['casa', 'compras', 'familia', 'personal', 'limpieza'],
      salud: ['médico', 'ejercicio', 'salud', 'dieta', 'vitaminas'],
      estudio: ['estudiar', 'curso', 'libro', 'aprender', 'examen', 'investigación'],
      finanzas: ['pagar', 'banco', 'factura', 'presupuesto', 'dinero', 'inversión']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category;
      }
    }
    return null;
  }, []);

  // Detectar todas las categorías usadas
  const detectAllCategories = useCallback((todos) => {
    const categories = new Set();
    todos.forEach(todo => {
      const category = detectTaskCategory(todo.text);
      if (category) {
        categories.add(category);
      }
    });
    return categories;
  }, [detectTaskCategory]);

  // Calcular nivel basado en experiencia
  const calculateLevel = useCallback((experience) => {
    for (let i = config.levelThresholds.length - 1; i >= 0; i--) {
      const threshold = config.levelThresholds[i];
      if (experience >= threshold.threshold) {
        return {
          level: threshold.level,
          title: threshold.title,
          currentThreshold: threshold.threshold,
          nextThreshold: config.levelThresholds[i + 1]?.threshold || null,
          progress: config.levelThresholds[i + 1] 
            ? ((experience - threshold.threshold) / (config.levelThresholds[i + 1].threshold - threshold.threshold)) * 100
            : 100
        };
      }
    }
    return config.levelThresholds[0];
  }, []);

  // Actualizar racha
  const updateStreak = useCallback((todos) => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    const todayCompleted = todos.some(todo => 
      todo.completed && new Date(todo.createdAt).toDateString() === today
    );

    setStreaks(prev => {
      let newCurrent = prev.current;
      
      if (todayCompleted) {
        if (prev.lastCompleted === yesterday || prev.lastCompleted === null) {
          newCurrent = prev.current + 1;
        } else if (prev.lastCompleted !== today) {
          newCurrent = 1;
        }
      } else if (prev.lastCompleted && prev.lastCompleted !== today && prev.lastCompleted !== yesterday) {
        newCurrent = 0;
      }

      return {
        current: newCurrent,
        longest: Math.max(newCurrent, prev.longest),
        lastCompleted: todayCompleted ? today : prev.lastCompleted
      };
    });
  }, [setStreaks]);

  // Verificar y otorgar logros
  const checkAchievements = useCallback((todos) => {
    const newAchievements = [];

    achievementDefinitions.forEach(achievementDef => {
      // Si ya está desbloqueado, saltar
      if (achievements.find(a => a.id === achievementDef.id)) {
        return;
      }

      // Verificar condición
      try {
        if (achievementDef.condition(todos, gamificationStats, streaks, userLevel)) {
          const newAchievement = {
            ...achievementDef,
            unlockedAt: new Date().toISOString(),
            id: achievementDef.id
          };
          newAchievements.push(newAchievement);
        }
      } catch (error) {
        console.warn(`Error checking achievement ${achievementDef.id}:`, error);
      }
    });

    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      setRecentlyUnlocked(newAchievements);
      
      // Limpiar después de 5 segundos
      setTimeout(() => {
        setRecentlyUnlocked([]);
      }, 5000);

      return newAchievements;
    }

    return [];
  }, [achievements, achievementDefinitions, gamificationStats, streaks, userLevel, setAchievements]);

  // Manejar completado de tarea
  const handleTaskCompletion = useCallback((todo) => {
    const points = calculateTaskPoints(todo);
    
    // Actualizar estadísticas
    setGamificationStats(prev => ({
      ...prev,
      totalTasksCompleted: prev.totalTasksCompleted + 1,
      totalPointsEarned: prev.totalPointsEarned + points,
      firstTaskDate: prev.firstTaskDate || new Date().toISOString(),
      categoriesUsed: new Set([
        ...Array.from(prev.categoriesUsed),
        detectTaskCategory(todo.text)
      ].filter(Boolean))
    }));

    // Actualizar experiencia y nivel
    setUserLevel(prev => {
      const newExperience = prev.experience + points;
      const levelInfo = calculateLevel(newExperience);
      
      return {
        experience: newExperience,
        level: levelInfo.level,
        title: levelInfo.title
      };
    });

    return points;
  }, [calculateTaskPoints, setGamificationStats, setUserLevel, calculateLevel, detectTaskCategory]);

  // Calcular estadísticas totales
  const totalPoints = useMemo(() => {
    return todos.reduce((total, todo) => {
      if (todo.completed) {
        return total + calculateTaskPoints(todo);
      }
      return total;
    }, 0);
  }, [todos, calculateTaskPoints]);

  // Efectos principales
  useEffect(() => {
    updateStreak(todos);
  }, [todos, updateStreak]);

  useEffect(() => {
    checkAchievements(todos);
  }, [todos, checkAchievements]);

  // Obtener próximos logros alcanzables
  const getUpcomingAchievements = useCallback(() => {
    return achievementDefinitions
      .filter(def => !achievements.find(a => a.id === def.id))
      .slice(0, 3)
      .map(def => ({
        ...def,
        progress: getAchievementProgress(def, todos, gamificationStats, streaks)
      }));
  }, [achievements, achievementDefinitions, todos, gamificationStats, streaks]);

  // Calcular progreso de un logro específico
  const getAchievementProgress = useCallback((achievement, todos, stats, streaks) => {
    try {
      switch (achievement.id) {
        case 'daily-goal':
          const today = new Date().toDateString();
          const todayCompleted = todos.filter(t => 
            t.completed && new Date(t.createdAt).toDateString() === today
          ).length;
          return Math.min((todayCompleted / 5) * 100, 100);
        
        case 'century':
          return Math.min((stats.totalTasksCompleted / 100) * 100, 100);
        
        case 'streak-3':
          return Math.min((streaks.current / 3) * 100, 100);
        
        case 'streak-7':
          return Math.min((streaks.current / 7) * 100, 100);
        
        default:
          return 0;
      }
    } catch (error) {
      return 0;
    }
  }, []);

  return {
    // Estados principales
    achievements,
    userLevel,
    streaks,
    gamificationStats,
    recentlyUnlocked,
    
    // Funciones principales
    handleTaskCompletion,
    calculateTaskPoints,
    detectTaskCategory,
    
    // Funciones de logros
    checkAchievements,
    getUpcomingAchievements,
    getAchievementProgress,
    
    // Información de nivel
    levelInfo: calculateLevel(userLevel.experience),
    
    // Estadísticas calculadas
    totalPoints,
    
    // Configuración
    config,
    achievementDefinitions
  };
};

export default useGamification;