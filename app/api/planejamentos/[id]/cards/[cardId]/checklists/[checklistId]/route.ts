import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// POST - adicionar item ao checklist
export async function POST(request: Request, { params }: { params: Promise<{ id: string, cardId: string, checklistId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { checklistId } = await params
  const { texto } = await request.json()
  if (!texto?.trim()) return NextResponse.json({ error: 'Texto obrigatório' }, { status: 400 })
  const count = await prisma.checklistItem.count({ where: { checklistId } })
  const item = await prisma.checklistItem.create({ data: { checklistId, texto, ordem: count } })
  return NextResponse.json({ item })
}

// PATCH - toggle concluido / editar texto
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string, cardId: string, checklistId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const itemId = searchParams.get('itemId')
  if (!itemId) return NextResponse.json({ error: 'itemId obrigatório' }, { status: 400 })
  const body = await request.json()
  const item = await prisma.checklistItem.update({
    where: { id: itemId },
    data: {
      ...(body.concluido !== undefined && { concluido: body.concluido }),
      ...(body.texto !== undefined && { texto: body.texto }),
    }
  })
  return NextResponse.json({ item })
}

// DELETE - excluir item do checklist
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const itemId = searchParams.get('itemId')
  if (!itemId) return NextResponse.json({ error: 'itemId obrigatório' }, { status: 400 })
  await prisma.checklistItem.delete({ where: { id: itemId } })
  return NextResponse.json({ success: true })
}
