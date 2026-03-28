'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Brain,
  Loader2,
  Activity,
  BarChart3,
  Target,
} from 'lucide-react'
import {
  fetchJson,
  type MasterRow,
  type IndicatorAnalysisRow,
  type TrendAnalysisRow,
  type ApiResponse,
} from '@/lib/api-types'

export default function Analysis() {
  const [masterRows, setMasterRows] = useState<MasterRow[]>([])
  const [indicatorRows, setIndicatorRows] = useState<IndicatorAnalysisRow[]>([])
  const [trendRows, setTrendRows] = useState<TrendAnalysisRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchJson<ApiResponse<MasterRow>>('/api/data?view=master'),
      fetchJson<ApiResponse<IndicatorAnalysisRow>>('/api/data?view=indicators'),
      fetchJson<ApiResponse<TrendAnalysisRow>>('/api/data?view=trends'),
    ])
      .then(([master, indicators, trends]) => {
        setMasterRows(master.data ?? [])
        setIndicatorRows(indicators.data ?? [])
        setTrendRows(trends.data ?? [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // KPI summaries
  const kpis = useMemo(() => {
    if (!masterRows.length) return null
    const states = ['Borno', 'Adamawa', 'Yobe']
    const totalLGAs = new Set(masterRows.map(r => r.lga)).size

    const displacement2025 = masterRows
      .filter(r => r.indicator === 'Displacement')
      .reduce((s, r) => s + r.y2025, 0)
    const displacement2022 = masterRows
      .filter(r => r.indicator === 'Displacement')
      .reduce((s, r) => s + r.y2022, 0)
    const displacementChange = displacement2022 > 0
      ? ((displacement2025 - displacement2022) / displacement2022 * 100).toFixed(1)
      : '0'

    const conflict2025 = masterRows
      .filter(r => r.indicator === 'Conflict Incidents')
      .reduce((s, r) => s + r.y2025, 0)

    const improving = masterRows.filter(r => r.trend.toLowerCase().includes('improv')).length
    const declining = masterRows.filter(r => r.trend.toLowerCase().includes('declin')).length
    const stable = masterRows.length - improving - declining

    return { totalLGAs, displacement2025, displacementChange, conflict2025, improving, declining, stable }
  }, [masterRows])

  // Radar chart: average indicators per state (normalized 0-100)
  const radarData = useMemo(() => {
    const indicators = [...new Set(masterRows.map(r => r.indicator))]
    return indicators.map(ind => {
      const entry: Record<string, string | number> = { indicator: ind.replace(/ /g, '\n') }
      for (const state of ['Borno', 'Adamawa', 'Yobe']) {
        const rows = masterRows.filter(r => r.indicator === ind && r.state === state)
        const avg = rows.length ? rows.reduce((s, r) => s + r.y2025, 0) / rows.length : 0
        entry[state] = +avg.toFixed(1)
      }
      return entry
    })
  }, [masterRows])

  // Risk zone distribution
  const riskZoneData = useMemo(() => {
    const zones = new Map<string, { high: number; medium: number; low: number }>()
    const lgas = new Map<string, MasterRow>()
    for (const r of masterRows) {
      if (!lgas.has(r.lga)) lgas.set(r.lga, r)
    }
    for (const [, r] of lgas) {
      const s = zones.get(r.state) ?? { high: 0, medium: 0, low: 0 }
      const z = r.risk_zone.toLowerCase()
      if (z.includes('high')) s.high++
      else if (z.includes('medium')) s.medium++
      else s.low++
      zones.set(r.state, s)
    }
    return [...zones.entries()].map(([state, counts]) => ({
      state,
      ...counts,
    }))
  }, [masterRows])

  // Anomalies: indicators with extreme change_pct
  const anomalies = useMemo(() => {
    return [...masterRows]
      .filter(r => Math.abs(r.change_pct) > 30)
      .sort((a, b) => Math.abs(b.change_pct) - Math.abs(a.change_pct))
      .slice(0, 8)
  }, [masterRows])

  // Patterns: group indicator_analysis by indicator, showing top/bottom ranked
  const patterns = useMemo(() => {
    const byIndicator = new Map<string, IndicatorAnalysisRow[]>()
    for (const row of indicatorRows) {
      const existing = byIndicator.get(row.indicator) ?? []
      existing.push(row)
      byIndicator.set(row.indicator, existing)
    }
    return [...byIndicator.entries()].slice(0, 5).map(([indicator, rows]) => {
      const sorted = [...rows].sort((a, b) => a.rank - b.rank)
      return {
        indicator,
        top3: sorted.slice(0, 3),
        bottom3: sorted.slice(-3).reverse(),
        avgChange: rows.length
          ? +(rows.reduce((s, r) => s + r.change_pct, 0) / rows.length).toFixed(1)
          : 0,
      }
    })
  }, [indicatorRows])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4 py-6">
        <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
          <Brain className="h-8 w-8 text-accent" />
        </div>
        <h1 className="text-4xl font-bold">AI Analysis Engine</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Data-driven analysis across {kpis?.totalLGAs ?? 65} LGAs, 10 indicators, and 4 years of BAY States humanitarian data.
        </p>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Displacement (2025)</p>
            <p className="text-2xl font-bold">{kpis.displacement2025.toLocaleString()}</p>
            <p className={`text-xs ${Number(kpis.displacementChange) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {Number(kpis.displacementChange) > 0 ? '+' : ''}{kpis.displacementChange}% since 2022
            </p>
          </Card>
          <Card className="bg-card border-border p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Conflict Incidents (2025)</p>
            <p className="text-2xl font-bold">{kpis.conflict2025.toLocaleString()}</p>
          </Card>
          <Card className="bg-card border-border p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Improving Indicators</p>
            <p className="text-2xl font-bold text-emerald-400">{kpis.improving}</p>
            <p className="text-xs text-muted-foreground">of {masterRows.length} tracked</p>
          </Card>
          <Card className="bg-card border-border p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Declining Indicators</p>
            <p className="text-2xl font-bold text-red-400">{kpis.declining}</p>
            <p className="text-xs text-muted-foreground">{kpis.stable} stable</p>
          </Card>
        </div>
      )}

      {/* Risk Zone Distribution + Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-accent" />
            <h2 className="font-bold text-lg">Risk Zone Distribution</h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={riskZoneData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="state" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1e23', border: '1px solid #2d3748' }} />
              <Legend />
              <Bar dataKey="high" fill="#ef4444" name="High Risk" stackId="a" />
              <Bar dataKey="medium" fill="#f4b942" name="Medium Risk" stackId="a" />
              <Bar dataKey="low" fill="#22c55e" name="Low Risk" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="bg-card border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-accent" />
            <h2 className="font-bold text-lg">State Indicator Profile (2025)</h2>
          </div>
          {radarData.length > 0 && (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData.slice(0, 6)}>
                <PolarGrid stroke="#2d3748" />
                <PolarAngleAxis dataKey="indicator" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar name="Borno" dataKey="Borno" stroke="#f4b942" fill="#f4b942" fillOpacity={0.15} />
                <Radar name="Adamawa" dataKey="Adamawa" stroke="#6ec6e8" fill="#6ec6e8" fillOpacity={0.15} />
                <Radar name="Yobe" dataKey="Yobe" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.15} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Anomaly Detection */}
      <Card className="bg-card border-border p-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-orange-400" />
          <h2 className="font-bold text-lg">Anomaly Detection</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          LGA-indicator pairs with &gt;30% change over 4 years flagged for review
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {anomalies.map((row, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border"
            >
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{row.lga}</p>
                <p className="text-xs text-muted-foreground">{row.state} — {row.indicator}</p>
              </div>
              <Badge
                variant="outline"
                className={
                  row.change_pct > 0
                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }
              >
                {row.change_pct > 0 ? '+' : ''}{row.change_pct.toFixed(1)}%
              </Badge>
            </div>
          ))}
          {anomalies.length === 0 && (
            <p className="text-muted-foreground text-sm col-span-2 text-center py-4">
              No significant anomalies detected
            </p>
          )}
        </div>
      </Card>

      {/* Pattern Detection — Top/Bottom by Indicator */}
      <Card className="bg-card border-border p-6">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="h-5 w-5 text-accent" />
          <h2 className="font-bold text-lg">Pattern Detection — Indicator Rankings</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Top and bottom performing LGAs per indicator based on ranking data
        </p>
        <div className="space-y-6">
          {patterns.map(({ indicator, top3, bottom3, avgChange }) => (
            <div key={indicator} className="p-4 rounded-lg bg-secondary/20 border border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm">{indicator}</h3>
                <Badge variant="outline" className={avgChange >= 0 ? 'text-emerald-400 border-emerald-500/20' : 'text-red-400 border-red-500/20'}>
                  Avg change: {avgChange > 0 ? '+' : ''}{avgChange}%
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-emerald-400 font-medium mb-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Top Performing
                  </p>
                  {top3.map((r, i) => (
                    <p key={i} className="text-xs text-muted-foreground">
                      #{r.rank} {r.lga} ({r.state}) — {r.y2025.toLocaleString()}
                    </p>
                  ))}
                </div>
                <div>
                  <p className="text-xs text-red-400 font-medium mb-2 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" /> Lowest Performing
                  </p>
                  {bottom3.map((r, i) => (
                    <p key={i} className="text-xs text-muted-foreground">
                      #{r.rank} {r.lga} ({r.state}) — {r.y2025.toLocaleString()}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {patterns.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-4">No indicator analysis data available</p>
          )}
        </div>
      </Card>

      {/* Narrative Insights from trend_analysis */}
      {trendRows.length > 0 && (
        <Card className="bg-card border-border p-6">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-5 w-5 text-accent" />
            <h2 className="font-bold text-lg">Key Insights</h2>
          </div>
          <div className="space-y-3 mt-4">
            {trendRows.slice(0, 8).map((row, idx) => (
              <div key={idx} className="flex gap-3 p-3 rounded-lg bg-secondary/20">
                <Lightbulb className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  {row.metric && (
                    <p className="text-xs font-medium text-accent mb-1">
                      {row.metric} {row.state && `— ${row.state}`}
                    </p>
                  )}
                  <p className="text-sm text-foreground">{row.content}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
