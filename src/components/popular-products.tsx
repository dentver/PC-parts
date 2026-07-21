'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { AddToCartButton } from '@/components/add-to-cart-button'
import type { Product } from '@/data/types'
import styles from '@/app/[locale]/main.module.scss'

export function PopularProducts() {
  const t = useTranslations()
  const params = useParams()
  const locale = params.locale as string
  const [products, setProducts] = useState<Product[]>([])
  const [connecting, setConnecting] = useState(true)
  const retryRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch('/api/popular')
        if (!res.ok) {
          throw new Error('Failed')
        }
        const data = await res.json()
        if (!cancelled) {
          setProducts(data.products || [])
          setConnecting(false)
          if (retryRef.current) {
            clearInterval(retryRef.current)
            retryRef.current = null
          }
        }
      } catch {
        if (!cancelled) {
          setConnecting(true)
        }
      }
    }

    load()
    retryRef.current = setInterval(load, 5000)

    return () => {
      cancelled = true
      if (retryRef.current) clearInterval(retryRef.current)
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

  return (
    <div className={styles.productsGrid} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {products.map((product) => {
        const formattedPrice = new Intl.NumberFormat('ru-RU').format(product.price)
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
              <span className={styles.productPrice}>{formattedPrice} ₽</span>
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
