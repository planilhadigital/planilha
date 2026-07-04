import styles from './page.module.css'

const kpis = [
  { label: 'Empresas Ativas',    value: '12',     delta: '+2 este mês',    positive: true,  icon: '🏢', accent: false },
  { label: 'Posts Agendados',    value: '38',     delta: '+15 esta semana', positive: true, icon: '📅', accent: false },
  { label: 'Relatórios Gerados', value: '94',     delta: '+7 este mês',    positive: true,  icon: '📊', accent: false },
  { label: 'Leads Rastreados',   value: '5.2K',   delta: '+340 este mês',  positive: true,  icon: '🎯', accent: true  },
]

const empresas = [
  { name: 'Franquia Alpha SP',   platform: 'Instagram + Facebook', posts: 12, status: 'Ativo',    statusType: 'success' },
  { name: 'Rede Beta Nordeste',  platform: 'Instagram',            posts: 8,  status: 'Ativo',    statusType: 'success' },
  { name: 'Grupo Gama Central',  platform: 'Facebook',             posts: 3,  status: 'Pendente', statusType: 'warning' },
  { name: 'Delta Franquias SP',  platform: 'Instagram + Facebook', posts: 15, status: 'Ativo',    statusType: 'success' },
  { name: 'Epsilon Marketing',   platform: 'Instagram',            posts: 0,  status: 'Erro Meta',statusType: 'error'   },
]

const atividades = [
  { text: 'Relatório de junho gerado para Franquia Alpha SP', time: 'há 2h', icon: '📊' },
  { text: 'Post agendado: "Promoção de Verão" — Rede Beta',  time: 'há 4h', icon: '📅' },
  { text: 'Novo colaborador adicionado: maria@agencia.com',   time: 'há 6h', icon: '👤' },
  { text: 'Link de relatório enviado para cliente Delta',     time: 'ontem', icon: '🔗' },
  { text: 'Erro na publicação — Epsilon Marketing (token expirado)', time: 'ontem', icon: '⚠️' },
]

export default function DashboardPage() {
  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubtitle}>Visão geral da sua agência — julho 2026</p>
        </div>
        <button className="btn btn-primary" id="add-empresa-btn">
          + Nova Empresa
        </button>
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
            <button className="btn btn-ghost btn-sm" id="ver-todas-empresas-btn">Ver todas →</button>
          </div>
          <div className={styles.empresaList}>
            {empresas.map((e) => (
              <button key={e.name} className={styles.empresaItem} id={`empresa-${e.name.replace(/\s+/g, '-').toLowerCase()}`}>
                <div className={styles.empresaAvatar}>
                  {e.name.charAt(0)}
                </div>
                <div className={styles.empresaInfo}>
                  <span className={styles.empresaName}>{e.name}</span>
                  <span className={styles.empresaPlatform}>{e.platform}</span>
                </div>
                <div className={styles.empresaMeta}>
                  <span className={`badge badge-${e.statusType}`}>{e.status}</span>
                  <span className={styles.empresaPosts}>{e.posts} posts</span>
                </div>
              </button>
            ))}
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
