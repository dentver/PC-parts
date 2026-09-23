import { NextResponse } from 'next/server'
import { getExchangeRate } from '@/data/api'

export async function GET() {
  try {
    const rate = await getExchangeRate()
    return NextResponse.json({ rate })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch exchange rate'
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    )
  }
}
