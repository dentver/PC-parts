import { getCategoryCounts, getTotalProductCount } from '@/data/api'
import { CatalogClient } from './catalog-client'

export default async function CatalogPage(props: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string; sort?: string }>
}) {
  const { locale } = await props.params
  const searchParams = await props.searchParams
  const [categoryCounts, total] = await Promise.all([
    getCategoryCounts(locale),
    getTotalProductCount(locale),
  ])
  return (
    <CatalogClient
      initialTotal={total}
      categoryCounts={categoryCounts}
      initialCategory={searchParams.category ?? null}
      initialSort={searchParams.sort ?? null}
    />
  )
}
