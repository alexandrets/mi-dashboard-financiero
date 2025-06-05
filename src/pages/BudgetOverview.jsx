import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBudgets } from '../hooks/useBudgets'
import { useExpenses } from '../hooks/useExpenses'
import { useAuth } from '../contexts/AuthContext'
import ProgressCircle from '../components/ProgressCircle'
import designTokens from '../styles/designTokens'

const tokens = designTokens

const BUDGET_CATEGORIES = [
  'Alimentación',
  'Transporte', 
  'Entretenimiento',
  'Salud',
  'Compras',
  'Servicios',
  'Educación',
  'Hobbies',
  'Estudios',
  'Ocio',
  'Otros'
]

function BudgetCategoryRow({ budget, onDelete }) {
  const [showMenu, setShowMenu] = useState(false)
  
  const getProgressBarColor = () => {
    if (budget.percentage <= 50) return tokens.colors.success[500]
    if (budget.percentage <= 80) return tokens.colors.warning[500]
    if (budget.percentage <= 100) return 'bg-orange-500'
    return tokens.colors.danger[500]
  }

  const getStatusText = () => {
    if (budget.isExceeded) {
      const excess = budget.percentage - 100
      return `Presupuesto mensual excedido (${excess.toFixed(0)}%)`
    } else {
      const remaining = 100 - budget.percentage
      return `Dentro del presupuesto mensual (${remaining.toFixed(0)}%)`
    }
  }

  const getStatusColor = () => {
    return budget.isExceeded ? tokens.colors.danger.text : tokens.colors.success.text
  }

  return (
    <div className={`${tokens.components.card.base} ${tokens.components.card.padding} hover:${tokens.shadows.cardHover.split(' ')[1]} ${tokens.transitions.colors}`}>
      <div className={`flex items-center justify-between ${tokens.spacing.elementMarginSmall}`}>
        <h3 className={`${tokens.typography.title.lg} ${tokens.colors.gray[800]}`}>{budget.category}</h3>
        
        <div className={`flex items-center ${tokens.spacing.elementMarginSmall}`}>
          <span className={`${tokens.typography.title.lg} ${tokens.colors.gray[800]}`}>
            €{budget.spent.toFixed(2)} / €{budget.amount.toFixed(2)}
          </span>
          
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className={`w-8 h-8 ${tokens.colors.danger.bg} hover:bg-red-200 ${tokens.colors.danger.text} ${tokens.borders.radius.full} flex items-center justify-center ${tokens.transitions.colors}`}
            >
              ✕
            </button>
            
            {showMenu && (
              <div className={`absolute right-0 top-10 ${tokens.colors.white} ${tokens.borders.card} ${tokens.borders.radius.lg} ${tokens.shadows.dropdown} z-10 w-40 py-1`}>
                <button 
                  onClick={() => {
                    onDelete(budget.id)
                    setShowMenu(false)
                  }}
                  className={`w-full px-4 py-2 text-left ${tokens.typography.body.sm} ${tokens.colors.danger.text} hover:${tokens.colors.danger.bg} flex items-center space-x-2`}
                >
                  <span>🗑️</span>
                  <span>Eliminar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={tokens.spacing.elementMarginSmall}>
        <div className={`w-full ${tokens.colors.gray[200]} ${tokens.borders.radius.full} h-3 overflow-hidden`}>
          <div 
            className={`h-3 ${tokens.borders.radius.full} ${tokens.transitions.all} duration-1000 ease-out ${getProgressBarColor()}`}
            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
          ></div>
        </div>
      </div>

      <p className={`${tokens.typography.body.sm} font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </p>
    </div>
  )
}

function BudgetOverview() {
  const { currentUser, logout } = useAuth()
  const { totals } = useExpenses()
  const { 
    budgets, 
    loading, 
    error, 
    addBudget, 
    deleteBudget, 
    calculateBudgetProgress,
    calculateTotals,
    getMonthName,
    getCurrentMonth,
    getCurrentYear
  } = useBudgets()

  const [selectedCategory, setSelectedCategory] = useState('')
  const [budgetAmount, setBudgetAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const budgetProgress = calculateBudgetProgress(totals.expensesByCategory)
  const budgetTotals = calculateTotals(totals.expensesByCategory)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedCategory || !budgetAmount || parseFloat(budgetAmount) <= 0) {
      alert('Por favor selecciona una categoría e ingresa un monto válido')
      return
    }

    setIsSubmitting(true)
    try {
      await addBudget(selectedCategory, parseFloat(budgetAmount))
      setSelectedCategory('')
      setBudgetAmount('')
      alert('Presupuesto establecido correctamente')
    } catch (error) {
      console.error('Error al agregar presupuesto:', error)
      alert('Error al establecer presupuesto: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (budgetId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este presupuesto?')) {
      try {
        await deleteBudget(budgetId)
      } catch (error) {
        console.error('Error al eliminar:', error)
        alert('Error al eliminar presupuesto: ' + error.message)
      }
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${tokens.gradients.background}`}>
        <div className={`${tokens.layout.container} ${tokens.layout.pageSpacing}`}>
          <div className="text-center py-20">
            <div className={`w-16 h-16 ${tokens.gradients.iconPrimary} ${tokens.borders.radius.full} mx-auto mb-4 animate-pulse`}></div>
            <p className={`${tokens.colors.white} ${tokens.typography.title.lg}`}>Cargando presupuestos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${tokens.gradients.background}`}>
      <div className={`${tokens.gradients.header} ${tokens.shadows.card}`}>
        <div className={tokens.layout.container}>
          <div className={`flex items-center justify-between ${tokens.spacing.headerPadding}`}>
            <div className={`flex items-center ${tokens.spacing.sectionGapSmall}`}>
              <Link 
                to="/dashboard"
                className={`w-10 h-10 bg-white bg-opacity-20 ${tokens.borders.radius.md} flex items-center justify-center hover:bg-opacity-30 ${tokens.transitions.colors}`}
              >
                <span className={`${tokens.colors.white} text-lg`}>←</span>
              </Link>
              <div className={`w-12 h-12 bg-white bg-opacity-20 ${tokens.borders.radius.lg} flex items-center justify-center`}>
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <h1 className={`${tokens.typography.title.xl} ${tokens.colors.white}`}>
                  Presupuestos por Categoría
                </h1>
                <p className="text-purple-100">
                  Gestiona tus límites de gasto mensuales
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className={`bg-white bg-opacity-20 hover:bg-opacity-30 ${tokens.colors.white} ${tokens.spacing.buttonPaddingSmall} ${tokens.borders.radius.md} ${tokens.transitions.all} ${tokens.transitions.normal} flex items-center space-x-2`}
            >
              <span>👋</span>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      <div className={`${tokens.layout.container} ${tokens.layout.pageSpacing}`}>
        <div className={tokens.layout.gridMain}>
          <div className="lg:col-span-2">
            <div className={`${tokens.components.card.base} ${tokens.components.card.padding}`}>
              <div className={tokens.components.sectionHeader.container}>
                <div className={`w-8 h-8 ${tokens.colors.secondary.bg} ${tokens.borders.radius.md} flex items-center justify-center`}>
                  <span className={tokens.colors.secondary.text}>📊</span>
                </div>
                <h2 className={`${tokens.typography.title.lg} ${tokens.colors.gray[800]}`}>
                  Presupuestos de {getMonthName(getCurrentMonth(), getCurrentYear())}
                </h2>
              </div>

              {budgetProgress.length === 0 ? (
                <div className="text-center py-12">
                  <div className={`w-24 h-24 ${tokens.gradients.cardSubtle} ${tokens.borders.radius.full} mx-auto mb-4 flex items-center justify-center`}>
                    <span className="text-4xl">💰</span>
                  </div>
                  <h3 className={`${tokens.typography.title.lg} ${tokens.colors.gray[800]} ${tokens.spacing.elementMarginSmall}`}>
                    No tienes presupuestos establecidos
                  </h3>
                  <p className={`${tokens.colors.gray[600]} ${tokens.spacing.elementMargin}`}>
                    Comienza estableciendo presupuestos para tus categorías de gasto
                  </p>
                </div>
              ) : (
                <div className={`space-y-4`}>
                  {budgetProgress
                    .sort((a, b) => b.percentage - a.percentage)
                    .map(budget => (
                      <BudgetCategoryRow 
                        key={budget.id}
                        budget={budget}
                        onDelete={handleDelete}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className={`lg:col-span-1 space-y-6`}>
            <div className={`${tokens.components.card.base} ${tokens.components.card.padding}`}>
              <div className={tokens.components.sectionHeader.container}>
                <div className={tokens.components.iconContainer.primary}>
                  <span className={`${tokens.colors.white} text-lg`}>➕</span>
                </div>
                <h2 className={`${tokens.typography.title.lg} ${tokens.colors.gray[800]}`}>
                  Agregar Presupuesto Mensual
                </h2>
              </div>

              <form onSubmit={handleSubmit} className={`space-y-4`}>
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`w-full px-4 py-3 ${tokens.borders.input} ${tokens.borders.radius.lg} focus:ring-2 focus:ring-blue-500 ${tokens.borders.inputFocus} ${tokens.transitions.colors}`}
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {BUDGET_CATEGORIES
                      .filter(cat => !budgets.some(budget => budget.category === cat))
                      .map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder="Presupuesto (€)"
                    className={`w-full px-4 py-3 ${tokens.borders.input} ${tokens.borders.radius.lg} focus:ring-2 focus:ring-blue-500 ${tokens.borders.inputFocus} ${tokens.transitions.colors}`}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${tokens.components.button.primary} ${tokens.components.button.base} ${tokens.shadows.button} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? 'Estableciendo...' : 'Establecer Presupuesto'}
                </button>
              </form>
            </div>

            <div className={`${tokens.components.card.base} ${tokens.components.card.padding}`}>
              <div className={tokens.components.sectionHeader.container}>
                <div className={`w-8 h-8 ${tokens.colors.primary.bg} ${tokens.borders.radius.md} flex items-center justify-center`}>
                  <span className={tokens.colors.primary.text}>📊</span>
                </div>
                <h2 className={`${tokens.typography.title.md} ${tokens.colors.gray[800]}`}>
                  Progreso del Gasto Total
                </h2>
              </div>

              <div className="text-center">
                <ProgressCircle 
                  percentage={budgetTotals.overallPercentage} 
                  size={140} 
                />
              </div>
            </div>

            <div className={`${tokens.components.card.base} ${tokens.components.card.padding}`}>
              <div className={tokens.components.sectionHeader.container}>
                <div className={`w-8 h-8 ${tokens.colors.warning.bg} ${tokens.borders.radius.md} flex items-center justify-center`}>
                  <span className={`text-${tokens.colors.warning[600]}`}>💰</span>
                </div>
                <h2 className={`${tokens.typography.title.md} ${tokens.colors.gray[800]}`}>
                  Gasto vs. Presupuesto
                </h2>
              </div>

              <div className={`text-center ${tokens.spacing.elementMarginSmall}`}>
                <p className={`${tokens.colors.gray[600]} ${tokens.typography.body.sm}`}>
                  €{budgetTotals.totalSpent.toFixed(2)} de €{budgetTotals.totalBudget.toFixed(2)} ({budgetTotals.overallPercentage.toFixed(0)}%)
                </p>
              </div>

              <div className={`grid grid-cols-2 ${tokens.spacing.sectionGapSmall}`}>
                <div className="text-center">
                  <div className={`${tokens.typography.metric.lg} ${tokens.colors.danger.text}`}>
                    €{budgetTotals.totalSpent.toFixed(2)}
                  </div>
                  <div className={`${tokens.colors.gray[500]} ${tokens.typography.body.sm}`}>Gastado</div>
                </div>
                <div className="text-center">
                  <div className={`${tokens.typography.metric.lg} ${
                    budgetTotals.totalRemaining >= 0 ? tokens.colors.success.text : tokens.colors.danger.text
                  }`}>
                    €{Math.abs(budgetTotals.totalRemaining).toFixed(2)}
                  </div>
                  <div className={`${tokens.colors.gray[500]} ${tokens.typography.body.sm}`}>
                    {budgetTotals.totalRemaining >= 0 ? 'Restante' : 'Excedido'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BudgetOverview