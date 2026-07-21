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
        <span style={{
          position: 'absolute',
          top: '-6px',
          right: '-8px',
          background: '#d29f22',
          color: '#000',
          fontSize: '0.65rem',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
        }}>
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  )
}
