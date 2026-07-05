import { prisma } from '@/lib/prisma'
import { getInstagramInsights, getInstagramProfile } from '@/lib/meta'
import styles from './page.module.css'
import ClientChart from './ClientChart' // Precisaremos extrair o Recharts para um Client Component

export default async function PublicReportPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ days?: string }> }) {
  const { id } = await params
  const searchParamsObj = await searchParams
  const days = searchParamsObj.days ? parseInt(searchParamsObj.days, 10) : 28

  // Busca a empresa
  const empresa = await prisma.empresa.findUnique({
    where: { id },
    include: { usuarios: true }
  })

  if (!empresa || !empresa.igAccountId) {
    return (
      <div className={styles.errorContainer}>
        <h1>Relatório Indisponível</h1>
        <p>A empresa não foi encontrada ou não possui integração ativa com o Instagram.</p>
      </div>
    )
  }

  // Pega a conta conectada de um dos donos da empresa (como é MVP, pegamos o primeiro usuário)
  const dono = empresa.usuarios[0]
  const account = await prisma.contaConectada.findFirst({
    where: { userId: dono.id, provider: 'facebook' }
  })

  if (!account) {
    return (
      <div className={styles.errorContainer}>
        <h1>Relatório Indisponível</h1>
        <p>Problema de credenciais da agência responsável.</p>
      </div>
    )
  }

  const profile = await getInstagramProfile(empresa.igAccountId, account.access_token)
  const insights = await getInstagramInsights(empresa.igAccountId, account.access_token, days)

  return (
    <div className={styles.reportPage}>
      <header className={styles.header}>
        <div className={styles.headerLogo}>planILHA Relatórios</div>
        <div className={styles.headerTitle}>Relatório de Desempenho</div>
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
