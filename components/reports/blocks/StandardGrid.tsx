'use client'

import React from 'react'
import styles from '@/app/report/[id]/page.module.css'

export default function StandardGrid({ title, properties }: { title: string, properties: any }) {
  const kpis = properties.kpis || []

  return (
    <section className={`${styles.slide} ${styles.slideMetrics}`}>
      <h3 className={styles.slideTitle} style={{ gridColumn: '1 / -1', marginBottom: '1rem' }}>{title}</h3>
      {kpis.map((kpi: any, idx: number) => (
        <div key={idx} className={styles.kpiBox}>
          <span className={styles.kpiTitle}>{kpi.title}</span>
          <div className={styles.kpiNumber}>
            {kpi.value}
            {kpi.trend && (
              <span className={`${styles.delta} ${kpi.trend === 'positivo' ? styles.deltaUp : kpi.trend === 'negativo' ? styles.deltaDown : ''}`}>
                {kpi.trend}
              </span>
            )}
          </div>
        </div>
      ))}
      {kpis.length === 0 && (
        <div className={styles.kpiBox} style={{ gridColumn: '1 / -1', textAlign: 'center', opacity: 0.5 }}>
          Sem dados numéricos relevantes neste bloco.
        </div>
      )}
    </section>
  )
}
