'use client'

import { useCart } from '@/context/cart-context'
import { useSnackbar } from '@/context/snackbar-context'
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
  const { showSnackbar } = useSnackbar()
  const t = useTranslations()
  const inCart = items.some(i => i.uid === `${categoryKey}-${id}`)

  return (
    <button
      className={`${className ?? ''} ${inCart ? 'btnInCart' : ''}`.trim() || undefined}
      disabled={inCart}
      onClick={() => {
        addItem({ id, name, categoryKey, price })
        showSnackbar(`${name} — ${t('catalog.addedToCart')}`)
      }}
    >
      {inCart ? t('catalog.inCart') : t('catalog.addToCart')}
    </button>
  )
}
