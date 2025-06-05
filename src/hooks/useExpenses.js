import { useState, useEffect } from 'react'
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'

export function useExpenses() {
  const { currentUser } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!currentUser) {
      setTransactions([])
      setLoading(false)
      return
    }

    // Intentar primero ordenar por createdAt, si falla usar solo where
    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', currentUser.uid)
    )

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const transactionsData = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          transactionsData.push({
            id: doc.id,
            ...data,
            // Si no tiene 'type', asumir que es un gasto (datos viejos)
            type: data.type || 'gasto'
          })
        })
        
        // Ordenar manualmente por fecha más reciente
        transactionsData.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date || 0)
          const dateB = new Date(b.createdAt || b.date || 0)
          return dateB - dateA
        })
        
        setTransactions(transactionsData)
        setLoading(false)
        setError(null)
      },
      (error) => {
        console.error('Error al obtener transacciones:', error)
        setError('Error al cargar las transacciones: ' + error.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [currentUser])

  // Separar ingresos y gastos (datos viejos serán gastos por defecto)
  const expenses = transactions.filter(t => (t.type || 'gasto') === 'gasto')
  const incomes = transactions.filter(t => t.type === 'ingreso')

  // Calcular totales
  const calculateTotals = () => {
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
    const totalIncomes = incomes.reduce((sum, income) => sum + (income.amount || 0), 0)
    const balance = totalIncomes - totalExpenses

    // Gastos por categoría
    const expensesByCategory = expenses.reduce((acc, expense) => {
      const category = expense.category || 'Sin categoría'
      acc[category] = (acc[category] || 0) + (expense.amount || 0)
      return acc
    }, {})

    // Ingresos por categoría
    const incomesByCategory = incomes.reduce((acc, income) => {
      const category = income.category || 'Sin categoría'
      acc[category] = (acc[category] || 0) + (income.amount || 0)
      return acc
    }, {})

    // Gastos del mes actual
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const thisMonthExpenses = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date || expense.createdAt)
        return expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear
      })
      .reduce((sum, expense) => sum + (expense.amount || 0), 0)

    const thisMonthIncomes = incomes
      .filter(income => {
        const incomeDate = new Date(income.date || income.createdAt)
        return incomeDate.getMonth() === currentMonth && 
               incomeDate.getFullYear() === currentYear
      })
      .reduce((sum, income) => sum + (income.amount || 0), 0)

    return {
      totalExpenses,
      totalIncomes,
      balance,
      expensesByCategory,
      incomesByCategory,
      thisMonthExpenses,
      thisMonthIncomes,
      thisMonthBalance: thisMonthIncomes - thisMonthExpenses
    }
  }

  const totals = calculateTotals()

  // Agregar nueva transacción
  const addExpense = async (transactionData) => {
    try {
      await addDoc(collection(db, 'expenses'), {
        ...transactionData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error al agregar transacción:', error)
      throw error
    }
  }

  // Eliminar transacción
  const deleteExpense = async (transactionId) => {
    try {
      await deleteDoc(doc(db, 'expenses', transactionId))
    } catch (error) {
      console.error('Error al eliminar transacción:', error)
      throw error
    }
  }

  return {
    // Todos las transacciones
    transactions,
    // Separados por tipo
    expenses,
    incomes,
    // Estados
    loading,
    error,
    // Totales calculados
    totals,
    // Funciones
    addExpense,
    deleteExpense
  }
}