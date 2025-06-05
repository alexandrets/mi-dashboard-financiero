import React, { useState, useEffect } from 'react';
import { Home, TrendingUp, TrendingDown, BarChart3, CreditCard, User, Plus, ArrowLeft, Calendar, Target, Trash2, Edit3 } from 'lucide-react';

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

// Componente de navegación inferior
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

// Header con título y botón atrás
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

// Pantalla Dashboard (resumen)
const DashboardScreen = ({ setActiveScreen, ingresos, gastos, objetivos }) => {
  const totalIngresos = ingresos.reduce((sum, item) => sum + item.monto, 0);
  const totalGastos = Math.abs(gastos.reduce((sum, item) => sum + item.monto, 0));
  const balance = totalIngresos - totalGastos;

  const todasTransacciones = [...ingresos, ...gastos]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5);

  return (
    <div className="p-4 space-y-6 animate-fadeIn">
      {/* Balance principal */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg opacity-90">Balance Total</h2>
            <p className="text-3xl font-bold">${balance.toLocaleString()}</p>
            <p className="text-sm opacity-80 mt-1">
              {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Este mes</p>
            <p className={`text-lg font-bold ${balance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {balance >= 0 ? '+' : ''}{balance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-green-600" size={20} />
            <span className="text-green-800 font-medium">Ingresos</span>
          </div>
          <p className="text-2xl font-bold text-green-700">${totalIngresos.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1">{ingresos.length} transacciones</p>
        </div>

        <div className="bg-red-50 p-4 rounded-xl border border-red-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="text-red-600" size={20} />
            <span className="text-red-800 font-medium">Gastos</span>
          </div>
          <p className="text-2xl font-bold text-red-700">${totalGastos.toLocaleString()}</p>
          <p className="text-xs text-red-600 mt-1">{gastos.length} transacciones</p>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setActiveScreen('ingresos')}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-200 active:scale-95"
          >
            <Plus size={20} />
            <span className="font-medium">Nuevo Ingreso</span>
          </button>
          <button 
            onClick={() => setActiveScreen('gastos')}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-200 active:scale-95"
          >
            <Plus size={20} />
            <span className="font-medium">Nuevo Gasto</span>
          </button>
        </div>
      </div>

      {/* Objetivos del mes */}
      {objetivos.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">Objetivos del Mes</h3>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            {objetivos.slice(0, 2).map((objetivo) => {
              const progreso = Math.min((objetivo.actual / objetivo.meta) * 100, 100);
              return (
                <div key={objetivo.id} className="mb-3 last:mb-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-blue-800">{objetivo.nombre}</span>
                    <span className="text-sm text-blue-600">
                      ${objetivo.actual.toLocaleString()} / ${objetivo.meta.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progreso}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">{progreso.toFixed(1)}% completado</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Últimas transacciones */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Últimas Transacciones</h3>
          <button 
            onClick={() => setActiveScreen('estadisticas')}
            className="text-blue-600 text-sm hover:text-blue-800 transition-colors"
          >
            Ver todas
          </button>
        </div>
        <div className="space-y-2">
          {todasTransacciones.map((transaccion) => (
            <div key={transaccion.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{transaccion.descripcion}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaccion.fecha).toLocaleDateString('es-ES')} • {transaccion.categoria}
                  </p>
                </div>
                <span className={`font-bold text-lg ${transaccion.monto > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {transaccion.monto > 0 ? '+' : '-'}${Math.abs(transaccion.monto).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Pantalla de Ingresos
const IngresosScreen = ({ ingresos, setIngresos }) => {
  const [nuevoIngreso, setNuevoIngreso] = useState({ 
    descripcion: '', 
    monto: '', 
    categoria: 'trabajo',
    fecha: new Date().toISOString().split('T')[0]
  });
  const [editando, setEditando] = useState(null);

  const categorias = [
    { value: 'trabajo', label: 'Trabajo', color: 'bg-blue-100 text-blue-800' },
    { value: 'freelance', label: 'Freelance', color: 'bg-purple-100 text-purple-800' },
    { value: 'inversiones', label: 'Inversiones', color: 'bg-green-100 text-green-800' },
    { value: 'otros', label: 'Otros', color: 'bg-gray-100 text-gray-800' }
  ];

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
    }
  };

  const eliminarIngreso = (id) => {
    setIngresos(ingresos.filter(ingreso => ingreso.id !== id));
  };

  const editarIngreso = (ingreso) => {
    setEditando(ingreso.id);
    setNuevoIngreso({
      descripcion: ingreso.descripcion,
      monto: ingreso.monto.toString(),
      categoria: ingreso.categoria,
      fecha: ingreso.fecha
    });
  };

  const actualizarIngreso = () => {
    if (nuevoIngreso.descripcion && nuevoIngreso.monto && nuevoIngreso.fecha) {
      setIngresos(ingresos.map(ingreso => 
        ingreso.id === editando 
          ? { ...ingreso, ...nuevoIngreso, monto: parseFloat(nuevoIngreso.monto) }
          : ingreso
      ));
      setEditando(null);
      setNuevoIngreso({ descripcion: '', monto: '', categoria: 'trabajo', fecha: new Date().toISOString().split('T')[0] });
    }
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setNuevoIngreso({ descripcion: '', monto: '', categoria: 'trabajo', fecha: new Date().toISOString().split('T')[0] });
  };

  const totalIngresos = ingresos.reduce((sum, item) => sum + item.monto, 0);

  return (
    <div className="p-4 space-y-6 animate-slideInRight">
      {/* Header con total */}
      <div className="bg-green-50 p-4 rounded-xl border border-green-200">
        <div className="text-center">
          <p className="text-sm text-green-600">Total de Ingresos</p>
          <p className="text-2xl font-bold text-green-700">${totalIngresos.toLocaleString()}</p>
        </div>
      </div>

      {/* Formulario para nuevo/editar ingreso */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {editando ? 'Editar Ingreso' : 'Nuevo Ingreso'}
        </h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Descripción del ingreso"
            value={nuevoIngreso.descripcion}
            onChange={(e) => setNuevoIngreso({...nuevoIngreso, descripcion: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Monto"
              step="0.01"
              value={nuevoIngreso.monto}
              onChange={(e) => setNuevoIngreso({...nuevoIngreso, monto: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <input
              type="date"
              value={nuevoIngreso.fecha}
              onChange={(e) => setNuevoIngreso({...nuevoIngreso, fecha: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={nuevoIngreso.categoria}
            onChange={(e) => setNuevoIngreso({...nuevoIngreso, categoria: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {categorias.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          
          <div className="flex gap-3">
            <button
              onClick={editando ? actualizarIngreso : agregarIngreso}
              className="flex-1 bg-green-600 text-white p-3 rounded-lg font-medium hover:bg-green-700 transition-colors active:scale-95"
            >
              {editando ? 'Actualizar' : 'Agregar Ingreso'}
            </button>
            {editando && (
              <button
                onClick={cancelarEdicion}
                className="px-6 bg-gray-500 text-white p-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de ingresos */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Mis Ingresos ({ingresos.length})</h3>
        {ingresos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp size={48} className="mx-auto mb-3 opacity-50" />
            <p>No tienes ingresos registrados aún</p>
            <p className="text-sm">¡Agrega tu primer ingreso arriba!</p>
          </div>
        ) : (
          ingresos.map((ingreso) => {
            const categoria = categorias.find(cat => cat.value === ingreso.categoria);
            return (
              <div key={ingreso.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{ingreso.descripcion}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-500">
                        {new Date(ingreso.fecha).toLocaleDateString('es-ES')}
                      </p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoria.color}`}>
                        {categoria.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-green-600">
                      +${ingreso.monto.toLocaleString()}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => editarIngreso(ingreso)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => eliminarIngreso(ingreso.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Pantalla de Gastos
const GastosScreen = ({ gastos, setGastos }) => {
  const [nuevoGasto, setNuevoGasto] = useState({ 
    descripcion: '', 
    monto: '', 
    categoria: 'alimentacion',
    fecha: new Date().toISOString().split('T')[0]
  });
  const [editando, setEditando] = useState(null);

  const categorias = [
    { value: 'alimentacion', label: 'Alimentación', color: 'bg-orange-100 text-orange-800' },
    { value: 'transporte', label: 'Transporte', color: 'bg-blue-100 text-blue-800' },
    { value: 'entretenimiento', label: 'Entretenimiento', color: 'bg-purple-100 text-purple-800' },
    { value: 'servicios', label: 'Servicios', color: 'bg-cyan-100 text-cyan-800' },
    { value: 'salud', label: 'Salud', color: 'bg-green-100 text-green-800' },
    { value: 'otros', label: 'Otros', color: 'bg-gray-100 text-gray-800' }
  ];

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
    }
  };

  const eliminarGasto = (id) => {
    setGastos(gastos.filter(gasto => gasto.id !== id));
  };

  const editarGasto = (gasto) => {
    setEditando(gasto.id);
    setNuevoGasto({
      descripcion: gasto.descripcion,
      monto: Math.abs(gasto.monto).toString(),
      categoria: gasto.categoria,
      fecha: gasto.fecha
    });
  };

  const actualizarGasto = () => {
    if (nuevoGasto.descripcion && nuevoGasto.monto && nuevoGasto.fecha) {
      setGastos(gastos.map(gasto => 
        gasto.id === editando 
          ? { ...gasto, ...nuevoGasto, monto: -Math.abs(parseFloat(nuevoGasto.monto)) }
          : gasto
      ));
      setEditando(null);
      setNuevoGasto({ descripcion: '', monto: '', categoria: 'alimentacion', fecha: new Date().toISOString().split('T')[0] });
    }
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setNuevoGasto({ descripcion: '', monto: '', categoria: 'alimentacion', fecha: new Date().toISOString().split('T')[0] });
  };

  const totalGastos = Math.abs(gastos.reduce((sum, item) => sum + item.monto, 0));

  return (
    <div className="p-4 space-y-6 animate-slideInRight">
      {/* Header con total */}
      <div className="bg-red-50 p-4 rounded-xl border border-red-200">
        <div className="text-center">
          <p className="text-sm text-red-600">Total de Gastos</p>
          <p className="text-2xl font-bold text-red-700">${totalGastos.toLocaleString()}</p>
        </div>
      </div>

      {/* Formulario para nuevo/editar gasto */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {editando ? 'Editar Gasto' : 'Nuevo Gasto'}
        </h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Descripción del gasto"
            value={nuevoGasto.descripcion}
            onChange={(e) => setNuevoGasto({...nuevoGasto, descripcion: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Monto"
              step="0.01"
              value={nuevoGasto.monto}
              onChange={(e) => setNuevoGasto({...nuevoGasto, monto: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <input
              type="date"
              value={nuevoGasto.fecha}
              onChange={(e) => setNuevoGasto({...nuevoGasto, fecha: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={nuevoGasto.categoria}
            onChange={(e) => setNuevoGasto({...nuevoGasto, categoria: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {categorias.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          
          <div className="flex gap-3">
            <button
              onClick={editando ? actualizarGasto : agregarGasto}
              className="flex-1 bg-red-600 text-white p-3 rounded-lg font-medium hover:bg-red-700 transition-colors active:scale-95"
            >
              {editando ? 'Actualizar' : 'Agregar Gasto'}
            </button>
            {editando && (
              <button
                onClick={cancelarEdicion}
                className="px-6 bg-gray-500 text-white p-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de gastos */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Mis Gastos ({gastos.length})</h3>
        {gastos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <TrendingDown size={48} className="mx-auto mb-3 opacity-50" />
            <p>No tienes gastos registrados aún</p>
            <p className="text-sm">¡Agrega tu primer gasto arriba!</p>
          </div>
        ) : (
          gastos.map((gasto) => {
            const categoria = categorias.find(cat => cat.value === gasto.categoria);
            return (
              <div key={gasto.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{gasto.descripcion}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-500">
                        {new Date(gasto.fecha).toLocaleDateString('es-ES')}
                      </p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoria.color}`}>
                        {categoria.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-red-600">
                      -${Math.abs(gasto.monto).toLocaleString()}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => editarGasto(gasto)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => eliminarGasto(gasto.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Pantalla de Estadísticas
const EstadisticasScreen = ({ ingresos, gastos, objetivos }) => {
  const totalIngresos = ingresos.reduce((sum, item) => sum + item.monto, 0);
  const totalGastos = Math.abs(gastos.reduce((sum, item) => sum + item.monto, 0));
  const balance = totalIngresos - totalGastos;

  // Gastos por categoría
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

  const todasTransacciones = [...ingresos, ...gastos]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  return (
    <div className="p-4 space-y-6 animate-slideInRight">
      {/* Resumen financiero */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Resumen Financiero</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Ingresos</p>
              <p className="text-2xl font-bold text-green-600">${totalIngresos.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Gastos</p>
              <p className="text-2xl font-bold text-red-600">${totalGastos.toLocaleString()}</p>
            </div>
          </div>
          
          <hr className="border-blue-200" />
          
          <div className="text-center">
            <p className="text-sm text-gray-600">Balance Final</p>
            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {balance >= 0 ? '+' : ''}${balance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Proporción visual */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h4 className="font-medium text-gray-800 mb-3">Proporción Ingresos vs Gastos</h4>
        <div className="relative bg-gray-200 rounded-full h-6 overflow-hidden">
          <div 
            className="bg-green-500 h-full rounded-l-full transition-all duration-1000 ease-out"
            style={{ width: `${totalIngresos > 0 ? (totalIngresos / (totalIngresos + totalGastos)) * 100 : 0}%` }}
          ></div>
          <div 
            className="bg-red-500 h-full absolute top-0 right-0 rounded-r-full transition-all duration-1000 ease-out"
            style={{ width: `${totalGastos > 0 ? (totalGastos / (totalIngresos + totalGastos)) * 100 : 0}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>Ingresos: {totalIngresos > 0 ? ((totalIngresos / (totalIngresos + totalGastos)) * 100).toFixed(1) : 0}%</span>
          <span>Gastos: {totalGastos > 0 ? ((totalGastos / (totalIngresos + totalGastos)) * 100).toFixed(1) : 0}%</span>
        </div>
      </div>

      {/* Gastos por categoría */}
      {Object.keys(gastosPorCategoria).length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="font-medium text-gray-800 mb-4">Gastos por Categoría</h4>
          <div className="space-y-3">
            {Object.entries(gastosPorCategoria)
              .sort(([,a], [,b]) => b - a)
              .map(([categoria, monto]) => {
                const porcentaje = (monto / totalGastos) * 100;
                return (
                  <div key={categoria}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium capitalize">{categoria}</span>
                      <span className="text-sm text-gray-600">
                        ${monto.toLocaleString()} ({porcentaje.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${categoriaColores[categoria]}`}
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Objetivos */}
      {objetivos.length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="font-medium text-gray-800 mb-4">Progreso de Objetivos</h4>
          <div className="space-y-4">
            {objetivos.map((objetivo) => {
              const progreso = Math.min((objetivo.actual / objetivo.meta) * 100, 100);
              const restante = Math.max(objetivo.meta - objetivo.actual, 0);
              return (
                <div key={objetivo.id} className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-blue-800">{objetivo.nombre}</span>
                    <span className="text-sm text-blue-600">
                      ${objetivo.actual.toLocaleString()} / ${objetivo.meta.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-blue-200 rounded-full h-3 mb-2">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-700"
                      style={{ width: `${progreso}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-blue-600">
                    <span>{progreso.toFixed(1)}% completado</span>
                    <span>Faltan ${restante.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Historial completo */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h4 className="font-medium text-gray-800 mb-4">Todas las Transacciones ({todasTransacciones.length})</h4>
        {todasTransacciones.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 size={48} className="mx-auto mb-3 opacity-50" />
            <p>No hay transacciones registradas</p>
            <p className="text-sm">¡Comienza agregando ingresos y gastos!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {todasTransacciones.map((transaccion) => (
              <div key={transaccion.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{transaccion.descripcion}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaccion.fecha).toLocaleDateString('es-ES')} • {transaccion.categoria}
                    </p>
                  </div>
                  <span className={`font-bold ${transaccion.monto > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaccion.monto > 0 ? '+' : '-'}${Math.abs(transaccion.monto).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Pantalla de Perfil con gestión de objetivos
const PerfilScreen = ({ objetivos, setObjetivos }) => {
  const [nuevoObjetivo, setNuevoObjetivo] = useState({ nombre: '', meta: '', actual: 0 });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const agregarObjetivo = () => {
    if (nuevoObjetivo.nombre && nuevoObjetivo.meta) {
      const nuevo = {
        id: Date.now(),
        nombre: nuevoObjetivo.nombre,
        meta: parseFloat(nuevoObjetivo.meta),
        actual: 0
      };
      setObjetivos([...objetivos, nuevo]);
      setNuevoObjetivo({ nombre: '', meta: '', actual: 0 });
      setMostrarFormulario(false);
    }
  };

  const eliminarObjetivo = (id) => {
    setObjetivos(objetivos.filter(obj => obj.id !== id));
  };

  const actualizarProgreso = (id, nuevoProgreso) => {
    setObjetivos(objetivos.map(obj => 
      obj.id === id ? { ...obj, actual: parseFloat(nuevoProgreso) || 0 } : obj
    ));
  };

  return (
    <div className="p-4 space-y-6 animate-slideInRight">
      {/* Header del perfil */}
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
          <User size={48} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Mi Perfil Financiero</h2>
        <p className="text-gray-600">Gestiona tus objetivos y configuración</p>
      </div>

      {/* Gestión de objetivos */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Mis Objetivos</h3>
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Nuevo Objetivo
          </button>
        </div>

        {/* Formulario nuevo objetivo */}
        {mostrarFormulario && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre del objetivo (ej: Ahorro para vacaciones)"
                value={nuevoObjetivo.nombre}
                onChange={(e) => setNuevoObjetivo({...nuevoObjetivo, nombre: e.target.value})}
                className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Meta en $"
                value={nuevoObjetivo.meta}
                onChange={(e) => setNuevoObjetivo({...nuevoObjetivo, meta: e.target.value})}
                className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex gap-3">
                <button
                  onClick={agregarObjetivo}
                  className="flex-1 bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Crear Objetivo
                </button>
                <button
                  onClick={() => {
                    setMostrarFormulario(false);
                    setNuevoObjetivo({ nombre: '', meta: '', actual: 0 });
                  }}
                  className="px-6 bg-gray-500 text-white p-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de objetivos */}
        {objetivos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target size={48} className="mx-auto mb-3 opacity-50" />
            <p>No tienes objetivos financieros aún</p>
            <p className="text-sm">¡Crea tu primer objetivo arriba!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {objetivos.map((objetivo) => {
              const progreso = Math.min((objetivo.actual / objetivo.meta) * 100, 100);
              return (
                <div key={objetivo.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{objetivo.nombre}</h4>
                      <p className="text-sm text-gray-600">
                        Meta: ${objetivo.meta.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => eliminarObjetivo(objetivo.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progreso: {progreso.toFixed(1)}%</span>
                      <span>${objetivo.actual.toLocaleString()} / ${objetivo.meta.toLocaleString()}</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progreso}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Actualizar progreso"
                      value={objetivo.actual}
                      onChange={(e) => actualizarProgreso(objetivo.id, e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Configuración */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-medium text-gray-800 mb-4">Configuración</h3>
        <div className="space-y-2">
          <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3">
            <Calendar size={16} className="text-gray-600" />
            <span>Recordatorios de gastos</span>
          </button>
          <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3">
            <BarChart3 size={16} className="text-gray-600" />
            <span>Exportar datos</span>
          </button>
          <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3">
            <Target size={16} className="text-gray-600" />
            <span>Configurar presupuesto</span>
          </button>
        </div>
      </div>

      {/* Información de la app */}
      <div className="text-center text-sm text-gray-500">
        <p>Dashboard Financiero PWA</p>
        <p>Versión 1.0.0</p>
      </div>
    </div>
  );
};

// Componente principal
const NativeDashboardApp = () => {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [ingresos, setIngresos] = useLocalStorage('ingresos', []);
  const [gastos, setGastos] = useLocalStorage('gastos', []);
  const [objetivos, setObjetivos] = useLocalStorage('objetivos', []);

  const renderScreen = () => {
    const screenProps = { ingresos, setIngresos, gastos, setGastos, objetivos, setObjetivos };
    
    switch (activeScreen) {
      case 'dashboard':
        return <DashboardScreen setActiveScreen={setActiveScreen} {...screenProps} />;
      case 'ingresos':
        return <IngresosScreen ingresos={ingresos} setIngresos={setIngresos} />;
      case 'gastos':
        return <GastosScreen gastos={gastos} setGastos={setGastos} />;
      case 'estadisticas':
        return <EstadisticasScreen {...screenProps} />;
      case 'perfil':
        return <PerfilScreen objetivos={objetivos} setObjetivos={setObjetivos} />;
      default:
        return <DashboardScreen setActiveScreen={setActiveScreen} {...screenProps} />;
    }
  };

  const getScreenTitle = () => {
    const titles = {
      'dashboard': 'Mi Dashboard',
      'ingresos': 'Gestión de Ingresos',
      'gastos': 'Gestión de Gastos',
      'estadisticas': 'Estadísticas y Análisis',
      'perfil': 'Perfil y Objetivos'
    };
    return titles[activeScreen] || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AppHeader 
        title={getScreenTitle()} 
        showBack={activeScreen !== 'dashboard'}
        onBack={() => setActiveScreen('dashboard')}
      />
      
      {/* Contenido principal - con padding bottom para la navegación */}
      <div className="pb-20 min-h-[calc(100vh-140px)]">
        {renderScreen()}
      </div>
      
      {/* Navegación inferior */}
      <BottomNavigation 
        activeScreen={activeScreen} 
        setActiveScreen={setActiveScreen} 
      />

      {/* Estilos para animaciones */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NativeDashboardApp;