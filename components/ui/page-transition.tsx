'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (prefersReducedMotion) {
      setDisplayChildren(children)
      return
    }

    setIsTransitioning(true)
    
    const timeout = setTimeout(() => {
      setDisplayChildren(children)
      setIsTransitioning(false)
    }, 150)

    return () => clearTimeout(timeout)
  }, [pathname, children])

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-out',
        isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0',
        className
      )}
    >
      {displayChildren}
    </div>
  )
}

// Wrapper that respects reduced motion preferences
export function MotionSafe({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('motion-safe:animate-fade-in', className)}>
      {children}
    </div>
  )
}
