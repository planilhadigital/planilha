'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import GenerateReportButton from './GenerateReportButton'

export default function ReportGeneratorCard({ empresa }: { empresa: any }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [days, setDays] = useState<number | 'custom'>(28)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.5rem', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', marginRight: 'auto', position: 'relative' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Período:</span>
          
          <select 
            value={days === 'custom' ? 'custom' : days} 
            onChange={e => {
              const val = e.target.value;
              if (val === 'custom') setDays('custom' as any)
              else setDays(Number(val))
            }}
            style={{ 
              background: 'transparent', 
              color: 'var(--text-primary)', 
              border: 'none', 
              fontSize: '0.85rem', 
              outline: 'none', 
              cursor: 'pointer',
              appearance: 'none',
              paddingRight: '1.5rem',
            }}
            className="custom-select-icon"
          >
            <option value={7} style={{ background: 'var(--bg-surface)' }}>7 dias</option>
            <option value={14} style={{ background: 'var(--bg-surface)' }}>14 dias</option>
            <option value={28} style={{ background: 'var(--bg-surface)' }}>28 dias</option>
            <option value="custom" style={{ background: 'var(--bg-surface)' }}>Personalizado</option>
          </select>
          
          <svg style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>

        {days === 'custom' && (
          <div style={{ width: '100%', display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
             <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--r-sm)', padding: '0.25rem 0.5rem', fontSize: '0.8rem', colorScheme: 'dark' }} title="Data Inicial" />
             <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--r-sm)', padding: '0.25rem 0.5rem', fontSize: '0.8rem', colorScheme: 'dark' }} title="Data Final" />
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '100%', marginTop: days === 'custom' ? '0' : '0' }}>
          <GenerateReportButton empresaId={empresa.id} platform="INSTAGRAM" days={days} startDate={startDate} endDate={endDate} onGenerating={setIsGenerating} />
          <GenerateReportButton empresaId={empresa.id} platform="FACEBOOK" days={days} startDate={startDate} endDate={endDate} onGenerating={setIsGenerating} />
        </div>
      </div>
    </div>
  )
}
