import React from 'react'
import { Download, X } from 'lucide-react'
import { usePWA } from '../hooks/usePWA'

const InstallPWA = () => {
  const { canInstall, installPWA, isInstalled } = usePWA()
  const [showBanner, setShowBanner] = React.useState(false)

  React.useEffect(() => {
    if (canInstall && !isInstalled) {
      // Mostrar banner después de 3 segundos
      const timer = setTimeout(() => {
        setShowBanner(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [canInstall, isInstalled])

  const handleInstall = async () => {
    const success = await installPWA()
    if (success) {
      setShowBanner(false)
    }
  }

  if (!canInstall || isInstalled || !showBanner) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Download className="h-6 w-6" />
        <div>
          <h3 className="font-semibold">Instalar App</h3>
          <p className="text-sm opacity-90">Añade Dashboard Financiero a tu pantalla de inicio</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={handleInstall}
          className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-gray-100 transition-colors"
        >
          Instalar
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="p-2 hover:bg-blue-700 rounded transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default InstallPWA