import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const empresas = await prisma.empresa.findMany({
      where: {
        usuarios: { some: { id: session.user.id } }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ empresas })
  } catch (error) {
    console.error('Erro ao buscar empresas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, metaPageId, igAccountId, avatarUrl, websiteUrl, instagramUrl, facebookUrl } = body

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'O nome da empresa é obrigatório' }, { status: 400 })
    }

    const novaEmpresa = await prisma.empresa.create({
      data: {
        name,
        metaPageId,
        igAccountId,
        avatarUrl,
        websiteUrl,
        instagramUrl,
        facebookUrl,
        status: metaPageId ? 'Conectado' : 'Ativo',
        statusType: metaPageId ? 'success' : 'success',
        usuarios: {
          connect: { id: session.user.id }
        }
      }
    })

    return NextResponse.json(novaEmpresa, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar empresa:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
