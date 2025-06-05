import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useExpenses } from '../hooks/useExpenses'

// Tooltip personalizado para la evolución del saldo
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
        <div className="text-sm font-medium text-gray-800 mb-2">
          {data.date}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Saldo disponible:</span>
            <span className={`text-lg font-bold ${
              data.balance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              €{data.balance.toFixed(2)}
            </span>
          </div>
          {data.transaction && (
            <div className="pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Último movimiento:</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700 truncate max-w-32">
                  {data.transaction.description}
                </span>
                <span className={`text-xs font-bold ${
                  data.transaction.type === 'ingreso' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {data.transaction.type === 'ingreso' ? '+' : '-'}€{data.transaction.amount.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
  return null
}

function TrendsChart() {
  const { transactions, loading, error } = useExpenses()

  // Calcular la evolución del saldo día a día
  const calculateBalanceEvolution = () => {
    if (transactions.length === 0) return []

    // Ordenar transacciones por fecha
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date))
    
    // Calcular balance acumulativo
    let runningBalance = 0
    const balanceData = []
    
    // Agrupar transacciones por día
    const transactionsByDay = {}
    sortedTransactions.forEach(transaction => {
      const dateKey = new Date(transaction.date).toDateString()
      if (!transactionsByDay[dateKey]) {
        transactionsByDay[dateKey] = []
      }
      transactionsByDay[dateKey].push(transaction)
    })

    // Calcular balance para cada día con transacciones
    Object.keys(transactionsByDay).forEach(dateKey => {
      const dayTransactions = transactionsByDay[dateKey]
      let dayBalance = runningBalance
      
      dayTransactions.forEach(transaction => {
        if (transaction.type === 'ingreso') {
          dayBalance += transaction.amount
        } else {
          dayBalance -= transaction.amount
        }
      })

      const date = new Date(dateKey)
      balanceData.push({
        date: date.toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit' 
        }),
        fullDate: date,
        balance: dayBalance,
        transaction: dayTransactions[dayTransactions.length - 1] // Última transacción del día
      })

      runningBalance = dayBalance
    })

    return balanceData.slice(-30) // Últimos 30 puntos de datos
  }

  const balanceData = calculateBalanceEvolution()

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || balanceData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">📈</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            Evolución del Saldo
          </h2>
        </div>
        
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl">📊</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No hay suficientes datos
          </h3>
          <p className="text-gray-600">
            Agrega más transacciones para ver la evolución de tu saldo
          </p>
        </div>
      </div>
    )
  }

  const currentBalance = balanceData[balanceData.length - 1]?.balance || 0
  const previousBalance = balanceData[balanceData.length - 2]?.balance || currentBalance
  const balanceChange = currentBalance - previousBalance
  const isPositiveChange = balanceChange >= 0

  // Determinar el color del área basado en la tendencia general
  const firstBalance = balanceData[0]?.balance || 0
  const lastBalance = currentBalance
  const overallTrend = lastBalance >= firstBalance

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">📈</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Evolución del Saldo
            </h2>
            <p className="text-gray-500 text-sm">
              Últimos {balanceData.length} movimientos
            </p>
          </div>
        </div>
        
        {/* Indicadores de tendencia */}
        <div className="text-right">
          <div className={`text-2xl font-bold ${
            currentBalance >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            €{currentBalance.toFixed(2)}
          </div>
          <div className={`text-sm flex items-center justify-end space-x-1 ${
            isPositiveChange ? 'text-green-600' : 'text-red-600'
          }`}>
            <span>{isPositiveChange ? '↗️' : '↘️'}</span>
            <span>
              {isPositiveChange ? '+' : ''}€{balanceChange.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={balanceData}
            margin={{
              top: 10,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop 
                  offset="5%" 
                  stopColor={overallTrend ? "#10b981" : "#ef4444"} 
                  stopOpacity={0.3}
                />
                <stop 
                  offset="95%" 
                  stopColor={overallTrend ? "#10b981" : "#ef4444"} 
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={(value) => `€${value.toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="balance"
              stroke={overallTrend ? "#10b981" : "#ef4444"}
              strokeWidth={3}
              fill="url(#balanceGradient)"
              dot={{
                r: 4,
                fill: overallTrend ? "#10b981" : "#ef4444",
                strokeWidth: 2,
                stroke: "#ffffff"
              }}
              activeDot={{
                r: 6,
                fill: overallTrend ? "#059669" : "#dc2626",
                strokeWidth: 2,
                stroke: "#ffffff"
              }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Línea de referencia en 0 */}
        {Math.min(...balanceData.map(d => d.balance)) < 0 && (
          <div className="absolute inset-0 pointer-events-none">
            <div 
              className="absolute w-full border-t border-dashed border-gray-400"
              style={{ 
                top: `${((Math.max(...balanceData.map(d => d.balance)) - 0) / 
                  (Math.max(...balanceData.map(d => d.balance)) - Math.min(...balanceData.map(d => d.balance)))) * 100}%` 
              }}
            ></div>
          </div>
        )}
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="text-blue-600 text-sm font-medium mb-1">💰 Saldo Actual</div>
          <div className={`text-lg font-bold ${
            currentBalance >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            €{currentBalance.toFixed(2)}
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="text-green-600 text-sm font-medium mb-1">📈 Saldo Máximo</div>
          <div className="text-lg font-bold text-green-600">
            €{Math.max(...balanceData.map(d => d.balance)).toFixed(2)}
          </div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
          <div className="text-red-600 text-sm font-medium mb-1">📉 Saldo Mínimo</div>
          <div className="text-lg font-bold text-red-600">
            €{Math.min(...balanceData.map(d => d.balance)).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Análisis de tendencia */}
      <div className={`mt-4 p-3 rounded-lg border ${
        overallTrend 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className={`text-sm font-medium ${
          overallTrend ? 'text-green-800' : 'text-red-800'
        }`}>
          {overallTrend ? '✅ Tendencia positiva' : '⚠️ Tendencia descendente'}
        </div>
        <div className={`text-xs mt-1 ${
          overallTrend ? 'text-green-700' : 'text-red-700'
        }`}>
          {overallTrend 
            ? 'Tu saldo ha mejorado en el período mostrado. ¡Sigue así!'
            : 'Tu saldo ha disminuido. Considera revisar tus gastos.'
          }
        </div>
      </div>
    </div>
  )
}

export default TrendsChart