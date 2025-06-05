import { useState, useEffect, useMemo } from 'react'
import { useExpenses } from './useExpenses'

export const useTrends = () => {
  const { transactions, loading } = useExpenses()
  const [selectedPeriod, setSelectedPeriod] = useState('30days')
  const [viewType, setViewType] = useState('daily') // daily, weekly, monthly

  // Períodos disponibles
  const periods = [
    { value: '7days', label: '7 días', days: 7 },
    { value: '30days', label: '30 días', days: 30 },
    { value: '3months', label: '3 meses', days: 90 },
    { value: '6months', label: '6 meses', days: 180 },
    { value: '1year', label: '1 año', days: 365 },
    { value: 'all', label: 'Todo', days: null }
  ]

  // Tipos de vista
  const viewTypes = [
    { value: 'daily', label: 'Diario' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' }
  ]

  // Formatear fecha para el gráfico (MOVER AQUÍ ANTES DE USARLO)
  const formatDateForChart = (dateString, viewType) => {
    const date = new Date(dateString)
    
    switch (viewType) {
      case 'weekly':
        return date.toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: 'short' 
        }) + ' (Sem)'
      case 'monthly':
        return date.toLocaleDateString('es-ES', { 
          month: 'short', 
          year: 'numeric' 
        })
      default: // daily
        return date.toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: 'short' 
        })
    }
  }

  // Filtrar transacciones por período seleccionado
  const filteredTransactions = useMemo(() => {
    if (!transactions.length) return []

    const period = periods.find(p => p.value === selectedPeriod)
    if (!period || !period.days) return transactions

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - period.days)

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date)
      return transactionDate >= cutoffDate
    })
  }, [transactions, selectedPeriod])

  // Generar datos para el gráfico de líneas
  const chartData = useMemo(() => {
    if (!filteredTransactions.length) return []

    // Agrupar transacciones por fecha según el tipo de vista
    const groupedData = {}

    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date)
      let key

      switch (viewType) {
        case 'weekly':
          // Agrupar por semana (lunes de cada semana)
          const startOfWeek = new Date(date)
          const day = startOfWeek.getDay()
          const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
          startOfWeek.setDate(diff)
          key = startOfWeek.toISOString().split('T')[0]
          break
        case 'monthly':
          // Agrupar por mes
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
          break
        default: // daily
          key = transaction.date
      }

      if (!groupedData[key]) {
        groupedData[key] = {
          date: key,
          ingresos: 0,
          gastos: 0,
          balance: 0,
          transactionCount: 0
        }
      }

      if (transaction.type === 'ingreso') {
        groupedData[key].ingresos += transaction.amount
      } else {
        groupedData[key].gastos += transaction.amount
      }
      
      groupedData[key].balance = groupedData[key].ingresos - groupedData[key].gastos
      groupedData[key].transactionCount += 1
    })

    // Convertir a array y ordenar por fecha
    const sortedData = Object.values(groupedData).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    )

    // Calcular balance acumulativo
    let cumulativeBalance = 0
    return sortedData.map(item => {
      cumulativeBalance += item.balance
      return {
        ...item,
        balanceAcumulativo: cumulativeBalance,
        // Formatear fecha para mostrar
        fechaFormateada: formatDateForChart(item.date, viewType)
      }
    })
  }, [filteredTransactions, viewType])

  // Calcular estadísticas de tendencias
  const trendStats = useMemo(() => {
    if (chartData.length < 2) {
      return {
        ingresosPromedio: 0,
        gastosPromedio: 0,
        balancePromedio: 0,
        tendenciaIngresos: 'neutral',
        tendenciaGastos: 'neutral',
        tendenciaBalance: 'neutral',
        mejorDia: null,
        peorDia: null,
        periodoActual: selectedPeriod
      }
    }

    const totalIngresos = chartData.reduce((sum, item) => sum + item.ingresos, 0)
    const totalGastos = chartData.reduce((sum, item) => sum + item.gastos, 0)
    const totalBalance = chartData.reduce((sum, item) => sum + item.balance, 0)

    // Calcular tendencias (comparar primera mitad vs segunda mitad)
    const midPoint = Math.floor(chartData.length / 2)
    const firstHalf = chartData.slice(0, midPoint)
    const secondHalf = chartData.slice(midPoint)

    const firstHalfAvgIngresos = firstHalf.reduce((sum, item) => sum + item.ingresos, 0) / firstHalf.length
    const secondHalfAvgIngresos = secondHalf.reduce((sum, item) => sum + item.ingresos, 0) / secondHalf.length

    const firstHalfAvgGastos = firstHalf.reduce((sum, item) => sum + item.gastos, 0) / firstHalf.length
    const secondHalfAvgGastos = secondHalf.reduce((sum, item) => sum + item.gastos, 0) / secondHalf.length

    const firstHalfAvgBalance = firstHalf.reduce((sum, item) => sum + item.balance, 0) / firstHalf.length
    const secondHalfAvgBalance = secondHalf.reduce((sum, item) => sum + item.balance, 0) / secondHalf.length

    // Determinar tendencias
    const getTrend = (first, second) => {
      const change = ((second - first) / Math.abs(first)) * 100
      if (change > 5) return 'up'
      if (change < -5) return 'down'
      return 'neutral'
    }

    // Encontrar mejor y peor día
    const mejorDia = chartData.reduce((best, current) => 
      current.balance > best.balance ? current : best
    )
    const peorDia = chartData.reduce((worst, current) => 
      current.balance < worst.balance ? current : worst
    )

    return {
      ingresosPromedio: totalIngresos / chartData.length,
      gastosPromedio: totalGastos / chartData.length,
      balancePromedio: totalBalance / chartData.length,
      tendenciaIngresos: getTrend(firstHalfAvgIngresos, secondHalfAvgIngresos),
      tendenciaGastos: getTrend(firstHalfAvgGastos, secondHalfAvgGastos),
      tendenciaBalance: getTrend(firstHalfAvgBalance, secondHalfAvgBalance),
      mejorDia,
      peorDia,
      periodoActual: selectedPeriod,
      totalPeriodos: chartData.length
    }
  }, [chartData, selectedPeriod])

  // Obtener datos para gráfico de categorías en el tiempo
  const getCategoryTrends = () => {
    const categoryData = {}
    
    filteredTransactions
      .filter(t => t.type === 'gasto')
      .forEach(transaction => {
        const date = transaction.date
        const category = transaction.category || 'Sin categoría'
        
        if (!categoryData[category]) {
          categoryData[category] = {}
        }
        
        if (!categoryData[category][date]) {
          categoryData[category][date] = 0
        }
        
        categoryData[category][date] += transaction.amount
      })

    return categoryData
  }

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Obtener color de tendencia
  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  // Obtener icono de tendencia
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '📈'
      case 'down': return '📉'
      default: return '➡️'
    }
  }

  return {
    chartData,
    trendStats,
    selectedPeriod,
    setSelectedPeriod,
    viewType,
    setViewType,
    periods,
    viewTypes,
    loading,
    getCategoryTrends,
    formatCurrency,
    getTrendColor,
    getTrendIcon,
    filteredTransactions
  }
}