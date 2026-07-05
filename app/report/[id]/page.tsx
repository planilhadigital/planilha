import { prisma } from '@/lib/prisma'
import { getInstagramInsights, getInstagramProfile } from '@/lib/meta'
import styles from './page.module.css'
import ClientChart from './ClientChart' 
import PrintButton from './PrintButton'

export default async function PublicReportPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ days?: string }> }) {
  const { id } = await params
  const searchParamsObj = await searchParams
  const days = searchParamsObj.days ? parseInt(searchParamsObj.days, 10) : 28

  // Busca a empresa
  const empresa = await prisma.empresa.findUnique({
    where: { id },
    include: { usuarios: true }
  })

  if (!empresa) {
    return (
      <div className={styles.errorContainer}>
        <h1>Relatório Indisponível</h1>
        <p>A empresa não foi encontrada.</p>
      </div>
    )
  }

  let profile = null
  let insights = null
  let isDemo = false

  if (empresa.igAccountId) {
    const dono = empresa.usuarios[0]
    const account = await prisma.account.findFirst({
      where: { userId: dono?.id, provider: 'facebook' }
    })

    if (account) {
      try {
        profile = await getInstagramProfile(empresa.igAccountId, account.access_token as string)
        insights = await getInstagramInsights(empresa.igAccountId, account.access_token as string, days)
      } catch (err) {
        console.error('Erro ao buscar dados reais, ativando demo:', err)
        isDemo = true
      }
    } else {
      isDemo = true
    }
  } else {
    isDemo = true
  }

  // Dados Mock para Demo
  if (isDemo || !profile || !insights) {
    isDemo = true
    profile = {
      username: empresa.name.toLowerCase().replace(/\s+/g, ''),
      avatar: empresa.avatarUrl || 'https://via.placeholder.com/150',
      followers: 12543,
      postsCount: 342
    }
    
    const history = []
    const baseDate = new Date()
    baseDate.setDate(baseDate.getDate() - days)
    
    for (let i = 0; i < days; i++) {
      const dt = new Date(baseDate)
      dt.setDate(dt.getDate() + i)
      history.push({
        date: dt.toISOString().split('T')[0],
        reach: Math.floor(Math.random() * 500) + 1000 + (i * 20),
        impressions: Math.floor(Math.random() * 800) + 1500 + (i * 30),
      })
    }

    insights = {
      total: {
        reach: 45230,
        reachDelta: 12.5,
        impressions: 78900,
        impressionsDelta: 8.2,
      },
      history
    }
  }

  return (
    <div className={styles.reportPage}>
      <header className={styles.header}>
        <div className={styles.headerLogo}>planILHA Relatórios</div>
        <div className={styles.headerControls} style={{ display: 'flex', alignItems: 'center' }}>
          <div className={styles.headerTitle}>
            Relatório de Desempenho 
            {isDemo && <span style={{fontSize: '0.8rem', background: '#3b2313', color: '#ff7b00', padding: '0.2rem 0.5rem', borderRadius: '4px', marginLeft: '0.5rem'}}>Demo</span>}
          </div>
          <PrintButton />
        </div>
      </header>

      <div className={styles.content}>
        {profile && (
          <div className={styles.profileCard}>
            <img src={profile.avatar} alt="Avatar" className={styles.avatar} />
            <div className={styles.profileInfo}>
              <h2>@{profile.username}</h2>
              <p>Relatório focado nos últimos {days} dias.</p>
            </div>
            <div className={styles.stats}>
              <div><strong>{profile.followers}</strong> Seguidores</div>
              <div><strong>{profile.postsCount}</strong> Publicações</div>
            </div>
          </div>
        )}

        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>Alcance Total ({days}D)</span>
            <div className={styles.kpiValue}>
              {insights.total.reach}
              {insights.total.reachDelta !== undefined && (
                <span className={`${styles.deltaBadge} ${insights.total.reachDelta >= 0 ? styles.deltaUp : styles.deltaDown}`}>
                  {insights.total.reachDelta >= 0 ? '↑' : '↓'} {Math.abs(insights.total.reachDelta).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>Impressões Totais ({days}D)</span>
            <div className={styles.kpiValue}>
              {insights.total.impressions}
              {insights.total.impressionsDelta !== undefined && (
                <span className={`${styles.deltaBadge} ${insights.total.impressionsDelta >= 0 ? styles.deltaUp : styles.deltaDown}`}>
                  {insights.total.impressionsDelta >= 0 ? '↑' : '↓'} {Math.abs(insights.total.impressionsDelta).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.chartSection}>
          <h3>Evolução de Crescimento</h3>
          <div className={styles.chartWrapper}>
            <ClientChart data={insights.history} />
          </div>
        </div>
      </div>
      
      <footer className={styles.footer}>
        <p>Gerado por <strong>planILHA</strong> - Otimizado para impressão (CTRL+P).</p>
      </footer>
    </div>
  )
}
