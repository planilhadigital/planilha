import { NextResponse } from 'next/server'

export async function GET() {
  const appId = process.env.META_APP_ID
  const baseUrl = process.env.NODE_ENV === 'production' ? 'https://planilha.digital' : (process.env.NEXTAUTH_URL || 'http://localhost:3000')
  const redirectUri = `${baseUrl}/api/meta/callback`
  
  // Permissões para App tipo Consumidor/Nenhum
  const scopes = 'public_profile,pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_manage_insights,instagram_content_publish,business_management'

  const facebookAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code`

  return NextResponse.redirect(facebookAuthUrl)
}
