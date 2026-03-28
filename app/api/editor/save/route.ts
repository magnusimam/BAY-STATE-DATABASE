import { NextResponse, NextRequest } from 'next/server'
import { writeSiteContent } from '@/lib/cloudflare'
import { ADMIN_EMAILS } from '@/lib/admin-emails'

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
  if (ADMIN_EMAILS.length === 0) {
    return NextResponse.json(
      { error: 'Editor not configured. Set NEXT_PUBLIC_ADMIN_EMAILS in .env.local' },
      { status: 503 }
    )
  }

  const authHeader = req.headers.get('authorization') ?? ''
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (!idToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const email = await verifyFirebaseToken(idToken)

  if (!email || !ADMIN_EMAILS.includes(email.toLowerCase())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    await writeSiteContent(body)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 })
  }
}
