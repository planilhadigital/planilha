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
    const toastId = toast.loading('Buscando dados...')
    try {
      // 1. Prepare (Fetch DB & Graph API)
      const prepareRes = await fetch('/api/reports/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresaId, days, platform, startDate, endDate })
      })
      const prepareData = await prepareRes.json()
      if (!prepareRes.ok) throw new Error(prepareData.error || 'Erro ao buscar dados')
      
      toast.loading('Analisando com IA...', { id: toastId })
      
      // 2. AI (Edge Runtime, max 30s)
      const aiRes = await fetch('/api/reports/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          normalizedMetrics: prepareData.normalizedMetrics,
          empresaName: prepareData.empresaName,
          platform: prepareData.platform
        })
      })
      const aiData = await aiRes.json()
      // Ignoramos throws rígidos da IA para que o fallback possa salvar
      
      toast.loading('Salvando relatório...', { id: toastId })

      // 3. Save (Node Runtime, fast save)
      const saveRes = await fetch('/api/reports/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          empresaId: prepareData.empresaId,
          platform: prepareData.platform,
          effectiveDays: prepareData.effectiveDays,
          isDemo: prepareData.isDemo,
          profile: prepareData.profile,
          insights: prepareData.insights,
          aiAnalysis: aiData.success ? aiData.aiAnalysis : null,
          normalizedMetrics: prepareData.normalizedMetrics
        })
      })
      const saveData = await saveRes.json()
      if (!saveRes.ok) throw new Error(saveData.error || 'Erro ao salvar relatório')
      
      toast.success('Relatório gerado! Abrindo...', { id: toastId })
      window.open(`/report/${saveData.relatorioId}`, '_blank')
      
      setTimeout(() => window.location.reload(), 1000)
    } catch (err: any) {
      toast.error(err.message, { id: toastId })
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
