'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import { Plus, X, Download } from 'lucide-react'
import type { MasterRow, ApiResponse, CoverageRow } from '@/lib/api-types'
import { fetchJson } from '@/lib/api-types'
import { nigeriaStates } from '@/lib/nigeria-states'

// Rotating palette so any number of selected states gets a distinct color
const PALETTE = ['#f4b942', '#6ec6e8', '#8b5cf6', '#22c55e', '#ef4444', '#ec4899', '#14b8a6']
function colorFor(index: number): string {
  return PALETTE[index % PALETTE.length]
}

type YearKey = 'y2022' | 'y2023' | 'y2024' | 'y2025'
const YEARS: { key: YearKey; label: string }[] = [
  { key: 'y2022', label: '2022' }, { key: 'y2023', label: '2023' },
  { key: 'y2024', label: '2024' }, { key: 'y2025', label: '2025' },
]

export default function Comparison() {
  const [allRows, setAllRows] = useState<MasterRow[]>([])
  const [coverage, setCoverage] = useState<CoverageRow[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [compareMetric, setCompareMetric] = useState('')
  const [selectedYear, setSelectedYear] = useState<YearKey>('y2025')

  useEffect(() => {
    fetchJson<ApiResponse<MasterRow>>('/api/data?view=master').then(d => setAllRows(d.data ?? [])).catch(() => {})
    fetchJson<{ data: CoverageRow[] }>('/api/data?view=coverage').then(d => setCoverage(d.data ?? [])).catch(() => {})
  }, [])

  const liveStates = useMemo(
    () => Object.values(nigeriaStates).filter(s => coverage.some(c => c.state === s.name)),
    [coverage]
  )

  // Default to the first few live states once coverage loads
  useEffect(() => {
    if (selected.length === 0 && liveStates.length > 0) {
      setSelected(liveStates.slice(0, 3).map(s => s.code))
    }
  }, [liveStates, selected.length])

  const indicators = useMemo(
    () => [...new Set(allRows.map(r => r.indicator))].sort(),
    [allRows]
  )

  useEffect(() => {
    if (!compareMetric && indicators.length > 0) setCompareMetric(indicators[0])
  }, [indicators, compareMetric])

  const rowsByState = useMemo(() => {
    const map = new Map<string, MasterRow[]>()
    for (const row of allRows) {
      const existing = map.get(row.state) ?? []
      existing.push(row)
      map.set(row.state, existing)
    }
    return map
  }, [allRows])

  const avgForIndicator = (stateName: string, indicator: string, year: YearKey): number => {
    const rows = (rowsByState.get(stateName) ?? []).filter(r => r.indicator === indicator)
    if (!rows.length) return 0
    return rows.reduce((s, r) => s + r[year], 0) / rows.length
  }

  const addState = (code: string) => {
    if (!selected.includes(code)) setSelected([...selected, code])
  }
  const removeState = (code: string) => {
    if (selected.length > 1) setSelected(selected.filter(c => c !== code))
  }

  // Metrics table: selected states × all indicators, at the selected year
  const metricsTable = useMemo(() => {
    return indicators.map(indicator => ({
      indicator,
      values: selected.map(code => {
        const state = nigeriaStates[code]
        return { code, value: avgForIndicator(state.name, indicator, selectedYear) }
      }),
    }))
  }, [indicators, selected, selectedYear, rowsByState])

  // Bar chart for the currently selected metric
  const barData = selected.map((code, i) => {
    const state = nigeriaStates[code]
    return { code, name: state.name, value: avgForIndicator(state.name, compareMetric, selectedYear), fill: colorFor(i) }
  })

  // Radar chart: min-max normalize each indicator across selected states so scales are comparable
  const radarData = indicators.map(indicator => {
    const raw = selected.map(code => avgForIndicator(nigeriaStates[code].name, indicator, selectedYear))
    const min = Math.min(...raw), max = Math.max(...raw)
    const entry: Record<string, string | number> = { metric: indicator }
    selected.forEach((code, i) => {
      entry[code] = max > min ? +(((raw[i] - min) / (max - min)) * 100).toFixed(1) : 50
    })
    return entry
  })

  // Year trend for the currently selected metric, per selected state
  const trendData = YEARS.map(y => {
    const entry: Record<string, string | number> = { year: y.label }
    selected.forEach(code => {
      entry[code] = +avgForIndicator(nigeriaStates[code].name, compareMetric, y.key).toFixed(1)
    })
    return entry
  })

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Compare States</h1>
        <p className="text-muted-foreground">
          Analyze humanitarian and development data across states with live data · {liveStates.length} of {Object.keys(nigeriaStates).length} states live
        </p>
      </div>

      {liveStates.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <p className="text-muted-foreground">No states have live data synced yet.</p>
        </Card>
      ) : (
        <>
          {/* State Selection */}
          <Card className="bg-card border-border p-6 space-y-4">
            <div className="space-y-3">
              <h3 className="font-bold">Selected States</h3>
              <div className="flex flex-wrap gap-2">
                {selected.map(code => (
                  <Badge
                    key={code}
                    className="px-4 py-2 bg-secondary text-foreground border-border cursor-pointer hover:bg-accent hover:text-accent-foreground transition group"
                    onClick={() => removeState(code)}
                  >
                    {nigeriaStates[code].name}
                    {selected.length > 1 && <X className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 transition" />}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Click to remove (minimum 1 state required)</p>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">Add other states with live data</p>
              <div className="flex flex-wrap gap-2">
                {liveStates.filter(s => !selected.includes(s.code)).map(s => (
                  <Button
                    key={s.code}
                    variant="outline"
                    size="sm"
                    onClick={() => addState(s.code)}
                    className="border-border hover:bg-secondary"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {s.name}
                  </Button>
                ))}
                {liveStates.length === selected.length && (
                  <p className="text-xs text-muted-foreground py-1">All live states are selected.</p>
                )}
              </div>
            </div>
          </Card>

          {/* Comparison metrics table */}
          <Card className="bg-card border-border p-6 overflow-x-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold">State Metrics Comparison</h3>
              <div className="flex items-center gap-1 bg-secondary border border-border rounded-xl p-1">
                {YEARS.map(y => (
                  <button key={y.key} onClick={() => setSelectedYear(y.key)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${selectedYear === y.key ? 'bg-accent text-black' : 'text-muted-foreground hover:text-foreground'}`}>
                    {y.label}
                  </button>
                ))}
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-bold">Indicator</th>
                  {selected.map(code => (
                    <th key={code} className="text-right py-3 px-4 font-bold">
                      {nigeriaStates[code].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metricsTable.map(row => (
                  <tr key={row.indicator} className="border-b border-border hover:bg-secondary/20">
                    <td className="py-3 px-4 text-muted-foreground font-medium">{row.indicator}</td>
                    {row.values.map(v => (
                      <td key={v.code} className="text-right py-3 px-4 font-bold">{v.value.toFixed(1)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Bar chart comparison */}
          <Card className="bg-card border-border p-6">
            <div className="mb-6 space-y-3">
              <h3 className="font-bold">Compare Indicator</h3>
              <Select value={compareMetric} onValueChange={setCompareMetric}>
                <SelectTrigger className="w-full md:w-64 bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {indicators.map(indicator => (
                    <SelectItem key={indicator} value={indicator}>
                      {indicator}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="code" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1e23', border: '1px solid #2d3748' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Bar key={`bar-${index}`} dataKey="value" fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Radar chart - multi-dimensional comparison */}
          <Card className="bg-card border-border p-6">
            <h3 className="font-bold mb-6">Multi-Dimensional Analysis</h3>
            <p className="text-xs text-muted-foreground mb-4">Each indicator normalized 0–100 across selected states for comparability</p>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#2d3748" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" />
                <PolarRadiusAxis stroke="#94a3b8" />
                {selected.map((code, i) => (
                  <Radar
                    key={code}
                    name={nigeriaStates[code].name}
                    dataKey={code}
                    stroke={colorFor(i)}
                    fill={colorFor(i)}
                    fillOpacity={0.25}
                  />
                ))}
                <Tooltip contentStyle={{ backgroundColor: '#1a1e23', border: '1px solid #2d3748' }} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          {/* Year trend for the selected metric */}
          <Card className="bg-card border-border p-6">
            <h3 className="font-bold mb-6">{compareMetric} · 2022–2025 Trend</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="year" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1e23', border: '1px solid #2d3748' }} />
                <Legend />
                {selected.map((code, i) => (
                  <Line
                    key={code}
                    type="monotone"
                    dataKey={code}
                    stroke={colorFor(i)}
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name={nigeriaStates[code].name}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Export button */}
          <div className="flex justify-end">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
              <Download className="h-4 w-4" />
              Export Comparison Report
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
