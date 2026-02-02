'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, TrendingUp, Users, Globe, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'

// BAY States live indicators
const liveIndicators = [
  { label: 'People in Need', value: '7.25M', change: '+1.8%', color: '#f4b942' },
  { label: 'Displaced Persons', value: '3.48M', change: '+0.9%', color: '#00d4ff' },
  { label: 'Active Programs', value: '1,167', change: '+3.2%', color: '#627eea' },
  { label: 'LGAs Covered', value: '23', change: 'all areas', color: '#00f0ff' },
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
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-semibold text-muted-foreground">LIVE DATA</span>
          </div>
          {tickerData.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 flex-shrink-0 pl-4 border-l border-border/50">
              <span className="text-xs text-muted-foreground whitespace-nowrap">{item.label}</span>
              <div className={`transition-all duration-300 ${isAnimating ? 'opacity-50' : 'opacity-100'}`}>
                <span className="font-mono font-bold text-foreground">{item.value}</span>
                <span className="text-xs ml-2" style={{ color: item.color }}>
                  {item.change}
                </span>
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
  return (
    <header className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-accent flex items-center justify-center">
            <Globe className="h-5 w-5 text-accent-foreground" />
          </div>
          <span className="font-bold text-lg">HUMAID</span>
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
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-sm">
            Sign In
          </Button>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 text-sm">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  )
}

// Hero section with live chart visualization
function HeroSection() {
  return (
    <section className="relative py-20 md:py-32 px-6 border-b border-border overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit bg-secondary text-foreground border-border">
                Real-Time Intelligence
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight text-pretty">
                BAY States Intelligence
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                Real-time humanitarian and youth data intelligence for Borno, Adamawa, and Yobe states. Access comprehensive insights driving policy and impact.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
              >
                Explore Platform
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border bg-transparent"
              >
                View Documentation
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4 border-t border-border">
              <div>
                <div className="text-2xl font-bold text-accent">3</div>
                <div className="text-sm text-muted-foreground">BAY States</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">7.25M</div>
                <div className="text-sm text-muted-foreground">People in Need</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">Live</div>
                <div className="text-sm text-muted-foreground">Regional Data</div>
              </div>
            </div>
          </div>

          {/* Right side - Chart visualization */}
          <div className="relative h-96 md:h-full min-h-96">
            <div className="absolute inset-0 bg-gradient-to-br from-card to-secondary rounded-lg border border-border overflow-hidden">
              {/* Simulated chart with bars */}
              <div className="h-full flex items-end justify-center gap-2 p-8">
                {[65, 82, 45, 90, 75, 55, 88, 70].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-accent rounded-sm relative group cursor-pointer transition hover:opacity-80"
                    style={{
                      height: `${height}%`,
                      background: `linear-gradient(180deg, ${['#f4b942', '#00d4ff', '#627eea', '#ff4d4d'][i % 4]} 0%, ${['#f4b942', '#00d4ff', '#627eea', '#ff4d4d'][i % 4]}40 100%)`,
                    }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition whitespace-nowrap bg-card border border-border rounded px-2 py-1 text-xs">
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
    <section className="py-20 px-6 border-b border-border bg-secondary/20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">Platform Capabilities</h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Everything you need to understand humanitarian challenges and youth development opportunities at scale.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {indicators.map((item, idx) => {
            const IconComponent = item.icon
            return (
              <Card key={idx} className="bg-card border-border hover:border-accent/50 transition group cursor-pointer">
                <div className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition">
                    <IconComponent className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <div className="text-2xl font-bold text-accent">{item.value}</div>
                    <div className="text-xs text-muted-foreground">{item.metric}</div>
                  </div>
                </div>
              </Card>
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
    <section className="py-20 px-6 border-b border-border">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 space-y-4">
          <Badge variant="secondary" className="w-fit bg-secondary text-foreground border-border">
            BAY States Analysis
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold">BAY States Humanitarian Index</h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Real-time snapshot of humanitarian need and youth challenges across Borno, Adamawa, and Yobe.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: States list */}
          <div className="space-y-3">
            {bayStatesData.map((state, idx) => (
              <Card
                key={idx}
                className="bg-card border-border hover:border-accent/50 transition cursor-pointer group"
              >
                <div className="p-4 flex items-between justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-bold text-foreground">{state.name}</div>
                    <div className="text-xs text-muted-foreground">{state.population}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-accent">{state.need}M</div>
                    <div className="text-xs text-muted-foreground">need</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Center: Map visualization with bubbles */}
          <div className="relative h-96 lg:col-span-2">
            <div className="absolute inset-0 bg-gradient-to-br from-card to-secondary rounded-lg border border-border overflow-hidden">
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
                  { x: '25%', y: '45%', size: 70, label: 'Borno', value: '3.32M' },
                  { x: '50%', y: '55%', size: 55, label: 'Adamawa', value: '2.15M' },
                  { x: '70%', y: '40%', size: 50, label: 'Yobe', value: '1.78M' },
                ].map((bubble, idx) => (
                  <div
                    key={idx}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                    style={{ left: bubble.x, top: bubble.y }}
                  >
                    <div
                      className="rounded-full bg-accent/80 hover:bg-accent transition border border-accent/50 flex items-center justify-center group"
                      style={{ width: bubble.size, height: bubble.size }}
                    >
                      <div className="text-center">
                        <div className="text-xs font-bold text-accent-foreground">{bubble.value}</div>
                        <div className="text-[10px] text-accent-foreground/70">{bubble.label}</div>
                      </div>
                    </div>
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
    <section className="py-20 px-6 border-b border-border bg-secondary/20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">Platform Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Comprehensive tools designed for researchers, policymakers, and humanitarian organizations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <Card key={idx} className="bg-card border-border hover:border-accent/50 transition">
              <div className="p-8 space-y-4">
                <div className="h-12 w-12 rounded bg-accent/20 flex items-center justify-center">
                  <div className="h-6 w-6 rounded bg-accent" />
                </div>
                <h3 className="font-bold text-lg">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// CTA section
function CTASection() {
  return (
    <section className="py-20 px-6 border-b border-border">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gradient-to-r from-accent/10 to-blue-500/10 border-border">
          <div className="p-12 text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">Explore BAY Data Today</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join policymakers and humanitarian organizations using HUMAID to drive impact in Northeast Nigeria.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Start Exploring
              </Button>
              <Button size="lg" variant="outline" className="border-border bg-transparent">
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
    <footer className="bg-secondary/20 border-t border-border px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-accent flex items-center justify-center">
                <Globe className="h-4 w-4 text-accent-foreground" />
              </div>
              <span className="font-bold">HUMAID</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Real-time humanitarian and youth data intelligence platform.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold">Platform</h4>
            <ul className="space-y-2 text-sm">
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
          <div className="space-y-3">
            <h4 className="font-bold">Company</h4>
            <ul className="space-y-2 text-sm">
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
          <div className="space-y-3">
            <h4 className="font-bold">Resources</h4>
            <ul className="space-y-2 text-sm">
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
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <div>&copy; 2026 HUMAID. All rights reserved.</div>
          <div className="flex gap-6">
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
      <LiveTicker />
      <Header />
      <HeroSection />
      <IndicatorCards />
      <GeographicSnapshot />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </div>
  )
}
