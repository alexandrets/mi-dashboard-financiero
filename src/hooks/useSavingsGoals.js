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

export const useSavingsGoals = () => {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { currentUser } = useAuth()

  // Cargar metas de la base de datos
  useEffect(() => {
    if (!currentUser) {
      setGoals([])
      setLoading(false)
      return
    }

    setLoading(true)
    
    // Query simple SIN orderBy - no necesita índice
    const q = query(
      collection(db, 'savingsGoals'),
      where('userId', '==', currentUser.uid)
    )

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const goalsData = []
        querySnapshot.forEach((doc) => {
          goalsData.push({
            id: doc.id,
            ...doc.data()
          })
        })
        
        // Ordenar en el cliente por fecha (más reciente primero)
        goalsData.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
          return dateB - dateA
        })
        
        setGoals(goalsData)
        setLoading(false)
        setError(null)
      },
      (error) => {
        console.error('Error loading savings goals:', error)
        setError('Error al cargar las metas de ahorro: ' + error.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [currentUser])

  // Agregar nueva meta
  const addGoal = async (goalData) => {
    if (!currentUser) {
      throw new Error('Usuario no autenticado')
    }

    try {
      const newGoal = {
        ...goalData,
        userId: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await addDoc(collection(db, 'savingsGoals'), newGoal)
    } catch (error) {
      console.error('Error adding savings goal:', error)
      throw new Error('Error al crear la meta: ' + error.message)
    }
  }

  // Actualizar meta existente
  const updateGoal = async (goalId, updates) => {
    if (!currentUser) {
      throw new Error('Usuario no autenticado')
    }

    try {
      const goalRef = doc(db, 'savingsGoals', goalId)
      await updateDoc(goalRef, {
        ...updates,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating savings goal:', error)
      throw new Error('Error al actualizar la meta: ' + error.message)
    }
  }

  // Eliminar meta
  const deleteGoal = async (goalId) => {
    if (!currentUser) {
      throw new Error('Usuario no autenticado')
    }

    if (!window.confirm('¿Estás seguro de que quieres eliminar esta meta?')) {
      return
    }

    try {
      await deleteDoc(doc(db, 'savingsGoals', goalId))
    } catch (error) {
      console.error('Error deleting savings goal:', error)
      throw new Error('Error al eliminar la meta: ' + error.message)
    }
  }

  // Agregar ahorros a una meta
  const addSavings = async (goalId, amount) => {
    if (!currentUser) {
      throw new Error('Usuario no autenticado')
    }

    try {
      const goal = goals.find(g => g.id === goalId)
      if (!goal) {
        throw new Error('Meta no encontrada')
      }

      const newSavedAmount = Math.min(goal.savedAmount + amount, goal.targetAmount)
      
      await updateGoal(goalId, {
        savedAmount: newSavedAmount
      })
    } catch (error) {
      console.error('Error adding savings:', error)
      throw new Error('Error al agregar ahorros: ' + error.message)
    }
  }

  // Funciones de estadísticas
  const getTotalSaved = () => {
    return goals.reduce((total, goal) => total + (goal.savedAmount || 0), 0)
  }

  const getTotalTarget = () => {
    return goals.reduce((total, goal) => total + (goal.targetAmount || 0), 0)
  }

  const getCompletedGoals = () => {
    return goals.filter(goal => (goal.savedAmount || 0) >= (goal.targetAmount || 0))
  }

  const getActiveGoals = () => {
    return goals.filter(goal => (goal.savedAmount || 0) < (goal.targetAmount || 0))
  }

  return {
    goals,
    loading,
    error,
    addGoal,
    updateGoal,
    deleteGoal,
    addSavings,
    getTotalSaved,
    getTotalTarget,
    getCompletedGoals,
    getActiveGoals
  }
}