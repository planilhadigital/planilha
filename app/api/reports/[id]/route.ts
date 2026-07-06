import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    const relatorio = await prisma.relatorioGerado.findUnique({
      where: { id },
      include: { empresa: { include: { usuarios: true } } }
    })

    if (!relatorio) {
      return NextResponse.json({ error: 'Relatório não encontrado' }, { status: 404 })
    }

    const hasAccess = relatorio.empresa.usuarios.some(u => u.id === session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    await prisma.relatorioGerado.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao deletar relatório:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
