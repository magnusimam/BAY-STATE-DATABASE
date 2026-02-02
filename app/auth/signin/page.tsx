'use client'

import React from "react"

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Globe, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Placeholder - integrate with your auth backend
      if (!email || !password) {
        setError('Please fill in all fields')
        return
      }

      // Mock successful login
      localStorage.setItem('userEmail', email)
      router.push('/dashboard')
    } catch (err) {
      setError('Failed to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background dark flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="h-10 w-10 rounded bg-accent flex items-center justify-center">
              <Globe className="h-6 w-6 text-accent-foreground" />
            </div>
            <span className="font-bold text-lg">HUMAID</span>
          </Link>

          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to access your dashboard and insights
          </p>
        </div>

        {/* Sign In Form */}
        <Card className="bg-card border-border">
          <div className="p-8 space-y-6">
            <form onSubmit={handleSignIn} className="space-y-5">
              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-secondary border-border focus:border-accent"
                  required
                />
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground">
                    Password
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-accent hover:text-accent/80 transition"
                  >
                    Forgot?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary border-border focus:border-accent"
                  required
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="p-4 rounded bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
              >
                {loading ? 'Signing In...' : 'Sign In'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* OAuth options */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="border-border hover:bg-secondary bg-transparent"
              >
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-border hover:bg-secondary bg-transparent"
              >
                GitHub
              </Button>
            </div>
          </div>
        </Card>

        {/* Sign Up Link */}
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link href="/auth/signup" className="text-accent hover:text-accent/80 font-medium transition">
            Sign up
          </Link>
        </div>

        {/* Info text */}
        <div className="rounded-lg bg-secondary/30 border border-border p-4 text-xs text-muted-foreground space-y-2">
          <p className="font-medium text-foreground">Demo Credentials</p>
          <p>Email: demo@humaid.com</p>
          <p>Password: demo123</p>
        </div>
      </div>
    </div>
  )
}
