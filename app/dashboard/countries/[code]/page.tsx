'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ArrowLeft, Download, Share2, TrendingUp } from 'lucide-react'

// Mock data for countries
const countryDetails: Record<string, any> = {
  in: {
    name: 'India',
    code: 'IN',
    region: 'South Asia',
    population: '1.4 Billion',
    need: '450 Million',
    severity: 92,
    programs: 2847,
    description: 'India faces complex humanitarian challenges with a large youth population',
    timeline: [
      { month: 'Jan', need: 420, programs: 2600, severity: 88 },
      { month: 'Feb', need: 430, programs: 2700, severity: 90 },
      { month: 'Mar', need: 440, programs: 2750, severity: 91 },
      { month: 'Apr', need: 445, programs: 2800, severity: 92 },
      { month: 'May', need: 448, programs: 2820, severity: 92 },
      { month: 'Jun', need: 450, programs: 2847, severity: 92 },
    ],
    regionalBreakdown: [
      { region: 'North', need: 150, programs: 950 },
      { region: 'South', need: 120, programs: 800 },
      { region: 'East', need: 100, programs: 680 },
      { region: 'West', need: 80, programs: 417 },
    ],
    crisisTypes: [
      { type: 'Poverty', percentage: 35 },
      { type: 'Education', percentage: 28 },
      { type: 'Health', percentage: 22 },
      { type: 'Conflict', percentage: 15 },
    ],
  },
  ng: {
    name: 'Nigeria',
    code: 'NG',
    region: 'West Africa',
    population: '223 Million',
    need: '320 Million',
    severity: 88,
    programs: 1256,
    description: 'Nigeria faces significant humanitarian challenges in northern regions',
    timeline: [
      { month: 'Jan', need: 280, programs: 1100, severity: 82 },
      { month: 'Feb', need: 290, programs: 1150, severity: 84 },
      { month: 'Mar', need: 300, programs: 1180, severity: 85 },
      { month: 'Apr', need: 310, programs: 1210, severity: 87 },
      { month: 'May', need: 315, programs: 1235, severity: 88 },
      { month: 'Jun', need: 320, programs: 1256, severity: 88 },
    ],
    regionalBreakdown: [
      { region: 'North', need: 180, programs: 700 },
      { region: 'South', need: 80, programs: 350 },
      { region: 'Central', need: 60, programs: 206 },
    ],
    crisisTypes: [
      { type: 'Conflict', percentage: 45 },
      { type: 'Poverty', percentage: 30 },
      { type: 'Education', percentage: 15 },
      { type: 'Health', percentage: 10 },
    ],
  },
  sy: {
    name: 'Syria',
    code: 'SY',
    region: 'MENA',
    population: '22.1 Million',
    need: '280 Million',
    severity: 95,
    programs: 856,
    description: 'Syria faces ongoing crisis with critical humanitarian needs',
    timeline: [
      { month: 'Jan', need: 260, programs: 750, severity: 92 },
      { month: 'Feb', need: 265, programs: 770, severity: 93 },
      { month: 'Mar', need: 270, programs: 790, severity: 94 },
      { month: 'Apr', need: 275, programs: 810, severity: 94 },
      { month: 'May', need: 278, programs: 830, severity: 95 },
      { month: 'Jun', need: 280, programs: 856, severity: 95 },
    ],
    regionalBreakdown: [
      { region: 'Northwest', need: 120, programs: 380 },
      { region: 'South', need: 90, programs: 280 },
      { region: 'East', need: 70, programs: 196 },
    ],
    crisisTypes: [
      { type: 'Conflict', percentage: 60 },
      { type: 'Displacement', percentage: 25 },
      { type: 'Health', percentage: 10 },
      { type: 'Food Security', percentage: 5 },
    ],
  },
}

// Fallback for unknown countries
function getCountryDetails(code: string) {
  return countryDetails[code.toLowerCase()] || {
    name: code.toUpperCase(),
    code: code.toUpperCase(),
    region: 'Unknown Region',
    population: 'N/A',
    need: 'N/A',
    severity: 0,
    programs: 0,
    description: 'Country data not available',
    timeline: [],
    regionalBreakdown: [],
    crisisTypes: [],
  }
}

// Key stats component
function StatCard({
  label,
  value,
  unit = '',
}: {
  label: string
  value: string | number
  unit?: string
}) {
  return (
    <Card className="bg-card border-border p-6">
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <p className="text-3xl font-bold text-foreground">
        {value}
        {unit && <span className="text-lg ml-1">{unit}</span>}
      </p>
    </Card>
  )
}

export default function CountryDetail() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  const country = getCountryDetails(code)

  if (!country || !country.timeline || country.timeline.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Card className="bg-card border-border p-12 text-center">
          <p className="text-muted-foreground">Country data not found.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="gap-2 mb-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Countries
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold">{country.name}</h1>
            <Badge className="bg-accent/20 text-accent border-accent/30">
              {country.region}
            </Badge>
          </div>
          <p className="text-muted-foreground">{country.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-border gap-2 bg-transparent">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Population" value={country.population} />
        <StatCard label="Humanitarian Need" value={country.need} />
        <StatCard label="Severity Index" value={country.severity} unit="/100" />
        <StatCard label="Active Programs" value={country.programs} />
      </div>

      {/* Timeline */}
      <Card className="bg-card border-border p-6">
        <div className="mb-6">
          <h2 className="font-bold text-lg">6-Month Trend</h2>
          <p className="text-sm text-muted-foreground mt-1">Humanitarian need and program growth</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={country.timeline}>
            <defs>
              <linearGradient id="colorNeed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f4b942" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f4b942" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1e23', border: '1px solid #2d3748' }} />
            <Legend />
            <Area
              type="monotone"
              dataKey="need"
              stroke="#f4b942"
              fill="url(#colorNeed)"
              name="People in Need (M)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional breakdown */}
        <Card className="bg-card border-border p-6">
          <h2 className="font-bold text-lg mb-6">Regional Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={country.regionalBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="region" type="category" stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1e23', border: '1px solid #2d3748' }} />
              <Bar dataKey="need" fill="#f4b942" name="Need (M)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Crisis types */}
        <Card className="bg-card border-border p-6">
          <h2 className="font-bold text-lg mb-6">Crisis Types</h2>
          <div className="space-y-4">
            {country.crisisTypes.map((crisis: any, idx: number) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{crisis.type}</span>
                  <span className="font-bold text-accent">{crisis.percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${crisis.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Programs chart */}
      <Card className="bg-card border-border p-6">
        <div className="mb-6">
          <h2 className="font-bold text-lg">Program Growth</h2>
          <p className="text-sm text-muted-foreground mt-1">Active programs deployed</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={country.timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1e23', border: '1px solid #2d3748' }} />
            <Line
              type="monotone"
              dataKey="programs"
              stroke="#6ec6e8"
              strokeWidth={3}
              dot={{ fill: '#6ec6e8', r: 5 }}
              activeDot={{ r: 7 }}
              name="Active Programs"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
