import styles from './page.module.css'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const kpis = [
  { label: 'Empresas Ativas',    value: '0',     delta: '+0 este mês',    positive: true,  icon: '🏢', accent: false },
  { label: 'Posts Agendados',    value: '0',     delta: '+0 esta semana', positive: true, icon: '📅', accent: false },
  { label: 'Relatórios Gerados', value: '0',     delta: '+0 este mês',    positive: true,  icon: '📊', accent: false },
  { label: 'Leads Rastreados',   value: '0',     delta: '+0 este mês',  positive: true,  icon: '🎯', accent: true  },
]

const atividades = [
  { text: 'Bem-vindo ao planILHA! Comece adicionando sua primeira empresa.', time: 'agora', icon: '👋' },
]

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  let empresas: any[] = []
  let totalLeads = 0
  if (session?.user?.id) {
    empresas = await prisma.empresa.findMany({
      where: { usuarios: { some: { id: session.user.id } } },
      orderBy: { createdAt: 'desc' }
    })
    
    // Contar total de leads das empresas que ele tem acesso
    const empresaIds = empresas.map(e => e.id)
    if (empresaIds.length > 0) {
      totalLeads = await prisma.lead.count({
        where: { empresaId: { in: empresaIds } }
      })
    }
  }
  
  // Atualiza os KPIs reais
  kpis[0].value = empresas.length.toString()
  kpis[3].value = totalLeads.toString()

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubtitle}>Visão geral da sua agência — julho 2026</p>
        </div>
        <Link href="/dashboard/empresas/nova" className="btn btn-primary" id="add-empresa-btn">
          + Nova Empresa
        </Link>
      </div>

      {/* KPIs */}
      <section className={styles.kpiGrid}>
        {kpis.map((kpi, i) => (
          <div key={kpi.label} className={`card ${kpi.accent ? 'card-accent' : ''} ${styles.kpiCard} anim-fade-up anim-delay-${i + 1}`}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiIcon}>{kpi.icon}</span>
              <span className="card-title">{kpi.label}</span>
            </div>
            <div className="card-value">{kpi.value}</div>
            <div className={`card-delta ${kpi.positive ? 'positive' : 'negative'}`}>
              {kpi.positive ? '↑' : '↓'} {kpi.delta}
            </div>
          </div>
        ))}
      </section>

      {/* Main grid */}
      <div className={styles.mainGrid}>
        {/* Empresas */}
        <section className={`card ${styles.empresasCard}`}>
          <div className="card-header">
            <h2 className={styles.sectionTitle}>Empresas</h2>
            <Link href="/dashboard/empresas" className="btn btn-ghost btn-sm" id="ver-todas-empresas-btn">Ver todas →</Link>
          </div>
          <div className={styles.empresaList}>
            {empresas.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Nenhuma empresa cadastrada ainda.
              </div>
            ) : (
              empresas.map((e) => (
                <Link href={`/dashboard/empresas/${e.id}`} key={e.id} className={styles.empresaItem} id={`empresa-${e.name.replace(/\s+/g, '-').toLowerCase()}`}>
                  <div className={styles.empresaAvatar}>
                    {e.avatarUrl ? (
                      <img src={e.avatarUrl} alt={e.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      e.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className={styles.empresaInfo}>
                    <span className={styles.empresaName}>{e.name}</span>
                    <span className={styles.empresaPlatform}>{e.platform}</span>
                  </div>
                  <div className={styles.empresaMeta}>
                    <span className={`badge badge-${e.statusType}`}>{e.status}</span>
                    <span className={styles.empresaPosts}>-- posts</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Atividade recente */}
        <section className={`card ${styles.activityCard}`}>
          <div className="card-header">
            <h2 className={styles.sectionTitle}>Atividade Recente</h2>
          </div>
          <div className={styles.activityList}>
            {atividades.map((a, i) => (
              <div key={i} className={styles.activityItem}>
                <span className={styles.activityIcon}>{a.icon}</span>
                <div className={styles.activityBody}>
                  <p className={styles.activityText}>{a.text}</p>
                  <span className={styles.activityTime}>{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Acesso rápido */}
      <section className={styles.quickAccess}>
        <h2 className={styles.sectionTitle} style={{ marginBottom: '1rem' }}>Acesso Rápido</h2>
        <div className={styles.quickGrid}>
          {[
            { label: 'Gerar Relatório',   icon: '📊', desc: 'Selecione empresa e período', id: 'quick-report-btn' },
            { label: 'Programar Post',    icon: '✏️', desc: 'Criar e agendar conteúdo',   id: 'quick-post-btn' },
            { label: 'Novo Planejamento', icon: '📋', desc: 'Criar quadro Kanban',        id: 'quick-plan-btn' },
            { label: 'Convidar Cliente',  icon: '🔗', desc: 'Gerar link de acesso',       id: 'quick-invite-btn' },
          ].map((q) => (
            <button key={q.label} className={`card ${styles.quickCard}`} id={q.id}>
              <span className={styles.quickIcon}>{q.icon}</span>
              <span className={styles.quickLabel}>{q.label}</span>
              <span className={styles.quickDesc}>{q.desc}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
