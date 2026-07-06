'use client'

import React from 'react'
import styles from '@/app/report/[id]/page.module.css'
import { ArrowRight, Lightbulb, TrendingUp, Zap } from 'lucide-react'

export default function NarrativeFlow({ title, properties }: { title: string, properties: any }) {
  const steps = properties.steps || []
  if (steps.length < 3) return null;

  return (
    <section className={`${styles.slide} ${styles.slideNarrative}`}>
      <h3 className={styles.slideTitle} style={{ marginBottom: '2rem' }}>
        {title || 'Evolução Estratégica'}
      </h3>
      
      <div className={styles.narrativeContainer}>
        {/* Step 1: ANTES */}
        <div className={styles.narrativeStep}>
          <div className={`${styles.narrativeIcon} ${styles.iconBefore}`}>
            <Zap size={24} />
          </div>
          <div className={styles.narrativeContent}>
            <h4 className={styles.narrativeLabel}>O Cenário</h4>
            <p className={styles.narrativeText}>{steps[0]}</p>
          </div>
        </div>

        <div className={styles.narrativeArrow}>
          <ArrowRight size={24} className={styles.arrowGlow} />
        </div>

        {/* Step 2: O QUE FOI FEITO */}
        <div className={`${styles.narrativeStep} ${styles.stepAction}`}>
          <div className={`${styles.narrativeIcon} ${styles.iconAction}`}>
            <Lightbulb size={24} />
          </div>
          <div className={styles.narrativeContent}>
            <h4 className={styles.narrativeLabel}>A Estratégia</h4>
            <p className={styles.narrativeText}>{steps[1]}</p>
          </div>
        </div>

        <div className={styles.narrativeArrow}>
          <ArrowRight size={24} className={styles.arrowGlow} />
        </div>

        {/* Step 3: RESULTADO */}
        <div className={`${styles.narrativeStep} ${styles.stepResult}`}>
          <div className={`${styles.narrativeIcon} ${styles.iconResult}`}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.narrativeContent}>
            <h4 className={styles.narrativeLabel}>O Impacto</h4>
            <p className={styles.narrativeText}>{steps[2]}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
