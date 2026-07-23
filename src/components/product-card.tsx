'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { CATEGORY_SPECS, type Product } from '@/data/types'
import { formatPrice } from '@/data/format-price'
import { AddToCartButton } from '@/components/add-to-cart-button'
import styles from './product-card.module.scss'

export function ProductCard({ product }: { product: Product }) {
  const t = useTranslations()
  const params = useParams()
  const locale = (params.locale as string) || 'en'
  const specKeys = CATEGORY_SPECS[product.categoryKey] || []

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
        <span className={styles.price}>{formatPrice(product.price, locale)}</span>
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
