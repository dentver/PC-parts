# Changelog

## 0.2.0 — 2026-07-23

### Added

- Multi-currency support: `channel-rub` (RUB) alongside `default-channel` (USD)
- Price locale switching: RUB for `ru`, USD for `en`
- 30 new products (5 per category: processors, videoCards, motherboards, ram, storage, powerSupplies)
- Real USD prices for all ~100 products

### Changed

- Catalog now excludes builds from sorted/price views
- Sort state is read from URL (`?sort=price-desc`) on page load
- URL sync for both category and sort filters
- `formatPrice` is locale-aware: `$1,200` for en, `10 700 ₽` for ru
- All API routes accept `locale` query parameter to select correct channel

### Fixed

- Stale locale closures in `catalog-client`, `popular-products`, `builds-client`, `compare-client`
- Hardcoded Russian strings in compare page (now use `t()`)
- Category name "Корпуса" → "Корпус"

### Removed

- Dead code: `data/products.ts`, `data/categories.ts`, `data/builds.ts`, `data/gql-client.ts`, `use-catalog.ts`

## 0.1.0 — 2026-07-22

### Added

- Compare page with category selection, two-component picker via overlay, and side-by-side spec comparison
- Color-coded comparison results: green (better), red (worse), gold (neutral)
- Numeric-aware comparison with per-spec direction (higher/lower is better)
- API routes: `/api/category-products`, `/api/products`, `/api/popular`, `/api/builds`
- Cart context and add-to-cart functionality
- Pre-built builds page with component listing
- Internationalization (ru/en) via next-intl
- Catalog with infinite scroll, category filters, and price sorting
- Hero section with animated dots and category grid on homepage
