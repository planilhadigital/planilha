'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'

export default function DeleteReportButton({ reportId }: { reportId: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja deletar este relatório?')) return
    const loadingToast = toast.loading('Deletando relatório...')
    try {
      const res = await fetch(`/api/reports/${reportId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao deletar relatório')
      
      toast.success('Relatório deletado!', { id: loadingToast })
      router.refresh()
    } catch (e: any) {
      toast.error(e.message || 'Erro ao deletar', { id: loadingToast })
    }
  }

  return (
    <button 
      onClick={handleDelete} 
      className="btn btn-secondary btn-sm" 
      style={{ padding: '0 0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      title="Deletar Relatório"
    >
      <Trash2 size={16} />
    </button>
  )
}
