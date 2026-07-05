import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { id } = await params

    const empresa = await prisma.empresa.findFirst({
      where: { id, usuarios: { some: { id: session.user.id } } }
    })

    if (!empresa) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })

    const leads = await prisma.lead.findMany({
      where: { empresaId: id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ leads })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { id } = await params
    const { nome, email, telefone, origem, status } = await request.json()

    if (!nome) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 })

    const empresa = await prisma.empresa.findFirst({
      where: { id, usuarios: { some: { id: session.user.id } } }
    })

    if (!empresa) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })

    const novoLead = await prisma.lead.create({
      data: {
        empresaId: id,
        nome,
        email,
        telefone,
        origem: origem || 'Manual',
        status: status || 'Novo'
      }
    })

    return NextResponse.json(novoLead, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
