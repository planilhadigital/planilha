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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user?.metaAccessToken) {
      return NextResponse.json({ error: 'Conta da Meta não conectada' }, { status: 400 })
    }

    // Busca as páginas gerenciadas pelo usuário e informações aninhadas do Instagram
    const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?fields=id,name,picture,instagram_business_account{id,username,profile_picture_url}&limit=100&access_token=${user.metaAccessToken}`)
    const pagesData = await pagesRes.json()

    if (pagesData.error) {
      throw new Error(pagesData.error.message)
    }

    return NextResponse.json({ pages: pagesData.data })
  } catch (error: any) {
    console.error('Erro ao listar páginas da Meta:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}
