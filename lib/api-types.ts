/**
 * Shared types for the unified /api/data responses.
 * These match the D1 master_data table columns.
 */

export interface MasterRow {
  id: number
  state: string
  lga: string
  risk_zone: string
  indicator: string
  y2022: number
  y2023: number
  y2024: number
  y2025: number
  change_pct: number
  trend: string
  sources: string
}

export interface RegionalOverviewRow {
  id: number
  section: string
  metric: string
  borno: number
  adamawa: number
  yobe: number
  bay_combined: number
  bay_2022: number
  bay_2023: number
  bay_2024: number
  bay_2025: number
  trend: string
  raw_row: string
}

export interface LgaProfileRow {
  id: number
  state: string
  lga: string
  risk_zone: string
  youth_pct: number
  literacy_pct: number
  unemployment_pct: number
  health_facilities: number
  ag_output: number
  displacement: number
  conflict_incidents: number
  smes: number
  out_of_school_gap: number
  voter_gap: number
}

export interface TrendAnalysisRow {
  id: number
  section: string
  state: string
  metric: string
  content: string
  raw_row: string
}

export interface IndicatorAnalysisRow {
  id: number
  indicator: string
  state: string
  lga: string
  risk_zone: string
  y2022: number
  y2023: number
  y2024: number
  y2025: number
  change_pct: number
  rank: number
}

export interface ApiResponse<T> {
  source?: string
  data: T[]
}

export interface SyncStatus {
  status: string
  last_sync: {
    updated_at: number
    details: { counts: Record<string, number>; errors: string[] }
  } | null
  tables: { t: string; c: number }[]
}

/** Typed fetch — avoids `unknown` return from res.json() with Cloudflare types */
export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  return res.json() as Promise<T>
}

/** Helper: group master_data rows by LGA */
export function groupByLga(rows: MasterRow[]): Map<string, MasterRow[]> {
  const map = new Map<string, MasterRow[]>()
  for (const row of rows) {
    const existing = map.get(row.lga) ?? []
    existing.push(row)
    map.set(row.lga, existing)
  }
  return map
}

/** Helper: get unique LGA names from rows */
export function getUniqueLgas(rows: MasterRow[]): string[] {
  return [...new Set(rows.map(r => r.lga))].sort()
}

/** Helper: get unique indicator names from rows */
export function getUniqueIndicators(rows: MasterRow[]): string[] {
  return [...new Set(rows.map(r => r.indicator))].sort()
}

/** Helper: compute summary from master_data rows */
export function computeSummary(rows: MasterRow[]) {
  const lgas = new Set(rows.map(r => r.lga))
  const displacement = rows
    .filter(r => r.indicator === 'Displacement')
    .reduce((sum, r) => sum + r.y2025, 0)
  const conflict = rows
    .filter(r => r.indicator === 'Conflict Incidents')
    .reduce((sum, r) => sum + r.y2025, 0)
  return {
    totalLGAs: lgas.size,
    totalDisplacement2025: displacement,
    totalConflict2025: conflict,
  }
}
