import type { Metadata, Viewport } from 'next'
import { ReactNode } from 'react'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  icons: [
    { rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'shortcut icon', url: '/favicon.svg', type: 'image/svg+xml' },
  ],
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return children
}
