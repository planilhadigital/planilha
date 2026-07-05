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
    const { titulo } = body

    if (!titulo) {
      return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 })
    }

    // Pega a última ordem
    const lastCol = await prisma.coluna.findFirst({
      where: { planejamentoId: id },
      orderBy: { ordem: 'desc' }
    })
    
    const novaOrdem = lastCol ? lastCol.ordem + 1 : 0

    const coluna = await prisma.coluna.create({
      data: {
        titulo,
        ordem: novaOrdem,
        planejamentoId: id
      },
      include: {
        cards: true
      }
    })

    return NextResponse.json({ coluna }, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar coluna:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
