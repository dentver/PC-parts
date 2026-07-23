import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { Unbounded, Rubik, JetBrains_Mono } from 'next/font/google'
import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import { routing } from '@/i18n/routing'
import { LanguageSwitch } from './language-switch'
import { CartProvider } from '@/context/cart-context'
import { CartLink } from '@/components/cart-link'
import { ScrollToTop } from '@/components/scroll-to-top'
import { MobileNav } from '@/components/mobile-nav'
import './globals.scss'
import './variable.scss'

const CART_SVG = fs.readFileSync(path.join(process.cwd(), 'public', 'icons', 'cart.svg'), 'utf-8')

const unbounded = Unbounded({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-heading',
  weight: ['600', '700', '800'],
})

const rubik = Rubik({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-mono',
  weight: ['400', '500', '700'],
})

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'PC Parts',
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        ru: '/ru',
      },
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()
  const tnav = await getTranslations({ locale, namespace: 'nav' })
  const tfooter = await getTranslations({ locale, namespace: 'footer' })

  return (
    <html lang={locale} className={`${unbounded.variable} ${rubik.variable} ${jetbrainsMono.variable}`} translate="no">
      <body>
        <NextIntlClientProvider messages={messages}>
          <CartProvider>
            <header className="header">
              <div className="header-inner">
                <Link href={`/${locale}`} className="logo">
                  PC Parts
                </Link>
                <nav className="nav">
                  <Link href={`/${locale}/catalog`}>{tnav('catalog')}</Link>
                  <Link href={`/${locale}/builds`}>{tnav('builds')}</Link>
                  <Link href={`/${locale}/compare`}>{tnav('compare')}</Link>
                </nav>
                <LanguageSwitch locale={locale} />
                <CartLink svgContent={CART_SVG} />
                <MobileNav />
              </div>
            </header>

            <main className="main-content">
              {children}
            </main>
          </CartProvider>

          <footer className="footer">
            <p>{tfooter('copyright')} — {tfooter('description')}</p>
          </footer>
          <ScrollToTop />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
