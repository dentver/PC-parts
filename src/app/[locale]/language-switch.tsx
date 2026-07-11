'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export function LanguageSwitch({ locale }: { locale: string }) {
  const pathname = usePathname()
  const other = locale === 'en' ? 'ru' : 'en'
  const path = pathname.replace(`/${locale}`, `/${other}`)

  return (
    <Link href={path} className="language-switch">
      {other.toUpperCase()}
    </Link>
  )
}
