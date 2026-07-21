const API = 'https://store-yjvlftm8.eu.saleor.cloud/graphql/'
const TOKEN = '537ed89d8c2d47aca19f6f12d192112a.y3IJFzW1TTdJcSKQAsPCxmGdFe8OkKTBumDAoIKumSq16I4i'
const CHANNEL_ID = 'Q2hhbm5lbDox'

let channelSlug: string | null = null

async function getChannelSlug(): Promise<string> {
  if (channelSlug) return channelSlug
  try {
    const data = await gql<{ channels: Array<{ id: string; slug: string }> }>(
      `{ channels { id slug } }`
    )
    const match = data.channels?.find(c => c.id === CHANNEL_ID)
    if (match) {
      channelSlug = match.slug
      return channelSlug
    }
    if (data.channels?.length) {
      channelSlug = data.channels[0].slug
      return channelSlug
    }
  } catch (e) {
    // ignore
  }
  return 'default-channel'
}

async function gql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ query, variables }),
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`)
      }
      const json = await res.json()
      if (json.errors) {
        const msgs = json.errors.map((e: { message: string }) => e.message).join('; ')
        throw new Error(`GraphQL: ${msgs}`)
      }
      return json.data as T
    } catch (err) {
      if (attempt === 2) throw err
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)))
    }
  }
  throw new Error('unreachable')
}

interface SaleorProduct {
  id: string
  name: string
  slug: string
  category: { id: string; slug: string } | null
  attributes: Array<{
    attribute: { slug: string }
    values: Array<{ name: string }>
  }>
  variants: Array<{
    id: string
    pricing: {
      price: { gross: { amount: number } } | null
    } | null
  }>
}

function parseIdFromSlug(slug: string): number {
  const m = slug.match(/^pc-(\d+)-/)
  return m ? parseInt(m[1]) : 0
}

function mapProduct(node: SaleorProduct): import('./types').Product {
  return {
    id: parseIdFromSlug(node.slug),
    name: node.name,
    categoryKey: node.category?.slug ?? '',
    price: Math.round(node.variants?.[0]?.pricing?.price?.gross?.amount ?? 0),
    specs: node.attributes
      .filter(a => a.values?.length)
      .map(a => ({ key: a.attribute.slug, value: a.values[0].name })),
    description: '',
  }
}

const PRODUCT_FRAGMENT = `
  id name slug
  category { id slug }
  attributes {
    attribute { slug }
    values { name }
  }
  variants {
    id
    pricing { price { gross { amount } } }
  }
`

// ─── Category map ──────────────────────────────────────────────

let catMap: Record<string, string> | null = null

async function getCategoryMap(): Promise<Record<string, string>> {
  if (catMap) return catMap
  const data = await gql<{ categories: { edges: Array<{ node: { id: string; slug: string } }> } }>(
    `query { categories(first: 20) { edges { node { id slug } } } }`
  )
  const map: Record<string, string> = {}
  for (const { node } of data.categories.edges) {
    map[node.slug] = node.id
  }
  catMap = map
  return map
}

// ─── Category counts ───────────────────────────────────────────

export async function getCategoryCounts(): Promise<Record<string, number>> {
  const data = await gql<{
    categories: {
      edges: Array<{
        node: {
          slug: string
          products: { totalCount: number } | null
        }
      }>
    }
  }>(
    `query($channel: String!) {
      categories(first: 20) {
        edges {
          node {
            slug
            products(channel: $channel) { totalCount }
          }
        }
      }
    }`,
    { channel: await getChannelSlug() }
  )

  const counts: Record<string, number> = {}
  for (const { node } of data.categories.edges) {
    counts[node.slug] = node.products?.totalCount ?? 0
  }
  return counts
}

// ─── Paginated products ────────────────────────────────────────

export interface ProductsPage {
  products: import('./types').Product[]
  pageInfo: { hasNextPage: boolean; endCursor: string | null }
}

export async function getProducts(
  first: number,
  after?: string | null,
  category?: string | null,
  sort?: string | null,
): Promise<ProductsPage> {
  const channel = await getChannelSlug()
  const vars: Record<string, unknown> = { channel, first, after: after || null }

  if (category) {
    const map = await getCategoryMap()
    const catId = map[category]
    if (catId) vars.filter = { categories: [catId] }
  }

  if (sort === 'price-asc') vars.sortBy = { field: 'PRICE', direction: 'ASC' }
  else if (sort === 'price-desc') vars.sortBy = { field: 'PRICE', direction: 'DESC' }

  const data = await gql<{
    products: {
      edges: Array<{ cursor: string; node: SaleorProduct }>
      pageInfo: { hasNextPage: boolean; endCursor: string | null }
    }
  }>(
    `query Products($channel: String!, $first: Int!, $after: String, $filter: ProductFilterInput, $sortBy: ProductOrder) {
      products(first: $first, after: $after, filter: $filter, sortBy: $sortBy, channel: $channel) {
        edges { cursor node { ${PRODUCT_FRAGMENT} } }
        pageInfo { hasNextPage endCursor }
      }
    }`,
    vars,
  )

  return {
    products: data.products.edges.map(e => mapProduct(e.node)),
    pageInfo: data.products.pageInfo,
  }
}

// ─── Popular products ──────────────────────────────────────────

export async function getPopularProducts(): Promise<import('./types').Product[]> {
  try {
    const ordersData = await gql<{
      orders: {
        edges: Array<{
          node: {
            lines: Array<{
              variant: { product: { id: string } } | null
              quantity: number
            }>
          }
        }>
      }
    }>(
      `query($channel: String!) {
        orders(first: 50, filter: { status: [FULFILLED, PARTIALLY_FULFILLED] }, channel: $channel) {
          edges { node { lines { variant { product { id } } quantity } } }
        }
      }`,
      { channel: await getChannelSlug() }
    )

    const orderLines = ordersData.orders.edges.flatMap(e => e.node.lines).filter(l => l.variant)
    if (orderLines.length) {
      const counts: Record<string, number> = {}
      for (const line of orderLines) {
        const pid = line.variant!.product.id
        counts[pid] = (counts[pid] || 0) + line.quantity
      }
      const topIds = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([id]) => id)

      const slug = await getChannelSlug()
      const proms = topIds.map(id =>
        gql<{ product: SaleorProduct | null }>(
          `query($id: ID!, $channel: String!) {
            product(id: $id, channel: $channel) { ${PRODUCT_FRAGMENT} }
          }`,
          { id, channel: slug }
        ).then(d => d.product)
      )
      const results = (await Promise.all(proms)).filter(Boolean) as SaleorProduct[]
      if (results.length) return results.map(mapProduct)
    }
  } catch {
    // No orders or query failed — fallback to per-category selection
  }

  try {
    const catMap = await getCategoryMap()
    const catSlugs = Object.keys(catMap)
    const channelSlug = await getChannelSlug()

    const perCatProms = catSlugs.slice(0, 6).map(catSlug =>
      gql<{ products: { edges: Array<{ node: SaleorProduct }> } }>(
        `query($channel: String!, $catId: ID!) {
          products(first: 1, filter: { categories: [$catId] }, channel: $channel) {
            edges { node { ${PRODUCT_FRAGMENT} } }
          }
        }`,
        { channel: channelSlug, catId: catMap[catSlug] }
      ).then(d => d.products.edges[0]?.node)
    )

    const fromEachCat = (await Promise.all(perCatProms)).filter(Boolean) as SaleorProduct[]
    const result = fromEachCat.slice(0, 6)

    if (result.length >= 6) return result.map(mapProduct)

    const existingIds = new Set(result.map(p => p.id))
    const needed = 6 - result.length
    const fillData = await gql<{ products: { edges: Array<{ node: SaleorProduct }> } }>(
      `query($channel: String!, $first: Int!) {
        products(first: $first, channel: $channel) {
          edges { node { ${PRODUCT_FRAGMENT} } }
        }
      }`,
      { channel: channelSlug, first: needed + 5 }
    )
    const fill = fillData.products.edges
      .map(e => e.node)
      .filter(p => !existingIds.has(p.id))
      .slice(0, needed)

    return [...result, ...fill].map(mapProduct)
  } catch {
    throw new Error('Saleor is unavailable')
  }
}
