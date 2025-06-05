import React from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { useNetworkStatus } from '../hooks/useNetworkStatus'

const NetworkStatus = () => {
  const isOnline = useNetworkStatus()
  const [showStatus, setShowStatus] = React.useState(false)

  React.useEffect(() => {
    if (!isOnline) {
      setShowStatus(true)
    } else {
      const timer = setTimeout(() => {
        setShowStatus(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isOnline])

  if (!showStatus) return null

  return (
    <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2 ${
      isOnline 
        ? 'bg-green-600 text-white' 
        : 'bg-red-600 text-white'
    }`}>
      {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
      <span className="text-sm font-medium">
        {isOnline ? 'Conectado' : 'Sin conexión'}
      </span>
    </div>
  )
}

export default NetworkStatus