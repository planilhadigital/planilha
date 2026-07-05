import { NextResponse } from 'next/server'

export async function GET() {
  const appId = process.env.META_APP_ID
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/meta/callback`
  
  // Permissões iniciais para conectar a conta (iremos pedir as do Instagram depois)
  const scopes = 'public_profile,pages_show_list'

  const facebookAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code`

  return NextResponse.redirect(facebookAuthUrl)
}
