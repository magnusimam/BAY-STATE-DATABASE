'use client'

import { AuthProvider } from '@/lib/auth-context'
import { PWARegister } from '@/components/pwa-register'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PWARegister />
      {children}
    </AuthProvider>
  )
}
