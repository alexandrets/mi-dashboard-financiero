import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';

// Contexto y componentes de auth
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Budgets from './components/Budgets';
import SavingsGoals from './components/SavingsGoals';

// Hook mejorado para localStorage con sincronización automática
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new CustomEvent('localStorageChange', {
        detail: { key, value }
      }));
      console.log(`✅ LocalStorage updated: ${key}`, value);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.detail.key === key) {
        console.log(`🔄 Syncing localStorage: ${key}`, e.detail.value);
        setStoredValue(e.detail.value);
      }
    };

    const handleNativeStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue);
          console.log(`🔄 Native storage change: ${key}`, newValue);
          setStoredValue(newValue);
        } catch (error) {
          console.error(`Error parsing localStorage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('localStorageChange', handleStorageChange);
    window.addEventListener('storage', handleNativeStorageChange);

    return () => {
      window.removeEventListener('localStorageChange', handleStorageChange);
      window.removeEventListener('storage', handleNativeStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
};

// Hook para detectar el contexto de visualización
const useViewContext = () => {
  const [context, setContext] = useState({
    isMobile: false,
    isPWA: false,
    screenSize: 'desktop'
  });

  useEffect(() => {
    const checkContext = () => {
      const isMobile = window.innerWidth < 768;
      const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                    window.navigator.standalone === true;
      
      let screenSize = 'desktop';
      if (window.innerWidth < 640) screenSize = 'mobile';
      else if (window.innerWidth < 1024) screenSize = 'tablet';

      setContext({ isMobile, isPWA, screenSize });
    };

    checkContext();
    window.addEventListener('resize', checkContext);
    return () => window.removeEventListener('resize', checkContext);
  }, []);

  return context;
};

// Datos de ejemplo para demostración
const datosEjemplo = {
  ingresos: [
    { id: 1, descripcion: 'Salario Enero', monto: 3500, fecha: '2024-01-31', categoria: 'trabajo' },
    { id: 2, descripcion: 'Freelance Web', monto: 800, fecha: '2024-01-25', categoria: 'freelance' },
    { id: 3, descripcion: 'Dividendos', monto: 150, fecha: '2024-01-20', categoria: 'inversiones' }
  ],
  gastos: [
    { id: 4, descripcion: 'Supermercado', monto: -120, fecha: '2024-01-30', categoria: 'alimentacion' },
    { id: 5, descripcion: 'Gasolina', monto: -60, fecha: '2024-01-29', categoria: 'transporte' },
    { id: 6, descripcion: 'Netflix', monto: -15, fecha: '2024-01-28', categoria: 'entretenimiento' },
    { id: 7, descripcion: 'Electricidad', monto: -85, fecha: '2024-01-27', categoria: 'servicios' }
  ]
};

// Función para convertir transacciones al formato del componente Budgets
const convertTransactionsForBudgets = (ingresos, gastos) => {
  const allTransactions = [
    ...ingresos.map(ingreso => ({
      id: ingreso.id,
      type: 'ingreso',
      description: ingreso.descripcion,
      amount: ingreso.monto,
      date: ingreso.fecha,
      category: ingreso.categoria || 'Otros'
    })),
    ...gastos.map(gasto => ({
      id: gasto.id,
      type: 'gasto', 
      description: gasto.descripcion,
      amount: Math.abs(gasto.monto), // Convertir a positivo para el componente Budgets
      date: gasto.fecha,
      category: gasto.categoria || 'Otros'
    }))
  ];
  
  return allTransactions;
};

// Componente ProtectedRoute
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

// Selector de vista manual
const ViewToggle = ({ currentView, onViewChange, context }) => (
  <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
    <div className="flex gap-2">
      <button
        onClick={() => onViewChange('web')}
        className={`p-2 rounded-lg transition-colors ${
          currentView === 'web' 
            ? 'bg-blue-500 text-white' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        title="Vista Web/Desktop"
      >
        🖥️
      </button>
      <button
        onClick={() => onViewChange('mobile')}
        className={`p-2 rounded-lg transition-colors ${
          currentView === 'mobile' 
            ? 'bg-blue-500 text-white' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        title="Vista Móvil/App"
      >
        📱
      </button>
    </div>
    <div className="text-xs text-gray-500 mt-1 text-center">
      {context.isPWA ? 'PWA' : 'Web'} • {context.screenSize}
    </div>
  </div>
);

// Botón de logout
const LogoutButton = () => {
  const { logout, currentUser } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="fixed top-4 left-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <span>👤</span>
          <span>{currentUser?.email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          🚪 Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

// ===========================================
// VISTA WEB/DESKTOP
// ===========================================

const WebDashboard = ({ ingresos, setIngresos, gastos, setGastos }) => {
  const [nuevoIngreso, setNuevoIngreso] = useState({ 
    descripcion: '', 
    monto: '', 
    categoria: 'trabajo',
    fecha: new Date().toISOString().split('T')[0]
  });
  
  const [nuevoGasto, setNuevoGasto] = useState({ 
    descripcion: '', 
    monto: '', 
    categoria: 'alimentacion',
    fecha: new Date().toISOString().split('T')[0]
  });

  const [mostrarFormIngreso, setMostrarFormIngreso] = useState(false);
  const [mostrarFormGasto, setMostrarFormGasto] = useState(false);

  // Cálculos
  const totalIngresos = ingresos.reduce((sum, item) => sum + item.monto, 0);
  const totalGastos = Math.abs(gastos.reduce((sum, item) => sum + item.monto, 0));
  const balance = totalIngresos - totalGastos;

  // Funciones para agregar transacciones
  const agregarIngreso = () => {
    if (nuevoIngreso.descripcion && nuevoIngreso.monto && nuevoIngreso.fecha) {
      const nuevo = {
        id: Date.now(),
        descripcion: nuevoIngreso.descripcion,
        monto: parseFloat(nuevoIngreso.monto),
        fecha: nuevoIngreso.fecha,
        categoria: nuevoIngreso.categoria
      };
      setIngresos([nuevo, ...ingresos]);
      setNuevoIngreso({ descripcion: '', monto: '', categoria: 'trabajo', fecha: new Date().toISOString().split('T')[0] });
      setMostrarFormIngreso(false);
    }
  };

  const agregarGasto = () => {
    if (nuevoGasto.descripcion && nuevoGasto.monto && nuevoGasto.fecha) {
      const nuevo = {
        id: Date.now(),
        descripcion: nuevoGasto.descripcion,
        monto: -Math.abs(parseFloat(nuevoGasto.monto)),
        fecha: nuevoGasto.fecha,
        categoria: nuevoGasto.categoria
      };
      setGastos([nuevo, ...gastos]);
      setNuevoGasto({ descripcion: '', monto: '', categoria: 'alimentacion', fecha: new Date().toISOString().split('T')[0] });
      setMostrarFormGasto(false);
    }
  };

  const eliminarTransaccion = (id, tipo) => {
    if (tipo === 'ingreso') {
      setIngresos(ingresos.filter(item => item.id !== id));
    } else {
      setGastos(gastos.filter(item => item.id !== id));
    }
  };

  // Gastos por categoría para los gráficos
  const gastosPorCategoria = gastos.reduce((acc, gasto) => {
    acc[gasto.categoria] = (acc[gasto.categoria] || 0) + Math.abs(gasto.monto);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-100 to-purple-200">
      {/* Header */}
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
                  Tu gestión financiera personal
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Estadísticas principales */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 -mt-8 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="text-4xl font-bold mb-4 text-green-600">
                €{totalIngresos.toFixed(2)}
              </div>
              <div className="text-gray-500 text-sm">
                📈 Ingresos Totales
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="text-4xl font-bold mb-4 text-red-600">
                €{totalGastos.toFixed(2)}
              </div>
              <div className="text-gray-500 text-sm">
                📉 Gastos Totales
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className={`text-4xl font-bold mb-4 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                €{balance.toFixed(2)}
              </div>
              <div className="text-gray-500 text-sm">
                ⚖️ Balance
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Gráficos mejorados */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Gráfico de dona - Gastos por categoría */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">🍩 Gastos por Categoría</h3>
              
              {Object.keys(gastosPorCategoria).length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gráfico de dona */}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(gastosPorCategoria).map(([categoria, monto]) => ({
                            name: categoria,
                            value: monto,
                            emoji: {
                              'alimentacion': '🍕',
                              'transporte': '🚗', 
                              'entretenimiento': '🎬',
                              'servicios': '⚡',
                              'salud': '🏥',
                              'otros': '📦'
                            }[categoria] || '📦'
                          }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {Object.entries(gastosPorCategoria).map(([categoria], index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={
                                categoria === 'alimentacion' ? '#f97316' :
                                categoria === 'transporte' ? '#3b82f6' :
                                categoria === 'entretenimiento' ? '#8b5cf6' :
                                categoria === 'servicios' ? '#06b6d4' :
                                categoria === 'salud' ? '#10b981' :
                                '#6b7280'
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`€${value.toFixed(2)}`, 'Gasto']}
                          labelFormatter={(label) => `${
                            {
                              'alimentacion': '🍕',
                              'transporte': '🚗',
                              'entretenimiento': '🎬', 
                              'servicios': '⚡',
                              'salud': '🏥',
                              'otros': '📦'
                            }[label] || '📦'
                          } ${label.charAt(0).toUpperCase() + label.slice(1)}`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Leyenda con detalles */}
                  <div className="space-y-3">
                    {Object.entries(gastosPorCategoria)
                      .sort(([,a], [,b]) => b - a)
                      .map(([categoria, monto]) => {
                        const porcentaje = (monto / totalGastos) * 100;
                        const emoji = {
                          'alimentacion': '🍕',
                          'transporte': '🚗',
                          'entretenimiento': '🎬',
                          'servicios': '⚡',
                          'salud': '🏥',
                          'otros': '📦'
                        }[categoria] || '📦';
                        
                        const color = 
                          categoria === 'alimentacion' ? '#f97316' :
                          categoria === 'transporte' ? '#3b82f6' :
                          categoria === 'entretenimiento' ? '#8b5cf6' :
                          categoria === 'servicios' ? '#06b6d4' :
                          categoria === 'salud' ? '#10b981' :
                          '#6b7280';
                        
                        return (
                          <div key={categoria} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: color }}
                              ></div>
                              <span className="font-medium capitalize flex items-center gap-2">
                                <span>{emoji}</span>
                                {categoria}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-800">€{monto.toFixed(2)}</div>
                              <div className="text-sm text-gray-500">{porcentaje.toFixed(1)}%</div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">🍩</div>
                  <p>No hay gastos registrados aún</p>
                  <p className="text-sm">¡Agrega tu primer gasto para ver el análisis!</p>
                </div>
              )}
            </div>

            {/* Gráfico de barras - Comparación Ingresos vs Gastos */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">📊 Comparación Mensual</h3>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        mes: 'Este Mes',
                        ingresos: totalIngresos,
                        gastos: totalGastos,
                        balance: balance
                      }
                    ]}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mes" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value, name) => [
                        `€${value.toFixed(2)}`, 
                        name === 'ingresos' ? '📈 Ingresos' : 
                        name === 'gastos' ? '📉 Gastos' : '⚖️ Balance'
                      ]}
                      labelStyle={{ color: '#374151' }}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-green-600 font-bold">📈 Ingresos</div>
                  <div className="text-2xl font-bold text-green-700">€{totalIngresos.toFixed(2)}</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-red-600 font-bold">📉 Gastos</div>
                  <div className="text-2xl font-bold text-red-700">€{totalGastos.toFixed(2)}</div>
                </div>
                <div className={`p-3 rounded-lg ${balance >= 0 ? 'bg-blue-50' : 'bg-yellow-50'}`}>
                  <div className={`font-bold ${balance >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>
                    ⚖️ Balance
                  </div>
                  <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-700' : 'text-yellow-700'}`}>
                    €{balance.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel de acciones */}
          <div className="lg:col-span-1 space-y-6">
            {/* Botones de acción */}
            <div className="space-y-3">
              <button
                onClick={() => setMostrarFormIngreso(!mostrarFormIngreso)}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
              >
                <span>📈</span>
                <span>Nuevo Ingreso</span>
              </button>

              <button
                onClick={() => setMostrarFormGasto(!mostrarFormGasto)}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
              >
                <span>📉</span>
                <span>Nuevo Gasto</span>
              </button>
            </div>

            {/* Formulario de Ingreso */}
            {mostrarFormIngreso && (
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <h4 className="font-semibold text-green-800 mb-3">➕ Agregar Ingreso</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Descripción"
                    value={nuevoIngreso.descripcion}
                    onChange={(e) => setNuevoIngreso({...nuevoIngreso, descripcion: e.target.value})}
                    className="w-full p-2 border border-green-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Monto"
                    value={nuevoIngreso.monto}
                    onChange={(e) => setNuevoIngreso({...nuevoIngreso, monto: e.target.value})}
                    className="w-full p-2 border border-green-300 rounded-lg text-sm"
                  />
                  <select
                    value={nuevoIngreso.categoria}
                    onChange={(e) => setNuevoIngreso({...nuevoIngreso, categoria: e.target.value})}
                    className="w-full p-2 border border-green-300 rounded-lg text-sm"
                  >
                    <option value="trabajo">💼 Trabajo</option>
                    <option value="freelance">💻 Freelance</option>
                    <option value="inversiones">📈 Inversiones</option>
                    <option value="otros">📦 Otros</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={agregarIngreso}
                      className="flex-1 bg-green-600 text-white p-2 rounded-lg text-sm hover:bg-green-700"
                    >
                      ✅ Agregar
                    </button>
                    <button
                      onClick={() => setMostrarFormIngreso(false)}
                      className="px-4 bg-gray-500 text-white p-2 rounded-lg text-sm hover:bg-gray-600"
                    >
                      ❌ Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Formulario de Gasto */}
            {mostrarFormGasto && (
              <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                <h4 className="font-semibold text-red-800 mb-3">➖ Agregar Gasto</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Descripción"
                    value={nuevoGasto.descripcion}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, descripcion: e.target.value})}
                    className="w-full p-2 border border-red-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Monto"
                    value={nuevoGasto.monto}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, monto: e.target.value})}
                    className="w-full p-2 border border-red-300 rounded-lg text-sm"
                  />
                  <select
                    value={nuevoGasto.categoria}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, categoria: e.target.value})}
                    className="w-full p-2 border border-red-300 rounded-lg text-sm"
                  >
                    <option value="alimentacion">🍕 Alimentación</option>
                    <option value="transporte">🚗 Transporte</option>
                    <option value="entretenimiento">🎬 Entretenimiento</option>
                    <option value="servicios">⚡ Servicios</option>
                    <option value="salud">🏥 Salud</option>
                    <option value="otros">📦 Otros</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={agregarGasto}
                      className="flex-1 bg-red-600 text-white p-2 rounded-lg text-sm hover:bg-red-700"
                    >
                      ✅ Agregar
                    </button>
                    <button
                      onClick={() => setMostrarFormGasto(false)}
                      className="px-4 bg-gray-500 text-white p-2 rounded-lg text-sm hover:bg-gray-600"
                    >
                      ❌ Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Transacciones Recientes */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>📋</span>
                Transacciones Recientes
              </h3>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {[...ingresos, ...gastos]
                  .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                  .slice(0, 8)
                  .map((transaccion) => (
                    <div 
                      key={transaccion.id} 
                      className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors border-l-4"
                      style={{
                        borderLeftColor: transaccion.monto > 0 ? '#10b981' : '#ef4444'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {transaccion.monto > 0 ? '💰' : '💸'} {transaccion.descripcion}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span className={`px-2 py-1 rounded-full ${
                              transaccion.monto > 0 
                                ? "bg-green-100 text-green-700" 
                                : "bg-red-100 text-red-700"
                            }`}>
                              {transaccion.categoria}
                            </span>
                            <span>•</span>
                            <span>{new Date(transaccion.fecha).toLocaleDateString('es-ES')}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-bold ${
                            transaccion.monto > 0 ? "text-green-600" : "text-red-600"
                          }`}>
                            {transaccion.monto > 0 ? '+' : ''}€{Math.abs(transaccion.monto).toFixed(2)}
                          </span>
                          
                          <button 
                            onClick={() => eliminarTransaccion(transaccion.id, transaccion.monto > 0 ? 'ingreso' : 'gasto')}
                            className="w-6 h-6 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors text-xs"
                            title="Eliminar transacción"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Módulo de Presupuestos integrado */}
        <div className="mt-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span>💰</span>
              Gestión de Presupuestos
            </h3>
            <Budgets transactions={convertTransactionsForBudgets(ingresos, gastos)} />
          </div>
        </div>

        {/* Módulo de Metas de Ahorro integrado */}
        <div className="mt-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span>🎯</span>
              Metas de Ahorro
            </h3>
            <SavingsGoals />
          </div>
        </div>
      </div>
    </div>
  );
};

// ===========================================
// VISTA MÓVIL (mismos componentes del código anterior)
// ===========================================

const BottomNavigation = ({ activeScreen, setActiveScreen }) => {
  const navItems = [
    { id: 'dashboard', icon: '🏠', label: 'Inicio' },
    { id: 'ingresos', icon: '📈', label: 'Ingresos' },
    { id: 'gastos', icon: '📉', label: 'Gastos' },
    { id: 'presupuestos', icon: '💰', label: 'Presupuestos' },
    { id: 'estadisticas', icon: '📊', label: 'Stats' },
    { id: 'perfil', icon: '👤', label: 'Perfil' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-50 shadow-lg">
      <div className="flex justify-around">
        {navItems.map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveScreen(id)}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
              activeScreen === id 
                ? 'text-blue-600 bg-blue-50 scale-105' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg">{icon}</span>
            <span className="text-xs mt-1 font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const AppHeader = ({ title, showBack, onBack }) => (
  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-4 flex items-center shadow-lg">
    {showBack && (
      <button onClick={onBack} className="mr-3 p-1 hover:bg-white/20 rounded-lg transition-colors">
        <span className="text-xl">←</span>
      </button>
    )}
    <h1 className="text-xl font-bold">{title}</h1>
  </div>
);

const MobileDashboardScreen = ({ setActiveScreen, ingresos, gastos }) => {
  const totalIngresos = ingresos.reduce((sum, item) => sum + item.monto, 0);
  const totalGastos = Math.abs(gastos.reduce((sum, item) => sum + item.monto, 0));
  const balance = totalIngresos - totalGastos;

  return (
    <div className="p-4 space-y-6">
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg opacity-90">💰 Balance Total</h2>
            <p className="text-3xl font-bold">€{balance.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Este mes</p>
            <p className={`text-lg font-bold ${balance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {balance >= 0 ? '📈 +' : '📉 '}€{Math.abs(balance).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-600 text-xl">📈</span>
            <span className="text-green-800 font-medium">Ingresos</span>
          </div>
          <p className="text-2xl font-bold text-green-700">€{totalIngresos.toFixed(2)}</p>
        </div>

        <div className="bg-red-50 p-4 rounded-xl border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-600 text-xl">📉</span>
            <span className="text-red-800 font-medium">Gastos</span>
          </div>
          <p className="text-2xl font-bold text-red-700">€{totalGastos.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">⚡ Acciones Rápidas</h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setActiveScreen('ingresos')}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl flex items-center justify-center gap-2"
          >
            <span className="text-xl">➕</span>
            <span className="font-medium">Nuevo Ingreso</span>
          </button>
          <button 
            onClick={() => setActiveScreen('gastos')}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl flex items-center justify-center gap-2"
          >
            <span className="text-xl">➖</span>
            <span className="font-medium">Nuevo Gasto</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const MobileIngresosScreen = ({ ingresos, setIngresos }) => {
  const [nuevo, setNuevo] = useState({ descripcion: '', monto: '', categoria: 'trabajo' });

  const agregar = () => {
    if (nuevo.descripcion && nuevo.monto) {
      setIngresos([...ingresos, { 
        id: Date.now(), 
        ...nuevo, 
        monto: parseFloat(nuevo.monto),
        fecha: new Date().toISOString().split('T')[0] 
      }]);
      setNuevo({ descripcion: '', monto: '', categoria: 'trabajo' });
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h3 className="font-semibold mb-4">📈 Nuevo Ingreso</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Descripción"
            value={nuevo.descripcion}
            onChange={(e) => setNuevo({...nuevo, descripcion: e.target.value})}
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="number"
            placeholder="Monto"
            value={nuevo.monto}
            onChange={(e) => setNuevo({...nuevo, monto: e.target.value})}
            className="w-full p-3 border rounded-lg"
          />
          <select
            value={nuevo.categoria}
            onChange={(e) => setNuevo({...nuevo, categoria: e.target.value})}
            className="w-full p-3 border rounded-lg bg-white"
          >
            <option value="trabajo">💼 Trabajo</option>
            <option value="freelance">💻 Freelance</option>
            <option value="inversiones">📈 Inversiones</option>
            <option value="otros">📦 Otros</option>
          </select>
          <button onClick={agregar} className="w-full bg-green-600 text-white p-3 rounded-lg">
            ✅ Agregar Ingreso
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {ingresos.map((ingreso) => (
          <div key={ingreso.id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">💰 {ingreso.descripcion}</p>
                <p className="text-sm text-gray-500">📂 {ingreso.categoria}</p>
              </div>
              <span className="text-green-600 font-bold">+€{ingreso.monto}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MobileGastosScreen = ({ gastos, setGastos }) => {
  const [nuevo, setNuevo] = useState({ descripcion: '', monto: '', categoria: 'alimentacion' });

  const agregar = () => {
    if (nuevo.descripcion && nuevo.monto) {
      setGastos([...gastos, { 
        id: Date.now(), 
        ...nuevo, 
        monto: -Math.abs(parseFloat(nuevo.monto)),
        fecha: new Date().toISOString().split('T')[0] 
      }]);
      setNuevo({ descripcion: '', monto: '', categoria: 'alimentacion' });
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h3 className="font-semibold mb-4">📉 Nuevo Gasto</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Descripción"
            value={nuevo.descripcion}
            onChange={(e) => setNuevo({...nuevo, descripcion: e.target.value})}
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="number"
            placeholder="Monto"
            value={nuevo.monto}
            onChange={(e) => setNuevo({...nuevo, monto: e.target.value})}
            className="w-full p-3 border rounded-lg"
          />
          <select
            value={nuevo.categoria}
            onChange={(e) => setNuevo({...nuevo, categoria: e.target.value})}
            className="w-full p-3 border rounded-lg bg-white"
          >
            <option value="alimentacion">🍕 Alimentación</option>
            <option value="transporte">🚗 Transporte</option>
            <option value="entretenimiento">🎬 Entretenimiento</option>
            <option value="servicios">⚡ Servicios</option>
            <option value="salud">🏥 Salud</option>
            <option value="otros">📦 Otros</option>
          </select>
          <button onClick={agregar} className="w-full bg-red-600 text-white p-3 rounded-lg">
            ✅ Agregar Gasto
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {gastos.map((gasto) => (
          <div key={gasto.id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">💸 {gasto.descripcion}</p>
                <p className="text-sm text-gray-500">📂 {gasto.categoria}</p>
              </div>
              <span className="text-red-600 font-bold">-€{Math.abs(gasto.monto)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Pantalla de presupuestos móvil
const MobilePresupuestosScreen = ({ ingresos, gastos }) => {
  // Convertir transacciones al formato del componente Budgets
  const transactions = convertTransactionsForBudgets(ingresos, gastos);

  return (
    <div className="p-4">
      <Budgets transactions={transactions} />
    </div>
  );
};

const MobileEstadisticasScreen = ({ ingresos, gastos }) => {
  const totalIngresos = ingresos.reduce((sum, item) => sum + item.monto, 0);
  const totalGastos = Math.abs(gastos.reduce((sum, item) => sum + item.monto, 0));
  const balance = totalIngresos - totalGastos;

  const gastosPorCategoria = gastos.reduce((acc, gasto) => {
    acc[gasto.categoria] = (acc[gasto.categoria] || 0) + Math.abs(gasto.monto);
    return acc;
  }, {});

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="font-semibold mb-4">📊 Resumen Financiero</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">📈 Ingresos</p>
            <p className="text-2xl font-bold text-green-600">€{totalIngresos.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">📉 Gastos</p>
            <p className="text-2xl font-bold text-red-600">€{totalGastos.toFixed(2)}</p>
          </div>
        </div>
        <hr className="my-4" />
        <div className="text-center">
          <p className="text-sm text-gray-600">⚖️ Balance</p>
          <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            €{balance.toFixed(2)}
          </p>
        </div>
      </div>

      {Object.keys(gastosPorCategoria).length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-4">🍩 Gastos por Categoría</h3>
          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(gastosPorCategoria).map(([categoria, monto]) => ({
                    name: categoria,
                    value: monto,
                    emoji: {
                      'alimentacion': '🍕',
                      'transporte': '🚗', 
                      'entretenimiento': '🎬',
                      'servicios': '⚡',
                      'salud': '🏥',
                      'otros': '📦'
                    }[categoria] || '📦'
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {Object.entries(gastosPorCategoria).map(([categoria], index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        categoria === 'alimentacion' ? '#f97316' :
                        categoria === 'transporte' ? '#3b82f6' :
                        categoria === 'entretenimiento' ? '#8b5cf6' :
                        categoria === 'servicios' ? '#06b6d4' :
                        categoria === 'salud' ? '#10b981' :
                        '#6b7280'
                      }
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`€${value.toFixed(2)}`, 'Gasto']}
                  labelFormatter={(label) => `${
                    {
                      'alimentacion': '🍕',
                      'transporte': '🚗',
                      'entretenimiento': '🎬', 
                      'servicios': '⚡',
                      'salud': '🏥',
                      'otros': '📦'
                    }[label] || '📦'
                  } ${label.charAt(0).toUpperCase() + label.slice(1)}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-2">
            {Object.entries(gastosPorCategoria)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 4)
              .map(([categoria, monto]) => {
                const porcentaje = (monto / totalGastos) * 100;
                const emoji = {
                  'alimentacion': '🍕',
                  'transporte': '🚗',
                  'entretenimiento': '🎬',
                  'servicios': '⚡',
                  'salud': '🏥',
                  'otros': '📦'
                }[categoria] || '📦';
                
                return (
                  <div key={categoria} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <span>{emoji}</span>
                      <span className="text-sm font-medium capitalize">{categoria}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">€{monto.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{porcentaje.toFixed(1)}%</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

const MobilePerfilScreen = () => {
  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <div className="w-24 h-24 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-4xl">👤</span>
        </div>
        <h2 className="text-2xl font-bold">Mi Perfil</h2>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <span>🎯</span>
          Metas de Ahorro
        </h3>
        <SavingsGoals />
      </div>
    </div>
  );
};

const MobileDashboard = () => {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [ingresos, setIngresos] = useLocalStorage('ingresos', datosEjemplo.ingresos);
  const [gastos, setGastos] = useLocalStorage('gastos', datosEjemplo.gastos);

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <MobileDashboardScreen setActiveScreen={setActiveScreen} ingresos={ingresos} gastos={gastos} />;
      case 'ingresos':
        return <MobileIngresosScreen ingresos={ingresos} setIngresos={setIngresos} />;
      case 'gastos':
        return <MobileGastosScreen gastos={gastos} setGastos={setGastos} />;
      case 'presupuestos':
        return <MobilePresupuestosScreen ingresos={ingresos} gastos={gastos} />;
      case 'estadisticas':
        return <MobileEstadisticasScreen ingresos={ingresos} gastos={gastos} />;
      case 'perfil':
        return <MobilePerfilScreen />;
      default:
        return <MobileDashboardScreen setActiveScreen={setActiveScreen} ingresos={ingresos} gastos={gastos} />;
    }
  };

  const getScreenTitle = () => {
    const titles = {
      'dashboard': '🏠 Mi Dashboard',
      'ingresos': '📈 Ingresos',
      'gastos': '📉 Gastos',
      'presupuestos': '💰 Presupuestos',
      'estadisticas': '📊 Estadísticas',
      'perfil': '👤 Perfil'
    };
    return titles[activeScreen] || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader 
        title={getScreenTitle()} 
        showBack={activeScreen !== 'dashboard'}
        onBack={() => setActiveScreen('dashboard')}
      />
      
      <div className="pb-20 min-h-[calc(100vh-140px)]">
        {renderScreen()}
      </div>
      
      <BottomNavigation 
        activeScreen={activeScreen} 
        setActiveScreen={setActiveScreen} 
      />
    </div>
  );
};

// ===========================================
// COMPONENTE PRINCIPAL CON ROUTING
// ===========================================

const DashboardWithAuth = () => {
  const [forceView, setForceView] = useLocalStorage('preferredView', null);
  const [ingresos, setIngresos] = useLocalStorage('ingresos', datosEjemplo.ingresos);
  const [gastos, setGastos] = useLocalStorage('gastos', datosEjemplo.gastos);
  
  const context = useViewContext();

  const shouldShowMobile = forceView === 'mobile' || 
                          (forceView !== 'web' && (context.isMobile || context.isPWA));

  const currentView = shouldShowMobile ? 'mobile' : 'web';

  const handleViewChange = (view) => {
    setForceView(view);
  };

  return (
    <>
      <LogoutButton />
      
      <ViewToggle 
        currentView={currentView} 
        onViewChange={handleViewChange}
        context={context}
      />

      {shouldShowMobile ? (
        <MobileDashboard />
      ) : (
        <WebDashboard 
          ingresos={ingresos}
          setIngresos={setIngresos}
          gastos={gastos}
          setGastos={setGastos}
        />
      )}
    </>
  );
};

// Componente principal de la app
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardWithAuth />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;