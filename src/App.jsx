import React, { useState, useEffect } from 'react';
import { Home, TrendingUp, TrendingDown, BarChart3, CreditCard, User, Plus, ArrowLeft, Calendar, Target, Trash2, Edit3, Monitor, Smartphone, Settings } from 'lucide-react';

// Hook para localStorage 
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

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
        <Monitor size={16} />
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
        <Smartphone size={16} />
      </button>
    </div>
    <div className="text-xs text-gray-500 mt-1 text-center">
      {context.isPWA ? 'PWA' : 'Web'} • {context.screenSize}
    </div>
  </div>
);

// ===========================================
// VISTA WEB/DESKTOP SIMPLIFICADA
// ===========================================

const WebDashboard = ({ ingresos, setIngresos, gastos, setGastos, objetivos, setObjetivos }) => {
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

  // Gastos por categoría para el gráfico simple
  const gastosPorCategoria = gastos.reduce((acc, gasto) => {
    acc[gasto.categoria] = (acc[gasto.categoria] || 0) + Math.abs(gasto.monto);
    return acc;
  }, {});

  const categoriaColores = {
    'alimentacion': 'bg-orange-500',
    'transporte': 'bg-blue-500',
    'entretenimiento': 'bg-purple-500',
    'servicios': 'bg-cyan-500',
    'salud': 'bg-green-500',
    'otros': 'bg-gray-500'
  };

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
                Ingresos Totales
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="text-4xl font-bold mb-4 text-red-600">
                €{totalGastos.toFixed(2)}
              </div>
              <div className="text-gray-500 text-sm">
                Gastos Totales
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className={`text-4xl font-bold mb-4 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                €{balance.toFixed(2)}
              </div>
              <div className="text-gray-500 text-sm">
                Balance
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Gráfico de gastos por categoría - SIMPLE */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Gastos por Categoría</h3>
              
              {Object.keys(gastosPorCategoria).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(gastosPorCategoria)
                    .sort(([,a], [,b]) => b - a)
                    .map(([categoria, monto]) => {
                      const porcentaje = (monto / totalGastos) * 100;
                      return (
                        <div key={categoria}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium capitalize">{categoria}</span>
                            <span className="text-sm text-gray-600">
                              €{monto.toFixed(2)} ({porcentaje.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full transition-all duration-500 ${categoriaColores[categoria] || 'bg-gray-500'}`}
                              style={{ width: `${porcentaje}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 size={64} className="mx-auto mb-4 opacity-50" />
                  <p>No hay gastos registrados aún</p>
                  <p className="text-sm">¡Agrega tu primer gasto para ver el análisis!</p>
                </div>
              )}
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
                <TrendingUp size={20} />
                <span>Nuevo Ingreso</span>
              </button>

              <button
                onClick={() => setMostrarFormGasto(!mostrarFormGasto)}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
              >
                <TrendingDown size={20} />
                <span>Nuevo Gasto</span>
              </button>
            </div>

            {/* Formulario de Ingreso */}
            {mostrarFormIngreso && (
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <h4 className="font-semibold text-green-800 mb-3">Agregar Ingreso</h4>
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
                    <option value="trabajo">Trabajo</option>
                    <option value="freelance">Freelance</option>
                    <option value="inversiones">Inversiones</option>
                    <option value="otros">Otros</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={agregarIngreso}
                      className="flex-1 bg-green-600 text-white p-2 rounded-lg text-sm hover:bg-green-700"
                    >
                      Agregar
                    </button>
                    <button
                      onClick={() => setMostrarFormIngreso(false)}
                      className="px-4 bg-gray-500 text-white p-2 rounded-lg text-sm hover:bg-gray-600"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Formulario de Gasto */}
            {mostrarFormGasto && (
              <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                <h4 className="font-semibold text-red-800 mb-3">Agregar Gasto</h4>
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
                    <option value="alimentacion">Alimentación</option>
                    <option value="transporte">Transporte</option>
                    <option value="entretenimiento">Entretenimiento</option>
                    <option value="servicios">Servicios</option>
                    <option value="salud">Salud</option>
                    <option value="otros">Otros</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={agregarGasto}
                      className="flex-1 bg-red-600 text-white p-2 rounded-lg text-sm hover:bg-red-700"
                    >
                      Agregar
                    </button>
                    <button
                      onClick={() => setMostrarFormGasto(false)}
                      className="px-4 bg-gray-500 text-white p-2 rounded-lg text-sm hover:bg-gray-600"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Transacciones Recientes */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-base font-bold text-gray-800 mb-4">
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
                            {transaccion.descripcion}
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
                            className="w-6 h-6 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors"
                            title="Eliminar transacción"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Objetivos simplificados */}
        {objetivos.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Mis Objetivos Financieros</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {objetivos.map((objetivo) => {
                  const progreso = Math.min((objetivo.actual / objetivo.meta) * 100, 100);
                  return (
                    <div key={objetivo.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2">{objetivo.nombre}</h4>
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
      </div>
    </div>
  );
};

// ===========================================
// VISTA MÓVIL (igual que antes)
// ===========================================

const BottomNavigation = ({ activeScreen, setActiveScreen }) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Inicio' },
    { id: 'ingresos', icon: TrendingUp, label: 'Ingresos' },
    { id: 'gastos', icon: TrendingDown, label: 'Gastos' },
    { id: 'estadisticas', icon: BarChart3, label: 'Stats' },
    { id: 'perfil', icon: User, label: 'Perfil' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-50 shadow-lg">
      <div className="flex justify-around">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveScreen(id)}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
              activeScreen === id 
                ? 'text-blue-600 bg-blue-50 scale-105' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icon size={22} />
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
        <ArrowLeft size={24} />
      </button>
    )}
    <h1 className="text-xl font-bold">{title}</h1>
  </div>
);

const MobileDashboardScreen = ({ setActiveScreen, ingresos, gastos, objetivos }) => {
  const totalIngresos = ingresos.reduce((sum, item) => sum + item.monto, 0);
  const totalGastos = Math.abs(gastos.reduce((sum, item) => sum + item.monto, 0));
  const balance = totalIngresos - totalGastos;

  const todasTransacciones = [...ingresos, ...gastos]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5);

  return (
    <div className="p-4 space-y-6">
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg opacity-90">Balance Total</h2>
            <p className="text-3xl font-bold">€{balance.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Este mes</p>
            <p className={`text-lg font-bold ${balance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {balance >= 0 ? '+' : ''}€{balance.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-green-600" size={20} />
            <span className="text-green-800 font-medium">Ingresos</span>
          </div>
          <p className="text-2xl font-bold text-green-700">€{totalIngresos.toFixed(2)}</p>
        </div>

        <div className="bg-red-50 p-4 rounded-xl border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="text-red-600" size={20} />
            <span className="text-red-800 font-medium">Gastos</span>
          </div>
          <p className="text-2xl font-bold text-red-700">€{totalGastos.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setActiveScreen('ingresos')}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            <span className="font-medium">Nuevo Ingreso</span>
          </button>
          <button 
            onClick={() => setActiveScreen('gastos')}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            <span className="font-medium">Nuevo Gasto</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Versión simplificada de pantallas móviles
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
        <h3 className="font-semibold mb-4">Nuevo Ingreso</h3>
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
          <button onClick={agregar} className="w-full bg-green-600 text-white p-3 rounded-lg">
            Agregar Ingreso
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {ingresos.map((ingreso) => (
          <div key={ingreso.id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{ingreso.descripcion}</p>
                <p className="text-sm text-gray-500">{ingreso.categoria}</p>
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
        <h3 className="font-semibold mb-4">Nuevo Gasto</h3>
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
          <button onClick={agregar} className="w-full bg-red-600 text-white p-3 rounded-lg">
            Agregar Gasto
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {gastos.map((gasto) => (
          <div key={gasto.id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{gasto.descripcion}</p>
                <p className="text-sm text-gray-500">{gasto.categoria}</p>
              </div>
              <span className="text-red-600 font-bold">-€{Math.abs(gasto.monto)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MobileEstadisticasScreen = ({ ingresos, gastos }) => {
  const totalIngresos = ingresos.reduce((sum, item) => sum + item.monto, 0);
  const totalGastos = Math.abs(gastos.reduce((sum, item) => sum + item.monto, 0));
  const balance = totalIngresos - totalGastos;

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="font-semibold mb-4">Resumen Financiero</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Ingresos</p>
            <p className="text-2xl font-bold text-green-600">€{totalIngresos.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Gastos</p>
            <p className="text-2xl font-bold text-red-600">€{totalGastos.toFixed(2)}</p>
          </div>
        </div>
        <hr className="my-4" />
        <div className="text-center">
          <p className="text-sm text-gray-600">Balance</p>
          <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            €{balance.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

const MobilePerfilScreen = ({ objetivos, setObjetivos }) => {
  const [nuevo, setNuevo] = useState({ nombre: '', meta: '' });

  const agregar = () => {
    if (nuevo.nombre && nuevo.meta) {
      setObjetivos([...objetivos, { 
        id: Date.now(), 
        ...nuevo, 
        meta: parseFloat(nuevo.meta),
        actual: 0 
      }]);
      setNuevo({ nombre: '', meta: '' });
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <div className="w-24 h-24 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <User size={48} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold">Mi Perfil</h2>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h3 className="font-semibold mb-4">Nuevo Objetivo</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nombre del objetivo"
            value={nuevo.nombre}
            onChange={(e) => setNuevo({...nuevo, nombre: e.target.value})}
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="number"
            placeholder="Meta en €"
            value={nuevo.meta}
            onChange={(e) => setNuevo({...nuevo, meta: e.target.value})}
            className="w-full p-3 border rounded-lg"
          />
          <button onClick={agregar} className="w-full bg-blue-600 text-white p-3 rounded-lg">
            Crear Objetivo
          </button>
        </div>
      </div>
    </div>
  );
};

const MobileDashboard = () => {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [ingresos, setIngresos] = useLocalStorage('mobile_ingresos', datosEjemplo.ingresos);
  const [gastos, setGastos] = useLocalStorage('mobile_gastos', datosEjemplo.gastos);
  const [objetivos, setObjetivos] = useLocalStorage('mobile_objetivos', []);

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <MobileDashboardScreen setActiveScreen={setActiveScreen} ingresos={ingresos} gastos={gastos} objetivos={objetivos} />;
      case 'ingresos':
        return <MobileIngresosScreen ingresos={ingresos} setIngresos={setIngresos} />;
      case 'gastos':
        return <MobileGastosScreen gastos={gastos} setGastos={setGastos} />;
      case 'estadisticas':
        return <MobileEstadisticasScreen ingresos={ingresos} gastos={gastos} />;
      case 'perfil':
        return <MobilePerfilScreen objetivos={objetivos} setObjetivos={setObjetivos} />;
      default:
        return <MobileDashboardScreen setActiveScreen={setActiveScreen} ingresos={ingresos} gastos={gastos} objetivos={objetivos} />;
    }
  };

  const getScreenTitle = () => {
    const titles = {
      'dashboard': 'Mi Dashboard',
      'ingresos': 'Ingresos',
      'gastos': 'Gastos',
      'estadisticas': 'Estadísticas',
      'perfil': 'Perfil'
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
// COMPONENTE PRINCIPAL
// ===========================================

const App = () => {
  const [forceView, setForceView] = useLocalStorage('preferredView', null);
  const [ingresos, setIngresos] = useLocalStorage('ingresos', datosEjemplo.ingresos);
  const [gastos, setGastos] = useLocalStorage('gastos', datosEjemplo.gastos);
  const [objetivos, setObjetivos] = useLocalStorage('objetivos', []);
  
  const context = useViewContext();

  const shouldShowMobile = forceView === 'mobile' || 
                          (forceView !== 'web' && (context.isMobile || context.isPWA));

  const currentView = shouldShowMobile ? 'mobile' : 'web';

  const handleViewChange = (view) => {
    setForceView(view);
  };

  return (
    <>
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
          objetivos={objetivos}
          setObjetivos={setObjetivos}
        />
      )}
    </>
  );
};

export default App;

