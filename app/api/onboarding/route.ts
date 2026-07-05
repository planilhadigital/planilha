import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req })
    
    if (!token?.sub) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { personaType, marketNiche, marketingInvestment, primaryChannels, primaryChannelUrl } = body

    // Salvar ou atualizar o VisitorProfile
    const profile = await prisma.visitorProfile.upsert({
      where: { userId: token.sub },
      update: {
        personaType,
        marketNiche,
        marketingInvestment,
        primaryChannels: primaryChannels || [],
        primaryChannelUrl
      },
      create: {
        userId: token.sub,
        personaType,
        marketNiche,
        marketingInvestment,
        primaryChannels: primaryChannels || [],
        primaryChannelUrl
      }
    })

    return NextResponse.json({ success: true, profile })
  } catch (error) {
    console.error('Erro no onboarding:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
