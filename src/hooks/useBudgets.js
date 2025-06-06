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
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

export const useBudgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  // Escuchar cambios en tiempo real
  useEffect(() => {
    if (!currentUser) {
      setBudgets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Consulta simplificada sin orderBy
    const q = query(
      collection(db, 'budgets'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        try {
          const budgetsData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              category: data.category || '',
              limit: data.limit || 0,
              period: data.period || 'monthly',
              userId: data.userId || '',
              createdAt: data.createdAt || null,
              updatedAt: data.updatedAt || null
            };
          });
          
          // Ordenar por fecha de creación (más reciente primero)
          budgetsData.sort((a, b) => {
            if (!a.createdAt && !b.createdAt) return 0;
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            
            const aTime = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
            const bTime = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
            return bTime - aTime;
          });
          
          setBudgets(budgetsData);
          setLoading(false);
        } catch (err) {
          console.error('Error processing budgets data:', err);
          setError('Error al procesar los presupuestos');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error in budgets listener:', err);
        setError('Error de conexión con la base de datos');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Agregar nuevo presupuesto
  const addBudget = async (budgetData) => {
    if (!currentUser) throw new Error('Usuario no autenticado');

    try {
      // Verificar si ya existe un presupuesto para esta categoría
      const existingBudget = budgets.find(b => 
        b.category && budgetData.category && 
        b.category.toLowerCase() === budgetData.category.toLowerCase()
      );
      
      if (existingBudget) {
        throw new Error(`Ya existe un presupuesto para la categoría "${budgetData.category}"`);
      }

      const docRef = await addDoc(collection(db, 'budgets'), {
        category: budgetData.category || '',
        limit: Number(budgetData.limit) || 0,
        period: budgetData.period || 'monthly',
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('Presupuesto creado con ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating budget:', error);
      throw new Error(error.message || 'Error al crear el presupuesto');
    }
  };

  // Actualizar presupuesto existente
  const updateBudget = async (budgetId, updates) => {
    if (!currentUser) throw new Error('Usuario no autenticado');

    try {
      const budgetRef = doc(db, 'budgets', budgetId);
      const updateData = {
        updatedAt: serverTimestamp()
      };
      
      if (updates.limit !== undefined) {
        updateData.limit = Number(updates.limit) || 0;
      }
      if (updates.period !== undefined) {
        updateData.period = updates.period;
      }
      if (updates.category !== undefined) {
        updateData.category = updates.category;
      }
      
      await updateDoc(budgetRef, updateData);
      console.log('Presupuesto actualizado:', budgetId);
    } catch (error) {
      console.error('Error updating budget:', error);
      throw new Error('Error al actualizar el presupuesto');
    }
  };

  // Eliminar presupuesto
  const deleteBudget = async (budgetId) => {
    if (!currentUser) throw new Error('Usuario no autenticado');

    try {
      const budgetRef = doc(db, 'budgets', budgetId);
      await deleteDoc(budgetRef);
      console.log('Presupuesto eliminado:', budgetId);
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw new Error('Error al eliminar el presupuesto');
    }
  };

  // Obtener presupuesto por categoría
  const getBudgetByCategory = (category) => {
    if (!category) return null;
    return budgets.find(budget => 
      budget.category && budget.category.toLowerCase() === category.toLowerCase()
    );
  };

  // Calcular total de límites de presupuestos
  const getTotalBudgetLimits = () => {
    return budgets.reduce((total, budget) => {
      const limit = Number(budget.limit) || 0;
      return total + limit;
    }, 0);
  };

  // Obtener categorías con presupuesto
  const getCategoriesWithBudget = () => {
    return budgets.map(budget => budget.category).filter(Boolean);
  };

  return {
    budgets,
    loading,
    error,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetByCategory,
    getTotalBudgetLimits,
    getCategoriesWithBudget
  };
};