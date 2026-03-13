import { NextResponse } from 'next/server'
import { readTrackerData, writeTrackerData } from '@/lib/firestore-tracker'

const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1hevrjRGbs7wkN5eS9hGiarmxaLkw5ICbvCuIGAbcf0w/export?format=csv'

const FIVE_MIN = 5 * 60 * 1000

export type AdamawaZone = 'High Risk' | 'Moderate Risk' | 'Low Risk'

export interface AdamawaRow {
  lga: string
  zone: AdamawaZone
  indicator: string
  y2022: number
  y2023: number
  y2024: number
  y2025: number
  trend: string
}

export interface AdamawaData {
  lgas: string[]
  indicators: string[]
  rows: AdamawaRow[]
  summary: {
    totalDisplacement2025: number
    totalConflict2025: number
    totalLGAs: number
  }
  lastSynced?: number
}

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

function parseNum(raw: string): number {
  const cleaned = raw.replace(/[₦,%\s]/g, '').replace(/[^0-9.-]/g, '')
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : n
}

function parseCSV(text: string): AdamawaData {
  const lines = text.split('\n').map(l => l.replace(/\r$/, ''))

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

  const rows: AdamawaRow[] = []
  const lgaSet = new Set<string>()
  const indicatorSet = new Set<string>()

  for (const line of dataLines) {
    const cols = parseCSVLine(line)
    if (cols.length < 9) continue

    const lga = cols[0].trim()
    const zone = cols[1].trim() as AdamawaZone
    const indicator = cols[2].trim()
    if (!lga || !zone || !indicator) continue

    lgaSet.add(lga)
    indicatorSet.add(indicator)

    const y2022 = parseNum(cols[3])
    const y2023 = parseNum(cols[4])
    const y2024 = parseNum(cols[5])
    const y2025 = parseNum(cols[6])

    rows.push({ lga, zone, indicator, y2022, y2023, y2024, y2025, trend: cols[8]?.trim() ?? '' })
  }

  const displacementRows = rows.filter(r => r.indicator === 'Displacement')
  const conflictRows = rows.filter(r => r.indicator === 'Conflict Incidents')

  return {
    lgas: Array.from(lgaSet).sort(),
    indicators: Array.from(indicatorSet),
    rows,
    summary: {
      totalDisplacement2025: displacementRows.reduce((sum, r) => sum + r.y2025, 0),
      totalConflict2025: conflictRows.reduce((sum, r) => sum + r.y2025, 0),
      totalLGAs: lgaSet.size,
    },
  }
}

export async function fetchAndParseAdamawaSheet(): Promise<AdamawaData> {
  const res = await fetch(SHEET_CSV_URL, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`)
  const text = await res.text()
  return parseCSV(text)
}

export async function GET() {
  try {
    const cached = await readTrackerData('adamawa')
    if (cached && cached.lastSynced && Date.now() - cached.lastSynced < FIVE_MIN) {
      return NextResponse.json(cached)
    }

    const fresh = await fetchAndParseAdamawaSheet()
    const lastSynced = Date.now()
    await writeTrackerData('adamawa', fresh)

    return NextResponse.json({ ...fresh, lastSynced })
  } catch (err) {
    console.error('[adamawa-sheets]', err)
    try {
      const stale = await readTrackerData('adamawa')
      if (stale) return NextResponse.json(stale)
    } catch {
      // ignore
    }
    return NextResponse.json(
      { lgas: [], indicators: [], rows: [], summary: { totalDisplacement2025: 0, totalConflict2025: 0, totalLGAs: 0 } },
      { status: 200 }
    )
  }
}
