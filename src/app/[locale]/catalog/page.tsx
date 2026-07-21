import { getCategoryCounts, getTotalProductCount } from '@/data/api'
import { CatalogClient } from './catalog-client'

export default async function CatalogPage(props: { searchParams: Promise<{ category?: string }> }) {
  const searchParams = await props.searchParams
  const [categoryCounts, total] = await Promise.all([
    getCategoryCounts(),
    getTotalProductCount(),
  ])
  return (
    <CatalogClient
      initialTotal={total}
      categoryCounts={categoryCounts}
      initialCategory={searchParams.category ?? null}
    />
  )
}
