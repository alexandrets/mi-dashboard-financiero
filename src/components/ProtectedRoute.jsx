import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()
  
  // Si no hay usuario autenticado, redirigir a login
  if (!currentUser) {
    return <Navigate to="/login" />
  }
  
  // Si hay usuario, mostrar el contenido
  return children
}

export default ProtectedRoute