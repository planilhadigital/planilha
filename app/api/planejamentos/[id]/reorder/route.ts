import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { colunas, cards } = body
    
    // Iniciar transação para atualizar a ordem e as colunas de todos os elementos
    const queries = []

    if (colunas && Array.isArray(colunas)) {
      for (const col of colunas) {
        queries.push(
          prisma.coluna.update({
            where: { id: col.id },
            data: { ordem: col.ordem }
          })
        )
      }
    }

    if (cards && Array.isArray(cards)) {
      for (const card of cards) {
        queries.push(
          prisma.card.update({
            where: { id: card.id },
            data: { 
              ordem: card.ordem,
              colunaId: card.colunaId
            }
          })
        )
      }
    }

    await prisma.$transaction(queries)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao reordenar:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
