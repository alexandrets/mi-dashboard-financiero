import React, { useState } from 'react';
import { Target, Plus, TrendingUp, Award, Calendar, AlertCircle } from 'lucide-react';
import { useSavingsGoals } from '../hooks/useSavingsGoals';
import SavingsGoalCard from './SavingsGoalCard';

const SavingsGoals = () => {
  const { 
    goals, 
    loading,
    error,
    addGoal, 
    updateGoal, 
    deleteGoal, 
    addSavings,
    getTotalSaved,
    getTotalTarget,
    getCompletedGoals,
    getActiveGoals
  } = useSavingsGoals();
  
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    savedAmount: '0'
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.targetAmount || !formData.targetDate) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const targetAmount = parseFloat(formData.targetAmount);
    const savedAmount = parseFloat(formData.savedAmount || '0');

    if (targetAmount <= 0) {
      alert('La meta debe ser mayor a 0');
      return;
    }

    if (savedAmount > targetAmount) {
      alert('El ahorro inicial no puede ser mayor a la meta');
      return;
    }

    setIsSubmitting(true);

    try {
      await addGoal({
        name: formData.name.trim(),
        targetAmount: targetAmount,
        savedAmount: savedAmount,
        targetDate: formData.targetDate
      });

      setFormData({
        name: '',
        targetAmount: '',
        targetDate: '',
        savedAmount: '0'
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Error al crear la meta: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateGoal = async (id, updates) => {
    try {
      await updateGoal(id, updates);
    } catch (error) {
      console.error('Error updating goal:', error);
      alert('Error al actualizar la meta: ' + error.message);
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await deleteGoal(id);
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('Error al eliminar la meta: ' + error.message);
    }
  };

  const handleAddSavings = async (id, amount) => {
    try {
      await addSavings(id, amount);
    } catch (error) {
      console.error('Error adding savings:', error);
      alert('Error al agregar ahorros: ' + error.message);
    }
  };

  // Estadísticas
  const totalSaved = getTotalSaved();
  const totalTarget = getTotalTarget();
  const completedGoals = getCompletedGoals();
  const activeGoals = getActiveGoals();
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <Target className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-800">Metas de Ahorro</h2>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600">Cargando tus metas de ahorro...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <Target className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-800">Metas de Ahorro</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h3 className="font-bold text-red-800">Error al cargar metas</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-800">Metas de Ahorro</h2>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Nueva Meta
          </button>
        </div>

        {/* Estadísticas generales */}
        {goals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800 font-semibold">Total Ahorrado</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">€{totalSaved.toFixed(2)}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-purple-600" />
                <span className="text-purple-800 font-semibold">Meta Total</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">€{totalTarget.toFixed(2)}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-semibold">Completadas</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{completedGoals.length}</p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                <span className="text-orange-800 font-semibold">Activas</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">{activeGoals.length}</p>
            </div>
          </div>
        )}

        {/* Progreso general */}
        {goals.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-700">Progreso General</span>
              <span className="font-bold text-purple-600">{overallProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(overallProgress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Formulario para crear meta */}
        {showForm && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg mt-6">
            <h3 className="font-semibold text-gray-800 mb-3">Crear Nueva Meta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la meta *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Vacaciones en París"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  maxLength={50}
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta (€) *
                </label>
                <input
                  type="number"
                  placeholder="1000.00"
                  value={formData.targetAmount}
                  onChange={(e) => handleInputChange('targetAmount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                  step="0.01"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha objetivo *
                </label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => handleInputChange('targetDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min={new Date().toISOString().split('T')[0]}
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ahorro inicial (€)
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.savedAmount}
                  onChange={(e) => handleInputChange('savedAmount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                  step="0.01"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <div className="flex gap-2 justify-end pt-2">
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
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {isSubmitting ? 'Creando...' : 'Crear Meta'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de metas */}
      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map(goal => (
            <SavingsGoalCard
              key={goal.id}
              goal={goal}
              onUpdate={handleUpdateGoal}
              onDelete={handleDeleteGoal}
              onAddSavings={handleAddSavings}
            />
          ))}
        </div>
      ) : (
        !showForm && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-lg">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No tienes metas de ahorro
            </h3>
            <p className="text-gray-500 mb-4">
              Crea tu primera meta para empezar a ahorrar con objetivos claros
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Crear Primera Meta
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default SavingsGoals;