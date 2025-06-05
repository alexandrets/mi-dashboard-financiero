import React, { useState } from 'react';
import { Target, Plus, Edit2, Trash2, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';

const SavingsGoalCard = ({ goal, onUpdate, onDelete, onAddSavings }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingMoney, setIsAddingMoney] = useState(false);
  const [editData, setEditData] = useState({
    name: goal.name,
    targetAmount: goal.targetAmount.toString(),
    targetDate: goal.targetDate
  });
  const [amountToAdd, setAmountToAdd] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calcular progreso
  const progress = goal.targetAmount > 0 ? (goal.savedAmount / goal.targetAmount) * 100 : 0;
  const isCompleted = goal.savedAmount >= goal.targetAmount;
  const remainingAmount = Math.max(0, goal.targetAmount - goal.savedAmount);
  
  // Verificar si está vencida
  const today = new Date().toISOString().split('T')[0];
  const isOverdue = goal.targetDate < today && !isCompleted;
  
  // Calcular días restantes
  const targetDate = new Date(goal.targetDate);
  const todayDate = new Date();
  const timeDiff = targetDate.getTime() - todayDate.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

  // Manejar actualización de meta
  const handleSaveEdit = async () => {
    if (!editData.name.trim() || !editData.targetAmount || !editData.targetDate) {
      alert('Por favor completa todos los campos');
      return;
    }

    const targetAmount = parseFloat(editData.targetAmount);
    if (targetAmount <= 0) {
      alert('La meta debe ser mayor a 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate(goal.id, {
        name: editData.name.trim(),
        targetAmount: targetAmount,
        targetDate: editData.targetDate
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating goal:', error);
      alert('Error al actualizar la meta');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar añadir dinero
  const handleAddMoney = async () => {
    const amount = parseFloat(amountToAdd);
    if (!amount || amount <= 0) {
      alert('Por favor ingresa una cantidad válida');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddSavings(goal.id, amount);
      setAmountToAdd('');
      setIsAddingMoney(false);
    } catch (error) {
      console.error('Error adding savings:', error);
      alert('Error al agregar ahorros');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar eliminación
  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la meta "${goal.name}"?`)) {
      setIsSubmitting(true);
      try {
        await onDelete(goal.id);
      } catch (error) {
        console.error('Error deleting goal:', error);
        alert('Error al eliminar la meta');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Determinar estilo de la tarjeta según estado
  const getCardStyle = () => {
    if (isCompleted) return 'border-green-200 bg-green-50';
    if (isOverdue) return 'border-red-200 bg-red-50';
    return 'border-gray-200 bg-white';
  };

  // Determinar color de la barra de progreso
  const getProgressColor = () => {
    if (isCompleted) return 'bg-green-500';
    if (isOverdue) return 'bg-red-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-purple-500';
  };

  return (
    <div className={`rounded-2xl shadow-lg p-6 border-2 transition-all duration-200 ${getCardStyle()}`}>
      
      {/* Header con estado */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : isOverdue ? (
            <AlertTriangle className="w-6 h-6 text-red-600" />
          ) : (
            <Target className="w-6 h-6 text-purple-600" />
          )}
          
          {isEditing ? (
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
              className="text-lg font-bold bg-transparent border-b-2 border-purple-500 focus:outline-none"
              maxLength={50}
              disabled={isSubmitting}
            />
          ) : (
            <h3 className="text-lg font-bold text-gray-800">{goal.name}</h3>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-1">
          {!isEditing && !isAddingMoney && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                disabled={isSubmitting}
                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Estado y fecha */}
      <div className="mb-4">
        {isCompleted ? (
          <div className="flex items-center gap-2 text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            <span className="font-semibold">¡Meta Completada!</span>
          </div>
        ) : isOverdue ? (
          <div className="flex items-center gap-2 text-red-700 bg-red-100 px-3 py-1 rounded-full text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-semibold">Vencida</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Calendar className="w-4 h-4" />
            <span>
              {daysRemaining > 0 
                ? `${daysRemaining} días restantes`
                : daysRemaining === 0 
                ? 'Vence hoy'
                : `Venció hace ${Math.abs(daysRemaining)} días`
              }
            </span>
          </div>
        )}
      </div>

      {/* Modo edición */}
      {isEditing && (
        <div className="space-y-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta (€)</label>
            <input
              type="number"
              value={editData.targetAmount}
              onChange={(e) => setEditData(prev => ({ ...prev, targetAmount: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              min="0"
              step="0.01"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha objetivo</label>
            <input
              type="date"
              value={editData.targetDate}
              onChange={(e) => setEditData(prev => ({ ...prev, targetDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isSubmitting}
            />
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
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <span className="text-sm font-bold text-purple-600">{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Cantidades */}
      <div className="mb-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Ahorrado:</span>
          <span className="font-semibold text-green-600">€{goal.savedAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Meta:</span>
          <span className="font-semibold text-gray-800">€{goal.targetAmount.toFixed(2)}</span>
        </div>
        {!isCompleted && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Restante:</span>
            <span className="font-semibold text-orange-600">€{remainingAmount.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Añadir dinero */}
      {!isCompleted && !isEditing && (
        <div className="space-y-3">
          {isAddingMoney ? (
            <div className="space-y-2">
              <input
                type="number"
                placeholder="Cantidad a añadir (€)"
                value={amountToAdd}
                onChange={(e) => setAmountToAdd(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                min="0"
                step="0.01"
                disabled={isSubmitting}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsAddingMoney(false);
                    setAmountToAdd('');
                  }}
                  disabled={isSubmitting}
                  className="flex-1 px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddMoney}
                  disabled={isSubmitting}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Añadiendo...' : 'Añadir'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingMoney(true)}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Añadir Dinero
            </button>
          )}
        </div>
      )}

      {/* Fecha objetivo */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Fecha objetivo:</span>
          <span className="font-medium">
            {new Date(goal.targetDate).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SavingsGoalCard;