import { NextResponse } from 'next/server'
import { getBuilds } from '@/data/api'

export async function GET() {
  try {
    const builds = await getBuilds()
    return NextResponse.json(builds)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch builds'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
