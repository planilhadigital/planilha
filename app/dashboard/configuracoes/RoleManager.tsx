'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLES = ['visitante', 'colaborador', 'admin']

export default function RoleManager({ userId, currentRole }: { userId: string, currentRole: string }) {
  const [role, setRole] = useState(currentRole)
  const [loading, setLoading] = useState(false)

  const currentIndex = ROLES.indexOf(role)
  // Se o role não estiver na lista por algum motivo de banco desatualizado, assumimos visitante
  const index = currentIndex === -1 ? 0 : currentIndex

  const canDecrease = index > 0
  const canIncrease = index < ROLES.length - 1

  const updateRole = async (newIndex: number) => {
    if (newIndex < 0 || newIndex >= ROLES.length) return
    
    const newRole = ROLES[newIndex]
    setLoading(true)
    
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setRole(newRole)
        toast.success(`Cargo atualizado para ${newRole}`)
      } else {
        toast.error(data.error || 'Erro ao atualizar cargo')
      }
    } catch (err) {
      toast.error('Erro de conexão ao atualizar cargo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <button 
        className="btn-icon"
        style={{ padding: '2px', background: 'var(--bg-deep)', border: '1px solid var(--border)', borderRadius: '4px', opacity: canDecrease && !loading ? 1 : 0.4, cursor: canDecrease && !loading ? 'pointer' : 'not-allowed' }}
        onClick={() => canDecrease && !loading && updateRole(index - 1)}
        disabled={!canDecrease || loading}
        title="Diminuir cargo"
      >
        <Minus size={14} />
      </button>
      
      <span className="badge badge-accent" style={{ minWidth: '85px', textAlign: 'center', justifyContent: 'center' }}>
        {role}
      </span>
      
      <button 
        className="btn-icon"
        style={{ padding: '2px', background: 'var(--bg-deep)', border: '1px solid var(--border)', borderRadius: '4px', opacity: canIncrease && !loading ? 1 : 0.4, cursor: canIncrease && !loading ? 'pointer' : 'not-allowed' }}
        onClick={() => canIncrease && !loading && updateRole(index + 1)}
        disabled={!canIncrease || loading}
        title="Aumentar cargo"
      >
        <Plus size={14} />
      </button>
    </div>
  )
}
