import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: Request, { params }: { params: Promise<{ id: string, cardId: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    const { cardId } = await params
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        labels: true,
        checklists: { include: { itens: { orderBy: { ordem: 'asc' } } } },
        comentarios: { orderBy: { createdAt: 'asc' } },
        anexos: true,
      }
    })
    if (!card) return NextResponse.json({ error: 'Card não encontrado' }, { status: 404 })
    return NextResponse.json({ card })
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string, cardId: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { cardId } = await params

    await prisma.card.delete({
      where: { id: cardId }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao deletar card:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string, cardId: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { cardId } = await params
    const body = await request.json()
    const { titulo, descricao, dataVencimento } = body

    const dataToUpdate: any = {}
    if (titulo !== undefined) dataToUpdate.titulo = titulo
    if (descricao !== undefined) dataToUpdate.descricao = descricao
    if (dataVencimento !== undefined) dataToUpdate.dataVencimento = dataVencimento ? new Date(dataVencimento) : null

    const card = await prisma.card.update({
      where: { id: cardId },
      data: dataToUpdate
    })

    return NextResponse.json({ card })
  } catch (error: any) {
    console.error('Erro ao editar card:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
