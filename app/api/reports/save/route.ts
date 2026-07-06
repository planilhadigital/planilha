import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { buildDeterministicFallback } from '@/lib/report-normalizer'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const body = await req.json()
    const { 
      empresaId, 
      platform, 
      effectiveDays, 
      isDemo, 
      profile, 
      insights, 
      aiAnalysis,
      normalizedMetrics 
    } = body

    if (!empresaId) return NextResponse.json({ error: 'empresaId ausente' }, { status: 400 })

    const reportBlueprintSchema = z.object({
      template: z.enum(["GROWTH_HERO", "NEUTRAL_GRID", "ALERT_COMPACT", "SHOWCASE_FOCUS"]),
      headline: z.string(),
      insight_summary: z.string(),
      slides: z.array(
        z.object({
          component_type: z.enum(["HeroHighlight", "StandardGrid", "PostShowcase", "NarrativeFlow"]),
          title: z.string(),
          properties: z.any()
        })
      ).min(1)
    });

    let validAnalysis = aiAnalysis
    
    if (aiAnalysis && !aiAnalysis.failed) {
      const parsed = reportBlueprintSchema.safeParse(aiAnalysis)
      if (!parsed.success) {
        console.error("Blueprint inválido da IA", parsed.error)
        validAnalysis = buildDeterministicFallback(normalizedMetrics)
      }
    } else {
      validAnalysis = buildDeterministicFallback(normalizedMetrics)
    }

    const dadosCongelados = {
      isDemo,
      profile,
      insights,
      aiAnalysis: validAnalysis
    }

    const relatorio = await prisma.relatorioGerado.create({
      data: {
        empresaId,
        dias: effectiveDays,
        platform,
        dadosCongelados,
        criadoPor: session.user.id
      }
    })

    return NextResponse.json({ success: true, relatorioId: relatorio.id })
  } catch (error: any) {
    console.error('Erro ao salvar relatório:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}
