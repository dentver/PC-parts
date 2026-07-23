# PC Parts

## Demo URL
https://pc-parts-iota.vercel.app/en

## Stack

- **Framework** — Next.js 16 (App Router)
- **Language** — TypeScript
- **Styling** — SCSS Modules
- **Internationalization** — next-intl (ru, en)
- **Commerce** — Saleor GraphQL API
- **Fonts** — Unbounded (headings), Rubik (body), JetBrains Mono (monospace)

## Getting started

```bash
npm install
npm run dev
```

## Project structure

```
src/
  app/
    [locale]/          # Localized routes (ru, en)
      catalog/         # Product catalog with category filters
      builds/          # Pre-built PC builds
      compare/         # Component comparison
      cart/            # Shopping cart
    api/
      category-products/  # Products by category
      products/           # All products (paginated, sortable)
      popular/            # Popular products
      builds/             # Pre-built builds
  components/          # Shared UI components
  data/
    types.ts           # Core types (Product, Spec, Build, etc.)
    api.ts             # Saleor GraphQL client
  context/
    cart-context.tsx    # Cart state
```

## Features

- **Catalog** — browse components by category or view all, infinite scroll, price sorting
- **Builds** — pre-configured PC builds with full component lists
- **Compare** — side-by-side comparison of two components within the same category
- **Cart** — add/remove items, quantity management

## Compare

Select a category, then pick two components from the overlay. The table compares every specification:

- **Green** — the better value (numerically comparable specs)
- **Red** — the worse value
- **Gold** — equal, non-numeric, or incomparable specs

Comparable numeric specs know direction: higher is better for clocks, cores, memory etc.; lower is better for TDP, latency, voltage, and price.

## API

All API routes return JSON. Errors return `{ "error": "message" }` with status 500 (or 400 for missing params).

### `GET /api/category-products`

Fetch products belonging to a specific category.

| Query param | Type   | Default | Description          |
| ----------- | ------ | ------- | -------------------- |
| `category`  | string | —       | Category slug (req)  |
| `first`     | number | 10      | Page size (1–50)     |
| `after`     | string | null    | Cursor for pagination |

### `GET /api/products`

Fetch all products with optional filtering and sorting.

| Query param | Type   | Default | Description              |
| ----------- | ------ | ------- | ------------------------ |
| `category`  | string | null    | Filter by category slug  |
| `first`     | number | 10      | Page size (1–50)         |
| `after`     | string | null    | Cursor for pagination    |
| `sort`      | string | null    | `price-asc` / `price-desc` |

### `GET /api/popular`

Returns `{ "products": [...] }` – up to 6 top-selling products (falls back to one per category).

### `GET /api/builds`

Returns an array of pre-built PC builds with their components, total price, and metadata.
