import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const empresaId = searchParams.get('empresaId')
    
    const whereClause = empresaId ? { empresaId } : {}

    const planejamentos = await prisma.planejamento.findMany({
      where: whereClause,
      include: {
        empresa: {
          select: { id: true, name: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ planejamentos })
  } catch (error: any) {
    console.error('Erro ao buscar planejamentos:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { titulo, descricao, empresaId } = await request.json()

    if (!titulo) {
      return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 })
    }

    const novo = await prisma.planejamento.create({
      data: {
        titulo,
        descricao,
        empresaId,
        criadoPor: session.user.name || session.user.email
      }
    })

    return NextResponse.json(novo, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar planejamento:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
