// src/services/firebase.js
import { initializeApp } from 'firebase/app'
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
  // measurementId es OPCIONAL - solo se usa para Analytics
  // ...(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID && { 
  //   measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID 
  // })
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Inicializar servicios
const db = getFirestore(app)
const auth = getAuth(app)

// Configuración offline para PWA
export const enableOffline = () => disableNetwork(db)
export const enableOnline = () => enableNetwork(db)

// Exports
export { db, auth }
export default app