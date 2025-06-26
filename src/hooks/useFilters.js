// hooks/useFilters.js - Hook para gestión de filtros mejorado
import { useState, useMemo, useCallback } from 'react';

export const useFilters = (todos = []) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Calcular estadísticas de cada filtro
  const filterStats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const stats = {
      all: todos.length,
      pending: todos.filter(todo => !todo.completed).length,
      completed: todos.filter(todo => todo.completed).length,
      today: todos.filter(todo => {
        const todoDate = new Date(todo.createdAt);
        const todoDay = new Date(todoDate.getFullYear(), todoDate.getMonth(), todoDate.getDate());
        return todoDay.getTime() === today.getTime();
      }).length,
      important: todos.filter(todo => 
        todo.priority === 'high' || 
        todo.text.includes('!') ||
        todo.text.toLowerCase().includes('urgente') ||
        todo.text.toLowerCase().includes('importante')
      ).length
    };
    
    return stats;
  }, [todos]);

  // Opciones de filtros con contadores
  const filterOptions = useMemo(() => [
    {
      key: 'all',
      label: 'Todas',
      count: filterStats.all
    },
    {
      key: 'pending', 
      label: 'Pendientes',
      count: filterStats.pending
    },
    {
      key: 'completed',
      label: 'Completadas', 
      count: filterStats.completed
    },
    {
      key: 'today',
      label: 'Hoy',
      count: filterStats.today
    },
    {
      key: 'important',
      label: 'Importantes',
      count: filterStats.important
    }
  ], [filterStats]);

  // Función para filtrar todos
  const filterTodos = useCallback((todos, filter, search = '') => {
    let filtered = [...todos];
    
    // Aplicar filtro principal
    switch (filter) {
      case 'pending':
        filtered = filtered.filter(todo => !todo.completed);
        break;
      case 'completed':
        filtered = filtered.filter(todo => todo.completed);
        break;
      case 'today':
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        filtered = filtered.filter(todo => {
          const todoDate = new Date(todo.createdAt);
          const todoDay = new Date(todoDate.getFullYear(), todoDate.getMonth(), todoDate.getDate());
          return todoDay.getTime() === todayStart.getTime();
        });
        break;
      case 'important':
        filtered = filtered.filter(todo => 
          todo.priority === 'high' || 
          todo.text.includes('!') ||
          todo.text.toLowerCase().includes('urgente') ||
          todo.text.toLowerCase().includes('importante')
        );
        break;
      case 'all':
      default:
        // No filtrar, mostrar todos
        break;
    }
    
    // Aplicar búsqueda si existe
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(todo =>
        todo.text.toLowerCase().includes(searchLower)
      );
    }
    
    // Ordenar: pendientes primero, luego por fecha de creación (más recientes primero)
    return filtered.sort((a, b) => {
      // Primero ordenar por estado de completado
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      // Luego por prioridad (importantes primero)
      const aImportant = a.priority === 'high' || a.text.includes('!');
      const bImportant = b.priority === 'high' || b.text.includes('!');
      
      if (aImportant !== bImportant) {
        return bImportant ? 1 : -1;
      }
      
      // Finalmente por fecha de creación (más recientes primero)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, []);

  // Todos filtrados
  const filteredTodos = useMemo(() => {
    return filterTodos(todos, activeFilter, searchTerm);
  }, [todos, activeFilter, searchTerm, filterTodos]);

  // Función para cambiar filtro con validación
  const changeFilter = useCallback((newFilter) => {
    const validFilters = filterOptions.map(opt => opt.key);
    if (validFilters.includes(newFilter)) {
      setActiveFilter(newFilter);
    }
  }, [filterOptions]);

  // Función para búsqueda
  const updateSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  // Función para limpiar filtros
  const clearFilters = useCallback(() => {
    setActiveFilter('all');
    setSearchTerm('');
  }, []);

  // Función para obtener filtro siguiente/anterior
  const getAdjacentFilter = useCallback((direction) => {
    const currentIndex = filterOptions.findIndex(opt => opt.key === activeFilter);
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % filterOptions.length
      : (currentIndex - 1 + filterOptions.length) % filterOptions.length;
    
    return filterOptions[newIndex].key;
  }, [activeFilter, filterOptions]);

  // Estadísticas del filtro actual
  const currentFilterStats = useMemo(() => {
    const current = filterOptions.find(opt => opt.key === activeFilter);
    return {
      total: current?.count || 0,
      label: current?.label || 'Todas',
      isEmpty: (current?.count || 0) === 0,
      hasResults: filteredTodos.length > 0
    };
  }, [activeFilter, filterOptions, filteredTodos.length]);

  return {
    // Estados
    activeFilter,
    searchTerm,
    filteredTodos,
    filterOptions,
    filterStats,
    currentFilterStats,
    
    // Funciones
    setActiveFilter: changeFilter,
    setSearchTerm: updateSearch,
    clearFilters,
    getAdjacentFilter,
    filterTodos,
    
    // Utilidades
    isFiltered: activeFilter !== 'all' || searchTerm.trim() !== '',
    hasActiveSearch: searchTerm.trim() !== '',
    canGoNext: filterOptions.length > 1,
    canGoPrevious: filterOptions.length > 1
  };
};