import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { revalidatePath } from 'next/cache'

const VALID_ROLES = ['visitante', 'colaborador', 'admin']

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas admins podem mudar cargos
    if (session.user.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Apenas administradores podem alterar cargos' }, { status: 403 })
    }

    const { id } = await params
    const { role } = await request.json()

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Cargo inválido' }, { status: 400 })
    }

    // Impede o admin de remover seu próprio acesso (opcional, mas recomendado)
    if (id === session.user.id && role !== 'admin') {
      return NextResponse.json({ error: 'Você não pode rebaixar a si mesmo' }, { status: 403 })
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role }
    })

    // Revalida a página de configurações
    revalidatePath('/dashboard/configuracoes')

    return NextResponse.json({ user: updatedUser })
  } catch (error: any) {
    console.error('Erro ao atualizar cargo:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
