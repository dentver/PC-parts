import { NextResponse } from 'next/server'
import { getPopularProducts } from '@/data/api'

export async function GET() {
  try {
    const products = await getPopularProducts()
    return NextResponse.json({ products })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch popular products' },
      { status: 500 }
    )
  }
}
