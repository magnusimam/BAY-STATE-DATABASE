'use client'

import { useState, useMemo } from 'react'
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
import { bayStates, type BAYState } from '@/lib/bay-data'

// BAY States data with timeline
const statesData: Record<string, any> = {
  BN: {
    name: 'Borno',
    population: 4.25,
    displacedPersons: 1.799,
    need: 3.32,
    severity: 91,
    programs: 448,
    youthUnemployment: 48.2,
    foodInsecurity: 76,
    timeline: [
      { month: 'Jan', BN: 3.15, AD: 2.05, YB: 1.68 },
      { month: 'Feb', BN: 3.18, AD: 2.08, YB: 1.70 },
      { month: 'Mar', BN: 3.22, AD: 2.10, YB: 1.73 },
      { month: 'Apr', BN: 3.25, AD: 2.12, YB: 1.75 },
      { month: 'May', BN: 3.28, AD: 2.13, YB: 1.76 },
      { month: 'Jun', BN: 3.32, AD: 2.15, YB: 1.78 },
    ],
  },
  AD: {
    name: 'Adamawa',
    population: 3.79,
    displacedPersons: 0.734,
    need: 2.15,
    severity: 76,
    programs: 390,
    youthUnemployment: 37.5,
    foodInsecurity: 56,
    timeline: [
      { month: 'Jan', BN: 3.15, AD: 2.05, YB: 1.68 },
      { month: 'Feb', BN: 3.18, AD: 2.08, YB: 1.70 },
      { month: 'Mar', BN: 3.22, AD: 2.10, YB: 1.73 },
      { month: 'Apr', BN: 3.25, AD: 2.12, YB: 1.75 },
      { month: 'May', BN: 3.28, AD: 2.13, YB: 1.76 },
      { month: 'Jun', BN: 3.32, AD: 2.15, YB: 1.78 },
    ],
  },
  YB: {
    name: 'Yobe',
    population: 2.43,
    displacedPersons: 0.949,
    need: 1.78,
    severity: 86,
    programs: 329,
    youthUnemployment: 44.8,
    foodInsecurity: 68,
    timeline: [
      { month: 'Jan', BN: 3.15, AD: 2.05, YB: 1.68 },
      { month: 'Feb', BN: 3.18, AD: 2.08, YB: 1.70 },
      { month: 'Mar', BN: 3.22, AD: 2.10, YB: 1.73 },
      { month: 'Apr', BN: 3.25, AD: 2.12, YB: 1.75 },
      { month: 'May', BN: 3.28, AD: 2.13, YB: 1.76 },
      { month: 'Jun', BN: 3.32, AD: 2.15, YB: 1.78 },
    ],
  },
}

// Comparison metrics for BAY states
const comparisonMetrics = [
  { key: 'population', label: 'Population (M)', type: 'number' },
  { key: 'displacedPersons', label: 'Displaced Persons (M)', type: 'number' },
  { key: 'need', label: 'Humanitarian Need (M)', type: 'number' },
  { key: 'severity', label: 'Severity Index', type: 'number' },
  { key: 'programs', label: 'Active Programs', type: 'number' },
  { key: 'youthUnemployment', label: 'Youth Unemployment (%)', type: 'number' },
  { key: 'foodInsecurity', label: 'Food Insecurity (%)', type: 'number' },
]

// Color mapping for BAY states
const colorMap: Record<string, string> = {
  BN: '#f4b942',
  AD: '#00d4ff',
  YB: '#627eea',
}

// Declare countriesData variable
const countriesData = statesData;

export default function Comparison() {
  const [selected, setSelected] = useState<string[]>(['BN', 'AD', 'YB'])
  const [compareMetric, setCompareMetric] = useState('need')

  const addState = (code: string) => {
    if (!selected.includes(code)) {
      setSelected([...selected, code])
    }
  }

  const removeState = (code: string) => {
    if (selected.length > 1) {
      setSelected(selected.filter(c => c !== code))
    }
  }

  const removeCountry = (code: string) => {
    setSelected(selected.filter(c => c !== code))
  }

  const addCountry = (code: string) => {
    if (!selected.includes(code)) {
      setSelected([...selected, code])
    }
  }

  // Prepare data for comparison
  const comparisonData = selected.map(code => ({
    code,
    name: countriesData[code].name,
    ...countriesData[code],
  }))

  // Prepare radar chart data
  const radarData = comparisonMetrics.map(metric => ({
    metric: metric.label,
    ...Object.fromEntries(
      selected.map(code => [
        code,
        Math.min(100, (countriesData[code][metric.key] / 100) * 100),
      ])
    ),
  }))

  // Prepare bar chart data for selected metric
  const barData = selected.map(code => ({
    code: countriesData[code].name,
    value: countriesData[code][compareMetric],
    fill: colorMap[code],
  }))

  // Prepare timeline data
  const timelineData = countriesData.BN.timeline.map((entry: any) => {
    const newEntry: any = { month: entry.month }
    selected.forEach(code => {
      newEntry[code] = countriesData[code].timeline.find((t: any) => t.month === entry.month)?.[code] || 0
    })
    return newEntry
  })

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Compare BAY States</h1>
        <p className="text-muted-foreground">Analyze humanitarian and development data across Borno, Adamawa, and Yobe</p>
      </div>

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
                {statesData[code].name}
                {selected.length > 1 && <X className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 transition" />}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Click to remove (minimum 1 state required)</p>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">Add other BAY states for comparison</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(statesData).map(([code, data]) => {
              if (!selected.includes(code)) {
                return (
                  <Button
                    key={code}
                    variant="outline"
                    size="sm"
                    onClick={() => addState(code)}
                    className="border-border hover:bg-secondary"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {(data as any).name}
                  </Button>
                )
              }
              return null
            })}
          </div>
        </div>
      </Card>

      {/* Comparison metrics table */}
      <Card className="bg-card border-border p-6 overflow-x-auto">
        <h3 className="font-bold mb-6">BAY States Metrics Comparison</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-bold">Metric</th>
              {selected.map(code => (
                <th key={code} className="text-right py-3 px-4 font-bold">
                  {countriesData[code].name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonMetrics.map(metric => (
              <tr key={metric.key} className="border-b border-border hover:bg-secondary/20">
                <td className="py-3 px-4 text-muted-foreground font-medium">{metric.label}</td>
                {selected.map(code => (
                  <td key={code} className="text-right py-3 px-4 font-bold">
                    {typeof countriesData[code][metric.key] === 'number'
                      ? countriesData[code][metric.key].toFixed(2)
                      : countriesData[code][metric.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Bar chart comparison */}
      <Card className="bg-card border-border p-6">
        <div className="mb-6 space-y-3">
          <h3 className="font-bold">Compare BAY State Metrics</h3>
          <Select value={compareMetric} onValueChange={setCompareMetric}>
            <SelectTrigger className="w-full md:w-64 bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {comparisonMetrics.map(metric => (
                <SelectItem key={metric.key} value={metric.key}>
                  {metric.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey="code" stroke="#a0a0a0" />
            <YAxis stroke="#a0a0a0" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }} />
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
        <h3 className="font-bold mb-6">BAY States Multi-Dimensional Analysis</h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#2a2a2a" />
            <PolarAngleAxis dataKey="metric" stroke="#a0a0a0" />
            <PolarRadiusAxis stroke="#a0a0a0" />
            {selected.map(code => (
              <Radar
                key={code}
                name={countriesData[code].name}
                dataKey={code}
                stroke={colorMap[code]}
                fill={colorMap[code]}
                fillOpacity={0.25}
              />
            ))}
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </Card>

      {/* Timeline comparison */}
      <Card className="bg-card border-border p-6">
        <h3 className="font-bold mb-6">BAY States Humanitarian Need Trend</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey="month" stroke="#a0a0a0" />
            <YAxis stroke="#a0a0a0" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }} />
            <Legend />
            {selected.map(code => (
              <Line
                key={code}
                type="monotone"
                dataKey={code}
                stroke={colorMap[code]}
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name={countriesData[code].name}
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
    </div>
  )
}
