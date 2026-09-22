'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Search, ArrowRight, MapPin } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { nigeriaStates, type NigeriaState } from '@/lib/nigeria-states'
import type { MasterRow, ApiResponse } from '@/lib/api-types'
import { groupByLga, computeSummary, fetchJson } from '@/lib/api-types'

const statesData = Object.values(nigeriaStates).sort((a, b) => a.name.localeCompare(b.name))

// State card component
function StateCard({
  state,
  rows,
  hasData,
}: {
  state: NigeriaState
  rows: MasterRow[]
  hasData: boolean
}) {
  const summary = rows.length ? computeSummary(rows) : null
  const lgaCount = summary?.totalLGAs ?? state.lgaCount

  return (
    <Link href={`/dashboard/countries/${state.code.toLowerCase()}`}>
      <Card className="bg-card border-border hover:border-accent/50 transition cursor-pointer group">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-10 w-10 rounded bg-accent/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{state.name}</h3>
                  <p className="text-xs text-muted-foreground">{state.zone} • {state.population.toFixed(2)}M people</p>
                </div>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition" />
          </div>

          {/* Metrics from live data */}
          {hasData && summary && (
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Displaced (2025)</div>
                <div className="font-bold text-sm">{summary.totalDisplacement2025.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Conflict (2025)</div>
                <div className="font-bold text-sm text-accent">{summary.totalConflict2025.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">LGAs Tracked</div>
                <div className="font-bold text-sm">{lgaCount}</div>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="text-sm text-muted-foreground">
              {hasData ? `${rows.length} data points` : `${state.lgaCount} LGAs`}
            </div>
            {hasData ? (
              <Badge className="bg-accent/10 text-accent border-accent/20">Active</Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground border-border">
                Data coming soon
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}

const ZONE_COLORS: Record<string, string> = {
  'Conflict-Affected': '#ef4444',
  'Stable/Urban': '#22c55e',
  'Semi-Stable': '#f59e0b',
  'High Risk': '#ef4444',
  'Moderate Risk': '#f59e0b',
  'Low Risk': '#22c55e',
}

function LGACard({ rows }: { rows: MasterRow[] }) {
  const lga = rows[0]?.lga ?? ''
  const zone = rows[0]?.risk_zone ?? 'High Risk'
  const zoneColor = ZONE_COLORS[zone] ?? '#f4b942'

  const getVal = (ind: string) => rows.find(r => r.indicator === ind)?.y2025 ?? 0
  const literacy = getVal('Literacy Rate')
  const unemployment = getVal('Unemployment Rate')
  const displacement = getVal('Displacement')
  const conflict = getVal('Conflict Incidents')

  return (
    <Card className="bg-card border-border hover:border-accent/50 transition">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-bold text-sm">{lga}</h4>
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full mt-1 inline-block"
              style={{ backgroundColor: `${zoneColor}20`, color: zoneColor }}>
              {zone}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border text-xs">
          <div>
            <div className="text-muted-foreground mb-1">Literacy</div>
            <div className="font-bold text-accent">{literacy.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Unemployment</div>
            <div className="font-bold">{unemployment.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Displaced</div>
            <div className="font-bold">{displacement.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Conflict</div>
            <div className="font-bold text-destructive">{conflict}</div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function Countries() {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('states')
  const [allRows, setAllRows] = useState<MasterRow[]>([])

  useEffect(() => {
    fetchJson<ApiResponse<MasterRow>>('/api/data?view=master')
      .then(d => setAllRows(d.data ?? []))
      .catch(() => {})
  }, [])

  const hasData = allRows.length > 0

  const rowsByState = useMemo(() => {
    const map = new Map<string, MasterRow[]>()
    for (const row of allRows) {
      const existing = map.get(row.state) ?? []
      existing.push(row)
      map.set(row.state, existing)
    }
    return map
  }, [allRows])

  const liveStateNames = useMemo(() => [...rowsByState.keys()].sort(), [rowsByState])

  const topLGAs = useMemo(() => {
    if (!hasData) return []
    const unemp = allRows.filter(r => r.indicator === 'Unemployment Rate')
    return unemp.sort((a, b) => b.y2025 - a.y2025).slice(0, 5).map(r => ({ name: r.lga, need: r.y2025 }))
  }, [allRows, hasData])

  const topStatesByDisplacement = useMemo(() => {
    return liveStateNames
      .map(name => ({ name, code: statesData.find(s => s.name === name)?.code ?? name.slice(0, 2).toUpperCase(), value: computeSummary(rowsByState.get(name) ?? []).totalDisplacement2025 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [liveStateNames, rowsByState])

  const filteredStates = useMemo(() => {
    if (!search) return statesData
    return statesData.filter(
      state =>
        state.name.toLowerCase().includes(search.toLowerCase()) ||
        state.code.toLowerCase().includes(search.toLowerCase()) ||
        state.zone.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Nigeria States & LGAs</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Explore humanitarian data across all 36 states and the FCT · {liveStateNames.length} of {statesData.length} states live
          </p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
        <Input
          placeholder="Search states or zones..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 sm:pl-10 bg-secondary border-border focus:border-accent h-9 sm:h-10 text-sm"
        />
      </div>

      {/* Tabs for States and LGAs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-xs sm:max-w-md grid-cols-2 bg-secondary/50 border-border h-9 sm:h-10">
          <TabsTrigger value="states" className="data-[state=active]:bg-card text-xs sm:text-sm">States</TabsTrigger>
          <TabsTrigger value="lgas" className="data-[state=active]:bg-card text-xs sm:text-sm">LGAs</TabsTrigger>
        </TabsList>

        {/* States Tab */}
        <TabsContent value="states" className="space-y-4 sm:space-y-6">
          {/* Top states chart */}
          <Card className="bg-card border-border p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <h2 className="font-bold text-base sm:text-lg">Displacement (2025)</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {topStatesByDisplacement.length ? 'Total displaced persons per state, top 8 states with live data' : 'No live data synced yet'}
              </p>
            </div>
            {topStatesByDisplacement.length > 0 ? (
              <ResponsiveContainer width="100%" height={220} className="sm:h-[300px]">
                <BarChart data={topStatesByDisplacement}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                  <XAxis dataKey="code" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1e23', border: '1px solid #2d3748', fontSize: 12 }}
                  />
                  <Bar dataKey="value" fill="#f4b942" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] sm:h-[300px] flex items-center justify-center text-sm text-muted-foreground">
                Loading...
              </div>
            )}
          </Card>

          {/* States grid */}
          <div className="space-y-3 sm:space-y-4">
            <h2 className="font-bold text-base sm:text-lg">All States ({filteredStates.length})</h2>
            {filteredStates.length === 0 ? (
              <Card className="bg-card border-border p-8 sm:p-12 text-center">
                <p className="text-sm sm:text-base text-muted-foreground">No states found matching your search.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {filteredStates.map((state) => (
                  <StateCard
                    key={state.code}
                    state={state}
                    rows={rowsByState.get(state.name) ?? []}
                    hasData={rowsByState.has(state.name)}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* LGAs Tab */}
        <TabsContent value="lgas" className="space-y-4 sm:space-y-6">
          {/* Top LGAs by need */}
          <Card className="bg-card border-border p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <h2 className="font-bold text-base sm:text-lg">Top 5 LGAs by Youth Unemployment</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {hasData ? `Live from unified tracker · ${computeSummary(allRows).totalLGAs} LGAs` : 'Percentage of youth population'}
              </p>
            </div>
            <ResponsiveContainer width="100%" height={220} className="sm:h-[300px]">
              <BarChart data={topLGAs}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1e23', border: '1px solid #2d3748', fontSize: 12 }}
                />
                <Bar dataKey="need" fill="#f4b942" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* LGAs grid — only states with live data get a section; the rest are summarized */}
          <div className="space-y-3 sm:space-y-4">
            <h2 className="font-bold text-base sm:text-lg">
              All LGAs ({hasData ? computeSummary(allRows).totalLGAs : 0})
            </h2>
            {liveStateNames.length < statesData.length && (
              <p className="text-xs sm:text-sm text-muted-foreground">
                {statesData.length - liveStateNames.length} states don&apos;t have LGA-level data synced yet.
              </p>
            )}
            {liveStateNames.length === 0 ? (
              <Card className="bg-card border-border p-8 sm:p-12 text-center">
                <p className="text-sm sm:text-base text-muted-foreground">Loading LGA data...</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {liveStateNames.map(stateName => {
                  const stateMap = groupByLga(rowsByState.get(stateName) ?? [])
                  return (
                    <div key={stateName} className="space-y-2 sm:space-y-3">
                      <h3 className="font-bold text-xs sm:text-sm text-muted-foreground uppercase flex items-center gap-2">
                        {stateName} State
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-accent/20 text-accent normal-case">
                          {stateMap.size} LGAs · Live Data
                        </span>
                      </h3>
                      <div className="space-y-2 sm:space-y-3">
                        {[...stateMap.entries()].map(([lgaName, rows]) => (
                          <LGACard key={lgaName} rows={rows} />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
