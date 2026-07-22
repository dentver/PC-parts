'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { CATEGORIES, CATEGORY_SPECS, type Product } from '@/data/types'
import styles from './compare.module.scss'

// How many products to load at once in the overlay
const PAGE_SIZE = 50

const COMPARE_DIRECTION: Record<string, 'higher' | 'lower'> = {
  cores: 'higher',
  threads: 'higher',
  baseFreq: 'higher',
  maxFreq: 'higher',
  l3Cache: 'higher',
  memory: 'higher',
  boostClock: 'higher',
  cudaCores: 'higher',
  ramSlots: 'higher',
  capacity: 'higher',
  readSpeed: 'higher',
  writeSpeed: 'higher',
  wattage: 'higher',
  fanSupport: 'higher',
  driveBays: 'higher',
  tdp: 'lower',
  latency: 'lower',
  voltage: 'lower',
  price: 'lower',
}

// ─── Comparison helpers ─────────────────────────────────────────

function parseNumericValue(value: string): number | null {
  const match = value.match(/^([\d.,]+)/)
  if (!match) return null
  return parseFloat(match[1].replace(',', '.'))
}

type CompareResult = 'better' | 'worse' | 'neutral'

function compareValues(specKey: string, val1: string, val2: string): [CompareResult, CompareResult] {
  const direction = COMPARE_DIRECTION[specKey]
  if (!direction) return ['neutral', 'neutral']

  const num1 = parseNumericValue(val1)
  const num2 = parseNumericValue(val2)
  if (num1 === null || num2 === null) return ['neutral', 'neutral']
  if (num1 === num2) return ['neutral', 'neutral']

  if (direction === 'higher') {
    return num1 > num2 ? ['better', 'worse'] : ['worse', 'better']
  } else {
    return num1 < num2 ? ['better', 'worse'] : ['worse', 'better']
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(price)
}

function resultClass(result: CompareResult): string {
  switch (result) {
    case 'better':
      return styles.comparisonValueGreen
    case 'worse':
      return styles.comparisonValueRed
    default:
      return styles.comparisonValueNeutral
  }
}

// ─── Main client component ──────────────────────────────────────

export function CompareClient() {
  const t = useTranslations()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [product1, setProduct1] = useState<Product | null>(null)
  const [product2, setProduct2] = useState<Product | null>(null)
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [overlayTarget, setOverlayTarget] = useState<1 | 2>(1)
  const [overlayProducts, setOverlayProducts] = useState<Product[]>([])
  const [overlayLoading, setOverlayLoading] = useState(false)

  useEffect(() => {
    setProduct1(null)
    setProduct2(null)
    setOverlayOpen(false)
  }, [activeCategory])

  const openOverlay = useCallback(
    async (target: 1 | 2) => {
      if (!activeCategory) return
      setOverlayTarget(target)
      setOverlayOpen(true)
      setOverlayLoading(true)
      try {
        const params = new URLSearchParams({ category: activeCategory, first: String(PAGE_SIZE) })
        const res = await fetch(`/api/category-products?${params}`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setOverlayProducts(data.products ?? [])
      } catch {
        setOverlayProducts([])
      } finally {
        setOverlayLoading(false)
      }
    },
    [activeCategory],
  )

  const selectProduct = useCallback(
    (product: Product) => {
      if (overlayTarget === 1) setProduct1(product)
      else setProduct2(product)
      setOverlayOpen(false)
    },
    [overlayTarget],
  )

  const specKeys = activeCategory ? CATEGORY_SPECS[activeCategory] || [] : []
  const hasBoth = product1 !== null && product2 !== null

  return (
    <section className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>{t('compare.title')}</h1>

        <div className={styles.categoryFilters}>
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

        {!activeCategory && (
          <p className={styles.selectCategory}>{t('compare.selectCategory')}</p>
        )}

        {activeCategory && (
          <>
            <div className={styles.selectors}>
              {product1 ? (
                <SelectedCard product={product1} onClick={() => openOverlay(1)} />
              ) : (
                <button className={styles.placeholder} onClick={() => openOverlay(1)}>
                  <span>{t('compare.selectComponent')}</span>
                </button>
              )}
              {product2 ? (
                <SelectedCard product={product2} onClick={() => openOverlay(2)} />
              ) : (
                <button className={styles.placeholder} onClick={() => openOverlay(2)}>
                  <span>{t('compare.selectSecond')}</span>
                </button>
              )}
            </div>

            {hasBoth && (
              <div className={styles.comparison}>
                <h2 className={styles.comparisonTitle}>Сравнение характеристик</h2>
                <table className={styles.comparisonTable}>
                  <tbody>
                    {specKeys.map(key => {
                      const s1 = product1!.specs.find(s => s.key === key)
                      const s2 = product2!.specs.find(s => s.key === key)
                      const v1 = s1?.value ?? '—'
                      const v2 = s2?.value ?? '—'
                      const [r1, r2] = compareValues(key, v1, v2)
                      return (
                        <tr key={key} className={styles.comparisonRow}>
                          <td className={styles.comparisonLabel}>{t(`specs.${key}`)}</td>
                          <td className={`${styles.comparisonValue} ${resultClass(r1)}`}>{v1}</td>
                          <td className={`${styles.comparisonValue} ${resultClass(r2)}`}>{v2}</td>
                        </tr>
                      )
                    })}
                    <tr className={styles.comparisonRow}>
                      <td className={styles.comparisonLabel}>{t('compare.price')}</td>
                      {(() => {
                        const [r1, r2] = compareValues(
                          'price',
                          String(product1!.price),
                          String(product2!.price),
                        )
                        return (
                          <>
                            <td className={`${styles.comparisonValue} ${resultClass(r1)}`}>
                              {formatPrice(product1!.price)} ₽
                            </td>
                            <td className={`${styles.comparisonValue} ${resultClass(r2)}`}>
                              {formatPrice(product2!.price)} ₽
                            </td>
                          </>
                        )
                      })()}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {overlayOpen && activeCategory && (
          <div className={styles.overlay} onClick={() => setOverlayOpen(false)}>
            <div className={styles.overlayContent} onClick={e => e.stopPropagation()}>
              <div className={styles.overlayHeader}>
                <span className={styles.overlayTitle}>
                  {t('compare.overlayTitle')} — {t(`categories.${activeCategory}`)}
                </span>
                <button className={styles.overlayClose} onClick={() => setOverlayOpen(false)}>
                  ✕
                </button>
              </div>
              {overlayLoading ? (
                <div className={styles.overlayLoading}>{t('compare.loading')}</div>
              ) : overlayProducts.length === 0 ? (
                <div className={styles.overlayLoading}>{t('compare.noProducts')}</div>
              ) : (
                <div className={styles.overlayGrid}>
                  {overlayProducts.map(product => (
                    <OverlayCard
                      key={product.id}
                      product={product}
                      onClick={() => selectProduct(product)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Sub-components ──────────────────────────────────────────────

function SelectedCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const t = useTranslations()
  const specKeys = CATEGORY_SPECS[product.categoryKey] || []
  return (
    <div className={styles.selectedCard} onClick={onClick}>
      <span className={styles.selectedBadge}>{t(`categories.${product.categoryKey}`)}</span>
      <span className={styles.selectedName}>{product.name}</span>
      <div className={styles.selectedSpecs}>
        {specKeys.slice(0, 3).map(key => {
          const spec = product.specs.find(s => s.key === key)
          if (!spec) return null
          return (
            <div key={key} className={styles.selectedSpecRow}>
              <span className={styles.selectedSpecLabel}>{t(`specs.${spec.key}`)}</span>
              <span className={styles.selectedSpecValue}>{spec.value}</span>
            </div>
          )
        })}
      </div>
      <div className={styles.selectedFooter}>
        <span className={styles.selectedPrice}>{formatPrice(product.price)} ₽</span>
        <span className={styles.selectedChange}>Изменить</span>
      </div>
    </div>
  )
}

function OverlayCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const t = useTranslations()
  const specKeys = CATEGORY_SPECS[product.categoryKey] || []
  return (
    <div className={styles.overlayCard} onClick={onClick}>
      <span className={styles.overlayCardName}>{product.name}</span>
      <div className={styles.overlayCardSpecs}>
        {specKeys.slice(0, 2).map(key => {
          const spec = product.specs.find(s => s.key === key)
          if (!spec) return null
          return (
            <span key={key} className={styles.overlayCardSpec}>
              {t(`specs.${spec.key}`)}: {spec.value}
            </span>
          )
        })}
      </div>
      <div className={styles.overlayCardFooter}>
        <span className={styles.overlayCardPrice}>{formatPrice(product.price)} ₽</span>
      </div>
    </div>
  )
}
