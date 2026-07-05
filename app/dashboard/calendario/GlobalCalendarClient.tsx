'use client'

import { useState } from 'react'
import { FaInstagram, FaFacebook } from 'react-icons/fa'
import { Film, Layout, Copy, Image as ImageIcon } from 'lucide-react'
import styles from '../empresas/[id]/page.module.css'

export default function GlobalCalendarClient({ posts, empresas }: { posts: any[], empresas: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filterEmpresaId, setFilterEmpresaId] = useState('')

  const generateCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - startDate.getDay())
    
    const endDate = new Date(lastDay)
    if (endDate.getDay() !== 6) {
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))
    }
    
    const days = []
    let tempDate = new Date(startDate)
    while (tempDate <= endDate) {
      days.push(new Date(tempDate))
      tempDate.setDate(tempDate.getDate() + 1)
    }
    return days
  }

  const calendarDays = generateCalendar()

  const formatIcon = (fmt: string) => {
    switch (fmt) {
      case 'Reels': return <Film size={12} />
      case 'Stories': return <Copy size={12} />
      case 'Carrossel': return <ImageIcon size={12} />
      default: return <Layout size={12} />
    }
  }

  return (
    <div className={`${styles.calendarWrapper} anim-fade-up`}>
      <div className={styles.calendarHeader} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <button className="btn btn-icon" onClick={() => {
            const d = new Date(currentDate)
            d.setMonth(d.getMonth() - 1)
            setCurrentDate(d)
          }}>&lt;</button>
          
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
            {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
          </h2>
          
          <button className="btn btn-icon" onClick={() => {
            const d = new Date(currentDate)
            d.setMonth(d.getMonth() + 1)
            setCurrentDate(d)
          }}>&gt;</button>
        </div>

        <div style={{ alignSelf: 'flex-start', width: '100%', maxWidth: '300px' }}>
          <select 
            className="input" 
            value={filterEmpresaId} 
            onChange={e => setFilterEmpresaId(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-deep)' }}
          >
            <option value="">Todas as Empresas</option>
            {empresas.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>

      </div>

      <div className={styles.calendarGrid}>
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
          <div key={d} className={styles.calendarDayHeader}>{d}</div>
        ))}
        
        {calendarDays.map((day, idx) => {
          const isOtherMonth = day.getMonth() !== currentDate.getMonth()
          const isToday = day.toDateString() === new Date().toDateString()
          
          // Filtra os posts desse dia
          const dayPosts = posts.filter(p => {
            const isSameDay = new Date(p.dataHora).toDateString() === day.toDateString()
            const matchEmpresa = filterEmpresaId ? p.empresaId === filterEmpresaId : true
            return isSameDay && matchEmpresa
          })

          return (
            <div key={idx} className={styles.calendarCell} data-other-month={isOtherMonth} data-today={isToday}>
              <div className={styles.dayNumber}>{day.getDate()}</div>
              {dayPosts.map(post => {
                const emp = empresas.find(e => e.id === post.empresaId)
                return (
                  <div key={post.id} className={styles.calendarPostPill} style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }} title={`${emp?.name}: ${post.legenda || 'Sem legenda'}`}>
                    {emp?.avatarUrl ? (
                       <img src={emp.avatarUrl} alt={emp.name} style={{ width: 14, height: 14, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                       <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--border)', fontSize: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         {emp?.name.charAt(0)}
                       </div>
                    )}
                    {post.rede.includes('Insta') ? <FaInstagram size={10} color="#FA4616" /> : <FaFacebook size={10} color="#3B82F6" />}
                    <span style={{ color: 'var(--text-muted)' }}>{formatIcon(post.formato || 'Feed')}</span>
                    <span style={{ fontWeight: 500, fontSize: '0.7rem' }}>
                      {new Date(post.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
