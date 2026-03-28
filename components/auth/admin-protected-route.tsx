'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { isAdminEmail } from '@/lib/admin-emails'

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  const isAdmin = isAdminEmail(user?.email)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    } else if (!loading && user && !isAdmin) {
      router.push('/')
    }
  }, [user, loading, isAdmin, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Access denied. Redirecting...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
