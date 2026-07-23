import { NextRequest, NextResponse } from 'next/server'
import { getBuilds } from '@/data/api'

export async function GET(req: NextRequest) {
  const locale = new URL(req.url).searchParams.get('locale') || undefined
  try {
    const builds = await getBuilds(locale)
    return NextResponse.json(builds)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch builds'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
