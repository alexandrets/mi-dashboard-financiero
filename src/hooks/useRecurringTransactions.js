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

export const useRecurringTransactions = () => {
  const [recurringTransactions, setRecurringTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { currentUser } = useAuth()

  // Frecuencias disponibles
  const frequencies = [
    { value: 'weekly', label: 'Semanal', days: 7 },
    { value: 'biweekly', label: 'Quincenal', days: 14 },
    { value: 'monthly', label: 'Mensual', days: 30 },
    { value: 'quarterly', label: 'Trimestral', days: 90 },
    { value: 'biannual', label: 'Semestral', days: 180 },
    { value: 'annual', label: 'Anual', days: 365 }
  ]

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
    'Suscripciones',
    'Servicios',
    'Seguros',
    'Otros'
  ]

  // Cargar transacciones recurrentes de la base de datos
  useEffect(() => {
    if (!currentUser) {
      setRecurringTransactions([])
      setLoading(false)
      return
    }

    setLoading(true)
    
    const q = query(
      collection(db, 'recurringTransactions'),
      where('userId', '==', currentUser.uid)
    )

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const recurringData = []
        querySnapshot.forEach((doc) => {
          recurringData.push({
            id: doc.id,
            ...doc.data()
          })
        })
        
        // Ordenar por próxima fecha
        recurringData.sort((a, b) => {
          const dateA = new Date(a.nextDate || '2099-12-31')
          const dateB = new Date(b.nextDate || '2099-12-31')
          return dateA - dateB
        })
        
        setRecurringTransactions(recurringData)
        setLoading(false)
        setError(null)
      },
      (error) => {
        console.error('Error loading recurring transactions:', error)
        setError('Error al cargar las transacciones recurrentes: ' + error.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [currentUser])

  // Calcular próxima fecha basada en frecuencia
  const calculateNextDate = (lastDate, frequency) => {
    const freqData = frequencies.find(f => f.value === frequency)
    if (!freqData) return null

    const date = new Date(lastDate)
    date.setDate(date.getDate() + freqData.days)
    return date.toISOString().split('T')[0] // YYYY-MM-DD
  }

  // Agregar nueva transacción recurrente
  const addRecurringTransaction = async (transactionData) => {
    if (!currentUser) {
      throw new Error('Usuario no autenticado')
    }

    try {
      const nextDate = calculateNextDate(transactionData.startDate, transactionData.frequency)
      
      const newRecurring = {
        ...transactionData,
        amount: parseFloat(transactionData.amount),
        userId: currentUser.uid,
        nextDate: nextDate,
        isActive: true,
        lastExecuted: null,
        executionCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await addDoc(collection(db, 'recurringTransactions'), newRecurring)
    } catch (error) {
      console.error('Error adding recurring transaction:', error)
      throw new Error('Error al crear la transacción recurrente: ' + error.message)
    }
  }

  // Actualizar transacción recurrente existente
  const updateRecurringTransaction = async (recurringId, updates) => {
    if (!currentUser) {
      throw new Error('Usuario no autenticado')
    }

    try {
      const recurringRef = doc(db, 'recurringTransactions', recurringId)
      
      // Si se actualiza la frecuencia, recalcular próxima fecha
      if (updates.frequency) {
        const recurring = recurringTransactions.find(r => r.id === recurringId)
        if (recurring) {
          const baseDate = recurring.lastExecuted || recurring.startDate
          updates.nextDate = calculateNextDate(baseDate, updates.frequency)
        }
      }

      await updateDoc(recurringRef, {
        ...updates,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating recurring transaction:', error)
      throw new Error('Error al actualizar la transacción recurrente: ' + error.message)
    }
  }

  // Activar/Desactivar transacción recurrente
  const toggleRecurringTransaction = async (recurringId, isActive) => {
    await updateRecurringTransaction(recurringId, { isActive })
  }

  // Eliminar transacción recurrente
  const deleteRecurringTransaction = async (recurringId) => {
    if (!currentUser) {
      throw new Error('Usuario no autenticado')
    }

    if (!window.confirm('¿Estás seguro de que quieres eliminar esta transacción recurrente?')) {
      return
    }

    try {
      await deleteDoc(doc(db, 'recurringTransactions', recurringId))
    } catch (error) {
      console.error('Error deleting recurring transaction:', error)
      throw new Error('Error al eliminar la transacción recurrente: ' + error.message)
    }
  }

  // Ejecutar transacción recurrente (crear transacción real)
  const executeRecurringTransaction = async (recurringId, addExpenseFunction) => {
    if (!currentUser) {
      throw new Error('Usuario no autenticado')
    }

    try {
      const recurring = recurringTransactions.find(r => r.id === recurringId)
      if (!recurring) {
        throw new Error('Transacción recurrente no encontrada')
      }

      // Crear la transacción real
      const transactionData = {
        description: recurring.description,
        amount: recurring.amount,
        category: recurring.category,
        type: recurring.type,
        date: new Date().toISOString().split('T')[0]
      }

      // Usar la función addExpense del hook useExpenses
      await addExpenseFunction(transactionData)

      // Actualizar la transacción recurrente
      const nextDate = calculateNextDate(transactionData.date, recurring.frequency)
      await updateRecurringTransaction(recurringId, {
        lastExecuted: transactionData.date,
        nextDate: nextDate,
        executionCount: (recurring.executionCount || 0) + 1
      })

      return true
    } catch (error) {
      console.error('Error executing recurring transaction:', error)
      throw new Error('Error al ejecutar la transacción recurrente: ' + error.message)
    }
  }

  // Obtener transacciones que deberían ejecutarse hoy
  const getDueTransactions = () => {
    const today = new Date().toISOString().split('T')[0]
    return recurringTransactions.filter(recurring => 
      recurring.isActive && 
      recurring.nextDate && 
      recurring.nextDate <= today
    )
  }

  // Obtener próximas transacciones (próximos 30 días)
  const getUpcomingTransactions = (days = 30) => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)
    const futureDateStr = futureDate.toISOString().split('T')[0]
    
    return recurringTransactions.filter(recurring => 
      recurring.isActive && 
      recurring.nextDate && 
      recurring.nextDate <= futureDateStr
    )
  }

  // Obtener estadísticas
  const getRecurringStats = () => {
    const active = recurringTransactions.filter(r => r.isActive)
    const inactive = recurringTransactions.filter(r => !r.isActive)
    const totalMonthlyAmount = active.reduce((sum, recurring) => {
      // Convertir a cantidad mensual aproximada
      const freqData = frequencies.find(f => f.value === recurring.frequency)
      if (!freqData) return sum
      
      const monthlyMultiplier = 30 / freqData.days
      return sum + (recurring.amount * monthlyMultiplier)
    }, 0)

    return {
      total: recurringTransactions.length,
      active: active.length,
      inactive: inactive.length,
      totalMonthlyAmount: totalMonthlyAmount,
      dueToday: getDueTransactions().length
    }
  }

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return 'No programada'
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Calcular días hasta próxima ejecución
  const getDaysUntilNext = (nextDate) => {
    if (!nextDate) return null
    
    const today = new Date()
    const next = new Date(nextDate)
    const diffTime = next - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 0 // Vencida
    return diffDays
  }

  return {
    recurringTransactions,
    loading,
    error,
    frequencies,
    categories,
    addRecurringTransaction,
    updateRecurringTransaction,
    toggleRecurringTransaction,
    deleteRecurringTransaction,
    executeRecurringTransaction,
    getDueTransactions,
    getUpcomingTransactions,
    getRecurringStats,
    formatDate,
    getDaysUntilNext
  }
}