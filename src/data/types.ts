export interface Spec {
  key: string
  value: string
}

export interface Product {
  id: number
  name: string
  categoryKey: string
  price: number
  specs: Spec[]
}

export const CATEGORIES = [
  { key: 'processors' as const, order: 0 },
  { key: 'videoCards' as const, order: 1 },
  { key: 'motherboards' as const, order: 2 },
  { key: 'ram' as const, order: 3 },
  { key: 'storage' as const, order: 4 },
  { key: 'powerSupplies' as const, order: 5 },
  { key: 'cases' as const, order: 6 },
]

export type CategoryKey = typeof CATEGORIES[number]['key']

export const CATEGORY_SPECS: Record<string, string[]> = {
  processors: ['cores', 'threads', 'baseFreq', 'l3Cache', 'maxFreq'],
  videoCards: ['memory', 'boostClock', 'cudaCores', 'tdp'],
  motherboards: ['socket', 'chipset', 'ramSlots', 'wifi'],
  ram: ['type', 'capacity', 'latency', 'voltage'],
  storage: ['capacity', 'interface', 'readSpeed', 'writeSpeed'],
  powerSupplies: ['wattage', 'formFactor', 'modular', 'efficiency'],
  cases: ['formFactor', 'motherboardSupport', 'fanSupport', 'driveBays'],
}

export interface BuildComponent {
  role: string
  product: Product
}

export interface Build {
  id: number
  name: string
  slug: string
  totalPrice: number
  components: BuildComponent[]
}
