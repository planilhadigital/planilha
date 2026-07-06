'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import { FaInstagram, FaFacebook } from 'react-icons/fa'

interface Props {
  empresaId: string;
  platform?: 'INSTAGRAM' | 'FACEBOOK';
  days?: number | 'custom';
  startDate?: string;
  endDate?: string;
  onGenerating?: (generating: boolean) => void;
}

export default function GenerateReportButton({ empresaId, platform = 'INSTAGRAM', days = 28, startDate, endDate, onGenerating }: Props) {
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    if (onGenerating) onGenerating(true)
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresaId, days, platform, startDate, endDate })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao gerar relatório')
      }
      
      toast.success('Relatório gerado! Abrindo...')
      window.open(`/report/${data.relatorioId}`, '_blank')
      
      setTimeout(() => window.location.reload(), 1000)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
      if (onGenerating) onGenerating(false)
    }
  }

  const isInsta = platform === 'INSTAGRAM'
  const bgColor = isInsta ? 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' : '#1877F2'

  return (
    <button 
      onClick={handleGenerate} 
      disabled={loading} 
      className="btn btn-primary btn-sm" 
      style={{ 
        justifyContent: 'center', 
        background: loading ? 'var(--bg-elevated)' : bgColor,
        borderColor: 'transparent',
        flex: 1
      }}
      title={`Gerar Relatório de ${isInsta ? 'Instagram' : 'Facebook'}`}
    >
      {loading ? <Loader2 size={16} className="anim-spin" /> : (isInsta ? <FaInstagram size={16} /> : <FaFacebook size={16} />)}
      {loading ? 'Processando...' : (isInsta ? 'IG REPORT' : 'FB REPORT')}
    </button>
  )
}
