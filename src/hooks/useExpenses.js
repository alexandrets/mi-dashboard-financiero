// src/hooks/useExpenses.js
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

export function useExpenses() {
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Simular carga inicial
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [currentUser])

  return {
    loading,
    error
  }
}