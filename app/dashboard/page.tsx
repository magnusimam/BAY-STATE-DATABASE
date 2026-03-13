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

import type { BornoData } from '@/app/api/sheets/borno/route'
import type { AdamawaData } from '@/app/api/sheets/adamawa/route'
import type { YobeData } from '@/app/api/sheets/yobe/route'
import { useAuth } from '@/lib/auth-context'

// BAY States data
const bayHumanitarianData = [
  { month: 'Jan', need: 6.85, displaced: 3.24, severity: 82 },
  { month: 'Feb', need: 6.92, displaced: 3.31, severity: 83 },
  { month: 'Mar', need: 7.05, displaced: 3.39, severity: 84 },
  { month: 'Apr', need: 7.12, displaced: 3.45, severity: 84 },
  { month: 'May', need: 7.19, displaced: 3.46, severity: 84 },
  { month: 'Jun', need: 7.25, displaced: 3.48, severity: 84 },
]

const bayStatesDistribution = [
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
  const [bornoData, setBornoData] = React.useState<BornoData | null>(null)
  const [adamawaData, setAdamawaData] = React.useState<AdamawaData | null>(null)
  const [yobeData, setYobeData] = React.useState<YobeData | null>(null)
  const [syncing, setSyncing] = React.useState(false)
  const [lastSynced, setLastSynced] = React.useState<number | null>(null)
  const { user } = useAuth()

  const isAdmin = !!(user?.email && (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase()).includes(user.email.toLowerCase()))

  React.useEffect(() => {
    fetch('/api/sheets/borno').then(r => r.json()).then((d: BornoData) => {
      setBornoData(d)
      if (d.lastSynced) setLastSynced(d.lastSynced)
    }).catch(() => {})
    fetch('/api/sheets/adamawa').then(r => r.json()).then((d: AdamawaData) => {
      setAdamawaData(d)
    }).catch(() => {})
    fetch('/api/sheets/yobe').then(r => r.json()).then((d: YobeData) => {
      setYobeData(d)
    }).catch(() => {})
  }, [])

  const handleSync = async () => {
    if (!user) return
    setSyncing(true)
    try {
      const token = await user.getIdToken()
      await fetch('/api/admin/sync', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      const [fresh, freshAD, freshYB] = await Promise.all([
        fetch('/api/sheets/borno').then(r => r.json()),
        fetch('/api/sheets/adamawa').then(r => r.json()),
        fetch('/api/sheets/yobe').then(r => r.json()),
      ])
      setBornoData(fresh)
      setAdamawaData(freshAD)
      setYobeData(freshYB)
      setLastSynced(Date.now())
    } catch {
      // ignore
    } finally {
      setSyncing(false)
    }
  }

  const bornoLGAs = bornoData?.summary.totalLGAs ?? 27
  const bornoDisplaced = bornoData ? (bornoData.summary.totalDisplacement2025 / 1_000_000).toFixed(2) + 'M' : '0.21M'
  const adamawaLGAs = adamawaData?.summary.totalLGAs ?? 21
  const yobeLGAs = yobeData?.summary.totalLGAs ?? 17

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
            title="People in Need"
            value="7.25M"
            change="+1.8% this month"
            icon={Users}
            trend="up"
            sparklineData={[6.85, 6.92, 7.05, 7.12, 7.19, 7.25]}
            sparklineColor="#f4b942"
          />
        </FadeIn>
        <FadeIn delay={100} direction="up">
          <KPICard
            title="Displaced Persons"
            value="3.48M"
            change="+0.9% this month"
            icon={AlertTriangle}
            trend="up"
            sparklineData={[3.24, 3.31, 3.39, 3.45, 3.46, 3.48]}
            sparklineColor="#6ec6e8"
          />
        </FadeIn>
        <FadeIn delay={200} direction="up">
          <KPICard
            title="Borno LGAs Tracked"
            value={String(bornoLGAs)}
            change="Live from Google Sheet"
            icon={Globe}
            trend="up"
            sparklineData={[8, 12, 18, 22, 25, bornoLGAs]}
            sparklineColor="#8b5cf6"
          />
        </FadeIn>
        <FadeIn delay={250} direction="up">
          <KPICard
            title="Adamawa LGAs Tracked"
            value={String(adamawaLGAs)}
            change="Live from Google Sheet"
            icon={Globe}
            trend="up"
            sparklineData={[5, 8, 12, 16, 19, adamawaLGAs]}
            sparklineColor="#6ec6e8"
          />
        </FadeIn>
        <FadeIn delay={300} direction="up">
          <KPICard
            title="Yobe LGAs Tracked"
            value={String(yobeLGAs)}
            change="Live from Google Sheet"
            icon={Globe}
            trend="up"
            sparklineData={[4, 7, 10, 13, 15, yobeLGAs]}
            sparklineColor="#8b5cf6"
          />
        </FadeIn>
        <FadeIn delay={350} direction="up">
          <KPICard
            title="Active Programs"
            value="1,167"
            change="+3.2% this month"
            icon={TrendingUp}
            trend="up"
            sparklineData={[980, 1020, 1050, 1090, 1120, 1167]}
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
          title="BAY States Distribution"
          description="Humanitarian need by state"
        >
          <ResponsiveContainer width="100%" height={220} className="sm:h-[300px]">
            <PieChart>
              <Pie
                data={bayStatesDistribution}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {bayStatesDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1a1e23', border: '1px solid #2d3748', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
            {bayStatesDistribution.map((state, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: state.fill }}
                  />
                  <span className="text-muted-foreground">{state.name}</span>
                </div>
                <span className="font-bold">{state.value}M</span>
              </div>
            ))}
          </div>
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
