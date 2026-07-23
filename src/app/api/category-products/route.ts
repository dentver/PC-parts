import { NextRequest, NextResponse } from 'next/server'
import { getCategoryProducts } from '@/data/api'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  if (!category) {
    return NextResponse.json({ error: 'category param is required' }, { status: 400 })
  }
  const first = Math.min(Math.max(parseInt(searchParams.get('first') || '10') || 10, 1), 50)
  const after = searchParams.get('after') || null
  const locale = searchParams.get('locale') || undefined

  try {
    const result = await getCategoryProducts(category, first, after, locale)
    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch category products'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
