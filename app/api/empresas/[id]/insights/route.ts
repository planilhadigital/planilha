import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getInstagramInsights, getInstagramProfile } from '@/lib/meta'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Pega a empresa e verifica acesso
    const empresa = await prisma.empresa.findFirst({
      where: {
        id,
        usuarios: { some: { id: session.user.id } }
      }
    })

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    // Pega o token global do usuário
    const account = await prisma.contaConectada.findFirst({
      where: { userId: session.user.id, provider: 'facebook' }
    })

    if (!account) {
      return NextResponse.json({ error: 'Conta do Facebook não conectada' }, { status: 400 })
    }

    if (!empresa.igAccountId) {
      return NextResponse.json({ error: 'Esta empresa não tem uma conta do Instagram Business vinculada.' }, { status: 400 })
    }

    // Pega o parametro days da URL (ex: ?days=7), default 28
    const { searchParams } = new URL(request.url)
    const daysParam = searchParams.get('days')
    const days = daysParam ? parseInt(daysParam, 10) : 28

    // Busca dados reais
    const profile = await getInstagramProfile(empresa.igAccountId, account.access_token)
    const insights = await getInstagramInsights(empresa.igAccountId, account.access_token, days)

    return NextResponse.json({
      profile,
      insights
    })

  } catch (error: any) {
    console.error('Erro ao buscar insights:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
