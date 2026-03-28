import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'

// Firebase configuration — Auth only (backend on Cloudflare)
// These are public client-side config values, safe to embed in the bundle.
// See: https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDv6m2vJmyDw3FMYFDKpDO8ENnCVA8E7Y0',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'humaid-bay-states.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'humaid-bay-states',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'humaid-bay-states.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '525728563081',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:525728563081:web:062fa1b6d6c526be276b58',
}

// Only initialize Firebase in the browser — the client Auth SDK
// requires browser APIs (window, document) and will fail during SSR
// on Cloudflare Workers.
let app: FirebaseApp | null = null
let auth: Auth | null = null

if (typeof window !== 'undefined') {
  const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId
  if (isConfigValid) {
    try {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
      auth = getAuth(app)
    } catch (error) {
      console.error('Firebase initialization error:', error)
    }
  }
}

export { app, auth }
