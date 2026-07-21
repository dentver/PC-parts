'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { CATEGORIES, CATEGORY_SPECS, type Product } from '@/data/types'
import { AddToCartButton } from '@/components/add-to-cart-button'
import styles from './catalog.module.scss'

interface ProductsPage {
  products: Product[]
  pageInfo: { hasNextPage: boolean; endCursor: string | null }
}

async function fetchProducts(
  first: number,
  after?: string | null,
  category?: string | null,
  sort?: string | null,
): Promise<ProductsPage> {
  const params = new URLSearchParams({ first: String(first) })
  if (after) params.set('after', after)
  if (category) params.set('category', category)
  if (sort && sort !== 'default') params.set('sort', sort)

  const res = await fetch(`/api/products?${params}`)

  if (!res.ok) {
    const text = await res.text().catch(() => 'unknown')
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 100)}`)
  }

  return res.json()
}

export function CatalogClient() {
  const t = useTranslations()
  const [products, setProducts] = useState<Product[]>([])
  const [pageInfo, setPageInfo] = useState<ProductsPage['pageInfo'] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default')

  const triggerRef = useRef<HTMLDivElement>(null)
  const retryRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearRetry = useCallback(() => {
    if (retryRef.current) {
      clearInterval(retryRef.current)
      retryRef.current = null
    }
  }, [])

  const loadPage = useCallback(
    async (after?: string | null, replace = false) => {
      clearRetry()
      setIsLoading(true)
      setConnecting(false)
      try {
        const data = await fetchProducts(10, after, activeCategory, sortBy)
        setProducts(prev => (replace ? data.products : [...prev, ...data.products]))
        setPageInfo(data.pageInfo)
        setConnecting(false)
      } catch {
        setConnecting(true)
        retryRef.current = setInterval(() => {
          loadPage(after, replace)
        }, 5000)
      } finally {
        setIsLoading(false)
      }
    },
    [activeCategory, sortBy, clearRetry],
  )

  useEffect(() => {
    clearRetry()
    setProducts([])
    setPageInfo(null)
    loadPage(null, true)
    return clearRetry
  }, [loadPage, clearRetry])

  useEffect(() => {
    const el = triggerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && pageInfo?.hasNextPage && !isLoading && !connecting) {
          loadPage(pageInfo.endCursor)
        }
      },
      { rootMargin: '200px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [pageInfo, isLoading, connecting, loadPage])

  return (
    <section className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('catalog.title')}</h1>
          <p className={styles.count}>
            {t('catalog.found', { count: products.length })}
          </p>
        </div>

        <div className={styles.controls}>
          <div className={styles.categoryFilters}>
            <button
              className={`${styles.pill} ${activeCategory === null ? styles.pillActive : ''}`}
              onClick={() => setActiveCategory(null)}
            >
              {t('catalog.all')}
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                className={`${styles.pill} ${activeCategory === cat.key ? styles.pillActive : ''}`}
                onClick={() => setActiveCategory(cat.key)}
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
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {connecting && (
          <div className={styles.connecting}>
            <span className={styles.spinner} />
            <p>{t('catalog.connecting')}</p>
          </div>
        )}

        {!connecting && !isLoading && products.length === 0 && (
          <p className={styles.empty}>{t('catalog.empty')}</p>
        )}

        {!connecting && isLoading && (
          <div className={styles.connecting}>
            <span className={styles.spinner} />
          </div>
        )}

        {!connecting && !isLoading && !pageInfo?.hasNextPage && products.length > 0 && (
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
