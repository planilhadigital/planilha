import { NextResponse } from 'next/server'

export async function GET() {
  const appId = process.env.META_APP_ID
  const baseUrl = process.env.NODE_ENV === 'production' ? 'https://planilha.digital' : (process.env.NEXTAUTH_URL || 'http://localhost:3000')
  const redirectUri = `${baseUrl}/api/meta/callback`
  
  // ID de Configuração do Facebook Login for Business (criado no painel da Meta)
  const configId = '1404033698444438'

  const facebookAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&config_id=${configId}&response_type=code`

  return NextResponse.redirect(facebookAuthUrl)
}
