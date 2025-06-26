// hooks/useSmartSuggestions.js - Sistema de sugerencias inteligentes sin emojis
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Briefcase,     // trabajo
  Home,          // personal  
  Dumbbell,      // salud
  BookOpen,      // estudio
  DollarSign,    // finanzas
  ShoppingCart,  // compras
  Users,         // social
  Coffee,        // descanso
  Calendar,      // eventos
  Target         // objetivos
} from 'lucide-react';

const useSmartSuggestions = (todos = [], currentInput = '') => {
  const [suggestions, setSuggestions] = useState([]);
  const [userPatterns, setUserPatterns] = useState({});
  const [contextualSuggestions, setContextualSuggestions] = useState([]);

  // Categorías predefinidas con iconos profesionales
  const predefinedCategories = useMemo(() => ({
    trabajo: {
      keywords: [
        'reunión', 'proyecto', 'informe', 'presentación', 'email', 'llamada', 
        'deadline', 'entrega', 'cliente', 'jefe', 'equipo', 'oficina', 'trabajo'
      ],
      icon: Briefcase,
      color: '#3b82f6',
      name: 'Trabajo',
      suggestions: [
        'Revisar emails pendientes',
        'Preparar presentación para reunión',
        'Completar informe semanal',
        'Llamar al cliente sobre proyecto',
        'Planificar próximas tareas del equipo',
        'Actualizar documentación del proyecto',
        'Revisar agenda de la semana',
        'Seguimiento de deadlines importantes'
      ]
    },
    personal: {
      keywords: [
        'casa', 'familia', 'compras', 'limpieza', 'cocinar', 'personal',
        'amigos', 'hogar', 'mascota', 'ropa', 'cumpleaños'
      ],
      icon: Home,
      color: '#22c55e',
      name: 'Personal',
      suggestions: [
        'Hacer compras del supermercado',
        'Limpiar y organizar la casa',
        'Cocinar comida para la semana',
        'Llamar a la familia',
        'Organizar el armario',
        'Planificar actividades del fin de semana',
        'Comprar regalo de cumpleaños',
        'Sacar cita para corte de pelo'
      ]
    },
    salud: {
      keywords: [
        'médico', 'ejercicio', 'dieta', 'vitaminas', 'agua', 'descanso', 
        'cita', 'gym', 'correr', 'caminar', 'salud', 'nutrición'
      ],
      icon: Dumbbell,
      color: '#ef4444',
      name: 'Salud',
      suggestions: [
        'Hacer ejercicio durante 30 minutos',
        'Tomar 8 vasos de agua',
        'Programar cita con el médico',
        'Tomar vitaminas diarias',
        'Meditar por 10 minutos',
        'Salir a caminar',
        'Preparar comida saludable',
        'Dormir 8 horas completas'
      ]
    },
    estudio: {
      keywords: [
        'estudiar', 'curso', 'libro', 'aprender', 'examen', 'investigación',
        'leer', 'universidad', 'colegio', 'tarea', 'práctica'
      ],
      icon: BookOpen,
      color: '#8b5cf6',
      name: 'Estudio',
      suggestions: [
        'Repasar apuntes de la clase',
        'Leer capítulo del libro',
        'Hacer ejercicios de práctica',
        'Investigar sobre el tema',
        'Preparar resumen del material',
        'Estudiar para el examen',
        'Completar tarea pendiente',
        'Organizar material de estudio'
      ]
    },
    finanzas: {
      keywords: [
        'pagar', 'banco', 'factura', 'presupuesto', 'dinero', 'inversión',
        'ahorrar', 'cuenta', 'tarjeta', 'financiero'
      ],
      icon: DollarSign,
      color: '#f59e0b',
      name: 'Finanzas',
      suggestions: [
        'Revisar estado de cuentas',
        'Pagar facturas pendientes',
        'Actualizar presupuesto mensual',
        'Revisar inversiones',
        'Planificar ahorros',
        'Organizar documentos financieros',
        'Consultar con asesor financiero',
        'Establecer metas de ahorro'
      ]
    },
    compras: {
      keywords: [
        'comprar', 'tienda', 'supermercado', 'lista', 'necesario',
        'mercado', 'shopping'
      ],
      icon: ShoppingCart,
      color: '#06b6d4',
      name: 'Compras',
      suggestions: [
        'Hacer lista de compras',
        'Ir al supermercado',
        'Comprar productos de limpieza',
        'Renovar artículos básicos',
        'Comparar precios online',
        'Comprar regalos pendientes'
      ]
    }
  }), []);

  // Detectar categoría de una tarea
  const detectCategory = useCallback((text) => {
    if (!text) return null;
    
    const lowerText = text.toLowerCase();
    
    for (const [categoryName, category] of Object.entries(predefinedCategories)) {
      if (category.keywords.some(keyword => lowerText.includes(keyword))) {
        return categoryName;
      }
    }
    
    return null;
  }, [predefinedCategories]);

  // Generar sugerencias contextuales basadas en hora y día
  const getContextualTemplates = useCallback(() => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = domingo, 6 = sábado
    const isWeekend = day === 0 || day === 6;
    
    const templates = [];

    // Sugerencias por hora del día
    if (hour >= 6 && hour < 9) {
      // Mañana
      templates.push(
        { text: 'Revisar agenda del día', type: 'contextual', priority: 'high', category: 'trabajo' },
        { text: 'Hacer ejercicio matutino', type: 'contextual', priority: 'medium', category: 'salud' },
        { text: 'Preparar desayuno saludable', type: 'contextual', priority: 'medium', category: 'personal' }
      );
    } else if (hour >= 9 && hour < 12) {
      // Media mañana
      templates.push(
        { text: 'Enfocarse en tarea principal', type: 'contextual', priority: 'high', category: 'trabajo' },
        { text: 'Revisar emails importantes', type: 'contextual', priority: 'medium', category: 'trabajo' },
        { text: 'Tomar agua y estirarse', type: 'contextual', priority: 'low', category: 'salud' }
      );
    } else if (hour >= 12 && hour < 14) {
      // Almuerzo
      templates.push(
        { text: 'Tomar un descanso para almorzar', type: 'contextual', priority: 'high', category: 'personal' },
        { text: 'Hacer una llamada pendiente', type: 'contextual', priority: 'medium', category: 'trabajo' }
      );
    } else if (hour >= 14 && hour < 17) {
      // Tarde
      templates.push(
        { text: 'Completar tareas administrativas', type: 'contextual', priority: 'medium', category: 'trabajo' },
        { text: 'Planificar actividades de mañana', type: 'contextual', priority: 'medium', category: 'trabajo' },
        { text: 'Organizar escritorio', type: 'contextual', priority: 'low', category: 'personal' }
      );
    } else if (hour >= 18 && hour < 22) {
      // Noche
      templates.push(
        { text: 'Planificar actividades de mañana', type: 'contextual', priority: 'medium', category: 'personal' },
        { text: 'Tiempo de relajación', type: 'contextual', priority: 'medium', category: 'personal' },
        { text: 'Preparar cosas para mañana', type: 'contextual', priority: 'low', category: 'personal' }
      );
    }

    // Sugerencias específicas por día
    if (isWeekend) {
      templates.push(
        { text: 'Hacer compras de la semana', type: 'contextual', priority: 'medium', category: 'compras' },
        { text: 'Limpiar y organizar la casa', type: 'contextual', priority: 'medium', category: 'personal' },
        { text: 'Pasar tiempo con familia', type: 'contextual', priority: 'high', category: 'personal' }
      );
    } else {
      // Entre semana
      if (day === 1) { // Lunes
        templates.push(
          { text: 'Planificar objetivos de la semana', type: 'contextual', priority: 'high', category: 'trabajo' },
          { text: 'Revisar calendario semanal', type: 'contextual', priority: 'medium', category: 'trabajo' }
        );
      } else if (day === 5) { // Viernes
        templates.push(
          { text: 'Hacer resumen de la semana', type: 'contextual', priority: 'medium', category: 'trabajo' },
          { text: 'Planificar actividades del fin de semana', type: 'contextual', priority: 'low', category: 'personal' }
        );
      }
    }

    return templates;
  }, []);

  // Analizar patrones del usuario
  const analyzeUserPatterns = useCallback(() => {
    if (todos.length === 0) return {};

    const patterns = {
      commonWords: {},
      preferredCategories: {},
      peakHours: {},
      taskLength: { short: 0, medium: 0, long: 0 },
      emojiUsage: 0
    };

    todos.forEach(todo => {
      // Analizar palabras comunes
      const words = todo.text.toLowerCase()
        .split(' ')
        .filter(word => word.length > 3 && !['para', 'con', 'una', 'del', 'las', 'los'].includes(word));
      
      words.forEach(word => {
        patterns.commonWords[word] = (patterns.commonWords[word] || 0) + 1;
      });

      // Analizar categorías preferidas
      const category = detectCategory(todo.text);
      if (category) {
        patterns.preferredCategories[category] = (patterns.preferredCategories[category] || 0) + 1;
      }

      // Analizar horarios preferidos
      const hour = new Date(todo.createdAt).getHours();
      patterns.peakHours[hour] = (patterns.peakHours[hour] || 0) + 1;

      // Analizar longitud de tareas
      if (todo.text.length < 30) patterns.taskLength.short++;
      else if (todo.text.length < 80) patterns.taskLength.medium++;
      else patterns.taskLength.long++;

      // Uso de emojis (mantener para funcionalidad)
      if (/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]/gu.test(todo.text)) {
        patterns.emojiUsage++;
      }
    });

    // Obtener top palabras
    patterns.topWords = Object.keys(patterns.commonWords)
      .sort((a, b) => patterns.commonWords[b] - patterns.commonWords[a])
      .slice(0, 10);

    // Categoría favorita
    patterns.favoriteCategory = Object.keys(patterns.preferredCategories)
      .reduce((a, b) => patterns.preferredCategories[a] > patterns.preferredCategories[b] ? a : b, '');

    // Hora más productiva
    patterns.mostProductiveHour = Object.keys(patterns.peakHours)
      .reduce((a, b) => patterns.peakHours[a] > patterns.peakHours[b] ? a : b, '');

    return patterns;
  }, [todos, detectCategory]);

  // Generar sugerencias personalizadas
  const generatePersonalizedSuggestions = useCallback((input, patterns) => {
    const suggestions = [];
    
    if (!patterns.favoriteCategory) return suggestions;
    
    const favoriteCategory = predefinedCategories[patterns.favoriteCategory];
    if (!favoriteCategory) return suggestions;

    // Sugerencias basadas en categoría favorita
    const categorySuggestions = favoriteCategory.suggestions
      .filter(suggestion => 
        !input || suggestion.toLowerCase().includes(input.toLowerCase())
      )
      .slice(0, 2)
      .map(suggestion => ({
        text: suggestion,
        type: 'personalized',
        category: patterns.favoriteCategory,
        confidence: 0.8,
        icon: favoriteCategory.icon
      }));

    suggestions.push(...categorySuggestions);

    // Sugerencias basadas en palabras comunes
    if (patterns.topWords && patterns.topWords.length > 0) {
      const wordBasedSuggestions = patterns.topWords
        .slice(0, 3)
        .map(word => ({
          text: `Continuar con ${word}`,
          type: 'pattern',
          confidence: 0.6,
          icon: Target
        }));
      
      suggestions.push(...wordBasedSuggestions);
    }

    return suggestions;
  }, [predefinedCategories]);

  // Generar todas las sugerencias
  const generateSuggestions = useCallback((input) => {
    const allSuggestions = [];

    // 1. Sugerencias contextuales
    const contextual = getContextualTemplates()
      .filter(template => 
        !input || template.text.toLowerCase().includes(input.toLowerCase())
      )
      .slice(0, 3)
      .map(template => ({
        ...template,
        confidence: template.priority === 'high' ? 0.9 : 
                   template.priority === 'medium' ? 0.7 : 0.5,
        icon: predefinedCategories[template.category]?.icon || Target
      }));
    
    allSuggestions.push(...contextual);

    // 2. Sugerencias por categoría detectada
    if (input) {
      const detectedCategory = detectCategory(input);
      if (detectedCategory) {
        const category = predefinedCategories[detectedCategory];
        const categorySuggestions = category.suggestions
          .filter(suggestion => 
            suggestion.toLowerCase().includes(input.toLowerCase()) ||
            input.toLowerCase().includes(suggestion.toLowerCase())
          )
          .slice(0, 3)
          .map(suggestion => ({
            text: suggestion,
            type: 'category',
            category: detectedCategory,
            confidence: 0.8,
            icon: category.icon
          }));
        
        allSuggestions.push(...categorySuggestions);
      }
    }

    // 3. Sugerencias de completado automático
    if (input && input.length > 2) {
      const autoComplete = todos
        .filter(todo => 
          todo.text.toLowerCase().includes(input.toLowerCase()) &&
          todo.text.toLowerCase() !== input.toLowerCase()
        )
        .slice(0, 3)
        .map(todo => ({
          text: todo.text,
          type: 'autocomplete',
          confidence: 0.6,
          icon: Target
        }));
      
      allSuggestions.push(...autoComplete);
    }

    // 4. Sugerencias personalizadas basadas en patrones
    const personalizedSuggestions = generatePersonalizedSuggestions(input, userPatterns);
    allSuggestions.push(...personalizedSuggestions);

    // 5. Eliminar duplicados y ordenar por confianza
    const uniqueSuggestions = allSuggestions
      .filter((suggestion, index, arr) => 
        arr.findIndex(s => s.text.toLowerCase() === suggestion.text.toLowerCase()) === index
      )
      .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
      .slice(0, 6);

    return uniqueSuggestions;
  }, [todos, detectCategory, predefinedCategories, userPatterns, generatePersonalizedSuggestions, getContextualTemplates]);

  // Obtener información de categoría
  const getCategoryInfo = useCallback((text) => {
    const category = detectCategory(text);
    return category ? {
      ...predefinedCategories[category],
      name: category
    } : null;
  }, [detectCategory, predefinedCategories]);

  // Obtener insights de productividad
  const getProductivityInsights = useMemo(() => {
    const now = new Date();
    const today = now.toDateString();
    const thisWeek = todos.filter(todo => {
      const todoDate = new Date(todo.createdAt);
      const diffTime = Math.abs(now - todoDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    });

    const insights = {
      todayTasks: todos.filter(todo => 
        new Date(todo.createdAt).toDateString() === today
      ).length,
      weeklyCompletion: thisWeek.length > 0 ? 
        (thisWeek.filter(todo => todo.completed).length / thisWeek.length) * 100 : 0,
      mostActiveCategory: userPatterns.favoriteCategory || 'trabajo',
      suggestedFocus: userPatterns.mostProductiveHour 
        ? `Enfócate en tareas importantes a las ${userPatterns.mostProductiveHour}:00`
        : 'Identifica tu hora más productiva del día',
      weekTrend: thisWeek.length > 7 ? 'up' : thisWeek.length < 3 ? 'down' : 'stable'
    };

    return insights;
  }, [todos, userPatterns]);

  // Efectos
  useEffect(() => {
    const newSuggestions = generateSuggestions(currentInput);
    setSuggestions(newSuggestions);
  }, [currentInput, generateSuggestions]);

  useEffect(() => {
    const patterns = analyzeUserPatterns();
    setUserPatterns(patterns);
  }, [analyzeUserPatterns]);

  useEffect(() => {
    setContextualSuggestions(getContextualTemplates());
  }, [getContextualTemplates]);

  return {
    suggestions,
    contextualSuggestions,
    userPatterns,
    predefinedCategories,
    detectCategory,
    getCategoryInfo,
    getProductivityInsights,
    generateSuggestions,
    analyzeUserPatterns
  };
};

export default useSmartSuggestions;