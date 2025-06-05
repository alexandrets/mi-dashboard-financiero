import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useExpenses } from '../hooks/useExpenses'
import { useAuth } from '../contexts/AuthContext'
import DonutChart from '../components/DonutChart'
import SavingsGoals from '../components/SavingsGoals'
import Budgets from '../components/Budgets'
import RecurringTransactions from '../components/RecurringTransactions'
import TrendsChart from '../components/TrendsChart'
import QuickTransactionForm from '../components/QuickTransactionForm'
import InstallPWA from '../components/InstallPWA'

// Componente para una tarjeta de estadística elegante
function StatCard({ title, value, isBalance = false }) {
  const getTextColor = () => {
    if (title === "Ingresos Totales") return "text-green-600"
    if (title === "Gastos Totales") return "text-red-600"
    if (isBalance) {
      return parseFloat(value) >= 0 ? "text-green-600" : "text-red-600"
    }
    return "text-blue-600"
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className={`text-4xl font-bold mb-4 ${getTextColor()}`}>
        €{value}
      </div>
      <div className="text-gray-500 text-sm">
        {title}
      </div>
    </div>
  )
}

function Dashboard() {
  const { currentUser, logout } = useAuth()
  const { transactions, loading, error, deleteExpense, totals, addExpense } = useExpenses()
  const [isQuickFormOpen, setIsQuickFormOpen] = useState(false)

  // Funciones del componente
  const handleDelete = async (transactionId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      try {
        await deleteExpense(transactionId)
        console.log('✅ Transacción eliminada:', transactionId)
      } catch (error) {
        console.error('❌ Error al eliminar:', error)
        alert('Error al eliminar transacción: ' + error.message)
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

  // NUEVO: Manejar cuando se agrega una transacción
  const handleTransactionAdded = (newTransaction) => {
    console.log('🎉 handleTransactionAdded ejecutado con:', newTransaction)
    console.log('🔄 Estado antes del cierre:', {
      transaccionesActuales: transactions.length,
      modalAbierto: isQuickFormOpen
    })
    
    setIsQuickFormOpen(false)
    
    // Forzar una actualización pequeña para asegurar re-render
    setTimeout(() => {
      console.log('🔄 Estado después del cierre:', {
        transaccionesNuevas: transactions.length,
        modalCerrado: !isQuickFormOpen
      })
    }, 500)
  }

  // NUEVO: Manejar cierre del modal
  const handleCloseModal = () => {
    console.log('❌ handleCloseModal ejecutado')
    console.log('🔄 Estado al cerrar modal:', {
      transacciones: transactions.length,
      modalEstaba: isQuickFormOpen
    })
    setIsQuickFormOpen(false)
  }

  // Debug - Estado inicial del Dashboard
  useEffect(() => {
    console.log('🏠 Dashboard montado con estado inicial:')
    console.log('  - Usuario:', currentUser?.email)
    console.log('  - Transacciones iniciales:', transactions.length)
    console.log('  - Loading:', loading)
    console.log('  - Error:', error)
  }, [])

  // NUEVO: Debug del estado del modal
  useEffect(() => {
    if (isQuickFormOpen) {
      console.log('🎭 Modal QuickTransactionForm MONTADO')
    } else {
      console.log('🎭 Modal QuickTransactionForm DESMONTADO')
    }
  }, [isQuickFormOpen])

  // Datos calculados
  const balance = totals.balance
  const topExpenseTransactions = transactions
    .filter(transaction => transaction.type === 'gasto' && transaction.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6) // Top 6 transacciones más costosas

  // Debug - Monitorear cambios y funciones disponibles
  useEffect(() => {
    console.log('🔄 Dashboard actualizado:')
    console.log('  - Total transacciones:', transactions.length)
    console.log('  - Modal abierto:', isQuickFormOpen)
    console.log('  - addExpense disponible:', !!addExpense)
    console.log('  - deleteExpense disponible:', !!deleteExpense)
    console.log('  - Transacciones:', transactions)
    
    // Verificar el hook useExpenses
    console.log('🎣 Hook useExpenses retorna:', {
      transactions: transactions?.length || 0,
      totals: !!totals,
      addExpense: typeof addExpense,
      deleteExpense: typeof deleteExpense,
      loading,
      error
    })
  }, [transactions, isQuickFormOpen, addExpense, deleteExpense, totals, loading, error])

  // Log de estado antes del render
  console.log('🎨 Renderizando Dashboard:', {
    transacciones: transactions.length,
    modalAbierto: isQuickFormOpen,
    usuario: currentUser?.email,
    loading,
    error
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-100 to-purple-200">
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full mx-auto mb-4 animate-pulse"></div>
            <p className="text-gray-700 text-lg">Cargando tu dashboard financiero...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-100 to-purple-200">
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl">
            <h3 className="text-lg font-bold mb-4">Error al cargar datos</h3>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Recargar página
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-100 to-purple-200">
      {/* Header Premium */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Dashboard Financiero
                </h1>
                <p className="text-blue-100">
                  Bienvenido, {currentUser?.email?.split('@')[0]}
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
            >
              <span>👋</span>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Estadísticas Elegantes */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 -mt-8 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Ingresos Totales" 
              value={totals.totalIncomes.toFixed(2)} 
            />
            <StatCard 
              title="Gastos Totales" 
              value={totals.totalExpenses.toFixed(2)} 
            />
            <StatCard 
              title="Balance" 
              value={balance.toFixed(2)} 
              isBalance={true}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Gráfico de Dona con Transacciones */}
          <div className="lg:col-span-2">
            <DonutChart 
              data={totals.expensesByCategory} 
              title="Gastos por Categoría"
              transactions={transactions}
            />
          </div>

          {/* Panel de Acciones */}
          <div className="lg:col-span-1 space-y-6">
            {/* Botón Nueva Transacción sin contenedor */}
            <button
              onClick={() => {
                console.log('🔓 Abriendo modal de transacción')
                setIsQuickFormOpen(true)
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
            >
              <span>💰</span>
              <span>Nueva Transacción</span>
            </button>

            {/* Transacciones Recientes - Con Scroll */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 text-sm">📋</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-800">
                    Recientes ({transactions.length})
                  </h3>
                </div>
                
                {transactions.length > 0 && (
                  <button 
                    onClick={() => {
                      console.log('🔓 Abriendo modal desde botón "Agregar"')
                      setIsQuickFormOpen(true)
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    ➕ Agregar
                  </button>
                )}
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-6">
                  <span className="text-2xl mb-2 block">📭</span>
                  <p className="text-gray-600 text-sm">
                    Sin transacciones
                  </p>
                  <button
                    onClick={() => {
                      console.log('🔓 Abriendo modal para primera transacción')
                      setIsQuickFormOpen(true)
                    }}
                    className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    ➕ Agregar primera transacción
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {transactions.map((transaction, index) => (
                    <div 
                      key={transaction.id} 
                      className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors border-l-4"
                      style={{
                        borderLeftColor: transaction.type === 'ingreso' ? '#10b981' : '#ef4444'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            transaction.type === 'ingreso' 
                              ? "bg-gradient-to-br from-green-50 to-green-100" 
                              : "bg-gradient-to-br from-red-50 to-red-100"
                          }`}>
                            <span className="text-sm">
                              {transaction.type === 'ingreso' ? '💰' : '💸'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {transaction.description || 'Sin descripción'}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span className={`px-2 py-1 rounded-full ${
                                transaction.type === 'ingreso' 
                                  ? "bg-green-100 text-green-700" 
                                  : "bg-red-100 text-red-700"
                              }`}>
                                {transaction.category}
                              </span>
                              <span>•</span>
                              <span>{new Date(transaction.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}</span>
                              {index === 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-blue-600 font-medium">Nuevo</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-bold ${
                            transaction.type === 'ingreso' ? "text-green-600" : "text-red-600"
                          }`}>
                            {transaction.type === 'ingreso' ? '+' : '-'}€{(transaction.amount || 0).toFixed(2)}
                          </span>
                          
                          <button 
                            onClick={() => handleDelete(transaction.id)}
                            className="w-6 h-6 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors"
                            title="Eliminar transacción"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 112 0v3a1 1 0 11-2 0V9zm4 0a1 1 0 112 0v3a1 1 0 11-2 0V9z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Módulo de Presupuestos */}
        <div className="mb-8 mt-5">
          <Budgets transactions={transactions} />
        </div>

        {/* Transacciones Recurrentes */}
        <div className="mb-8">
          <RecurringTransactions />
        </div>

        {/* Metas de Ahorro */}
        <div className="mb-8">
          <SavingsGoals />
        </div>

        {/* Top Transacciones de Gastos */}
        {topExpenseTransactions.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600">🏆</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Mayores Gastos
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {topExpenseTransactions.map((transaction, index) => (
                  <div key={transaction.id} className="bg-gradient-to-br from-white to-red-50 rounded-xl p-4 border border-red-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '💸'}
                      </span>
                      <span className="text-lg font-bold text-red-600">
                        €{transaction.amount.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <h3 className="text-base font-semibold text-gray-800 truncate mb-1">
                        {transaction.description || 'Sin descripción'}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          {transaction.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(transaction.date).toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Barra de progreso relativa al gasto más alto */}
                    <div className="mt-2">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-200"
                          style={{ 
                            width: `${(transaction.amount / topExpenseTransactions[0].amount) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <p className="text-xs mt-1 text-gray-600">
                        {((transaction.amount / topExpenseTransactions[0].amount) * 100).toFixed(1)}% del mayor gasto
                      </p>
                    </div>

                    {/* Botón para eliminar */}
                    <div className="mt-3 flex justify-end">
                      <button 
                        onClick={() => handleDelete(transaction.id)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                        title="Eliminar transacción"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 112 0v3a1 1 0 11-2 0V9zm4 0a1 1 0 112 0v3a1 1 0 11-2 0V9z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Estadística adicional */}
              {topExpenseTransactions.length > 0 && (
                <div className="mt-6 bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-red-800 mb-1">
                        📊 Análisis de Gastos Grandes
                      </h4>
                      <p className="text-xs text-red-700">
                        Estos {topExpenseTransactions.length} gastos representan €{topExpenseTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)} del total
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">
                        {((topExpenseTransactions.reduce((sum, t) => sum + t.amount, 0) / totals.totalExpenses) * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-red-600">del total gastado</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gráfico de Tendencias Temporales */}
        <div className="mb-8">
          <TrendsChart />
        </div>
      </div>

      {/* Modal de Transacción Rápida */}
      {isQuickFormOpen && (
        <>
          {console.log('🎭 Pasando props a QuickTransactionForm:', {
            isOpen: isQuickFormOpen,
            addExpense: typeof addExpense,
            addExpenseFunction: addExpense,
            onClose: typeof handleCloseModal,
            onTransactionAdded: typeof handleTransactionAdded
          })}
          <QuickTransactionForm 
            isOpen={isQuickFormOpen}
            onClose={handleCloseModal}
            onTransactionAdded={handleTransactionAdded}
            addExpense={addExpense}
            debug={true}
            debugMessage="Dashboard → QuickTransactionForm"
          />
        </>
      )}

      {/* Componente PWA */}
      <InstallPWA />
    </div>
  )
}

export default Dashboard