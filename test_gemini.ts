import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function testGemini() {
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
O teu objetivo exclusivo é analisar os seguintes dados normalizados da empresa "Ilha" na plataforma INSTAGRAM e estruturar uma Apresentação Descritiva usando a arquitetura A2UI (Componentes Declarativos em JSON).

REGRAS OBRIGATÓRIAS:
1. Escolha um 'template' baseado no 'trend' geral. Se for crescimento forte, use GROWTH_HERO. Se estável, NEUTRAL_GRID. Se queda, ALERT_COMPACT. Se tiver muitos posts bons, SHOWCASE_FOCUS.
2. Crie um 'headline' curto e impactante.
3. Crie um 'insight_summary' profissional e puramente descritivo resumindo o desempenho.
4. Monte a estrutura em 'slides' usando apenas: HeroHighlight, StandardGrid e PostShowcase.
5. Em 'StandardGrid', exija em 'properties': { "kpis": [{ "title": "...", "value": "...", "trend": "positivo|negativo|neutro" }] }.
6. Use APENAS os dados fornecidos. NÃO faça cálculos.

DADOS NORMALIZADOS:
{
  "platform": "INSTAGRAM",
  "days": 28,
  "profile": { "followers": 1000, "postsCount": 20 },
  "totals": { "reach": 5000, "impressions": 10000 },
  "trend": "crescimento"
}
  `
  const result = await model.generateContent(prompt)
  console.log(result.response.text())
}

testGemini()
