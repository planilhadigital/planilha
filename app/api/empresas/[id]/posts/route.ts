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
    
    // Verifica acesso à empresa
    const empresa = await prisma.empresa.findFirst({
      where: { id, usuarios: { some: { id: session.user.id } } }
    })

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    // Busca os posts agendados
    const posts = await prisma.postAgendado.findMany({
      where: { empresaId: id },
      orderBy: { dataHora: 'asc' }
    })

    return NextResponse.json({ posts })
  } catch (error: any) {
    console.error('Erro ao buscar posts:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    
    // Verifica acesso à empresa
    const empresa = await prisma.empresa.findFirst({
      where: { id, usuarios: { some: { id: session.user.id } } }
    })

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const { legenda, rede, dataHora, midiaUrl, formato, advancedConfig } = body

    if (!dataHora || !rede) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    const novoPost = await prisma.postAgendado.create({
      data: {
        empresaId: id,
        legenda,
        rede,
        formato: formato || 'Feed',
        dataHora: new Date(dataHora),
        midiaUrl,
        advancedConfig,
        criadoPor: session.user.name || session.user.email
      }
    })

    return NextResponse.json(novoPost, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao agendar post:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
