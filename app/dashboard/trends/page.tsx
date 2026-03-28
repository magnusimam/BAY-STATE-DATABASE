'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  Filter,
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
} from '@/lib/api-types'

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

function TrendIcon({ trend }: { trend: string }) {
  const t = trend.toLowerCase()
  if (t.includes('improv') || t.includes('up') || t.includes('increas'))
    return <TrendingUp className="h-4 w-4 text-emerald-400" />
  if (t.includes('declin') || t.includes('down') || t.includes('decreas'))
    return <TrendingDown className="h-4 w-4 text-red-400" />
  return <Minus className="h-4 w-4 text-yellow-400" />
}

function trendColor(trend: string) {
  const t = trend.toLowerCase()
  if (t.includes('improv')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  if (t.includes('declin')) return 'bg-red-500/10 text-red-400 border-red-500/20'
  return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
}

export default function TrendsPage() {
  const [trends, setTrends] = useState<TrendAnalysisRow[]>([])
  const [masterRows, setMasterRows] = useState<MasterRow[]>([])
  const [loading, setLoading] = useState(true)
  const [stateFilter, setStateFilter] = useState('All')
  const [indicatorFilter, setIndicatorFilter] = useState('All')

  useEffect(() => {
    Promise.all([
      fetch('/api/data?view=trends').then(r => r.json()),
      fetch('/api/data?view=master').then(r => r.json()),
    ])
      .then(([trendData, masterData]: [ApiResponse<TrendAnalysisRow>, ApiResponse<MasterRow>]) => {
        setTrends(trendData.data ?? [])
        setMasterRows(masterData.data ?? [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Group trend_analysis rows by section
  const sections = useMemo(() => {
    const map = new Map<string, TrendAnalysisRow[]>()
    for (const row of trends) {
      const filtered = stateFilter !== 'All' && row.state && row.state.toLowerCase() !== stateFilter.toLowerCase()
      if (filtered) continue
      const existing = map.get(row.section) ?? []
      existing.push(row)
      map.set(row.section, existing)
    }
    return map
  }, [trends, stateFilter])

  // Build year-over-year chart data from master_data
  const yearChartData = useMemo(() => {
    let filtered = masterRows
    if (stateFilter !== 'All') filtered = filtered.filter(r => r.state === stateFilter)
    if (indicatorFilter !== 'All') filtered = filtered.filter(r => r.indicator === indicatorFilter)

    // Aggregate by year across all filtered rows
    const totals = { y2022: 0, y2023: 0, y2024: 0, y2025: 0 }
    for (const r of filtered) {
      totals.y2022 += r.y2022
      totals.y2023 += r.y2023
      totals.y2024 += r.y2024
      totals.y2025 += r.y2025
    }
    return [
      { year: '2022', value: totals.y2022 },
      { year: '2023', value: totals.y2023 },
      { year: '2024', value: totals.y2024 },
      { year: '2025', value: totals.y2025 },
    ]
  }, [masterRows, stateFilter, indicatorFilter])

  // State comparison chart for the selected indicator
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

  // Top movers — biggest change_pct (positive and negative)
  const topMovers = useMemo(() => {
    let filtered = masterRows
    if (stateFilter !== 'All') filtered = filtered.filter(r => r.state === stateFilter)
    const sorted = [...filtered].sort((a, b) => Math.abs(b.change_pct) - Math.abs(a.change_pct))
    return sorted.slice(0, 10)
  }, [masterRows, stateFilter])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Trend Analysis</h1>
          <p className="text-muted-foreground">4-year trends across BAY States indicators (2022-2025)</p>
        </div>
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="w-[140px] bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={indicatorFilter} onValueChange={setIndicatorFilter}>
            <SelectTrigger className="w-[180px] bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {INDICATORS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Year-over-Year Aggregate Chart */}
      <Card className="bg-card border-border p-6">
        <h2 className="font-bold text-lg mb-1">
          Year-over-Year {indicatorFilter !== 'All' ? indicatorFilter : 'Aggregate'} Trend
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {stateFilter !== 'All' ? stateFilter : 'BAY Combined'} — {indicatorFilter !== 'All' ? indicatorFilter : 'all indicators summed'}
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={yearChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis dataKey="year" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1e23', border: '1px solid #2d3748' }} />
            <Bar dataKey="value" fill="#f4b942" name="Total" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* State comparison (only when a specific indicator is selected) */}
      {indicatorFilter !== 'All' && stateComparisonData.length > 0 && (
        <Card className="bg-card border-border p-6">
          <h2 className="font-bold text-lg mb-1">State Comparison — {indicatorFilter}</h2>
          <p className="text-sm text-muted-foreground mb-6">Average per LGA across states over 4 years</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stateComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="year" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1e23', border: '1px solid #2d3748' }} />
              <Legend />
              <Line type="monotone" dataKey="Borno" stroke="#f4b942" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Adamawa" stroke="#6ec6e8" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Yobe" stroke="#a78bfa" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Top Movers */}
      <Card className="bg-card border-border p-6">
        <h2 className="font-bold text-lg mb-1">Top Movers (2022-2025)</h2>
        <p className="text-sm text-muted-foreground mb-6">LGA-indicator pairs with the largest 4-year changes</p>
        <div className="space-y-3">
          {topMovers.map((row, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
              <div className="flex items-center gap-3 min-w-0">
                <TrendIcon trend={row.trend} />
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{row.lga}</p>
                  <p className="text-xs text-muted-foreground">{row.state} — {row.indicator}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <p className="text-sm font-mono">{row.y2022.toLocaleString()} → {row.y2025.toLocaleString()}</p>
                </div>
                <Badge variant="outline" className={trendColor(row.trend)}>
                  {row.change_pct > 0 ? '+' : ''}{row.change_pct.toFixed(1)}%
                </Badge>
              </div>
            </div>
          ))}
          {topMovers.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-4">No data available</p>
          )}
        </div>
      </Card>

      {/* Narrative Insights from trend_analysis table */}
      {sections.size > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Narrative Insights</h2>
          {[...sections.entries()].map(([section, rows]) => (
            <Card key={section} className="bg-card border-border p-6 space-y-4">
              <h3 className="font-bold text-lg capitalize">{section.replace(/_/g, ' ')}</h3>
              <div className="space-y-3">
                {rows.map((row, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-secondary/20 border border-border">
                    {row.metric && (
                      <p className="text-xs font-medium text-accent mb-1">
                        {row.metric} {row.state && `— ${row.state}`}
                      </p>
                    )}
                    <p className="text-sm text-foreground">{row.content}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
