import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const planejamento = await prisma.planejamento.findUnique({
      where: { id: params.id },
      include: {
        colunas: {
          orderBy: { ordem: 'asc' },
          include: {
            cards: {
              orderBy: { ordem: 'asc' }
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
