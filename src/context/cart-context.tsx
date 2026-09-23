'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useParams } from 'next/navigation'

export interface CartComponent {
  id: number
  name: string
  categoryKey: string
  price: number
  role: string
}

export interface CartItem {
  uid: string
  id: number
  name: string
  categoryKey: string
  price: number
  quantity: number
  currency: 'RUB' | 'USD'
  components?: CartComponent[]
}

interface CartContextValue {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity' | 'uid' | 'currency'>) => void
  removeItem: (uid: string) => void
  updateQuantity: (uid: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'pc-parts-cart'

function loadCart(): CartItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const params = useParams()
  const locale = (params.locale as string) || 'en'
  const currentCurrency: 'RUB' | 'USD' = locale === 'ru' ? 'RUB' : 'USD'
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setItems(loadCart().map(i => ({ ...i, currency: i.currency ?? currentCurrency })))
    setLoaded(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, loaded])

  useEffect(() => {
    if (!loaded) return
    const mismatched = items.find(i => i.currency !== currentCurrency)
    if (!mismatched) return
    const from = mismatched.currency

    let cancelled = false
    fetch('/api/rate')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled || !data?.rate) return
        const rate = data.rate as number
        const to: 'RUB' | 'USD' = from === 'RUB' ? 'USD' : 'RUB'
        const convert = (p: number) => from === 'RUB' ? Math.round(p / rate) : Math.round(p * rate)
        setItems(prev => prev.map(item =>
          item.currency === from
            ? {
                ...item,
                currency: to,
                price: convert(item.price),
                components: item.components?.map(c => ({ ...c, price: convert(c.price) })),
              }
            : item
        ))
      })
    return () => { cancelled = true }
  }, [items, loaded, currentCurrency])

  const addItem = useCallback((item: Omit<CartItem, 'quantity' | 'uid' | 'currency'>) => {
    const uid = `${item.categoryKey}-${item.id}`
    setItems(prev => {
      const existing = prev.find(i => i.uid === uid)
      if (existing) {
        return prev.map(i =>
          i.uid === uid ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, uid, quantity: 1, currency: currentCurrency }]
    })
  }, [currentCurrency])

  const removeItem = useCallback((uid: string) => {
    setItems(prev => prev.filter(i => i.uid !== uid))
  }, [])

  const updateQuantity = useCallback((uid: string, quantity: number) => {
    if (quantity < 1) return
    setItems(prev => prev.map(i =>
      i.uid === uid ? { ...i, quantity } : i
    ))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
