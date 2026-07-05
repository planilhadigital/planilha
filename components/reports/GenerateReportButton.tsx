'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { FileText, Loader2 } from 'lucide-react'

export default function GenerateReportButton({ empresaId }: { empresaId: string }) {
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresaId, days: 28 })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao gerar relatório')
      }
      
      toast.success('Relatório gerado! Abrindo...')
      window.open(`/report/${data.relatorioId}`, '_blank')
      
      // Atualizar a página para exibir na galeria
      setTimeout(() => window.location.reload(), 1000)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleGenerate} disabled={loading} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
      {loading ? <Loader2 size={16} className="anim-spin" /> : <FileText size={16} />}
      {loading ? 'Gerando IA...' : 'Gerar Relatório'}
    </button>
  )
}
