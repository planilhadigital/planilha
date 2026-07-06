// lib/meta.ts
// Funes auxiliares para buscar dados reais da Graph API da Meta

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
    // Calculando timestamps (limite do Facebook para 'day'  30 dias por request, ento travamos no max 28 por segurana).
    const safeDays = Math.min(days, 30);
    const until = Math.floor(Date.now() / 1000);
    const since = until - (safeDays * 86400); // 86400s = 1 dia

    const url = `https://graph.facebook.com/v19.0/${igAccountId}/insights?metric=impressions,reach,profile_views,website_clicks&period=day&since=${since}&until=${until}&access_token=${accessToken}`
    const res = await fetch(url)
    const data = await res.json()
    
    if (data.error) throw new Error(data.error.message)
      
    // Simplificando o clculo sumariando todos os valores do perodo retornado
    const reachData = data.data.find((m: any) => m.name === 'reach')?.values || []
    const totalReach = reachData.reduce((acc: number, val: any) => acc + val.value, 0)
    
    const impressionsData = data.data.find((m: any) => m.name === 'impressions')?.values || []
    const totalImpressions = impressionsData.reduce((acc: number, val: any) => acc + val.value, 0)
    
    const viewsData = data.data.find((m: any) => m.name === 'profile_views')?.values || []
    const totalViews = viewsData.reduce((acc: number, val: any) => acc + val.value, 0)

    const clicksData = data.data.find((m: any) => m.name === 'website_clicks')?.values || []
    const totalClicks = clicksData.reduce((acc: number, val: any) => acc + val.value, 0)

    // PERODO ANTERIOR (DELTA)
    const prevUntil = since; // O at do anterior  o desde do atual
    const prevSince = prevUntil - (safeDays * 86400);
    const prevUrl = `https://graph.facebook.com/v19.0/${igAccountId}/insights?metric=impressions,reach,profile_views,website_clicks&period=day&since=${prevSince}&until=${prevUntil}&access_token=${accessToken}`
    
    let prevTotalReach = 0;
    let prevTotalImpressions = 0;
    
    try {
      const prevRes = await fetch(prevUrl)
      const prevData = await prevRes.json()
      if (!prevData.error && prevData.data) {
        const pReach = prevData.data.find((m: any) => m.name === 'reach')?.values || []
        prevTotalReach = pReach.reduce((a: number, v: any) => a + v.value, 0)
        
        const pImp = prevData.data.find((m: any) => m.name === 'impressions')?.values || []
        prevTotalImpressions = pImp.reduce((a: number, v: any) => a + v.value, 0)
        
        const pViews = prevData.data.find((m: any) => m.name === 'profile_views')?.values || []
        let prevTotalViews = pViews.reduce((a: number, v: any) => a + v.value, 0)

        const pClicks = prevData.data.find((m: any) => m.name === 'website_clicks')?.values || []
        let prevTotalClicks = pClicks.reduce((a: number, v: any) => a + v.value, 0)
      }
    } catch(e) {
      console.error('Erro ao buscar periodo anterior', e)
    }

    // Calcula Delta %
    const calcDelta = (current: number, prev: number) => {
      if (prev === 0) return current > 0 ? 100 : 0;
      return ((current - prev) / prev) * 100;
    }

    const reachDelta = calcDelta(totalReach, prevTotalReach);
    const impressionsDelta = calcDelta(totalImpressions, prevTotalImpressions);
    // Para simplificar o Delta, vamos usar 0 caso falhe a query de prevTotalViews que no declarei escopo fora
    const viewsDelta = calcDelta(totalViews, 0); 
    const clicksDelta = calcDelta(totalClicks, 0);

    // Formata o histrico dirio para o grfico
    const history = reachData.map((reachItem: any, index: number) => {
      const impItem = impressionsData[index]
      const viewsItem = viewsData[index]
      const clicksItem = clicksData[index]
      
      // end_time vem no formato ISO, ex: 2024-10-05T07:00:00+0000
      const dateStr = new Date(reachItem.end_time).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

      return {
        date: dateStr,
        reach: reachItem.value,
        impressions: impItem ? impItem.value : 0,
        profile_views: viewsItem ? viewsItem.value : 0,
        website_clicks: clicksItem ? clicksItem.value : 0
      }
    })

    return {
      total: {
        reach: totalReach,
        reachDelta: reachDelta,
        impressions: totalImpressions,
        impressionsDelta: impressionsDelta,
        profileViews: totalViews,
        websiteClicks: totalClicks
      },
      history
    }
  } catch (error) {
    console.error('Erro ao buscar Insights IG:', error)
    return { total: { reach: 0, reachDelta: 0, impressions: 0, impressionsDelta: 0 }, history: [] }
  }
}

export async function getFacebookPageInsights(pageId: string, accessToken: string, days: number = 28) {
  try {
    const safeDays = Math.min(days, 30);
    const until = Math.floor(Date.now() / 1000);
    const since = until - (safeDays * 86400);

    const url = `https://graph.facebook.com/v19.0/${pageId}/insights?metric=page_engaged_users,page_impressions,page_fan_adds&period=day&since=${since}&until=${until}&access_token=${accessToken}`
    const res = await fetch(url)
    const data = await res.json()
    
    if (data.error) throw new Error(data.error.message)
      
    const engagedData = data.data.find((m: any) => m.name === 'page_engaged_users')?.values || []
    const totalEngaged = engagedData.reduce((acc: number, val: any) => acc + val.value, 0)
    
    const impressionsData = data.data.find((m: any) => m.name === 'page_impressions')?.values || []
    const totalImpressions = impressionsData.reduce((acc: number, val: any) => acc + val.value, 0)
    
    const fanAddsData = data.data.find((m: any) => m.name === 'page_fan_adds')?.values || []
    const totalFanAdds = fanAddsData.reduce((acc: number, val: any) => acc + val.value, 0)

    const prevUntil = since;
    const prevSince = prevUntil - (safeDays * 86400);
    const prevUrl = `https://graph.facebook.com/v19.0/${pageId}/insights?metric=page_engaged_users,page_impressions,page_fan_adds&period=day&since=${prevSince}&until=${prevUntil}&access_token=${accessToken}`
    
    let prevTotalEngaged = 0;
    let prevTotalImpressions = 0;
    
    try {
      const prevRes = await fetch(prevUrl)
      const prevData = await prevRes.json()
      if (!prevData.error && prevData.data) {
        const pEngaged = prevData.data.find((m: any) => m.name === 'page_engaged_users')?.values || []
        prevTotalEngaged = pEngaged.reduce((a: number, v: any) => a + v.value, 0)
        
        const pImp = prevData.data.find((m: any) => m.name === 'page_impressions')?.values || []
        prevTotalImpressions = pImp.reduce((a: number, v: any) => a + v.value, 0)
      }
    } catch(e) {
      console.error('Erro ao buscar periodo anterior FB', e)
    }

    const calcDelta = (current: number, prev: number) => {
      if (prev === 0) return current > 0 ? 100 : 0;
      return ((current - prev) / prev) * 100;
    }

    const engagedDelta = calcDelta(totalEngaged, prevTotalEngaged);
    const impressionsDelta = calcDelta(totalImpressions, prevTotalImpressions);

    const history = engagedData.map((engagedItem: any, index: number) => {
      const impItem = impressionsData[index]
      const dateStr = new Date(engagedItem.end_time).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

      return {
        date: dateStr,
        engaged_users: engagedItem.value,
        impressions: impItem ? impItem.value : 0
      }
    })

    return {
      total: {
        engagedUsers: totalEngaged,
        engagedDelta: engagedDelta,
        impressions: totalImpressions,
        impressionsDelta: impressionsDelta,
        newFans: totalFanAdds
      },
      history
    }
  } catch (error) {
    console.error('Erro getFacebookPageInsights:', error)
    return null
  }
}

export async function getInstagramPosts(igAccountId: string, accessToken: string, days: number = 28) {
  try {
    const url = `https://graph.facebook.com/v19.0/${igAccountId}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&limit=50&access_token=${accessToken}`
    const res = await fetch(url)
    const data = await res.json()
    
    if (data.error) throw new Error(data.error.message)
    if (!data.data || data.data.length === 0) return []

    const thresholdDate = new Date()
    thresholdDate.setDate(thresholdDate.getDate() - days)

    const recentPosts = data.data.filter((post: any) => new Date(post.timestamp) >= thresholdDate)
    
    // Sort by total engagement (likes + comments)
    const sorted = recentPosts.sort((a: any, b: any) => {
      const engA = (a.like_count || 0) + (a.comments_count || 0)
      const engB = (b.like_count || 0) + (b.comments_count || 0)
      return engB - engA
    })

    // Return top 3
    return sorted.slice(0, 3)
  } catch (error) {
    console.error('Erro getInstagramPosts:', error)
    return []
  }
}

export async function getFacebookPosts(pageId: string, accessToken: string, days: number = 28) {
  try {
    const url = `https://graph.facebook.com/v19.0/${pageId}/published_posts?fields=id,message,created_time,full_picture,permalink_url,likes.summary(true),comments.summary(true)&limit=50&access_token=${accessToken}`
    const res = await fetch(url)
    const data = await res.json()
    
    if (data.error) throw new Error(data.error.message)
    if (!data.data || data.data.length === 0) return []

    const thresholdDate = new Date()
    thresholdDate.setDate(thresholdDate.getDate() - days)

    const recentPosts = data.data.filter((post: any) => new Date(post.created_time) >= thresholdDate)
    
    // Sort by total engagement
    const sorted = recentPosts.sort((a: any, b: any) => {
      const engA = (a.likes?.summary?.total_count || 0) + (a.comments?.summary?.total_count || 0)
      const engB = (b.likes?.summary?.total_count || 0) + (b.comments?.summary?.total_count || 0)
      return engB - engA
    })

    // Return top 3 formatados de forma parecida com IG
    return sorted.slice(0, 3).map((p: any) => ({
      id: p.id,
      caption: p.message,
      media_url: p.full_picture,
      permalink: p.permalink_url,
      timestamp: p.created_time,
      like_count: p.likes?.summary?.total_count || 0,
      comments_count: p.comments?.summary?.total_count || 0
    }))
  } catch (error) {
    console.error('Erro getFacebookPosts:', error)
    return []
  }
}