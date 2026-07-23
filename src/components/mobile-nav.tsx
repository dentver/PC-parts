'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const t = useTranslations()
  const params = useParams()
  const pathname = usePathname()
  const locale = (params.locale as string) || 'en'

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <button
        className="burger"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation menu"
      >
        <span className={`burgerLine ${open ? 'burgerOpen' : ''}`} />
      </button>

      {open && (
        <div className="mobileOverlay" onClick={() => setOpen(false)}>
          <nav className="mobileNav" onClick={e => e.stopPropagation()}>
            <Link href={`/${locale}`} className="mobileNavLink">{locale === 'ru' ? 'Главная' : 'Home'}</Link>
            <Link href={`/${locale}/catalog`} className="mobileNavLink">{t('nav.catalog')}</Link>
            <Link href={`/${locale}/builds`} className="mobileNavLink">{t('nav.builds')}</Link>
            <Link href={`/${locale}/compare`} className="mobileNavLink">{t('nav.compare')}</Link>
          </nav>
        </div>
      )}
    </>
  )
}
