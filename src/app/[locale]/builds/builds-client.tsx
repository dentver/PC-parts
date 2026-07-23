'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useCart } from '@/context/cart-context'
import { CATEGORY_SPECS } from '@/data/types'
import { formatPrice } from '@/data/format-price'
import type { Build } from '@/data/types'
import cardStyles from '@/app/[locale]/catalog/catalog.module.scss'
import styles from './builds.module.scss'

let cachedBuilds: Build[] | null = null

export function BuildsClient() {
  const t = useTranslations()
  const cart = useCart()
  const params = useParams()
  const locale = (params.locale as string) || 'en'
  const [builds, setBuilds] = useState<Build[]>(cachedBuilds ?? [])
  const [selected, setSelected] = useState<Build | null>(null)
  const [loading, setLoading] = useState(!cachedBuilds)

  useEffect(() => {
    if (selected) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [selected])

  useEffect(() => {
    if (cachedBuilds) return
    fetch(`/api/builds?locale=${locale}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { cachedBuilds = data; setBuilds(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className={styles.page}>
        <div className={styles.inner}>
          <h1 className={styles.title}>{t('builds.title')}</h1>
          <div className={styles.spinnerWrap}>
            <span className={styles.spinner} />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>{t('builds.title')}</h1>
        <div className={styles.grid}>
          {builds.map(build => {
            const formattedPrice = formatPrice(build.totalPrice, locale)
            return (
              <div key={build.slug} className={styles.card}>
                <h2 className={styles.buildName}>{t(`builds.${build.slug}`)}</h2>
                <p className={styles.buildDesc}>{t(`builds.${build.slug}Desc`)}</p>
                <div className={styles.componentsPreview}>
                  {build.components.map(c => (
                    <div key={c.role} className={styles.componentRow}>
                      <span className={styles.role}>{t(`buildRoles.${c.role}`)}</span>
                      <span className={styles.partName}>{c.product.name}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.footer}>
                  <span className={styles.total}>{t('builds.total')}: {formattedPrice}</span>
                  <button className={styles.detailsBtn} onClick={() => setSelected(build)}>
                    {t('builds.viewDetails')}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{t(`builds.${selected.slug}`)}</h2>
              <button className={styles.closeBtn} onClick={() => setSelected(null)}>
                {t('builds.closeDetails')}
              </button>
            </div>
            <p className={styles.modalDesc}>{t(`builds.${selected.slug}Desc`)}</p>
            <div className={styles.modalComponents}>
              {selected.components.map(c => {
                const specKeys = CATEGORY_SPECS[c.product.categoryKey] || []
                const formattedPrice = formatPrice(c.product.price, locale)
                return (
                  <div key={c.role} className={cardStyles.card}>
                    <span className={cardStyles.badge}>
                      {t(`buildRoles.${c.role}`)}
                    </span>
                    <h3 className={cardStyles.name}>{c.product.name}</h3>
                    <div className={cardStyles.specs}>
                      {specKeys.map(key => {
                        const spec = c.product.specs.find(s => s.key === key)
                        if (!spec) return null
                        return (
                          <div key={key} className={cardStyles.specRow}>
                            <span className={cardStyles.specLabel}>{t(`specs.${spec.key}`)}</span>
                            <span className={cardStyles.specValue}>{spec.value}</span>
                          </div>
                        )
                      })}
                    </div>
                    <div className={cardStyles.footer}>
                      <span className={cardStyles.price}>{formattedPrice}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className={styles.modalTotal}>
              <span className={styles.total}>{t('builds.total')}: {formatPrice(selected.totalPrice, locale)}</span>
              <button
                className={styles.addAllBtn}
                onClick={() => {
                  cart.addItem({
                    id: selected.id,
                    name: selected.name,
                    categoryKey: 'builds',
                    price: selected.totalPrice,
                    components: selected.components.map(c => ({
                      id: c.product.id,
                      name: c.product.name,
                      categoryKey: c.product.categoryKey,
                      price: c.product.price,
                      role: c.role,
                    })),
                  })
                  setSelected(null)
                }}
              >
                {t('builds.addAllToCart')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
