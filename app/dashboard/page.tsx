'use client'

import React from "react"

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FadeIn, Sparkline, AnimatedCounter, ProgressRing } from '@/components/ui/animations'
import {
  AreaChart,
  Area,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  TrendingUp,
  Globe,
  Users,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Download,
  Filter,
} from 'lucide-react'

import type { MasterRow, RegionalOverviewRow, ApiResponse, SyncStatus } from '@/lib/api-types'
import { computeSummary, fetchJson } from '@/lib/api-types'
import { useAuth } from '@/lib/auth-context'
import { isAdminEmail } from '@/lib/admin-emails'

// BAY States data
const bayHumanitarianData = [
  { month: 'Jan', need: 6.85, displaced: 3.24, severity: 82 },
  { month: 'Feb', need: 6.92, displaced: 3.31, severity: 83 },
  { month: 'Mar', need: 7.05, displaced: 3.39, severity: 84 },
  { month: 'Apr', need: 7.12, displaced: 3.45, severity: 84 },
  { month: 'May', need: 7.19, displaced: 3.46, severity: 84 },
  { month: 'Jun', need: 7.25, displaced: 3.48, severity: 84 },
]

const bayStatesDistributionDefault = [
  { name: 'Borno', value: 3.32, fill: '#f4b942' },
  { name: 'Adamawa', value: 2.15, fill: '#6ec6e8' },
  { name: 'Yobe', value: 1.78, fill: '#8b5cf6' },
]

const youthProgramsData = [
  { month: 'Jan', enrolled: 78000, completed: 52000 },
  { month: 'Feb', enrolled: 82000, completed: 56000 },
  { month: 'Mar', enrolled: 85000, completed: 58000 },
  { month: 'Apr', enrolled: 91000, completed: 63000 },
  { month: 'May', enrolled: 95000, completed: 65000 },
  { month: 'Jun', enrolled: 102000, completed: 71000 },
]

// Crisis Data
const crisisData = [
  { month: 'Jan', crises: 100, population: 5000000 },
  { month: 'Feb', crises: 105, population: 5200000 },
  { month: 'Mar', crises: 110, population: 5400000 },
  { month: 'Apr', crises: 115, population: 5600000 },
  { month: 'May', crises: 120, population: 5800000 },
  { month: 'Jun', crises: 125, population: 6000000 },
]

// Region Data
const regionData = [
  { name: 'Africa', value: 10 },
  { name: 'Asia', value: 20 },
  { name: 'Europe', value: 30 },
  { name: 'North America', value: 40 },
]

// Youth Data
const youthData = [
  { month: 'Jan', enrolled: 78000, completed: 52000 },
  { month: 'Feb', enrolled: 82000, completed: 56000 },
  { month: 'Mar', enrolled: 85000, completed: 58000 },
  { month: 'Apr', enrolled: 91000, completed: 63000 },
  { month: 'May', enrolled: 95000, completed: 65000 },
  { month: 'Jun', enrolled: 102000, completed: 71000 },
]

// KPI Card Component
function KPICard({
  title,
  value,
  change,
  icon: Icon,
  trend = 'up',
  sparklineData,
  sparklineColor = '#f4b942',
}: {
  title: string
  value: string
  change: string
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down'
  sparklineData?: number[]
  sparklineColor?: string
}) {
  return (
    <Card hover className="bg-card border-border p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground">{value}</h3>
          <div className={`mt-1.5 sm:mt-2 text-xs sm:text-sm font-medium ${trend === 'up' ? 'text-success' : 'text-destructive'}`}>
            {trend === 'up' ? '↑' : '↓'} {change}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 sm:gap-3">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
          </div>
          {sparklineData && (
            <Sparkline 
              data={sparklineData} 
              color={sparklineColor} 
              width={50} 
              height={18} 
            />
          )}
        </div>
      </div>
    </Card>
  )
}

// Chart Card Component
function ChartCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card className="bg-card border-border p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h3 className="font-bold text-base sm:text-lg text-foreground">{title}</h3>
        {description && <p className="text-xs sm:text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {children}
    </Card>
  )
}

export default function Dashboard() {
  const [allRows, setAllRows] = React.useState<MasterRow[]>([])
  const [overview, setOverview] = React.useState<RegionalOverviewRow[]>([])
  const [syncing, setSyncing] = React.useState(false)
  const [lastSynced, setLastSynced] = React.useState<number | null>(null)
  const { user } = useAuth()

  const isAdmin = isAdminEmail(user?.email)

  React.useEffect(() => {
    // Fetch all master data + overview + sync status in parallel
    Promise.all([
      fetchJson<ApiResponse<MasterRow>>('/api/data?view=master').then(d => setAllRows(d.data ?? [])),
      fetchJson<ApiResponse<RegionalOverviewRow>>('/api/data?view=overview').then(d => setOverview(d.data ?? [])),
      fetchJson<SyncStatus>('/api/data').then(d => {
        if (d.last_sync?.updated_at) setLastSynced(d.last_sync.updated_at)
      }),
    ]).catch(() => {})
  }, [])

  const handleSync = async () => {
    if (!user) return
    setSyncing(true)
    try {
      const token = await user.getIdToken()
      await fetch('/api/admin/sync', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      const fresh = await fetchJson<ApiResponse<MasterRow>>('/api/data?view=master')
      setAllRows(fresh.data ?? [])
      setLastSynced(Date.now())
    } catch {
      // ignore
    } finally {
      setSyncing(false)
    }
  }

  const bornoRows = React.useMemo(() => allRows.filter(r => r.state === 'Borno'), [allRows])
  const adamawaRows = React.useMemo(() => allRows.filter(r => r.state === 'Adamawa'), [allRows])
  const yobeRows = React.useMemo(() => allRows.filter(r => r.state === 'Yobe'), [allRows])

  const bornoSummary = React.useMemo(() => computeSummary(bornoRows), [bornoRows])
  const adamawaSummary = React.useMemo(() => computeSummary(adamawaRows), [adamawaRows])
  const yobeSummary = React.useMemo(() => computeSummary(yobeRows), [yobeRows])
  const baySummary = React.useMemo(() => computeSummary(allRows), [allRows])

  const bornoLGAs = bornoSummary.totalLGAs || 27
  const adamawaLGAs = adamawaSummary.totalLGAs || 21
  const yobeLGAs = yobeSummary.totalLGAs || 17
  const totalDisplaced = baySummary.totalDisplacement2025
  const totalConflict = baySummary.totalConflict2025

  // Get KPI values from regional overview
  const getKpi = (metric: string) => overview.find(r => r.section === 'kpi' && r.metric.toLowerCase().includes(metric.toLowerCase()))

  const syncedAgo = lastSynced
    ? Math.round((Date.now() - lastSynced) / 60000) === 0
      ? 'just now'
      : `${Math.round((Date.now() - lastSynced) / 60000)}m ago`
    : null

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Real-time humanitarian and youth data insights</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Button variant="outline" size="sm" className="border-border gap-1.5 sm:gap-2 bg-transparent text-xs sm:text-sm h-8 sm:h-9">
            <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="border-border gap-1.5 sm:gap-2 bg-transparent text-xs sm:text-sm h-8 sm:h-9">
            <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Refresh
          </Button>
          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9">
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Export
          </Button>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSync}
                disabled={syncing}
                className="border-accent/40 text-accent hover:bg-accent/10 gap-1.5 text-xs sm:text-sm h-8 sm:h-9"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing…' : 'Sync Sheet'}
              </Button>
              {syncedAgo && (
                <span className="text-xs text-muted-foreground">Last synced: {syncedAgo}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* BAY States KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <FadeIn delay={0} direction="up">
          <KPICard
            title="Total Displaced (2025)"
            value={totalDisplaced ? `${(totalDisplaced / 1000).toFixed(1)}K` : '—'}
            change={`${bornoLGAs + adamawaLGAs + yobeLGAs} LGAs tracked`}
            icon={AlertTriangle}
            trend="down"
            sparklineData={allRows.length ? [totalDisplaced * 1.3, totalDisplaced * 1.2, totalDisplaced * 1.1, totalDisplaced] : undefined}
            sparklineColor="#6ec6e8"
          />
        </FadeIn>
        <FadeIn delay={100} direction="up">
          <KPICard
            title="Conflict Incidents (2025)"
            value={totalConflict ? totalConflict.toLocaleString() : '—'}
            change="Across BAY states"
            icon={AlertTriangle}
            trend="down"
            sparklineData={allRows.length ? [totalConflict * 1.4, totalConflict * 1.3, totalConflict * 1.1, totalConflict] : undefined}
            sparklineColor="#ef4444"
          />
        </FadeIn>
        <FadeIn delay={200} direction="up">
          <KPICard
            title="Borno LGAs"
            value={String(bornoLGAs)}
            change="Live from unified tracker"
            icon={Globe}
            trend="up"
            sparklineData={[8, 12, 18, 22, 25, bornoLGAs]}
            sparklineColor="#f4b942"
          />
        </FadeIn>
        <FadeIn delay={250} direction="up">
          <KPICard
            title="Adamawa LGAs"
            value={String(adamawaLGAs)}
            change="Live from unified tracker"
            icon={Globe}
            trend="up"
            sparklineData={[5, 8, 12, 16, 19, adamawaLGAs]}
            sparklineColor="#6ec6e8"
          />
        </FadeIn>
        <FadeIn delay={300} direction="up">
          <KPICard
            title="Yobe LGAs"
            value={String(yobeLGAs)}
            change="Live from unified tracker"
            icon={Globe}
            trend="up"
            sparklineData={[4, 7, 10, 13, 15, yobeLGAs]}
            sparklineColor="#8b5cf6"
          />
        </FadeIn>
        <FadeIn delay={350} direction="up">
          <KPICard
            title="Total SMEs (2025)"
            value={allRows.length ? allRows.filter(r => r.indicator === 'SMEs Registered').reduce((s, r) => s + r.y2025, 0).toLocaleString() : '—'}
            change="Across BAY states"
            icon={TrendingUp}
            trend="up"
            sparklineColor="#22c55e"
          />
        </FadeIn>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* BAY Humanitarian Need Trends - spans 2 columns */}
        <div className="lg:col-span-2">
          <ChartCard
            title="BAY States Humanitarian Need"
            description="Total population in need and displaced persons over time"
          >
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <AreaChart data={bayHumanitarianData}>
                <defs>
                  <linearGradient id="colorCrises" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f4b942" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f4b942" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1e23', border: '1px solid #2d3748', fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="need"
                  stroke="#f4b942"
                  fillOpacity={1}
                  fill="url(#colorCrises)"
                  name="People in Need (M)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* BAY States Distribution */}
        <ChartCard
          title="BAY States — Displacement"
          description="Total displaced persons by state (2025)"
        >
          {(() => {
            const distData = allRows.length ? [
              { name: 'Borno', value: bornoSummary.totalDisplacement2025, fill: '#f4b942' },
              { name: 'Adamawa', value: adamawaSummary.totalDisplacement2025, fill: '#6ec6e8' },
              { name: 'Yobe', value: yobeSummary.totalDisplacement2025, fill: '#8b5cf6' },
            ] : bayStatesDistributionDefault
            return (
              <>
                <ResponsiveContainer width="100%" height={220} className="sm:h-[300px]">
                  <PieChart>
                    <Pie data={distData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                      {distData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1a1e23', border: '1px solid #2d3748', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
                  {distData.map((state, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: state.fill }} />
                        <span className="text-muted-foreground">{state.name}</span>
                      </div>
                      <span className="font-bold">{allRows.length ? state.value.toLocaleString() : `${state.value}M`}</span>
                    </div>
                  ))}
                </div>
              </>
            )
          })()}
        </ChartCard>
      </div>

      {/* BAY Youth Programs & Need Severity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BAY Youth Program Enrollment */}
        <ChartCard
          title="BAY Youth Program Enrollment"
          description="Participants and completion rates"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={youthProgramsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1e23', border: '1px solid #2d3748' }}
              />
              <Legend />
              <Bar dataKey="enrolled" stackId="a" fill="#f4b942" name="Enrolled" />
              <Bar dataKey="completed" stackId="a" fill="#6ec6e8" name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* BAY Severity Trend */}
        <ChartCard
          title="Humanitarian Severity Index"
          description="Weighted measure of need across BAY states"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={bayHumanitarianData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1e23', border: '1px solid #2d3748' }}
              />
              <Line
                type="monotone"
                dataKey="severity"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 5 }}
                activeDot={{ r: 7 }}
                name="Severity Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/countries">
          <Card className="bg-card border-border hover:border-accent/50 transition cursor-pointer group h-full">
            <div className="p-6 space-y-4">
              <div className="h-10 w-10 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition">
                <Globe className="h-10 w-10 p-2 text-accent" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Country Insights</h3>
                <p className="text-sm text-muted-foreground">Deep-dive into country-specific data</p>
              </div>
              <div className="pt-2">
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition" />
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/comparison">
          <Card className="bg-card border-border hover:border-accent/50 transition cursor-pointer group h-full">
            <div className="p-6 space-y-4">
              <div className="h-10 w-10 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition">
                <TrendingUp className="h-10 w-10 p-2 text-accent" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Compare Data</h3>
                <p className="text-sm text-muted-foreground">Side-by-side analysis of regions</p>
              </div>
              <div className="pt-2">
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition" />
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/analysis">
          <Card className="bg-card border-border hover:border-accent/50 transition cursor-pointer group h-full">
            <div className="p-6 space-y-4">
              <div className="h-10 w-10 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition">
                <Users className="h-10 w-10 p-2 text-accent" />
              </div>
              <div>
                <h3 className="font-bold mb-1">AI Analysis</h3>
                <p className="text-sm text-muted-foreground">Machine learning insights</p>
              </div>
              <div className="pt-2">
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition" />
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/policy-briefs">
          <Card className="bg-card border-border hover:border-accent/50 transition cursor-pointer group h-full">
            <div className="p-6 space-y-4">
              <div className="h-10 w-10 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition">
                <AlertTriangle className="h-10 w-10 p-2 text-accent" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Policy Briefs</h3>
                <p className="text-sm text-muted-foreground">Automated policy recommendations</p>
              </div>
              <div className="pt-2">
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition" />
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  )
}
