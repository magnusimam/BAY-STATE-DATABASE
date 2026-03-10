import { NextResponse } from 'next/server'

export const revalidate = 3600 // Cache for 1 hour

const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1EPP646vv0zrcGAUIo5BKnclTWO8keDnxPUtDv-QsXh0/export?format=csv&gid=944871388'

// Indicators whose raw CSV values are stored as ×100 (e.g. "3400.00%" means 34%)
const DIVIDE_BY_100_INDICATORS = new Set(['Youth % Population', 'Out-of-school Gap', 'Voter Card Gap'])

export type BornoZone = 'Conflict-Affected' | 'Stable/Urban' | 'Semi-Stable'

export interface BornoRow {
  lga: string
  zone: BornoZone
  indicator: string
  y2022: number
  y2023: number
  y2024: number
  y2025: number
  trend: string
}

export interface BornoData {
  lgas: string[]
  indicators: string[]
  rows: BornoRow[]
  summary: {
    totalDisplacement2025: number
    totalConflict2025: number
    totalLGAs: number
  }
}

/** Parse a single CSV line respecting quoted fields */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

/** Strip currency symbols, commas, percent signs, and whitespace then parse float */
function parseNum(raw: string): number {
  const cleaned = raw.replace(/[₦,%\s]/g, '').replace(/[^0-9.-]/g, '')
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : n
}

function parseCSV(text: string): BornoData {
  const lines = text.split('\n').map(l => l.replace(/\r$/, ''))

  // Find the real header row (contains "LGA Name")
  let headerIdx = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('LGA Name')) {
      headerIdx = i
      break
    }
  }
  if (headerIdx === -1) {
    return { lgas: [], indicators: [], rows: [], summary: { totalDisplacement2025: 0, totalConflict2025: 0, totalLGAs: 0 } }
  }

  const dataLines = lines.slice(headerIdx + 1).filter(l => l.trim() && !l.startsWith('Data Sources'))

  const rows: BornoRow[] = []
  const lgaSet = new Set<string>()
  const indicatorSet = new Set<string>()

  for (const line of dataLines) {
    const cols = parseCSVLine(line)
    if (cols.length < 9) continue

    const lga = cols[0].trim()
    const zone = cols[1].trim() as BornoZone
    const indicator = cols[2].trim()
    if (!lga || !zone || !indicator) continue

    lgaSet.add(lga)
    indicatorSet.add(indicator)

    let y2022 = parseNum(cols[3])
    let y2023 = parseNum(cols[4])
    let y2024 = parseNum(cols[5])
    let y2025 = parseNum(cols[6])

    // Correct x100 encoding for certain percentage indicators
    if (DIVIDE_BY_100_INDICATORS.has(indicator)) {
      y2022 = y2022 / 100
      y2023 = y2023 / 100
      y2024 = y2024 / 100
      y2025 = y2025 / 100
    }

    rows.push({ lga, zone, indicator, y2022, y2023, y2024, y2025, trend: cols[8]?.trim() ?? '' })
  }

  // Compute summary totals from Displacement and Conflict Incidents rows
  const displacementRows = rows.filter(r => r.indicator === 'Displacement')
  const conflictRows = rows.filter(r => r.indicator === 'Conflict Incidents')
  const totalDisplacement2025 = displacementRows.reduce((sum, r) => sum + r.y2025, 0)
  const totalConflict2025 = conflictRows.reduce((sum, r) => sum + r.y2025, 0)

  return {
    lgas: Array.from(lgaSet).sort(),
    indicators: Array.from(indicatorSet),
    rows,
    summary: {
      totalDisplacement2025,
      totalConflict2025,
      totalLGAs: lgaSet.size,
    },
  }
}

export async function GET() {
  try {
    const res = await fetch(SHEET_CSV_URL, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`)
    const text = await res.text()
    const data = parseCSV(text)
    return NextResponse.json(data)
  } catch (err) {
    console.error('[borno-sheets]', err)
    return NextResponse.json(
      { lgas: [], indicators: [], rows: [], summary: { totalDisplacement2025: 0, totalConflict2025: 0, totalLGAs: 0 } },
      { status: 200 } // Return empty data rather than 500 so the page still renders
    )
  }
}
