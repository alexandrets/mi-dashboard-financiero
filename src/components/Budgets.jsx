import React, { useState, useEffect } from 'react';
import { useBudgets } from '../hooks/useBudgets';

const Budgets = ({ transactions = [] }) => {
  const { 
    budgets, 
    loading, 
    error, 
    addBudget, 
    updateBudget, 
    deleteBudget 
  } = useBudgets();
  
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'monthly'
  });

  // Función para calcular gastos por categoría desde las transacciones
  const calculateSpentByCategory = () => {
    const spentByCategory = {};
    
    // Verificar que transactions es un array válido
    if (!Array.isArray(transactions)) {
      console.log('⚠️ Transactions no es un array válido:', transactions);
      return spentByCategory;
    }
    
    // Solo procesar gastos (type: 'gasto')
    const expenses = transactions.filter(t => t && t.type === 'gasto');
    
    expenses.forEach(expense => {
      if (expense && expense.category) {
        const category = expense.category.toLowerCase();
        const amount = Number(expense.amount) || 0;
        
        if (!spentByCategory[category]) {
          spentByCategory[category] = 0;
        }
        spentByCategory[category] += amount;
      }
    });
    
    console.log('💰 Gastos calculados por categoría:', spentByCategory);
    console.log('📝 Total transacciones recibidas:', transactions.length);
    
    return spentByCategory;
  };

  // Calcular gastos en tiempo real
  const spentByCategory = calculateSpentByCategory();

  const handleSubmit = async () => {
    if (!formData.category || !formData.limit) {
      alert('Por favor completa todos los campos');
      return;
    }

    const limit = parseFloat(formData.limit);
    if (limit <= 0) {
      alert('El límite debe ser mayor a 0');
      return;
    }

    setIsSubmitting(true);

    try {
      await addBudget({
        category: formData.category.toLowerCase(),
        limit: limit,
        period: formData.period
      });

      setFormData({
        category: '',
        limit: '',
        period: 'monthly'
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating budget:', error);
      alert('Error al crear el presupuesto: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateBudget = async (id, updates) => {
    try {
      await updateBudget(id, updates);
    } catch (error) {
      console.error('Error updating budget:', error);
      alert('Error al actualizar el presupuesto: ' + error.message);
    }
  };

  const handleDeleteBudget = async (id) => {
    try {
      await deleteBudget(id);
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Error al eliminar el presupuesto: ' + error.message);
    }
  };

  // Categorías disponibles
  const availableCategories = [
    { value: 'alimentacion', label: '🍕 Alimentación', emoji: '🍕' },
    { value: 'transporte', label: '🚗 Transporte', emoji: '🚗' },
    { value: 'entretenimiento', label: '🎬 Entretenimiento', emoji: '🎬' },
    { value: 'servicios', label: '⚡ Servicios', emoji: '⚡' },
    { value: 'salud', label: '🏥 Salud', emoji: '🏥' },
    { value: 'educacion', label: '📚 Educación', emoji: '📚' },
    { value: 'ropa', label: '👕 Ropa', emoji: '👕' },
    { value: 'hogar', label: '🏠 Hogar', emoji: '🏠' },
    { value: 'otros', label: '📦 Otros', emoji: '📦' }
  ];

  const getCategoryInfo = (category) => {
    const categoryInfo = availableCategories.find(cat => cat.value === category);
    return categoryInfo || { value: category, label: `📦 ${category}`, emoji: '📦' };
  };

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mx-auto mb-4 animate-pulse"></div>
        <p className="text-gray-600">Cargando presupuestos...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-3">
          <span className="text-2xl">⚠️</span>
          <h3 className="font-bold text-red-800">Error al cargar presupuestos</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Recargar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">💰</span>
          <h2 className="text-xl font-bold text-gray-800">Presupuestos</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <span>➕</span>
          Nuevo Presupuesto
        </button>
      </div>

      {/* Formulario para crear presupuesto */}
      {showForm && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Crear Nuevo Presupuesto</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={isSubmitting}
              >
                <option value="">Selecciona categoría</option>
                {availableCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Límite (€) *
              </label>
              <input
                type="number"
                placeholder="500.00"
                value={formData.limit}
                onChange={(e) => handleInputChange('limit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                min="0"
                step="0.01"
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período
              </label>
              <select
                value={formData.period}
                onChange={(e) => handleInputChange('period', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={isSubmitting}
              >
                <option value="monthly">📅 Mensual</option>
                <option value="weekly">📅 Semanal</option>
                <option value="yearly">📅 Anual</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-2 justify-end pt-4">
            <button
              onClick={() => setShowForm(false)}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isSubmitting ? 'Creando...' : 'Crear Presupuesto'}
            </button>
          </div>
        </div>
      )}

      {/* Lista de presupuestos */}
      {budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map(budget => {
            // Validaciones de seguridad
            if (!budget || !budget.id) return null;
            
            const categoryInfo = getCategoryInfo(budget.category || 'otros');
            const spent = Number(spentByCategory[budget.category] || 0);
            const limit = Number(budget.limit || 0);
            const remaining = Math.max(0, limit - spent);
            const progress = limit > 0 ? (spent / limit) * 100 : 0;
            const isOverBudget = spent > limit && limit > 0;

            return (
              <BudgetCard
                key={budget.id}
                budget={budget}
                categoryInfo={categoryInfo}
                spent={spent}
                remaining={remaining}
                progress={progress}
                isOverBudget={isOverBudget}
                onUpdate={handleUpdateBudget}
                onDelete={handleDeleteBudget}
                isSubmitting={isSubmitting}
              />
            );
          }).filter(Boolean)}
        </div>
      ) : (
        !showForm && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-lg">
            <span className="text-6xl mb-4 block">💰</span>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No tienes presupuestos configurados
            </h3>
            <p className="text-gray-500 mb-4">
              Crea tu primer presupuesto para controlar tus gastos por categoría
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Crear Primer Presupuesto
            </button>
          </div>
        )
      )}
    </div>
  );
};

// Componente BudgetCard separado para mejor organización
const BudgetCard = ({ 
  budget, 
  categoryInfo, 
  spent, 
  remaining, 
  progress, 
  isOverBudget, 
  onUpdate, 
  onDelete,
  isSubmitting 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    limit: budget.limit.toString(),
    period: budget.period
  });

  const handleSaveEdit = async () => {
    const limit = parseFloat(editData.limit);
    if (!limit || limit <= 0) {
      alert('El límite debe ser mayor a 0');
      return;
    }

    try {
      await onUpdate(budget.id, {
        limit: limit,
        period: editData.period
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating budget:', error);
      alert('Error al actualizar el presupuesto');
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el presupuesto de ${categoryInfo.label}?`)) {
      try {
        await onDelete(budget.id);
      } catch (error) {
        console.error('Error deleting budget:', error);
        alert('Error al eliminar el presupuesto');
      }
    }
  };

  const getProgressColor = () => {
    if (isOverBudget) return 'bg-red-500';
    if (progress >= 80) return 'bg-yellow-500';
    if (progress >= 60) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getCardStyle = () => {
    if (isOverBudget) return 'border-red-200 bg-red-50';
    if (progress >= 80) return 'border-yellow-200 bg-yellow-50';
    return 'border-gray-200 bg-white';
  };

  return (
    <div className={`rounded-2xl shadow-lg p-6 border-2 transition-all duration-200 ${getCardStyle()}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{categoryInfo.emoji}</span>
          <div>
            <h3 className="text-lg font-bold text-gray-800 capitalize">
              {budget.category}
            </h3>
            <p className="text-sm text-gray-500">
              {budget.period === 'monthly' ? '📅 Mensual' : 
               budget.period === 'weekly' ? '📅 Semanal' : '📅 Anual'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                disabled={isSubmitting}
                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                title="Editar"
              >
                ✏️
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Eliminar"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>

      {/* Estado del presupuesto */}
      <div className="mb-4">
        {isOverBudget ? (
          <div className="flex items-center gap-2 text-red-700 bg-red-100 px-3 py-1 rounded-full text-sm">
            <span>🚨</span>
            <span className="font-semibold">¡Presupuesto excedido!</span>
          </div>
        ) : progress >= 80 ? (
          <div className="flex items-center gap-2 text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full text-sm">
            <span>⚠️</span>
            <span className="font-semibold">Cerca del límite</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm">
            <span>✅</span>
            <span className="font-semibold">Dentro del presupuesto</span>
          </div>
        )}
      </div>

      {/* Modo edición */}
      {isEditing && (
        <div className="space-y-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Límite (€)</label>
            <input
              type="number"
              value={editData.limit}
              onChange={(e) => setEditData(prev => ({ ...prev, limit: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              min="0"
              step="0.01"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
            <select
              value={editData.period}
              onChange={(e) => setEditData(prev => ({ ...prev, period: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isSubmitting}
            >
              <option value="monthly">📅 Mensual</option>
              <option value="weekly">📅 Semanal</option>
              <option value="yearly">📅 Anual</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              disabled={isSubmitting}
              className="flex-1 px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={isSubmitting}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {/* Progreso */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso</span>
          <span className="text-sm font-bold text-gray-600">{Math.min(progress, 100).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Cantidades */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Gastado:</span>
          <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-gray-800'}`}>
            €{spent.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Límite:</span>
          <span className="font-semibold text-gray-800">€{budget.limit.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {isOverBudget ? 'Excedido:' : 'Disponible:'}
          </span>
          <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
            €{isOverBudget ? (spent - budget.limit).toFixed(2) : remaining.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Budgets;