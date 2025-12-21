// Firebase configuration and initialization
// This file handles Firebase setup for the shared timer feature

import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getDatabase, Database } from 'firebase/database'

// Firebase configuration
// These values will be provided via environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
}

// Initialize Firebase (only if not already initialized)
let app: FirebaseApp | null = null
let database: Database | null = null

if (typeof window !== 'undefined') {
  // Only initialize on client side
  if (getApps().length === 0) {
    // Check if config is valid (at least databaseURL should be set)
    if (firebaseConfig.databaseURL) {
      try {
        app = initializeApp(firebaseConfig)
        database = getDatabase(app)
      } catch (error) {
        console.error('Firebase initialization error:', error)
      }
    } else {
      console.warn('Firebase not configured. Shared timer will not work. Please set environment variables.')
    }
  } else {
    app = getApps()[0]
    database = getDatabase(app)
  }
}

export { app, database }
export const isFirebaseConfigured = () => {
  return typeof window !== 'undefined' && !!firebaseConfig.databaseURL && !!database
}
