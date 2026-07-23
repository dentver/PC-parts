'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { formatPrice } from '@/data/format-price'
import { AddToCartButton } from '@/components/add-to-cart-button'
import type { Product } from '@/data/types'
import styles from '@/app/[locale]/main.module.scss'

export function PopularProducts() {
  const t = useTranslations()
  const params = useParams()
  const locale = params.locale as string
  const [products, setProducts] = useState<Product[]>([])
  const [connecting, setConnecting] = useState(true)
  const loadingRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (loadingRef.current) return
      loadingRef.current = true
      try {
        const res = await fetch(`/api/popular?locale=${locale}`)
        if (!res.ok) {
          throw new Error('Failed')
        }
        const data = await res.json()
        if (!cancelled) {
          setProducts(data.products || [])
          setConnecting(false)
        }
      } catch {
        if (!cancelled) {
          setConnecting(true)
        }
      } finally {
        loadingRef.current = false
      }
    }

    async function poll() {
      if (cancelled) return
      await load()
      if (!cancelled) {
        timerRef.current = setTimeout(poll, 5000)
      }
    }

    poll()

    return () => {
      cancelled = true
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  if (connecting) {
    return (
      <div className={styles.connectingBlock}>
        <span className={styles.spinner} />
        <p>{t('catalog.connecting')}</p>
      </div>
    )
  }

  if (products.length === 0) {
    return <p className={styles.emptyPopular}>{t('products.empty')}</p>
  }

  const columns = products.length <= 3 ? products.length : products.length <= 4 ? 2 : products.length <= 6 ? 3 : 4
  const colsClass = columns === 4 ? styles.cols4 : columns === 3 ? styles.cols3 : styles.cols2

  return (
    <div className={`${styles.popularGrid} ${colsClass}`}>
      {products.map((product) => {
        return (
          <div key={product.id} className={styles.productCard}>
            <span className={styles.productBadge}>{t(`categories.${product.categoryKey}`)}</span>
            <h3 className={styles.productName}>{product.name}</h3>
            <div className={styles.specsList}>
              {product.specs.map((spec) => (
                <div key={spec.key} className={styles.specRow}>
                  <span className={styles.specLabel}>{t(`specs.${spec.key}`)}</span>
                  <span className={styles.specValue}>{spec.value}</span>
                </div>
              ))}
            </div>
            <div className={styles.productFooter}>
              <span className={styles.productPrice}>{formatPrice(product.price, locale)}</span>
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
      })}
    </div>
  )
}
