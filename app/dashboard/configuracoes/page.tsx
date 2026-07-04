import styles from './page.module.css'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = {
  title: 'Configurações — planILHA',
}

export default async function ConfiguracoesPage() {
  const session = await getServerSession(authOptions)
  
  let isMetaConnected = false
  let empresa = null

  if (session?.user?.id) {
    const userEmpresas = await prisma.empresa.findMany({
      where: { usuarios: { some: { id: session.user.id } } }
    })
    
    if (userEmpresas.length > 0) {
      empresa = userEmpresas[0]
      if (empresa.metaAccessToken && empresa.metaPageId) {
        isMetaConnected = true
      }
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Configurações</h1>
        <p className={styles.subtitle}>Gerencie as integrações da sua conta</p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Integrações</h2>
        </div>
        
        <div className={styles.integrationItem}>
          <div className={styles.integrationInfo}>
            <div className={styles.integrationIcon}>
              {/* Meta Icon placeholder */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7v-3h3V9.5C10 6.57 11.74 5 14.38 5c1.29 0 2.62.23 2.62.23v2.88h-1.48c-1.45 0-1.9.9-1.9 1.82V12h3.25l-.52 3h-2.73v6.8c4.56-.93 8-4.96 8-9.8 0-5.52-4.48-10-10-10z"/>
              </svg>
            </div>
            <div>
              <h3 className={styles.integrationName}>Facebook & Instagram</h3>
              <p className={styles.integrationDesc}>
                {isMetaConnected 
                  ? 'Conectado. A plataforma já pode ler insights e agendar posts.' 
                  : 'Conecte sua conta para habilitar o agendamento de posts e os relatórios automáticos.'}
              </p>
            </div>
          </div>
          
          {isMetaConnected ? (
            <button className={styles.btnSuccess} disabled>
              Conectado
            </button>
          ) : (
            <Link href="/api/meta/login" className={styles.btnConnect}>
              Conectar Conta
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
