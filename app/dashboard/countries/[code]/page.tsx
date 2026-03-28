'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ArrowLeft, Download, Share2, TrendingUp } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { Sparkline, Skeleton } from '@/components/ui/animations'
import type { MasterRow, ApiResponse } from '@/lib/api-types'
import { computeSummary, getUniqueIndicators, fetchJson } from '@/lib/api-types'

// Mock data for countries
const countryDetails: Record<string, any> = {
  in: {
    name: 'India',
    code: 'IN',
    region: 'South Asia',
    population: '1.4 Billion',
    need: '450 Million',
    severity: 92,
    programs: 2847,
    description: 'India faces complex humanitarian challenges with a large youth population',
    timeline: [
      { month: 'Jan', need: 420, programs: 2600, severity: 88 },
      { month: 'Feb', need: 430, programs: 2700, severity: 90 },
      { month: 'Mar', need: 440, programs: 2750, severity: 91 },
      { month: 'Apr', need: 445, programs: 2800, severity: 92 },
      { month: 'May', need: 448, programs: 2820, severity: 92 },
      { month: 'Jun', need: 450, programs: 2847, severity: 92 },
    ],
    regionalBreakdown: [
      { region: 'North', need: 150, programs: 950 },
      { region: 'South', need: 120, programs: 800 },
      { region: 'East', need: 100, programs: 680 },
      { region: 'West', need: 80, programs: 417 },
    ],
    crisisTypes: [
      { type: 'Poverty', percentage: 35 },
      { type: 'Education', percentage: 28 },
      { type: 'Health', percentage: 22 },
      { type: 'Conflict', percentage: 15 },
    ],
  },
  ng: {
    name: 'Nigeria',
    code: 'NG',
    region: 'West Africa',
    population: '223 Million',
    need: '320 Million',
    severity: 88,
    programs: 1256,
    description: 'Nigeria faces significant humanitarian challenges in northern regions',
    timeline: [
      { month: 'Jan', need: 280, programs: 1100, severity: 82 },
      { month: 'Feb', need: 290, programs: 1150, severity: 84 },
      { month: 'Mar', need: 300, programs: 1180, severity: 85 },
      { month: 'Apr', need: 310, programs: 1210, severity: 87 },
      { month: 'May', need: 315, programs: 1235, severity: 88 },
      { month: 'Jun', need: 320, programs: 1256, severity: 88 },
    ],
    regionalBreakdown: [
      { region: 'North', need: 180, programs: 700 },
      { region: 'South', need: 80, programs: 350 },
      { region: 'Central', need: 60, programs: 206 },
    ],
    crisisTypes: [
      { type: 'Conflict', percentage: 45 },
      { type: 'Poverty', percentage: 30 },
      { type: 'Education', percentage: 15 },
      { type: 'Health', percentage: 10 },
    ],
  },
  sy: {
    name: 'Syria',
    code: 'SY',
    region: 'MENA',
    population: '22.1 Million',
    need: '280 Million',
    severity: 95,
    programs: 856,
    description: 'Syria faces ongoing crisis with critical humanitarian needs',
    timeline: [
      { month: 'Jan', need: 260, programs: 750, severity: 92 },
      { month: 'Feb', need: 265, programs: 770, severity: 93 },
      { month: 'Mar', need: 270, programs: 790, severity: 94 },
      { month: 'Apr', need: 275, programs: 810, severity: 94 },
      { month: 'May', need: 278, programs: 830, severity: 95 },
      { month: 'Jun', need: 280, programs: 856, severity: 95 },
    ],
    regionalBreakdown: [
      { region: 'Northwest', need: 120, programs: 380 },
      { region: 'South', need: 90, programs: 280 },
      { region: 'East', need: 70, programs: 196 },
    ],
    crisisTypes: [
      { type: 'Conflict', percentage: 60 },
      { type: 'Displacement', percentage: 25 },
      { type: 'Health', percentage: 10 },
      { type: 'Food Security', percentage: 5 },
    ],
  },
}

// ─── BAY State Detail Pages (live from Google Sheet) ──────────────────────────
const ZONE_COLORS: Record<string, string> = {
  'Conflict-Affected': '#ef4444',
  'Stable/Urban': '#22c55e',
  'Semi-Stable': '#f59e0b',
  'High Risk': '#ef4444',
  'Moderate Risk': '#f59e0b',
  'Low Risk': '#22c55e',
}
const LOWER_IS_BETTER = new Set(['Unemployment Rate', 'Displacement', 'Conflict Incidents', 'Out-of-school Gap', 'Voter Card Gap'])

const STATE_CONFIG: Record<string, { name: string; stateName: string; region: string; accentColor: string }> = {
  bn: { name: 'Borno State', stateName: 'Borno', region: 'Northeast Nigeria', accentColor: '#f4b942' },
  ad: { name: 'Adamawa State', stateName: 'Adamawa', region: 'Northeast Nigeria', accentColor: '#6ec6e8' },
  yb: { name: 'Yobe State', stateName: 'Yobe', region: 'Northeast Nigeria', accentColor: '#8b5cf6' },
}

function fmtVal(value: number, indicator: string): string {
  if (indicator === 'Ag Output (₦)') return `₦${value.toLocaleString()}`
  if (['Displacement', 'Conflict Incidents', 'SMEs', 'Health Facilities'].includes(indicator)) return value.toLocaleString()
  return `${value.toFixed(1)}%`
}

function StateDetailPage({ stateCode }: { stateCode: string }) {
  const router = useRouter()
  const config = STATE_CONFIG[stateCode]
  const [rows, setRows] = useState<MasterRow[]>([])
  const [selectedYear, setSelectedYear] = useState<'y2022' | 'y2023' | 'y2024' | 'y2025'>('y2025')
  const [selectedIndicator, setSelectedIndicator] = useState('Displacement')

  useEffect(() => {
    fetchJson<ApiResponse<MasterRow>>(`/api/data?state=${config.stateName.toLowerCase()}`)
      .then(d => setRows(d.data ?? []))
      .catch(() => {})
  }, [config.stateName])

  const indicators = useMemo(() => getUniqueIndicators(rows), [rows])
  const summary = useMemo(() => computeSummary(rows), [rows])

  // LGA rows for selected indicator, sorted
  const filteredRows = useMemo(() =>
    rows
      .filter(r => r.indicator === selectedIndicator)
      .sort((a, b) => {
        const av = a[selectedYear], bv = b[selectedYear]
        return LOWER_IS_BETTER.has(selectedIndicator) ? av - bv : bv - av
      }),
    [rows, selectedIndicator, selectedYear]
  )

  // Year-trend chart data (average across all LGAs per year for selected indicator)
  const trendData = useMemo(() => {
    const forInd = rows.filter(r => r.indicator === selectedIndicator)
    if (!forInd.length) return []
    const avg = (key: 'y2022' | 'y2023' | 'y2024' | 'y2025') =>
      forInd.reduce((s, r) => s + r[key], 0) / forInd.length
    return [
      { year: '2022', value: avg('y2022') },
      { year: '2023', value: avg('y2023') },
      { year: '2024', value: avg('y2024') },
      { year: '2025', value: avg('y2025') },
    ]
  }, [rows, selectedIndicator])

  // Zone comparison data
  const zoneData = useMemo(() => {
    const zones = ['High Risk', 'Medium Risk', 'Low Risk']
    return zones.map(zone => {
      const zoneRows = rows.filter(r => r.indicator === selectedIndicator && r.risk_zone === zone)
      const avg = zoneRows.length ? zoneRows.reduce((s, r) => s + r[selectedYear], 0) / zoneRows.length : 0
      return { zone: zone.split('/')[0], value: parseFloat(avg.toFixed(1)), color: ZONE_COLORS[zone] }
    })
  }, [rows, selectedIndicator, selectedYear])

  const years: { key: 'y2022' | 'y2023' | 'y2024' | 'y2025'; label: string }[] = [
    { key: 'y2022', label: '2022' }, { key: 'y2023', label: '2023' },
    { key: 'y2024', label: '2024' }, { key: 'y2025', label: '2025' },
  ]

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Countries
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold">{config.name}</h1>
            <Badge className="bg-accent/20 text-accent border-accent/30">{config.region}</Badge>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">LIVE DATA</Badge>
          </div>
          <p className="text-muted-foreground text-sm">Youth Peace &amp; Security Performance Tracker · 2022–2025</p>
        </div>
        <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'LGAs Tracked', value: summary ? String(summary.totalLGAs) : '27', sub: '3 zone types' },
          { label: 'Total Displaced (2025)', value: summary ? summary.totalDisplacement2025.toLocaleString() : '212,300', sub: '↓ from 311,300 in 2022' },
          { label: 'Conflict Incidents (2025)', value: summary ? summary.totalConflict2025.toLocaleString() : '1,718', sub: '↓ from 2,352 in 2022' },
          { label: 'Indicators Tracked', value: String(indicators.length || 10), sub: 'Per LGA · 4 years' },
        ].map((kpi, i) => (
          <Card key={i} className="bg-card border-border p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">{kpi.label}</p>
            <h3 className="text-xl sm:text-2xl font-bold text-accent">{kpi.value}</h3>
            <p className="text-[10px] text-muted-foreground mt-1">{kpi.sub}</p>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
          {years.map(y => (
            <button key={y.key} onClick={() => setSelectedYear(y.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedYear === y.key ? 'bg-accent text-black' : 'text-muted-foreground hover:text-foreground'}`}>
              {y.label}
            </button>
          ))}
        </div>
        <select value={selectedIndicator} onChange={e => setSelectedIndicator(e.target.value)}
          className="flex-1 sm:max-w-xs bg-card border border-border rounded-xl px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:border-accent/60 cursor-pointer">
          {(indicators.length ? indicators : ['Displacement', 'Conflict Incidents', 'Literacy Rate', 'Unemployment Rate', 'SMEs']).map(ind => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Year trend */}
        <Card className="bg-card border-border p-4 sm:p-6">
          <h3 className="font-bold text-sm sm:text-base mb-4">{selectedIndicator} · State Average 2022–2025</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="stateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.accentColor} stopOpacity={0.7} />
                  <stop offset="95%" stopColor={config.accentColor} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1e23', border: '1px solid #2d3748', fontSize: 12 }} />
              <Area type="monotone" dataKey="value" stroke={config.accentColor} fill="url(#stateGrad)" name={selectedIndicator} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Zone comparison */}
        <Card className="bg-card border-border p-4 sm:p-6">
          <h3 className="font-bold text-sm sm:text-base mb-4">{selectedIndicator} by Zone · {selectedYear.replace('y', '')}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={zoneData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis dataKey="zone" type="category" stroke="#94a3b8" tick={{ fontSize: 11 }} width={90} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1e23', border: '1px solid #2d3748', fontSize: 12 }} />
              <Bar dataKey="value" name={selectedIndicator} radius={[0, 6, 6, 0]}>
                {zoneData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* LGA table */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border">
          <h3 className="font-bold text-sm sm:text-base">All {summary?.totalLGAs ?? '—'} LGAs — {selectedIndicator} · {selectedYear.replace('y', '')}</h3>
          <p className="text-xs text-muted-foreground mt-1">Sorted by performance · Sparklines show 2022–2025 trend</p>
        </div>

        {/* Header row */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 px-4 py-2.5 bg-secondary/40 border-b border-border text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          <span>LGA</span>
          <span className="text-right w-28 hidden sm:block">Zone</span>
          <span className="text-right w-20">Value</span>
          <span className="text-right w-10">↑↓</span>
          <span className="text-right w-16 hidden sm:block">Trend</span>
        </div>

        {rows.length === 0 ? (
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 px-4 py-3 border-b border-border/40 items-center">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-4 w-24 hidden sm:block" />
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-6" />
              <Skeleton className="h-4 w-14 hidden sm:block" />
            </div>
          ))
        ) : filteredRows.map((row, idx) => {
          const zoneColor = ZONE_COLORS[row.risk_zone] ?? '#f4b942'
          const sparkData = [row.y2022, row.y2023, row.y2024, row.y2025]
          return (
            <div key={row.lga}
              className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 px-4 py-3 border-b border-border/30 items-center hover:bg-secondary/20 transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-mono text-muted-foreground/40 w-4 shrink-0">{idx + 1}</span>
                <span className="text-xs sm:text-sm font-medium truncate">{row.lga}</span>
              </div>
              <span className="hidden sm:inline-flex text-[9px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{ backgroundColor: `${zoneColor}20`, color: zoneColor }}>
                {row.risk_zone}
              </span>
              <span className="text-xs sm:text-sm font-bold text-right tabular-nums text-accent">
                {fmtVal(row[selectedYear], selectedIndicator)}
              </span>
              <span className={`text-sm text-right ${row.trend === 'Improving' ? 'text-green-400' : 'text-red-400'}`}>
                {row.trend === 'Improving' ? '↑' : '↓'}
              </span>
              <div className="hidden sm:flex justify-end">
                <Sparkline data={sparkData} color={zoneColor} width={56} height={18} showGradient={false} />
              </div>
            </div>
          )
        })}
      </Card>

      <p className="text-[10px] text-muted-foreground/50">
        Sources: UNDP Nigeria 2024 · UNFPA Nigeria HumanitarianSitRep 2025 · UNHCR Protection Sector 2024 · Nigeria HRP 2025
      </p>
    </div>
  )
}

// ─── Fallback for unknown countries ───────────────────────────────────────────
// Fallback for unknown countries
function getCountryDetails(code: string) {
  return countryDetails[code.toLowerCase()] || {
    name: code.toUpperCase(),
    code: code.toUpperCase(),
    region: 'Unknown Region',
    population: 'N/A',
    need: 'N/A',
    severity: 0,
    programs: 0,
    description: 'Country data not available',
    timeline: [],
    regionalBreakdown: [],
    crisisTypes: [],
  }
}

// Key stats component
function StatCard({
  label,
  value,
  unit = '',
}: {
  label: string
  value: string | number
  unit?: string
}) {
  return (
    <Card className="bg-card border-border p-6">
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <p className="text-3xl font-bold text-foreground">
        {value}
        {unit && <span className="text-lg ml-1">{unit}</span>}
      </p>
    </Card>
  )
}

export default function CountryDetail() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  // Route BAY states to their live-data detail pages
  if (code === 'bn' || code === 'ad' || code === 'yb') return <StateDetailPage stateCode={code} />

  const country = getCountryDetails(code)

  if (!country || !country.timeline || country.timeline.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Card className="bg-card border-border p-12 text-center">
          <p className="text-muted-foreground">Country data not found.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="gap-2 mb-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Countries
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold">{country.name}</h1>
            <Badge className="bg-accent/20 text-accent border-accent/30">
              {country.region}
            </Badge>
          </div>
          <p className="text-muted-foreground">{country.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-border gap-2 bg-transparent">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Population" value={country.population} />
        <StatCard label="Humanitarian Need" value={country.need} />
        <StatCard label="Severity Index" value={country.severity} unit="/100" />
        <StatCard label="Active Programs" value={country.programs} />
      </div>

      {/* Timeline */}
      <Card className="bg-card border-border p-6">
        <div className="mb-6">
          <h2 className="font-bold text-lg">6-Month Trend</h2>
          <p className="text-sm text-muted-foreground mt-1">Humanitarian need and program growth</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={country.timeline}>
            <defs>
              <linearGradient id="colorNeed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f4b942" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f4b942" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1e23', border: '1px solid #2d3748' }} />
            <Legend />
            <Area
              type="monotone"
              dataKey="need"
              stroke="#f4b942"
              fill="url(#colorNeed)"
              name="People in Need (M)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional breakdown */}
        <Card className="bg-card border-border p-6">
          <h2 className="font-bold text-lg mb-6">Regional Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={country.regionalBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="region" type="category" stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1e23', border: '1px solid #2d3748' }} />
              <Bar dataKey="need" fill="#f4b942" name="Need (M)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Crisis types */}
        <Card className="bg-card border-border p-6">
          <h2 className="font-bold text-lg mb-6">Crisis Types</h2>
          <div className="space-y-4">
            {country.crisisTypes.map((crisis: any, idx: number) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{crisis.type}</span>
                  <span className="font-bold text-accent">{crisis.percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${crisis.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Programs chart */}
      <Card className="bg-card border-border p-6">
        <div className="mb-6">
          <h2 className="font-bold text-lg">Program Growth</h2>
          <p className="text-sm text-muted-foreground mt-1">Active programs deployed</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={country.timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1e23', border: '1px solid #2d3748' }} />
            <Line
              type="monotone"
              dataKey="programs"
              stroke="#6ec6e8"
              strokeWidth={3}
              dot={{ fill: '#6ec6e8', r: 5 }}
              activeDot={{ r: 7 }}
              name="Active Programs"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
