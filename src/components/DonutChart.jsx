import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const DonutChart = ({ gastosPorCategoria, totalGastos }) => {
  // Transformar datos para Recharts
  const data = Object.entries(gastosPorCategoria || {}).map(([categoria, monto]) => ({
    name: categoria,
    value: monto,
    percentage: ((monto / totalGastos) * 100).toFixed(1)
  }));

  // Colores modernos para cada categoría
  const COLORS = {
    'alimentacion': '#FF6B6B',    // Rojo suave
    'transporte': '#4ECDC4',      // Turquesa
    'entretenimiento': '#A8E6CF', // Verde menta
    'servicios': '#FFD93D',       // Amarillo
    'salud': '#6BCF7F',          // Verde
    'otros': '#95A5A6',          // Gris
    'vivienda': '#3498DB',       // Azul
    'educacion': '#E74C3C',      // Rojo
    'ropa': '#9B59B6',           // Púrpura
    'tecnologia': '#F39C12'      // Naranja
  };

  // Función para obtener color por categoría
  const getColor = (categoria) => COLORS[categoria] || '#95A5A6';

  // Emojis por categoría
  const getEmoji = (categoria) => {
    const emojis = {
      'alimentacion': '🍕',
      'transporte': '🚗', 
      'entretenimiento': '🎬',
      'servicios': '⚡',
      'salud': '🏥',
      'otros': '📦',
      'vivienda': '🏠',
      'educacion': '📚',
      'ropa': '👕',
      'tecnologia': '💻'
    };
    return emojis[categoria] || '📦';
  };

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{getEmoji(data.payload.name)}</span>
            <span className="font-medium capitalize">{data.payload.name}</span>
          </div>
          <p className="text-sm text-gray-600">
            <span className="font-bold">€{data.value.toFixed(2)}</span>
            <span className="ml-2 text-gray-500">({data.payload.percentage}%)</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Label personalizado dentro del gráfico
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // No mostrar labels para valores muy pequeños
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Componente de leyenda personalizada
  const CustomLegend = ({ payload }) => (
    <div className="grid grid-cols-2 gap-2 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div 
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          ></div>
          <span className="text-xs">{getEmoji(entry.value)}</span>
          <span className="capitalize text-gray-700 truncate">
            {entry.value}
          </span>
          <span className="text-gray-500 ml-auto">
            {entry.payload.percentage}%
          </span>
        </div>
      ))}
    </div>
  );

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span>📊</span>
          Gastos por Categoría
        </h3>
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-lg">No hay gastos registrados</p>
          <p className="text-sm">¡Agrega tu primer gasto para ver el análisis!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span>📊</span>
        Gastos por Categoría
      </h3>
      
      <div className="relative">
        {/* Gráfico de dona */}
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={100}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getColor(entry.name)}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Total en el centro */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">
              €{totalGastos.toFixed(0)}
            </div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
        </div>
      </div>

      {/* Leyenda personalizada */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Desglose detallado:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {data
            .sort((a, b) => b.value - a.value)
            .map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getColor(entry.name) }}
                  ></div>
                  <span className="text-xs">{getEmoji(entry.name)}</span>
                  <span className="text-sm font-medium capitalize">{entry.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">€{entry.value.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">{entry.percentage}%</div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">📈 Insights</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Categoría principal:</span>
            <div className="font-medium text-blue-800">
              {getEmoji(data[0]?.name)} {data[0]?.name} ({data[0]?.percentage}%)
            </div>
          </div>
          <div>
            <span className="text-blue-700">Promedio por categoría:</span>
            <div className="font-medium text-blue-800">
              €{(totalGastos / data.length).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonutChart;