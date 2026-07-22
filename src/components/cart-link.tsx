'use client'

import { useCart } from '@/context/cart-context'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Props {
  svgContent: string
}

export function CartLink({ svgContent }: Props) {
  const { totalItems } = useCart()
  const params = useParams()
  const locale = params.locale as string

  return (
    <Link href={`/${locale}/cart`} className="cart-link" style={{ position: 'relative' }}>
      <span dangerouslySetInnerHTML={{ __html: svgContent }} />
      {totalItems > 0 && (
        <span className="cartBadge">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  )
}
