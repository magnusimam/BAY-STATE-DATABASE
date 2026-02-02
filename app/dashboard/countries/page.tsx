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
import { useState, useMemo } from 'react'
import { bayStates, getAllLGAs, getTopLGAsByNeed, type BAYState, type LGA } from '@/lib/bay-data'

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

export default function Countries() {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('states')

  const topLGAs = getTopLGAsByNeed(5)

  const filteredStates = useMemo(() => {
    if (!search) return statesData
    return statesData.filter(
      state =>
        state.name.toLowerCase().includes(search.toLowerCase()) ||
        state.code.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">BAY States & LGAs</h1>
          <p className="text-muted-foreground">Explore humanitarian data by state and local government area</p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search states or LGAs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-secondary border-border focus:border-accent"
        />
      </div>

      {/* Tabs for States and LGAs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-secondary/50 border-border">
          <TabsTrigger value="states" className="data-[state=active]:bg-card">States</TabsTrigger>
          <TabsTrigger value="lgas" className="data-[state=active]:bg-card">LGAs</TabsTrigger>
        </TabsList>

        {/* States Tab */}
        <TabsContent value="states" className="space-y-6">
          {/* Top states chart */}
          <Card className="bg-card border-border p-6">
            <div className="mb-6">
              <h2 className="font-bold text-lg">BAY States by Humanitarian Need</h2>
              <p className="text-sm text-muted-foreground mt-1">Millions of people affected</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statesData.map(s => ({ code: s.code, name: s.name, need: s.humanitarianNeed }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="code" stroke="#a0a0a0" />
                <YAxis stroke="#a0a0a0" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                />
                <Bar dataKey="need" fill="#f4b942" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* States grid */}
          <div className="space-y-4">
            <h2 className="font-bold text-lg">All States ({filteredStates.length})</h2>
            {filteredStates.length === 0 ? (
              <Card className="bg-card border-border p-12 text-center">
                <p className="text-muted-foreground">No states found matching your search.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStates.map((state) => (
                  <StateCard key={state.code} state={state} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* LGAs Tab */}
        <TabsContent value="lgas" className="space-y-6">
          {/* Top LGAs by need */}
          <Card className="bg-card border-border p-6">
            <div className="mb-6">
              <h2 className="font-bold text-lg">Top 5 LGAs by Humanitarian Need</h2>
              <p className="text-sm text-muted-foreground mt-1">Percentage of population affected</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topLGAs.map(lga => ({ name: lga.name, need: lga.humanitarianNeed }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="name" stroke="#a0a0a0" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#a0a0a0" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                />
                <Bar dataKey="need" fill="#00d4ff" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* All LGAs grid */}
          <div className="space-y-4">
            <h2 className="font-bold text-lg">All LGAs ({getAllLGAs().length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {statesData.map(state => (
                <div key={state.code} className="space-y-3">
                  <h3 className="font-bold text-sm text-muted-foreground uppercase">{state.name} State</h3>
                  <div className="space-y-3">
                    {Object.values(state.lgas).map((lga) => (
                      <LGACard key={lga.code} lga={lga} state={state.name} />
                    ))}
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
