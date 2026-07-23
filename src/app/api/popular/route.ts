import { NextRequest, NextResponse } from 'next/server'
import { getPopularProducts } from '@/data/api'

export async function GET(req: NextRequest) {
  const locale = new URL(req.url).searchParams.get('locale') || undefined
  try {
    const products = await getPopularProducts(locale)
    return NextResponse.json({ products })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch popular products' },
      { status: 500 }
    )
  }
}
