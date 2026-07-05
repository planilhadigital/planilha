import styles from './page.module.css'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Settings, Users, Link as LinkIcon, Shield, CheckCircle2, AlertTriangle } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export default async function ConfiguracoesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return <div>Não autorizado</div>
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  const isMetaConnected = !!user?.metaAccessToken

  // Busca os usuários autorizados
  const authorizedUsers = await prisma.user.findMany()

  const isAdmin = session.user.role?.toLowerCase() === 'admin'

  async function disconnectMeta() {
    'use server'
    const s = await getServerSession(authOptions)
    if (!s?.user?.id) return
    const u = await prisma.user.findUnique({ where: { id: s.user.id } })
    if (u?.metaAccessToken) {
      // Deleta as permissões direto na Meta para garantir que no próximo login o usuário veja a tela de seleção
      await fetch(`https://graph.facebook.com/v19.0/me/permissions?access_token=${u.metaAccessToken}`, { method: 'DELETE' })
      await prisma.user.update({
        where: { id: u.id },
        data: { metaAccessToken: null, metaName: null, metaPhoto: null }
      })
    }
    revalidatePath('/dashboard/configuracoes')
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Configurações Globais</h1>
          <p className={styles.pageSubtitle}>Gerencie acessos e integrações</p>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {!isAdmin ? (
          <section className="card anim-fade-up">
            <div className="card-header">
              <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)' }}>
                <Shield size={18} /> Acesso Restrito
              </h2>
            </div>
            <p className="text-muted text-sm">
              As configurações globais de API, Domínio e Gestão de Membros são exclusivas para Administradores.
            </p>
          </section>
        ) : (
          <>
            {/* Integração Meta */}
            <section className="card anim-fade-up anim-delay-1">
              <div className="card-header">
                <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <LinkIcon size={18} /> Integração Meta (Global)
                </h2>
              </div>
              
              {isMetaConnected ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                    {user?.metaPhoto ? (
                      <img src={user.metaPhoto} alt={user.metaName || ''} style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
                    ) : (
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-deep)' }} />
                    )}
                    <div>
                      <h4 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {user.metaName} <CheckCircle2 size={16} color="var(--success)" />
                      </h4>
                      <span className="text-muted text-sm">Status: Conectado</span>
                    </div>
                  </div>
                  <p className="text-muted text-sm" style={{ marginBottom: '1.5rem' }}>
                    Para que novas páginas apareçam, é necessário desconectar e conectar novamente selecionando todas as páginas no popup do Facebook.
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <form action={disconnectMeta} style={{ flex: 1 }}>
                      <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', color: '#ff4444', borderColor: '#ff4444' }}>
                        Desconectar e Resetar
                      </button>
                    </form>
                    <a href="/api/meta/login" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}>
                      Reconectar Meta
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--warning)', padding: '0.75rem', background: 'rgba(250, 173, 20, 0.1)', borderRadius: 'var(--r-sm)' }}>
                    <AlertTriangle size={16} />
                    <span className="text-sm">Conta não conectada.</span>
                  </div>
                  <p className="text-muted text-sm" style={{ marginBottom: '1.5rem' }}>
                    Conecte a conta do Facebook que tem nível de permissão Administrador sobre as páginas e contas do Instagram dos clientes.
                  </p>
                  <a href="/api/meta/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>
                    Conectar com Facebook
                  </a>
                </>
              )}
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
          </>
        )}
      </div>
    </div>
  )
}
