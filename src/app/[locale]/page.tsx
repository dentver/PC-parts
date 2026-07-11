import { useTranslations } from 'next-intl'
import styles from './main.module.scss'

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

function CategoryIcon({ categoryKey }: { categoryKey: string }) {
  const svg = (() => {
    switch (categoryKey) {
      case 'processors':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="#d29f22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="6" width="12" height="12" rx="1.5" />
            <line x1="9" y1="3" x2="9" y2="6" />
            <line x1="12" y1="3" x2="12" y2="6" />
            <line x1="15" y1="3" x2="15" y2="6" />
            <line x1="9" y1="18" x2="9" y2="21" />
            <line x1="12" y1="18" x2="12" y2="21" />
            <line x1="15" y1="18" x2="15" y2="21" />
            <line x1="3" y1="9" x2="6" y2="9" />
            <line x1="3" y1="12" x2="6" y2="12" />
            <line x1="3" y1="15" x2="6" y2="15" />
            <line x1="18" y1="9" x2="21" y2="9" />
            <line x1="18" y1="12" x2="21" y2="12" />
            <line x1="18" y1="15" x2="21" y2="15" />
          </svg>
        )
      case 'videoCards':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="#d29f22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="7" width="18" height="12" rx="1.5" />
            <rect x="5" y="9" width="8" height="6" rx="1" />
            <line x1="16" y1="10" x2="18" y2="10" />
            <line x1="16" y1="12" x2="18" y2="12" />
            <line x1="16" y1="14" x2="18" y2="14" />
            <line x1="10" y1="19" x2="10" y2="21" />
            <line x1="12" y1="19" x2="12" y2="21" />
          </svg>
        )
      case 'motherboards':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="#d29f22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="1.5" />
            <rect x="6" y="6" width="6" height="6" rx="1" />
            <line x1="15" y1="6" x2="18" y2="6" />
            <line x1="15" y1="9" x2="18" y2="9" />
            <line x1="6" y1="15" x2="12" y2="15" />
            <line x1="6" y1="18" x2="12" y2="18" />
            <line x1="15" y1="15" x2="18" y2="15" />
            <line x1="15" y1="18" x2="18" y2="18" />
          </svg>
        )
      case 'ram':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="#d29f22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="5" width="16" height="14" rx="2" />
            <line x1="7" y1="3" x2="7" y2="5" />
            <line x1="10" y1="3" x2="10" y2="5" />
            <line x1="13" y1="3" x2="13" y2="5" />
            <line x1="16" y1="3" x2="16" y2="5" />
            <line x1="7" y1="19" x2="7" y2="21" />
            <line x1="10" y1="19" x2="10" y2="21" />
            <line x1="13" y1="19" x2="13" y2="21" />
            <line x1="16" y1="19" x2="16" y2="21" />
            <line x1="6" y1="10" x2="18" y2="10" />
            <line x1="6" y1="14" x2="18" y2="14" />
          </svg>
        )
      case 'storage':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="#d29f22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <circle cx="8" cy="8" r="1.5" fill="#d29f22" />
            <line x1="12" y1="6" x2="18" y2="6" />
            <line x1="12" y1="9" x2="18" y2="9" />
            <line x1="6" y1="14" x2="18" y2="14" />
            <line x1="6" y1="17" x2="18" y2="17" />
          </svg>
        )
      case 'powerSupplies':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="#d29f22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="7" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="17" />
            <line x1="7" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="17" y2="12" />
            <line x1="9" y1="12" x2="15" y2="12" />
            <line x1="12" y1="9" x2="12" y2="15" />
          </svg>
        )
      case 'cases':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="#d29f22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="3" width="14" height="18" rx="1.5" />
            <rect x="8" y="6" width="8" height="4" rx="0.5" />
            <line x1="8" y1="14" x2="16" y2="14" />
            <line x1="8" y1="17" x2="16" y2="17" />
            <line x1="12" y1="6" x2="12" y2="10" />
            <line x1="9" y1="3" x2="9" y2="6" />
            <line x1="15" y1="3" x2="15" y2="6" />
            <line x1="10" y1="20" x2="10" y2="21" />
            <line x1="14" y1="20" x2="14" y2="21" />
          </svg>
        )
      default:
        return null
    }
  })()

  return (
    <div className={styles.categoryIcon}>
      {svg}
    </div>
  )
}

export default function Home() {
  const columns = gridColumns(products.length)
  const t = useTranslations()

  return (
    <>
      <section className={styles.hero}>
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
