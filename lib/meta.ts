// lib/meta.ts
// Funções auxiliares para buscar dados reais da Graph API da Meta

export async function getInstagramAccountId(pageId: string, accessToken: string) {
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account&access_token=${accessToken}`)
    const data = await res.json()
    return data.instagram_business_account?.id || null
  } catch (error) {
    console.error('Erro ao buscar IG Account ID:', error)
    return null
  }
}

export async function getInstagramProfile(igAccountId: string, accessToken: string) {
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${igAccountId}?fields=username,profile_picture_url,followers_count,media_count&access_token=${accessToken}`)
    const data = await res.json()
    return {
      username: data.username,
      avatar: data.profile_picture_url,
      followers: data.followers_count,
      postsCount: data.media_count
    }
  } catch (error) {
    console.error('Erro ao buscar perfil IG:', error)
    return null
  }
}

export async function getInstagramInsights(igAccountId: string, accessToken: string, days: number = 28) {
  try {
    // Calculando timestamps (limite do Facebook para 'day' é 30 dias por request, então travamos no max 28 por segurança).
    const safeDays = Math.min(days, 30);
    const until = Math.floor(Date.now() / 1000);
    const since = until - (safeDays * 86400); // 86400s = 1 dia

    const url = `https://graph.facebook.com/v19.0/${igAccountId}/insights?metric=impressions,reach&period=day&since=${since}&until=${until}&access_token=${accessToken}`
    const res = await fetch(url)
    const data = await res.json()
    
    if (data.error) throw new Error(data.error.message)
      
    // Simplificando o cálculo sumariando todos os valores do período retornado
    const reachData = data.data.find((m: any) => m.name === 'reach')?.values || []
    const totalReach = reachData.reduce((acc: number, val: any) => acc + val.value, 0)
    
    const impressionsData = data.data.find((m: any) => m.name === 'impressions')?.values || []
    const totalImpressions = impressionsData.reduce((acc: number, val: any) => acc + val.value, 0)

    // Formata o histórico diário para o gráfico
    const history = reachData.map((reachItem: any, index: number) => {
      const impItem = impressionsData[index]
      
      // end_time vem no formato ISO, ex: 2024-10-05T07:00:00+0000
      const dateStr = new Date(reachItem.end_time).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

      return {
        date: dateStr,
        reach: reachItem.value,
        impressions: impItem ? impItem.value : 0
      }
    })

    return {
      total: {
        reach: totalReach,
        impressions: totalImpressions
      },
      history
    }
  } catch (error) {
    console.error('Erro ao buscar Insights IG:', error)
    return { total: { reach: 0, impressions: 0 }, history: [] }
  }
}
