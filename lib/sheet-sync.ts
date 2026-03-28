/**
 * Unified Google Sheet sync — fetches all 6 tabs from the BAY Sub-Regional
 * Youth Peace & Security Tracker and writes to D1 + KV.
 */

import { getCloudflareContext } from '@opennextjs/cloudflare'

// ── Sheet Config ─────────────────────────────────────────────────────────────

const SPREADSHEET_ID = '1VE8AP0mIXQF7zF2TXqrWwo6S-KWPh5gC8cl30FCzZbY'

const TABS = {
  MASTER_DATA:        { gid: '1246866788', table: 'master_data' },
  REGIONAL_OVERVIEW:  { gid: '909228715',  table: 'regional_overview' },
  LGA_PROFILES:       { gid: '436378337',  table: 'lga_profiles' },
  TREND_ANALYSIS:     { gid: '2054908454', table: 'trend_analysis' },
  INDICATOR_ANALYSIS: { gid: '1323234703', table: 'indicator_analysis' },
  METHODOLOGY:        { gid: '555539939',  table: 'methodology' },
} as const

type TabName = keyof typeof TABS

function csvUrl(gid: string): string {
  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${gid}`
}

// ── CSV Parsing ──────────────────────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
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

function parseCSV(text: string): string[][] {
  return text
    .split('\n')
    .map(l => l.replace(/\r$/, ''))
    .filter(l => l.trim().length > 0)
    .map(parseCSVLine)
}

function parseNum(raw: string): number {
  if (!raw) return 0
  const cleaned = raw.replace(/[₦,%\s]/g, '').replace(/[^0-9.\-+]/g, '')
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : n
}

async function fetchTab(tabName: TabName): Promise<string[][]> {
  const tab = TABS[tabName]
  const res = await fetch(csvUrl(tab.gid), { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to fetch ${tabName}: ${res.status}`)
  const text = await res.text()
  return parseCSV(text)
}

// ── Tab-specific parsers & writers ───────────────────────────────────────────

async function syncMasterData(db: D1Database): Promise<number> {
  const rows = await fetchTab('MASTER_DATA')
  // Header: State | LGA Name | Risk Zone | Indicator | 2022 | 2023 | 2024 | 2025 | Change % | Trend | Sources
  const header = rows[0]
  if (!header || !header.some(h => h.includes('State'))) return 0

  const dataRows = rows.slice(1).filter(r => r.length >= 8 && r[0].trim())

  await db.prepare('DELETE FROM master_data').run()

  const batchSize = 50
  for (let i = 0; i < dataRows.length; i += batchSize) {
    const batch = dataRows.slice(i, i + batchSize)
    const stmts = batch.map(r =>
      db.prepare(
        'INSERT INTO master_data (state, lga, risk_zone, indicator, y2022, y2023, y2024, y2025, change_pct, trend, sources) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        r[0].trim(),
        r[1].trim(),
        r[2].trim(),
        r[3].trim(),
        parseNum(r[4]),
        parseNum(r[5]),
        parseNum(r[6]),
        parseNum(r[7]),
        parseNum(r[8] ?? '0'),
        (r[9] ?? '').trim(),
        (r[10] ?? '').trim()
      )
    )
    await db.batch(stmts)
  }
  return dataRows.length
}

async function syncRegionalOverview(db: D1Database): Promise<number> {
  const rows = await fetchTab('REGIONAL_OVERVIEW')
  await db.prepare('DELETE FROM regional_overview').run()

  let section = 'kpi'
  let count = 0
  const stmts: D1PreparedStatement[] = []

  for (const r of rows) {
    const first = (r[0] ?? '').trim().toUpperCase()
    // Detect section headers
    if (first.includes('SECTION A') || first.includes('SUB-REGIONAL KPIS')) { section = 'kpi'; continue }
    if (first.includes('SECTION B') || first.includes('PERFORMANCE BY RISK')) { section = 'zone_performance'; continue }
    if (first.includes('SECTION C') || first.includes('PROGRESS SCORECARD')) { section = 'scorecard'; continue }
    // Skip header rows and empty rows
    if (!r[0]?.trim() || first.includes('METRIC') || first.includes('KPI') || first.includes('INDICATOR')) continue

    stmts.push(
      db.prepare(
        'INSERT INTO regional_overview (section, metric, borno, adamawa, yobe, bay_combined, bay_2022, bay_2023, bay_2024, bay_2025, trend, raw_row) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        section,
        r[0].trim(),
        parseNum(r[1] ?? ''),
        parseNum(r[2] ?? ''),
        parseNum(r[3] ?? ''),
        parseNum(r[4] ?? ''),
        parseNum(r[5] ?? ''),
        parseNum(r[6] ?? ''),
        parseNum(r[7] ?? ''),
        parseNum(r[8] ?? ''),
        (r[9] ?? '').trim(),
        r.join('|')
      )
    )
    count++
  }

  if (stmts.length > 0) await db.batch(stmts)
  return count
}

async function syncLgaProfiles(db: D1Database): Promise<number> {
  const rows = await fetchTab('LGA_PROFILES')
  // Header: State | LGA | Risk Zone | Youth % | Literacy (%) | Unemployment (%) | Health Fac. | Ag Output (N) | Displacement | Conflict Incidents | SMEs | Out-of-School Gap (%) | Voter Gap (%)
  await db.prepare('DELETE FROM lga_profiles').run()

  const dataRows = rows.slice(1).filter(r => {
    const state = (r[0] ?? '').trim().toUpperCase()
    return r.length >= 12 && r[0]?.trim() && !state.includes('SUBTOTAL') && !state.includes('STATE')
  })

  const batchSize = 50
  let count = 0
  for (let i = 0; i < dataRows.length; i += batchSize) {
    const batch = dataRows.slice(i, i + batchSize)
    const stmts = batch.map(r =>
      db.prepare(
        'INSERT INTO lga_profiles (state, lga, risk_zone, youth_pct, literacy_pct, unemployment_pct, health_facilities, ag_output, displacement, conflict_incidents, smes, out_of_school_gap, voter_gap) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        r[0].trim(), r[1].trim(), r[2].trim(),
        parseNum(r[3]), parseNum(r[4]), parseNum(r[5]),
        parseNum(r[6]), parseNum(r[7]), parseNum(r[8]),
        parseNum(r[9]), parseNum(r[10]), parseNum(r[11]),
        parseNum(r[12] ?? '0')
      )
    )
    await db.batch(stmts)
    count += batch.length
  }
  return count
}

async function syncTrendAnalysis(db: D1Database): Promise<number> {
  const rows = await fetchTab('TREND_ANALYSIS')
  await db.prepare('DELETE FROM trend_analysis').run()

  let section = 'progress'
  let currentState = ''
  let count = 0
  const stmts: D1PreparedStatement[] = []

  for (const r of rows) {
    const first = (r[0] ?? '').trim().toUpperCase()
    if (first.includes('SECTION A') || first.includes('PROGRESS SUMMARY')) { section = 'progress'; continue }
    if (first.includes('SECTION B') || first.includes('ZONE-TYPE')) { section = 'zone_comparison'; continue }
    if (first.includes('SECTION C') || first.includes('KEY INSIGHTS')) { section = 'insights'; continue }
    if (first.includes('BORNO')) currentState = 'Borno'
    if (first.includes('ADAMAWA')) currentState = 'Adamawa'
    if (first.includes('YOBE')) currentState = 'Yobe'
    if (!r[0]?.trim()) continue

    stmts.push(
      db.prepare(
        'INSERT INTO trend_analysis (section, state, metric, content, raw_row) VALUES (?, ?, ?, ?, ?)'
      ).bind(section, currentState, r[0].trim(), r.slice(1).join(' | '), r.join('|'))
    )
    count++
  }

  if (stmts.length > 0) {
    const batchSize = 50
    for (let i = 0; i < stmts.length; i += batchSize) {
      await db.batch(stmts.slice(i, i + batchSize))
    }
  }
  return count
}

async function syncIndicatorAnalysis(db: D1Database): Promise<number> {
  const rows = await fetchTab('INDICATOR_ANALYSIS')
  // Header: State | LGA | Risk Zone | 2022 | 2023 | 2024 | 2025 | 4-Yr Change (%) | Rank
  await db.prepare('DELETE FROM indicator_analysis').run()

  let currentIndicator = ''
  let count = 0
  const stmts: D1PreparedStatement[] = []

  for (const r of rows) {
    const first = (r[0] ?? '').trim()
    // Detect indicator section headers like "A. LITERACY RATE"
    if (/^[A-Z]\.\s/.test(first)) {
      currentIndicator = first.replace(/^[A-Z]\.\s*/, '').trim()
      continue
    }
    // Skip headers and empty rows
    if (!first || first.toUpperCase().includes('STATE') || first.toUpperCase().includes('LGA')) continue
    if (r.length < 8) continue

    stmts.push(
      db.prepare(
        'INSERT INTO indicator_analysis (indicator, state, lga, risk_zone, y2022, y2023, y2024, y2025, change_pct, rank) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        currentIndicator,
        r[0].trim(), r[1].trim(), (r[2] ?? '').trim(),
        parseNum(r[3]), parseNum(r[4]), parseNum(r[5]), parseNum(r[6]),
        parseNum(r[7] ?? '0'),
        parseInt(r[8] ?? '0') || 0
      )
    )
    count++
  }

  if (stmts.length > 0) {
    const batchSize = 50
    for (let i = 0; i < stmts.length; i += batchSize) {
      await db.batch(stmts.slice(i, i + batchSize))
    }
  }
  return count
}

async function syncMethodology(db: D1Database): Promise<number> {
  const rows = await fetchTab('METHODOLOGY')
  await db.prepare('DELETE FROM methodology').run()

  let count = 0
  const stmts: D1PreparedStatement[] = []

  for (const r of rows) {
    if (!r[0]?.trim()) continue
    stmts.push(
      db.prepare('INSERT INTO methodology (key, value) VALUES (?, ?)').bind(
        r[0].trim(),
        r.slice(1).join(' | ').trim()
      )
    )
    count++
  }

  if (stmts.length > 0) await db.batch(stmts)
  return count
}

// ── KV Cache ─────────────────────────────────────────────────────────────────

const KV_TTL = 5 * 60 // 5 minutes

async function cacheToKV(kv: KVNamespace, db: D1Database): Promise<void> {
  // Cache master_data grouped by state for fast frontend reads
  const states = ['Borno', 'Adamawa', 'Yobe']
  for (const state of states) {
    const { results } = await db
      .prepare('SELECT * FROM master_data WHERE state = ?')
      .bind(state)
      .all()
    await kv.put(`unified:state:${state.toLowerCase()}`, JSON.stringify(results), { expirationTtl: KV_TTL })
  }

  // Cache regional overview
  const { results: overview } = await db.prepare('SELECT * FROM regional_overview').all()
  await kv.put('unified:overview', JSON.stringify(overview), { expirationTtl: KV_TTL })

  // Cache LGA profiles
  const { results: profiles } = await db.prepare('SELECT * FROM lga_profiles').all()
  await kv.put('unified:profiles', JSON.stringify(profiles), { expirationTtl: KV_TTL })

  // Cache all master_data for cross-state queries
  const { results: allData } = await db.prepare('SELECT * FROM master_data').all()
  await kv.put('unified:master_all', JSON.stringify(allData), { expirationTtl: KV_TTL })
}

// ── Main Sync Function ───────────────────────────────────────────────────────

export interface SyncResult {
  success: boolean
  timestamp: number
  counts: Record<string, number>
  errors: string[]
  duration_ms: number
}

export async function syncAllTabs(): Promise<SyncResult> {
  const start = Date.now()
  const counts: Record<string, number> = {}
  const errors: string[] = []

  const { env } = await getCloudflareContext()
  const db = env.DB as D1Database
  const kv = env.CACHE as KVNamespace

  // Sync each tab — continue on failure so partial syncs are possible
  const syncTasks: [string, () => Promise<number>][] = [
    ['master_data', () => syncMasterData(db)],
    ['regional_overview', () => syncRegionalOverview(db)],
    ['lga_profiles', () => syncLgaProfiles(db)],
    ['trend_analysis', () => syncTrendAnalysis(db)],
    ['indicator_analysis', () => syncIndicatorAnalysis(db)],
    ['methodology', () => syncMethodology(db)],
  ]

  for (const [name, fn] of syncTasks) {
    try {
      counts[name] = await fn()
    } catch (err) {
      console.error(`[sync] ${name} failed:`, err)
      errors.push(`${name}: ${err instanceof Error ? err.message : String(err)}`)
      counts[name] = 0
    }
  }

  // Update KV cache
  try {
    await cacheToKV(kv, db)
  } catch (err) {
    console.error('[sync] KV cache failed:', err)
    errors.push(`kv_cache: ${err instanceof Error ? err.message : String(err)}`)
  }

  // Update sync metadata
  const now = Date.now()
  try {
    await db.prepare(
      'INSERT OR REPLACE INTO sync_meta (key, value, updated_at) VALUES (?, ?, ?)'
    ).bind('last_full_sync', JSON.stringify({ counts, errors }), now).run()
  } catch { /* non-critical */ }

  return {
    success: errors.length === 0,
    timestamp: now,
    counts,
    errors,
    duration_ms: Date.now() - start,
  }
}
