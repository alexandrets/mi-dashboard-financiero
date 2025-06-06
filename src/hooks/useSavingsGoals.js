import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

export const useSavingsGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  // Escuchar cambios en tiempo real
  useEffect(() => {
    if (!currentUser) {
      setGoals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'savingsGoals'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        try {
          const goalsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setGoals(goalsData);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching goals:', err);
          setError('Error al cargar las metas');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error in goals listener:', err);
        setError('Error de conexión');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Agregar nueva meta
  const addGoal = async (goalData) => {
    if (!currentUser) throw new Error('Usuario no autenticado');

    try {
      const docRef = await addDoc(collection(db, 'savingsGoals'), {
        ...goalData,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('Meta creada con ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw new Error('Error al crear la meta');
    }
  };

  // Actualizar meta existente
  const updateGoal = async (goalId, updates) => {
    if (!currentUser) throw new Error('Usuario no autenticado');

    try {
      const goalRef = doc(db, 'savingsGoals', goalId);
      await updateDoc(goalRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      console.log('Meta actualizada:', goalId);
    } catch (error) {
      console.error('Error updating goal:', error);
      throw new Error('Error al actualizar la meta');
    }
  };

  // Eliminar meta
  const deleteGoal = async (goalId) => {
    if (!currentUser) throw new Error('Usuario no autenticado');

    try {
      const goalRef = doc(db, 'savingsGoals', goalId);
      await deleteDoc(goalRef);
      
      console.log('Meta eliminada:', goalId);
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw new Error('Error al eliminar la meta');
    }
  };

  // Añadir dinero a una meta
  const addSavings = async (goalId, amount) => {
    if (!currentUser) throw new Error('Usuario no autenticado');

    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) throw new Error('Meta no encontrada');

      const newSavedAmount = goal.savedAmount + amount;
      
      const goalRef = doc(db, 'savingsGoals', goalId);
      await updateDoc(goalRef, {
        savedAmount: newSavedAmount,
        updatedAt: serverTimestamp()
      });
      
      console.log('Ahorros añadidos a la meta:', goalId, amount);
    } catch (error) {
      console.error('Error adding savings:', error);
      throw new Error('Error al agregar ahorros');
    }
  };

  // Funciones de estadísticas
  const getTotalSaved = () => {
    return goals.reduce((total, goal) => total + (goal.savedAmount || 0), 0);
  };

  const getTotalTarget = () => {
    return goals.reduce((total, goal) => total + (goal.targetAmount || 0), 0);
  };

  const getCompletedGoals = () => {
    return goals.filter(goal => (goal.savedAmount || 0) >= (goal.targetAmount || 0));
  };

  const getActiveGoals = () => {
    const today = new Date().toISOString().split('T')[0];
    return goals.filter(goal => {
      const isCompleted = (goal.savedAmount || 0) >= (goal.targetAmount || 0);
      const isNotExpired = !goal.targetDate || goal.targetDate >= today;
      return !isCompleted && isNotExpired;
    });
  };

  const getOverdueGoals = () => {
    const today = new Date().toISOString().split('T')[0];
    return goals.filter(goal => {
      const isCompleted = (goal.savedAmount || 0) >= (goal.targetAmount || 0);
      const isExpired = goal.targetDate && goal.targetDate < today;
      return !isCompleted && isExpired;
    });
  };

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
    getActiveGoals,
    getOverdueGoals
  };
};