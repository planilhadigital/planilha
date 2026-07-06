'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import styles from './page.module.css'
import { ArrowRight, Plus } from 'lucide-react'

export default function PlanejamentosPage() {
  const [quadros, setQuadros] = useState<any[]>([])
  const [empresas, setEmpresas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ titulo: '', descricao: '', empresaId: '' })
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    Promise.all([loadQuadros(), loadEmpresas()]).finally(() => setLoading(false))
  }, [])

  async function loadEmpresas() {
    try {
      const res = await fetch('/api/empresas')
      const data = await res.json()
      setEmpresas(data.empresas || [])
    } catch (err) {
      console.error(err)
    }
  }

  async function loadQuadros() {
    try {
      const res = await fetch('/api/planejamentos')
      const data = await res.json()
      setQuadros(data.planejamentos || [])
    } catch (err) {
      console.error(err)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/planejamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error('Erro ao criar quadro')
      const novo = await res.json()
      // Como a API não devolve o objeto `empresa` aninhado na criação, vamos anexá-lo manualmente pro state
      const emp = empresas.find(e => e.id === form.empresaId)
      const novoQuadro = { ...novo, empresa: emp || null }
      
      setQuadros([novoQuadro, ...quadros])
      setForm({ titulo: '', descricao: '', empresaId: '' })
      setShowForm(false)
      toast.success('Quadro criado com sucesso!')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className="anim-fade-up">
          <h1 className={styles.title}>Meus Quadros de Planejamento</h1>
          <p className={styles.subtitle}>Organize ideias, cronogramas e fluxos de aprovação.</p>
        </div>
      </header>

      {loading ? (
        <p className="text-muted anim-fade-up">Carregando quadros...</p>
      ) : (
        <div className={`${styles.grid} anim-fade-up anim-delay-1`}>
          
          {/* Card de Criar Novo */}
          {showForm ? (
            <div className={styles.newBoardForm}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Novo Quadro</h3>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="Ex: Lançamento Dia das Mães"
                  required
                  autoFocus
                  value={form.titulo}
                  onChange={e => setForm({...form, titulo: e.target.value})}
                />
                <select 
                  className={styles.input}
                  value={form.empresaId}
                  onChange={e => setForm({...form, empresaId: e.target.value})}
                >
                  <option value="">Sem vínculo (Global)</option>
                  {empresas.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
                <textarea 
                  className={styles.input} 
                  rows={2}
                  placeholder="Detalhes opcionais..."
                  value={form.descricao}
                  onChange={e => setForm({...form, descricao: e.target.value})}
                />
                <div className={styles.formActions}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={creating}>
                    {creating ? 'Criando...' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button 
              className={`card ${styles.boardCard}`} 
              style={{ border: '2px dashed var(--border)', cursor: 'pointer', background: 'transparent', alignItems: 'center', justifyContent: 'center', boxShadow: 'none' }}
              onClick={() => setShowForm(true)}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <Plus size={32} />
                <span style={{ fontWeight: 600 }}>Criar Novo Quadro</span>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Lista de Quadros Existentes Agrupados */}
      {!loading && Object.values(
        quadros.reduce((acc, q) => {
          const empName = q.empresa?.name || 'Gerais'
          const empAvatar = q.empresa?.avatarUrl || null
          if (!acc[empName]) acc[empName] = { name: empName, avatarUrl: empAvatar, boards: [] }
          acc[empName].boards.push(q)
          return acc
        }, {} as Record<string, { name: string, avatarUrl: string | null, boards: any[] }>)
      ).map((group: any) => {
        const { name, avatarUrl, boards } = group
        return (
        <div key={name} className="anim-fade-up anim-delay-2" style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : name !== 'Gerais' ? (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent)' }}>
                {name.charAt(0).toUpperCase()}
              </div>
            ) : null}
            {name}
          </h2>
          <div className={styles.grid}>
            {boards.map((q: any) => (
              <Link key={q.id} href={`/dashboard/planejamentos/${q.id}`} className={`card ${styles.boardCard}`}>
                <div>
                  <h3 className={styles.boardTitle}>{q.titulo}</h3>
                  {q.descricao && <p className={styles.boardDesc}>{q.descricao}</p>}
                </div>
                <div className={styles.boardFooter}>
                  <span className={styles.boardDate}>
                    Criado em: {new Date(q.createdAt).toLocaleDateString()}
                  </span>
                  <span className={styles.boardArrow}><ArrowRight size={18} /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )})}
    </div>
  )
}
