'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, TrendingUp, Users, Globe, Zap, Heart, Shield, BookOpen, Quote } from 'lucide-react'
import { useState, useEffect } from 'react'
import { AnimatedCounter, FadeIn, Sparkline, PulseDot, Skeleton } from '@/components/ui/animations'
import type { BornoData } from '@/app/api/sheets/borno/route'
import { EditorProvider, useEditor } from '@/components/editor/EditorContext'
import { EditableText } from '@/components/editor/EditableText'
import { EditorToolbar } from '@/components/editor/EditorToolbar'
import { PropertyPanel } from '@/components/editor/PropertyPanel'

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
              .concat(item.value.match(/[A-Z]|%|M|B/) ? (item.value.match(/[A-Z]|%|M|B/)?.[0] ?? '') : ''),
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
                    style={{ color: item.color, backgroundColor: `${item.color}15` }}
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
          <Link href="#" className="text-muted-foreground hover:text-foreground transition">Data</Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground transition">Analysis</Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground transition">Insights</Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground transition">Research</Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/auth/signin" className="hidden sm:block">
            <Button variant="ghost" className="text-sm">Sign In</Button>
          </Link>
          <Link href="/auth/signup">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs sm:text-sm px-3 sm:px-4">
              Get Started
            </Button>
          </Link>
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

// ─── Sections ─────────────────────────────────────────────────────────────────

function HeroSection() {
  const { content } = useEditor()
  const accent = content.colors?.accent ?? '#f4b942'

  return (
    <section className="relative py-12 sm:py-20 md:py-32 px-4 sm:px-6 border-b border-border overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 rounded-full blur-3xl" style={{ backgroundColor: `${accent}0d` }} />
        <div className="absolute bottom-0 left-0 w-48 sm:w-96 h-48 sm:h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <Badge variant="secondary" className="w-fit border-accent/20 text-xs shadow-sm" style={{ backgroundColor: `${accent}1a`, color: accent, borderColor: `${accent}33` }}>
                <EditableText contentKey="hero.badge">Real-Time Intelligence</EditableText>
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-pretty">
                <EditableText contentKey="hero.title" as="span" multiline>
                  BAY States Intelligence on Youth Peace and Security
                </EditableText>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-md">
                <EditableText contentKey="hero.description" as="span" multiline>
                  Real-time humanitarian and youth data intelligence for Borno, Adamawa, and Yobe states. Access comprehensive insights driving policy and impact.
                </EditableText>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="gap-2 w-full sm:w-auto shadow-lg active:scale-95 transition-transform text-accent-foreground hover:opacity-90"
                  style={{ backgroundColor: accent, boxShadow: `0 10px 30px -5px ${accent}4d` }}
                >
                  <EditableText contentKey="hero.ctaPrimary">Explore Platform</EditableText>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-border bg-transparent active:scale-95 transition-all w-full sm:w-auto">
                <EditableText contentKey="hero.ctaSecondary">View Documentation</EditableText>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 sm:flex sm:items-center sm:gap-8 pt-4 border-t border-border">
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl font-bold" style={{ color: accent }}>
                  <AnimatedCounter value={3} duration={1500} />
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  <EditableText contentKey="hero.stat1Label">BAY States</EditableText>
                </div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl font-bold" style={{ color: accent }}>
                  <AnimatedCounter value={7250000} duration={2000} decimals={2} />
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  <EditableText contentKey="hero.stat2Label">People in Need</EditableText>
                </div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl font-bold flex items-center justify-center sm:justify-start gap-2" style={{ color: accent }}>
                  <PulseDot color="success" size="sm" />
                  Live
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  <EditableText contentKey="hero.stat3Label">Regional Data</EditableText>
                </div>
              </div>
            </div>
          </div>

          {/* Chart visualization */}
          <div className="relative h-64 sm:h-80 md:h-full md:min-h-96">
            <div className="absolute inset-0 bg-gradient-to-br from-card to-secondary rounded-lg border border-border overflow-hidden shadow-lg" style={{ boxShadow: `0 10px 40px -10px ${accent}0d` }}>
              <div className="h-full flex items-end justify-center gap-1.5 sm:gap-2 p-4 sm:p-8">
                {[65, 82, 45, 90, 75, 55, 88, 70].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm relative group cursor-pointer transition-all duration-300 active:scale-95 hover:opacity-80 animate-[slideUp_0.6s_ease-out_backwards]"
                    style={{
                      height: `${height}%`,
                      background: `linear-gradient(180deg, ${[accent, '#6ec6e8', '#8b5cf6', '#22c55e'][i % 4]} 0%, ${[accent, '#6ec6e8', '#8b5cf6', '#22c55e'][i % 4]}40 100%)`,
                      animationDelay: `${i * 0.1}s`,
                      boxShadow: `0 0 12px -2px ${[accent, '#6ec6e8', '#8b5cf6', '#22c55e'][i % 4]}40`,
                    }}
                  >
                    <div className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition whitespace-nowrap bg-card border border-border rounded px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs">
                      {height}%
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="absolute w-full border-t border-foreground" style={{ top: `${(i + 1) * 25}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function IndicatorCards() {
  const { content } = useEditor()
  const accent = content.colors?.accent ?? '#f4b942'
  const cards = content.indicators.cards
  const icons = [Globe, Zap, TrendingUp, Users]

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-b border-border bg-secondary/20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
            <EditableText contentKey="indicators.title">Platform Capabilities</EditableText>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl">
            <EditableText contentKey="indicators.description" multiline>
              Everything you need to understand humanitarian challenges and youth development opportunities at scale.
            </EditableText>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {cards.map((item, idx) => {
            const IconComponent = icons[idx] ?? Globe
            return (
              <FadeIn key={idx} delay={idx * 100} direction="up">
                <Card hover glow className="bg-card border-border h-full active:scale-[0.98] transition-transform">
                  <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg flex items-center justify-center transition shadow-inner" style={{ backgroundColor: `${accent}1a` }}>
                      <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: accent }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-foreground mb-1 sm:mb-2">
                        <EditableText contentKey={`indicators.cards.${idx}.title`}>{item.title}</EditableText>
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        <EditableText contentKey={`indicators.cards.${idx}.description`} multiline>{item.description}</EditableText>
                      </p>
                    </div>
                    <div className="pt-3 sm:pt-4 border-t border-border flex items-center justify-between">
                      <div>
                        <div className="text-xl sm:text-2xl font-bold" style={{ color: accent }}>
                          <EditableText contentKey={`indicators.cards.${idx}.value`}>{item.value}</EditableText>
                        </div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground">
                          <EditableText contentKey={`indicators.cards.${idx}.metric`}>{item.metric}</EditableText>
                        </div>
                      </div>
                      <Sparkline data={[65, 70, 68, 75, 72, 80, 78, 85]} color={accent} width={60} height={20} />
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

function GeographicSnapshot({ bornoData }: { bornoData: BornoData | null }) {
  const { content } = useEditor()
  const accent = content.colors?.accent ?? '#f4b942'

  const borno = bornoData?.summary
  const bornoDisplaced = borno ? borno.totalDisplacement2025.toLocaleString() : '…'
  const bornoConflict = borno ? borno.totalConflict2025.toLocaleString() : '…'
  const bornoLGAs = borno ? borno.totalLGAs : 27

  // Bubble label for Borno uses displaced persons from real data
  const bornoBubbleLabel = borno ? `${Math.round(borno.totalDisplacement2025 / 1000)}K displaced` : '212K displaced'

  const stateCards = [
    { name: 'Borno', sub: `${bornoLGAs} LGAs · Real-time data`, stat: bornoDisplaced, statLabel: 'displaced', real: true },
    { name: 'Adamawa', sub: '3.79M population', stat: '2.15M', statLabel: 'in need', real: false },
    { name: 'Yobe', sub: '2.43M population', stat: '1.78M', statLabel: 'in need', real: false },
  ]

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-b border-border">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4">
          <Badge variant="secondary" className="w-fit border text-xs shadow-sm" style={{ backgroundColor: `${accent}1a`, color: accent, borderColor: `${accent}33` }}>
            <EditableText contentKey="geographic.badge">BAY States Analysis</EditableText>
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
            <EditableText contentKey="geographic.title">BAY States Humanitarian Index</EditableText>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl">
            <EditableText contentKey="geographic.description" multiline>
              Real-time snapshot of humanitarian need and youth challenges across Borno, Adamawa, and Yobe.
            </EditableText>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div className="space-y-2 sm:space-y-3 order-2 lg:order-1">
            {stateCards.map((state, idx) => (
              <Card key={idx} className="bg-card border-border hover:border-accent/50 active:border-accent active:scale-[0.98] transition-all duration-200 cursor-pointer group overflow-hidden">
                <div className="p-3 sm:p-4 flex items-between justify-between gap-3 sm:gap-4 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex-1 relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-sm sm:text-base text-foreground">{state.name}</div>
                      {state.real && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${accent}20`, color: accent }}>LIVE</span>
                      )}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">{state.sub}</div>
                  </div>
                  <div className="text-right relative z-10">
                    {state.real && !borno ? (
                      <Skeleton className="h-4 w-16 mb-1" />
                    ) : (
                      <div className="text-xs sm:text-sm font-bold" style={{ color: accent }}>{state.stat}</div>
                    )}
                    <div className="text-[10px] sm:text-xs text-muted-foreground">{state.statLabel}</div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Borno conflict stat */}
            {borno && (
              <div className="text-[10px] text-muted-foreground px-1 flex items-center gap-4">
                <span><span className="font-semibold" style={{ color: accent }}>{bornoConflict}</span> conflict incidents in 2025</span>
              </div>
            )}
          </div>

          <div className="relative h-64 sm:h-80 md:h-96 lg:col-span-2 order-1 lg:order-2">
            <div className="absolute inset-0 bg-gradient-to-br from-card to-secondary rounded-lg border border-border overflow-hidden shadow-lg">
              <div className="absolute inset-0 opacity-20">
                <svg viewBox="0 0 1000 600" className="w-full h-full">
                  <path d="M 100 150 L 200 100 L 250 150 L 200 200 L 100 150 M 400 200 L 500 150 L 550 200 L 500 250 L 400 200 M 600 100 L 700 80 L 750 120 L 700 150 L 600 100" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <div className="absolute inset-0">
                {[
                  { x: '25%', y: '45%', label: 'Borno', value: bornoBubbleLabel },
                  { x: '50%', y: '55%', label: 'Adamawa', value: '2.15M need' },
                  { x: '70%', y: '40%', label: 'Yobe', value: '1.78M need' },
                ].map((bubble, idx) => (
                  <div key={idx} className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer" style={{ left: bubble.x, top: bubble.y }}>
                    <div className="rounded-full hover:opacity-80 active:scale-110 transition-all duration-200 border flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 shadow-lg" style={{ backgroundColor: `${accent}cc`, borderColor: `${accent}80`, boxShadow: `0 8px 24px -4px ${accent}4d` }}>
                      <div className="text-center">
                        <div className="text-[9px] sm:text-[10px] md:text-xs font-bold text-black">{bubble.value}</div>
                        <div className="text-[7px] sm:text-[8px] md:text-[10px] text-black/70">{bubble.label}</div>
                      </div>
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 animate-ping" style={{ borderColor: `${accent}4d`, animationDuration: '2s' }} />
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

const ZONE_COLORS: Record<string, string> = {
  'Conflict-Affected': '#ef4444',
  'Stable/Urban': '#22c55e',
  'Semi-Stable': '#f59e0b',
}

const INDICATOR_UNITS: Record<string, string> = {
  'Youth % Population': '%',
  'Literacy Rate': '%',
  'Unemployment Rate': '%',
  'Health Facilities': ' facilities',
  'Ag Output (₦)': ' ₦',
  'Displacement': ' persons',
  'Conflict Incidents': ' incidents',
  'SMEs': ' SMEs',
  'Out-of-school Gap': '%',
  'Voter Card Gap': '%',
}

// For indicators where lower = better
const LOWER_IS_BETTER = new Set(['Unemployment Rate', 'Displacement', 'Conflict Incidents', 'Out-of-school Gap', 'Voter Card Gap'])

function formatValue(value: number, indicator: string): string {
  if (indicator === 'Ag Output (₦)') return `₦${value.toLocaleString()}`
  if (['Displacement', 'Conflict Incidents', 'SMEs', 'Health Facilities'].includes(indicator)) return value.toLocaleString()
  return `${value.toFixed(1)}%`
}

function BornoTrackerSection({ bornoData }: { bornoData: BornoData | null }) {
  const { content } = useEditor()
  const accent = content.colors?.accent ?? '#f4b942'
  const [selectedYear, setSelectedYear] = useState<'y2022' | 'y2023' | 'y2024' | 'y2025'>('y2025')
  const [selectedIndicator, setSelectedIndicator] = useState('Displacement')

  const indicators = bornoData?.indicators ?? []
  const rows = bornoData?.rows ?? []

  // Get all rows for selected indicator, one per LGA
  const filteredRows = rows
    .filter(r => r.indicator === selectedIndicator)
    .sort((a, b) => {
      const aVal = a[selectedYear]
      const bVal = b[selectedYear]
      return LOWER_IS_BETTER.has(selectedIndicator) ? aVal - bVal : bVal - aVal
    })

  const zoneCounts = {
    'Conflict-Affected': bornoData?.rows.filter(r => r.indicator === selectedIndicator && r.zone === 'Conflict-Affected').length ?? 14,
    'Stable/Urban': bornoData?.rows.filter(r => r.indicator === selectedIndicator && r.zone === 'Stable/Urban').length ?? 8,
    'Semi-Stable': bornoData?.rows.filter(r => r.indicator === selectedIndicator && r.zone === 'Semi-Stable').length ?? 5,
  }

  const years: { key: 'y2022' | 'y2023' | 'y2024' | 'y2025'; label: string }[] = [
    { key: 'y2022', label: '2022' },
    { key: 'y2023', label: '2023' },
    { key: 'y2024', label: '2024' },
    { key: 'y2025', label: '2025' },
  ]

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-b border-border bg-secondary/10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <FadeIn direction="up">
          <div className="mb-8 sm:mb-10 space-y-3">
            <Badge variant="secondary" className="w-fit border text-xs shadow-sm" style={{ backgroundColor: `${accent}1a`, color: accent, borderColor: `${accent}33` }}>
              Borno State · Live Sheet Data
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              Borno LGA Performance Tracker
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
              27 Local Government Areas · 10 Indicators · 2022–2025 · Source: UNDP, UNFPA, UNHCR, HRP
            </p>
          </div>
        </FadeIn>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Year tabs */}
          <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
            {years.map(y => (
              <button
                key={y.key}
                onClick={() => setSelectedYear(y.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedYear === y.key
                    ? 'text-black'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                style={selectedYear === y.key ? { backgroundColor: accent } : {}}
              >
                {y.label}
              </button>
            ))}
          </div>

          {/* Indicator dropdown */}
          <select
            value={selectedIndicator}
            onChange={e => setSelectedIndicator(e.target.value)}
            className="flex-1 sm:max-w-xs bg-card border border-border rounded-xl px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:border-accent/60 cursor-pointer"
          >
            {(indicators.length ? indicators : Object.keys(INDICATOR_UNITS)).map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        {/* Zone legend */}
        <div className="flex flex-wrap gap-3 mb-6">
          {(Object.entries(ZONE_COLORS) as [string, string][]).map(([zone, color]) => (
            <div key={zone} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span>{zone} ({zoneCounts[zone as keyof typeof zoneCounts] ?? '—'} LGAs)</span>
            </div>
          ))}
        </div>

        {/* Data table */}
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 px-4 py-2.5 bg-secondary/40 border-b border-border text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            <span>LGA</span>
            <span className="text-right w-24 hidden sm:block">Zone</span>
            <span className="text-right w-20">Value</span>
            <span className="text-right w-14">Trend</span>
            <span className="text-right w-16 hidden sm:block">2022–2025</span>
          </div>

          {/* Rows */}
          {!bornoData ? (
            // Loading skeletons
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 px-4 py-3 border-b border-border/50 items-center">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-20 hidden sm:block" />
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-4 w-14 hidden sm:block" />
              </div>
            ))
          ) : filteredRows.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">No data available</div>
          ) : (
            filteredRows.map((row, idx) => {
              const zoneColor = ZONE_COLORS[row.zone] ?? accent
              const val = row[selectedYear]
              const isImproving = row.trend === 'Improving'
              const sparkData = [row.y2022, row.y2023, row.y2024, row.y2025]

              return (
                <div
                  key={row.lga}
                  className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 px-4 py-3 border-b border-border/30 items-center hover:bg-secondary/30 transition-colors"
                >
                  {/* Rank + LGA name */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-mono text-muted-foreground/50 w-4 flex-shrink-0">{idx + 1}</span>
                    <span className="text-xs sm:text-sm font-medium text-foreground truncate">{row.lga}</span>
                  </div>

                  {/* Zone badge */}
                  <span
                    className="hidden sm:inline-flex text-[9px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                    style={{ backgroundColor: `${zoneColor}20`, color: zoneColor }}
                  >
                    {row.zone}
                  </span>

                  {/* Value */}
                  <span className="text-xs sm:text-sm font-bold text-right tabular-nums" style={{ color: accent }}>
                    {formatValue(val, selectedIndicator)}
                  </span>

                  {/* Trend arrow */}
                  <span className={`text-sm text-right ${isImproving ? 'text-green-400' : 'text-red-400'}`}>
                    {isImproving ? '↑' : '↓'}
                  </span>

                  {/* Sparkline */}
                  <div className="hidden sm:flex justify-end">
                    <Sparkline data={sparkData} color={zoneColor} width={56} height={18} showGradient={false} />
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer note */}
        <p className="mt-4 text-[10px] text-muted-foreground/60">
          Data sourced from: UNDP Nigeria 2024 · UNFPA Nigeria HumanitarianSitRep 2025 · UNHCR Protection Sector 2024 · Nigeria HRP 2025
        </p>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const { content } = useEditor()
  const accent = content.colors?.accent ?? '#f4b942'
  const items = content.features.items

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-b border-border bg-secondary/20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
            <EditableText contentKey="features.title">Platform Features</EditableText>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl">
            <EditableText contentKey="features.description" multiline>
              Comprehensive tools designed for researchers, policymakers, and humanitarian organizations.
            </EditableText>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {items.map((feature, idx) => (
            <FadeIn key={idx} delay={idx * 100} direction="up">
              <Card hover glow className="bg-card border-border h-full active:scale-[0.98] transition-transform">
                <div className="p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded flex items-center justify-center shadow-inner" style={{ backgroundColor: `${accent}33` }}>
                    <div className="h-5 w-5 sm:h-6 sm:w-6 rounded shadow-lg" style={{ backgroundColor: accent, boxShadow: `0 4px 12px -2px ${accent}80` }} />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg">
                    <EditableText contentKey={`features.items.${idx}.title`}>{feature.title}</EditableText>
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    <EditableText contentKey={`features.items.${idx}.description`} multiline>{feature.description}</EditableText>
                  </p>
                </div>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function ImpactStoriesSection() {
  const { content } = useEditor()
  const accent = content.colors?.accent ?? '#f4b942'
  const stories = content.impact.stories

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-b border-border bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-7xl mx-auto">
        <FadeIn direction="up">
          <div className="mb-8 sm:mb-12 md:mb-16 text-center space-y-3 sm:space-y-4">
            <Badge variant="secondary" className="w-fit mx-auto border text-xs" style={{ backgroundColor: `${accent}1a`, color: accent, borderColor: `${accent}33` }}>
              <Heart className="h-3 w-3 mr-1" />
              <EditableText contentKey="impact.badge">Real Impact</EditableText>
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              <EditableText contentKey="impact.title">Stories from the Field</EditableText>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              <EditableText contentKey="impact.description" multiline>
                See how humanitarian organizations are using HUMAID to drive measurable impact across Northeast Nigeria.
              </EditableText>
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {stories.map((story, idx) => (
            <FadeIn key={idx} delay={idx * 150} direction="up">
              <Card hover glow className="bg-card border-border h-full relative overflow-hidden active:scale-[0.98] transition-transform">
                <Quote className="absolute top-3 right-3 sm:top-4 sm:right-4 h-8 w-8 sm:h-12 sm:w-12" style={{ color: `${accent}1a` }} />
                <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                  <p className="text-sm sm:text-base text-muted-foreground italic relative z-10">
                    "
                    <EditableText contentKey={`impact.stories.${idx}.quote`} multiline>
                      {story.quote}
                    </EditableText>
                    "
                  </p>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0 shadow-lg" style={{ backgroundColor: `${accent}33`, color: accent, boxShadow: `0 4px 12px -4px ${accent}4d` }}>
                      <EditableText contentKey={`impact.stories.${idx}.avatar`}>{story.avatar}</EditableText>
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm sm:text-base text-foreground truncate">
                        <EditableText contentKey={`impact.stories.${idx}.author`}>{story.author}</EditableText>
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
                        <EditableText contentKey={`impact.stories.${idx}.role`}>{story.role}</EditableText>
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 sm:pt-4 border-t border-border">
                    <Badge className="bg-success/10 text-success border-success/20 text-xs shadow-sm shadow-success/10">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <EditableText contentKey={`impact.stories.${idx}.impact`}>{story.impact}</EditableText>
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

function CTASection() {
  const { content } = useEditor()
  const accent = content.colors?.accent ?? '#f4b942'

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-b border-border">
      <div className="max-w-4xl mx-auto">
        <Card className="border-border relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${accent}1a 0%, #3b82f61a 100%)` }}>
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 rounded-full blur-3xl" style={{ backgroundColor: `${accent}33` }} />
          <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="p-6 sm:p-8 md:p-12 text-center space-y-6 sm:space-y-8 relative z-10">
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
                <EditableText contentKey="cta.title">Explore BAY Data Today</EditableText>
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                <EditableText contentKey="cta.description" multiline>
                  Join policymakers and humanitarian organizations using HUMAID to drive impact in Northeast Nigeria.
                </EditableText>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto active:scale-95 transition-transform text-black hover:opacity-90" style={{ backgroundColor: accent, boxShadow: `0 10px 30px -5px ${accent}4d` }}>
                  <EditableText contentKey="cta.ctaPrimary">Start Exploring</EditableText>
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-border bg-transparent active:scale-95 transition-transform w-full sm:w-auto">
                <EditableText contentKey="cta.ctaSecondary">Schedule Demo</EditableText>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}

function Footer() {
  const { content } = useEditor()
  const accent = content.colors?.accent ?? '#f4b942'

  return (
    <footer className="bg-secondary/20 border-t border-border px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div className="col-span-2 sm:col-span-2 md:col-span-1 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 sm:h-6 sm:w-6 rounded flex items-center justify-center" style={{ backgroundColor: accent }}>
                <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-black" />
              </div>
              <span className="font-bold text-sm sm:text-base">HUMAID</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              <EditableText contentKey="footer.tagline">
                Real-time humanitarian and youth data intelligence platform.
              </EditableText>
            </p>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <h4 className="font-bold text-sm sm:text-base">Platform</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-foreground transition">Dashboard</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground transition">Analytics</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground transition">Reports</Link></li>
            </ul>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <h4 className="font-bold text-sm sm:text-base">Company</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-foreground transition">About</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground transition">Blog</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground transition">Careers</Link></li>
            </ul>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <h4 className="font-bold text-sm sm:text-base">Resources</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-foreground transition">Documentation</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground transition">API Reference</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground transition">Support</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6 sm:pt-8 flex flex-col gap-4 sm:flex-row items-center justify-between text-xs sm:text-sm text-muted-foreground">
          <div>
            &copy; <EditableText contentKey="footer.copyright">2026 HUMAID. All rights reserved.</EditableText>
          </div>
          <div className="flex gap-4 sm:gap-6">
            <Link href="#" className="hover:text-foreground transition">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition">Terms</Link>
            <Link href="#" className="hover:text-foreground transition">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Page content (reads section order from editor context) ───────────────────
function PageContent() {
  const { content, isEditing } = useEditor()
  const [bornoData, setBornoData] = useState<BornoData | null>(null)

  useEffect(() => {
    fetch('/api/sheets/borno')
      .then(r => r.json())
      .then(data => setBornoData(data))
      .catch(() => {/* silently fail — sections handle null gracefully */})
  }, [])

  // Section registry — components that need bornoData receive it via a wrapper
  const SECTIONS: Record<string, React.ComponentType> = {
    hero: HeroSection,
    indicators: IndicatorCards,
    geographic: () => <GeographicSnapshot bornoData={bornoData} />,
    'borno-tracker': () => <BornoTrackerSection bornoData={bornoData} />,
    features: FeaturesSection,
    impact: ImpactStoriesSection,
    cta: CTASection,
  }

  return (
    <div className="min-h-screen bg-background dark">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <LiveTicker />
      <Header />
      <main id="main-content">
        {content.sectionOrder.map(sectionId => {
          const Section = SECTIONS[sectionId]
          if (!Section) return null
          return (
            <div
              key={sectionId}
              className={isEditing ? 'relative group/section' : ''}
            >
              {/* Section label shown in edit mode */}
              {isEditing && (
                <div className="absolute top-2 left-2 z-10 opacity-0 group-hover/section:opacity-100 transition pointer-events-none">
                  <span className="bg-blue-500/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                    {sectionId}
                  </span>
                </div>
              )}
              {isEditing && (
                <div className="absolute inset-0 ring-inset ring-2 ring-blue-400/0 group-hover/section:ring-blue-400/20 transition pointer-events-none rounded" />
              )}
              <Section />
            </div>
          )
        })}
      </main>
      <Footer />
      <PropertyPanel />
      <EditorToolbar />
    </div>
  )
}

// ─── Root export ───────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <EditorProvider>
      <PageContent />
    </EditorProvider>
  )
}
