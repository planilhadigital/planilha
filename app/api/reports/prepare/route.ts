import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getInstagramProfile, getInstagramInsights, getFacebookPageInsights, getInstagramPosts, getFacebookPosts } from '@/lib/meta'
import { normalizeMetrics } from '@/lib/report-normalizer'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { empresaId, days = 28, platform = 'INSTAGRAM', startDate, endDate } = await req.json()
    if (!empresaId) return NextResponse.json({ error: 'empresaId ausente' }, { status: 400 })

    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId }
    })
    if (!empresa) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })

    let profile: any = null
    let insights: any = null
    let postsData: any = []
    let isDemo = false
    const isFacebook = platform === 'FACEBOOK'
    let effectiveDays = parseInt(String(days)) || 28;
    
    if (startDate && endDate) {
      const s = new Date(startDate).getTime();
      const e = new Date(endDate).getTime();
      effectiveDays = Math.max(1, Math.ceil((e - s) / (1000 * 3600 * 24)));
    }

    if (empresa.igAccountId && !isFacebook) {
      const dono = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { metaAccessToken: true }
      })

      if (dono && dono.metaAccessToken) {
        try {
          profile = await getInstagramProfile(empresa.igAccountId, dono.metaAccessToken)
          insights = await getInstagramInsights(empresa.igAccountId, dono.metaAccessToken, days, startDate, endDate)
          postsData = await getInstagramPosts(empresa.igAccountId, dono.metaAccessToken, effectiveDays)
        } catch (err) {
          console.error('Erro ao buscar dados reais IG:', err)
          isDemo = true
        }
      } else {
        isDemo = true
      }
    } else if (empresa.metaPageId && isFacebook) {
      const dono = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { metaAccessToken: true }
      })

      if (dono && dono.metaAccessToken) {
        try {
          profile = {
            username: empresa.name.toLowerCase().replace(/\s+/g, ''),
            avatar: empresa.avatarUrl || 'https://via.placeholder.com/150',
            followers: 0,
            postsCount: 0
          }
          insights = await getFacebookPageInsights(empresa.metaPageId, dono.metaAccessToken, days, startDate, endDate)
          postsData = await getFacebookPosts(empresa.metaPageId, dono.metaAccessToken, effectiveDays)
        } catch (err) {
          console.error('Erro ao buscar dados reais FB:', err)
          isDemo = true
        }
      } else {
        isDemo = true
      }
    } else {
      isDemo = true
    }

    if (isDemo || !profile || !insights) {
      isDemo = true
      profile = {
        username: empresa.name.toLowerCase().replace(/\s+/g, ''),
        avatar: empresa.avatarUrl || 'https://via.placeholder.com/150',
        followers: 12543,
        postsCount: 342
      }
      
      const history = []
      const baseDate = new Date()
      baseDate.setDate(baseDate.getDate() - effectiveDays)
      
      for (let i = 0; i < effectiveDays; i++) {
        const dt = new Date(baseDate)
        dt.setDate(dt.getDate() + i)
        history.push({
          date: dt.toISOString().split('T')[0],
          reach: Math.floor(Math.random() * 500) + 1000 + (i * 20),
          impressions: Math.floor(Math.random() * 800) + 1500 + (i * 30),
        })
      }

      insights = {
        total: {
          reach: 45230,
          reachDelta: 12.5,
          impressions: 78900,
          impressionsDelta: 8.2,
          profileViews: 1200,
          websiteClicks: 50
        },
        history
      }
    }

    const normalizedMetrics = normalizeMetrics(platform, effectiveDays, profile, insights, postsData)

    return NextResponse.json({
      success: true,
      empresaId: empresa.id,
      platform,
      effectiveDays,
      isDemo,
      profile,
      insights,
      postsData,
      normalizedMetrics,
      empresaName: empresa.name
    })

  } catch (error: any) {
    console.error('Erro geral /reports/prepare:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}
