'use client'

import React from 'react'
import styles from '@/app/report/[id]/page.module.css'

export default function TimelineCrisis({ title, properties }: { title: string, properties: any }) {
  const steps = properties.steps || []
  
  return (
    <section className={`${styles.slide} ${styles.slideAction}`} style={{ borderColor: 'var(--danger)', boxShadow: '0 0 20px rgba(220, 38, 38, 0.1)' }}>
      <h3 className={styles.slideTitle} style={{ color: 'var(--danger)' }}>
        {title} 
        <span style={{ fontSize: '0.8rem', background: 'var(--danger)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', marginLeft: '1rem' }}>
          {properties.severity || 'ALERTA'}
        </span>
      </h3>
      
      <div style={{ margin: '2rem 0' }}>
        <ul className={styles.actionList} style={{ borderLeft: '2px solid var(--danger)', paddingLeft: '2rem' }}>
          {steps.map((step: string, i: number) => (
            <li key={i} style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <div style={{ position: 'absolute', left: '-2.6rem', top: '0', width: '1rem', height: '1rem', borderRadius: '50%', background: 'var(--bg-deep)', border: '2px solid var(--danger)' }}></div>
              {step}
            </li>
          ))}
        </ul>
      </div>

      {properties.recommendation && (
        <div style={{ background: 'rgba(250, 70, 22, 0.1)', padding: '1rem', borderRadius: 'var(--r-md)', border: '1px solid var(--accent)', marginTop: '2rem' }}>
          <strong>Ação Recomendada:</strong> {properties.recommendation}
        </div>
      )}
    </section>
  )
}
