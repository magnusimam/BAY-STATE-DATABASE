import { NextResponse, NextRequest } from 'next/server'
import { fetchAndParseSheet } from '@/app/api/sheets/borno/route'
import { writeTrackerData } from '@/lib/firestore-tracker'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

async function verifyFirebaseToken(idToken: string): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  if (!apiKey) return null
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    return (data.users?.[0]?.email as string | undefined) ?? null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  // Auth check
  const authHeader = req.headers.get('authorization') ?? ''
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const email = await verifyFirebaseToken(idToken)
  if (!email || !ADMIN_EMAILS.includes(email.toLowerCase())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Force-fetch sheet and write to Firestore
  try {
    const data = await fetchAndParseSheet()
    const lastSynced = Date.now()
    await writeTrackerData('borno', data)
    return NextResponse.json({
      success: true,
      lastSynced,
      summary: data.summary,
    })
  } catch (err) {
    console.error('[admin-sync]', err)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
