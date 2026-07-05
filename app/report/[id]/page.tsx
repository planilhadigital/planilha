import { prisma } from '@/lib/prisma'
import { getInstagramInsights, getInstagramProfile } from '@/lib/meta'
import styles from './page.module.css'
import ClientChart from '@/app/report/[id]/ClientChart'
import PrintButton from './PrintButton'
import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai'

// Iniciar SDK do Gemini (Usa variável de ambiente obrigatoriamente agora)
const apiKey = process.env.GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(apiKey)

export default async function PublicReportPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ days?: string }> }) {
  const { id } = await params
  const searchParamsObj = await searchParams
  const days = searchParamsObj.days ? parseInt(searchParamsObj.days, 10) : 28

  const empresa = await prisma.empresa.findUnique({
    where: { id },
    include: { usuarios: true }
  })

  if (!empresa) {
    return (
      <div className={styles.errorContainer}>
        <h1>Relatório Indisponível</h1>
        <p>A empresa não foi encontrada.</p>
      </div>
    )
  }

  let profile: any = null
  let insights: any = null
  let isDemo = false

  if (empresa.igAccountId) {
    const dono = empresa.usuarios[0]
    const account = await prisma.account.findFirst({
      where: { userId: dono?.id, provider: 'facebook' }
    })

    if (account) {
      try {
        profile = await getInstagramProfile(empresa.igAccountId, account.access_token as string)
        insights = await getInstagramInsights(empresa.igAccountId, account.access_token as string, days)
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

  // Análise IA via Gemini 1.5 Pro
  let aiAnalysis = null
  try {
    const reportSchema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        punchline: { type: SchemaType.STRING, description: "Uma frase de alto impacto e chamativa resumindo o principal feito ou desafio do período." },
        narrative: { type: SchemaType.STRING, description: "Um parágrafo conciso (3-4 linhas) estilo 'Storytelling' analisando a situação e o significado desses números para a marca." },
        mainHighlight: {
          type: SchemaType.OBJECT,
          properties: {
            label: { type: SchemaType.STRING, description: "O que mais chamou atenção" },
            value: { type: SchemaType.STRING, description: "O número com um formato bonito (ex: +45K Alcance)" }
          },
          required: ["label", "value"]
        },
        actionPlan: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "Lista de próximos passos estratégicos"
        }
      },
      required: ["punchline", "narrative", "mainHighlight", "actionPlan"]
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
    // Fallback AI
    aiAnalysis = {
      punchline: "Consistência de Resultados no Período",
      narrative: "A estratégia atual mantém um fluxo constante de alcance e engajamento. Notamos uma base sólida de impressões, indicando que a audiência continua interagindo com os conteúdos principais da marca.",
      mainHighlight: { label: "Alcance Mantido", value: String(insights.total.reach) },
      actionPlan: ["Manter a cadência de postagens", "Investir em Reels para mais alcance", "Criar chamadas para ação nos Stories"]
    }
  }

  return (
    <div className={styles.presentationPage}>
      <header className={styles.presentationHeader}>
        <div className={styles.headerBrand}>
          <img src={profile.avatar} alt="Avatar" className={styles.headerAvatar} />
          <div className={styles.headerTitles}>
            <h1>{empresa.name}</h1>
            <span className={styles.headerSubtitle}>Resultados Instagram • Últimos {days} dias</span>
          </div>
        </div>
        <div className={styles.headerControls}>
          {isDemo && <span className={styles.demoBadge}>Demo</span>}
          <PrintButton />
        </div>
      </header>

      <main className={styles.presentationBody}>
        {/* Slide 1: O Grande Destaque (Gerado por IA) */}
        <section className={`${styles.slide} ${styles.slideHighlight}`}>
          <div className={styles.slideGlow}></div>
          <h2 className={styles.punchline}>"{aiAnalysis.punchline}"</h2>
          
          <div className={styles.highlightBox}>
            <span className={styles.highlightLabel}>{aiAnalysis.mainHighlight.label}</span>
            <span className={styles.highlightValue}>{aiAnalysis.mainHighlight.value}</span>
          </div>
          
          <p className={styles.narrative}>{aiAnalysis.narrative}</p>
        </section>

        {/* Slide 2: Números Reais (Grid de KPIs) */}
        <section className={`${styles.slide} ${styles.slideMetrics}`}>
          <div className={styles.kpiBox}>
            <span className={styles.kpiTitle}>Alcance Total</span>
            <div className={styles.kpiNumber}>
              {insights.total.reach.toLocaleString()}
              {insights.total.reachDelta !== undefined && (
                <span className={`${styles.delta} ${insights.total.reachDelta >= 0 ? styles.deltaUp : styles.deltaDown}`}>
                  {insights.total.reachDelta >= 0 ? '↑' : '↓'}{Math.abs(insights.total.reachDelta).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          <div className={styles.kpiBox}>
            <span className={styles.kpiTitle}>Impressões</span>
            <div className={styles.kpiNumber}>
              {insights.total.impressions.toLocaleString()}
              {insights.total.impressionsDelta !== undefined && (
                <span className={`${styles.delta} ${insights.total.impressionsDelta >= 0 ? styles.deltaUp : styles.deltaDown}`}>
                  {insights.total.impressionsDelta >= 0 ? '↑' : '↓'}{Math.abs(insights.total.impressionsDelta).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          <div className={styles.kpiBox}>
            <span className={styles.kpiTitle}>Seguidores</span>
            <div className={styles.kpiNumber}>{profile.followers.toLocaleString()}</div>
          </div>
          <div className={styles.kpiBox}>
            <span className={styles.kpiTitle}>Publicações</span>
            <div className={styles.kpiNumber}>{profile.postsCount.toLocaleString()}</div>
          </div>
        </section>

        {/* Slide 3: Gráfico Visual */}
        <section className={`${styles.slide} ${styles.slideChart}`}>
          <h3 className={styles.slideTitle}>Evolução Diária</h3>
          <div className={styles.chartContainer}>
            <ClientChart data={insights.history} />
          </div>
        </section>

        {/* Slide 4: Plano de Ação IA */}
        <section className={`${styles.slide} ${styles.slideAction}`}>
          <h3 className={styles.slideTitle}>Próximos Passos (Plano de Ação)</h3>
          <ul className={styles.actionList}>
            {aiAnalysis.actionPlan.map((step: string, i: number) => (
              <li key={i}><span className={styles.stepNumber}>{i + 1}</span> {step}</li>
            ))}
          </ul>
        </section>
      </main>

      <footer className={styles.presentationFooter}>
        <div className={styles.footerBranding}>
          <span style={{color: 'var(--accent)', fontWeight: 800, marginRight: '8px'}}>planILHA</span> Intelligence
        </div>
        <div>Uso executivo confidencial</div>
      </footer>
    </div>
  )
}
