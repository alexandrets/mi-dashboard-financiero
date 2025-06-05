import React, { useState, useEffect } from 'react';
import { Home, TrendingUp, TrendingDown, BarChart3, CreditCard, User, Plus, ArrowLeft, Calendar, Target, Trash2, Edit3, Monitor, Smartphone, Settings } from 'lucide-react';

// Imports de tus componentes originales
import { useExpenses } from './hooks/useExpenses';
import { useAuth } from './contexts/AuthContext';
import DonutChart from './components/DonutChart';
import SavingsGoals from './components/SavingsGoals';
import Budgets from './components/Budgets';
import RecurringTransactions from './components/RecurringTransactions';
import TrendsChart from './components/TrendsChart';
import QuickTransactionForm from './components/QuickTransactionForm';
import InstallPWA from './components/InstallPWA';

// Hook para localStorage (para objetivos en vista móvil)
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
// VISTA WEB/DESKTOP (TODAS TUS FUNCIONALIDADES ORIGINALES)
// ===========================================

const WebDashboard = () => {
  const { currentUser, logout } = useAuth();
  const { transactions, loading, error, deleteExpense, totals, addExpense } = useExpenses();
  const [isQuickFormOpen, setIsQuickFormOpen] = useState(false);

  // Todas tus funciones originales del Dashboard
  const handleDelete = async (transactionId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      try {
        await deleteExpense(transactionId);
        console.log('✅ Transacción eliminada:', transactionId);
      } catch (error) {
        console.error('❌ Error al eliminar:', error);
        alert('Error al eliminar transacción: ' + error.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleTransactionAdded = (newTransaction) => {
    console.log('🎉 handleTransactionAdded ejecutado con:', newTransaction);
    setIsQuickFormOpen(false);
  };

  const handleCloseModal = () => {
    console.log('❌ handleCloseModal ejecutado');
    setIsQuickFormOpen(false);
  };

  // Componente para una tarjeta de estadística elegante (tu original)
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

  // Debug - Estado inicial del Dashboard
  useEffect(() => {
    console.log('🏠 Dashboard montado con estado inicial:')
    console.log('  - Usuario:', currentUser?.email)
    console.log('  - Transacciones iniciales:', transactions.length)
    console.log('  - Loading:', loading)
    console.log('  - Error:', error)
  }, [])

  // Debug del estado del modal
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
    
    console.log('🎣 Hook useExpenses retorna:', {
      transactions: transactions?.length || 0,
      totals: !!totals,
      addExpense: typeof addExpense,
      deleteExpense: typeof deleteExpense,
      loading,
      error
    })
  }, [transactions, isQuickFormOpen, addExpense, deleteExpense, totals, loading, error])

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
      {/* Header Premium - TU DISEÑO ORIGINAL */}
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
        {/* Estadísticas Elegantes - TU DISEÑO ORIGINAL */}
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
          {/* Gráfico de Dona con Transacciones - TU COMPONENTE ORIGINAL */}
          <div className="lg:col-span-2">
            <DonutChart 
              data={totals.expensesByCategory} 
              title="Gastos por Categoría"
              transactions={transactions}
            />
          </div>

          {/* Panel de Acciones - TU DISEÑO ORIGINAL */}
          <div className="lg:col-span-1 space-y-6">
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

            {/* Transacciones Recientes - TU DISEÑO ORIGINAL */}
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

        {/* TODOS TUS MÓDULOS ORIGINALES */}
        
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

        {/* Top Transacciones de Gastos - TU MÓDULO ORIGINAL COMPLETO */}
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

        {/* Gráfico de Tendencias Temporales - TU COMPONENTE ORIGINAL */}
        <div className="mb-8">
          <TrendsChart />
        </div>
      </div>

      {/* Modal de Transacción Rápida - TU COMPONENTE ORIGINAL */}
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

      {/* Componente PWA - TU COMPONENTE ORIGINAL */}
      <InstallPWA />
    </div>
  );
};

// ===========================================
// VISTA MÓVIL (Navegación por pantallas)
// ===========================================

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

// Pantalla Dashboard móvil (usando localStorage para datos móviles)
const MobileDashboardScreen = ({ setActiveScreen, ingresos, gastos, objetivos }) => {
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

// Pantalla de Ingresos móvil
const MobileIngresosScreen = ({ ingresos, setIngresos }) => {
  const [nuevoIngreso, setNuevoIngreso] = useState({ 
    descripcion: '', 
    monto: '', 
    categoria: 'trabajo',
    fecha: new Date().toISOString().split('T')[0]
  });

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

  const totalIngresos = ingresos.reduce((sum, item) => sum + item.monto, 0);

  return (
    <div className="p-4 space-y-6 animate-slideInRight">
      {/* Total */}
      <div className="bg-green-50 p-4 rounded-xl border border-green-200">
        <div className="text-center">
          <p className="text-sm text-green-600">Total de Ingresos</p>
          <p className="text-2xl font-bold text-green-700">${totalIngresos.toLocaleString()}</p>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Nuevo Ingreso</h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Descripción"
            value={nuevoIngreso.descripcion}
            onChange={(e) => setNuevoIngreso({...nuevoIngreso, descripcion: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Monto"
            value={nuevoIngreso.monto}
            onChange={(e) => setNuevoIngreso({...nuevoIngreso, monto: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            onClick={agregarIngreso}
            className="w-full bg-green-600 text-white p-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Agregar Ingreso
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Mis Ingresos ({ingresos.length})</h3>
        {ingresos.map((ingreso) => (
          <div key={ingreso.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">{ingreso.descripcion}</p>
                <p className="text-sm text-gray-500">{ingreso.fecha} • {ingreso.categoria}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-green-600">+${ingreso.monto.toLocaleString()}</span>
                <button
                  onClick={() => eliminarIngreso(ingreso.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Pantalla de Gastos móvil
const MobileGastosScreen = ({ gastos, setGastos }) => {
  const [nuevoGasto, setNuevoGasto] = useState({ 
    descripcion: '', 
    monto: '', 
    categoria: 'alimentacion',
    fecha: new Date().toISOString().split('T')[0]
  });

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

  const totalGastos = Math.abs(gastos.reduce((sum, item) => sum + item.monto, 0));

  return (
    <div className="p-4 space-y-6 animate-slideInRight">
      {/* Total */}
      <div className="bg-red-50 p-4 rounded-xl border border-red-200">
        <div className="text-center">
          <p className="text-sm text-red-600">Total de Gastos</p>
          <p className="text-2xl font-bold text-red-700">${totalGastos.toLocaleString()}</p>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Nuevo Gasto</h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Descripción"
            value={nuevoGasto.descripcion}
            onChange={(e) => setNuevoGasto({...nuevoGasto, descripcion: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Monto"
            value={nuevoGasto.monto}
            onChange={(e) => setNuevoGasto({...nuevoGasto, monto: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <button
            onClick={agregarGasto}
            className="w-full bg-red-600 text-white p-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Agregar Gasto
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Mis Gastos ({gastos.length})</h3>
        {gastos.map((gasto) => (
          <div key={gasto.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">{gasto.descripcion}</p>
                <p className="text-sm text-gray-500">{gasto.fecha} • {gasto.categoria}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-red-600">-${Math.abs(gasto.monto).toLocaleString()}</span>
                <button
                  onClick={() => eliminarGasto(gasto.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Pantalla de Estadísticas móvil
const MobileEstadisticasScreen = ({ ingresos, gastos, objetivos }) => {
  const totalIngresos = ingresos.reduce((sum, item) => sum + item.monto, 0);
  const totalGastos = Math.abs(gastos.reduce((sum, item) => sum + item.monto, 0));
  const balance = totalIngresos - totalGastos;

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

// Pantalla de Perfil móvil
const MobilePerfilScreen = ({ objetivos, setObjetivos }) => {
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
                placeholder="Nombre del objetivo"
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Vista móvil completa
const MobileDashboard = () => {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [ingresos, setIngresos] = useLocalStorage('mobile_ingresos', []);
  const [gastos, setGastos] = useLocalStorage('mobile_gastos', []);
  const [objetivos, setObjetivos] = useLocalStorage('mobile_objetivos', []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const screen = urlParams.get('screen');
    if (screen) {
      setActiveScreen(screen);
    }
  }, []);

  const renderScreen = () => {
    const screenProps = { ingresos, setIngresos, gastos, setGastos, objetivos, setObjetivos };
    
    switch (activeScreen) {
      case 'dashboard':
        return <MobileDashboardScreen setActiveScreen={setActiveScreen} {...screenProps} />;
      case 'ingresos':
        return <MobileIngresosScreen ingresos={ingresos} setIngresos={setIngresos} />;
      case 'gastos':
        return <MobileGastosScreen gastos={gastos} setGastos={setGastos} />;
      case 'estadisticas':
        return <MobileEstadisticasScreen {...screenProps} />;
      case 'perfil':
        return <MobilePerfilScreen objetivos={objetivos} setObjetivos={setObjetivos} />;
      default:
        return <MobileDashboardScreen setActiveScreen={setActiveScreen} {...screenProps} />;
    }
  };

  const getScreenTitle = () => {
    const titles = {
      'dashboard': 'Mi Dashboard',
      'ingresos': 'Gestión de Ingresos',
      'gastos': 'Gestión de Gastos',
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

const HybridDashboardApp = () => {
  const [forceView, setForceView] = useLocalStorage('preferredView', null);
  const context = useViewContext();

  // Decidir qué vista mostrar
  const shouldShowMobile = forceView === 'mobile' || 
                          (forceView !== 'web' && (context.isMobile || context.isPWA));

  const currentView = shouldShowMobile ? 'mobile' : 'web';

  const handleViewChange = (view) => {
    setForceView(view);
  };

  return (
    <>
      {/* Toggle de vista manual */}
      <ViewToggle 
        currentView={currentView} 
        onViewChange={handleViewChange}
        context={context}
      />

      {/* Renderizar la vista apropiada */}
      {shouldShowMobile ? (
        <MobileDashboard />
      ) : (
        <WebDashboard />
      )}

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
    </>
  );
};

export default HybridDashboardApp;