'use client'

import React, { useState } from "react"
import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  BarChart3,
  Globe,
  Menu,
  LogOut,
  Settings,
  Bell,
  Search,
  ChevronDown,
  ArrowUpRight,
  TrendingUp,
  Briefcase,
  Brain,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { DashboardLayoutSkeleton } from './layout-skeleton' // Import DashboardLayoutSkeleton
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/lib/auth-context'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: BarChart3 },
  { href: '/dashboard/countries', label: 'Country Insights', icon: Globe },
  { href: '/dashboard/comparison', label: 'Compare Data', icon: ArrowUpRight },
  { href: '/dashboard/analysis', label: 'AI Analysis', icon: Brain },
  { href: '/dashboard/policy-briefs', label: 'Policy Briefs', icon: Briefcase },
  { href: '/dashboard/trends', label: 'Trend Analysis', icon: TrendingUp },
]

function DashboardContent({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/auth/signin')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <Suspense fallback={null}>
      <div className="min-h-screen bg-background dark flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex w-64 border-r border-border bg-secondary/20 flex-col flex-shrink-0">
          {/* Logo */}
          <div className="p-4 sm:p-6 border-b border-border">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded bg-accent flex items-center justify-center">
                <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground" />
              </div>
              <span className="font-bold text-sm sm:text-base">HUMAID</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-secondary/50 transition text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground group"
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 group-hover:text-accent transition flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 sm:p-4 border-t border-border space-y-2 sm:space-y-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start border-border text-muted-foreground hover:text-foreground gap-2 bg-transparent"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
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
          <SheetContent side="left" title="Navigation Menu" className="w-64 p-0 bg-slate-950/95 backdrop-blur-xl border-r border-white/10 shadow-2xl shadow-black/50">
            <div className="h-full flex flex-col">
              {/* Logo */}
              <div className="p-6 border-b border-white/10">
                <Link href="/" className="inline-flex items-center gap-2">
                  <div className="h-8 w-8 rounded bg-accent flex items-center justify-center shadow-lg shadow-accent/30">
                    <Globe className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <span className="font-bold text-white">HUMAID</span>
                </Link>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 active:bg-white/20 transition text-sm font-medium text-white/90 hover:text-white group"
                    >
                      <Icon className="h-5 w-5 text-accent" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-white/20 text-white/90 hover:text-white hover:bg-white/10 bg-transparent"
                >
                  <Settings className="h-4 w-4 mr-2 text-accent" />
                  Settings
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-white/20 text-red-400 hover:text-red-300 hover:bg-red-500/10 bg-transparent"
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
          {/* Top Bar */}
          <header className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-30">
            <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
              {/* Mobile Menu Button */}
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="md:hidden h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
                  >
                    <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>
                </SheetTrigger>
              </Sheet>

              {/* Breadcrumb / Title - Empty for now */}
              <div className="flex-1 min-w-0" />

              {/* Right Actions */}
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Search - hidden on mobile */}
                <div className="hidden md:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-secondary/30 border border-border">
                  <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search data..."
                    className="bg-transparent text-xs sm:text-sm outline-none w-24 sm:w-32 placeholder-muted-foreground"
                  />
                </div>

                {/* Mobile Search Icon */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="md:hidden h-8 w-8"
                >
                  <Search className="h-4 w-4" />
                </Button>

                {/* Notifications */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="relative h-8 w-8 sm:h-9 sm:w-9"
                >
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="absolute top-1 right-1 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-accent" />
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-2"
                    >
                      <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] sm:text-xs font-bold text-accent">
                          {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="hidden sm:inline max-w-[80px] md:max-w-[120px] truncate">
                        {user?.displayName || user?.email || 'User'}
                      </span>
                      <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 opacity-50 hidden sm:block" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 sm:w-56 bg-card border-border">
                    <DropdownMenuItem className="text-foreground" disabled>
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="font-medium text-sm truncate">{user?.displayName || 'Account'}</span>
                        <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem className="text-foreground cursor-pointer text-sm">
                      <Settings className="h-4 w-4 mr-2 flex-shrink-0" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-foreground cursor-pointer text-sm">
                      Help & Support
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem
                      className="text-destructive cursor-pointer text-sm"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2 flex-shrink-0" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </Suspense>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <Suspense fallback={<DashboardLayoutSkeleton />}>
        <DashboardContent>{children}</DashboardContent>
      </Suspense>
    </ProtectedRoute>
  )
}
