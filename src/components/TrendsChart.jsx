import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const TrendsChart = ({ ingresos = [], gastos = [] }) => {
  const [chartType, setChartType] = useState('line'); // 'line' o 'area'
  const [timeRange, setTimeRange] = useState('6m'); // '1m', '3m', '6m', '1y'

  // Función para obtener datos agrupados por mes
  const getMonthlyData = () => {
    const monthlyData = {};
    const now = new Date();
    const monthsToShow = timeRange === '1m' ? 1 : timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : 12;

    // Inicializar los últimos meses
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
      
      monthlyData[key] = {
        mes: monthName,
        ingresos: 0,
        gastos: 0,
        balance: 0,
        fecha: date
      };
    }

    // Agregar ingresos
    ingresos.forEach(ingreso => {
      const date = new Date(ingreso.fecha);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[key]) {
        monthlyData[key].ingresos += ingreso.monto;
      }
    });

    // Agregar gastos
    gastos.forEach(gasto => {
      const date = new Date(gasto.fecha);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[key]) {
        monthlyData[key].gastos += Math.abs(gasto.monto);
      }
    });

    // Calcular balance
    Object.keys(monthlyData).forEach(key => {
      monthlyData[key].balance = monthlyData[key].ingresos - monthlyData[key].gastos;
    });

    return Object.values(monthlyData).sort((a, b) => a.fecha - b.fecha);
  };

  const data = getMonthlyData();

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="capitalize">{entry.dataKey}:</span>
              <span className="font-bold">
                €{Math.abs(entry.value).toFixed(2)}
                {entry.dataKey === 'balance' && (
                  <span className={entry.value >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {entry.value >= 0 ? ' 📈' : ' 📉'}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Calcular estadísticas
  const stats = {
    totalIngresos: data.reduce((sum, item) => sum + item.ingresos, 0),
    totalGastos: data.reduce((sum, item) => sum + item.gastos, 0),
    promedioIngresos: data.reduce((sum, item) => sum + item.ingresos, 0) / data.length,
    promedioGastos: data.reduce((sum, item) => sum + item.gastos, 0) / data.length,
    mejorMes: data.reduce((best, current) => current.balance > best.balance ? current : best, data[0]),
    peorMes: data.reduce((worst, current) => current.balance < worst.balance ? current : worst, data[0])
  };

  const formatYAxis = (value) => {
    if (value >= 1000) {
      return `€${(value / 1000).toFixed(1)}k`;
    }
    return `€${value}`;
  };

  if (data.length === 0 || data.every(item => item.ingresos === 0 && item.gastos === 0)) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span>📈</span>
          Tendencias Financieras
        </h3>
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">📈</div>
          <p className="text-lg">No hay datos suficientes</p>
          <p className="text-sm">Agrega más transacciones para ver las tendencias</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      {/* Header con controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span>📈</span>
          Tendencias Financieras
        </h3>
        
        <div className="flex gap-2">
          {/* Selector de rango temporal */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { key: '1m', label: '1M' },
              { key: '3m', label: '3M' },
              { key: '6m', label: '6M' },
              { key: '1y', label: '1A' }
            ].map(range => (
              <button
                key={range.key}
                onClick={() => setTimeRange(range.key)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  timeRange === range.key 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Selector de tipo de gráfico */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                chartType === 'line' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📊 Líneas
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                chartType === 'area' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🎯 Áreas
            </button>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="mes" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={formatYAxis}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="ingresos" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                name="Ingresos"
              />
              <Line 
                type="monotone" 
                dataKey="gastos" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
                name="Gastos"
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#3b82f6" 
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                name="Balance"
              />
            </LineChart>
          ) : (
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="mes" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={formatYAxis}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="ingresos" 
                stackId="1"
                stroke="#10b981" 
                fill="#10b981"
                fillOpacity={0.6}
                name="Ingresos"
              />
              <Area 
                type="monotone" 
                dataKey="gastos" 
                stackId="2"
                stroke="#ef4444" 
                fill="#ef4444"
                fillOpacity={0.6}
                name="Gastos"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Estadísticas resumidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm text-green-600 font-medium">💰 Promedio Ingresos</div>
          <div className="text-lg font-bold text-green-700">€{stats.promedioIngresos.toFixed(0)}</div>
        </div>
        
        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="text-sm text-red-600 font-medium">💸 Promedio Gastos</div>
          <div className="text-lg font-bold text-red-700">€{stats.promedioGastos.toFixed(0)}</div>
        </div>
        
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600 font-medium">📈 Mejor Mes</div>
          <div className="text-lg font-bold text-blue-700">{stats.mejorMes?.mes}</div>
          <div className="text-xs text-blue-600">€{stats.mejorMes?.balance.toFixed(0)}</div>
        </div>
        
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-sm text-purple-600 font-medium">📊 Tendencia</div>
          <div className="text-lg font-bold text-purple-700">
            {data.length > 1 && data[data.length - 1].balance > data[0].balance ? '📈 Positiva' : '📉 Mejorando'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendsChart;