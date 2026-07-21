'use client'

import { useTranslations } from 'next-intl'
import { useCart } from '@/context/cart-context'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import styles from './cart.module.scss'

export function CartClient() {
  const t = useTranslations()
  const params = useParams()
  const locale = params.locale as string
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart()

  const regularItems = items.filter(i => i.categoryKey !== 'builds')
  const buildItems = items.filter(i => i.categoryKey === 'builds')

  return (
    <section className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('cart.title')}</h1>
          <p className={styles.count}>{t('cart.count', { count: totalItems })}</p>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="48" height="48" style={{ opacity: 0.3 }}>
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <p>{t('cart.empty')}</p>
            <Link href={`/${locale}/catalog`} className={styles.btnPrimary}>{t('cart.continueShopping')}</Link>
          </div>
        ) : (
          <div className={styles.layout}>
            <div className={styles.items}>
              {buildItems.map((item) => (
                <div key={item.id} className={styles.item}>
                  <span className={styles.badge}>{t('categories.builds')}</span>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  {item.components && item.components.length > 0 && (
                    <div className={styles.componentsList}>
                      {item.components.map(c => (
                        <div key={c.id} className={styles.componentRow}>
                          <span className={styles.componentRole}>{t(`buildRoles.${c.role}`)}</span>
                          <span className={styles.componentName}>{c.name}</span>
                          <span className={styles.componentPrice}>{new Intl.NumberFormat('ru-RU').format(c.price)} ₽</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={styles.itemFooter}>
                    <span className={styles.itemPrice}>
                      {new Intl.NumberFormat('ru-RU').format(item.price)} ₽
                    </span>
                    <div className={styles.quantity}>
                      <button className={`${styles.qtyBtn} ${item.quantity <= 1 ? styles.qtyBtnDisabled : ''}`} onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>&minus;</button>
                      <span className={styles.qtyValue}>{item.quantity}</span>
                      <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>{t('cart.remove')}</button>
                  </div>
                </div>
              ))}
              {regularItems.map((item) => (
                <div key={item.id} className={styles.item}>
                  <span className={styles.badge}>{t(`categories.${item.categoryKey}`)}</span>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <div className={styles.itemFooter}>
                    <span className={styles.itemPrice}>
                      {new Intl.NumberFormat('ru-RU').format(item.price)} ₽
                    </span>
                    <div className={styles.quantity}>
                      <button className={`${styles.qtyBtn} ${item.quantity <= 1 ? styles.qtyBtnDisabled : ''}`} onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>&minus;</button>
                      <span className={styles.qtyValue}>{item.quantity}</span>
                      <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>{t('cart.remove')}</button>
                  </div>
                </div>
              ))}
            </div>

            <aside className={styles.summary}>
              <h2 className={styles.summaryTitle}>{t('cart.summary')}</h2>
              <div className={styles.summaryRow}>
                <span>{t('cart.subtotal')}</span>
                <span>{new Intl.NumberFormat('ru-RU').format(totalPrice)} ₽</span>
              </div>
              <div className={styles.summaryRow}>
                <span>{t('cart.shipping')}</span>
                <span className={styles.shippingFree}>{t('cart.shippingFree')}</span>
              </div>
              <div className={styles.divider} />
              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span>{t('cart.total')}</span>
                <span>{new Intl.NumberFormat('ru-RU').format(totalPrice)} ₽</span>
              </div>
              <button className={styles.btnCheckout}>{t('cart.checkout')}</button>
              <Link href={`/${locale}/catalog`} className={styles.continueLink}>{t('cart.continueShopping')}</Link>
            </aside>
          </div>
        )}
      </div>
    </section>
  )
}
