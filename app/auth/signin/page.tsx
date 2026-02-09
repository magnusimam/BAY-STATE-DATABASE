'use client'

import React from "react"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Globe, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function SignIn() {
  const router = useRouter()
  const { signIn, signInWithGoogle, signInWithGithub, user, loading: authLoading, error: authError, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  // Sync auth error with local error state
  useEffect(() => {
    if (authError) {
      setError(authError)
    }
  }, [authError])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    clearError()

    try {
      if (!email || !password) {
        setError('Please fill in all fields')
        setLoading(false)
        return
      }

      await signIn(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    clearError()
    try {
      await signInWithGoogle()
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google.')
    } finally {
      setLoading(false)
    }
  }

  const handleGithubSignIn = async () => {
    setLoading(true)
    setError('')
    clearError()
    try {
      await signInWithGithub()
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with GitHub.')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-[#0a0a0f]">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-20 w-48 sm:w-96 h-48 sm:h-96 bg-amber-500/20 rounded-full blur-[80px] sm:blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-48 sm:w-96 h-48 sm:h-96 bg-cyan-500/15 rounded-full blur-[80px] sm:blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-violet-500/10 rounded-full blur-[100px] sm:blur-[150px]" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Floating particles - reduce on mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md space-y-6 sm:space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 group">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:shadow-amber-500/40 transition-shadow">
              <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <span className="font-bold text-lg sm:text-xl text-white">HUMAID</span>
          </Link>

          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">Welcome Back</h1>
            <p className="text-sm sm:text-base text-white/60">
              Sign in to access your dashboard and insights
            </p>
          </div>
        </div>

        {/* Glassmorphism Card */}
        <div className="relative group">
          {/* Glow effect behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-transparent to-cyan-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          
          {/* Glass card */}
          <div className="relative backdrop-blur-xl bg-white/[0.05] border border-white/[0.1] rounded-2xl p-5 sm:p-6 md:p-8 shadow-2xl">
            {/* Shine effect */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/[0.15] to-transparent rotate-12 pointer-events-none" />
            </div>

            <form onSubmit={handleSignIn} className="space-y-4 sm:space-y-5 relative">
              {/* Email field */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="email" className="text-white/80 text-xs sm:text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 sm:h-12 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/30 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl transition-all text-sm sm:text-base"
                  required
                />
              </div>

              {/* Password field */}
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white/80 text-xs sm:text-sm font-medium">
                    Password
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-amber-400 hover:text-amber-300 transition"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/30 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl transition-all pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 backdrop-blur-sm">
                  {error}
                </div>
              )}

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.1]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-3 bg-transparent text-white/40 backdrop-blur-sm">Or continue with</span>
              </div>
            </div>

            {/* OAuth options */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="h-11 bg-white/[0.05] border-white/[0.1] text-white hover:bg-white/[0.1] hover:border-white/[0.2] rounded-xl transition-all"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleGithubSignIn}
                disabled={loading}
                className="h-11 bg-white/[0.05] border-white/[0.1] text-white hover:bg-white/[0.1] hover:border-white/[0.2] rounded-xl transition-all"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </Button>
            </div>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center text-sm">
          <span className="text-white/50">Don't have an account? </span>
          <Link href="/auth/signup" className="text-amber-400 hover:text-amber-300 font-medium transition">
            Sign up
          </Link>
        </div>
      </div>

      {/* Add animation keyframes via style tag */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.5; }
        }
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
