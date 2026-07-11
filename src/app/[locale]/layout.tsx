import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { Unbounded, Rubik, JetBrains_Mono } from 'next/font/google'
import Link from 'next/link'
import { routing } from '@/i18n/routing'
import { LanguageSwitch } from './language-switch'
import './globals.scss'
import './variable.scss'

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
    <html lang={locale} className={`${unbounded.variable} ${rubik.variable} ${jetbrainsMono.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
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
              <Link href={`/${locale}/cart`} className="cart-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </Link>
            </div>
          </header>

          <main className="main-content">
            {children}
          </main>

          <footer className="footer">
            <p>{tfooter('copyright')} — {tfooter('description')}</p>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
