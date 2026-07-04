import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Domínio registrado: planilha.digital
  // App servido na raiz do domínio
  basePath: '',
  
  // Imagens externas permitidas (logos de empresas, avatares)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ilhadigital.com.br' },
      { protocol: 'https', hostname: '*.fbcdn.net' },
      { protocol: 'https', hostname: '*.cdninstagram.com' },
    ],
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
