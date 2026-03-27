/**
 * Cloudflare D1 + KV helpers — replaces firestore-tracker.ts
 *
 * In Cloudflare Pages, bindings (DB, CACHE) are available via
 * `process.env` at runtime in Next.js server components / route handlers
 * when using @opennextjs/cloudflare.
 *
 * Access pattern:
 *   import { getCloudflareContext } from '@opennextjs/cloudflare'
 *   const { env } = await getCloudflareContext()
 *   env.DB   → D1Database
 *   env.CACHE → KVNamespace
 */

import { getCloudflareContext } from '@opennextjs/cloudflare'

// ── Types ───────────────────────────────────────────────────────────────────

export interface StateRow {
  lga: string
  zone: string
  indicator: string
  y2022: number
  y2023: number
  y2024: number
  y2025: number
  trend: string
}

export interface StateData {
  lgas: string[]
  indicators: string[]
  rows: StateRow[]
  summary: { totalDisplacement2025: number; totalConflict2025: number; totalLGAs: number }
  lastSynced?: number
}

// ── KV Cache (fast reads at the edge) ───────────────────────────────────────

const CACHE_TTL = 5 * 60 // 5 minutes in seconds

export async function readCachedState(state: string): Promise<StateData | null> {
  try {
    const { env } = await getCloudflareContext()
    const kv = env.CACHE as KVNamespace
    const raw = await kv.get(`state:${state}`, 'json')
    return raw as StateData | null
  } catch {
    return null
  }
}

export async function writeCachedState(state: string, data: StateData): Promise<void> {
  try {
    const { env } = await getCloudflareContext()
    const kv = env.CACHE as KVNamespace
    const payload = { ...data, lastSynced: Date.now() }
    await kv.put(`state:${state}`, JSON.stringify(payload), { expirationTtl: CACHE_TTL })
  } catch {
    // non-blocking — don't break the response if cache write fails
  }
}

// ── D1 Database (persistent, scalable storage) ──────────────────────────────

export async function getDB(): Promise<D1Database> {
  const { env } = await getCloudflareContext()
  return env.DB as D1Database
}

/** Write parsed sheet rows to D1 (replaces all data for the given state) */
export async function writeStateDataToD1(state: string, rows: StateRow[]): Promise<void> {
  const db = await getDB()
  const now = Date.now()

  // Use a batch: delete old rows for this state, then insert new ones
  const statements: D1PreparedStatement[] = [
    db.prepare('DELETE FROM state_data WHERE state = ?').bind(state),
  ]

  for (const row of rows) {
    statements.push(
      db
        .prepare(
          'INSERT INTO state_data (state, lga, zone, indicator, y2022, y2023, y2024, y2025, trend, synced_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        )
        .bind(state, row.lga, row.zone, row.indicator, row.y2022, row.y2023, row.y2024, row.y2025, row.trend, now)
    )
  }

  // Update sync metadata
  statements.push(
    db
      .prepare('INSERT OR REPLACE INTO sync_meta (state, last_synced) VALUES (?, ?)')
      .bind(state, now)
  )

  await db.batch(statements)
}

/** Read state data from D1 */
export async function readStateDataFromD1(state: string): Promise<StateData | null> {
  const db = await getDB()

  const meta = await db.prepare('SELECT last_synced FROM sync_meta WHERE state = ?').bind(state).first<{ last_synced: number }>()
  if (!meta) return null

  const { results } = await db
    .prepare('SELECT lga, zone, indicator, y2022, y2023, y2024, y2025, trend FROM state_data WHERE state = ?')
    .bind(state)
    .all<StateRow>()

  if (!results || results.length === 0) return null

  const lgaSet = new Set<string>()
  const indicatorSet = new Set<string>()
  for (const r of results) {
    lgaSet.add(r.lga)
    indicatorSet.add(r.indicator)
  }

  const displacementRows = results.filter(r => r.indicator === 'Displacement')
  const conflictRows = results.filter(r => r.indicator === 'Conflict Incidents')

  return {
    lgas: Array.from(lgaSet).sort(),
    indicators: Array.from(indicatorSet),
    rows: results,
    summary: {
      totalDisplacement2025: displacementRows.reduce((sum, r) => sum + r.y2025, 0),
      totalConflict2025: conflictRows.reduce((sum, r) => sum + r.y2025, 0),
      totalLGAs: lgaSet.size,
    },
    lastSynced: meta.last_synced,
  }
}

/** Check if cached data is still fresh */
export async function isCacheFresh(state: string): Promise<boolean> {
  try {
    const cached = await readCachedState(state)
    if (!cached || !cached.lastSynced) return false
    return Date.now() - cached.lastSynced < CACHE_TTL * 1000
  } catch {
    return false
  }
}

// ── Site Content (D1) ───────────────────────────────────────────────────────

export async function readSiteContent(): Promise<Record<string, unknown> | null> {
  try {
    const db = await getDB()
    const row = await db
      .prepare('SELECT payload FROM site_content WHERE id = ?')
      .bind('main')
      .first<{ payload: string }>()
    return row ? JSON.parse(row.payload) : null
  } catch {
    return null
  }
}

export async function writeSiteContent(content: Record<string, unknown>): Promise<void> {
  const db = await getDB()
  await db
    .prepare('INSERT OR REPLACE INTO site_content (id, payload, updated_at) VALUES (?, ?, ?)')
    .bind('main', JSON.stringify(content), Date.now())
    .run()
}
