'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface Props {
  locale: string
  catalogLabel: string
  buildsLabel: string
  compareLabel: string
}

export function NavLinks({ locale, catalogLabel, buildsLabel, compareLabel }: Props) {
  const pathname = usePathname()

  const links = [
    { href: `/${locale}/catalog`, label: catalogLabel },
    { href: `/${locale}/builds`, label: buildsLabel },
    { href: `/${locale}/compare`, label: compareLabel },
  ]

  return (
    <>
      {links.map(link => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={pathname.startsWith(link.href) ? 'page' : undefined}
        >
          {link.label}
        </Link>
      ))}
    </>
  )
}
