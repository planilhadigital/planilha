'use client'

import React from 'react'
import { signOut } from 'next-auth/react'
import styles from './page.module.css'
import Logo from '@/components/Logo'
import { MessageCircle, LogOut } from 'lucide-react'

export default function VisitorOnboarding() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <Logo width={160} height={38} />
        </div>
        
        <h1 className={styles.title}>Bem-vindo à planILHA</h1>
        <p className={styles.subtitle}>
          Sua conta foi criada com sucesso! No entanto, você ainda não está conectado a nenhuma agência ou workspace.
        </p>
        <p className={styles.subtitle} style={{ marginBottom: 0 }}>
          Para liberar o seu acesso ao painel completo, entre em contato com a nossa equipe para conhecermos melhor o seu projeto.
        </p>

        <div className={styles.divider} />

        <a
          href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20quero%20saber%20mais%20sobre%20a%20planILHA!"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.btnPrimary}
        >
          <MessageCircle size={18} />
          Falar com a Ilha Digital
        </a>

        <button onClick={() => signOut({ callbackUrl: '/login' })} className={styles.btnLogout}>
          Sair da conta
        </button>
      </div>
    </div>
  )
}
