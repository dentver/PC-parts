import { useTranslations } from 'next-intl'

export default function Compare() {
  const t = useTranslations('nav')
  return (
    <section style={{ padding: '4rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
      <h1>{t('compare')}</h1>
    </section>
  )
}
