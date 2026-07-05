import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// POST - criar label
export async function POST(request: Request, { params }: { params: Promise<{ id: string, cardId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { cardId } = await params
  const { nome, cor } = await request.json()
  const label = await prisma.cardLabel.create({ data: { cardId, nome, cor: cor || '#22c55e' } })
  return NextResponse.json({ label })
}

// DELETE - excluir label
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string, cardId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const labelId = searchParams.get('labelId')
  if (!labelId) return NextResponse.json({ error: 'labelId obrigatório' }, { status: 400 })
  await prisma.cardLabel.delete({ where: { id: labelId } })
  return NextResponse.json({ success: true })
}
