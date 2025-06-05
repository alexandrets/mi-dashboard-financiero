import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden')
    }

    if (password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres')
    }

    try {
      setError('')
      setLoading(true)
      await register(email, password)
      navigate('/')
    } catch (error) {
      console.error('Register error:', error)
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('Ya existe una cuenta con este email')
          break
        case 'auth/invalid-email':
          setError('Email inválido')
          break
        case 'auth/weak-password':
          setError('La contraseña es muy débil. Debe tener al menos 6 caracteres')
          break
        default:
          setError('Error al crear la cuenta. Inténtalo de nuevo')
      }
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl text-white">💰</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ¡Únete a nosotros!
          </h1>
          <p className="text-gray-600">
            Comienza a controlar tus finanzas hoy
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Crear Cuenta
            </h2>
            <p className="text-gray-600">
              Regístrate para acceder a tu dashboard
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg">
              <div className="flex items-center">
                <span className="text-red-400 text-xl mr-3">⚠️</span>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📧 Email
              </label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🔒 Contraseña
              </label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Debe tener al menos 6 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🔒 Confirmar Contraseña
              </label>
              <input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                disabled={loading}
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  Las contraseñas no coinciden
                </p>
              )}
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="animate-spin">⏳</span>
                  <span>Creando cuenta...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>✨</span>
                  <span>Crear Cuenta</span>
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-8 bg-white bg-opacity-60 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="font-bold text-gray-800 mb-4 text-center">
            ¿Qué obtienes al registrarte?
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">💰</span>
              <span className="text-gray-700">Control total de gastos</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📈</span>
              <span className="text-gray-700">Reportes automáticos</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎯</span>
              <span className="text-gray-700">Categorización inteligente</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔐</span>
              <span className="text-gray-700">100% seguro y privado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register