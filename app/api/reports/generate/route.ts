import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { getInstagramInsights, getInstagramProfile, getFacebookPageInsights, getInstagramPosts, getFacebookPosts } from '@/lib/meta'
import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(apiKey)

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { empresaId, days = 28, platform = 'INSTAGRAM' } = await req.json()

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

    if (empresa.igAccountId && !isFacebook) {
      const dono = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { metaAccessToken: true }
      })

      if (dono && dono.metaAccessToken) {
        try {
          profile = await getInstagramProfile(empresa.igAccountId, dono.metaAccessToken)
          insights = await getInstagramInsights(empresa.igAccountId, dono.metaAccessToken, days)
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
            followers: 0, // Not fetching page fans right now
            postsCount: 0
          }
          insights = await getFacebookPageInsights(empresa.metaPageId, dono.metaAccessToken, days)
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
                    component_type: { type: SchemaType.STRING, description: "HeroHighlight, StandardGrid, ou PostShowcase" },
                    title: { type: SchemaType.STRING },
                    properties: { 
                      type: SchemaType.OBJECT, 
                      description: "Dados estruturados do bloco",
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
                              permalink: { type: SchemaType.STRING },
                              like_count: { type: SchemaType.NUMBER },
                              comments_count: { type: SchemaType.NUMBER }
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
            required: ["slides"]
          }
        },
        required: ["theme_mode", "ui_blueprint"]
      }

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: reportSchema
        }
      })

      const igMetrics = `
- Seguidores Atuais: ${profile?.followers || 0}
- Número de Publicações: ${profile?.postsCount || 0}
- Alcance Total Acumulado (últimos ${days} dias): ${insights?.total?.reach || 0} (Variação de ${insights?.total?.reachDelta || 0}%)
- Impressões Totais (últimos ${days} dias): ${insights?.total?.impressions || 0} (Variação de ${insights?.total?.impressionsDelta || 0}%)
- Visualizações do Perfil (últimos ${days} dias): ${insights?.total?.profileViews || 0}
- Cliques no Site/Link (últimos ${days} dias): ${insights?.total?.websiteClicks || 0}
`
      const fbMetrics = `
- Fãs Adicionados (últimos ${days} dias): ${insights?.total?.newFans || 0}
- Usuários Engajados (últimos ${days} dias): ${insights?.total?.engagedUsers || 0} (Variação de ${insights?.total?.engagedDelta || 0}%)
- Impressões Totais (últimos ${days} dias): ${insights?.total?.impressions || 0} (Variação de ${insights?.total?.impressionsDelta || 0}%)
`

      const prompt = `
Você é um Especialista em Apresentação de Resultados de Marketing e Design Generativo.
O teu objetivo exclusivo é analisar os seguintes dados da empresa "${empresa.name}" na plataforma ${platform} e estruturar uma Apresentação Descritiva e Celebrativa usando a arquitetura A2UI (Componentes Declarativos em JSON).

REGRAS OBRIGATÓRIAS (Camadas de Curadoria e Design):
1. Avalia o estado geral. Se houver crescimento acelerado, define theme_mode como 'THEME_SUCCESS_GLOW'. Caso contrário, use 'THEME_NEUTRAL_GLASS'.
2. O Tom de Voz da narrativa deve ser PURAMENTE DESCRITIVO e de prestação de contas. Descreva os números, mostre o que aconteceu e as vitórias do período.
3. NÃO tire conclusões. NÃO dê recomendações. NÃO dê dicas do que fazer no futuro.
4. Cria a estrutura da UI no array 'slides' utilizando os seguintes componentes disponíveis:
   - 'HeroHighlight': Usa para dar o título da apresentação ou destacar o maior número. Exige em 'properties': { "metric": "...", "label": "...", "narrative": "..." }
   - 'StandardGrid': Usa para listar os KPIs de forma objetiva. Exige em 'properties': { "kpis": [{ "title": "...", "value": "...", "trend": "positivo|negativo" }] }
   - 'PostShowcase': Usa para mostrar os melhores posts do período. Exige em 'properties': { "title": "...", "posts": [{ "caption": "...", "media_url": "...", "permalink": "...", "like_count": 0, "comments_count": 0 }] }

INSTRUÇÕES IMPORTANTES:
- Inclua pelo menos um slide do tipo 'PostShowcase' com os posts fornecidos nos dados brutos, se houver.
- Seja profissional e direto na narrativa.

DADOS BRUTOS (${platform}):
${isFacebook ? fbMetrics : igMetrics}

POSTS DE DESTAQUE (${platform}):
${JSON.stringify(postsData, null, 2)}
`
      const result = await model.generateContent(prompt)
      const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim()
      aiAnalysis = JSON.parse(responseText)
    } catch (error: any) {
      console.error('Erro na análise da IA:', error)
      const errorMessage = error.message || String(error)
      aiAnalysis = {
        theme_mode: "THEME_ALERT_DARK",
        ui_blueprint: {
          slides: [
            {
              component_type: "TimelineCrisis",
              title: "Erro de Comunicação com a IA",
              properties: {
                severity: "FALHA NA API",
                steps: [
                  "O servidor tentou contactar o Google Gemini para gerar o relatório.",
                  `Erro retornado: ${errorMessage}`
                ],
                recommendation: "Verifique se a variável GEMINI_API_KEY está configurada corretamente na Vercel e se a API tem limite disponível."
              }
            },
            {
              component_type: "StandardGrid",
              title: "Visão Geral de Estabilidade (Dados Brutos)",
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
