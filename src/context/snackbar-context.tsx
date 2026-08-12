'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface SnackbarMessage {
  id: number
  text: string
}

interface SnackbarContextValue {
  showSnackbar: (text: string) => void
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null)

let nextId = 0

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<SnackbarMessage[]>([])

  const showSnackbar = useCallback((text: string) => {
    const id = nextId++
    setMessages(prev => [...prev, { id, text }])
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== id))
    }, 2500)
  }, [])

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <div className="snackbarContainer" aria-live="polite">
        {messages.map(msg => (
          <div key={msg.id} className="snackbar">
            {msg.text}
          </div>
        ))}
      </div>
    </SnackbarContext.Provider>
  )
}

export function useSnackbar() {
  const ctx = useContext(SnackbarContext)
  if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider')
  return ctx
}
