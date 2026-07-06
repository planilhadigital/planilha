import type { Metadata } from 'next'
import AuthProvider from '@/components/AuthProvider'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Planilha digital — Gestão de Marketing Digital',
  description: 'Plataforma de relatórios, programação de posts e planejamento para agências de marketing. Powered by Ilha Digital.',
  keywords: 'marketing digital, relatórios, meta, instagram, facebook, agência, planejamento, planilha.digital',
  metadataBase: new URL('https://planilha.digital'),
  openGraph: {
    title: 'Planilha digital — Gestão de Marketing Digital',
    description: 'Plataforma de relatórios, programação de posts e planejamento para agências de marketing.',
    url: 'https://planilha.digital',
    siteName: 'Planilha digital',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Planilha digital',
    description: 'Gestão de marketing digital para agências.',
  },
  alternates: {
    canonical: 'https://planilha.digital',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              style: {
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid #333'
              },
              success: { iconTheme: { primary: '#22C55E', secondary: '#fff' } },
              error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } }
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
