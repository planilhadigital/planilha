'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'

export default function QuadroPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [board, setBoard] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/planejamentos/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setBoard(data.planejamento)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

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
        <div className={styles.headerRight}>
          <button className="btn btn-primary" onClick={() => alert('Em breve: Editar Quadro')}>Configurações</button>
        </div>
      </header>

      <div className={styles.kanbanScroll}>
        <div className={styles.kanbanWrapper}>
          {board.colunas.map((coluna: any) => (
            <div key={coluna.id} className={styles.column}>
              <div className={styles.columnHeader}>
                <h3>{coluna.titulo}</h3>
                <span className={styles.badge}>{coluna.cards.length}</span>
              </div>
              
              <div className={styles.cardList}>
                {coluna.cards.map((card: any) => (
                  <div key={card.id} className={styles.card}>
                    <h4>{card.titulo}</h4>
                    {card.descricao && <p>{card.descricao}</p>}
                  </div>
                ))}
              </div>

              <button className={styles.addCardBtn} onClick={() => alert('Em breve: Adicionar card')}>
                + Adicionar Card
              </button>
            </div>
          ))}
          <div className={styles.addColumn}>
            <button className={styles.addColumnBtn}>+ Adicionar Coluna</button>
          </div>
        </div>
      </div>
    </div>
  )
}
