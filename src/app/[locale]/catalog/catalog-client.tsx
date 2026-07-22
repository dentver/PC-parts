'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { CATEGORIES, CATEGORY_SPECS, type Product, type CategoryKey } from '@/data/types'
import { AddToCartButton } from '@/components/add-to-cart-button'
import styles from './catalog.module.scss'

const CATEGORY_ORDER: CategoryKey[] = CATEGORIES.map(c => c.key)
const PAGE_SIZE = 10

interface CatEntry {
  productIds: number[]
  total: number
  cursor: string | null
  hasNextPage: boolean
}

const productCache = new Map<number, Product>()
const catCache = new Map<string, CatEntry>()

async function fetchCatProducts(catKey: string, first: number, after?: string | null) {
  const params = new URLSearchParams({ category: catKey, first: String(first) })
  if (after) params.set('after', after)
  const res = await fetch(`/api/category-products?${params}`)
  if (!res.ok) {
    const text = await res.text().catch(() => 'unknown')
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 100)}`)
  }
  return res.json() as Promise<{
    products: Product[]
    totalCount: number
    pageInfo: { hasNextPage: boolean; endCursor: string | null }
  }>
}

async function fetchSimple(first: number, after?: string | null, category?: string | null, sort?: string | null) {
  const params = new URLSearchParams({ first: String(first) })
  if (after) params.set('after', after)
  if (category) params.set('category', category)
  if (sort && sort !== 'default') params.set('sort', sort)
  const res = await fetch(`/api/products?${params}`)
  if (!res.ok) {
    const text = await res.text().catch(() => 'unknown')
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 100)}`)
  }
  return res.json() as Promise<{
    products: Product[]
    pageInfo: { hasNextPage: boolean; endCursor: string | null }
  }>
}

function buildVirtualCatalog(): number[] {
  const seen = new Set<number>()
  const result: number[] = []
  for (const catKey of CATEGORY_ORDER) {
    const entry = catCache.get(catKey)
    if (!entry) continue
    for (const id of entry.productIds) {
      if (seen.has(id)) continue
      seen.add(id)
      result.push(id)
    }
  }
  return result
}

function allCatsDone(categoryCounts: Record<string, number>): boolean {
  for (const catKey of CATEGORY_ORDER) {
    const total = categoryCounts[catKey] ?? 0
    if (total === 0) continue
    const entry = catCache.get(catKey)
    if (!entry || entry.hasNextPage || entry.productIds.length < total) return false
  }
  return true
}

export function CatalogClient({
  initialTotal,
  categoryCounts,
  initialCategory = null,
}: {
  initialTotal: number
  categoryCounts: Record<string, number>
  initialCategory?: string | null
}) {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const [productIds, setProductIds] = useState<number[]>(() => buildVirtualCatalog())
  const [loading, setLoading] = useState(() => productIds.length === 0)
  const [connecting, setConnecting] = useState(false)
  const [allLoaded, setAllLoaded] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory)
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default')

  const [simplePageInfo, setSimplePageInfo] = useState<{ hasNextPage: boolean; endCursor: string | null } | null>(null)

  const triggerRef = useRef<HTMLDivElement>(null)
  const retryRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const loadingRef = useRef(false)
  const mountedRef = useRef(true)
  const catCountsRef = useRef(categoryCounts)
  catCountsRef.current = categoryCounts

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false } }, [])

  const isAllMode = activeCategory === null && sortBy === 'default'

  const clearRetry = useCallback(() => {
    if (retryRef.current) {
      clearInterval(retryRef.current)
      retryRef.current = null
    }
  }, [])

  const currentCount = useMemo(() => {
    if (activeCategory === null) return initialTotal
    return categoryCounts[activeCategory] ?? 0
  }, [activeCategory, initialTotal, categoryCounts])

  const startRetry = useCallback((fn: () => Promise<void>) => {
    setConnecting(true)
    retryRef.current = setInterval(() => {
      fn()
    }, 5000)
  }, [])

  const doSimpleFetch = useCallback(async (after?: string | null, replace = false) => {
    if (loadingRef.current) return
    loadingRef.current = true
    clearRetry()
    setLoading(true)
    setConnecting(false)
    try {
      const data = await fetchSimple(PAGE_SIZE, after, activeCategory, sortBy)
      if (!mountedRef.current) return
      for (const p of data.products) productCache.set(p.id, p)
      setProductIds(prev => replace ? data.products.map(p => p.id) : [...prev, ...data.products.map(p => p.id)])
      setSimplePageInfo(data.pageInfo)
      setAllLoaded(!data.pageInfo.hasNextPage)
    } catch {
      if (!mountedRef.current) return
      startRetry(() => doSimpleFetch(after, replace))
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [clearRetry, activeCategory, sortBy, startRetry])

  const doCategoryFetch = useCallback(async () => {
    if (loadingRef.current) return
    loadingRef.current = true
    clearRetry()
    setLoading(true)
    setConnecting(false)
    try {
      const counts = catCountsRef.current
      const fetchTasks: Array<{ catKey: string; count: number }> = []

      for (const catKey of CATEGORY_ORDER) {
        const total = counts[catKey] ?? 0
        if (total === 0) continue

        const entry = catCache.get(catKey)
        const loaded = entry?.productIds.length ?? 0
        const hasMore = entry ? entry.hasNextPage : (loaded < total)

        if (!hasMore) continue

        const remainingBudget = PAGE_SIZE - fetchTasks.reduce((s, t) => s + t.count, 0)
        if (remainingBudget <= 0) break

        const unloaded = total - loaded
        const fetchCount = Math.min(remainingBudget, unloaded)
        if (fetchCount > 0) fetchTasks.push({ catKey, count: fetchCount })
      }

      if (fetchTasks.length > 0) {
        await Promise.all(fetchTasks.map(async ({ catKey, count }) => {
          if (!mountedRef.current) return
          const entry = catCache.get(catKey) ?? { productIds: [], total: counts[catKey] ?? 0, cursor: null, hasNextPage: true }
          const data = await fetchCatProducts(catKey, count, entry.cursor)
          if (!mountedRef.current) return
          for (const p of data.products) productCache.set(p.id, p)
          entry.productIds.push(...data.products.map(p => p.id))
          entry.cursor = data.pageInfo.endCursor
          entry.hasNextPage = data.pageInfo.hasNextPage
          if (!catCache.has(catKey)) catCache.set(catKey, entry)
        }))
      }

      if (!mountedRef.current) return
      const assembled = buildVirtualCatalog()
      setProductIds(assembled)
      setAllLoaded(allCatsDone(counts))
    } catch {
      if (!mountedRef.current) return
      startRetry(doCategoryFetch)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [clearRetry, startRetry])

  useEffect(() => {
    clearRetry()
    loadingRef.current = false
    if (isAllMode) {
      setSimplePageInfo(null)
      const assembled = buildVirtualCatalog()
      if (assembled.length > 0) {
        setProductIds(assembled)
        setAllLoaded(allCatsDone(catCountsRef.current))
        setLoading(false)
        setConnecting(false)
        return
      }
      setProductIds([])
      setAllLoaded(false)
      doCategoryFetch()
    } else {
      setProductIds([])
      setAllLoaded(false)
      doSimpleFetch(null, true)
    }
    return clearRetry
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAllMode, activeCategory, sortBy])

  useEffect(() => {
    const el = triggerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !allLoaded && !loadingRef.current && !connecting) {
          if (isAllMode) {
            doCategoryFetch()
          } else {
            doSimpleFetch(simplePageInfo?.endCursor)
          }
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [allLoaded, connecting, isAllMode, doCategoryFetch, doSimpleFetch, simplePageInfo])

  const displayProducts = useMemo(() => {
    return productIds.map(id => productCache.get(id)).filter(Boolean) as Product[]
  }, [productIds])

  return (
    <section className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('catalog.title')}</h1>
          <p className={styles.count}>
            {t('catalog.found', { count: currentCount })}
          </p>
        </div>

        <div className={styles.controls}>
          <div className={styles.categoryFilters}>
            <button
              className={`${styles.pill} ${activeCategory === null ? styles.pillActive : ''}`}
              onClick={() => {
                setActiveCategory(null)
                router.replace(pathname)
              }}
            >
              {t('catalog.all')}
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                className={`${styles.pill} ${activeCategory === cat.key ? styles.pillActive : ''}`}
                onClick={() => {
                  setActiveCategory(cat.key)
                  router.replace(`${pathname}?category=${cat.key}`)
                }}
              >
                {t(`categories.${cat.key}`)}
              </button>
            ))}
          </div>

          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
          >
            <option value="default">{t('catalog.sortDefault')}</option>
            <option value="price-asc">{t('catalog.sortPriceAsc')}</option>
            <option value="price-desc">{t('catalog.sortPriceDesc')}</option>
          </select>
        </div>

        <div className={styles.grid}>
          {displayProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {connecting && (
          <div className={styles.connecting}>
            <span className={styles.spinner} />
            <p>{t('catalog.connecting')}</p>
          </div>
        )}

        {!connecting && !loading && productIds.length === 0 && (
          <p className={styles.empty}>{t('catalog.empty')}</p>
        )}

        {!connecting && loading && (
          <div className={styles.connecting}>
            <span className={styles.spinner} />
          </div>
        )}

        {!connecting && !loading && allLoaded && productIds.length > 0 && (
          <p className={styles.end}>{t('catalog.allLoaded')}</p>
        )}

        <div ref={triggerRef} className={styles.trigger} />
      </div>
    </section>
  )
}

function ProductCard({ product }: { product: Product }) {
  const t = useTranslations()
  const specKeys = CATEGORY_SPECS[product.categoryKey] || []
  const formattedPrice = new Intl.NumberFormat('ru-RU').format(product.price)

  return (
    <div className={styles.card}>
      <span className={styles.badge}>
        {t(`categories.${product.categoryKey}`)}
      </span>
      <h3 className={styles.name}>{product.name}</h3>
      <div className={styles.specs}>
        {specKeys.map(key => {
          const spec = product.specs.find(s => s.key === key)
          if (!spec) return null
          return (
            <div key={key} className={styles.specRow}>
              <span className={styles.specLabel}>{t(`specs.${spec.key}`)}</span>
              <span className={styles.specValue}>{spec.value}</span>
            </div>
          )
        })}
      </div>
      <div className={styles.footer}>
        <span className={styles.price}>{formattedPrice} ₽</span>
        <AddToCartButton
          id={product.id}
          name={product.name}
          categoryKey={product.categoryKey}
          price={product.price}
          className={styles.btnAdd}
        />
      </div>
    </div>
  )
}
