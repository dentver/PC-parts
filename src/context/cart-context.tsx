'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

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
  components?: CartComponent[]
}

interface CartContextValue {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity' | 'uid'>) => void
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
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setItems(loadCart())
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, loaded])

  const addItem = useCallback((item: Omit<CartItem, 'quantity' | 'uid'>) => {
    const uid = `${item.categoryKey}-${item.id}`
    setItems(prev => {
      const existing = prev.find(i => i.uid === uid)
      if (existing) {
        return prev.map(i =>
          i.uid === uid ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, uid, quantity: 1 }]
    })
  }, [])

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
