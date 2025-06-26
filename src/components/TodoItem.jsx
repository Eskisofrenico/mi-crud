// components/TodoItem.jsx - Todo items con iconos profesionales de Lucide
import React, { useState, useRef, useEffect } from 'react';
import { 
  Check, 
  Edit2, 
  Trash2, 
  Target, 
  Save, 
  X,
  AlertCircle,
  Clock,
  Briefcase,
  Home,
  Dumbbell,
  BookOpen,
  ShoppingCart,
  Users,
  Calendar,
  Zap
} from 'lucide-react';

const TodoItem = ({ 
  todo, 
  onToggle, 
  onDelete, 
  onEdit,
  onFocus, 
  onHover, 
  animatingItems,
  style 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [showActions, setShowActions] = useState(false);
  const editInputRef = useRef(null);

  const isAnimating = animatingItems?.has(todo.id);
  const isNew = Date.now() - new Date(todo.createdAt).getTime() < 300000; // 5 minutos

  // Auto-focus en modo edición
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  // Guardar cambios
  const handleSave = () => {
    const trimmedText = editText.trim();
    if (trimmedText && trimmedText !== todo.text) {
      onEdit(todo.id, trimmedText);
    } else if (!trimmedText) {
      setEditText(todo.text); // Revertir si está vacío
    }
    setIsEditing(false);
  };

  // Cancelar edición
  const handleCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  // Manejar teclas en edición
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  // Detectar si es una tarea importante
  const isImportant = todo.text.length > 50 || 
                     ['proyecto', 'importante', 'urgente', 'reunión', 'deadline'].some(word => 
                       todo.text.toLowerCase().includes(word));

  // Detectar categoría por palabras clave con iconos de Lucide
  const getCategory = () => {
    const text = todo.text.toLowerCase();
    
    if (['trabajo', 'reunión', 'proyecto', 'email', 'llamada'].some(w => text.includes(w))) {
      return { 
        icon: <Briefcase size={16} />, 
        color: 'var(--primary-500)', 
        name: 'Trabajo' 
      };
    }
    if (['casa', 'hogar', 'limpieza', 'cocina'].some(w => text.includes(w))) {
      return { 
        icon: <Home size={16} />, 
        color: 'var(--success-500)', 
        name: 'Hogar' 
      };
    }
    if (['ejercicio', 'gym', 'correr', 'deporte', 'salud'].some(w => text.includes(w))) {
      return { 
        icon: <Dumbbell size={16} />, 
        color: 'var(--warning-500)', 
        name: 'Salud' 
      };
    }
    if (['estudiar', 'curso', 'libro', 'aprender'].some(w => text.includes(w))) {
      return { 
        icon: <BookOpen size={16} />, 
        color: 'var(--info-500)', 
        name: 'Estudio' 
      };
    }
    if (['comprar', 'tienda', 'mercado'].some(w => text.includes(w))) {
      return { 
        icon: <ShoppingCart size={16} />, 
        color: 'var(--purple-500)', 
        name: 'Compras' 
      };
    }
    if (['reunión', 'cita', 'encuentro'].some(w => text.includes(w))) {
      return { 
        icon: <Users size={16} />, 
        color: 'var(--blue-500)', 
        name: 'Reuniones' 
      };
    }
    
    return null;
  };

  // Detectar prioridad
  const getPriority = () => {
    if (todo.priority === 'high' || todo.text.includes('!') || 
        todo.text.toLowerCase().includes('urgente') ||
        todo.text.toLowerCase().includes('importante')) {
      return 'high';
    }
    return 'normal';
  };

  // Calcular tiempo transcurrido
  const getTimeAgo = () => {
    const now = new Date();
    const created = new Date(todo.createdAt);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffMins > 0) return `hace ${diffMins} min`;
    return 'recién creada';
  };

  const category = getCategory();
  const priority = getPriority();
  const timeAgo = getTimeAgo();

  return (
    <div 
      className={`todo-item ${todo.completed ? 'completed' : ''} ${isAnimating ? 'animate' : ''}`}
      style={style}
      onMouseEnter={() => {
        setShowActions(true);
        onHover?.(todo.id, true);
      }}
      onMouseLeave={() => {
        setShowActions(false);
        onHover?.(todo.id, false);
      }}
    >
      {/* Indicador de categoría en el borde */}
      {category && (
        <div 
          className="category-indicator"
          style={{ backgroundColor: category.color }}
        />
      )}

      <div className="todo-content">
        {/* Checkbox */}
        <div className="checkbox-container">
          <input
            type="checkbox"
            className="todo-checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            aria-label={`Marcar como ${todo.completed ? 'pendiente' : 'completada'}`}
          />
          <div className="checkbox-custom">
            {todo.completed && <Check className="checkmark" size={14} />}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="todo-main">
          <div className="todo-text-area">
            <div className="todo-text">
              {isEditing ? (
                <input
                  ref={editInputRef}
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onBlur={handleSave}
                  className="todo-edit-input"
                  maxLength={200}
                />
              ) : (
                <span className="text-content">
                  {todo.text}
                </span>
              )}
            </div>

            {/* Badges y metadatos */}
            <div className="todo-badges">
              {/* Badge de categoría */}
              {category && !isEditing && (
                <span 
                  className="badge badge-primary"
                  style={{ 
                    backgroundColor: category.color + '20', 
                    color: category.color 
                  }}
                >
                  {category.icon}
                  {category.name}
                </span>
              )}

              {/* Badge de prioridad alta */}
              {priority === 'high' && !isEditing && (
                <span className="badge badge-warning">
                  <AlertCircle size={12} />
                  Importante
                </span>
              )}

              {/* Badge de recién creada */}
              {isNew && !isEditing && (
                <span className="badge badge-success">
                  <Zap size={12} />
                  Nuevo
                </span>
              )}
            </div>

            {/* Metadatos de tiempo */}
            <div className="todo-meta">
              <span className="time-ago">
                <Clock size={12} />
                {timeAgo}
              </span>
              {todo.completed && todo.completedAt && (
                <span className="completion-time">
                  <Check size={12} />
                  Completada {new Date(todo.completedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className={`todo-actions ${showActions || isEditing ? 'visible' : ''}`}>
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="action-btn save-btn"
                  title="Guardar cambios"
                >
                  <Save size={16} />
                </button>
                <button
                  onClick={handleCancel}
                  className="action-btn cancel-btn"
                  title="Cancelar edición"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="action-btn edit-btn"
                  title="Editar tarea"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onFocus?.(todo)}
                  className="action-btn focus-btn"
                  title="Enfocar en esta tarea"
                >
                  <Target size={16} />
                </button>
                <button
                  onClick={() => onToggle(todo.id)}
                  className={`action-btn ${todo.completed ? 'uncomplete-btn' : 'complete-btn'}`}
                  title={todo.completed ? 'Marcar como pendiente' : 'Completar tarea'}
                >
                  {todo.completed ? <X size={16} /> : <Check size={16} />}
                </button>
                <button
                  onClick={() => onDelete(todo.id)}
                  className="action-btn delete-btn"
                  title="Eliminar tarea"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Indicador de completado */}
      {todo.completed && (
        <div className="completion-indicator" />
      )}
    </div>
  );
};

export default TodoItem;