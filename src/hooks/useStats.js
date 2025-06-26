// hooks/useStats.js - Hook para gestión de estadísticas CORREGIDO
import { useMemo } from 'react';

export const useStats = (todos) => {
  const stats = useMemo(() => {
    const totalTodos = todos.length;
    const activeTodos = todos.filter(todo => !todo.completed).length;
    const completedTodos = todos.filter(todo => todo.completed).length;
    
    // CORRECCIÓN: Validar división por cero antes de calcular porcentaje
    const progressPercentage = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
    
    // Cálculos adicionales para gamificación
    const completionStreak = calculateStreak(todos);
    const productivityScore = calculateProductivityScore(todos);
    const dailyGoal = 5; // Meta diaria de tareas
    const dailyProgress = Math.min((completedTodos / dailyGoal) * 100, 100);
    
    return {
      // Nombres consistentes para compatibilidad
      totalTodos,
      totalTasks: totalTodos, // Alias para compatibilidad
      activeTodos,
      pendingTodos: activeTodos, // Alias para compatibilidad
      completedTodos,
      totalCompleted: completedTodos, // Alias para compatibilidad
      
      // Porcentajes seguros
      progressPercentage: isNaN(progressPercentage) ? 0 : progressPercentage,
      completionPercentage: isNaN(progressPercentage) ? 0 : progressPercentage, // Alias
      
      // Otros datos
      completionStreak,
      productivityScore,
      dailyProgress: isNaN(dailyProgress) ? 0 : Math.round(dailyProgress),
      dailyGoal,
      
      // Estados booleanos
      isAllCompleted: totalTodos > 0 && activeTodos === 0,
      isEmpty: totalTodos === 0,
      hasProgress: completedTodos > 0
    };
  }, [todos]);

  return stats;
};

// Función auxiliar para calcular racha de completado
const calculateStreak = (todos) => {
  const today = new Date().toDateString();
  const todayTodos = todos.filter(todo => 
    new Date(todo.createdAt).toDateString() === today
  );
  
  return todayTodos.filter(todo => todo.completed).length;
};

// Función auxiliar para calcular puntuación de productividad
const calculateProductivityScore = (todos) => {
  const completedToday = todos.filter(todo => {
    const today = new Date().toDateString();
    const todoDate = new Date(todo.createdAt).toDateString();
    return todo.completed && todoDate === today;
  }).length;
  
  // Sistema de puntos: 10 puntos por tarea completada
  return completedToday * 10;
};

// Función auxiliar para obtener porcentaje seguro
export const safePercentage = (numerator, denominator) => {
  if (!denominator || denominator === 0 || !numerator) return 0;
  const result = Math.round((numerator / denominator) * 100);
  return isNaN(result) ? 0 : Math.min(result, 100);
};