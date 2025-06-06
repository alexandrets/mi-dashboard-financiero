import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';

// Contexto y componentes de auth
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Budgets from './components/Budgets';

// Datos de ejemplo para demostración
const datosEjemplo = {
  ingresos: [
    { id: 1, descripcion: 'Salario Enero', monto: 3500, fecha: '2024-01-31', categoria: 'Salario' },
    { id: 2, descripcion: 'Freelance Web', monto: 800, fecha: '2024-01-25', categoria: 'Freelance' },
    { id: 3, descripcion: 'Dividendos', monto: 150, fecha: '2024-01-20', categoria: 'Inversiones' }
  ],
  gastos: [
    { id: 4, descripcion: 'Supermercado', monto: -120, fecha: '2024-01-30', categoria: 'Alimentación' },
    { id: 5, descripcion: 'Gasolina', monto: -60, fecha: '2024-01-29', categoria: 'Transporte' },
    { id: 6, descripcion: 'Netflix', monto: -15, fecha: '2024-01-28', categoria: 'Entretenimiento' },
    { id: 7, descripcion: 'Electricidad', monto: -85, fecha: '2024-01-27', categoria: 'Servicios' }
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

// Componente de logout
const LogoutButton = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <button
      onClick={handleLogout}
      className="text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
    >
      🚪 Cerrar Sesión
    </button>
  );
};

// Componente de navegación inferior para móvil
const BottomNavigation = ({ activeScreen, setActiveScreen }) => {
  const navItems = [
    { id: 'dashboard', icon: '🏠', label: 'Inicio' },
    { id: 'ingresos', icon: '📈', label: 'Ingresos' },
    { id: 'gastos', icon: '📉', label: 'Gastos' },
    { id: 'presupuestos', icon: '💰', label: 'Presupuestos' },
    { id: 'estadisticas', icon: '📊', label: 'Stats' }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveScreen(item.id)}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${
              activeScreen === item.id
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <span className="text-lg mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Pantalla principal del dashboard móvil
const MobileDashboardScreen = ({ setActiveScreen, ingresos, gastos, objetivos }) => {
  const totalIngresos = ingresos.reduce((sum, ingreso) => sum + ingreso.monto, 0);
  const totalGastos = Math.abs(gastos.reduce((sum, gasto) => sum + gasto.monto, 0));
  const balance = totalIngresos - totalGastos;

  const resumenData = [
    { name: 'Ingresos', value: totalIngresos, color: '#10b981' },
    { name: 'Gastos', value: totalGastos, color: '#ef4444' }
  ];

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-green-100 text-sm">Balance Total</p>
              <p className="text-2xl font-bold">€{balance.toFixed(2)}</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Ingresos</p>
                <p className="text-lg font-bold text-green-600">€{totalIngresos}</p>
              </div>
              <span className="text-2xl">📈</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Gastos</p>
                <p className="text-lg font-bold text-red-600">€{totalGastos}</p>
              </div>
              <span className="text-2xl">📉</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h3 className="font-semibold mb-4 text-center">Resumen Financiero</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={resumenData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              dataKey="value"
            >
              {resumenData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `€${value}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setActiveScreen('ingresos')}
          className="bg-green-100 border-2 border-green-200 p-4 rounded-xl text-center hover:bg-green-200 transition-colors"
        >
          <div className="text-2xl mb-2">📈</div>
          <p className="font-medium text-green-800">Agregar Ingreso</p>
        </button>

        <button
          onClick={() => setActiveScreen('gastos')}
          className="bg-red-100 border-2 border-red-200 p-4 rounded-xl text-center hover:bg-red-200 transition-colors"
        >
          <div className="text-2xl mb-2">📉</div>
          <p className="font-medium text-red-800">Agregar Gasto</p>
        </button>
      </div>
    </div>
  );
};

// Pantalla de ingresos móvil
const MobileIngresosScreen = ({ ingresos, setIngresos }) => {
  const [nuevo, setNuevo] = useState({ descripcion: '', monto: '', categoria: 'Salario' });

  const agregar = () => {
    if (nuevo.descripcion && nuevo.monto) {
      setIngresos([...ingresos, { 
        id: Date.now(), 
        ...nuevo, 
        monto: parseFloat(nuevo.monto),
        fecha: new Date().toISOString().split('T')[0] 
      }]);
      setNuevo({ descripcion: '', monto: '', categoria: 'Salario' });
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
            <option value="Salario">💼 Salario</option>
            <option value="Freelance">💻 Freelance</option>
            <option value="Inversiones">📈 Inversiones</option>
            <option value="Bonos">🎉 Bonos</option>
            <option value="Ventas">💰 Ventas</option>
            <option value="Alquiler">🏠 Alquiler</option>
            <option value="Otros">📦 Otros</option>
          </select>
          <button onClick={agregar} className="w-full bg-green-600 text-white p-3 rounded-lg">
            ✅ Agregar Ingreso
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-semibold">📋 Historial de Ingresos</h3>
        </div>
        <div className="divide-y">
          {ingresos.map((ingreso) => (
            <div key={ingreso.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{ingreso.descripcion}</p>
                <p className="text-sm text-gray-600">{ingreso.categoria}</p>
                <p className="text-xs text-gray-500">{ingreso.fecha}</p>
              </div>
              <div className="text-green-600 font-bold">
                +€{ingreso.monto}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Pantalla de gastos móvil
const MobileGastosScreen = ({ gastos, setGastos }) => {
  const [nuevo, setNuevo] = useState({ descripcion: '', monto: '', categoria: 'Alimentación' });

  const agregar = () => {
    if (nuevo.descripcion && nuevo.monto) {
      setGastos([...gastos, { 
        id: Date.now(), 
        ...nuevo, 
        monto: -Math.abs(parseFloat(nuevo.monto)),
        fecha: new Date().toISOString().split('T')[0] 
      }]);
      setNuevo({ descripcion: '', monto: '', categoria: 'Alimentación' });
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
            <option value="Alimentación">🍕 Alimentación</option>
            <option value="Transporte">🚗 Transporte</option>
            <option value="Entretenimiento">🎬 Entretenimiento</option>
            <option value="Servicios">⚡ Servicios</option>
            <option value="Salud">🏥 Salud</option>
            <option value="Educación">📚 Educación</option>
            <option value="Ropa">👕 Ropa</option>
            <option value="Hogar">🏠 Hogar</option>
            <option value="Tecnología">💻 Tecnología</option>
            <option value="Viajes">✈️ Viajes</option>
            <option value="Deportes">⚽ Deportes</option>
            <option value="Regalos">🎁 Regalos</option>
            <option value="Otros">📦 Otros</option>
          </select>
          <button onClick={agregar} className="w-full bg-red-600 text-white p-3 rounded-lg">
            ✅ Agregar Gasto
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-semibold">📋 Historial de Gastos</h3>
        </div>
        <div className="divide-y">
          {gastos.map((gasto) => (
            <div key={gasto.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{gasto.descripcion}</p>
                <p className="text-sm text-gray-600">{gasto.categoria}</p>
                <p className="text-xs text-gray-500">{gasto.fecha}</p>
              </div>
              <div className="text-red-600 font-bold">
                €{gasto.monto}
              </div>
            </div>
          ))}
        </div>
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

// Pantalla de estadísticas móvil
const MobileEstadisticasScreen = ({ ingresos, gastos }) => {
  // Procesar datos para gráficos
  const processGastosPorCategoria = () => {
    const categorias = {};
    gastos.forEach(gasto => {
      const categoria = gasto.categoria || 'Otros';
      if (!categorias[categoria]) {
        categorias[categoria] = 0;
      }
      categorias[categoria] += Math.abs(gasto.monto);
    });

    return Object.entries(categorias).map(([categoria, monto]) => {
      const emojiMap = {
        'Alimentación': '🍕',
        'Transporte': '🚗',
        'Entretenimiento': '🎬',
        'Servicios': '⚡',
        'Salud': '🏥',
        'Educación': '📚',
        'Ropa': '👕',
        'Hogar': '🏠',
        'Tecnología': '💻',
        'Viajes': '✈️',
        'Deportes': '⚽',
        'Regalos': '🎁',
        'Otros': '📦',
        // Fallbacks para compatibilidad
        'alimentacion': '🍕',
        'transporte': '🚗',
        'entretenimiento': '🎬',
        'servicios': '⚡',
        'salud': '🏥'
      };
      const emoji = emojiMap[categoria] || '📦';

      const colorMap = {
        'Alimentación': '#f97316',
        'Transporte': '#3b82f6',
        'Entretenimiento': '#8b5cf6',
        'Servicios': '#06b6d4',
        'Salud': '#10b981',
        'Educación': '#f59e0b',
        'Ropa': '#ec4899',
        'Hogar': '#84cc16',
        'Tecnología': '#6366f1',
        'Viajes': '#14b8a6',
        'Deportes': '#f97316',
        'Regalos': '#ef4444',
        'Otros': '#6b7280',
        // Fallbacks para compatibilidad
        'alimentacion': '#f97316',
        'transporte': '#3b82f6',
        'entretenimiento': '#8b5cf6',
        'servicios': '#06b6d4',
        'salud': '#10b981'
      };
      const color = colorMap[categoria] || '#6b7280';

      return {
        name: categoria,
        value: monto,
        emoji,
        color,
        displayName: `${emoji} ${categoria}`
      };
    }).sort((a, b) => b.value - a.value);
  };

  const gastosPorCategoria = processGastosPorCategoria();
  const totalGastos = gastos.reduce((sum, gasto) => sum + Math.abs(gasto.monto), 0);

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h3 className="font-semibold mb-4 text-center">📊 Gastos por Categoría</h3>
        
        {gastosPorCategoria.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={gastosPorCategoria}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={80}
                  dataKey="value"
                >
                  {gastosPorCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `€${value}`} />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {gastosPorCategoria.map((categoria, index) => {
                const porcentaje = ((categoria.value / totalGastos) * 100).toFixed(1);
                return (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: categoria.color }}
                      ></div>
                      <span className="text-sm font-medium">{categoria.displayName}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">€{categoria.value.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{porcentaje}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">📊</div>
            <p>No hay datos de gastos para mostrar</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Dashboard para desktop/tablet
const WebDashboard = ({ ingresos, setIngresos, gastos, setGastos, objetivos, setObjetivos }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [nuevoIngreso, setNuevoIngreso] = useState({ 
    descripcion: '', 
    monto: '', 
    categoria: 'Salario',
    fecha: new Date().toISOString().split('T')[0]
  });
  
  const [nuevoGasto, setNuevoGasto] = useState({ 
    descripcion: '', 
    monto: '', 
    categoria: 'Alimentación',
    fecha: new Date().toISOString().split('T')[0]
  });

  const [mostrarFormIngreso, setMostrarFormIngreso] = useState(false);
  const [mostrarFormGasto, setMostrarFormGasto] = useState(false);

  // Calcular totales
  const totalIngresos = ingresos.reduce((sum, ingreso) => sum + ingreso.monto, 0);
  const totalGastos = Math.abs(gastos.reduce((sum, gasto) => sum + gasto.monto, 0));
  const balance = totalIngresos - totalGastos;

  // Funciones para agregar
  const agregarIngreso = (e) => {
    e.preventDefault();
    if (nuevoIngreso.descripcion && nuevoIngreso.monto) {
      setIngresos([...ingresos, { 
        id: Date.now(), 
        ...nuevoIngreso, 
        monto: parseFloat(nuevoIngreso.monto) 
      }]);
      setNuevoIngreso({ descripcion: '', monto: '', categoria: 'Salario', fecha: new Date().toISOString().split('T')[0] });
      setMostrarFormIngreso(false);
    }
  };

  const agregarGasto = (e) => {
    e.preventDefault();
    if (nuevoGasto.descripcion && nuevoGasto.monto) {
      setGastos([...gastos, { 
        id: Date.now(), 
        ...nuevoGasto, 
        monto: -Math.abs(parseFloat(nuevoGasto.monto)) 
      }]);
      setNuevoGasto({ descripcion: '', monto: '', categoria: 'Alimentación', fecha: new Date().toISOString().split('T')[0] });
      setMostrarFormGasto(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
            <LogoutButton />
          </div>
          
          {/* Pestañas de navegación */}
          <div className="border-t border-white/20">
            <div className="flex space-x-8 px-6">
              {[
                { id: 'dashboard', label: '🏠 Dashboard', icon: '🏠' },
                { id: 'presupuestos', label: '💰 Presupuestos', icon: '💰' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-white text-white'
                      : 'border-transparent text-blue-100 hover:text-white hover:border-blue-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'dashboard' ? (
          <>
            {/* Contenido del Dashboard actual */}
        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-100">Balance Total</p>
                <p className="text-2xl font-bold">€{balance.toFixed(2)}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-100">Total Ingresos</p>
                <p className="text-2xl font-bold">€{totalIngresos.toFixed(2)}</p>
              </div>
              <div className="text-4xl">📈</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-2xl text-white shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-red-100">Total Gastos</p>
                <p className="text-2xl font-bold">€{totalGastos.toFixed(2)}</p>
              </div>
              <div className="text-4xl">📉</div>
            </div>
          </div>
        </div>

        {/* Sección de gestión */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gestión de Ingresos */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span>📈</span>
                Gestión de Ingresos
              </h3>
              <button
                onClick={() => setMostrarFormIngreso(!mostrarFormIngreso)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                {mostrarFormIngreso ? '✕ Cancelar' : '+ Agregar Ingreso'}
              </button>
            </div>

            {mostrarFormIngreso && (
              <form onSubmit={agregarIngreso} className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Descripción del ingreso"
                    value={nuevoIngreso.descripcion}
                    onChange={(e) => setNuevoIngreso({...nuevoIngreso, descripcion: e.target.value})}
                    className="w-full p-2 border border-green-300 rounded-lg text-sm"
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Monto (€)"
                    value={nuevoIngreso.monto}
                    onChange={(e) => setNuevoIngreso({...nuevoIngreso, monto: e.target.value})}
                    className="w-full p-2 border border-green-300 rounded-lg text-sm"
                    required
                  />
                  <select
                    value={nuevoIngreso.categoria}
                    onChange={(e) => setNuevoIngreso({...nuevoIngreso, categoria: e.target.value})}
                    className="w-full p-2 border border-green-300 rounded-lg text-sm"
                  >
                    <option value="Salario">💼 Salario</option>
                    <option value="Freelance">💻 Freelance</option>
                    <option value="Inversiones">📈 Inversiones</option>
                    <option value="Bonos">🎉 Bonos</option>
                    <option value="Ventas">💰 Ventas</option>
                    <option value="Alquiler">🏠 Alquiler</option>
                    <option value="Otros">📦 Otros</option>
                  </select>
                  <input
                    type="date"
                    value={nuevoIngreso.fecha}
                    onChange={(e) => setNuevoIngreso({...nuevoIngreso, fecha: e.target.value})}
                    className="w-full p-2 border border-green-300 rounded-lg text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  ✅ Agregar Ingreso
                </button>
              </form>
            )}

            <div className="max-h-64 overflow-y-auto">
              {ingresos.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">📈</div>
                  <p>No hay ingresos registrados</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {ingresos.map((ingreso) => (
                    <div key={ingreso.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <p className="font-medium text-green-800">{ingreso.descripcion}</p>
                        <p className="text-sm text-green-600">{ingreso.categoria} • {ingreso.fecha}</p>
                      </div>
                      <div className="text-green-700 font-bold">
                        +€{ingreso.monto.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Gestión de Gastos */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span>📉</span>
                Gestión de Gastos
              </h3>
              <button
                onClick={() => setMostrarFormGasto(!mostrarFormGasto)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                {mostrarFormGasto ? '✕ Cancelar' : '+ Agregar Gasto'}
              </button>
            </div>

            {mostrarFormGasto && (
              <form onSubmit={agregarGasto} className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Descripción del gasto"
                    value={nuevoGasto.descripcion}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, descripcion: e.target.value})}
                    className="w-full p-2 border border-red-300 rounded-lg text-sm"
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Monto (€)"
                    value={nuevoGasto.monto}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, monto: e.target.value})}
                    className="w-full p-2 border border-red-300 rounded-lg text-sm"
                    required
                  />
                  <select
                    value={nuevoGasto.categoria}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, categoria: e.target.value})}
                    className="w-full p-2 border border-red-300 rounded-lg text-sm"
                  >
                    <option value="Alimentación">🍕 Alimentación</option>
                    <option value="Transporte">🚗 Transporte</option>
                    <option value="Entretenimiento">🎬 Entretenimiento</option>
                    <option value="Servicios">⚡ Servicios</option>
                    <option value="Salud">🏥 Salud</option>
                    <option value="Educación">📚 Educación</option>
                    <option value="Ropa">👕 Ropa</option>
                    <option value="Hogar">🏠 Hogar</option>
                    <option value="Tecnología">💻 Tecnología</option>
                    <option value="Viajes">✈️ Viajes</option>
                    <option value="Deportes">⚽ Deportes</option>
                    <option value="Regalos">🎁 Regalos</option>
                    <option value="Otros">📦 Otros</option>
                  </select>
                  <input
                    type="date"
                    value={nuevoGasto.fecha}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, fecha: e.target.value})}
                    className="w-full p-2 border border-red-300 rounded-lg text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  ✅ Agregar Gasto
                </button>
              </form>
            )}

            <div className="max-h-64 overflow-y-auto">
              {gastos.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">📉</div>
                  <p>No hay gastos registrados</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {gastos.map((gasto) => (
                    <div key={gasto.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <div>
                        <p className="font-medium text-red-800">{gasto.descripcion}</p>
                        <p className="text-sm text-red-600">{gasto.categoria} • {gasto.fecha}</p>
                      </div>
                      <div className="text-red-700 font-bold">
                        €{gasto.monto.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Objetivos simplificados */}
        {objetivos.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span>🎯</span>
                Mis Objetivos Financieros
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {objetivos.map((objetivo) => {
                  const progreso = Math.min((objetivo.actual / objetivo.meta) * 100, 100);
                  return (
                    <div key={objetivo.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2">🎯 {objetivo.nombre}</h4>
                      <div className="flex justify-between text-sm text-blue-600 mb-2">
                        <span>€{objetivo.actual.toFixed(2)}</span>
                        <span>€{objetivo.meta.toFixed(2)}</span>
                      </div>
                      <div className="bg-blue-200 rounded-full h-3 mb-2">
                        <div 
                          className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${progreso}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-blue-600">{progreso.toFixed(1)}% completado</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
          </>
        ) : activeTab === 'presupuestos' ? (
          <div className="mt-6">
            <Budgets transactions={convertTransactionsForBudgets(ingresos, gastos)} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

// Componente principal de la aplicación móvil
const MobileApp = () => {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [ingresos, setIngresos] = useState(datosEjemplo.ingresos);
  const [gastos, setGastos] = useState(datosEjemplo.gastos);
  const [objetivos, setObjetivos] = useState([]);

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <MobileDashboardScreen setActiveScreen={setActiveScreen} ingresos={ingresos} gastos={gastos} objetivos={objetivos} />;
      case 'ingresos':
        return <MobileIngresosScreen ingresos={ingresos} setIngresos={setIngresos} />;
      case 'gastos':
        return <MobileGastosScreen gastos={gastos} setGastos={setGastos} />;
      case 'presupuestos':
        return <MobilePresupuestosScreen ingresos={ingresos} gastos={gastos} />;
      case 'estadisticas':
        return <MobileEstadisticasScreen ingresos={ingresos} gastos={gastos} />;
      default:
        return <MobileDashboardScreen setActiveScreen={setActiveScreen} ingresos={ingresos} gastos={gastos} objetivos={objetivos} />;
    }
  };

  const getScreenTitle = () => {
    const titles = {
      'dashboard': '🏠 Mi Dashboard',
      'ingresos': '📈 Ingresos',
      'gastos': '📉 Gastos',
      'presupuestos': '💰 Presupuestos',
      'estadisticas': '📊 Estadísticas'
    };
    return titles[activeScreen] || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header móvil */}
      <div className="md:hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">
            {getScreenTitle()}
          </h1>
          <LogoutButton />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="pb-16 md:pb-0">
        {renderScreen()}
      </div>

      {/* Navegación inferior */}
      <BottomNavigation activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
    </div>
  );
};

// Componente principal que maneja autenticación
const MainApp = () => {
  const { currentUser } = useAuth();
  const [ingresos, setIngresos] = useState(datosEjemplo.ingresos);
  const [gastos, setGastos] = useState(datosEjemplo.gastos);
  const [objetivos, setObjetivos] = useState([]);

  // Detector de dispositivo móvil
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!currentUser) {
    return null; // La redirección se maneja en las rutas
  }

  return isMobile ? (
    <MobileApp />
  ) : (
    <WebDashboard 
      ingresos={ingresos} 
      setIngresos={setIngresos}
      gastos={gastos} 
      setGastos={setGastos}
      objetivos={objetivos} 
      setObjetivos={setObjetivos}
    />
  );
};

// Rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return currentUser ? children : <Navigate to="/login" />;
};

// Componente principal de la app
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;