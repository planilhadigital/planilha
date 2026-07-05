import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const planejamento = await prisma.planejamento.findUnique({
      where: { id },
      include: {
        colunas: {
          orderBy: { ordem: 'asc' },
          include: {
            cards: {
              orderBy: { ordem: 'asc' },
              include: {
                labels: true,
                checklists: { include: { itens: true } },
                comentarios: { select: { id: true } },
                anexos: { select: { id: true } },
              }
            }
          }
        }
      }
    })

    if (!planejamento) {
      return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ planejamento })
  } catch (error: any) {
    console.error('Erro ao buscar planejamento:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
