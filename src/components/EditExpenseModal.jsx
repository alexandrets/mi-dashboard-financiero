import { useState, useEffect } from 'react'
import { useExpenses } from '../hooks/useExpenses'

function EditExpenseModal({ expense, isOpen, onClose }) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Comida',
    date: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { updateExpense } = useExpenses()

  // Categorías predefinidas
  const categories = [
    'Comida', 'Transporte', 'Entretenimiento', 'Salud', 
    'Compras', 'Servicios', 'Educación', 'Otros'
  ]

  // Cargar datos del gasto cuando se abre el modal
  useEffect(() => {
    if (expense && isOpen) {
      setFormData({
        description: expense.description || '',
        amount: expense.amount?.toString() || '',
        category: expense.category || 'Comida',
        date: expense.date || ''
      })
      setError('')
    }
  }, [expense, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validaciones
    if (!formData.description.trim()) {
      setError('La descripción es obligatoria')
      return
    }

    if (!formData.amount || formData.amount <= 0) {
      setError('El monto debe ser mayor a 0')
      return
    }

    if (!formData.date) {
      setError('La fecha es obligatoria')
      return
    }

    try {
      setError('')
      setLoading(true)

      // Actualizar gasto en Firebase
      await updateExpense(expense.id, {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date
      })

      // Cerrar modal
      onClose()
      
    } catch (error) {
      setError(error.message || 'Error al actualizar gasto')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  // No renderizar si no está abierto
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            ✏️ Editar Gasto
          </h2>
          <button 
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none disabled:cursor-not-allowed"
          >
            ×
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📝 Descripción
              </label>
              <input 
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Ej: Almuerzo en restaurante"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            {/* Monto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                💰 Monto
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input 
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🏷️ Categoría
              </label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📅 Fecha
              </label>
              <input 
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button 
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditExpenseModal