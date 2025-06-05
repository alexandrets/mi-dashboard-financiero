import { useState } from 'react'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CATEGORY_ICONS } from '../constants/Categories'

function QuickTransactionForm({ isOpen, onClose, onTransactionAdded, addExpense }) {
  const [formData, setFormData] = useState({
    type: 'gasto',
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Obtener categorías según el tipo de transacción
  const getCategories = () => {
    return formData.type === 'gasto' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
  }

  const resetForm = () => {
    setFormData({
      type: 'gasto',
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0]
    })
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!formData.description.trim()) {
      setError('La descripción es obligatoria')
      return
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('El monto debe ser mayor a 0')
      return
    }
    
    if (!formData.category) {
      setError('Selecciona una categoría')
      return
    }

    setIsSubmitting(true)

    try {
      const transaction = {
        type: formData.type,
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date
      }

      console.log('📝 Enviando transacción:', transaction)
      
      if (addExpense) {
        await addExpense(transaction)
        console.log('✅ Transacción guardada exitosamente')
        
        // Llamar callback si existe
        if (onTransactionAdded) {
          onTransactionAdded(transaction)
        }
        
        resetForm()
        onClose()
      } else {
        throw new Error('Función addExpense no disponible')
      }
    } catch (error) {
      console.error('❌ Error al guardar transacción:', error)
      setError('Error al guardar: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTypeChange = (newType) => {
    setFormData({
      ...formData,
      type: newType,
      category: '' // Reset category when type changes
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">💰</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                Nueva Transacción
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Tipo de Transacción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Transacción
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('gasto')}
                className={`p-3 rounded-xl font-medium transition-all ${
                  formData.type === 'gasto'
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                💸 Gasto
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('ingreso')}
                className={`p-3 rounded-xl font-medium transition-all ${
                  formData.type === 'ingreso'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                💰 Ingreso
              </button>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <input
              type="text"
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder={formData.type === 'gasto' ? 'Ej: Supermercado Mercadona' : 'Ej: Salario enero'}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              maxLength={100}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.description.length}/100 caracteres
            </div>
          </div>

          {/* Monto */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Monto (€) *
            </label>
            <input
              type="number"
              id="amount"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="0.00"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Categoría */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Seleccionar categoría</option>
              {getCategories().map(category => (
                <option key={category} value={category}>
                  {CATEGORY_ICONS[category]} {category}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              ⚠️ {error}
            </div>
          )}

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : formData.type === 'gasto'
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Guardando...</span>
                </div>
              ) : (
                `Agregar ${formData.type === 'gasto' ? 'Gasto' : 'Ingreso'}`
              )}
            </button>
          </div>

          {/* Preview */}
          {formData.description && formData.amount && formData.category && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
              <div className="text-sm font-medium text-blue-800 mb-2">
                📋 Vista previa:
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{CATEGORY_ICONS[formData.category]}</span>
                  <div>
                    <div className="font-medium text-gray-800">
                      {formData.description}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formData.category} • {new Date(formData.date).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                </div>
                <div className={`text-lg font-bold ${
                  formData.type === 'ingreso' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formData.type === 'ingreso' ? '+' : '-'}€{parseFloat(formData.amount || 0).toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default QuickTransactionForm