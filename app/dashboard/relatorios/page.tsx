import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function GlobalReportsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const empresas = await prisma.empresa.findMany({
    where: { usuarios: { some: { id: session.user.id } } },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Hub de Relatórios
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Selecione uma empresa para visualizar ou exportar as métricas deste mês.
        </p>
      </header>

      {empresas.length === 0 ? (
        <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--r-md)', border: '1px dashed var(--border)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>🏢</div>
          <div style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Nenhuma empresa cadastrada</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {empresas.map(e => (
            <div key={e.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {e.avatarUrl ? (
                  <img src={e.avatarUrl} alt={e.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-deep)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {e.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{e.name}</h3>
                  <span className={`badge badge-${e.status === 'Ativo' ? 'success' : 'neutral'}`} style={{ marginTop: '0.25rem' }}>
                    {e.status}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <Link href={`/report/${e.id}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                  Gerar PDF
                </Link>
                <Link href={`/dashboard/empresas/${e.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                  Ver Métricas
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
