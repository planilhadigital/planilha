import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { getInstagramInsights, getInstagramProfile, getFacebookPageInsights, getInstagramPosts, getFacebookPosts } from '@/lib/meta'
import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai'
import { z } from 'zod'
import { normalizeMetrics, buildDeterministicFallback } from '@/lib/report-normalizer'

const apiKey = process.env.GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(apiKey)

export const maxDuration = 60; // Evita timeout na Vercel (Hobby max 60s)

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { empresaId, days = 28, platform = 'INSTAGRAM', startDate, endDate } = await req.json()

    if (!empresaId) {
      return NextResponse.json({ error: 'empresaId é obrigatório' }, { status: 400 })
    }

    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      include: { usuarios: true }
    })

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    // Verificar se usuário tem acesso
    const hasAccess = empresa.usuarios.some((u: { id: string }) => u.id === session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    let profile: any = null
    let insights: any = null
    let postsData: any = []
    let isDemo = false
    const isFacebook = platform === 'FACEBOOK'
    let effectiveDays = days;
    
    if (startDate && endDate) {
      const s = new Date(startDate).getTime();
      const e = new Date(endDate).getTime();
      effectiveDays = Math.ceil((e - s) / (1000 * 3600 * 24));
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
          postsData = await getInstagramPosts(empresa.igAccountId, dono.metaAccessToken, days)
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
          // FB doesn't have a simple profile method in our meta.ts, we mock profile basics for FB page
          profile = {
            username: empresa.name.toLowerCase().replace(/\s+/g, ''),
            avatar: empresa.avatarUrl || 'https://via.placeholder.com/150',
            followers: 0,
            postsCount: 0
          }
          insights = await getFacebookPageInsights(empresa.metaPageId, dono.metaAccessToken, days, startDate, endDate)
          postsData = await getFacebookPosts(empresa.metaPageId, dono.metaAccessToken, days)
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

    // Dados Mock para Demo
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
      baseDate.setDate(baseDate.getDate() - days)
      
      for (let i = 0; i < days; i++) {
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

    // Define o schema Zod para validação da IA
    const reportBlueprintSchema = z.object({
      template: z.enum(["GROWTH_HERO", "NEUTRAL_GRID", "ALERT_COMPACT", "SHOWCASE_FOCUS"]),
      headline: z.string(),
      insight_summary: z.string(),
      slides: z.array(
        z.object({
          component_type: z.enum(["HeroHighlight", "StandardGrid", "PostShowcase"]),
          title: z.string(),
          properties: z.any()
        })
      ).min(1)
    });

    // 1. Normalização Determinística
    const normalizedMetrics = normalizeMetrics(platform, effectiveDays, profile, insights, postsData)

    // Análise IA
    let aiAnalysis = null
    try {
      const reportSchema: Schema = {
        type: SchemaType.OBJECT,
        properties: {
          template: { type: SchemaType.STRING, description: "GROWTH_HERO, NEUTRAL_GRID, ALERT_COMPACT ou SHOWCASE_FOCUS" },
          headline: { type: SchemaType.STRING, description: "Título impactante para o relatório" },
          insight_summary: { type: SchemaType.STRING, description: "Resumo em 1 ou 2 frases sobre o desempenho geral" },
          slides: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                component_type: { type: SchemaType.STRING, description: "HeroHighlight, StandardGrid, ou PostShowcase" },
                title: { type: SchemaType.STRING },
                properties: { 
                  type: SchemaType.OBJECT, 
                  description: "Dados estruturados do bloco (kpis, posts, narrative, etc)",
                  properties: {
                    metric: { type: SchemaType.STRING },
                    label: { type: SchemaType.STRING },
                    delta: { type: SchemaType.STRING },
                    narrative: { type: SchemaType.STRING },
                    severity: { type: SchemaType.STRING },
                    steps: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                    recommendation: { type: SchemaType.STRING },
                    kpis: { 
                      type: SchemaType.ARRAY, 
                      items: { 
                        type: SchemaType.OBJECT, 
                        properties: {
                          title: { type: SchemaType.STRING },
                          value: { type: SchemaType.STRING },
                          trend: { type: SchemaType.STRING }
                        }
                      }
                    },
                    posts: {
                      type: SchemaType.ARRAY,
                      items: {
                        type: SchemaType.OBJECT,
                        properties: {
                          caption: { type: SchemaType.STRING },
                          media_url: { type: SchemaType.STRING },
                          media_type: { type: SchemaType.STRING },
                          permalink: { type: SchemaType.STRING },
                          like_count: { type: SchemaType.NUMBER },
                          comments_count: { type: SchemaType.NUMBER },
                          plays_count: { type: SchemaType.NUMBER }
                        }
                      }
                    }
                  }
                }
              },
              required: ["component_type", "title", "properties"]
            }
          }
        },
        required: ["template", "headline", "insight_summary", "slides"]
      }

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: reportSchema
        }
      })

      const prompt = `
Você é um Especialista em Apresentação de Resultados de Marketing e Design Generativo.
O teu objetivo exclusivo é analisar os seguintes dados normalizados da empresa "${empresa.name}" na plataforma ${platform} e estruturar uma Apresentação Descritiva usando a arquitetura A2UI (Componentes Declarativos em JSON).

REGRAS OBRIGATÓRIAS:
1. Escolha um 'template' baseado no 'trend' geral. Se for crescimento forte, use GROWTH_HERO. Se estável, NEUTRAL_GRID. Se queda, ALERT_COMPACT. Se tiver muitos posts bons, SHOWCASE_FOCUS.
2. Crie um 'headline' curto e impactante.
3. Crie um 'insight_summary' profissional e puramente descritivo resumindo o desempenho.
4. Monte a estrutura em 'slides' usando apenas: HeroHighlight, StandardGrid e PostShowcase.
5. Em 'StandardGrid', exija em 'properties': { "kpis": [{ "title": "...", "value": "...", "trend": "positivo|negativo|neutro" }] }.
6. Use APENAS os dados fornecidos. NÃO faça cálculos.

DADOS NORMALIZADOS:
${JSON.stringify(normalizedMetrics, null, 2)}
`
      const result = await model.generateContent(prompt)
      const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim()
      const rawAiAnalysis = JSON.parse(responseText)

      // Validação Zod e Fallback
      const parsed = reportBlueprintSchema.safeParse(rawAiAnalysis)
      if (parsed.success) {
        aiAnalysis = parsed.data
      } else {
        console.error("Blueprint inválido da IA", parsed.error)
        aiAnalysis = buildDeterministicFallback(normalizedMetrics)
      }
    } catch (error: any) {
      console.error('Erro na análise da IA ou Timeout:', error)
      aiAnalysis = buildDeterministicFallback(normalizedMetrics)
    }

    const dadosCongelados = {
      isDemo,
      profile,
      insights,
      aiAnalysis
    }

    // Criar o RelatorioGerado no banco
    const relatorio = await prisma.relatorioGerado.create({
      data: {
        empresaId: empresa.id,
        dias: effectiveDays,
        platform: platform,
        dadosCongelados: dadosCongelados,
        criadoPor: session.user.id
      }
    })

    return NextResponse.json({ success: true, relatorioId: relatorio.id })
  } catch (error: any) {
    console.error('Erro ao gerar relatório:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}
