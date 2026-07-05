'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Tag, CheckSquare, Calendar, Paperclip, MessageSquare, Trash2, Plus, Check, Edit3, Clock, Target } from 'lucide-react'
import toast from 'react-hot-toast'

const LABEL_COLORS = [
  { cor: '#22c55e', nome: 'Verde' },
  { cor: '#3b82f6', nome: 'Azul' },
  { cor: '#f59e0b', nome: 'Amarelo' },
  { cor: '#ef4444', nome: 'Vermelho' },
  { cor: '#8b5cf6', nome: 'Roxo' },
  { cor: '#FA4616', nome: 'Laranja' },
  { cor: '#06b6d4', nome: 'Ciano' },
  { cor: '#ec4899', nome: 'Rosa' },
]

interface CardDetailModalProps {
  cardId: string
  planejamentoId: string
  onClose: () => void
  onUpdate: (updatedCard: any) => void
}

export default function CardDetailModal({ cardId, planejamentoId, onClose, onUpdate }: CardDetailModalProps) {
  const [card, setCard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')
  const [editingDesc, setEditingDesc] = useState(false)
  const [descValue, setDescValue] = useState('')
  const [editingDemanda, setEditingDemanda] = useState(false)
  const [demandaValue, setDemandaValue] = useState('')
  const [newComment, setNewComment] = useState('')
  const [showLabelPicker, setShowLabelPicker] = useState(false)
  const [newLabelNome, setNewLabelNome] = useState('')
  const [newLabelCor, setNewLabelCor] = useState('#22c55e')
  const [addingChecklist, setAddingChecklist] = useState(false)
  const [checklistTitulo, setChecklistTitulo] = useState('Checklist')
  const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({})

  const titleRef = useRef<HTMLTextAreaElement>(null)
  const BASE = `/api/planejamentos/${planejamentoId}/cards/${cardId}`

  const loadCard = useCallback(async () => {
    try {
      const res = await fetch(BASE)
      if (res.ok) {
        const data = await res.json()
        setCard(data.card)
        setTitleValue(data.card.titulo)
        setDescValue(data.card.descricao || '')
        setDemandaValue(data.card.demanda || '')
      }
    } finally {
      setLoading(false)
    }
  }, [BASE])

  useEffect(() => { loadCard() }, [loadCard])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const saveTitle = async () => {
    if (!titleValue.trim() || titleValue === card.titulo) { setEditingTitle(false); return }
    const res = await fetch(BASE, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ titulo: titleValue }) })
    if (res.ok) {
      const updated = { ...card, titulo: titleValue }
      setCard(updated)
      onUpdate(updated)
    }
    setEditingTitle(false)
  }

  const saveDesc = async () => {
    const res = await fetch(BASE, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ descricao: descValue }) })
    if (res.ok) setCard({ ...card, descricao: descValue })
    setEditingDesc(false)
  }

  const saveDemanda = async () => {
    const res = await fetch(BASE, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ demanda: demandaValue }) })
    if (res.ok) setCard({ ...card, demanda: demandaValue })
    setEditingDemanda(false)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)

    const toastId = toast.loading('Fazendo upload...')
    try {
      const upRes = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!upRes.ok) throw new Error('Falha no upload')
      const upData = await upRes.json()

      const res = await fetch(`${BASE}/anexos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: file.name, url: upData.url }) })
      if (res.ok) {
        const { anexo } = await res.json()
        setCard({ ...card, anexos: [...card.anexos, anexo] })
        toast.success('Anexo adicionado!', { id: toastId })
      }
    } catch (err) {
      toast.error('Erro no upload', { id: toastId })
    }
  }

  const deleteAnexo = async (anexoId: string) => {
    if (!confirm('Excluir este anexo?')) return
    const res = await fetch(`${BASE}/anexos?anexoId=${anexoId}`, { method: 'DELETE' })
    if (res.ok) setCard({ ...card, anexos: card.anexos.filter((a: any) => a.id !== anexoId) })
  }

  const saveDueDate = async (date: string) => {
    const res = await fetch(BASE, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dataVencimento: date || null }) })
    if (res.ok) setCard({ ...card, dataVencimento: date || null })
  }

  const addLabel = async () => {
    if (!newLabelNome.trim()) return
    const res = await fetch(`${BASE}/labels`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: newLabelNome, cor: newLabelCor }) })
    if (res.ok) {
      const { label } = await res.json()
      setCard({ ...card, labels: [...card.labels, label] })
      setNewLabelNome('')
      setShowLabelPicker(false)
    }
  }

  const deleteLabel = async (labelId: string) => {
    const res = await fetch(`${BASE}/labels?labelId=${labelId}`, { method: 'DELETE' })
    if (res.ok) setCard({ ...card, labels: card.labels.filter((l: any) => l.id !== labelId) })
  }

  const addChecklist = async () => {
    const res = await fetch(`${BASE}/checklists`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ titulo: checklistTitulo }) })
    if (res.ok) {
      const { checklist } = await res.json()
      setCard({ ...card, checklists: [...card.checklists, checklist] })
      setAddingChecklist(false)
      setChecklistTitulo('Checklist')
    }
  }

  const addItem = async (checklistId: string) => {
    const texto = newItemTexts[checklistId]?.trim()
    if (!texto) return
    const res = await fetch(`${BASE}/checklists/${checklistId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ texto }) })
    if (res.ok) {
      const { item } = await res.json()
      const newChecklists = card.checklists.map((cl: any) =>
        cl.id === checklistId ? { ...cl, itens: [...cl.itens, item] } : cl
      )
      setCard({ ...card, checklists: newChecklists })
      setNewItemTexts({ ...newItemTexts, [checklistId]: '' })
    }
  }

  const toggleItem = async (checklistId: string, itemId: string, concluido: boolean) => {
    const res = await fetch(`${BASE}/checklists/${checklistId}?itemId=${itemId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ concluido: !concluido }) })
    if (res.ok) {
      const newChecklists = card.checklists.map((cl: any) =>
        cl.id === checklistId ? { ...cl, itens: cl.itens.map((it: any) => it.id === itemId ? { ...it, concluido: !concluido } : it) } : cl
      )
      setCard({ ...card, checklists: newChecklists })
    }
  }

  const deleteItem = async (checklistId: string, itemId: string) => {
    const res = await fetch(`${BASE}/checklists/${checklistId}?itemId=${itemId}`, { method: 'DELETE' })
    if (res.ok) {
      const newChecklists = card.checklists.map((cl: any) =>
        cl.id === checklistId ? { ...cl, itens: cl.itens.filter((it: any) => it.id !== itemId) } : cl
      )
      setCard({ ...card, checklists: newChecklists })
    }
  }

  const addComment = async () => {
    if (!newComment.trim()) return
    const res = await fetch(`${BASE}/comentarios`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ texto: newComment }) })
    if (res.ok) {
      const { comentario } = await res.json()
      setCard({ ...card, comentarios: [...card.comentarios, comentario] })
      setNewComment('')
    }
  }

  const deleteComment = async (comentarioId: string) => {
    const res = await fetch(`${BASE}/comentarios?comentarioId=${comentarioId}`, { method: 'DELETE' })
    if (res.ok) setCard({ ...card, comentarios: card.comentarios.filter((c: any) => c.id !== comentarioId) })
  }

  if (loading) return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-muted)' }}>Carregando...</div>
      </div>
    </div>
  )

  if (!card) return null

  const totalItens = card.checklists.reduce((acc: number, cl: any) => acc + cl.itens.length, 0)
  const concluidosItens = card.checklists.reduce((acc: number, cl: any) => acc + cl.itens.filter((i: any) => i.concluido).length, 0)

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            {editingTitle ? (
              <textarea
                ref={titleRef}
                value={titleValue}
                onChange={e => setTitleValue(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), saveTitle())}
                autoFocus
                style={{ width: '100%', background: 'var(--bg-deep)', border: '2px solid var(--accent)', borderRadius: 'var(--r-sm)', color: 'var(--text-primary)', fontSize: '1.3rem', fontWeight: 700, padding: '0.5rem', fontFamily: 'var(--font)', resize: 'none', outline: 'none' }}
                rows={2}
              />
            ) : (
              <h2
                onClick={() => setEditingTitle(true)}
                style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer', margin: 0, lineHeight: 1.3, padding: '0.25rem', borderRadius: 'var(--r-sm)', transition: 'background 0.15s' }}
                title="Clique para editar"
              >
                {card.titulo}
              </h2>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem', borderRadius: 'var(--r-sm)', flexShrink: 0 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '2rem' }}>
          {/* Left Column — Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Labels */}
            {card.labels.length > 0 && (
              <div>
                <div style={sectionLabelStyle}><Tag size={14} /> Etiquetas</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                  {card.labels.map((l: any) => (
                    <span key={l.id} style={{ background: l.cor, color: '#fff', padding: '3px 10px', borderRadius: 'var(--r-full)', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }} onClick={() => deleteLabel(l.id)}>
                      {l.nome} <X size={10} />
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Data de Vencimento */}
            {card.dataVencimento && (
              <div>
                <div style={sectionLabelStyle}><Clock size={14} /> Data de Vencimento</div>
                <div style={{ marginTop: '0.5rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  {new Date(card.dataVencimento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              </div>
            )}

            {/* Descrição */}
            <div>
              <div style={sectionLabelStyle}><Edit3 size={14} /> Descrição</div>
              {editingDesc ? (
                <div style={{ marginTop: '0.5rem' }}>
                  <textarea
                    value={descValue}
                    onChange={e => setDescValue(e.target.value)}
                    style={{ width: '100%', minHeight: '100px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text-primary)', fontFamily: 'var(--font)', fontSize: '0.9rem', padding: '0.75rem', outline: 'none', resize: 'vertical' }}
                    placeholder="Adicione uma descrição..."
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button onClick={saveDesc} className="btn btn-primary btn-sm">Salvar</button>
                    <button onClick={() => { setEditingDesc(false); setDescValue(card.descricao || '') }} className="btn btn-secondary btn-sm">Cancelar</button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setEditingDesc(true)}
                  style={{ marginTop: '0.5rem', minHeight: '60px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0.75rem', cursor: 'pointer', color: card.descricao ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '0.9rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
                >
                  {card.descricao || 'Clique para adicionar uma descrição...'}
                </div>
              )}
            </div>

            {/* Demanda */}
            <div>
              <div style={sectionLabelStyle}><Target size={14} /> Demanda</div>
              {editingDemanda ? (
                <div style={{ marginTop: '0.5rem' }}>
                  <textarea
                    value={demandaValue}
                    onChange={e => setDemandaValue(e.target.value)}
                    style={{ width: '100%', minHeight: '100px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text-primary)', fontFamily: 'var(--font)', fontSize: '0.9rem', padding: '0.75rem', outline: 'none', resize: 'vertical' }}
                    placeholder="Especifique a demanda da tarefa..."
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button onClick={saveDemanda} className="btn btn-primary btn-sm">Salvar</button>
                    <button onClick={() => { setEditingDemanda(false); setDemandaValue(card.demanda || '') }} className="btn btn-secondary btn-sm">Cancelar</button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setEditingDemanda(true)}
                  style={{ marginTop: '0.5rem', minHeight: '60px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0.75rem', cursor: 'pointer', color: card.demanda ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '0.9rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
                >
                  {card.demanda || 'Clique para definir a demanda...'}
                </div>
              )}
            </div>

            {/* Anexos */}
            {card.anexos && card.anexos.length > 0 && (
              <div>
                <div style={sectionLabelStyle}><Paperclip size={14} /> Anexos</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                  {card.anexos.map((anexo: any) => (
                    <div key={anexo.id} style={{ position: 'relative', borderRadius: 'var(--r-sm)', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-deep)', aspectRatio: '1', display: 'flex', flexDirection: 'column' }}>
                      <img src={anexo.url} alt={anexo.nome} style={{ flex: 1, width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '0.25rem', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)', display: 'flex', justifyContent: 'flex-end' }}>
                        <button onClick={() => deleteAnexo(anexo.id)} style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Excluir anexo">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Checklists */}
            {card.checklists.map((cl: any) => {
              const total = cl.itens.length
              const done = cl.itens.filter((i: any) => i.concluido).length
              const pct = total > 0 ? Math.round((done / total) * 100) : 0
              return (
                <div key={cl.id}>
                  <div style={sectionLabelStyle}><CheckSquare size={14} /> {cl.titulo}</div>
                  {total > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.5rem 0' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '30px' }}>{pct}%</span>
                      <div style={{ flex: 1, height: '6px', background: 'var(--bg-elevated)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#22c55e' : 'var(--accent)', borderRadius: '9999px', transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                    {cl.itens.map((item: any) => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.3rem 0.5rem', borderRadius: 'var(--r-sm)', background: 'rgba(255,255,255,0.02)' }}>
                        <input
                          type="checkbox"
                          checked={item.concluido}
                          onChange={() => toggleItem(cl.id, item.id, item.concluido)}
                          style={{ accentColor: 'var(--accent)', width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
                        />
                        <span style={{ flex: 1, fontSize: '0.9rem', color: item.concluido ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: item.concluido ? 'line-through' : 'none' }}>
                          {item.texto}
                        </span>
                        <button onClick={() => deleteItem(cl.id, item.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.5, padding: '2px' }}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {/* Add item */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                      <input
                        type="text"
                        value={newItemTexts[cl.id] || ''}
                        onChange={e => setNewItemTexts({ ...newItemTexts, [cl.id]: e.target.value })}
                        onKeyDown={e => e.key === 'Enter' && addItem(cl.id)}
                        placeholder="Adicionar item..."
                        style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', color: 'var(--text-primary)', fontFamily: 'var(--font)', fontSize: '0.85rem', padding: '0.4rem 0.6rem', outline: 'none' }}
                      />
                      <button onClick={() => addItem(cl.id)} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.6rem' }}><Plus size={14} /></button>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Comentários */}
            <div>
              <div style={sectionLabelStyle}><MessageSquare size={14} /> Atividade</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <textarea
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Escrever um comentário..."
                    rows={2}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text-primary)', fontFamily: 'var(--font)', fontSize: '0.875rem', padding: '0.6rem', outline: 'none', resize: 'none' }}
                  />
                  <button onClick={addComment} className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end' }}>Enviar</button>
                </div>
                {card.comentarios.map((c: any) => (
                  <div key={c.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0.75rem', display: 'flex', gap: '0.6rem' }}>
                    {c.user?.image ? (
                      <img src={c.user.image} alt="Avatar" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.7rem', color: 'var(--accent)', flexShrink: 0 }}>
                        {c.user?.name ? c.user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{c.user?.name || 'Usuário'}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {new Date(c.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{c.texto}</p>
                    </div>
                    <button onClick={() => deleteComment(c.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', alignSelf: 'flex-start', opacity: 0.5 }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column — Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.5rem' }}>Adicionar ao cartão</p>

            {/* Etiquetas */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowLabelPicker(!showLabelPicker)} style={actionBtnStyle}>
                <Tag size={14} /> Etiqueta
              </button>
              {showLabelPicker && (
                <div style={{ position: 'absolute', top: '110%', right: 0, background: '#1e1e1e', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0.75rem', zIndex: 20, width: '210px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Cor</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' }}>
                    {LABEL_COLORS.map(lc => (
                      <div key={lc.cor} onClick={() => setNewLabelCor(lc.cor)} style={{ width: '28px', height: '28px', borderRadius: 'var(--r-sm)', background: lc.cor, cursor: 'pointer', border: newLabelCor === lc.cor ? '2px solid #fff' : '2px solid transparent' }} title={lc.nome} />
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Nome da etiqueta..."
                    value={newLabelNome}
                    onChange={e => setNewLabelNome(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addLabel()}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', color: 'var(--text-primary)', fontFamily: 'var(--font)', fontSize: '0.8rem', padding: '0.4rem 0.5rem', outline: 'none', marginBottom: '0.5rem' }}
                  />
                  <button onClick={addLabel} className="btn btn-primary btn-sm" style={{ width: '100%' }}>Criar etiqueta</button>
                </div>
              )}
            </div>

            {/* Upload de Imagem */}
            <label style={actionBtnStyle}>
              <Paperclip size={14} /> Anexo
              <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleUpload} />
            </label>

            {/* Checklist */}
            {!addingChecklist ? (
              <button onClick={() => setAddingChecklist(true)} style={actionBtnStyle}>
                <CheckSquare size={14} /> Checklist
              </button>
            ) : (
              <div style={{ background: '#1e1e1e', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0.75rem' }}>
                <input
                  type="text"
                  value={checklistTitulo}
                  onChange={e => setChecklistTitulo(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', color: 'var(--text-primary)', fontFamily: 'var(--font)', fontSize: '0.8rem', padding: '0.4rem 0.5rem', outline: 'none', marginBottom: '0.5rem' }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button onClick={addChecklist} className="btn btn-primary btn-sm">Adicionar</button>
                  <button onClick={() => setAddingChecklist(false)} className="btn btn-secondary btn-sm">×</button>
                </div>
              </div>
            )}

            {/* Data */}
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Data de vencimento</p>
              <input
                type="date"
                defaultValue={card.dataVencimento ? card.dataVencimento.split('T')[0] : ''}
                onChange={e => saveDueDate(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text-primary)', fontFamily: 'var(--font)', fontSize: '0.8rem', padding: '0.5rem', outline: 'none', cursor: 'pointer' }}
              />
            </div>

            {/* Stats */}
            {totalItens > 0 && (
              <div style={{ marginTop: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0.75rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.4rem' }}>Progresso</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {concluidosItens}/{totalItens}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 999,
  display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
  padding: '2rem 1rem', overflowY: 'auto', backdropFilter: 'blur(4px)'
}

const modalStyle: React.CSSProperties = {
  width: '100%', maxWidth: '760px',
  background: '#1a1a1a',
  backgroundImage: `
    radial-gradient(circle at 15% 10%, rgba(250, 70, 22, 0.10), transparent 50%),
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
  `,
  backgroundSize: '100% 100%, 30px 30px, 30px 30px',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 0 0 6px #0a0a0a, 0 0 0 7px rgba(255,255,255,0.05), 0 20px 60px rgba(0,0,0,0.8)',
  borderRadius: 'var(--r-xl)',
  padding: '2rem',
  margin: '7px',
}

const sectionLabelStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.4rem',
  fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.06em'
}

const actionBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  width: '100%', background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 'var(--r-md)', color: 'var(--text-secondary)',
  fontFamily: 'var(--font)', fontSize: '0.85rem', fontWeight: 500,
  padding: '0.55rem 0.75rem', cursor: 'pointer', transition: 'all 0.15s'
}
