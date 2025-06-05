import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useExpenses } from '../hooks/useExpenses'

function RecurringTransactions() {
  const { currentUser } = useAuth()
  const { transactions, loading, error, addExpense, deleteExpense } = useExpenses()
  const [recurringTransactions, setRecurringTransactions] = useState([])
  const [showInactive, setShowInactive] = useState(false)

  // Filtrar transacciones recurrentes
  useEffect(() => {
    const recurring = transactions.filter(transaction => transaction.isRecurring)
    console.log('🔄 Transacciones recurrentes encontradas:', recurring)
    setRecurringTransactions(recurring)
  }, [transactions])

  // Función para calcular la próxima fecha según frecuencia
  const getNextDate = (lastDate, frequency) => {
    const date = new Date(lastDate)
    
    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1)
        break
      case 'weekly':
        date.setDate(date.getDate() + 7)
        break
      case 'monthly':
        date.setMonth(date.getMonth() + 1)
        break
      case 'quarterly':
        date.setMonth(date.getMonth() + 3)
        break
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1)
        break
      default:
        date.setMonth(date.getMonth() + 1)
    }
    
    return date.toISOString().split('T')[0]
  }

  // Función para obtener el texto de frecuencia
  const getFrequencyText = (frequency) => {
    const frequencies = {
      daily: 'Diario',
      weekly: 'Semanal',
      monthly: 'Mensual',
      quarterly: 'Trimestral',
      yearly: 'Anual'
    }
    return frequencies[frequency] || 'Mensual'
  }

  // Función para generar la próxima transacción
  const generateNextTransaction = async (recurringTransaction) => {
    try {
      const nextDate = getNextDate(recurringTransaction.date, recurringTransaction.recurringFrequency)
      
      const newTransaction = {
        ...recurringTransaction,
        id: undefined, // Nuevo ID se generará automáticamente
        date: nextDate,
        createdAt: new Date().toISOString(),
        generatedFrom: recurringTransaction.id // Referencia a la transacción original
      }
      
      console.log('🎯 Generando próxima transacción:', newTransaction)
      
      await addExpense(newTransaction)
      
      console.log('✅ Próxima transacción generada exitosamente')
      
    } catch (error) {
      console.error('❌ Error al generar próxima transacción:', error)
      alert('Error al generar próxima transacción: ' + error.message)
    }
  }

  // Función para desactivar transacción recurrente
  const deactivateRecurring = async (transactionId) => {
    if (window.confirm('¿Deseas desactivar esta transacción recurrente?')) {
      try {
        // Aquí deberías actualizar la transacción para marcarla como inactiva
        // Por ahora, la eliminamos
        await deleteExpense(transactionId)
        console.log('✅ Transacción recurrente desactivada')
      } catch (error) {
        console.error('❌ Error al desactivar:', error)
        alert('Error al desactivar transacción recurrente: ' + error.message)
      }
    }
  }

  // Función para verificar si es tiempo de generar la próxima transacción
  const isTimeForNext = (transaction) => {
    const today = new Date()
    const transactionDate = new Date(transaction.date)
    const nextDate = new Date(getNextDate(transaction.date, transaction.recurringFrequency))
    
    return today >= nextDate
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          <h3 className="font-bold mb-2">Error al cargar transacciones recurrentes</h3>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">🔄</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Transacciones Recurrentes
            </h2>
            <p className="text-gray-500 text-sm">
              {recurringTransactions.length} transacciones automáticas
            </p>
          </div>
        </div>

        {recurringTransactions.length > 0 && (
          <button
            onClick={() => setShowInactive(!showInactive)}
            className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {showInactive ? '👁️ Mostrar activas' : '👁️‍🗨️ Mostrar todas'}
          </button>
        )}
      </div>

      {/* Lista de transacciones recurrentes */}
      {recurringTransactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🔄</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            No hay transacciones recurrentes
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            Las transacciones que marques como recurrentes aparecerán aquí
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h4 className="font-medium text-blue-800 mb-2">💡 ¿Cómo crear transacciones recurrentes?</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Haz clic en "Nueva Transacción"</li>
              <li>• Activa la casilla "Transacción recurrente"</li>
              <li>• Selecciona la frecuencia (diaria, semanal, mensual, etc.)</li>
              <li>• ¡Listo! Aparecerá aquí para gestionar</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {recurringTransactions.map((transaction) => {
            const nextDate = getNextDate(transaction.date, transaction.recurringFrequency)
            const shouldGenerate = isTimeForNext(transaction)
            
            return (
              <div 
                key={transaction.id}
                className={`bg-gradient-to-r p-4 rounded-xl border-l-4 ${
                  transaction.type === 'ingreso'
                    ? 'from-green-50 to-green-100 border-green-500'
                    : 'from-red-50 to-red-100 border-red-500'
                } ${shouldGenerate ? 'ring-2 ring-yellow-300 ring-opacity-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Icono y tipo */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      transaction.type === 'ingreso' 
                        ? 'bg-green-200' 
                        : 'bg-red-200'
                    }`}>
                      <span className="text-xl">
                        {transaction.type === 'ingreso' ? '💰' : '💸'}
                      </span>
                    </div>

                    {/* Información principal */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-800">
                          {transaction.description}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'ingreso'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {transaction.category}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <span>🔄</span>
                          <span>{getFrequencyText(transaction.recurringFrequency)}</span>
                        </span>
                        
                        <span className="flex items-center space-x-1">
                          <span>📅</span>
                          <span>Última: {new Date(transaction.date).toLocaleDateString('es-ES')}</span>
                        </span>
                        
                        <span className="flex items-center space-x-1">
                          <span>⏭️</span>
                          <span>Próxima: {new Date(nextDate).toLocaleDateString('es-ES')}</span>
                        </span>
                      </div>

                      {shouldGenerate && (
                        <div className="mt-2 bg-yellow-100 border border-yellow-300 rounded-lg p-2">
                          <span className="text-yellow-800 text-xs font-medium">
                            ⚡ Es momento de generar la próxima transacción
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Monto */}
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        transaction.type === 'ingreso' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'ingreso' ? '+' : '-'}€{(transaction.amount || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex items-center space-x-2 ml-4">
                    {shouldGenerate && (
                      <button
                        onClick={() => generateNextTransaction(transaction)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                      >
                        <span>⚡</span>
                        <span>Generar</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => generateNextTransaction(transaction)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                      title="Generar próxima transacción manualmente"
                    >
                      <span>➕</span>
                      <span>Crear</span>
                    </button>
                    
                    <button
                      onClick={() => deactivateRecurring(transaction.id)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                      title="Desactivar transacción recurrente"
                    >
                      <span>🛑</span>
                      <span>Parar</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Estadísticas */}
      {recurringTransactions.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {recurringTransactions.length}
            </div>
            <div className="text-blue-700 text-sm">
              Transacciones activas
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {recurringTransactions.filter(t => t.type === 'ingreso').length}
            </div>
            <div className="text-green-700 text-sm">
              Ingresos recurrentes
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {recurringTransactions.filter(t => t.type === 'gasto').length}
            </div>
            <div className="text-red-700 text-sm">
              Gastos recurrentes
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecurringTransactions