import type { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  icons: [
    { rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'shortcut icon', url: '/favicon.svg', type: 'image/svg+xml' },
  ],
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return children
}
