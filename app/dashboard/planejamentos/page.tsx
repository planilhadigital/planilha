'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import styles from './page.module.css'

export default function PlanejamentosPage() {
  const [quadros, setQuadros] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ titulo: '', descricao: '' })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadQuadros()
  }, [])

  async function loadQuadros() {
    try {
      const res = await fetch('/api/planejamentos')
      const data = await res.json()
      setQuadros(data.planejamentos || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
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
      setQuadros([novo, ...quadros])
      setForm({ titulo: '', descricao: '' })
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
          <h1>Meus Quadros de Planejamento</h1>
          <p className="text-muted">Organize ideias, cronogramas e fluxos de aprovação.</p>
        </div>
      </header>

      <div className={styles.grid}>
        {/* Formulário de Criação */}
        <div className={`${styles.card} anim-fade-up anim-delay-1`}>
          <h2>Novo Quadro</h2>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <label className={styles.label}>Título</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="Ex: Lançamento Dia das Mães"
                required
                value={form.titulo}
                onChange={e => setForm({...form, titulo: e.target.value})}
              />
            </div>
            <div>
              <label className={styles.label}>Descrição</label>
              <textarea 
                className={styles.input} 
                rows={3}
                placeholder="Detalhes opcionais..."
                value={form.descricao}
                onChange={e => setForm({...form, descricao: e.target.value})}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Criando...' : '+ Criar Quadro'}
            </button>
          </form>
        </div>

        {/* Lista de Quadros */}
        <div className={`${styles.listWrapper} anim-fade-up anim-delay-2`}>
          {loading ? (
            <p className="text-muted">Carregando quadros...</p>
          ) : quadros.length === 0 ? (
            <div className={styles.empty}>Nenhum quadro criado ainda.</div>
          ) : (
            <div className={styles.boardList}>
              {quadros.map(q => (
                <Link key={q.id} href={`/dashboard/planejamentos/${q.id}`} className={styles.boardCard}>
                  <div className={styles.boardInfo}>
                    <h3>{q.titulo}</h3>
                    {q.descricao && <p className="text-sm text-muted">{q.descricao}</p>}
                    <span className="text-xs text-muted" style={{ display: 'block', marginTop: '0.5rem' }}>
                      Criado em: {new Date(q.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={styles.boardArrow}>→</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
