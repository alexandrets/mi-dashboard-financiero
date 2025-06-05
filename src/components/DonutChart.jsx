import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { CATEGORY_ICONS } from '../constants/Categories'

// Colores vibrantes para cada categoría
const COLORS = [
  '#FF6B6B', // Rojo vibrante
  '#4ECDC4', // Turquesa
  '#45B7D1', // Azul cielo
  '#96CEB4', // Verde menta
  '#FFEAA7', // Amarillo suave
  '#DDA0DD', // Lila
  '#98D8C8', // Verde agua
  '#F7DC6F', // Dorado
  '#BB8FCE', // Morado suave
  '#85C1E9', // Azul claro
  '#F8C471', // Naranja suave
  '#82E0AA'  // Verde claro
]

// Componente personalizado para el tooltip con transacciones
const CustomTooltip = ({ active, payload, transactions = [] }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    
    // Filtrar transacciones de esta categoría
    const categoryTransactions = transactions
      .filter(transaction => transaction.category === data.name && transaction.type === 'gasto')
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // Más recientes primero
      .slice(0, 5) // Máximo 5 transacciones

    return (
      <div 
        className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 max-w-xs"
        style={{ zIndex: 1000 }}
      >
        {/* Header del tooltip */}
        <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-gray-100">
          <span className="text-2xl">{CATEGORY_ICONS[data.name] || '📋'}</span>
          <div>
            <span className="font-semibold text-gray-800">{data.name}</span>
            <div className="text-lg font-bold" style={{ color: data.fill }}>
              €{data.value.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Lista de transacciones */}
        {categoryTransactions.length > 0 ? (
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-600 mb-2">
              Últimas transacciones:
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
            
            {transactions.filter(t => t.category === data.name && t.type === 'gasto').length > 5 && (
              <div className="text-xs text-gray-500 text-center pt-1 border-t border-gray-100">
                +{transactions.filter(t => t.category === data.name && t.type === 'gasto').length - 5} más
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-gray-500 text-center">
            No hay transacciones recientes
          </div>
        )}

        {/* Footer con porcentaje */}
        <div className="text-xs text-gray-600 text-center mt-3 pt-2 border-t border-gray-100">
          {data.percentage}% del total
        </div>
      </div>
    )
  }
  return null
}

// Componente personalizado para las etiquetas
const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null // No mostrar etiquetas para segmentos muy pequeños
  
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-sm font-bold drop-shadow-lg"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

function DonutChart({ data, title = "Gastos por Categoría", transactions = [] }) {
  // Preparar datos para el gráfico
  const chartData = Object.entries(data)
    .filter(([category, amount]) => amount > 0)
    .map(([category, amount], index) => ({
      name: category,
      value: amount,
      fill: COLORS[index % COLORS.length],
      percentage: ((amount / Object.values(data).reduce((a, b) => a + b, 0)) * 100).toFixed(1)
    }))
    .sort((a, b) => b.value - a.value) // Ordenar de mayor a menor

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">🍩</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl">📊</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No hay datos para mostrar
          </h3>
          <p className="text-gray-600">
            Agrega algunas transacciones para ver el gráfico
          </p>
        </div>
      </div>
    )
  }

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">🍩</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <p className="text-gray-500 text-sm">Total: €{total.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-500">Categorías</div>
          <div className="text-2xl font-bold text-gray-800">{chartData.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico */}
        <div className="relative">
          {/* Contenedor del gráfico con z-index controlado */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomLabel}
                  outerRadius={120}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.fill}
                      className="hover:opacity-80 cursor-pointer transition-opacity"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  content={(props) => <CustomTooltip {...props} transactions={transactions} />}
                  wrapperStyle={{ zIndex: 1000 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Centro del donut con información - z-index menor */}
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex: 0 }}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">
                €{total.toFixed(0)}
              </div>
              <div className="text-sm text-gray-500">
                Total gastado
              </div>
            </div>
          </div>
        </div>

        {/* Leyenda personalizada */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800 mb-4">Desglose por categoría</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {chartData.map((item, index) => (
              <div 
                key={item.name}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: item.fill }}
                  ></div>
                  <span className="text-xl">{CATEGORY_ICONS[item.name] || '📋'}</span>
                  <span className="font-medium text-gray-800">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-800">
                    €{item.value.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DonutChart