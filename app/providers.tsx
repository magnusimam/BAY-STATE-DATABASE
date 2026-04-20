'use client'

import { AuthProvider } from '@/lib/auth-context'
import { PWARegister } from '@/components/pwa-register'
import { MobileAppPromo } from '@/components/mobile-app-promo'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PWARegister />
      {children}
      <MobileAppPromo />
    </AuthProvider>
  )
}
