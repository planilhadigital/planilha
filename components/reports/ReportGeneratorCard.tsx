'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import GenerateReportButton from './GenerateReportButton'

export default function ReportGeneratorCard({ empresa }: { empresa: any }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [days, setDays] = useState(28)

  return (
    <div 
      className="card" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem',
        position: 'relative',
        opacity: isGenerating ? 0.6 : 1,
        pointerEvents: isGenerating ? 'none' : 'auto',
        transition: 'var(--t-normal)'
      }}
    >
      {isGenerating && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, background: 'rgba(0,0,0,0.2)', borderRadius: 'inherit' }}>
          <Loader2 size={40} className="anim-spin" color="var(--accent)" />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {empresa.avatarUrl ? (
          <img src={empresa.avatarUrl} alt={empresa.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-deep)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {empresa.name.charAt(0)}
          </div>
        )}
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{empresa.name}</h3>
          <span className={`badge badge-${empresa.status === 'Ativo' ? 'success' : 'neutral'}`} style={{ marginTop: '0.25rem' }}>
            {empresa.status}
          </span>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.5rem', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', marginRight: 'auto' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Período:</span>
          <select 
            value={days} 
            onChange={e => setDays(Number(e.target.value))}
            style={{ background: 'transparent', color: 'var(--text-primary)', border: 'none', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
          >
            <option value={7}>7 dias</option>
            <option value={14}>14 dias</option>
            <option value={28}>28 dias</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '100%' }}>
          <GenerateReportButton empresaId={empresa.id} platform="INSTAGRAM" days={days} onGenerating={setIsGenerating} />
          <GenerateReportButton empresaId={empresa.id} platform="FACEBOOK" days={days} onGenerating={setIsGenerating} />
        </div>
      </div>
    </div>
  )
}
