import { useState, useEffect } from 'react'
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  where
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'

export const useBudgets = () => {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { currentUser } = useAuth()

  // Categorías disponibles
  const categories = [
    'Alimentación',
    'Transporte', 
    'Hobbies',
    'Salud',
    'Estudios',
    'Ocio',
    'Vivienda',
    'Ropa',
    'Tecnología',
    'Otros'
  ]

  // Cargar presupuestos de la base de datos
  useEffect(() => {
    if (!currentUser) {
      setBudgets([])
      setLoading(false)
      return
    }

    setLoading(true)
    
    const q = query(
      collection(db, 'budgets'),
      where('userId', '==', currentUser.uid)
    )

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const budgetsData = []
        querySnapshot.forEach((doc) => {
          budgetsData.push({
            id: doc.id,
            ...doc.data()
          })
        })
        
        // Ordenar por categoría
        budgetsData.sort((a, b) => a.category.localeCompare(b.category))
        
        setBudgets(budgetsData)
        setLoading(false)
        setError(null)
      },
      (error) => {
        console.error('Error loading budgets:', error)
        setError('Error al cargar los presupuestos: ' + error.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [currentUser])

  // Agregar nuevo presupuesto
  const addBudget = async (category, amount) => {
    if (!currentUser) {
      throw new Error('Usuario no autenticado')
    }

    // Verificar si ya existe un presupuesto para esta categoría
    const existingBudget = budgets.find(b => b.category === category)
    if (existingBudget) {
      throw new Error('Ya existe un presupuesto para esta categoría')
    }

    try {
      const newBudget = {
        category,
        amount: parseFloat(amount),
        userId: currentUser.uid,
        month: new Date().toISOString().slice(0, 7), // YYYY-MM
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await addDoc(collection(db, 'budgets'), newBudget)
    } catch (error) {
      console.error('Error adding budget:', error)
      throw new Error('Error al crear el presupuesto: ' + error.message)
    }
  }

  // Actualizar presupuesto existente
  const updateBudget = async (budgetId, amount) => {
    if (!currentUser) {
      throw new Error('Usuario no autenticado')
    }

    try {
      const budgetRef = doc(db, 'budgets', budgetId)
      await updateDoc(budgetRef, {
        amount: parseFloat(amount),
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating budget:', error)
      throw new Error('Error al actualizar el presupuesto: ' + error.message)
    }
  }

  // Eliminar presupuesto
  const deleteBudget = async (budgetId) => {
    if (!currentUser) {
      throw new Error('Usuario no autenticado')
    }

    if (!window.confirm('¿Estás seguro de que quieres eliminar este presupuesto?')) {
      return
    }

    try {
      await deleteDoc(doc(db, 'budgets', budgetId))
    } catch (error) {
      console.error('Error deleting budget:', error)
      throw new Error('Error al eliminar el presupuesto: ' + error.message)
    }
  }

  // Función helper: obtener gasto actual por categoría
  const getSpentAmount = (category, expenses = []) => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    
    return expenses
      .filter(expense => 
        expense.category === category && 
        expense.type === 'gasto' &&
        expense.date?.startsWith(currentMonth)
      )
      .reduce((total, expense) => total + (expense.amount || 0), 0)
  }

  // Función helper: calcular estadísticas de presupuesto
  const getBudgetStats = (budget, expenses = []) => {
    const spent = getSpentAmount(budget.category, expenses)
    const remaining = Math.max(0, budget.amount - spent)
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
    const isExceeded = spent > budget.amount
    
    return {
      spent: spent,
      remaining: remaining,
      percentage: Math.round(percentage),
      isExceeded: isExceeded,
      status: isExceeded ? 'excedido' : 'dentro del presupuesto'
    }
  }

  // Obtener resumen total de presupuestos
  const getTotalBudgetSummary = (expenses = []) => {
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0)
    const totalSpent = budgets.reduce((sum, budget) => {
      return sum + getSpentAmount(budget.category, expenses)
    }, 0)
    
    const remaining = Math.max(0, totalBudget - totalSpent)
    const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
    
    return {
      totalBudget: totalBudget,
      totalSpent: totalSpent,
      remaining: remaining,
      percentage: Math.round(percentage),
      isExceeded: totalSpent > totalBudget
    }
  }

  // Obtener categorías disponibles (que no tienen presupuesto aún)
  const getAvailableCategories = () => {
    const usedCategories = budgets.map(b => b.category)
    return categories.filter(cat => !usedCategories.includes(cat))
  }

  // Obtener presupuestos con estadísticas
  const getBudgetsWithStats = (expenses = []) => {
    return budgets.map(budget => ({
      ...budget,
      stats: getBudgetStats(budget, expenses)
    }))
  }

  return {
    budgets,
    loading,
    error,
    categories,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetStats,
    getTotalBudgetSummary,
    getAvailableCategories,
    getBudgetsWithStats,
    getSpentAmount
  }
}