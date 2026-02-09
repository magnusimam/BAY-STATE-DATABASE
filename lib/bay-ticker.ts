// BAY States Live Ticker Data & Utilities
// Real-time indicators for humanitarian and youth data

export interface TickerIndicator {
  label: string
  value: string
  change: string
  color: string
  type: 'metric' | 'trend' | 'status'
}

// Base BAY live indicators
export const BAY_LIVE_INDICATORS: TickerIndicator[] = [
  {
    label: 'People in Need',
    value: '7.25M',
    change: '+1.8%',
    color: '#f4b942',
    type: 'metric',
  },
  {
    label: 'Displaced Persons',
    value: '3.48M',
    change: '+0.9%',
    color: '#6ec6e8',
    type: 'metric',
  },
  {
    label: 'Active Programs',
    value: '1,167',
    change: '+3.2%',
    color: '#8b5cf6',
    type: 'metric',
  },
  {
    label: 'LGAs Covered',
    value: '23',
    change: 'all areas',
    color: '#22c55e',
    type: 'status',
  },
]

// State-specific indicators
export const BAY_STATE_INDICATORS = {
  BN: {
    name: 'Borno',
    need: '3.32M',
    displaced: '1.799M',
    severity: 91,
    programs: 448,
    trend: 'up',
  },
  AD: {
    name: 'Adamawa',
    need: '2.15M',
    displaced: '0.734M',
    severity: 76,
    programs: 390,
    trend: 'stable',
  },
  YB: {
    name: 'Yobe',
    need: '1.78M',
    displaced: '0.949M',
    severity: 86,
    programs: 329,
    trend: 'up',
  },
}

// LGA-level critical indicators
export const CRITICAL_LGAs = [
  { name: 'Maiduguri Metropolitan', state: 'Borno', severity: 92, need: '78%' },
  { name: 'Gwoza', state: 'Borno', severity: 92, need: '87%' },
  { name: 'Marte', state: 'Borno', severity: 94, need: '88%' },
  { name: 'Geidam', state: 'Yobe', severity: 89, need: '79%' },
  { name: 'Tarmuwa', state: 'Yobe', severity: 88, need: '77%' },
]

// Generate randomized ticker updates for simulation
export function generateLiveUpdate(indicator: TickerIndicator): TickerIndicator {
  if (indicator.type === 'status') return indicator

  // Extract numeric value
  const numericValue = parseInt(indicator.value.replace(/[^0-9]/g, ''))
  const suffix = indicator.value.match(/[A-Z]|%/)?.[0] || ''

  // Generate slight variation
  const variation = 0.98 + Math.random() * 0.04
  const newValue = Math.round(numericValue * variation)
  const formattedValue = String(newValue).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix

  // Calculate percentage change
  const percentChange = ((newValue - numericValue) / numericValue * 100).toFixed(1)
  const changeSymbol = newValue > numericValue ? '+' : ''

  return {
    ...indicator,
    value: formattedValue,
    change: `${changeSymbol}${percentChange}%`,
  }
}

// Get severity color based on score
export function getSeverityColor(score: number): string {
  if (score >= 90) return '#dc2626' // Critical Red
  if (score >= 80) return '#f4b942' // Orange
  if (score >= 70) return '#ffd700' // Yellow
  return '#4caf50' // Green
}

// Format humanitarian need text
export function formatNeedLevel(percentage: number): string {
  if (percentage >= 80) return 'Critical'
  if (percentage >= 60) return 'High'
  if (percentage >= 40) return 'Moderate'
  return 'Low'
}
