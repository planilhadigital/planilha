import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { getInstagramInsights, getInstagramProfile } from '@/lib/meta'
import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(apiKey)

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { empresaId, days = 28 } = await req.json()

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
    let isDemo = false

    if (empresa.igAccountId) {
      const dono = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { metaAccessToken: true }
      })

      if (dono && dono.metaAccessToken) {
        try {
          profile = await getInstagramProfile(empresa.igAccountId, dono.metaAccessToken)
          insights = await getInstagramInsights(empresa.igAccountId, dono.metaAccessToken, days)
        } catch (err) {
          console.error('Erro ao buscar dados reais:', err)
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
        },
        history
      }
    }

    // Análise IA
    let aiAnalysis = null
    try {
      const reportSchema: Schema = {
        type: SchemaType.OBJECT,
        properties: {
          theme_mode: { type: SchemaType.STRING, description: "THEME_SUCCESS_GLOW, THEME_ALERT_DARK, ou THEME_NEUTRAL_GLASS" },
          ui_blueprint: {
            type: SchemaType.OBJECT,
            properties: {
              slides: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    component_type: { type: SchemaType.STRING, description: "HeroHighlight, TimelineCrisis, ou StandardGrid" },
                    title: { type: SchemaType.STRING },
                    properties: { type: SchemaType.OBJECT, description: "Dados estruturados do bloco" }
                  },
                  required: ["component_type", "title", "properties"]
                }
              }
            },
            required: ["slides"]
          }
        },
        required: ["theme_mode", "ui_blueprint"]
      }

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-pro',
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: reportSchema
        }
      })

      const prompt = `
Atuarás como um Diretor de Marketing Estratégico (CMO) e Engenheiro de Design Generativo.
O teu objetivo exclusivo é analisar os seguintes dados da empresa "${empresa.name}" e estruturar um relatório na nossa arquitetura A2UI (Componentes Declarativos em JSON).

REGRAS OBRIGATÓRIAS (Camadas de Curadoria e Design):
1. Avalia o estado geral. Se houver crescimento acelerado (anomalia orgânica positiva), define theme_mode como 'THEME_SUCCESS_GLOW'. Se houver queda acentuada, usa 'THEME_ALERT_DARK'. Se for estabilidade, usa 'THEME_NEUTRAL_GLASS'.
2. Omite canais com resultados nulos ou sem relevância estatística.
3. Cria a estrutura da UI no array 'slides' utilizando os seguintes componentes disponíveis:
   - 'HeroHighlight': Usa para vitórias massivas. Exige em 'properties': { "metric": "...", "label": "...", "delta": "...", "narrative": "..." }
   - 'TimelineCrisis': Usa para anomalias ou quedas. Exige em 'properties': { "severity": "...", "steps": ["...", "..."], "recommendation": "..." }
   - 'StandardGrid': Usa para listar de 1 a 4 métricas comuns (como grid de KPIs). Exige em 'properties': { "kpis": [{ "title": "...", "value": "...", "trend": "positivo|negativo" }] }

DADOS BRUTOS:
- Seguidores Atuais: ${profile.followers}
- Número de Publicações: ${profile.postsCount}
- Alcance Total Acumulado (últimos ${days} dias): ${insights.total.reach} (Variação de ${insights.total.reachDelta}%)
- Impressões Totais (últimos ${days} dias): ${insights.total.impressions} (Variação de ${insights.total.impressionsDelta}%)
`
      const result = await model.generateContent(prompt)
      const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim()
      aiAnalysis = JSON.parse(responseText)
    } catch (error) {
      console.error('Erro na análise da IA:', error)
      aiAnalysis = {
        theme_mode: "THEME_NEUTRAL_GLASS",
        ui_blueprint: {
          slides: [
            {
              component_type: "StandardGrid",
              title: "Visão Geral de Estabilidade",
              properties: {
                kpis: [
                  { title: "Alcance", value: String(insights.total.reach), trend: "neutro" },
                  { title: "Seguidores", value: String(profile.followers), trend: "neutro" }
                ]
              }
            }
          ]
        }
      }
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
        dias: days,
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
