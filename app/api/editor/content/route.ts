import { NextResponse } from 'next/server'
import { readSiteContent } from '@/lib/cloudflare'
import defaultContent from '@/lib/site-content.json'

export async function GET() {
  try {
    // Try D1 first, fall back to static default
    const content = await readSiteContent()
    return NextResponse.json(content ?? defaultContent)
  } catch {
    return NextResponse.json(defaultContent)
  }
}
