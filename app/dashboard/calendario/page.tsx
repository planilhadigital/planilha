import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import GlobalCalendarClient from './GlobalCalendarClient'

export default async function GlobalCalendarPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  // Puxa as empresas que o usuário tem acesso
  const empresas = await prisma.empresa.findMany({
    where: { usuarios: { some: { id: session.user.id } } },
    select: { id: true, name: true, avatarUrl: true }
  })

  const empresaIds = empresas.map(e => e.id)

  // Puxa todos os posts dessas empresas
  const posts = await prisma.postAgendado.findMany({
    where: { empresaId: { in: empresaIds } },
    orderBy: { dataHora: 'asc' }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Calendário Global
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Visualize e gerencie os posts agendados de todos os seus clientes em um único lugar.
        </p>
      </header>

      {empresas.length === 0 ? (
        <div className="alert-warning">
          Nenhuma empresa cadastrada para visualizar calendário.
        </div>
      ) : (
        <GlobalCalendarClient posts={posts} empresas={empresas} />
      )}
    </div>
  )
}
