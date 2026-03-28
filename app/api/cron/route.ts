import { NextResponse, NextRequest } from 'next/server'
import { syncAllTabs } from '@/lib/sheet-sync'

/**
 * Cron-triggered sync endpoint.
 * Called by Cloudflare Cron Triggers every 6 hours.
 * Protected by a secret header to prevent public access.
 */
export async function GET(req: NextRequest) {
  // Verify this is a legitimate cron call via secret or Cloudflare header
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get('x-cron-secret') ?? req.headers.get('authorization')

  // If CRON_SECRET is set, require it. Otherwise allow (for initial setup).
  if (cronSecret && authHeader !== cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[cron-sync] Starting scheduled sync...')
    const result = await syncAllTabs()
    console.log(`[cron-sync] Complete — ${JSON.stringify(result.counts)} in ${result.duration_ms}ms`)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[cron-sync] Failed:', err)
    return NextResponse.json({ error: 'Sync failed', details: String(err) }, { status: 500 })
  }
}
