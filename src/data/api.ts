import raw from './products.json'
import type { Product, Spec, Build, BuildComponent } from './types'

const RUB_USD_RATE = 92

interface JsonProduct {
  id: number
  slug: string
  name: string
  categoryKey: string
  price: number
  specs: Spec[]
}

interface JsonBuildComponent {
  role: string
  productId: number
}

interface JsonBuild {
  id: number
  slug: string
  name: string
  description?: string
  components: JsonBuildComponent[]
}

const data = raw as { products: JsonProduct[]; builds: JsonBuild[] }

// ─── Price conversion (JSON prices are stored in RUB) ───────────

export function toPrice(rub: number, locale?: string): number {
  return locale === 'ru' ? rub : Math.round(rub / RUB_USD_RATE)
}

function toProduct(p: JsonProduct, locale?: string): Product {
  return {
    id: p.id,
    name: p.name,
    categoryKey: p.categoryKey,
    price: toPrice(p.price, locale),
    specs: p.specs,
  }
}

function parseCursor(after?: string | null): number {
  const n = after ? parseInt(after, 10) : 0
  return Number.isFinite(n) && n > 0 ? n : 0
}

function paginate<T>(
  items: T[],
  first: number,
  after?: string | null,
): {
  products: T[]
  totalCount: number
  pageInfo: { hasNextPage: boolean; endCursor: string | null }
} {
  const start = parseCursor(after)
  const slice = items.slice(start, start + first)
  const end = start + slice.length
  const hasNextPage = end < items.length
  return {
    products: slice,
    totalCount: items.length,
    pageInfo: { hasNextPage, endCursor: hasNextPage ? String(end) : null },
  }
}

// ─── Per-category products (for virtual catalog) ─────────────────

export async function getCategoryProducts(
  categorySlug: string,
  first: number,
  after?: string | null,
  locale?: string,
): Promise<{
  products: Product[]
  totalCount: number
  pageInfo: { hasNextPage: boolean; endCursor: string | null }
}> {
  const items = data.products
    .filter(p => p.categoryKey === categorySlug)
    .map(p => toProduct(p, locale))
  return paginate(items, first, after)
}

// ─── Category counts ─────────────────────────────────────────────

export async function getCategoryCounts(_locale?: string): Promise<Record<string, number>> {
  const counts: Record<string, number> = {}
  for (const p of data.products) {
    counts[p.categoryKey] = (counts[p.categoryKey] || 0) + 1
  }
  return counts
}

export async function getTotalProductCount(_locale?: string): Promise<number> {
  return data.products.length
}

// ─── Paginated / filtered / sorted products ──────────────────────

export async function getProducts(
  first: number,
  after?: string | null,
  category?: string | null,
  sort?: string | null,
  search?: string | null,
  locale?: string,
): Promise<{
  products: Product[]
  totalCount: number
  pageInfo: { hasNextPage: boolean; endCursor: string | null }
}> {
  let items = [...data.products]

  if (category) {
    items = items.filter(p => p.categoryKey === category)
  }

  const term = search?.trim().toLowerCase()
  if (term) {
    items = items.filter(p => p.name.toLowerCase().includes(term))
  }

  if (sort === 'price-asc') {
    items.sort((a, b) => a.price - b.price)
  } else if (sort === 'price-desc') {
    items.sort((a, b) => b.price - a.price)
  }

  return paginate(items.map(p => toProduct(p, locale)), first, after)
}

// ─── Popular products (one per category) ─────────────────────────

export async function getPopularProducts(locale?: string): Promise<Product[]> {
  const seen = new Set<string>()
  const result: Product[] = []
  for (const p of data.products) {
    if (seen.has(p.categoryKey)) continue
    seen.add(p.categoryKey)
    result.push(toProduct(p, locale))
    if (result.length >= 6) break
  }
  return result
}

// ─── Exchange rate (RUB → USD for cart conversions) ──────────────

export async function getExchangeRate(): Promise<number> {
  return RUB_USD_RATE
}

// ─── Builds ──────────────────────────────────────────────────────

export async function getBuilds(locale?: string): Promise<Build[]> {
  const byId = new Map<number, Product>()
  for (const p of data.products) {
    byId.set(p.id, toProduct(p, locale))
  }

  const result: Build[] = []
  for (const b of data.builds) {
    const components: BuildComponent[] = []
    for (const comp of b.components) {
      const product = byId.get(comp.productId)
      if (product) components.push({ role: comp.role, product })
    }
    const totalPrice = components.reduce((sum, c) => sum + c.product.price, 0)
    result.push({
      id: b.id,
      name: b.name,
      slug: b.slug,
      totalPrice,
      components,
    })
  }
  return result
}
