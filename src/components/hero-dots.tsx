'use client'

import { useMemo, useState, useEffect } from 'react'
import styles from './hero-dots.module.scss'

const GAP = 36
const COLS = 48
const ROWS = 24

export function HeroDots() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const dots = useMemo(() => {
    const maxCols = isMobile ? 20 : COLS
    const maxRows = isMobile ? 12 : ROWS
    const result: Array<{ left: string; top: string; delay: string; duration: string }> = []
    let idx = 0
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const s1 = Math.sin((idx + 1) * 9301 + 49297)
        const s2 = Math.sin((idx + 1) * 7919 + 104729)
        const f1 = s1 - Math.floor(s1)
        const f2 = s2 - Math.floor(s2)
        result.push({
          left: `${c * GAP}px`,
          top: `${r * GAP}px`,
          delay: `${(f1 * 5).toFixed(4)}s`,
          duration: `${(3 + f2 * 2).toFixed(4)}s`,
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
            animationDelay: d.delay,
            animationDuration: d.duration,
          }}
        />
      ))}
    </div>
  )
}
