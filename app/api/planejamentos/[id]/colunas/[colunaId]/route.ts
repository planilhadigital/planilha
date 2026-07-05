import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string, colunaId: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { colunaId } = await params

    await prisma.coluna.delete({
      where: { id: colunaId }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao deletar coluna:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string, colunaId: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { colunaId } = await params
    const body = await request.json()
    const { titulo } = body

    const coluna = await prisma.coluna.update({
      where: { id: colunaId },
      data: { titulo }
    })

    return NextResponse.json({ coluna })
  } catch (error: any) {
    console.error('Erro ao editar coluna:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
