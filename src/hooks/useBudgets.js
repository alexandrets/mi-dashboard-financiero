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

    // Consulta simplificada sin orderBy para evitar la necesidad de índice
    const q = query(
      collection(db, 'budgets'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        try {
          const budgetsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          // Ordenar en el cliente por fecha de creación
          .sort((a, b) => {
            const aTime = a.createdAt?.toDate?.() || new Date(0);
            const bTime = b.createdAt?.toDate?.() || new Date(0);
            return bTime - aTime; // Más reciente primero
          });
          
          setBudgets(budgetsData);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching budgets:', err);
          setError('Error al cargar los presupuestos');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error in budgets listener:', err);
        setError('Error de conexión');
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
        b.category.toLowerCase() === budgetData.category.toLowerCase()
      );
      
      if (existingBudget) {
        throw new Error(`Ya existe un presupuesto para la categoría "${budgetData.category}"`);
      }

      const docRef = await addDoc(collection(db, 'budgets'), {
        ...budgetData,
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
      await updateDoc(budgetRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
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
    return budgets.find(budget => 
      budget.category.toLowerCase() === category.toLowerCase()
    );
  };

  // Calcular total de límites de presupuestos
  const getTotalBudgetLimits = () => {
    return budgets.reduce((total, budget) => total + (budget.limit || 0), 0);
  };

  // Obtener categorías con presupuesto
  const getCategoriesWithBudget = () => {
    return budgets.map(budget => budget.category);
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