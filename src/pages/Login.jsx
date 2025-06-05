import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import designTokens from '../styles/designTokens'

const tokens = designTokens

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setError('')
      setLoading(true)
      await login(email, password)
      navigate('/')
    } catch (error) {
      console.error('Login error:', error)
      
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No existe una cuenta con este email')
          break
        case 'auth/wrong-password':
          setError('Contraseña incorrecta')
          break
        case 'auth/invalid-email':
          setError('Email inválido')
          break
        case 'auth/too-many-requests':
          setError('Demasiados intentos fallidos. Intenta más tarde')
          break
        default:
          setError('Error al iniciar sesión. Verifica tus credenciales')
      }
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className={`text-center ${tokens.spacing.sectionMargin}`}>
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl text-white">💰</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            ¡Bienvenido de vuelta!
          </h1>
          <p className="text-blue-100">
            Accede a tu dashboard financiero
          </p>
        </div>

        {/* Formulario */}
        <div className={`${tokens.components.card.base} ${tokens.shadows.cardActive} ${tokens.spacing.cardPaddingLarge}`}>
          <div className={`text-center ${tokens.spacing.elementMargin}`}>
            <h2 className={`${tokens.typography.title.xl} ${tokens.colors.gray[800]} mb-2`}>
              Iniciar Sesión
            </h2>
            <p className={`${tokens.colors.gray[600]}`}>
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {error && (
            <div className={`${tokens.colors.danger.bg} border-l-4 ${tokens.colors.danger.border} p-4 ${tokens.spacing.elementMargin} ${tokens.borders.radius.md}`}>
              <div className="flex items-center">
                <span className={`${tokens.colors.danger.text} text-xl mr-3`}>⚠️</span>
                <p className={`${tokens.colors.danger.text} font-medium`}>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block ${tokens.typography.subtitle.sm} ${tokens.colors.gray[700]} mb-2`}>
                📧 Email
              </label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className={`w-full p-4 ${tokens.borders.input} ${tokens.borders.radius.lg} focus:ring-2 focus:ring-blue-500 ${tokens.borders.inputFocus} ${tokens.transitions.all} ${tokens.transitions.normal} ${tokens.typography.body.lg}`}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className={`block ${tokens.typography.subtitle.sm} ${tokens.colors.gray[700]} mb-2`}>
                🔒 Contraseña
              </label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full p-4 ${tokens.borders.input} ${tokens.borders.radius.lg} focus:ring-2 focus:ring-blue-500 ${tokens.borders.inputFocus} ${tokens.transitions.all} ${tokens.transitions.normal} ${tokens.typography.body.lg}`}
                disabled={loading}
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="animate-spin">⏳</span>
                  <span>Iniciando sesión...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>🚀</span>
                  <span>Iniciar Sesión</span>
                </span>
              )}
            </button>
          </form>

          <div className={`mt-8 text-center`}>
            <p className={tokens.colors.gray[600]}>
              ¿No tienes una cuenta?{' '}
              <Link 
                to="/register" 
                className={`${tokens.colors.secondary.text || 'text-blue-600'} hover:text-blue-700 ${tokens.typography.subtitle.md} ${tokens.transitions.colors}`}
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className={`mt-8 bg-white bg-opacity-60 ${tokens.borders.radius.xl} ${tokens.spacing.cardPadding} backdrop-blur-sm`}>
          <h3 className={`${tokens.typography.subtitle.lg} ${tokens.colors.gray[800]} mb-4 text-center`}>
            ¿Por qué elegir nuestro Dashboard?
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <div className={`flex items-center ${tokens.spacing.elementMarginSmall}`}>
              <span className="text-2xl">📊</span>
              <span className={`${tokens.colors.gray[700]}`}>Control total de tus gastos</span>
            </div>
            <div className={`flex items-center ${tokens.spacing.elementMarginSmall}`}>
              <span className="text-2xl">🔒</span>
              <span className={`${tokens.colors.gray[700]}`}>Datos seguros y privados</span>
            </div>
            <div className={`flex items-center ${tokens.spacing.elementMarginSmall}`}>
              <span className="text-2xl">📱</span>
              <span className={`${tokens.colors.gray[700]}`}>Acceso desde cualquier dispositivo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login