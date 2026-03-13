'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { Search, ArrowRight, TrendingUp, Users, AlertTriangle, MapPin } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { bayStates, getAllLGAs, getTopLGAsByNeed, type BAYState, type LGA } from '@/lib/bay-data'
import type { BornoData, BornoRow } from '@/app/api/sheets/borno/route'
import type { AdamawaData } from '@/app/api/sheets/adamawa/route'
import type { YobeData } from '@/app/api/sheets/yobe/route'

// BAY States data
const statesData = Object.values(bayStates)

// State card component
function StateCard({
  state,
}: {
  state: BAYState
}) {
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
                  <p className="text-xs text-muted-foreground">{state.lgaCount} LGAs • {state.population.toFixed(2)}M people</p>
                </div>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition" />
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Displaced</div>
              <div className="font-bold text-sm">{state.displacedPersons.toFixed(2)}M</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Need (M)</div>
              <div className="font-bold text-sm text-accent">{state.humanitarianNeed.toFixed(2)}M</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Severity</div>
              <div className="font-bold text-sm">{state.severity}/100</div>
            </div>
          </div>

          {/* Programs */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="text-sm">
              <span className="font-bold text-accent">{state.activePrograms}</span>
              <span className="text-muted-foreground ml-1">active programs</span>
            </div>
            <Badge className="bg-accent/10 text-accent border-accent/20">
              Active
            </Badge>
          </div>
        </div>
      </Card>
    </Link>
  )
}

// LGA card component  
function LGACard({
  lga,
  state,
}: {
  lga: LGA
  state: string
}) {
  return (
    <Card className="bg-card border-border hover:border-accent/50 transition">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-bold text-sm">{lga.name}</h4>
            <p className="text-xs text-muted-foreground mt-1">{state}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border text-xs">
          <div>
            <div className="text-muted-foreground mb-1">Need %</div>
            <div className="font-bold text-accent">{lga.humanitarianNeed}%</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Severity</div>
            <div className="font-bold">{lga.severity}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Population</div>
            <div className="font-bold">{(lga.population / 1000).toFixed(2)}M</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Programs</div>
            <div className="font-bold text-accent">{lga.activePrograms}</div>
          </div>
        </div>
      </div>
    </Card>
  )
}

// LGA card for sheet data (works for both Borno and Adamawa rows)
const ZONE_COLORS: Record<string, string> = {
  'Conflict-Affected': '#ef4444',
  'Stable/Urban': '#22c55e',
  'Semi-Stable': '#f59e0b',
  'High Risk': '#ef4444',
  'Moderate Risk': '#f59e0b',
  'Low Risk': '#22c55e',
}

function BornoSheetLGACard({ rows }: { rows: BornoRow[] }) {
  const lga = rows[0]?.lga ?? ''
  const zone = rows[0]?.zone ?? 'Conflict-Affected'
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
  const [bornoData, setBornoData] = useState<BornoData | null>(null)
  const [adamawaData, setAdamawaData] = useState<AdamawaData | null>(null)
  const [yobeData, setYobeData] = useState<YobeData | null>(null)

  useEffect(() => {
    fetch('/api/sheets/borno').then(r => r.json()).then(setBornoData).catch(() => {})
    fetch('/api/sheets/adamawa').then(r => r.json()).then(setAdamawaData).catch(() => {})
    fetch('/api/sheets/yobe').then(r => r.json()).then(setYobeData).catch(() => {})
  }, [])

  const topLGAs = useMemo(() => {
    const bnLGAs = bornoData
      ? bornoData.lgas.map(lgaName => {
          const row = bornoData.rows.find(r => r.lga === lgaName && r.indicator === 'Unemployment Rate')
          return { name: lgaName, need: row?.y2025 ?? 0 }
        })
      : []
    const adLGAs = adamawaData
      ? adamawaData.lgas.map(lgaName => {
          const row = adamawaData.rows.find(r => r.lga === lgaName && r.indicator === 'Unemployment Rate')
          return { name: lgaName, need: row?.y2025 ?? 0 }
        })
      : Object.values(bayStates['AD'].lgas).map(l => ({ name: l.name, need: l.youthUnemployment }))
    const ybLGAs = yobeData
      ? yobeData.lgas.map(lgaName => {
          const row = yobeData.rows.find(r => r.lga === lgaName && r.indicator === 'Unemployment Rate')
          return { name: lgaName, need: row?.y2025 ?? 0 }
        })
      : Object.values(bayStates['YB'].lgas).map(l => ({ name: l.name, need: l.youthUnemployment }))
    const all = [...bnLGAs, ...adLGAs, ...ybLGAs].filter(l => l.need > 0)
    if (all.length) return all.sort((a, b) => b.need - a.need).slice(0, 5)
    return getTopLGAsByNeed(5).map(l => ({ name: l.name, need: l.humanitarianNeed }))
  }, [bornoData, adamawaData, yobeData])

  // Group sheet rows by LGA name
  const bornoLGAMap = useMemo(() => {
    if (!bornoData) return new Map<string, BornoRow[]>()
    const map = new Map<string, BornoRow[]>()
    for (const row of bornoData.rows) {
      const existing = map.get(row.lga) ?? []
      existing.push(row)
      map.set(row.lga, existing)
    }
    return map
  }, [bornoData])

  const adamawaLGAMap = useMemo(() => {
    if (!adamawaData) return new Map<string, AdamawaData['rows']>()
    const map = new Map<string, AdamawaData['rows']>()
    for (const row of adamawaData.rows) {
      const existing = map.get(row.lga) ?? []
      existing.push(row)
      map.set(row.lga, existing)
    }
    return map
  }, [adamawaData])

  const yobeLGAMap = useMemo(() => {
    if (!yobeData) return new Map<string, BornoRow[]>()
    const map = new Map<string, BornoRow[]>()
    for (const row of yobeData.rows) {
      const existing = map.get(row.lga) ?? []
      existing.push(row as unknown as BornoRow)
      map.set(row.lga, existing)
    }
    return map
  }, [yobeData])

  const filteredStates = useMemo(() => {
    const base = statesData.map(s => {
      if (s.code === 'BN' && bornoData) return { ...s, lgaCount: bornoData.summary.totalLGAs }
      if (s.code === 'AD' && adamawaData) return { ...s, lgaCount: adamawaData.summary.totalLGAs }
      if (s.code === 'YB' && yobeData) return { ...s, lgaCount: yobeData.summary.totalLGAs }
      return s
    })
    if (!search) return base
    return base.filter(
      state =>
        state.name.toLowerCase().includes(search.toLowerCase()) ||
        state.code.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, bornoData, adamawaData, yobeData])

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">BAY States & LGAs</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Explore humanitarian data by state and local government area</p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
        <Input
          placeholder="Search states or LGAs..."
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
              <h2 className="font-bold text-base sm:text-lg">BAY States by Humanitarian Need</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Millions of people affected</p>
            </div>
            <ResponsiveContainer width="100%" height={220} className="sm:h-[300px]">
              <BarChart data={statesData.map(s => ({ code: s.code, name: s.name, need: s.humanitarianNeed }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="code" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1e23', border: '1px solid #2d3748', fontSize: 12 }}
                />
                <Bar dataKey="need" fill="#f4b942" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
                  <StateCard key={state.code} state={state} />
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
                {bornoData || adamawaData || yobeData ? `Live from tracker · ${bornoData ? 'Borno ✓' : 'Borno —'} ${adamawaData ? 'Adamawa ✓' : 'Adamawa —'} ${yobeData ? 'Yobe ✓' : 'Yobe —'}` : 'Percentage of youth population'}
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

          {/* All LGAs grid */}
          <div className="space-y-3 sm:space-y-4">
            <h2 className="font-bold text-base sm:text-lg">
              All LGAs ({(bornoData?.lgas.length ?? 8) + (adamawaData?.lgas.length ?? 7) + (yobeData?.lgas.length ?? Object.values(bayStates['YB'].lgas).length)})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {statesData.map(state => (
                <div key={state.code} className="space-y-2 sm:space-y-3">
                  <h3 className="font-bold text-xs sm:text-sm text-muted-foreground uppercase flex items-center gap-2">
                    {state.name} State
                    {state.code === 'BN' && bornoData && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-accent/20 text-accent normal-case">
                        {bornoData.lgas.length} LGAs · Live Data
                      </span>
                    )}
                    {state.code === 'AD' && adamawaData && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 normal-case">
                        {adamawaData.lgas.length} LGAs · Live Data
                      </span>
                    )}
                    {state.code === 'YB' && yobeData && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 normal-case">
                        {yobeData.lgas.length} LGAs · Live Data
                      </span>
                    )}
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    {state.code === 'BN' && bornoData ? (
                      bornoData.lgas.map(lgaName => {
                        const rows = bornoLGAMap.get(lgaName) ?? []
                        return <BornoSheetLGACard key={lgaName} rows={rows} />
                      })
                    ) : state.code === 'AD' && adamawaData ? (
                      adamawaData.lgas.map(lgaName => {
                        const rows = adamawaLGAMap.get(lgaName) ?? []
                        return <BornoSheetLGACard key={lgaName} rows={rows as unknown as BornoRow[]} />
                      })
                    ) : state.code === 'YB' && yobeData ? (
                      yobeData.lgas.map(lgaName => {
                        const rows = yobeLGAMap.get(lgaName) ?? []
                        return <BornoSheetLGACard key={lgaName} rows={rows} />
                      })
                    ) : (
                      Object.values(state.lgas).map((lga) => (
                        <LGACard key={lga.code} lga={lga} state={state.name} />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
