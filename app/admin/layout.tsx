'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  LayoutDashboard,
  FileText,
  Layers,
  Palette,
  Globe,
  LogOut,
  Menu,
  ExternalLink,
} from 'lucide-react'
import { AdminProtectedRoute } from '@/components/auth/admin-protected-route'
import { useAuth } from '@/lib/auth-context'

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/content', label: 'Content', icon: FileText },
  { href: '/admin/sections', label: 'Sections', icon: Layers },
  { href: '/admin/theme', label: 'Theme', icon: Palette },
]

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    router.push('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-background dark flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border bg-[#0f1214] flex-col flex-shrink-0">
        <div className="p-6 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-accent flex items-center justify-center">
              <Globe className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <span className="font-bold text-sm">HUMAID</span>
              <span className="text-[10px] text-muted-foreground block -mt-0.5">Admin Panel</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-accent' : ''}`} />
                {item.label}
              </Link>
            )
          })}

          <div className="pt-4 mt-4 border-t border-border">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition"
            >
              <ExternalLink className="h-5 w-5" />
              View Site
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-border space-y-3">
          <div className="px-4 py-2">
            <p className="text-xs font-medium text-foreground truncate">{user?.displayName || 'Admin'}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start border-border text-destructive hover:bg-destructive/10 gap-2 bg-transparent"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" title="Admin Navigation" className="w-64 p-0 bg-[#0f1214] border-r border-border">
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-border">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-accent flex items-center justify-center">
                  <Globe className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <span className="font-bold text-sm text-white">HUMAID</span>
                  <span className="text-[10px] text-white/50 block -mt-0.5">Admin Panel</span>
                </div>
              </Link>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-accent/10 text-accent'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="p-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-white/20 text-red-400 hover:bg-red-500/10 bg-transparent"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="px-4 md:px-6 py-4 flex items-center justify-between">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" className="md:hidden h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </Sheet>
            <div className="flex-1" />
            <Link href="/" target="_blank">
              <Button variant="outline" size="sm" className="gap-2 border-border bg-transparent text-xs">
                <ExternalLink className="h-3.5 w-3.5" />
                View Site
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProtectedRoute>
      <AdminShell>{children}</AdminShell>
    </AdminProtectedRoute>
  )
}
