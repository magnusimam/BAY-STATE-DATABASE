'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

// ===========================================
// ANIMATED COUNTER - counts up to target value
// ===========================================
interface AnimatedCounterProps {
  value: number
  duration?: number
  suffix?: string
  prefix?: string
  decimals?: number
  className?: string
}

export function AnimatedCounter({
  value,
  duration = 2000,
  suffix = '',
  prefix = '',
  decimals = 0,
  className,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          const startTime = performance.now()
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            // Easing function: easeOutExpo
            const easeProgress = 1 - Math.pow(2, -10 * progress)
            setCount(easeProgress * value)
            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value, duration, hasAnimated])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(decimals) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(decimals) + 'K'
    }
    return num.toFixed(decimals)
  }

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  )
}

// ===========================================
// FADE IN - element fades in when in view
// ===========================================
interface FadeInProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  className?: string
  once?: boolean
}

export function FadeIn({
  children,
  delay = 0,
  duration = 500,
  direction = 'up',
  className,
  once = true,
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setIsVisible(true), delay)
            if (once) observer.disconnect()
          } else if (!once) {
            setIsVisible(false)
          }
        })
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay, once])

  const directionStyles = {
    up: 'translate-y-8',
    down: '-translate-y-8',
    left: 'translate-x-8',
    right: '-translate-x-8',
    none: '',
  }

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all',
        isVisible ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${directionStyles[direction]}`,
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
}

// ===========================================
// STAGGER CHILDREN - animates children one by one
// ===========================================
interface StaggerChildrenProps {
  children: React.ReactNode
  staggerDelay?: number
  className?: string
}

export function StaggerChildren({
  children,
  staggerDelay = 100,
  className,
}: StaggerChildrenProps) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <FadeIn delay={index * staggerDelay} key={index}>
          {child}
        </FadeIn>
      ))}
    </div>
  )
}

// ===========================================
// SPARKLINE - mini trend graph
// ===========================================
interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  showGradient?: boolean
  className?: string
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = '#f4b942',
  showGradient = true,
  className,
}: SparklineProps) {
  if (!data.length) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  // Stable ID derived from props so server and client render the same value
  const gradientId = `sparkline-gradient-${color.replace('#', '')}-${data.length}-${width}-${height}`

  return (
    <svg
      width={width}
      height={height}
      className={cn('overflow-visible', className)}
      aria-hidden="true"
    >
      {showGradient && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {showGradient && (
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill={`url(#${gradientId})`}
        />
      )}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-draw-line"
      />
    </svg>
  )
}

// ===========================================
// SKELETON - loading placeholder with shimmer
// ===========================================
interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const variantStyles = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  return (
    <div
      className={cn(
        'animate-shimmer bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]',
        variantStyles[variant],
        className
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

// ===========================================
// PULSE DOT - animated status indicator
// ===========================================
interface PulseDotProps {
  color?: 'success' | 'warning' | 'destructive' | 'info' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PulseDot({
  color = 'success',
  size = 'md',
  className,
}: PulseDotProps) {
  const colorStyles = {
    success: 'bg-success',
    warning: 'bg-warning',
    destructive: 'bg-destructive',
    info: 'bg-info',
    accent: 'bg-accent',
  }

  const sizeStyles = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  }

  return (
    <span className={cn('relative inline-flex', className)}>
      <span
        className={cn(
          'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
          colorStyles[color]
        )}
      />
      <span
        className={cn(
          'relative inline-flex rounded-full',
          colorStyles[color],
          sizeStyles[size]
        )}
      />
    </span>
  )
}

// ===========================================
// PROGRESS RING - circular progress indicator
// ===========================================
interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
  bgColor?: string
  className?: string
  showValue?: boolean
}

export function ProgressRing({
  progress,
  size = 48,
  strokeWidth = 4,
  color = '#f4b942',
  bgColor = '#2d3748',
  className,
  showValue = true,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showValue && (
        <span className="absolute text-xs font-semibold text-foreground">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  )
}

// ===========================================
// TYPING TEXT - typewriter effect
// ===========================================
interface TypingTextProps {
  text: string
  speed?: number
  delay?: number
  className?: string
}

export function TypingText({
  text,
  speed = 50,
  delay = 0,
  className,
}: TypingTextProps) {
  const [displayText, setDisplayText] = useState('')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const startTimeout = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(startTimeout)
  }, [delay])

  useEffect(() => {
    if (!started) return

    let index = 0
    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index))
        index++
      } else {
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed, started])

  return (
    <span className={className}>
      {displayText}
      <span className="animate-blink">|</span>
    </span>
  )
}

// ===========================================
// HOVER CARD WRAPPER - adds lift effect on hover
// ===========================================
interface HoverCardWrapperProps {
  children: React.ReactNode
  className?: string
  hoverScale?: number
  enableGlow?: boolean
  glowColor?: string
}

export function HoverCardWrapper({
  children,
  className,
  hoverScale = 1.02,
  enableGlow = true,
  glowColor = 'var(--accent)',
}: HoverCardWrapperProps) {
  return (
    <div
      className={cn(
        'transition-all duration-300 ease-out',
        'hover:-translate-y-1',
        enableGlow && 'hover:shadow-lg hover:shadow-accent/10',
        className
      )}
      style={{
        ['--hover-scale' as string]: hoverScale,
      }}
    >
      {children}
    </div>
  )
}
