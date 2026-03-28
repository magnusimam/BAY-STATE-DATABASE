import { NextResponse, NextRequest } from 'next/server'
import { syncAllTabs } from '@/lib/sheet-sync'

/**
 * Cron-triggered sync endpoint.
 * Called by Cloudflare Cron Triggers every 6 hours.
 * Protected: only allows Cloudflare Cron triggers or requests with valid CRON_SECRET.
 */
export async function GET(req: NextRequest) {
  // Cloudflare Workers cron triggers include a cf-cron header
  const isCronTrigger = req.headers.get('cf-cron') !== null

  // Also accept manual triggers with a valid secret
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get('x-cron-secret') ?? req.headers.get('authorization')
  const hasValidSecret = cronSecret && (authHeader === cronSecret || authHeader === `Bearer ${cronSecret}`)

  if (!isCronTrigger && !hasValidSecret) {
    return NextResponse.json({ error: 'Unauthorized — cron trigger or valid secret required' }, { status: 401 })
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
