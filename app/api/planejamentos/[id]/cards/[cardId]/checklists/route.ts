import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// POST - criar checklist
export async function POST(request: Request, { params }: { params: Promise<{ id: string, cardId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { cardId } = await params
  const { titulo } = await request.json()
  const checklist = await prisma.cardChecklist.create({
    data: { cardId, titulo: titulo || 'Checklist' },
    include: { itens: true }
  })
  return NextResponse.json({ checklist })
}
