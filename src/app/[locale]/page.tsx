import { useTranslations } from 'next-intl'
import styles from './main.module.scss'
import { HeroDots } from '@/components/hero-dots'

interface Spec {
  labelKey: string
  value: string
}

interface Product {
  id: number
  name: string
  categoryKey: string
  price: string
  specs: Spec[]
}

const categories = [
  { key: 'processors', count: 24 },
  { key: 'videoCards', count: 18 },
  { key: 'motherboards', count: 15 },
  { key: 'ram', count: 20 },
  { key: 'storage', count: 22 },
  { key: 'powerSupplies', count: 14 },
  { key: 'cases', count: 12 },
]

const products: Product[] = [
  {
    id: 1, name: 'AMD Ryzen 7 7800X3D', categoryKey: 'processors', price: '44 990',
    specs: [
      { labelKey: 'cores', value: '8' },
      { labelKey: 'threads', value: '16' },
      { labelKey: 'baseFreq', value: '4.2 GHz' },
      { labelKey: 'l3Cache', value: '96 MB' },
    ],
  },
  {
    id: 2, name: 'NVIDIA RTX 4070 Ti Super', categoryKey: 'videoCards', price: '79 990',
    specs: [
      { labelKey: 'memory', value: '16 GB GDDR6X' },
      { labelKey: 'boostClock', value: '2610 MHz' },
      { labelKey: 'cudaCores', value: '8448' },
      { labelKey: 'tdp', value: '285 W' },
    ],
  },
  {
    id: 3, name: 'Intel Core i5-14600K', categoryKey: 'processors', price: '29 990',
    specs: [
      { labelKey: 'cores', value: '14 (6P+8E)' },
      { labelKey: 'threads', value: '20' },
      { labelKey: 'maxFreq', value: '5.3 GHz' },
      { labelKey: 'l3Cache', value: '24 MB' },
    ],
  },
  {
    id: 4, name: 'G.Skill Trident Z5 32GB', categoryKey: 'ram', price: '11 990',
    specs: [
      { labelKey: 'type', value: 'DDR5-6000' },
      { labelKey: 'capacity', value: '32 GB (2×16)' },
      { labelKey: 'latency', value: 'CL30' },
      { labelKey: 'voltage', value: '1.35 V' },
    ],
  },
  {
    id: 5, name: 'Samsung 990 Pro 2TB', categoryKey: 'storage', price: '16 990',
    specs: [
      { labelKey: 'capacity', value: '2 TB' },
      { labelKey: 'interface', value: 'NVMe M.2' },
      { labelKey: 'readSpeed', value: '7450 MB/s' },
      { labelKey: 'writeSpeed', value: '6900 MB/s' },
    ],
  },
  {
    id: 6, name: 'ASUS ROG STRIX B650E-F', categoryKey: 'motherboards', price: '24 990',
    specs: [
      { labelKey: 'socket', value: 'AM5' },
      { labelKey: 'chipset', value: 'B650E' },
      { labelKey: 'ramSlots', value: '4× DDR5' },
      { labelKey: 'wifi', value: 'Wi-Fi 6E' },
    ],
  },
]

function gridColumns(count: number): number {
  if (count <= 3) return count
  if (count <= 4) return 2
  if (count <= 6) return 3
  return 4
}

import fs from 'fs'
import path from 'path'

function CategoryIcon({ categoryKey }: { categoryKey: string }) {
  const svgContent = fs.readFileSync(
    path.join(process.cwd(), 'public', 'icons', `${categoryKey}.svg`),
    'utf-8'
  )

  return (
    <div className={styles.categoryIcon} dangerouslySetInnerHTML={{ __html: svgContent }} />
  )
}

export default function Home() {
  const columns = gridColumns(products.length)
  const t = useTranslations()

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
            <a href="/catalog" className={styles.btnPrimary}>{t('hero.ctaCatalog')}</a>
            <a href="/builds" className={styles.btnSecondary}>{t('hero.ctaBuilds')}</a>
          </div>
        </div>
      </section>

      <hr className={styles.separator} />

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>{t('categories.title')}</h2>
          <div className={styles.categoriesGrid}>
            {categories.map((cat) => (
              <a key={cat.key} href={`/catalog`} className={styles.categoryCard}>
                <CategoryIcon categoryKey={cat.key} />
                <span className={styles.categoryName}>{t(`categories.${cat.key}`)}</span>
                <span className={styles.categoryCount}>{t('categories.items', { count: cat.count })}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <hr className={styles.separator} />

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>{t('products.title')}</h2>
          <div className={styles.productsGrid} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {products.map((product) => (
              <div key={product.id} className={styles.productCard}>
                <span className={styles.productBadge}>{t(`categories.${product.categoryKey}`)}</span>
                <h3 className={styles.productName}>{product.name}</h3>
                <div className={styles.specsList}>
                  {product.specs.map((spec) => (
                    <div key={spec.labelKey} className={styles.specRow}>
                      <span className={styles.specLabel}>{t(`specs.${spec.labelKey}`)}</span>
                      <span className={styles.specValue}>{spec.value}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.productFooter}>
                  <span className={styles.productPrice}>{product.price} ₽</span>
                  <button className={styles.btnAdd}>{t('products.addToCart')}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
