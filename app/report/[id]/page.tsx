import { prisma } from '@/lib/prisma'
import styles from './page.module.css'
import ClientChart from '@/app/report/[id]/ClientChart'
import PrintButton from './PrintButton'
import CopyLinkButton from '@/components/reports/CopyLinkButton'
import HeroHighlight from '@/components/reports/blocks/HeroHighlight'
import StandardGrid from '@/components/reports/blocks/StandardGrid'
import PostShowcase from '@/components/reports/blocks/PostShowcase'
import NarrativeFlow from '@/components/reports/blocks/NarrativeFlow'
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
    <div className={`${styles.presentationPage} ${aiAnalysis.template === 'ALERT_COMPACT' ? styles.themeAlert : aiAnalysis.template === 'GROWTH_HERO' ? styles.themeSuccess : ''}`}>
      <header className={styles.presentationHeader}>
        <div className={styles.headerBrand}>
          <img src={profile.avatar} alt="Avatar" className={styles.headerAvatar} />
          <div className={styles.headerTitles}>
            <h1>{empresa.name}</h1>
            <span className={styles.headerSubtitle}>Resultados {relatorio.platform || 'INSTAGRAM'} • Últimos {days} dias</span>
          </div>
        </div>
        <div className={styles.headerControls}>
          <CopyLinkButton />
          <PrintButton />
        </div>
      </header>

      {isDemo && (
        <div style={{ background: 'var(--color-danger)', color: 'white', textAlign: 'center', padding: '0.5rem', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }} className="no-print">
          DADOS DE DEMONSTRAÇÃO - VINCULE A CONTA PARA DADOS REAIS
        </div>
      )}

      <main className={styles.presentationBody}>
        
        {/* Renderiza o Headline e o Insight Summary gerados pela IA */}
        <section className={styles.slide} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{aiAnalysis.headline}</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>{aiAnalysis.insight_summary}</p>
        </section>

        {aiAnalysis.slides?.map((slide: any, idx: number) => {
          if (slide.component_type === 'HeroHighlight') {
            return <HeroHighlight key={idx} title={slide.title} properties={slide.properties} />
          }
          if (slide.component_type === 'StandardGrid') {
            return <StandardGrid key={idx} title={slide.title} properties={slide.properties} />
          }
          if (slide.component_type === 'PostShowcase') {
            return <PostShowcase key={idx} properties={slide.properties} />
          }
          if (slide.component_type === 'NarrativeFlow') {
            return <NarrativeFlow key={idx} title={slide.title} properties={slide.properties} />
          }
          return null
        })}

        {/* Gráfico Visual de Suporte (Sempre renderizado se houver histórico) */}
        {insights.history && insights.history.length > 0 && aiAnalysis.template !== 'ALERT_COMPACT' && (
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
