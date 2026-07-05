import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const planejamentos = await prisma.planejamento.findMany({
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

    const { titulo, descricao } = await request.json()

    if (!titulo) {
      return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 })
    }

    const novo = await prisma.planejamento.create({
      data: {
        titulo,
        descricao,
        criadoPor: session.user.name || session.user.email
      }
    })

    return NextResponse.json(novo, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar planejamento:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
