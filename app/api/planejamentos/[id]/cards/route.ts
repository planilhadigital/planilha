import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { titulo, colunaId } = body

    if (!titulo || !colunaId) {
      return NextResponse.json({ error: 'Título e Coluna são obrigatórios' }, { status: 400 })
    }

    // Pega a última ordem
    const lastCard = await prisma.card.findFirst({
      where: { colunaId },
      orderBy: { ordem: 'desc' }
    })
    
    const novaOrdem = lastCard ? lastCard.ordem + 1 : 0

    const card = await prisma.card.create({
      data: {
        titulo,
        ordem: novaOrdem,
        colunaId
      }
    })

    return NextResponse.json({ card }, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar card:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
