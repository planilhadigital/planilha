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
    const baseUrl = process.env.NODE_ENV === 'production' ? 'https://planilha.digital' : (process.env.NEXTAUTH_URL || 'http://localhost:3000')
    const redirectUri = `${baseUrl}/api/meta/callback`

    // 1. Trocar o código por um Token de Acesso de Curta Duração
    const tokenResponse = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`)
    const tokenData = await tokenResponse.json()

    if (tokenData.error) throw new Error(tokenData.error.message)

    // 2. Trocar por um Token de Longa Duração (60 dias)
    const longLivedResponse = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${tokenData.access_token}`)
    const longLivedData = await longLivedResponse.json()

    if (longLivedData.error) throw new Error(longLivedData.error.message)

    // 3. Buscar nome e foto do perfil do Facebook
    const profileRes = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name,picture.width(200)&access_token=${longLivedData.access_token}`)
    const profileData = await profileRes.json()

    let base64Photo = null
    try {
      if (profileData.picture?.data?.url) {
        const imgRes = await fetch(profileData.picture.data.url)
        const arrayBuffer = await imgRes.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        base64Photo = `data:${imgRes.headers.get('content-type') || 'image/jpeg'};base64,${buffer.toString('base64')}`
      }
    } catch (err) {
      console.error('Erro ao baixar foto Meta:', err)
    }

    // 4. Salvar o Token + Nome + Foto diretamente no Usuário logado
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        metaAccessToken: longLivedData.access_token,
        metaName: profileData.name ?? null,
        metaPhoto: base64Photo,
      }
    })

    return NextResponse.redirect(new URL('/dashboard/configuracoes?meta=success', request.url))
  } catch (error) {
    console.error('Meta OAuth Error:', error)
    return NextResponse.redirect(new URL('/dashboard/configuracoes?error=meta_failed', request.url))
  }
}
