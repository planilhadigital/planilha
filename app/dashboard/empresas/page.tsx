import styles from '../page.module.css'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export default async function EmpresasPage() {
  const session = await getServerSession(authOptions)
  
  let empresas: any[] = []
  if (session?.user?.id) {
    empresas = await prisma.empresa.findMany({
      where: { usuarios: { some: { id: session.user.id } } },
      orderBy: { createdAt: 'desc' }
    })
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Todas as Empresas</h1>
          <p className={styles.pageSubtitle}>Gerencie todas as empresas da sua agência</p>
        </div>
        <Link href="/dashboard/empresas/nova" className="btn btn-primary">
          + Nova Empresa
        </Link>
      </div>

      <div className="card">
        <div className={styles.empresaList}>
          {empresas.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Nenhuma empresa cadastrada ainda.
            </div>
          ) : (
            empresas.map((e) => (
              <Link href={`/dashboard/empresas/${e.id}`} key={e.id} className={styles.empresaItem}>
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
      </div>
    </div>
  )
}
