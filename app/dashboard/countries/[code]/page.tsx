'use client'

import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ArrowLeft, Download } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { Sparkline, Skeleton } from '@/components/ui/animations'
import type { MasterRow, ApiResponse } from '@/lib/api-types'
import { computeSummary, getUniqueIndicators, fetchJson } from '@/lib/api-types'
import { nigeriaStates } from '@/lib/nigeria-states'

// ─── State Detail Page (live from Google Sheet, once a state has synced data) ─
const ZONE_COLORS: Record<string, string> = {
  'Conflict-Affected': '#ef4444',
  'Stable/Urban': '#22c55e',
  'Semi-Stable': '#f59e0b',
  'High Risk': '#ef4444',
  'Moderate Risk': '#f59e0b',
  'Low Risk': '#22c55e',
}
const LOWER_IS_BETTER = new Set(['Unemployment Rate', 'Displacement', 'Conflict Incidents', 'Out-of-school Gap', 'Voter Card Gap'])

// Rotating accent palette so every state gets a distinct chart color without per-state config
const ACCENT_PALETTE = ['#f4b942', '#6ec6e8', '#8b5cf6', '#22c55e', '#ef4444', '#ec4899', '#14b8a6']

function accentFor(code: string): string {
  let hash = 0
  for (let i = 0; i < code.length; i++) hash = (hash * 31 + code.charCodeAt(i)) >>> 0
  return ACCENT_PALETTE[hash % ACCENT_PALETTE.length]
}

function fmtVal(value: number, indicator: string): string {
  if (indicator === 'Ag Output (₦)') return `₦${value.toLocaleString()}`
  if (['Displacement', 'Conflict Incidents', 'SMEs', 'Health Facilities'].includes(indicator)) return value.toLocaleString()
  return `${value.toFixed(1)}%`
}

function StateDetailPage({ stateCode }: { stateCode: string }) {
  const router = useRouter()
  const state = nigeriaStates[stateCode.toUpperCase()]
  const accentColor = accentFor(state.code)
  const [rows, setRows] = useState<MasterRow[]>([])
  const [loaded, setLoaded] = useState(false)
  const [selectedYear, setSelectedYear] = useState<'y2022' | 'y2023' | 'y2024' | 'y2025'>('y2025')
  const [selectedIndicator, setSelectedIndicator] = useState('Displacement')

  useEffect(() => {
    setLoaded(false)
    fetchJson<ApiResponse<MasterRow>>(`/api/data?state=${state.name.toLowerCase()}`)
      .then(d => setRows(d.data ?? []))
      .catch(() => setRows([]))
      .finally(() => setLoaded(true))
  }, [state.name])

  const indicators = useMemo(() => getUniqueIndicators(rows), [rows])
  const summary = useMemo(() => computeSummary(rows), [rows])

  const filteredRows = useMemo(() =>
    rows
      .filter(r => r.indicator === selectedIndicator)
      .sort((a, b) => {
        const av = a[selectedYear], bv = b[selectedYear]
        return LOWER_IS_BETTER.has(selectedIndicator) ? av - bv : bv - av
      }),
    [rows, selectedIndicator, selectedYear]
  )

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

  const hasData = rows.length > 0

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to States
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold">{state.name} State</h1>
            <Badge className="bg-accent/20 text-accent border-accent/30">{state.zone}</Badge>
            {loaded && (
              hasData ? (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">LIVE DATA</Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground border-border text-[10px]">DATA COMING SOON</Badge>
              )
            )}
          </div>
          <p className="text-muted-foreground text-sm">Youth Peace &amp; Security Performance Tracker · 2022–2025</p>
        </div>
        {hasData && (
          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
        )}
      </div>

      {!loaded ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-card border-border p-4 sm:p-6">
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-6 w-16" />
            </Card>
          ))}
        </div>
      ) : !hasData ? (
        <Card className="bg-card border-border p-8 sm:p-12 text-center space-y-2">
          <p className="text-base sm:text-lg font-semibold">Data for {state.name} is coming soon</p>
          <p className="text-sm text-muted-foreground">
            This state has {state.lgaCount} LGAs in the {state.zone} zone. Once the tracker sheet is populated for {state.name},
            LGA-level indicators will appear here automatically.
          </p>
        </Card>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'LGAs Tracked', value: String(summary.totalLGAs), sub: `${state.lgaCount} official LGAs` },
              { label: 'Total Displaced (2025)', value: summary.totalDisplacement2025.toLocaleString(), sub: '2025 snapshot' },
              { label: 'Conflict Incidents (2025)', value: summary.totalConflict2025.toLocaleString(), sub: '2025 snapshot' },
              { label: 'Indicators Tracked', value: String(indicators.length || 0), sub: 'Per LGA · 4 years' },
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
              {indicators.map(ind => (
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
                      <stop offset="5%" stopColor={accentColor} stopOpacity={0.7} />
                      <stop offset="95%" stopColor={accentColor} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                  <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1e23', border: '1px solid #2d3748', fontSize: 12 }} />
                  <Area type="monotone" dataKey="value" stroke={accentColor} fill="url(#stateGrad)" name={selectedIndicator} />
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
              <h3 className="font-bold text-sm sm:text-base">All {summary.totalLGAs} LGAs — {selectedIndicator} · {selectedYear.replace('y', '')}</h3>
              <p className="text-xs text-muted-foreground mt-1">Sorted by performance · Sparklines show 2022–2025 trend</p>
            </div>

            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 px-4 py-2.5 bg-secondary/40 border-b border-border text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              <span>LGA</span>
              <span className="text-right w-28 hidden sm:block">Zone</span>
              <span className="text-right w-20">Value</span>
              <span className="text-right w-10">↑↓</span>
              <span className="text-right w-16 hidden sm:block">Trend</span>
            </div>

            {filteredRows.map((row, idx) => {
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
        </>
      )}
    </div>
  )
}

export default function CountryDetail() {
  const params = useParams()
  const router = useRouter()
  const code = (params.code as string ?? '').toUpperCase()

  if (nigeriaStates[code]) return <StateDetailPage stateCode={code} />

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <Card className="bg-card border-border p-12 text-center">
        <p className="text-muted-foreground">Unknown state code &quot;{code}&quot;.</p>
      </Card>
    </div>
  )
}
