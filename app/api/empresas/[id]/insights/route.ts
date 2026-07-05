import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getInstagramInsights, getInstagramProfile } from '@/lib/meta'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = params

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
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user?.metaAccessToken) {
      return NextResponse.json({ error: 'Conta da Meta não conectada globalmente' }, { status: 400 })
    }

    if (!empresa.igAccountId) {
      return NextResponse.json({ error: 'Esta empresa não tem uma conta do Instagram Business vinculada.' }, { status: 400 })
    }

    // Busca dados reais
    const profile = await getInstagramProfile(empresa.igAccountId, user.metaAccessToken)
    const insights = await getInstagramInsights(empresa.igAccountId, user.metaAccessToken)

    return NextResponse.json({
      profile,
      insights
    })

  } catch (error: any) {
    console.error('Erro ao buscar insights:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
