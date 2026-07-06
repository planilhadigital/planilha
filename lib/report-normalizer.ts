// lib/report-normalizer.ts

export interface MetricsPayload {
  platform: 'INSTAGRAM' | 'FACEBOOK';
  days: number;
  profile: {
    followers: number;
    postsCount: number;
  };
  totals: {
    reach: number;
    reachDelta: number;
    impressions: number;
    impressionsDelta: number;
    profileViews?: number;
    websiteClicks?: number;
    engagedUsers?: number;
    engagedDelta?: number;
    newFans?: number;
  };
  posts: any[];
  trend: 'crescimento' | 'estável' | 'queda';
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'k';
  return num.toString();
}

function determineTrend(primaryDelta: number): 'crescimento' | 'estável' | 'queda' {
  if (primaryDelta > 5) return 'crescimento';
  if (primaryDelta < -5) return 'queda';
  return 'estável';
}

export function normalizeMetrics(
  platform: 'INSTAGRAM' | 'FACEBOOK',
  days: number,
  profile: any,
  insights: any,
  postsData: any[]
): MetricsPayload {
  const isInsta = platform === 'INSTAGRAM';
  
  // Sort posts by engagement (likes + comments)
  const sortedPosts = [...(postsData || [])].sort((a, b) => {
    const engA = (a.like_count || 0) + (a.comments_count || 0);
    const engB = (b.like_count || 0) + (b.comments_count || 0);
    return engB - engA;
  });

  const primaryDelta = isInsta ? (insights?.total?.reachDelta || 0) : (insights?.total?.engagedDelta || insights?.total?.impressionsDelta || 0);
  const trend = determineTrend(primaryDelta);

  return {
    platform,
    days,
    profile: {
      followers: profile?.followers || 0,
      postsCount: profile?.postsCount || 0,
    },
    totals: {
      reach: insights?.total?.reach || 0,
      reachDelta: insights?.total?.reachDelta || 0,
      impressions: insights?.total?.impressions || 0,
      impressionsDelta: insights?.total?.impressionsDelta || 0,
      profileViews: insights?.total?.profileViews || 0,
      websiteClicks: insights?.total?.websiteClicks || 0,
      engagedUsers: insights?.total?.engagedUsers || 0,
      engagedDelta: insights?.total?.engagedDelta || 0,
      newFans: insights?.total?.newFans || 0,
    },
    posts: sortedPosts,
    trend
  };
}

export function buildDeterministicFallback(metrics: MetricsPayload): any {
  return {
    template: "NEUTRAL_GRID",
    headline: `Desempenho de ${metrics.days} dias`,
    insight_summary: `Resumo gerado automaticamente para o período. A tendência geral é de ${metrics.trend}.`,
    slides: [
      {
        component_type: "StandardGrid",
        title: "Visão Geral",
        properties: {
          kpis: [
            {
              title: metrics.platform === 'INSTAGRAM' ? "Alcance" : "Impressões",
              value: formatNumber(metrics.platform === 'INSTAGRAM' ? metrics.totals.reach : metrics.totals.impressions),
              trend: metrics.trend === 'crescimento' ? "positivo" : metrics.trend === 'queda' ? "negativo" : "neutro"
            },
            {
              title: "Impressões",
              value: formatNumber(metrics.totals.impressions),
              trend: "neutro"
            },
            {
              title: "Seguidores",
              value: formatNumber(metrics.profile.followers),
              trend: "neutro"
            }
          ]
        }
      }
    ]
  };
}
