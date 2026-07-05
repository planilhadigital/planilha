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
    const hasAccess = empresa.usuarios.some(u => u.id === session.user.id)
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
          punchline: { type: SchemaType.STRING },
          narrative: { type: SchemaType.STRING },
          mainHighlight: {
            type: SchemaType.OBJECT,
            properties: {
              label: { type: SchemaType.STRING },
              value: { type: SchemaType.STRING }
            },
            required: ["label", "value"]
          },
          dynamicKpis: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                title: { type: SchemaType.STRING, description: "O nome da métrica" },
                value: { type: SchemaType.STRING, description: "O valor formatado" },
                trend: { type: SchemaType.STRING, description: "Pode ser 'positivo', 'negativo' ou 'neutro'" },
                deltaText: { type: SchemaType.STRING, description: "Opcional. Exemplo: '+12%'" }
              },
              required: ["title", "value", "trend"]
            }
          },
          actionPlan: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING }
          }
        },
        required: ["punchline", "narrative", "mainHighlight", "dynamicKpis", "actionPlan"]
      }

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-pro',
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: reportSchema
        }
      })

      const prompt = `
Você é um estrategista de marketing brilhante e criativo, montando uma apresentação executiva sobre o desempenho do Instagram da empresa "${empresa.name}".
Analise os seguintes dados e preencha a estrutura JSON correspondente perfeitamente.

ATENÇÃO: Se alguma métrica for 0, inválida ou ausente, IGNORE-A completamente. 
Escolha até 4 métricas de maior destaque que mostrem a real situação da conta e adicione no array "dynamicKpis".

DADOS:
- Seguidores: ${profile.followers}
- Publicações: ${profile.postsCount}
- Alcance Total (${days} dias): ${insights.total.reach} (Crescimento/Queda de ${insights.total.reachDelta}%)
- Impressões Totais (${days} dias): ${insights.total.impressions} (Crescimento/Queda de ${insights.total.impressionsDelta}%)
`
      const result = await model.generateContent(prompt)
      const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim()
      aiAnalysis = JSON.parse(responseText)
    } catch (error) {
      console.error('Erro na análise da IA:', error)
      aiAnalysis = {
        punchline: "Consistência de Resultados no Período",
        narrative: "A estratégia atual mantém um fluxo constante de alcance e engajamento. Notamos uma base sólida de impressões, indicando que a audiência continua interagindo com os conteúdos principais da marca.",
        mainHighlight: { label: "Alcance Mantido", value: String(insights.total.reach) },
        dynamicKpis: [
          { title: "Alcance Total", value: String(insights.total.reach), trend: "positivo", deltaText: "Estável" },
          { title: "Seguidores", value: String(profile.followers), trend: "neutro" }
        ],
        actionPlan: ["Manter a cadência de postagens", "Investir em Reels para mais alcance", "Criar chamadas para ação nos Stories"]
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
