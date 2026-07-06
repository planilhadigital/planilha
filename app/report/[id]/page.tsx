import { prisma } from '@/lib/prisma'
import styles from './page.module.css'
import ClientChart from '@/app/report/[id]/ClientChart'
import PrintButton from './PrintButton'
import CopyLinkButton from '@/components/reports/CopyLinkButton'
import HeroHighlight from '@/components/reports/blocks/HeroHighlight'
import StandardGrid from '@/components/reports/blocks/StandardGrid'
import TimelineCrisis from '@/components/reports/blocks/TimelineCrisis'
import PostShowcase from '@/components/reports/blocks/PostShowcase'

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
    <div className={`${styles.presentationPage} ${aiAnalysis.theme_mode === 'THEME_ALERT_DARK' ? styles.themeAlert : aiAnalysis.theme_mode === 'THEME_SUCCESS_GLOW' ? styles.themeSuccess : ''}`}>
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
        {aiAnalysis.ui_blueprint?.slides?.map((slide: any, idx: number) => {
          if (slide.component_type === 'HeroHighlight') {
            return <HeroHighlight key={idx} title={slide.title} properties={slide.properties} />
          }
          if (slide.component_type === 'TimelineCrisis') {
            return <TimelineCrisis key={idx} title={slide.title} properties={slide.properties} />
          }
          if (slide.component_type === 'StandardGrid') {
            return <StandardGrid key={idx} title={slide.title} properties={slide.properties} />
          }
          if (slide.component_type === 'PostShowcase') {
            return <PostShowcase key={idx} properties={slide.properties} />
          }
          return null
        })}

        {/* Gráfico Visual de Suporte (Sempre renderizado se houver histórico e o tema não for alerta crítico) */}
        {insights.history && insights.history.length > 0 && aiAnalysis.theme_mode !== 'THEME_ALERT_DARK' && (
          <section className={`${styles.slide} ${styles.slideChart}`}>
            <h3 className={styles.slideTitle}>Evolução Diária</h3>
            <div className={styles.chartContainer}>
              <ClientChart data={insights.history} />
            </div>
          </section>
        )}
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
