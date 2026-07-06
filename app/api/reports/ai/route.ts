import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai'
import { NextResponse } from 'next/server'

// Habilita Edge Runtime para aumentar o limite de timeout para 30s (Plano Gratuito)
export const runtime = 'edge'

const apiKey = process.env.GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(apiKey)

export async function POST(req: Request) {
  try {
    const { normalizedMetrics, empresaName, platform } = await req.json()

    if (!normalizedMetrics) {
      return NextResponse.json({ error: 'Métricas ausentes' }, { status: 400 })
    }

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
              component_type: { type: SchemaType.STRING, description: "HeroHighlight, StandardGrid, PostShowcase ou NarrativeFlow" },
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
O teu objetivo exclusivo é analisar os seguintes dados normalizados da empresa "${empresaName}" na plataforma ${platform} e estruturar uma Apresentação Descritiva usando a arquitetura A2UI (Componentes Declarativos em JSON).

REGRAS OBRIGATÓRIAS:
1. Escolha um 'template' baseado no 'trend' geral. Se for crescimento forte, use GROWTH_HERO. Se estável, NEUTRAL_GRID. Se queda, ALERT_COMPACT. Se tiver muitos posts bons, SHOWCASE_FOCUS.
2. Crie um 'headline' curto e impactante.
3. Crie um 'insight_summary' profissional e puramente descritivo resumindo o desempenho.
4. Monte a estrutura em 'slides' usando apenas: NarrativeFlow, HeroHighlight, StandardGrid e PostShowcase.
5. OBRIGATÓRIO: O PRIMEIRO slide deve ser SEMPRE um 'NarrativeFlow'. Em 'properties' exija: { "steps": ["O Cenário antes", "A Ação feita", "O Resultado"] }. Deduza a Ação baseada no trend dos números (ex: se alcance subiu, deduza que focaram em topo de funil).
6. Em 'StandardGrid', exija em 'properties': { "kpis": [{ "title": "...", "value": "...", "trend": "positivo|negativo|neutro" }] }.
7. Use APENAS os dados fornecidos. NÃO faça cálculos.

DADOS NORMALIZADOS:
${JSON.stringify(normalizedMetrics, null, 2)}
`
    const result = await model.generateContent(prompt)
    const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim()
    const rawAiAnalysis = JSON.parse(responseText)

    return NextResponse.json({ success: true, aiAnalysis: rawAiAnalysis })
  } catch (error: any) {
    console.error('Erro na rota Edge de IA:', error)
    return NextResponse.json({ error: error.message || 'Erro na IA', failed: true }, { status: 500 })
  }
}
