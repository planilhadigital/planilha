import styles from './empresas.module.css'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { ArrowRight } from 'lucide-react'

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
      <div className={styles.header}>
        <div className="anim-fade-up">
          <h1 className={styles.title}>Todas as Empresas</h1>
          <p className={styles.subtitle}>Gerencie o perfil e integrações dos seus clientes.</p>
        </div>
        <div className="anim-fade-up">
          <Link href="/dashboard/empresas/nova" className="btn btn-primary">
            + Nova Empresa
          </Link>
        </div>
      </div>

      {empresas.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: 'var(--r-xl)' }} className="anim-fade-up anim-delay-1">
          Nenhuma empresa cadastrada ainda. Clique no botão acima para adicionar seu primeiro cliente.
        </div>
      ) : (
        <div className={`${styles.grid} anim-fade-up anim-delay-1`}>
          {empresas.map((e) => (
            <Link href={`/dashboard/empresas/${e.id}`} key={e.id} className={`card ${styles.card}`}>
              {e.avatarUrl ? (
                <img src={e.avatarUrl} alt={e.name} className={styles.avatar} />
              ) : (
                <div className={styles.avatar}>
                  {e.name.charAt(0).toUpperCase()}
                </div>
              )}
              
              <div className={styles.info}>
                <h3 className={styles.name}>{e.name}</h3>
                <span className={styles.integrationStatus}>
                  Integração Meta: <span className={`${styles.statusDot} ${e.metaPageId ? styles.dotActive : styles.dotInactive}`}></span>
                </span>
              </div>
              
              <div className={styles.meta}>
                <span className={`badge badge-${e.statusType}`}>{e.status}</span>
                <span className={styles.arrow}><ArrowRight size={18} /></span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
