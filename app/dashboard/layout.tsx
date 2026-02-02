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
  const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null

  const handleLogout = () => {
    localStorage.removeItem('userEmail')
    router.push('/auth/signin')
  }

  return (
    <Suspense fallback={null}>
      <div className="min-h-screen bg-background dark flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex w-64 border-r border-border bg-secondary/20 flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-accent flex items-center justify-center">
                <Globe className="h-5 w-5 text-accent-foreground" />
              </div>
              <span className="font-bold">HUMAID</span>
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
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary/50 transition text-sm font-medium text-muted-foreground hover:text-foreground group"
                >
                  <Icon className="h-5 w-5 group-hover:text-accent transition" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-3">
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
          <SheetContent side="left" className="w-64 p-0 bg-secondary/20 border-r border-border">
            <div className="h-full flex flex-col">
              {/* Logo */}
              <div className="p-6 border-b border-border">
                <Link href="/" className="inline-flex items-center gap-2">
                  <div className="h-8 w-8 rounded bg-accent flex items-center justify-center">
                    <Globe className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <span className="font-bold">HUMAID</span>
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
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary/50 transition text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-border space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-border bg-transparent"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-border text-destructive bg-transparent"
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
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <header className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-30">
            <div className="px-6 py-4 flex items-center justify-between">
              {/* Mobile Menu Button */}
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="md:hidden"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
              </Sheet>

              {/* Breadcrumb / Title - Empty for now */}
              <div className="flex-1" />

              {/* Right Actions */}
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/30 border border-border">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search data..."
                    className="bg-transparent text-sm outline-none w-32 placeholder-muted-foreground"
                  />
                </div>

                {/* Notifications */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="relative"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent" />
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="gap-2 text-sm"
                    >
                      <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-accent">
                          {userEmail?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="hidden sm:inline max-w-[120px] truncate">
                        {userEmail || 'User'}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                    <DropdownMenuItem className="text-foreground" disabled>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">Account</span>
                        <span className="text-xs text-muted-foreground">{userEmail}</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem className="text-foreground cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-foreground cursor-pointer">
                      Help & Support
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem
                      className="text-destructive cursor-pointer"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
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
    <Suspense fallback={<DashboardLayoutSkeleton />}>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  )
}
