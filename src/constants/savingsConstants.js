// Constantes para el módulo de Metas de Ahorro

// Estados de una meta
export const GOAL_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
  PAUSED: 'paused'
};

// Categorías predefinidas para metas (opcional)
export const GOAL_CATEGORIES = {
  VACATION: { name: 'Vacaciones', icon: '✈️', color: 'blue' },
  HOUSE: { name: 'Casa/Inmueble', icon: '🏠', color: 'green' },
  CAR: { name: 'Vehículo', icon: '🚗', color: 'red' },
  EDUCATION: { name: 'Educación', icon: '📚', color: 'purple' },
  EMERGENCY: { name: 'Emergencias', icon: '🚨', color: 'orange' },
  INVESTMENT: { name: 'Inversión', icon: '📈', color: 'indigo' },
  GADGETS: { name: 'Tecnología', icon: '💻', color: 'gray' },
  HEALTH: { name: 'Salud', icon: '⚕️', color: 'pink' },
  ENTERTAINMENT: { name: 'Entretenimiento', icon: '🎮', color: 'yellow' },
  OTHER: { name: 'Otros', icon: '🎯', color: 'slate' }
};

// Configuración por defecto
export const DEFAULT_CONFIG = {
  CURRENCY: '€',
  DATE_FORMAT: 'dd/MM/yyyy',
  MAX_GOAL_NAME_LENGTH: 50,
  MIN_TARGET_AMOUNT: 1,
  MAX_TARGET_AMOUNT: 999999.99,
  DEFAULT_SAVED_AMOUNT: 0
};

// Mensajes de validación
export const VALIDATION_MESSAGES = {
  REQUIRED_NAME: 'El nombre de la meta es obligatorio',
  REQUIRED_AMOUNT: 'La cantidad objetivo es obligatoria',
  REQUIRED_DATE: 'La fecha objetivo es obligatoria',
  INVALID_AMOUNT: 'La cantidad debe ser mayor a 0',
  INVALID_DATE: 'La fecha debe ser futura',
  SAVED_EXCEEDS_TARGET: 'El ahorro inicial no puede ser mayor a la meta',
  NAME_TOO_LONG: `El nombre no puede exceder ${DEFAULT_CONFIG.MAX_GOAL_NAME_LENGTH} caracteres`
};

// Utilidades
export const formatCurrency = (amount) => {
  return `${DEFAULT_CONFIG.CURRENCY}${amount.toFixed(2)}`;
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES');
};

export const calculateDaysRemaining = (targetDate) => {
  const now = new Date();
  const target = new Date(targetDate);
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getGoalStatus = (goal) => {
  if (goal.savedAmount >= goal.targetAmount) {
    return GOAL_STATUS.COMPLETED;
  }
  
  const daysRemaining = calculateDaysRemaining(goal.targetDate);
  if (daysRemaining < 0) {
    return GOAL_STATUS.OVERDUE;
  }
  
  return GOAL_STATUS.ACTIVE;
};

export const calculateProgress = (savedAmount, targetAmount) => {
  return targetAmount > 0 ? (savedAmount / targetAmount) * 100 : 0;
};

// Validadores
export const validateGoalData = (goalData) => {
  const errors = [];
  
  if (!goalData.name || goalData.name.trim().length === 0) {
    errors.push(VALIDATION_MESSAGES.REQUIRED_NAME);
  }
  
  if (goalData.name && goalData.name.length > DEFAULT_CONFIG.MAX_GOAL_NAME_LENGTH) {
    errors.push(VALIDATION_MESSAGES.NAME_TOO_LONG);
  }
  
  if (!goalData.targetAmount || goalData.targetAmount <= 0) {
    errors.push(VALIDATION_MESSAGES.INVALID_AMOUNT);
  }
  
  if (!goalData.targetDate) {
    errors.push(VALIDATION_MESSAGES.REQUIRED_DATE);
  }
  
  if (goalData.targetDate && new Date(goalData.targetDate) <= new Date()) {
    errors.push(VALIDATION_MESSAGES.INVALID_DATE);
  }
  
  if (goalData.savedAmount > goalData.targetAmount) {
    errors.push(VALIDATION_MESSAGES.SAVED_EXCEEDS_TARGET);
  }
  
  return errors;
};

// Funciones de estadísticas
export const calculateStatistics = (goals) => {
  const totalSaved = goals.reduce((sum, goal) => sum + goal.savedAmount, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const completedGoals = goals.filter(goal => getGoalStatus(goal) === GOAL_STATUS.COMPLETED);
  const activeGoals = goals.filter(goal => getGoalStatus(goal) === GOAL_STATUS.ACTIVE);
  const overdueGoals = goals.filter(goal => getGoalStatus(goal) === GOAL_STATUS.OVERDUE);
  
  return {
    totalSaved,
    totalTarget,
    overallProgress: totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0,
    completedCount: completedGoals.length,
    activeCount: activeGoals.length,
    overdueCount: overdueGoals.length,
    totalCount: goals.length,
    completionRate: goals.length > 0 ? (completedGoals.length / goals.length) * 100 : 0
  };
};