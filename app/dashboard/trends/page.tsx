'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FadeIn,
  Sparkline,
  AnimatedCounter,
  PulseDot,
} from '@/components/ui/animations'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  Filter,
  Download,
  X,
  Activity,
  AlertTriangle,
  BarChart3,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
  BookOpen,
  Target,
  Eye,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  TrendAnalysisRow,
  MasterRow,
  ApiResponse,
  SyncStatus,
} from '@/lib/api-types'

// ── Constants ───────────────────────────────────────────────────────────────

const STATES = ['All', 'Borno', 'Adamawa', 'Yobe']
const INDICATORS = [
  'All',
  'Youth % Population',
  'Literacy Rate',
  'Unemployment Rate',
  'Health Facilities',
  'Ag Output',
  'Displacement',
  'Conflict Incidents',
  'SMEs Registered',
  'Out-of-School Gap',
  'Voter Card Gap',
]

const STATE_COLORS: Record<string, string> = {
  Borno: '#f4b942',
  Adamawa: '#6ec6e8',
  Yobe: '#a78bfa',
}

const SECTION_ICONS: Record<string, typeof Lightbulb> = {
  progress: TrendingUp,
  insights: Lightbulb,
  zone_comparison: Target,
}

const SECTION_COLORS: Record<string, string> = {
  progress: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  insights: 'text-accent bg-accent/10 border-accent/20',
  zone_comparison: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatAxis(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toLocaleString()
}

function formatValue(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toLocaleString()
}

function TrendIcon({ trend, size = 'sm' }: { trend: string; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'h-5 w-5' : 'h-4 w-4'
  const t = trend.toLowerCase()
  if (t.includes('improv') || t.includes('up') || t.includes('increas'))
    return <TrendingUp className={`${cls} text-emerald-400`} />
  if (t.includes('declin') || t.includes('down') || t.includes('decreas'))
    return <TrendingDown className={`${cls} text-red-400`} />
  return <Minus className={`${cls} text-yellow-400`} />
}

function trendBadgeClass(trend: string) {
  const t = trend.toLowerCase()
  if (t.includes('improv')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  if (t.includes('declin')) return 'bg-red-500/10 text-red-400 border-red-500/20'
  return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
}

function changeBadgeClass(pct: number) {
  if (pct > 5) return 'bg-red-500/10 text-red-400 border-red-500/20'
  if (pct < -5) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
}

// ── Custom Tooltip ──────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-xl">
      <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-foreground">{formatValue(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ── CSV Export ───────────────────────────────────────────────────────────────

function exportCSV(rows: MasterRow[], stateFilter: string, indicatorFilter: string) {
  let filtered = rows
  if (stateFilter !== 'All') filtered = filtered.filter(r => r.state === stateFilter)
  if (indicatorFilter !== 'All') filtered = filtered.filter(r => r.indicator === indicatorFilter)

  const header = 'State,LGA,Risk Zone,Indicator,2022,2023,2024,2025,Change %,Trend\n'
  const csv = header + filtered.map(r =>
    `"${r.state}","${r.lga}","${r.risk_zone}","${r.indicator}",${r.y2022},${r.y2023},${r.y2024},${r.y2025},${r.change_pct},"${r.trend}"`
  ).join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `bay-trends-${stateFilter.toLowerCase()}-${indicatorFilter.toLowerCase().replace(/ /g, '-')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function TrendsPage() {
  const [trends, setTrends] = useState<TrendAnalysisRow[]>([])
  const [masterRows, setMasterRows] = useState<MasterRow[]>([])
  const [loading, setLoading] = useState(true)
  const [stateFilter, setStateFilter] = useState('All')
  const [indicatorFilter, setIndicatorFilter] = useState('All')
  const [moverTab, setMoverTab] = useState<'all' | 'improvers' | 'decliners'>('all')
  const [lastSynced, setLastSynced] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/data?view=trends').then(r => r.json()),
      fetch('/api/data?view=master').then(r => r.json()),
      fetch('/api/data').then(r => r.json()),
    ])
      .then(([trendData, masterData, syncData]: [ApiResponse<TrendAnalysisRow>, ApiResponse<MasterRow>, SyncStatus]) => {
        setTrends(trendData.data ?? [])
        setMasterRows(masterData.data ?? [])
        if (syncData.last_sync?.updated_at) {
          setLastSynced(new Date(syncData.last_sync.updated_at).toLocaleString())
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const isFiltered = stateFilter !== 'All' || indicatorFilter !== 'All'

  const clearFilters = useCallback(() => {
    setStateFilter('All')
    setIndicatorFilter('All')
  }, [])

  // ── Filtered rows ─────────────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    let rows = masterRows
    if (stateFilter !== 'All') rows = rows.filter(r => r.state === stateFilter)
    if (indicatorFilter !== 'All') rows = rows.filter(r => r.indicator === indicatorFilter)
    return rows
  }, [masterRows, stateFilter, indicatorFilter])

  // ── KPI Summary ───────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    if (!masterRows.length) return null
    const rows = filteredRows
    const improving = rows.filter(r => r.trend.toLowerCase().includes('improv')).length
    const declining = rows.filter(r => r.trend.toLowerCase().includes('declin')).length
    const stable = rows.length - improving - declining

    // Biggest gainer and decliner
    const sorted = [...rows].sort((a, b) => b.change_pct - a.change_pct)
    const topGainer = sorted[0] || null
    const topDecliner = sorted[sorted.length - 1] || null

    return { total: rows.length, improving, declining, stable, topGainer, topDecliner }
  }, [masterRows, filteredRows])

  // ── Trend direction breakdown (replacing misleading sum) ──────────────────
  const trendBreakdownData = useMemo(() => {
    if (!filteredRows.length) return []
    const byIndicator = new Map<string, { improving: number; declining: number; stable: number }>()
    for (const r of filteredRows) {
      const t = r.trend.toLowerCase()
      const entry = byIndicator.get(r.indicator) ?? { improving: 0, declining: 0, stable: 0 }
      if (t.includes('improv')) entry.improving++
      else if (t.includes('declin')) entry.declining++
      else entry.stable++
      byIndicator.set(r.indicator, entry)
    }
    return [...byIndicator.entries()].map(([indicator, counts]) => ({
      indicator: indicator.length > 15 ? indicator.slice(0, 14) + '...' : indicator,
      fullName: indicator,
      ...counts,
    }))
  }, [filteredRows])

  // ── Year-over-year chart (per-indicator average when "All") ───────────────
  const yearChartData = useMemo(() => {
    if (indicatorFilter !== 'All') {
      // Specific indicator: show total or average
      const totals = { y2022: 0, y2023: 0, y2024: 0, y2025: 0 }
      for (const r of filteredRows) {
        totals.y2022 += r.y2022; totals.y2023 += r.y2023
        totals.y2024 += r.y2024; totals.y2025 += r.y2025
      }
      const count = filteredRows.length || 1
      return [
        { year: '2022', value: +(totals.y2022 / count).toFixed(1) },
        { year: '2023', value: +(totals.y2023 / count).toFixed(1) },
        { year: '2024', value: +(totals.y2024 / count).toFixed(1) },
        { year: '2025', value: +(totals.y2025 / count).toFixed(1) },
      ]
    }
    return null // Don't show meaningless aggregate
  }, [filteredRows, indicatorFilter])

  // ── State comparison chart ────────────────────────────────────────────────
  const stateComparisonData = useMemo(() => {
    if (indicatorFilter === 'All') return []
    const filtered = masterRows.filter(r => r.indicator === indicatorFilter)
    const byState = new Map<string, { y2022: number; y2023: number; y2024: number; y2025: number; count: number }>()
    for (const r of filtered) {
      const s = byState.get(r.state) ?? { y2022: 0, y2023: 0, y2024: 0, y2025: 0, count: 0 }
      s.y2022 += r.y2022; s.y2023 += r.y2023; s.y2024 += r.y2024; s.y2025 += r.y2025; s.count++
      byState.set(r.state, s)
    }
    return ['2022', '2023', '2024', '2025'].map(year => {
      const entry: Record<string, string | number> = { year }
      for (const [state, vals] of byState) {
        entry[state] = +(vals[`y${year}` as keyof typeof vals] as number / vals.count).toFixed(1)
      }
      return entry
    })
  }, [masterRows, indicatorFilter])

  // ── Top movers with sparklines ────────────────────────────────────────────
  const topMovers = useMemo(() => {
    let base = filteredRows
    if (moverTab === 'improvers') base = base.filter(r => r.change_pct < 0 || r.trend.toLowerCase().includes('improv'))
    else if (moverTab === 'decliners') base = base.filter(r => r.change_pct > 0 || r.trend.toLowerCase().includes('declin'))

    return [...base]
      .sort((a, b) => Math.abs(b.change_pct) - Math.abs(a.change_pct))
      .slice(0, 10)
      .map(row => ({
        ...row,
        sparkline: [row.y2022, row.y2023, row.y2024, row.y2025],
      }))
  }, [filteredRows, moverTab])

  // ── Narrative sections ────────────────────────────────────────────────────
  const sections = useMemo(() => {
    const map = new Map<string, TrendAnalysisRow[]>()
    for (const row of trends) {
      if (stateFilter !== 'All' && row.state && row.state.toLowerCase() !== stateFilter.toLowerCase()) continue
      const existing = map.get(row.section) ?? []
      existing.push(row)
      map.set(row.section, existing)
    }
    return map
  }, [trends, stateFilter])

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground">Loading trend data...</p>
      </div>
    )
  }

  // ── Bar color based on state filter ───────────────────────────────────────
  const barColor = stateFilter !== 'All' ? (STATE_COLORS[stateFilter] ?? '#f4b942') : '#f4b942'

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">

      {/* ── Header + Filters ─────────────────────────────────────────────── */}
      <FadeIn direction="up">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Trend Analysis</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                4-year trends across BAY States indicators (2022-2025)
              </p>
            </div>
            {lastSynced && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Last synced: {lastSynced}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-[120px] sm:w-[140px] bg-secondary border-border text-xs sm:text-sm h-8 sm:h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={indicatorFilter} onValueChange={setIndicatorFilter}>
              <SelectTrigger className="w-[150px] sm:w-[180px] bg-secondary border-border text-xs sm:text-sm h-8 sm:h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {INDICATORS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs h-8 gap-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
                Clear filters
              </Button>
            )}
            <div className="ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportCSV(masterRows, stateFilter, indicatorFilter)}
                className="border-border gap-1.5 bg-transparent text-xs sm:text-sm h-8 sm:h-9"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>
            </div>
          </div>

          {isFiltered && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 text-xs">
                {filteredRows.length} data points
              </Badge>
              {stateFilter !== 'All' && (
                <Badge variant="outline" className="text-xs" style={{ color: STATE_COLORS[stateFilter], borderColor: STATE_COLORS[stateFilter] + '40' }}>
                  {stateFilter}
                </Badge>
              )}
              {indicatorFilter !== 'All' && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  {indicatorFilter}
                </Badge>
              )}
            </div>
          )}
        </div>
      </FadeIn>

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <FadeIn delay={0} direction="up">
            <Card className="bg-card border-border p-4 sm:p-6 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Data Points</p>
                  <h3 className="text-2xl sm:text-3xl font-bold">
                    <AnimatedCounter value={kpis.total} />
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isFiltered ? 'filtered' : 'total tracked'}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                </div>
              </div>
            </Card>
          </FadeIn>

          <FadeIn delay={100} direction="up">
            <Card className="bg-card border-border p-4 sm:p-6 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Improving</p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-emerald-400">
                    <AnimatedCounter value={kpis.improving} />
                  </h3>
                  <p className="text-xs text-emerald-400/70 mt-1">
                    {kpis.total ? ((kpis.improving / kpis.total) * 100).toFixed(0) : 0}% of indicators
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
                </div>
              </div>
            </Card>
          </FadeIn>

          <FadeIn delay={200} direction="up">
            <Card className="bg-card border-border p-4 sm:p-6 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Declining</p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-red-400">
                    <AnimatedCounter value={kpis.declining} />
                  </h3>
                  <p className="text-xs text-red-400/70 mt-1">
                    {kpis.stable} stable
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
                </div>
              </div>
            </Card>
          </FadeIn>

          <FadeIn delay={300} direction="up">
            <Card className="bg-card border-border p-4 sm:p-6 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Biggest Mover</p>
                  {kpis.topGainer && (
                    <>
                      <h3 className="text-lg sm:text-xl font-bold truncate max-w-[140px]">
                        {Math.abs(kpis.topGainer.change_pct).toFixed(0)}%
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 truncate max-w-[140px]">
                        {kpis.topGainer.lga}
                      </p>
                    </>
                  )}
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />
                </div>
              </div>
            </Card>
          </FadeIn>
        </div>
      )}

      {/* ── Trend Direction Breakdown (when All indicators) ──────────────── */}
      {indicatorFilter === 'All' && trendBreakdownData.length > 0 && (
        <FadeIn delay={100} direction="up">
          <Card className="bg-card border-border p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <h3 className="font-bold text-base sm:text-lg">Trend Direction by Indicator</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {stateFilter !== 'All' ? stateFilter : 'BAY Combined'} — how many LGAs are improving, declining, or stable per indicator
              </p>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={trendBreakdownData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" tickFormatter={formatAxis} tick={{ fontSize: 11 }} />
                <YAxis
                  dataKey="indicator"
                  type="category"
                  stroke="#94a3b8"
                  width={110}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Bar dataKey="improving" fill="#22c55e" name="Improving" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="stable" fill="#eab308" name="Stable" stackId="a" />
                <Bar dataKey="declining" fill="#ef4444" name="Declining" stackId="a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </FadeIn>
      )}

      {/* ── Year-over-Year Chart (specific indicator only) ───────────────── */}
      {yearChartData && (
        <FadeIn delay={100} direction="up">
          <Card className="bg-card border-border p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <h3 className="font-bold text-base sm:text-lg">
                {indicatorFilter} — Year-over-Year Average
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {stateFilter !== 'All' ? stateFilter : 'BAY Combined'} — average per LGA
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={yearChartData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={barColor} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={barColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tickFormatter={formatAxis} tick={{ fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={barColor}
                  strokeWidth={3}
                  fill="url(#areaGrad)"
                  name="Average"
                  dot={{ r: 5, fill: barColor, stroke: '#1a1e23', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: barColor, stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </FadeIn>
      )}

      {/* ── State Comparison (specific indicator) ────────────────────────── */}
      {indicatorFilter !== 'All' && stateComparisonData.length > 0 && (
        <FadeIn delay={150} direction="up">
          <Card className="bg-card border-border p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <h3 className="font-bold text-base sm:text-lg">State Comparison — {indicatorFilter}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Average per LGA across all three states</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stateComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tickFormatter={formatAxis} tick={{ fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                {['Borno', 'Adamawa', 'Yobe'].map(state => (
                  <Line
                    key={state}
                    type="monotone"
                    dataKey={state}
                    stroke={STATE_COLORS[state]}
                    strokeWidth={2.5}
                    dot={{ r: 5, fill: STATE_COLORS[state], stroke: '#1a1e23', strokeWidth: 2 }}
                    activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </FadeIn>
      )}

      {/* ── No chart placeholder when All indicators ─────────────────────── */}
      {indicatorFilter === 'All' && (
        <FadeIn delay={100} direction="up">
          <Card className="bg-gradient-to-br from-accent/5 to-transparent border-border border-dashed p-6 sm:p-8 text-center">
            <Eye className="h-8 w-8 text-accent/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Select a specific indicator above to see year-over-year trends and state comparisons.
            </p>
          </Card>
        </FadeIn>
      )}

      {/* ── Top Movers ───────────────────────────────────────────────────── */}
      <FadeIn delay={200} direction="up">
        <Card className="bg-card border-border p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            <div>
              <h3 className="font-bold text-base sm:text-lg">Top Movers (2022-2025)</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                LGA-indicator pairs with the largest 4-year changes
              </p>
            </div>
            <div className="flex gap-1 bg-secondary/50 rounded-lg p-1">
              {(['all', 'improvers', 'decliners'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setMoverTab(tab)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                    moverTab === tab
                      ? 'bg-accent text-accent-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {topMovers.map((row, idx) => (
              <FadeIn key={`${row.lga}-${row.indicator}`} delay={idx * 50} direction="none">
                <div
                  className={`flex items-center justify-between p-3 sm:p-4 rounded-lg border transition-all hover:bg-secondary/30 ${
                    idx < 3
                      ? 'bg-secondary/20 border-accent/20 shadow-sm'
                      : 'bg-secondary/10 border-border'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0 ${
                      idx < 3 ? 'bg-accent/10' : 'bg-secondary/50'
                    }`}>
                      {idx < 3 ? (
                        <span className="text-xs font-bold text-accent">#{idx + 1}</span>
                      ) : (
                        <TrendIcon trend={row.trend} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{row.lga}</p>
                      <p className="text-xs text-muted-foreground">
                        <span style={{ color: STATE_COLORS[row.state] }}>{row.state}</span> — {row.indicator}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    <Sparkline
                      data={row.sparkline}
                      width={60}
                      height={20}
                      color={row.change_pct > 0 ? '#ef4444' : '#22c55e'}
                    />
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-mono text-muted-foreground">
                        {formatValue(row.y2022)} → {formatValue(row.y2025)}
                      </p>
                    </div>
                    <Badge variant="outline" className={`text-xs ${changeBadgeClass(row.change_pct)}`}>
                      {row.change_pct > 0 ? '+' : ''}{row.change_pct.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </FadeIn>
            ))}
            {topMovers.length === 0 && (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No movers found for this filter combination</p>
              </div>
            )}
          </div>
        </Card>
      </FadeIn>

      {/* ── Progress Scorecard ────────────────────────────────────────── */}
      <ProgressScorecard rows={trends.filter(r => r.section === 'progress')} stateFilter={stateFilter} />

      {/* ── Zone Comparison Table ────────────────────────────────────── */}
      <ZoneComparisonTable rows={trends.filter(r => r.section === 'zone_comparison')} stateFilter={stateFilter} />

      {/* ── Key Findings ─────────────────────────────────────────────── */}
      <KeyFindings rows={trends.filter(r => r.section === 'insights')} stateFilter={stateFilter} />
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Progress Scorecard — parses pipe-separated metric rows into a table
// ════════════════════════════════════════════════════════════════════════════

interface ProgressRow {
  metric: string
  borno: string
  bornoPct: string
  adamawa: string
  adamawaPct: string
  yobe: string
  yobePct: string
  direction: string
}

function parseProgressRows(rows: TrendAnalysisRow[]): ProgressRow[] {
  const parsed: ProgressRow[] = []
  for (const row of rows) {
    // Only parse rows with pipe-separated data in content
    const parts = row.content.split('|').map(s => s.trim())
    // Valid data rows have the metric name + at least 7 pipe values
    if (parts.length < 7 || !row.metric || row.metric.includes('Progress Metric') || row.metric.includes('BAY SUB-REGIONAL')) continue
    // Skip header-like rows (Absolute, %, etc.)
    if (row.metric.startsWith('%') || row.metric.startsWith('Absolute')) continue

    parsed.push({
      metric: row.metric,
      borno: parts[1] || '—',
      bornoPct: parts[2] || '—',
      adamawa: parts[3] || '—',
      adamawaPct: parts[4] || '—',
      yobe: parts[5] || '—',
      yobePct: parts[6] || '—',
      direction: parts[7] || '',
    })
  }
  return parsed
}

function DirectionBadge({ direction }: { direction: string }) {
  if (!direction) return null
  const isPositive = direction.toLowerCase().includes('positive')
  const hasDown = direction.includes('↓')
  const hasUp = direction.includes('↑')
  const Icon = hasDown ? ArrowDownRight : hasUp ? ArrowUpRight : Minus

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
      isPositive
        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        : 'bg-red-500/10 text-red-400 border border-red-500/20'
    }`}>
      <Icon className="h-3 w-3" />
      <span className="hidden sm:inline">{direction.replace(/[↓↑]\s*/, '')}</span>
      <span className="sm:hidden">{isPositive ? 'Positive' : 'Negative'}</span>
    </div>
  )
}

function ProgressScorecard({ rows, stateFilter }: { rows: TrendAnalysisRow[]; stateFilter: string }) {
  const parsed = parseProgressRows(rows)
  if (!parsed.length) return null

  return (
    <FadeIn delay={250} direction="up">
      <Card className="bg-card border-border p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg">Progress Scorecard</h3>
            <p className="text-xs text-muted-foreground">4-year improvements across BAY States (2022-2025)</p>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-muted-foreground font-medium text-xs">Metric</th>
                <th className="text-right py-3 px-2 font-medium text-xs" style={{ color: STATE_COLORS.Borno }}>Borno</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium text-xs">%</th>
                <th className="text-right py-3 px-2 font-medium text-xs" style={{ color: STATE_COLORS.Adamawa }}>Adamawa</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium text-xs">%</th>
                <th className="text-right py-3 px-2 font-medium text-xs" style={{ color: STATE_COLORS.Yobe }}>Yobe</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium text-xs">%</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium text-xs">Direction</th>
              </tr>
            </thead>
            <tbody>
              {parsed.map((row, idx) => (
                <tr key={idx} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                  <td className="py-3 px-2 font-medium text-foreground">{row.metric}</td>
                  <td className="py-3 px-2 text-right font-mono" style={{ color: STATE_COLORS.Borno }}>{row.borno}</td>
                  <td className="py-3 px-2 text-right font-mono text-muted-foreground text-xs">{row.bornoPct}</td>
                  <td className="py-3 px-2 text-right font-mono" style={{ color: STATE_COLORS.Adamawa }}>{row.adamawa}</td>
                  <td className="py-3 px-2 text-right font-mono text-muted-foreground text-xs">{row.adamawaPct}</td>
                  <td className="py-3 px-2 text-right font-mono" style={{ color: STATE_COLORS.Yobe }}>{row.yobe}</td>
                  <td className="py-3 px-2 text-right font-mono text-muted-foreground text-xs">{row.yobePct}</td>
                  <td className="py-3 px-2 text-right"><DirectionBadge direction={row.direction} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {parsed.map((row, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-secondary/20 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{row.metric}</p>
                <DirectionBadge direction={row.direction} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { state: 'Borno', value: row.borno, pct: row.bornoPct },
                  { state: 'Adamawa', value: row.adamawa, pct: row.adamawaPct },
                  { state: 'Yobe', value: row.yobe, pct: row.yobePct },
                ].map(col => (
                  <div key={col.state} className="p-2 rounded bg-secondary/30">
                    <p className="text-[10px] font-medium mb-1" style={{ color: STATE_COLORS[col.state] }}>{col.state}</p>
                    <p className="text-sm font-mono font-bold">{col.value}</p>
                    <p className="text-[10px] text-muted-foreground">{col.pct}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </FadeIn>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Zone Comparison Table — parses pipe-separated zone data
// ════════════════════════════════════════════════════════════════════════════

interface ZoneRow {
  state: string
  riskZone: string
  literacy: string
  unemployment: string
  displacement: string
  conflict: string
  smes: string
}

function parseZoneRows(rows: TrendAnalysisRow[]): ZoneRow[] {
  const parsed: ZoneRow[] = []
  for (const row of rows) {
    // Skip header row
    if (row.metric === 'State') continue
    const parts = row.content.split('|').map(s => s.trim())
    if (parts.length < 6) continue

    parsed.push({
      state: row.metric || row.state,
      riskZone: parts[0] || '—',
      literacy: parts[1] || '—',
      unemployment: parts[2] || '—',
      displacement: parts[3] || '—',
      conflict: parts[4] || '—',
      smes: parts[5] || '—',
    })
  }
  return parsed
}

function ZoneComparisonTable({ rows, stateFilter }: { rows: TrendAnalysisRow[]; stateFilter: string }) {
  let parsed = parseZoneRows(rows)
  if (stateFilter !== 'All') parsed = parsed.filter(r => r.state.toLowerCase() === stateFilter.toLowerCase())
  if (!parsed.length) return null

  const columns = [
    { key: 'riskZone', label: 'Risk Zone' },
    { key: 'literacy', label: 'Avg Literacy (%)' },
    { key: 'unemployment', label: 'Avg Unemployment (%)' },
    { key: 'displacement', label: 'Total Displacement' },
    { key: 'conflict', label: 'Total Conflict' },
    { key: 'smes', label: 'Total SMEs' },
  ] as const

  return (
    <FadeIn delay={300} direction="up">
      <Card className="bg-card border-border p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-blue-500/10 border border-blue-500/20">
            <Target className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg">Zone Comparison</h3>
            <p className="text-xs text-muted-foreground">High Risk zone metrics by state</p>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-muted-foreground font-medium text-xs">State</th>
                {columns.map(col => (
                  <th key={col.key} className="text-right py-3 px-2 text-muted-foreground font-medium text-xs">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parsed.map((row, idx) => (
                <tr key={idx} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                  <td className="py-3 px-2 font-medium" style={{ color: STATE_COLORS[row.state] }}>{row.state}</td>
                  <td className="py-3 px-2 text-right">
                    <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">{row.riskZone}</Badge>
                  </td>
                  <td className="py-3 px-2 text-right font-mono">{row.literacy}</td>
                  <td className="py-3 px-2 text-right font-mono">{row.unemployment}</td>
                  <td className="py-3 px-2 text-right font-mono">{row.displacement}</td>
                  <td className="py-3 px-2 text-right font-mono">{row.conflict}</td>
                  <td className="py-3 px-2 text-right font-mono">{row.smes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {parsed.map((row, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-secondary/20 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm" style={{ color: STATE_COLORS[row.state] }}>{row.state}</p>
                <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">{row.riskZone}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {columns.slice(1).map(col => (
                  <div key={col.key} className="flex justify-between p-1.5 rounded bg-secondary/30">
                    <span className="text-muted-foreground">{col.label.replace('Total ', '').replace('Avg ', '')}</span>
                    <span className="font-mono font-medium">{row[col.key]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </FadeIn>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Key Findings — renders bullet points from the metric field, grouped by state
// ════════════════════════════════════════════════════════════════════════════

interface StateFindings {
  state: string
  title: string
  bullets: string[]
}

function parseFindings(rows: TrendAnalysisRow[], stateFilter: string): StateFindings[] {
  const groups: StateFindings[] = []
  let current: StateFindings | null = null

  for (const row of rows) {
    if (stateFilter !== 'All' && row.state && row.state.toLowerCase() !== stateFilter.toLowerCase()) continue

    const metric = row.metric.trim()
    if (!metric) continue

    // Header row like "BORNO STATE — KEY FINDINGS"
    if (!metric.startsWith('•') && metric.includes('—') && metric.includes('FINDINGS')) {
      if (current) groups.push(current)
      current = { state: row.state, title: metric, bullets: [] }
      continue
    }

    // Bullet point row
    if (metric.startsWith('•')) {
      if (!current) {
        current = { state: row.state, title: `${row.state} — Key Findings`, bullets: [] }
      }
      current.bullets.push(metric.replace(/^•\s*/, ''))
    }
  }
  if (current && current.bullets.length) groups.push(current)
  return groups
}

function KeyFindings({ rows, stateFilter }: { rows: TrendAnalysisRow[]; stateFilter: string }) {
  const groups = parseFindings(rows, stateFilter)
  if (!groups.length) return null

  return (
    <FadeIn delay={350} direction="up">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-accent" />
          <h2 className="text-xl sm:text-2xl font-bold">Key Findings</h2>
          <PulseDot color="accent" size="sm" />
        </div>

        {groups.map((group, gIdx) => (
          <FadeIn key={group.state} delay={gIdx * 100} direction="up">
            <Card className="bg-card border-border p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center border"
                  style={{
                    backgroundColor: (STATE_COLORS[group.state] || '#f4b942') + '15',
                    borderColor: (STATE_COLORS[group.state] || '#f4b942') + '30',
                  }}
                >
                  <Lightbulb className="h-4 w-4" style={{ color: STATE_COLORS[group.state] || '#f4b942' }} />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg" style={{ color: STATE_COLORS[group.state] }}>
                    {group.state} State
                  </h3>
                  <p className="text-xs text-muted-foreground">{group.bullets.length} key findings</p>
                </div>
              </div>

              <div className="space-y-2">
                {group.bullets.map((bullet, bIdx) => (
                  <FadeIn key={bIdx} delay={bIdx * 40} direction="none">
                    <div className="flex gap-3 p-3 rounded-lg bg-secondary/15 border border-border/50 hover:border-accent/20 transition-colors group">
                      <div
                        className="h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          backgroundColor: (STATE_COLORS[group.state] || '#f4b942') + '20',
                        }}
                      >
                        <span
                          className="text-[10px] font-bold"
                          style={{ color: STATE_COLORS[group.state] || '#f4b942' }}
                        >
                          {bIdx + 1}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">{bullet}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </Card>
          </FadeIn>
        ))}
      </div>
    </FadeIn>
  )
}
