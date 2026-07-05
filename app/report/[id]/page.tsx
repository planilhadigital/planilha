import { prisma } from '@/lib/prisma'
import styles from './page.module.css'
import ClientChart from '@/app/report/[id]/ClientChart'
import PrintButton from './PrintButton'
import CopyLinkButton from '@/components/reports/CopyLinkButton'

export default async function PublicReportPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ days?: string }> }) {
  const { id } = await params
  const relatorio = await prisma.relatorioGerado.findUnique({
    where: { id },
    include: { empresa: true }
  })

  if (!relatorio) {
    return (
      <div className={styles.errorContainer}>
        <h1>Relatório Indisponível</h1>
        <p>O relatório não foi encontrado ou foi excluído.</p>
      </div>
    )
  }

  const empresa = relatorio.empresa
  const days = relatorio.dias
  const dados = relatorio.dadosCongelados as any
  
  const isDemo = dados.isDemo
  const profile = dados.profile
  const insights = dados.insights
  const aiAnalysis = dados.aiAnalysis

  return (
    <div className={styles.presentationPage}>
      <header className={styles.presentationHeader}>
        <div className={styles.headerBrand}>
          <img src={profile.avatar} alt="Avatar" className={styles.headerAvatar} />
          <div className={styles.headerTitles}>
            <h1>{empresa.name}</h1>
            <span className={styles.headerSubtitle}>Resultados Instagram • Últimos {days} dias</span>
          </div>
        </div>
        <div className={styles.headerControls}>
          {isDemo && <span className={styles.demoBadge}>Demo</span>}
          <CopyLinkButton />
          <PrintButton />
        </div>
      </header>

      <main className={styles.presentationBody}>
        {/* Slide 1: O Grande Destaque (Gerado por IA) */}
        <section className={`${styles.slide} ${styles.slideHighlight}`}>
          <div className={styles.slideGlow}></div>
          <h2 className={styles.punchline}>"{aiAnalysis.punchline}"</h2>
          
          <div className={styles.highlightBox}>
            <span className={styles.highlightLabel}>{aiAnalysis.mainHighlight.label}</span>
            <span className={styles.highlightValue}>{aiAnalysis.mainHighlight.value}</span>
          </div>
          
          <p className={styles.narrative}>{aiAnalysis.narrative}</p>
        </section>

        {/* Slide 2: Números Reais (Grid de KPIs) */}
        <section className={`${styles.slide} ${styles.slideMetrics}`}>
          <div className={styles.kpiBox}>
            <span className={styles.kpiTitle}>Alcance Total</span>
            <div className={styles.kpiNumber}>
              {insights.total.reach.toLocaleString()}
              {insights.total.reachDelta !== undefined && (
                <span className={`${styles.delta} ${insights.total.reachDelta >= 0 ? styles.deltaUp : styles.deltaDown}`}>
                  {insights.total.reachDelta >= 0 ? '↑' : '↓'}{Math.abs(insights.total.reachDelta).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          <div className={styles.kpiBox}>
            <span className={styles.kpiTitle}>Impressões</span>
            <div className={styles.kpiNumber}>
              {insights.total.impressions.toLocaleString()}
              {insights.total.impressionsDelta !== undefined && (
                <span className={`${styles.delta} ${insights.total.impressionsDelta >= 0 ? styles.deltaUp : styles.deltaDown}`}>
                  {insights.total.impressionsDelta >= 0 ? '↑' : '↓'}{Math.abs(insights.total.impressionsDelta).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          <div className={styles.kpiBox}>
            <span className={styles.kpiTitle}>Seguidores</span>
            <div className={styles.kpiNumber}>{profile.followers.toLocaleString()}</div>
          </div>
          <div className={styles.kpiBox}>
            <span className={styles.kpiTitle}>Publicações</span>
            <div className={styles.kpiNumber}>{profile.postsCount.toLocaleString()}</div>
          </div>
        </section>

        {/* Slide 3: Gráfico Visual */}
        <section className={`${styles.slide} ${styles.slideChart}`}>
          <h3 className={styles.slideTitle}>Evolução Diária</h3>
          <div className={styles.chartContainer}>
            <ClientChart data={insights.history} />
          </div>
        </section>

        {/* Slide 4: Plano de Ação IA */}
        <section className={`${styles.slide} ${styles.slideAction}`}>
          <h3 className={styles.slideTitle}>Próximos Passos (Plano de Ação)</h3>
          <ul className={styles.actionList}>
            {aiAnalysis.actionPlan.map((step: string, i: number) => (
              <li key={i}><span className={styles.stepNumber}>{i + 1}</span> {step}</li>
            ))}
          </ul>
        </section>
      </main>

      <footer className={styles.presentationFooter}>
        <div className={styles.footerBranding}>
          <span style={{color: 'var(--accent)', fontWeight: 800, marginRight: '8px'}}>planILHA</span> Intelligence
        </div>
        <div>Uso executivo confidencial</div>
      </footer>
    </div>
  )
}
