'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import styles from './page.module.css'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import toast from 'react-hot-toast'
import { Lightbulb, PenTool, CheckCircle, Rocket, Target, Zap, Clock, Megaphone, LayoutTemplate, Star, Pencil, Trash2 } from 'lucide-react'

// Mapa de ícones
const ICONS_MAP: Record<string, any> = {
  Lightbulb, PenTool, CheckCircle, Rocket, Target, Zap, Clock, Megaphone, LayoutTemplate, Star
}
const AVAILABLE_ICONS = Object.keys(ICONS_MAP)

export default function QuadroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [board, setBoard] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Estados para UI de criação/edição
  const [addingCol, setAddingCol] = useState(false)
  const [newColTitle, setNewColTitle] = useState('')
  const [newColIcon, setNewColIcon] = useState('')
  
  const [addingCardTo, setAddingCardTo] = useState<string | null>(null)
  const [newCardTitle, setNewCardTitle] = useState('')

  const [editingColId, setEditingColId] = useState<string | null>(null)
  const [editColTitle, setEditColTitle] = useState('')
  const [editColIcon, setEditColIcon] = useState('')

  useEffect(() => {
    loadBoard()
  }, [id])

  async function loadBoard() {
    try {
      const res = await fetch(`/api/planejamentos/${id}`)
      if (res.ok) {
        const data = await res.json()
        const cols = data.planejamento.colunas.sort((a: any, b: any) => a.ordem - b.ordem)
        cols.forEach((col: any) => {
          col.cards.sort((a: any, b: any) => a.ordem - b.ordem)
        })
        setBoard({ ...data.planejamento, colunas: cols })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    if (type === 'column') {
      const newCols = Array.from(board.colunas)
      const [movedCol] = newCols.splice(source.index, 1)
      newCols.splice(destination.index, 0, movedCol)
      const updatedCols = newCols.map((c: any, index) => ({ ...c, ordem: index }))
      setBoard({ ...board, colunas: updatedCols })

      await fetch(`/api/planejamentos/${id}/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colunas: updatedCols.map((c: any) => ({ id: c.id, ordem: c.ordem })) })
      })
      return
    }

    const sourceColIndex = board.colunas.findIndex((c: any) => c.id === source.droppableId)
    const destColIndex = board.colunas.findIndex((c: any) => c.id === destination.droppableId)
    const sourceCol = board.colunas[sourceColIndex]
    const destCol = board.colunas[destColIndex]
    const sourceCards = Array.from(sourceCol.cards)
    const destCards = sourceCol.id === destCol.id ? sourceCards : Array.from(destCol.cards)

    const [movedCard] = sourceCards.splice(source.index, 1) as any[]
    movedCard.colunaId = destCol.id
    destCards.splice(destination.index, 0, movedCard)

    const newCols = Array.from(board.colunas) as any[]
    
    if (sourceCol.id === destCol.id) {
      const updatedCards = destCards.map((c: any, index) => ({ ...c, ordem: index }))
      newCols[sourceColIndex].cards = updatedCards
    } else {
      const updatedSourceCards = sourceCards.map((c: any, index) => ({ ...c, ordem: index }))
      const updatedDestCards = destCards.map((c: any, index) => ({ ...c, ordem: index }))
      newCols[sourceColIndex].cards = updatedSourceCards
      newCols[destColIndex].cards = updatedDestCards
    }

    setBoard({ ...board, colunas: newCols })

    const affectedCards = sourceCol.id === destCol.id 
      ? newCols[sourceColIndex].cards 
      : [...newCols[sourceColIndex].cards, ...newCols[destColIndex].cards]

    await fetch(`/api/planejamentos/${id}/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cards: affectedCards.map((c: any) => ({ id: c.id, colunaId: c.colunaId, ordem: c.ordem })) })
    })
  }

  const addColumn = async () => {
    if (!newColTitle.trim()) return
    try {
      const res = await fetch(`/api/planejamentos/${id}/colunas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: newColTitle, icone: newColIcon })
      })
      if (res.ok) {
        const { coluna } = await res.json()
        setBoard({ ...board, colunas: [...board.colunas, { ...coluna, cards: [] }] })
        setNewColTitle('')
        setNewColIcon('')
        setAddingCol(false)
      }
    } catch (e) {
      toast.error('Erro ao criar coluna')
    }
  }

  const saveColumnEdit = async (colId: string) => {
    if (!editColTitle.trim()) return
    try {
      const res = await fetch(`/api/planejamentos/${id}/colunas/${colId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: editColTitle, icone: editColIcon })
      })
      if (res.ok) {
        const newCols = board.colunas.map((col: any) => {
          if (col.id === colId) return { ...col, titulo: editColTitle, icone: editColIcon }
          return col
        })
        setBoard({ ...board, colunas: newCols })
        setEditingColId(null)
      }
    } catch (e) {
      toast.error('Erro ao editar coluna')
    }
  }

  const deleteColumn = async (colId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta coluna e todos os seus cards?')) return
    try {
      const res = await fetch(`/api/planejamentos/${id}/colunas/${colId}`, { method: 'DELETE' })
      if (res.ok) {
        setBoard({ ...board, colunas: board.colunas.filter((c: any) => c.id !== colId) })
      }
    } catch (e) {
      toast.error('Erro ao deletar coluna')
    }
  }

  const addCard = async (colunaId: string) => {
    if (!newCardTitle.trim()) return
    try {
      const res = await fetch(`/api/planejamentos/${id}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: newCardTitle, colunaId })
      })
      if (res.ok) {
        const { card } = await res.json()
        const newCols = board.colunas.map((col: any) => {
          if (col.id === colunaId) return { ...col, cards: [...col.cards, card] }
          return col
        })
        setBoard({ ...board, colunas: newCols })
        setNewCardTitle('')
        setAddingCardTo(null)
      }
    } catch (e) {
      toast.error('Erro ao criar card')
    }
  }

  const deleteCard = async (colunaId: string, cardId: string) => {
    if (!confirm('Excluir este card?')) return
    try {
      const res = await fetch(`/api/planejamentos/${id}/cards/${cardId}`, { method: 'DELETE' })
      if (res.ok) {
        const newCols = board.colunas.map((col: any) => {
          if (col.id === colunaId) return { ...col, cards: col.cards.filter((c: any) => c.id !== cardId) }
          return col
        })
        setBoard({ ...board, colunas: newCols })
      }
    } catch (e) {
      toast.error('Erro ao deletar card')
    }
  }

  const renderIconSelector = (currentIcon: string, onSelect: (i: string) => void) => (
    <div className={styles.iconSelector}>
      <button 
        type="button"
        className={`${styles.iconBtn} ${!currentIcon ? styles.active : ''}`}
        onClick={() => onSelect('')}
        title="Sem Ícone"
      >
        ×
      </button>
      {AVAILABLE_ICONS.map(iconName => {
        const IconComp = ICONS_MAP[iconName]
        return (
          <button
            key={iconName}
            type="button"
            className={`${styles.iconBtn} ${currentIcon === iconName ? styles.active : ''}`}
            onClick={() => onSelect(iconName)}
            title={iconName}
          >
            <IconComp size={16} />
          </button>
        )
      })}
    </div>
  )

  if (loading) return <div className={styles.loading}>Carregando quadro...</div>
  if (!board) return <div className={styles.loading}>Quadro não encontrado.</div>

  return (
    <div className={styles.boardContainer}>
      <header className={styles.boardHeader}>
        <div className={styles.headerLeft}>
          <Link href="/dashboard/planejamentos" className="btn btn-secondary btn-sm">← Voltar</Link>
          <div>
            <h1 style={{ margin: 0 }}>{board.titulo}</h1>
            {board.descricao && <p className="text-muted text-sm">{board.descricao}</p>}
          </div>
        </div>
      </header>

      <div className={styles.kanbanScroll}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="all-columns" direction="horizontal" type="column">
            {(provided) => (
              <div 
                className={styles.kanbanWrapper}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {board.colunas.map((coluna: any, index: number) => {
                  const ColIcon = coluna.icone && ICONS_MAP[coluna.icone] ? ICONS_MAP[coluna.icone] : null
                  
                  return (
                    <Draggable key={coluna.id} draggableId={coluna.id} index={index}>
                      {(provided, snapshot) => (
                        <div 
                          className={`${styles.column} ${snapshot.isDragging ? styles.isDragging : ''}`}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          {editingColId === coluna.id ? (
                            <div className={styles.columnHeader}>
                              <div className={styles.editColForm}>
                                <input 
                                  className={styles.inlineInput} 
                                  value={editColTitle} 
                                  onChange={(e) => setEditColTitle(e.target.value)} 
                                  autoFocus 
                                  placeholder="Título da coluna"
                                />
                                {renderIconSelector(editColIcon, setEditColIcon)}
                                <div className={styles.editColActions}>
                                  <button className={styles.btnPrimarySm} onClick={() => saveColumnEdit(coluna.id)}>Salvar</button>
                                  <button className={styles.btnCancelSm} onClick={() => setEditingColId(null)}>Cancelar</button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className={styles.columnHeader} {...provided.dragHandleProps}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {ColIcon && <span className={styles.iconDisplay}><ColIcon size={18} /></span>}
                                <h3 style={{ cursor: 'grab', userSelect: 'none' }}>{coluna.titulo}</h3>
                                <span className={styles.badge}>{coluna.cards.length}</span>
                              </div>
                              <div style={{ display: 'flex', gap: '0.2rem' }}>
                                <button className={styles.deleteBtn} onClick={() => { setEditingColId(coluna.id); setEditColTitle(coluna.titulo); setEditColIcon(coluna.icone || ''); }} title="Editar Coluna">
                                  <Pencil size={16} />
                                </button>
                                <button className={styles.deleteBtn} onClick={() => deleteColumn(coluna.id)} title="Excluir Coluna">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          )}
                          
                          <Droppable droppableId={coluna.id} type="card">
                            {(provided, snapshot) => (
                              <div 
                                className={styles.cardList}
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                style={{ backgroundColor: snapshot.isDraggingOver ? 'rgba(255,255,255,0.02)' : 'transparent', minHeight: '10px' }}
                              >
                                {coluna.cards.map((card: any, cardIndex: number) => (
                                  <Draggable key={card.id} draggableId={card.id} index={cardIndex}>
                                    {(provided, snapshot) => (
                                      <div 
                                        className={`${styles.card} ${snapshot.isDragging ? styles.isDragging : ''}`}
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                      >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                          <h4 style={{ cursor: 'grab' }}>{card.titulo}</h4>
                                          <button className={styles.deleteBtn} onClick={() => deleteCard(coluna.id, card.id)} title="Excluir Card">
                                            <Trash2 size={14} />
                                          </button>
                                        </div>
                                        {card.descricao && <p>{card.descricao}</p>}
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>

                          {addingCardTo === coluna.id ? (
                            <div className={styles.inlineForm}>
                              <input 
                                type="text" 
                                className={styles.inlineInput} 
                                autoFocus 
                                placeholder="Título do card..." 
                                value={newCardTitle} 
                                onChange={(e) => setNewCardTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addCard(coluna.id)}
                              />
                              <div className={styles.inlineActions}>
                                <button className={styles.btnPrimarySm} onClick={() => addCard(coluna.id)}>Adicionar</button>
                                <button className={styles.btnCancelSm} onClick={() => setAddingCardTo(null)}>×</button>
                              </div>
                            </div>
                          ) : (
                            <button className={styles.addCardBtn} onClick={() => { setAddingCardTo(coluna.id); setNewCardTitle(''); }}>
                              + Adicionar Card
                            </button>
                          )}
                        </div>
                      )}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
                
                {/* Botão de Add Coluna */}
                <div className={styles.addColumn}>
                  {addingCol ? (
                    <div className={`${styles.column} ${styles.inlineFormCol}`} style={{ padding: '1rem' }}>
                      <input 
                        type="text" 
                        className={styles.inlineInput} 
                        autoFocus 
                        placeholder="Nome da coluna..." 
                        value={newColTitle} 
                        onChange={(e) => setNewColTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addColumn()}
                      />
                      {renderIconSelector(newColIcon, setNewColIcon)}
                      <div className={styles.inlineActions}>
                        <button className={styles.btnPrimarySm} onClick={addColumn}>Adicionar</button>
                        <button className={styles.btnCancelSm} onClick={() => setAddingCol(false)}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <button className={styles.addColumnBtn} onClick={() => { setAddingCol(true); setNewColTitle(''); setNewColIcon(''); }}>+ Adicionar Coluna</button>
                  )}
                </div>

              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  )
}
