import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import GlobalPostCreator from './GlobalPostCreator'

export default async function GlobalPostsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const empresas = await prisma.empresa.findMany({
    where: { usuarios: { some: { id: session.user.id } } },
    select: { id: true, name: true, avatarUrl: true },
    orderBy: { name: 'asc' }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Programar Posts (Agência)
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Agende conteúdo para qualquer cliente sem sair desta tela.
        </p>
      </header>

      {empresas.length === 0 ? (
        <div className="alert-warning">
          Você precisa ter pelo menos uma empresa cadastrada para programar posts.
        </div>
      ) : (
        <GlobalPostCreator empresas={empresas} />
      )}
    </div>
  )
}
