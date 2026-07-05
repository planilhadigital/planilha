import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// POST - criar comentário
export async function POST(request: Request, { params }: { params: Promise<{ id: string, cardId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { cardId } = await params
  const { texto } = await request.json()
  if (!texto?.trim()) return NextResponse.json({ error: 'Texto obrigatório' }, { status: 400 })
  const comentario = await prisma.cardComentario.create({
    data: { cardId, userId: session.user.id, texto }
  })
  return NextResponse.json({ comentario })
}

// DELETE - excluir comentário
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const comentarioId = searchParams.get('comentarioId')
  if (!comentarioId) return NextResponse.json({ error: 'comentarioId obrigatório' }, { status: 400 })
  await prisma.cardComentario.delete({ where: { id: comentarioId } })
  return NextResponse.json({ success: true })
}
