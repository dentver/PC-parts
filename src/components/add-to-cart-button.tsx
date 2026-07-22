'use client'

import { useCart } from '@/context/cart-context'
import { useTranslations } from 'next-intl'

interface Props {
  id: number
  name: string
  categoryKey: string
  price: number
  className?: string
}

export function AddToCartButton({ id, name, categoryKey, price, className }: Props) {
  const { items, addItem } = useCart()
  const t = useTranslations()
  const inCart = items.some(i => i.id === id)

  return (
    <button
      className={`${className ?? ''} ${inCart ? 'btnInCart' : ''}`.trim() || undefined}
      disabled={inCart}
      onClick={() => addItem({ id, name, categoryKey, price })}
    >
      {inCart ? t('catalog.inCart') : t('catalog.addToCart')}
    </button>
  )
}
