import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useExpenses } from '../hooks/useExpenses'
import { EXPENSE_CATEGORIES } from '../constants/Categories'

// Componente Tooltip personalizado para presupuestos
function BudgetTooltip({ category, transactions, spent, budget, isVisible, position }) {
  if (!isVisible) return null

  // Filtrar transacciones de esta categoría del mes actual
  const categoryTransactions = transactions
    .filter(transaction => {
      if (transaction.category !== category || transaction.type !== 'gasto') return false
      const transactionDate = new Date(transaction.date)
      const currentDate = new Date()
      return transactionDate.getMonth() === currentDate.getMonth() && 
             transactionDate.getFullYear() === currentDate.getFullYear()
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  const remaining = budget - spent
  const percentage = budget > 0 ? (spent / budget) * 100 : 0

  return (
    <div 
      className="fixed bg-white rounded-xl shadow-lg border border-gray-200 p-4 pointer-events-none z-50 max-w-sm"
      style={{
        left: position.x + 10,
        top: position.y - 150,
        transform: 'translate(0, 0)'
      }}
    >
      {/* Header del tooltip */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
        <div>
          <h3 className="font-semibold text-gray-800">{category}</h3>
          <div className="text-xs text-gray-500">
            €{spent.toFixed(2)} de €{budget.toFixed(2)} ({percentage.toFixed(1)}%)
          </div>
        </div>
        <div className={`text-lg font-bold ${
          percentage > 100 ? 'text-red-600' : 
          percentage > 80 ? 'text-orange-600' : 'text-green-600'
        }`}>
          €{remaining >= 0 ? remaining.toFixed(0) : Math.abs(remaining).toFixed(0)}
        </div>
      </div>

      {/* Lista de transacciones */}
      {categoryTransactions.length > 0 ? (
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-600 mb-2">
            Transacciones de este mes:
          </div>
          {categoryTransactions.map((transaction, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800 truncate">
                  {transaction.description || 'Sin descripción'}
                </div>
                <div className="text-gray-500">
                  {new Date(transaction.date).toLocaleDateString('es-ES', { 
                    day: '2-digit', 
                    month: '2-digit' 
                  })}
                </div>
              </div>
              <div className="text-red-600 font-bold ml-2">
                €{transaction.amount.toFixed(2)}
              </div>
            </div>
          ))}
          
          {transactions.filter(t => {
            const transactionDate = new Date(t.date)
            const currentDate = new Date()
            return t.category === category && t.type === 'gasto' &&
                   transactionDate.getMonth() === currentDate.getMonth() && 
                   transactionDate.getFullYear() === currentDate.getFullYear()
          }).length > 5 && (
            <div className="text-xs text-gray-500 text-center pt-1 border-t border-gray-100">
              +{transactions.filter(t => {
                const transactionDate = new Date(t.date)
                const currentDate = new Date()
                return t.category === category && t.type === 'gasto' &&
                       transactionDate.getMonth() === currentDate.getMonth() && 
                       transactionDate.getFullYear() === currentDate.getFullYear()
              }).length - 5} más
            </div>
          )}
        </div>
      ) : (
        <div className="text-xs text-gray-500 text-center">
          No hay gastos este mes
        </div>
      )}

      {/* Footer con estado */}
      <div className={`text-xs text-center mt-3 pt-2 border-t border-gray-100 font-medium ${
        percentage > 100 ? 'text-red-600' : 
        percentage > 80 ? 'text-orange-600' : 'text-green-600'
      }`}>
        {percentage > 100 ? '🚨 Presupuesto excedido' :
         percentage > 80 ? '⚠️ Cerca del límite' : '✅ Dentro del presupuesto'}
      </div>
    </div>
  )
}

function Budgets({ transactions = [] }) {
  const { currentUser } = useAuth()
  const { loading, error } = useExpenses()
  const [budgets, setBudgets] = useState([])
  const [newBudget, setNewBudget] = useState({ category: '', amount: '' })
  const [showForm, setShowForm] = useState(false)
  const [tooltip, setTooltip] = useState({ 
    isVisible: false, 
    category: '', 
    position: { x: 0, y: 0 } 
  })

  // Usar categorías unificadas
  const categories = EXPENSE_CATEGORIES

  // Cargar presupuestos desde localStorage
  useEffect(() => {
    const savedBudgets = localStorage.getItem(`budgets_${currentUser?.uid}`)
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets))
    }
  }, [currentUser])

  // Guardar presupuestos en localStorage
  const saveBudgets = (newBudgets) => {
    setBudgets(newBudgets)
    localStorage.setItem(`budgets_${currentUser?.uid}`, JSON.stringify(newBudgets))
  }

  // Calcular gastos por categoría del mes actual
  const getCurrentMonthExpenses = () => {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    return transactions
      .filter(transaction => {
        if (transaction.type !== 'gasto') return false
        const transactionDate = new Date(transaction.date)
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear
      })
      .reduce((acc, transaction) => {
        const category = transaction.category || 'Otros'
        acc[category] = (acc[category] || 0) + transaction.amount
        return acc
      }, {})
  }

  const monthlyExpenses = getCurrentMonthExpenses()

  // Agregar nuevo presupuesto
  const handleAddBudget = (e) => {
    e.preventDefault()
    if (newBudget.category && newBudget.amount) {
      const budget = {
        id: Date.now(),
        category: newBudget.category,
        amount: parseFloat(newBudget.amount),
        createdAt: new Date().toISOString()
      }
      
      const updatedBudgets = budgets.filter(b => b.category !== newBudget.category)
      saveBudgets([...updatedBudgets, budget])
      setNewBudget({ category: '', amount: '' })
      setShowForm(false)
    }
  }

  // Eliminar presupuesto
  const handleDeleteBudget = (budgetId) => {
    const updatedBudgets = budgets.filter(budget => budget.id !== budgetId)
    saveBudgets(updatedBudgets)
  }

  // Manejar hover en las barras
  const handleBarMouseMove = (e, category, spent, budgetAmount) => {
    setTooltip({
      isVisible: true,
      category,
      spent,
      budget: budgetAmount,
      position: {
        x: e.clientX,
        y: e.clientY
      }
    })
  }

  const handleBarLeave = () => {
    setTooltip({ isVisible: false, category: '', position: { x: 0, y: 0 } })
  }

  // Calcular totales
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0)
  const totalSpent = Object.values(monthlyExpenses).reduce((sum, amount) => sum + amount, 0)
  const remainingBudget = totalBudget - totalSpent
  const progressPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

  // Obtener el mes actual en texto
  const getCurrentMonthName = () => {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ]
    return months[new Date().getMonth()]
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-blue-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-blue-200 rounded"></div>
            <div className="h-16 bg-blue-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-lg p-6 border border-blue-200 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">💰</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            Presupuestos por Categoría
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Presupuestos */}
        <div className="lg:col-span-2">
          {/* Selector de Mes */}
          <div className="bg-blue-100 rounded-xl p-4 mb-4 border border-blue-200">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">📅</span>
              <span className="text-blue-800 font-medium">
                Presupuestos de {getCurrentMonthName()} de {new Date().getFullYear()}
              </span>
            </div>
          </div>

          {budgets.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No hay presupuestos configurados
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Establece presupuestos mensuales para controlar tus gastos
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                + Crear primer presupuesto
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {budgets.map((budget) => {
                const spent = monthlyExpenses[budget.category] || 0
                const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
                const isOverBudget = percentage > 100

                return (
                  <div 
                    key={budget.id}
                    className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {budget.category}
                        </h3>
                        <span className="text-sm text-gray-600">
                          €{spent.toFixed(2)} / €{budget.amount.toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="text-red-400 hover:text-red-600 p-1 rounded transition-colors"
                        title="Eliminar presupuesto"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Barra de progreso con tooltip */}
                    <div className="mb-2">
                      <div 
                        className="bg-gray-200 rounded-full h-3 overflow-hidden cursor-pointer"
                        onMouseMove={(e) => handleBarMouseMove(e, budget.category, spent, budget.amount)}
                        onMouseLeave={handleBarLeave}
                      >
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            isOverBudget 
                              ? 'bg-gradient-to-r from-red-500 to-red-600' 
                              : percentage > 80
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                              : 'bg-gradient-to-r from-green-500 to-green-600'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                          onMouseMove={(e) => handleBarMouseMove(e, budget.category, spent, budget.amount)}
                        ></div>
                      </div>
                    </div>

                    {/* Status text */}
                    <div className={`text-xs font-medium ${
                      isOverBudget 
                        ? 'text-red-600' 
                        : percentage > 80
                        ? 'text-orange-600'
                        : 'text-green-600'
                    }`}>
                      {isOverBudget 
                        ? `Presupuesto mensual excedido (${Math.round(percentage)}%)`
                        : `Dentro del presupuesto mensual (${Math.round(percentage)}%)`
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Panel Derecho */}
        <div className="lg:col-span-1 space-y-6">
          {/* Formulario para agregar presupuesto */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <h3 className="text-blue-600 font-semibold mb-4">
              Agregar Presupuesto Mensual
            </h3>

            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <span>+</span>
                <span>Establecer Presupuesto</span>
              </button>
            ) : (
              <form onSubmit={handleAddBudget} className="space-y-3">
                <select
                  value={newBudget.category}
                  onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categories
                    .filter(cat => !budgets.some(b => b.category === cat))
                    .map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))
                  }
                </select>

                <input
                  type="number"
                  step="0.01"
                  placeholder="Presupuesto (€)"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget({...newBudget, amount: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />

                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Establecer Presupuesto
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setNewBudget({ category: '', amount: '' })
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Progreso del Gasto Total */}
          {budgets.length > 0 && (
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-blue-600">📊</span>
                <h3 className="font-semibold text-blue-600">
                  Progreso del Gasto Total
                </h3>
              </div>

              {/* Gráfico circular */}
              <div className="flex justify-center mb-4">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={progressPercentage > 100 ? "#ef4444" : progressPercentage > 80 ? "#f59e0b" : "#10b981"}
                      strokeWidth="3"
                      strokeDasharray={`${Math.min(progressPercentage, 100)}, 100`}
                      className="transition-all duration-300"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-800">
                      {progressPercentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Información del gasto vs presupuesto */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-gray-600">💰</span>
                  <span className="font-medium text-gray-800">Gasto vs. Presupuesto</span>
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  €{totalSpent.toFixed(2)} de €{totalBudget.toFixed(2)} ({progressPercentage}%)
                </div>
                
                <div className="flex justify-between items-center mt-3">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${
                      progressPercentage > 100 ? 'text-red-600' : 'text-orange-500'
                    }`}>
                      €{totalSpent.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">Gastado</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-lg font-bold ${
                      remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      €{Math.abs(remainingBudget).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {remainingBudget >= 0 ? 'Restante' : 'Excedido'}
                    </div>
                  </div>
                </div>

                {remainingBudget < totalBudget * 0.2 && remainingBudget > 0 && (
                  <div className="mt-3 text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
                    ⚠️ Te acercas al límite del presupuesto
                  </div>
                )}

                {remainingBudget < 0 && (
                  <div className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                    🚨 Has excedido tu presupuesto mensual
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tooltip */}
      <BudgetTooltip
        category={tooltip.category}
        transactions={transactions}
        spent={tooltip.spent}
        budget={tooltip.budget}
        isVisible={tooltip.isVisible}
        position={tooltip.position}
      />
    </div>
  )
}

export default Budgets