import React from 'react';

const DebugTransactions = ({ transactions }) => {
  // Calcular gastos por categoría para debug
  const gastosPorCategoria = {};
  const gastos = transactions.filter(t => t.type === 'gasto');
  
  gastos.forEach(gasto => {
    const categoria = gasto.category?.toLowerCase() || 'otros';
    if (!gastosPorCategoria[categoria]) {
      gastosPorCategoria[categoria] = [];
    }
    gastosPorCategoria[categoria].push(gasto);
  });

  return (
    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="font-bold text-yellow-800 mb-2">🔍 Debug de Transacciones</h3>
      
      <div className="mb-4">
        <p className="text-sm text-yellow-700">
          <strong>Total transacciones:</strong> {transactions.length} | 
          <strong> Gastos:</strong> {gastos.length}
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold text-yellow-800">Gastos por categoría:</h4>
        {Object.entries(gastosPorCategoria).map(([categoria, transacciones]) => {
          const totalGastado = transacciones.reduce((sum, t) => sum + (t.amount || 0), 0);
          return (
            <div key={categoria} className="bg-yellow-100 p-2 rounded text-sm">
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  📂 {categoria} ({transacciones.length} transacciones)
                </span>
                <span className="font-bold text-red-600">
                  €{totalGastado.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-yellow-600 mt-1">
                {transacciones.map(t => `${t.description}: €${t.amount}`).join(', ')}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-yellow-600">
        <details>
          <summary className="cursor-pointer font-medium">Ver todas las transacciones (JSON)</summary>
          <pre className="mt-2 bg-yellow-200 p-2 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(transactions, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default DebugTransactions;