'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

// Types
interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  isConfigured: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  clearError: () => void
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Check if Firebase is configured
  const isConfigured = auth !== null

  // Listen for auth state changes
  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Sign in with email/password
  const signIn = async (email: string, password: string) => {
    if (!auth) {
      const message = 'Firebase is not configured. Please check your environment variables.'
      setError(message)
      throw new Error(message)
    }
    try {
      setError(null)
      setLoading(true)
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err: any) {
      const message = getErrorMessage(err.code)
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  // Sign up with email/password
  const signUp = async (email: string, password: string, displayName?: string) => {
    if (!auth) {
      const message = 'Firebase is not configured. Please check your environment variables.'
      setError(message)
      throw new Error(message)
    }
    try {
      setError(null)
      setLoading(true)
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update profile with display name if provided
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName })
      }
    } catch (err: any) {
      const message = getErrorMessage(err.code)
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    if (!auth) return
    try {
      setError(null)
      await firebaseSignOut(auth)
    } catch (err: any) {
      const message = getErrorMessage(err.code)
      setError(message)
      throw new Error(message)
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    if (!auth) {
      const message = 'Firebase is not configured. Please check your environment variables.'
      setError(message)
      throw new Error(message)
    }
    try {
      setError(null)
      setLoading(true)
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (err: any) {
      const message = getErrorMessage(err.code)
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  // Sign in with GitHub
  const signInWithGithub = async () => {
    if (!auth) {
      const message = 'Firebase is not configured. Please check your environment variables.'
      setError(message)
      throw new Error(message)
    }
    try {
      setError(null)
      setLoading(true)
      const provider = new GithubAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (err: any) {
      const message = getErrorMessage(err.code)
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    if (!auth) {
      const message = 'Firebase is not configured. Please check your environment variables.'
      setError(message)
      throw new Error(message)
    }
    try {
      setError(null)
      await sendPasswordResetEmail(auth, email)
    } catch (err: any) {
      const message = getErrorMessage(err.code)
      setError(message)
      throw new Error(message)
    }
  }

  // Clear error
  const clearError = () => setError(null)

  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithGithub,
    resetPassword,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Helper function to convert Firebase error codes to user-friendly messages
function getErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled. Please contact support.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.'
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.'
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up first.'
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.'
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check and try again.'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.'
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed. Please try again.'
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled. Please try again.'
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked. Please allow popups and try again.'
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method.'
    default:
      return 'An error occurred. Please try again.'
  }
}
