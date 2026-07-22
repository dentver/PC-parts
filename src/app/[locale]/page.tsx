import { getTranslations } from 'next-intl/server'
import styles from './main.module.scss'
import { HeroDots } from '@/components/hero-dots'
import { PopularProducts } from '@/components/popular-products'
import { getCategoryCounts } from '@/data/api'
import { CATEGORIES } from '@/data/types'

import fs from 'fs'
import path from 'path'

const iconCache = new Map<string, string>()

function CategoryIcon({ categoryKey }: { categoryKey: string }) {
  if (!iconCache.has(categoryKey)) {
    iconCache.set(categoryKey, fs.readFileSync(
      path.join(process.cwd(), 'public', 'icons', `${categoryKey}.svg`),
      'utf-8'
    ))
  }
  return (
    <div className={styles.categoryIcon} dangerouslySetInnerHTML={{ __html: iconCache.get(categoryKey)! }} />
  )
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const [categoryCounts, t] = await Promise.all([
    getCategoryCounts().catch(() => ({}) as Record<string, number>),
    getTranslations({ locale }),
  ])

  return (
    <>
      <section className={styles.hero}>
        <HeroDots />
        <div className={styles.heroInner}>
          <span className={styles.badge}>
            <span className={styles.badgeDot} />
            {t('hero.badge')}
          </span>
          <h1 className={styles.heroTitle}>{t('hero.title')} <br /><span className={styles.heroGold}>{t('hero.titleGold')}</span></h1>
          <p className={styles.heroSubtitle}>
            {t('hero.subtitle')}
          </p>
          <div className={styles.heroActions}>
            <a href={`/${locale}/catalog`} className={styles.btnPrimary}>{t('hero.ctaCatalog')}</a>
            <a href={`/${locale}/builds`} className={styles.btnSecondary}>{t('hero.ctaBuilds')}</a>
          </div>
        </div>
      </section>

      <hr className={styles.separator} />

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>{t('categories.title')}</h2>
          <div className={styles.categoriesGrid}>
            {CATEGORIES.map((cat) => (
              <a key={cat.key} href={`/${locale}/catalog?category=${cat.key}`} className={styles.categoryCard}>
                <CategoryIcon categoryKey={cat.key} />
                <span className={styles.categoryName}>{t(`categories.${cat.key}`)}</span>
                <span className={styles.categoryCount}>
                  {categoryCounts[cat.key] !== undefined
                    ? t('categories.items', { count: categoryCounts[cat.key] })
                    : '\u2014'}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <hr className={styles.separator} />

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>{t('products.title')}</h2>
          <PopularProducts />
        </div>
      </section>
    </>
  )
}
