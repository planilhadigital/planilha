'use client'

import React from 'react'
import { signOut } from 'next-auth/react'
import styles from './page.module.css'

export default function VisitorOnboarding() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>pI</div>
        </div>
        
        <h1 className={styles.title}>Bem-vindo à planILHA</h1>
        <p className={styles.subtitle}>
          Sua conta foi criada com sucesso! No entanto, você ainda não está conectado a nenhuma agência ou workspace.
          <br /><br />
          Para liberar o seu acesso ao painel completo, entre em contato com a nossa equipe para conhecermos melhor o seu projeto.
        </p>

        <a 
          href="https://wa.me/seunumerodewhatsapp" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.btnPrimary}
        >
          Falar com a Ilha Digital
        </a>

        <button onClick={() => signOut({ callbackUrl: '/login' })} className={styles.btnLogout}>
          Sair da conta
        </button>
      </div>
    </div>
  )
}
