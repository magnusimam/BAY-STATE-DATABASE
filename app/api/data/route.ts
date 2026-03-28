import { NextResponse, NextRequest } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

/**
 * Unified data API — single endpoint for all frontend data needs.
 *
 * Query params:
 *   ?view=overview          — Regional KPIs from regional_overview
 *   ?view=trends            — Trend analysis data
 *   ?view=indicators        — All indicator_analysis data (optionally &indicator=Literacy+Rate)
 *   ?view=lga-profiles      — Wide-format LGA snapshot
 *   ?view=methodology       — Data definitions and sources
 *   ?view=master            — Full master_data (optionally filtered by &state= &indicator=)
 *   ?state=borno            — All master_data rows for a state
 *   (no params)             — Returns sync status + summary counts
 */

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const view = url.searchParams.get('view')
  const state = url.searchParams.get('state')
  const indicator = url.searchParams.get('indicator')

  try {
    const { env } = await getCloudflareContext()
    const db = env.DB as D1Database
    const kv = env.CACHE as KVNamespace

    // ── State query (shorthand) ──────────────────────────────────────────
    if (state && !view) {
      const cacheKey = `unified:state:${state.toLowerCase()}`
      const cached = await kv.get(cacheKey, 'json')
      if (cached) return NextResponse.json({ source: 'cache', data: cached })

      const { results } = await db
        .prepare('SELECT * FROM master_data WHERE LOWER(state) = ?')
        .bind(state.toLowerCase())
        .all()
      return NextResponse.json({ source: 'db', data: results })
    }

    // ── View-based queries ───────────────────────────────────────────────
    switch (view) {
      case 'overview': {
        const cached = await kv.get('unified:overview', 'json')
        if (cached) return NextResponse.json({ source: 'cache', data: cached })

        const { results } = await db.prepare('SELECT * FROM regional_overview').all()
        return NextResponse.json({ source: 'db', data: results })
      }

      case 'trends': {
        const { results } = await db.prepare('SELECT * FROM trend_analysis').all()
        return NextResponse.json({ data: results })
      }

      case 'indicators': {
        let query = 'SELECT * FROM indicator_analysis'
        const binds: string[] = []
        if (indicator) {
          query += ' WHERE LOWER(indicator) LIKE ?'
          binds.push(`%${indicator.toLowerCase()}%`)
        }
        query += ' ORDER BY indicator, rank'
        const stmt = binds.length > 0
          ? db.prepare(query).bind(...binds)
          : db.prepare(query)
        const { results } = await stmt.all()
        return NextResponse.json({ data: results })
      }

      case 'lga-profiles': {
        const cached = await kv.get('unified:profiles', 'json')
        if (cached) return NextResponse.json({ source: 'cache', data: cached })

        let query = 'SELECT * FROM lga_profiles'
        const binds: string[] = []
        if (state) {
          query += ' WHERE LOWER(state) = ?'
          binds.push(state.toLowerCase())
        }
        const stmt = binds.length > 0
          ? db.prepare(query).bind(...binds)
          : db.prepare(query)
        const { results } = await stmt.all()
        return NextResponse.json({ source: 'db', data: results })
      }

      case 'methodology': {
        const { results } = await db.prepare('SELECT * FROM methodology').all()
        return NextResponse.json({ data: results })
      }

      case 'master': {
        const cached = await kv.get('unified:master_all', 'json')
        if (cached && !state && !indicator) {
          return NextResponse.json({ source: 'cache', data: cached })
        }

        let query = 'SELECT * FROM master_data WHERE 1=1'
        const binds: string[] = []
        if (state) {
          query += ' AND LOWER(state) = ?'
          binds.push(state.toLowerCase())
        }
        if (indicator) {
          query += ' AND LOWER(indicator) LIKE ?'
          binds.push(`%${indicator.toLowerCase()}%`)
        }
        query += ' ORDER BY state, lga, indicator'
        const stmt = binds.length > 0
          ? db.prepare(query).bind(...binds)
          : db.prepare(query)
        const { results } = await stmt.all()
        return NextResponse.json({ source: 'db', data: results })
      }

      default: {
        // No view specified — return sync status and summary
        const syncMeta = await db.prepare("SELECT * FROM sync_meta WHERE key = 'last_full_sync'").first()
        const { results: counts } = await db.prepare(`
          SELECT 'master_data' as t, COUNT(*) as c FROM master_data
          UNION ALL SELECT 'regional_overview', COUNT(*) FROM regional_overview
          UNION ALL SELECT 'lga_profiles', COUNT(*) FROM lga_profiles
          UNION ALL SELECT 'trend_analysis', COUNT(*) FROM trend_analysis
          UNION ALL SELECT 'indicator_analysis', COUNT(*) FROM indicator_analysis
          UNION ALL SELECT 'methodology', COUNT(*) FROM methodology
        `).all()

        return NextResponse.json({
          status: 'ok',
          last_sync: syncMeta ? { updated_at: syncMeta.updated_at, details: JSON.parse(syncMeta.value as string) } : null,
          tables: counts,
        })
      }
    }
  } catch (err) {
    console.error('[api/data]', err)
    return NextResponse.json({ error: 'Internal error', details: String(err) }, { status: 500 })
  }
}
