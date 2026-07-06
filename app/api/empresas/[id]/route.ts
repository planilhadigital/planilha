import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { metaPageId, igAccountId, avatarUrl, coverUrl, websiteUrl, instagramUrl, facebookUrl } = body

    // Verifica se a empresa existe e o usuário tem acesso
    const empresa = await prisma.empresa.findFirst({
      where: {
        id,
        usuarios: { some: { id: session.user.id } }
      }
    })

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada ou sem acesso' }, { status: 404 })
    }

    // Atualiza a empresa
    const empresaAtualizada = await prisma.empresa.update({
      where: { id },
      data: {
        metaPageId: metaPageId !== undefined ? metaPageId : empresa.metaPageId,
        igAccountId: igAccountId !== undefined ? igAccountId : empresa.igAccountId,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : empresa.avatarUrl,
        coverUrl: coverUrl !== undefined ? coverUrl : empresa.coverUrl,
        websiteUrl: websiteUrl !== undefined ? websiteUrl : empresa.websiteUrl,
        instagramUrl: instagramUrl !== undefined ? instagramUrl : empresa.instagramUrl,
        facebookUrl: facebookUrl !== undefined ? facebookUrl : empresa.facebookUrl,
        status: metaPageId ? 'Conectado' : 'Ativo',
        statusType: metaPageId ? 'success' : 'success'
      }
    })

    return NextResponse.json(empresaAtualizada)
  } catch (error: any) {
    console.error('Erro ao atualizar empresa:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    const empresa = await prisma.empresa.findFirst({
      where: {
        id,
        usuarios: { some: { id: session.user.id } }
      },
      include: {
        relatoriosGerados: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    return NextResponse.json(empresa)
  } catch (error: any) {
    console.error('Erro ao buscar empresa:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
