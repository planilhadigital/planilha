import type { Metadata } from 'next'
import AuthProvider from '@/components/AuthProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'planILHA — Gestão de Marketing Digital',
  description: 'Plataforma de relatórios, programação de posts e planejamento para agências de marketing. Powered by Ilha Digital.',
  keywords: 'marketing digital, relatórios, meta, instagram, facebook, agência, planejamento, planilha.digital',
  metadataBase: new URL('https://planilha.digital'),
  openGraph: {
    title: 'planILHA — Gestão de Marketing Digital',
    description: 'Plataforma de relatórios, programação de posts e planejamento para agências de marketing.',
    url: 'https://planilha.digital',
    siteName: 'planILHA',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'planILHA',
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
