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

export async function getInstagramInsights(igAccountId: string, accessToken: string) {
  try {
    // Busca alcance (reach) e impressões dos últimos 28 dias
    const res = await fetch(`https://graph.facebook.com/v19.0/${igAccountId}/insights?metric=impressions,reach&period=day&access_token=${accessToken}`)
    const data = await res.json()
    
    if (data.error) throw new Error(data.error.message)
      
    // Simplificando o cálculo sumariando todos os valores do período retornado
    const reachData = data.data.find((m: any) => m.name === 'reach')?.values || []
    const totalReach = reachData.reduce((acc: number, val: any) => acc + val.value, 0)
    
    const impressionsData = data.data.find((m: any) => m.name === 'impressions')?.values || []
    const totalImpressions = impressionsData.reduce((acc: number, val: any) => acc + val.value, 0)

    return {
      reach: totalReach,
      impressions: totalImpressions
    }
  } catch (error) {
    console.error('Erro ao buscar Insights IG:', error)
    return { reach: 0, impressions: 0 }
  }
}
