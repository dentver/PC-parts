import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/data/api'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const first = Math.min(Math.max(parseInt(searchParams.get('first') || '10') || 10, 1), 50)
  const after = searchParams.get('after') || null
  const category = searchParams.get('category') || null
  const sort = searchParams.get('sort') || null

  try {
    const result = await getProducts(first, after, category, sort)
    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch products'
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    )
  }
}
