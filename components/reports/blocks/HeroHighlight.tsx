'use client'

import React from 'react'
import styles from '@/app/report/[id]/page.module.css'

export default function HeroHighlight({ title, properties }: { title: string, properties: any }) {
  return (
    <section className={`${styles.slide} ${styles.slideHighlight}`}>
      <div className={styles.slideGlow}></div>
      <h2 className={styles.punchline}>"{title}"</h2>
      
      <div className={styles.highlightBox}>
        <span className={styles.highlightLabel}>{properties.label}</span>
        <span className={styles.highlightValue}>{properties.metric}</span>
      </div>
      
      <p className={styles.narrative}>{properties.narrative}</p>
      
      {properties.delta && (
        <div style={{ marginTop: '1rem', color: 'var(--success)', fontWeight: 600 }}>
          {properties.delta}
        </div>
      )}
    </section>
  )
}
