'use client'

import React from "react"

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Globe, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SignUp() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: '',
    agreeTerms: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.currentTarget
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all required fields')
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return
      }

      if (!formData.agreeTerms) {
        setError('You must agree to the terms and conditions')
        return
      }

      // Mock successful signup
      localStorage.setItem('userEmail', formData.email)
      router.push('/dashboard')
    } catch (err) {
      setError('Failed to sign up. Please try again.')
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

          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-muted-foreground">
            Join researchers and policymakers accessing global data
          </p>
        </div>

        {/* Sign Up Form */}
        <Card className="bg-card border-border">
          <div className="p-8 space-y-6">
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Name field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-secondary border-border focus:border-accent"
                  required
                />
              </div>

              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-secondary border-border focus:border-accent"
                  required
                />
              </div>

              {/* Organization field */}
              <div className="space-y-2">
                <Label htmlFor="organization" className="text-foreground">
                  Organization
                </Label>
                <Input
                  id="organization"
                  name="organization"
                  type="text"
                  placeholder="Your organization"
                  value={formData.organization}
                  onChange={handleChange}
                  className="bg-secondary border-border focus:border-accent"
                />
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-secondary border-border focus:border-accent"
                  required
                />
              </div>

              {/* Confirm Password field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="bg-secondary border-border focus:border-accent"
                  required
                />
              </div>

              {/* Terms checkbox */}
              <div className="flex items-start gap-3 pt-2">
                <Checkbox
                  id="terms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, agreeTerms: checked as boolean }))
                  }
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-xs text-muted-foreground cursor-pointer">
                  I agree to the{' '}
                  <Link href="/terms" className="text-accent hover:text-accent/80">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-accent hover:text-accent/80">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-4 rounded bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Sign Up Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2 mt-6"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-card text-muted-foreground">Or sign up with</span>
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

        {/* Sign In Link */}
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link href="/auth/signin" className="text-accent hover:text-accent/80 font-medium transition">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
