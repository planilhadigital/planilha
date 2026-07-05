import styles from './page.module.css'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Settings, Users, Link as LinkIcon, Shield } from 'lucide-react'

export default async function ConfiguracoesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return <div>Não autorizado</div>
  }

  // Busca os usuários autorizados
  const authorizedUsers = await prisma.user.findMany()

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Configurações Globais</h1>
          <p className={styles.pageSubtitle}>Gerencie acessos, integrações e a agência</p>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Integração Meta */}
        <section className="card anim-fade-up anim-delay-1">
          <div className="card-header">
            <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LinkIcon size={18} /> Integração Meta (Global)
            </h2>
          </div>
          <p className="text-muted text-sm" style={{ marginBottom: '1.5rem' }}>
            Renove o token global do Facebook Login for Business da agência. Todas as empresas vinculadas dependem deste acesso principal.
          </p>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Renovar Token Meta API
          </button>
        </section>

        {/* Segurança e Acesso */}
        <section className="card anim-fade-up anim-delay-2">
          <div className="card-header">
            <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} /> Segurança
            </h2>
          </div>
          <p className="text-muted text-sm" style={{ marginBottom: '1.5rem' }}>
            Suas sessões ativas e configuração de domínio White-Label (Em breve).
          </p>
          <div className="input-group">
            <label className="input-label">Domínio Personalizado (WIP)</label>
            <input type="text" className="input" placeholder="ex: relatorios.suaagencia.com.br" disabled />
          </div>
        </section>

        {/* Gerenciamento de Equipe */}
        <section className="card anim-fade-up anim-delay-3" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} /> Equipe Interna
            </h2>
            <button className="btn btn-secondary btn-sm">+ Convidar Membro</button>
          </div>
          
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>E-mail</th>
                  <th>Papel</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {authorizedUsers.map((u: any) => (
                  <tr key={u.email}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.email}</td>
                    <td><span className="badge badge-accent">{u.role}</span></td>
                    <td><span className="badge badge-success">Ativo</span></td>
                  </tr>
                ))}
                {authorizedUsers.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      Nenhum membro cadastrado. Apenas você tem acesso de Admin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
