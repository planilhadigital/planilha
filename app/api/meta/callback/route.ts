import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (!code) {
    return NextResponse.redirect(new URL('/dashboard/configuracoes?error=no_code', request.url))
  }

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const appId = process.env.META_APP_ID
    const appSecret = process.env.META_APP_SECRET
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/meta/callback`

    // 1. Trocar o código por um Token de Acesso de Curta Duração
    const tokenResponse = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`)
    const tokenData = await tokenResponse.json()

    if (tokenData.error) throw new Error(tokenData.error.message)

    // 2. Trocar por um Token de Longa Duração (60 dias)
    const longLivedResponse = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${tokenData.access_token}`)
    const longLivedData = await longLivedResponse.json()

    if (longLivedData.error) throw new Error(longLivedData.error.message)

    // 3. Obter ID da conta principal vinculada (ex: pegar a primeira página que o usuário gerencia)
    const pagesResponse = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${longLivedData.access_token}`)
    const pagesData = await pagesResponse.json()
    
    // Simplificação: pegando a primeira página do usuário
    const firstPage = pagesData.data?.[0]
    
    if (firstPage) {
      // 4. Salvar na primeira empresa vinculada a esse usuário
      const userEmpresas = await prisma.empresa.findMany({
        where: { usuarios: { some: { id: session.user.id } } }
      })

      if (userEmpresas.length > 0) {
        await prisma.empresa.update({
          where: { id: userEmpresas[0].id },
          data: {
            metaPageId: firstPage.id,
            metaAccessToken: longLivedData.access_token,
            status: 'Conectado',
            statusType: 'success'
          }
        })
      }
    }

    return NextResponse.redirect(new URL('/dashboard?meta=success', request.url))
  } catch (error) {
    console.error('Meta OAuth Error:', error)
    return NextResponse.redirect(new URL('/dashboard/configuracoes?error=meta_failed', request.url))
  }
}
