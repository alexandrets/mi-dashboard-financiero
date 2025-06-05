import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useExpenses } from '../hooks/useExpenses'
import { useAuth } from '../contexts/AuthContext'
import designTokens from '../styles/designTokens'

const tokens = designTokens

function AddExpense() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { addExpense } = useExpenses()
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    type: 'gasto', // Por defecto gasto
    date: new Date().toISOString().split('T')[0] // Fecha actual
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Categorías diferentes para ingresos y gastos
  const expenseCategories = [
    'Comida',
    'Transporte', 
    'Entretenimiento',
    'Salud',
    'Compras',
    'Servicios',
    'Educación',
    'Otros'
  ]

  const incomeCategories = [
    'Salario',
    'Freelance',
    'Inversiones',
    'Ventas',
    'Bonos',
    'Regalos',
    'Otros'
  ]

  const getCurrentCategories = () => {
    return formData.type === 'ingreso' ? incomeCategories : expenseCategories
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Limpiar categoría cuando cambia el tipo
      ...(name === 'type' ? { category: '' } : {})
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validaciones
    if (!formData.description.trim()) {
      setError('La descripción es obligatoria')
      setLoading(false)
      return
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('El monto debe ser mayor a 0')
      setLoading(false)
      return
    }

    if (!formData.category) {
      setError('Selecciona una categoría')
      setLoading(false)
      return
    }

    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        userId: currentUser.uid,
        createdAt: new Date().toISOString()
      }

      await addExpense(transactionData)
      
      // Redirigir al dashboard
      navigate('/')
    } catch (error) {
      console.error('Error al agregar transacción:', error)
      setError('Error al guardar la transacción: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Determinar colores y textos según el tipo - USANDO TOKENS
  const getTypeStyles = () => {
    if (formData.type === 'ingreso') {
      return {
        bgColor: tokens.gradients.buttonSuccess,
        bgColorHover: tokens.gradients.buttonSuccessHover,
        textColor: tokens.colors.success.text,
        bgCard: tokens.colors.success.bg,
        borderCard: tokens.colors.success.border,
        borderActive: `border-2 ${tokens.colors.success.border.replace('border-', 'border-')} ${tokens.colors.success.bg}`,
        borderInactive: `border-2 ${tokens.borders.card} ${tokens.colors.gray[50]} hover:border-green-300`,
        icon: '💰',
        buttonText: 'Guardar Ingreso'
      }
    }
    return {
      bgColor: tokens.gradients.buttonPrimary.replace('blue', 'red'),
      bgColorHover: 'hover:from-red-600 hover:to-red-700',
      textColor: tokens.colors.danger.text,
      bgCard: tokens.colors.danger.bg,
      borderCard: tokens.colors.danger.border,
      borderActive: `border-2 ${tokens.colors.danger.border.replace('border-', 'border-')} ${tokens.colors.danger.bg}`,
      borderInactive: `border-2 ${tokens.borders.card} ${tokens.colors.gray[50]} hover:border-red-300`,
      icon: '💸',
      buttonText: 'Guardar Gasto'
    }
  }

  const typeStyles = getTypeStyles()

  return (
    <div className={`min-h-screen ${tokens.gradients.background}`}>
      {/* Header */}
      <div className={`${tokens.gradients.header} ${tokens.shadows.card}`}>
        <div className={`${tokens.layout.container} max-w-4xl`}>
          <div className={`flex items-center justify-between ${tokens.spacing.headerPadding}`}>
            <div className={`flex items-center ${tokens.spacing.sectionGapSmall}`}>
              <Link 
                to="/" 
                className={`w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 ${tokens.borders.radius.lg} flex items-center justify-center ${tokens.transitions.all}`}
              >
                <span className={`${tokens.colors.white} text-lg`}>←</span>
              </Link>
              <div>
                <h1 className={`${tokens.typography.title.xl} ${tokens.colors.white}`}>
                  Nueva Transacción
                </h1>
                <p className="text-blue-100">
                  Registra tus ingresos y gastos
                </p>
              </div>
            </div>
            
            <div className={`w-12 h-12 bg-white bg-opacity-20 ${tokens.borders.radius.lg} flex items-center justify-center`}>
              <span className="text-2xl">{typeStyles.icon}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`${tokens.layout.container} max-w-4xl ${tokens.layout.pageSpacing}`}>
        <div className={`${tokens.components.card.base} -mt-8 relative z-10`}>
          <div className={tokens.spacing.cardPaddingLarge}>
            {error && (
              <div className={`${tokens.colors.danger.bg} ${tokens.colors.danger.border} ${tokens.colors.danger.text} px-4 py-3 ${tokens.borders.radius.lg} ${tokens.spacing.elementMargin}`}>
                <div className={`flex items-center ${tokens.spacing.sectionGapSmall}`}>
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className={`space-y-6`}>
              {/* Tipo de Transacción */}
              <div>
                <label className={`block ${tokens.typography.subtitle.sm} ${tokens.colors.gray[700]} ${tokens.spacing.elementMarginSmall}`}>
                  Tipo de Transacción
                </label>
                <div className={`grid grid-cols-2 ${tokens.spacing.sectionGapSmall}`}>
                  <button
                    type="button"
                    onClick={() => handleChange({ target: { name: 'type', value: 'ingreso' }})}
                    className={`p-4 ${tokens.borders.radius.lg} ${tokens.transitions.all} ${
                      formData.type === 'ingreso'
                        ? `border-2 ${tokens.colors.success.border.replace('border-', 'border-')} ${tokens.colors.success.bg} ${tokens.colors.success.text}`
                        : `border-2 ${tokens.borders.card} ${tokens.colors.gray[50]} ${tokens.colors.gray[600]} hover:border-green-300`
                    }`}
                  >
                    <div className="text-2xl mb-2">💰</div>
                    <div className={tokens.typography.subtitle.md}>Ingreso</div>
                    <div className={tokens.typography.body.sm}>Dinero que recibes</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleChange({ target: { name: 'type', value: 'gasto' }})}
                    className={`p-4 ${tokens.borders.radius.lg} ${tokens.transitions.all} ${
                      formData.type === 'gasto'
                        ? `border-2 ${tokens.colors.danger.border.replace('border-', 'border-')} ${tokens.colors.danger.bg} ${tokens.colors.danger.text}`
                        : `border-2 ${tokens.borders.card} ${tokens.colors.gray[50]} ${tokens.colors.gray[600]} hover:border-red-300`
                    }`}
                  >
                    <div className="text-2xl mb-2">💸</div>
                    <div className={tokens.typography.subtitle.md}>Gasto</div>
                    <div className={tokens.typography.body.sm}>Dinero que gastas</div>
                  </button>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className={`block ${tokens.typography.subtitle.sm} ${tokens.colors.gray[700]} mb-2`}>
                  Descripción
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={formData.type === 'ingreso' ? 'Ej: Salario, Freelance, Venta...' : 'Ej: Gasolina, Supermercado, Café...'}
                  className={`w-full px-4 py-3 ${tokens.borders.input} ${tokens.borders.radius.lg} focus:ring-2 focus:ring-blue-500 ${tokens.borders.inputFocus} ${tokens.transitions.all} ${tokens.typography.body.lg}`}
                  required
                />
              </div>

              {/* Monto y Categoría */}
              <div className={`grid grid-cols-1 md:grid-cols-2 ${tokens.spacing.sectionGap}`}>
                <div>
                  <label className={`block ${tokens.typography.subtitle.sm} ${tokens.colors.gray[700]} mb-2`}>
                    Monto (€)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`w-full px-4 py-3 ${tokens.borders.input} ${tokens.borders.radius.lg} focus:ring-2 focus:ring-blue-500 ${tokens.borders.inputFocus} ${tokens.transitions.all} ${tokens.typography.body.lg}`}
                    required
                  />
                </div>

                <div>
                  <label className={`block ${tokens.typography.subtitle.sm} ${tokens.colors.gray[700]} mb-2`}>
                    Categoría
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 ${tokens.borders.input} ${tokens.borders.radius.lg} focus:ring-2 focus:ring-blue-500 ${tokens.borders.inputFocus} ${tokens.transitions.all} ${tokens.typography.body.lg}`}
                    required
                  >
                    <option value="">Selecciona una categoría</option>
                    {getCurrentCategories().map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fecha */}
              <div>
                <label className={`block ${tokens.typography.subtitle.sm} ${tokens.colors.gray[700]} mb-2`}>
                  Fecha
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 ${tokens.borders.input} ${tokens.borders.radius.lg} focus:ring-2 focus:ring-blue-500 ${tokens.borders.inputFocus} ${tokens.transitions.all} ${tokens.typography.body.lg}`}
                  required
                />
              </div>

              {/* Botones */}
              <div className={`flex ${tokens.spacing.sectionGapSmall} pt-6`}>
                <Link
                  to="/"
                  className={`flex-1 ${tokens.colors.gray[100]} hover:${tokens.colors.gray[200]} ${tokens.colors.gray[700]} py-4 px-6 ${tokens.borders.radius.lg} ${tokens.typography.subtitle.md} ${tokens.transitions.all} ${tokens.transitions.normal} text-center`}
                >
                  Cancelar
                </Link>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 ${typeStyles.bgColor} ${typeStyles.bgColorHover} disabled:from-gray-400 disabled:to-gray-500 ${tokens.colors.white} py-4 px-6 ${tokens.borders.radius.lg} ${tokens.typography.subtitle.md} ${tokens.transitions.all} ${tokens.transitions.normal} flex items-center justify-center space-x-2`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <span>{typeStyles.icon}</span>
                      <span>{typeStyles.buttonText}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Vista Previa */}
        {formData.amount && formData.description && (
          <div className={`mt-6 ${tokens.borders.radius.lg} p-4 border-2 ${
            formData.type === 'ingreso' 
              ? `${tokens.colors.success.bg} ${tokens.colors.success.border}` 
              : `${tokens.colors.danger.bg} ${tokens.colors.danger.border}`
          }`}>
            <h3 className={`${tokens.typography.subtitle.md} mb-2 ${
              formData.type === 'ingreso' ? 'text-green-800' : 'text-red-800'
            }`}>
              Vista Previa:
            </h3>
            <div className="flex items-center justify-between">
              <span className={formData.type === 'ingreso' ? 'text-green-700' : 'text-red-700'}>
                {formData.description} ({formData.category})
              </span>
              <span className={`${tokens.typography.subtitle.lg} ${typeStyles.textColor}`}>
                {formData.type === 'ingreso' ? '+' : '-'}€{parseFloat(formData.amount || 0).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AddExpense