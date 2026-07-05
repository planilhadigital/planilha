import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request: Request, { params }: { params: Promise<{ id: string, cardId: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { cardId } = await params
    const body = await request.json()
    const { nome, url } = body

    if (!nome || !url) {
      return NextResponse.json({ error: 'Nome e URL são obrigatórios' }, { status: 400 })
    }

    const anexo = await prisma.cardAnexo.create({
      data: {
        cardId,
        nome,
        url,
      }
    })

    return NextResponse.json({ anexo })
  } catch (error: any) {
    console.error('Erro ao adicionar anexo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string, cardId: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const url = new URL(request.url)
    const anexoId = url.searchParams.get('anexoId')

    if (!anexoId) {
      return NextResponse.json({ error: 'anexoId é obrigatório' }, { status: 400 })
    }

    await prisma.cardAnexo.delete({
      where: { id: anexoId }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao deletar anexo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
