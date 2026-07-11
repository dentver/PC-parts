'use client'

import { useMemo } from 'react'
import styles from './hero-dots.module.scss'

const SPACING = 36
const COLS = 56
const ROWS = 35

interface Dot {
  left: number
  top: number
  delay: number
  duration: number
}

export function HeroDots() {
  const dots = useMemo<Dot[]>(() => {
    const result: Dot[] = []
    let idx = 0
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const seed1 = Math.sin(idx * 9301 + 49297) * 233280
        const seed2 = Math.sin(idx * 7919 + 104729) * 233280
        result.push({
          left: c * SPACING,
          top: r * SPACING,
          delay: (seed1 - Math.floor(seed1)) * 5,
          duration: 3 + (seed2 - Math.floor(seed2)) * 2,
        })
        idx++
      }
    }
    return result
  }, [])

  return (
    <div className={styles.wrapper} aria-hidden="true">
      {dots.map((d, i) => (
        <span
          key={i}
          className={styles.dot}
          style={{
            left: d.left,
            top: d.top,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
          }}
        />
      ))}
    </div>
  )
}
