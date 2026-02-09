'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, TrendingUp, Users, Globe, Zap, Heart, Shield, BookOpen, Quote } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { AnimatedCounter, FadeIn, Sparkline, PulseDot } from '@/components/ui/animations'

// BAY States live indicators
const liveIndicators = [
  { label: 'People in Need', value: '7.25M', change: '+1.8%', color: '#f4b942' },
  { label: 'Displaced Persons', value: '3.48M', change: '+0.9%', color: '#6ec6e8' },
  { label: 'Active Programs', value: '1,167', change: '+3.2%', color: '#22c55e' },
  { label: 'LGAs Covered', value: '23', change: 'all areas', color: '#8b5cf6' },
]

// BAY States data
const bayStatesData = [
  { code: 'BN', name: 'Borno', region: 'Northeast Nigeria', need: 3.32, population: '4.25M', severity: 91 },
  { code: 'AD', name: 'Adamawa', region: 'Northeast Nigeria', need: 2.15, population: '3.79M', severity: 76 },
  { code: 'YB', name: 'Yobe', region: 'Northeast Nigeria', need: 1.78, population: '2.43M', severity: 86 },
]

// Country data for GeographicSnapshot component
const countryData = [
  { code: 'IN', region: 'Asia', need: 450 },
  { code: 'NG', region: 'Africa', need: 320 },
  { code: 'SY', region: 'Middle East', need: 280 },
  { code: 'CD', region: 'Africa', need: 270 },
  { code: 'PH', region: 'Oceania', need: 210 },
]

// Ticker component that animates live updates
function LiveTicker() {
  const [tickerData, setTickerData] = useState(liveIndicators)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setTickerData(prev =>
          prev.map(item => ({
            ...item,
            value: String(Math.round(Number(item.value.replace(/[^0-9]/g, '')) * (0.98 + Math.random() * 0.04)))
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              .concat(item.value.match(/[A-Z]|%|M|B/) ? item.value.match(/[A-Z]|%|M|B/)?.[0] : ''),
          }))
        )
        setIsAnimating(false)
      }, 300)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="border-b border-border bg-secondary/30 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_var(--accent)]" />
            <span className="text-[10px] sm:text-xs font-bold text-accent uppercase tracking-wider">LIVE</span>
          </div>
          {tickerData.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0 pl-2 sm:pl-4 border-l border-border/50">
              <div className={`transition-all duration-300 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="font-mono font-bold text-xs sm:text-sm text-foreground">{item.value}</span>
                  <span 
                    className="text-[9px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded font-semibold" 
                    style={{ 
                      color: item.color,
                      backgroundColor: `${item.color}15`,
                    }}
                  >
                    {item.change}
                  </span>
                </div>
                <span className="text-[8px] sm:text-[10px] text-muted-foreground whitespace-nowrap block">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Navigation header
function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  return (
    <header className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-10 sm:top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded bg-accent flex items-center justify-center">
            <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground" />
          </div>
          <span className="font-bold text-base sm:text-lg">HUMAID</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link href="#" className="text-muted-foreground hover:text-foreground transition">
            Data
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground transition">
            Analysis
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground transition">
            Insights
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground transition">
            Research
          </Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/auth/signin" className="hidden sm:block">
            <Button variant="ghost" className="text-sm">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs sm:text-sm px-3 sm:px-4">
              Get Started
            </Button>
          </Link>
          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden h-8 w-8"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </div>
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm px-4 py-4 space-y-3">
          <Link href="#" className="block text-sm text-muted-foreground hover:text-foreground transition py-2">Data</Link>
          <Link href="#" className="block text-sm text-muted-foreground hover:text-foreground transition py-2">Analysis</Link>
          <Link href="#" className="block text-sm text-muted-foreground hover:text-foreground transition py-2">Insights</Link>
          <Link href="#" className="block text-sm text-muted-foreground hover:text-foreground transition py-2">Research</Link>
          <Link href="/auth/signin" className="block text-sm text-accent hover:text-accent/80 transition py-2">Sign In</Link>
        </div>
      )}
    </header>
  )
}

// Hero section with live chart visualization
function HeroSection() {
  return (
    <section className="relative py-12 sm:py-20 md:py-32 px-4 sm:px-6 border-b border-border overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 sm:w-96 h-48 sm:h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left content */}
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <Badge variant="secondary" className="w-fit bg-accent/10 text-accent border-accent/20 text-xs shadow-sm shadow-accent/10">
                Real-Time Intelligence
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-pretty">
                BAY States Intelligence on Youth Peace and Security
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-md">
                Real-time humanitarian and youth data intelligence for Borno, Adamawa, and Yobe states. Access comprehensive insights driving policy and impact.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 active:scale-95 transition-transform gap-2 w-full sm:w-auto shadow-lg shadow-accent/30"
                >
                  Explore Platform
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-border bg-transparent active:scale-95 active:border-accent transition-all w-full sm:w-auto"
              >
                View Documentation
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 sm:flex sm:items-center sm:gap-8 pt-4 border-t border-border">
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl font-bold text-accent"><AnimatedCounter value={3} duration={1500} /></div>
                <div className="text-xs sm:text-sm text-muted-foreground">BAY States</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl font-bold text-accent"><AnimatedCounter value={7250000} duration={2000} decimals={2} /></div>
                <div className="text-xs sm:text-sm text-muted-foreground">People in Need</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl font-bold text-accent flex items-center justify-center sm:justify-start gap-2">
                  <PulseDot color="success" size="sm" />
                  Live
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Regional Data</div>
              </div>
            </div>
          </div>

          {/* Right side - Chart visualization */}
          <div className="relative h-64 sm:h-80 md:h-full md:min-h-96">
            <div className="absolute inset-0 bg-gradient-to-br from-card to-secondary rounded-lg border border-border overflow-hidden shadow-lg shadow-accent/5">
              {/* Simulated chart with bars */}
              <div className="h-full flex items-end justify-center gap-1.5 sm:gap-2 p-4 sm:p-8">
                {[65, 82, 45, 90, 75, 55, 88, 70].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm relative group cursor-pointer transition-all duration-300 active:scale-95 hover:opacity-80 animate-[slideUp_0.6s_ease-out_backwards]"
                    style={{
                      height: `${height}%`,
                      background: `linear-gradient(180deg, ${['#f4b942', '#6ec6e8', '#8b5cf6', '#22c55e'][i % 4]} 0%, ${['#f4b942', '#6ec6e8', '#8b5cf6', '#22c55e'][i % 4]}40 100%)`,
                      animationDelay: `${i * 0.1}s`,
                      boxShadow: `0 0 12px -2px ${['#f4b942', '#6ec6e8', '#8b5cf6', '#22c55e'][i % 4]}40`,
                    }}
                  >
                    {/* Show percentage label on mobile tap */}
                    <div className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition whitespace-nowrap bg-card border border-border rounded px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs">
                      {height}%
                    </div>
                  </div>
                ))}
              </div>

              {/* Decorative grid */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full border-t border-foreground"
                    style={{ top: `${(i + 1) * 25}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Key indicators grid
function IndicatorCards() {
  const indicators = [
    {
      title: 'BAY States Coverage',
      description: 'All 23 LGAs across Borno, Adamawa, Yobe',
      icon: Globe,
      value: '23',
      metric: 'LGAs tracked',
    },
    {
      title: 'Real-Time Updates',
      description: 'Live data feeds with sub-minute latency',
      icon: Zap,
      value: '<60s',
      metric: 'refresh rate',
    },
    {
      title: 'Active Programs',
      description: 'Humanitarian and youth development initiatives',
      icon: TrendingUp,
      value: '1.2K',
      metric: 'programs',
    },
    {
      title: 'Community Impact',
      description: 'Reaching 7.25M people in need across BAY',
      icon: Users,
      value: '7.25M',
      metric: 'people reached',
    },
  ]

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-b border-border bg-secondary/20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">Platform Capabilities</h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl">
            Everything you need to understand humanitarian challenges and youth development opportunities at scale.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {indicators.map((item, idx) => {
            const IconComponent = item.icon
            return (
              <FadeIn key={idx} delay={idx * 100} direction="up">
                <Card hover glow className="bg-card border-border h-full active:scale-[0.98] transition-transform">
                  <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-accent/10 flex items-center justify-center transition shadow-inner">
                      <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-foreground mb-1 sm:mb-2">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="pt-3 sm:pt-4 border-t border-border flex items-center justify-between">
                      <div>
                        <div className="text-xl sm:text-2xl font-bold text-accent">{item.value}</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground">{item.metric}</div>
                      </div>
                      <Sparkline 
                        data={[65, 70, 68, 75, 72, 80, 78, 85]} 
                        color="#f4b942" 
                        width={60} 
                        height={20} 
                      />
                    </div>
                  </div>
                </Card>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// Geographic snapshot with country bubbles
function GeographicSnapshot() {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-b border-border">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4">
          <Badge variant="secondary" className="w-fit bg-accent/10 text-accent border-accent/20 text-xs shadow-sm shadow-accent/10">
            BAY States Analysis
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">BAY States Humanitarian Index</h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl">
            Real-time snapshot of humanitarian need and youth challenges across Borno, Adamawa, and Yobe.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Left: States list */}
          <div className="space-y-2 sm:space-y-3 order-2 lg:order-1">
            {bayStatesData.map((state, idx) => (
              <Card
                key={idx}
                className="bg-card border-border hover:border-accent/50 active:border-accent active:scale-[0.98] transition-all duration-200 cursor-pointer group overflow-hidden"
              >
                <div className="p-3 sm:p-4 flex items-between justify-between gap-3 sm:gap-4 relative">
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity" />
                  <div className="flex-1 relative z-10">
                    <div className="font-bold text-sm sm:text-base text-foreground">{state.name}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">{state.population}</div>
                  </div>
                  <div className="text-right relative z-10">
                    <div className="text-xs sm:text-sm font-bold text-accent">{state.need}M</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">need</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Center: Map visualization with bubbles */}
          <div className="relative h-64 sm:h-80 md:h-96 lg:col-span-2 order-1 lg:order-2">
            <div className="absolute inset-0 bg-gradient-to-br from-card to-secondary rounded-lg border border-border overflow-hidden shadow-lg shadow-accent/5">
              {/* Simulated world map */}
              <div className="absolute inset-0 opacity-20">
                <svg viewBox="0 0 1000 600" className="w-full h-full">
                  <path
                    d="M 100 150 L 200 100 L 250 150 L 200 200 L 100 150 M 400 200 L 500 150 L 550 200 L 500 250 L 400 200 M 600 100 L 700 80 L 750 120 L 700 150 L 600 100"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>

              {/* Data bubbles representing BAY states */}
              <div className="absolute inset-0">
                {[
                  { x: '25%', y: '45%', size: 70, mobileSize: 50, label: 'Borno', value: '3.32M', delay: 0 },
                  { x: '50%', y: '55%', size: 55, mobileSize: 42, label: 'Adamawa', value: '2.15M', delay: 0.2 },
                  { x: '70%', y: '40%', size: 50, mobileSize: 38, label: 'Yobe', value: '1.78M', delay: 0.4 },
                ].map((bubble, idx) => (
                  <div
                    key={idx}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer animate-[scale-in_0.5s_ease-out_backwards]"
                    style={{ left: bubble.x, top: bubble.y, animationDelay: `${bubble.delay}s` }}
                  >
                    <div
                      className="rounded-full bg-accent/80 hover:bg-accent active:bg-accent active:scale-110 transition-all duration-200 border border-accent/50 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 shadow-lg shadow-accent/30"
                    >
                      <div className="text-center">
                        <div className="text-[9px] sm:text-[10px] md:text-xs font-bold text-accent-foreground">{bubble.value}</div>
                        <div className="text-[7px] sm:text-[8px] md:text-[10px] text-accent-foreground/70">{bubble.label}</div>
                      </div>
                    </div>
                    {/* Pulse ring effect */}
                    <div className="absolute inset-0 rounded-full border-2 border-accent/30 animate-ping" style={{ animationDuration: '2s' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Features section showing platform features
function FeaturesSection() {
  const features = [
    {
      title: 'State & LGA Insights',
      description: 'Deep-dive into BAY state-specific and LGA-level data with humanitarian and youth metrics.',
    },
    {
      title: 'Comparative Analysis',
      description: 'Compare metrics across Borno, Adamawa, and Yobe to identify regional patterns.',
    },
    {
      title: 'AI-Powered Trends',
      description: 'Machine learning discovers crisis patterns and predictive trends specific to the BAY region.',
    },
    {
      title: 'Policy Briefs',
      description: 'Generate policy recommendations backed by BAY-focused real-time data and analysis.',
    },
  ]

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-b border-border bg-secondary/20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">Platform Features</h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl">
            Comprehensive tools designed for researchers, policymakers, and humanitarian organizations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {features.map((feature, idx) => (
            <FadeIn key={idx} delay={idx * 100} direction="up">
              <Card hover glow className="bg-card border-border h-full active:scale-[0.98] transition-transform">
                <div className="p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded bg-accent/20 flex items-center justify-center shadow-inner shadow-accent/10">
                    <div className="h-5 w-5 sm:h-6 sm:w-6 rounded bg-accent shadow-lg shadow-accent/50" />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{feature.description}</p>
                </div>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

// Impact Stories Section
function ImpactStoriesSection() {
  const stories = [
    {
      quote: "HUMAID data helped us redirect resources to 3 underserved LGAs in Borno, reaching 45,000 additional families with food assistance.",
      author: "Dr. Amina Ibrahim",
      role: "Program Director, UNICEF Nigeria",
      impact: "45K families reached",
      avatar: "AI",
    },
    {
      quote: "Real-time severity tracking enabled our team to anticipate displacement patterns and pre-position supplies, reducing response time by 40%.",
      author: "John Okonkwo",
      role: "Emergency Coordinator, ICRC",
      impact: "40% faster response",
      avatar: "JO",
    },
    {
      quote: "Youth program insights from HUMAID informed our skills training curriculum, resulting in a 28% increase in job placements across Yobe state.",
      author: "Fatima Musa",
      role: "Youth Development Lead, UNDP",
      impact: "28% more placements",
      avatar: "FM",
    },
  ]

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-b border-border bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-7xl mx-auto">
        <FadeIn direction="up">
          <div className="mb-8 sm:mb-12 md:mb-16 text-center space-y-3 sm:space-y-4">
            <Badge variant="secondary" className="w-fit mx-auto bg-accent/10 text-accent border-accent/20 text-xs">
              <Heart className="h-3 w-3 mr-1" /> Real Impact
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">Stories from the Field</h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              See how humanitarian organizations are using HUMAID to drive measurable impact across Northeast Nigeria.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {stories.map((story, idx) => (
            <FadeIn key={idx} delay={idx * 150} direction="up">
              <Card hover glow className="bg-card border-border h-full relative overflow-hidden active:scale-[0.98] transition-transform">
                {/* Decorative quote mark */}
                <Quote className="absolute top-3 right-3 sm:top-4 sm:right-4 h-8 w-8 sm:h-12 sm:w-12 text-accent/10" />
                
                <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                  <p className="text-sm sm:text-base text-muted-foreground italic relative z-10">"{story.quote}"</p>
                  
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm sm:text-base flex-shrink-0 shadow-lg shadow-accent/20">
                      {story.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm sm:text-base text-foreground truncate">{story.author}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground truncate">{story.role}</div>
                    </div>
                  </div>
                  
                  <div className="pt-3 sm:pt-4 border-t border-border">
                    <Badge className="bg-success/10 text-success border-success/20 text-xs shadow-sm shadow-success/10">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {story.impact}
                    </Badge>
                  </div>
                </div>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

// CTA section
function CTASection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-b border-border">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gradient-to-r from-accent/10 to-blue-500/10 border-border relative overflow-hidden">
          {/* Decorative glow effects */}
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-blue-500/20 rounded-full blur-3xl" />
          
          <div className="p-6 sm:p-8 md:p-12 text-center space-y-6 sm:space-y-8 relative z-10">
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">Explore BAY Data Today</h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                Join policymakers and humanitarian organizations using HUMAID to drive impact in Northeast Nigeria.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 active:scale-95 transition-transform w-full sm:w-auto shadow-lg shadow-accent/30">
                  Start Exploring
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-border bg-transparent active:scale-95 transition-transform w-full sm:w-auto">
                Schedule Demo
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}

// Footer
function Footer() {
  return (
    <footer className="bg-secondary/20 border-t border-border px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div className="col-span-2 sm:col-span-2 md:col-span-1 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 sm:h-6 sm:w-6 rounded bg-accent flex items-center justify-center">
                <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-accent-foreground" />
              </div>
              <span className="font-bold text-sm sm:text-base">HUMAID</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Real-time humanitarian and youth data intelligence platform.
            </p>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <h4 className="font-bold text-sm sm:text-base">Platform</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                  Analytics
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                  Reports
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <h4 className="font-bold text-sm sm:text-base">Company</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <h4 className="font-bold text-sm sm:text-base">Resources</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6 sm:pt-8 flex flex-col gap-4 sm:flex-row items-center justify-between text-xs sm:text-sm text-muted-foreground">
          <div>&copy; 2026 HUMAID. All rights reserved.</div>
          <div className="flex gap-4 sm:gap-6">
            <Link href="#" className="hover:text-foreground transition">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground transition">
              Terms
            </Link>
            <Link href="#" className="hover:text-foreground transition">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background dark">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">Skip to main content</a>
      
      <LiveTicker />
      <Header />
      <main id="main-content">
        <HeroSection />
        <IndicatorCards />
        <GeographicSnapshot />
        <FeaturesSection />
        <ImpactStoriesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
