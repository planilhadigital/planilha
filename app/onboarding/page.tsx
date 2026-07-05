'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import { toast } from 'react-hot-toast'

const onboardingSteps = [
  {
    id: 1,
    title: 'Defina a sua atuação profissional',
    subtitle: 'Ajustamos a estrutura de relatórios da planILHA com base no seu perfil de uso diário.',
  },
  {
    id: 2,
    title: 'Seu nicho e orçamento de mercado',
    subtitle: 'Seus dados nos ajudam a selecionar referências de mercado para a sua primeira análise.',
  },
  {
    id: 3,
    title: 'Canais digitais em uso ativo',
    subtitle: 'Quais canais de divulgação digital contam com esforços ativos da sua marca atualmente?',
  },
  {
    id: 4,
    title: 'Seu Diagnóstico Preliminar',
    subtitle: 'Com base nas suas respostas, estruturamos uma estratégia inicial de canais para o seu setor.',
  },
]

export default function VisitorOnboardingWizard() {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    personaType: '',
    marketNiche: '',
    marketingInvestment: '',
    primaryChannels: [] as string[],
    primaryChannelUrl: '',
  })

  const updateForm = (key: string, value: string) => setForm({ ...form, [key]: value })
  
  const toggleChannelSelection = (channel: string) => {
    const isSelected = form.primaryChannels.includes(channel)
    const updatedChannels = isSelected
      ? form.primaryChannels.filter((item) => item !== channel)
      : [...form.primaryChannels, channel]
    setForm({ ...form, primaryChannels: updatedChannels })
  }

  const goToNextStep = () => {
    if (activeStep < 4) setActiveStep(activeStep + 1)
  }

  const goToPrevStep = () => {
    if (activeStep > 1) setActiveStep(activeStep - 1)
  }

  const handleFormSubmission = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error('Erro ao salvar')
      goToNextStep()
    } catch (error) {
      toast.error('Falha ao salvar diagnóstico. Tente novamente.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const currentProgress = (activeStep / onboardingSteps.length) * 100

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>pI</div>
          <span className={styles.logoText}>planILHA</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Espaço de Integração de Agência
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.progressBarContainer}>
            <div className={styles.progressBar} style={{ width: `${currentProgress}%` }} />
          </div>

          <div className={styles.stepIndicator}>
            <span>Passo {activeStep} de {onboardingSteps.length}</span>
            <span>{Math.round(currentProgress)}% Completo</span>
          </div>

          <h1 className={styles.title}>{onboardingSteps[activeStep - 1].title}</h1>
          <p className={styles.subtitle}>{onboardingSteps[activeStep - 1].subtitle}</p>

          <div style={{ minHeight: '220px' }}>
            {activeStep === 1 && (
              <div className={styles.grid}>
                <button
                  onClick={() => updateForm('personaType', 'DONO_MARCA')}
                  className={`${styles.optionButton} ${form.personaType === 'DONO_MARCA' ? styles.selected : ''}`}
                >
                  <div className={styles.optionIcon}>📈</div>
                  <div className={styles.optionTitle}>Dono de Marca / E-commerce</div>
                  <div className={styles.optionDesc}>Procuro uma agência para gerenciar campanhas e obter relatórios unificados.</div>
                </button>
                <button
                  onClick={() => updateForm('personaType', 'PROFISSIONAL_MARKETING')}
                  className={`${styles.optionButton} ${form.personaType === 'PROFISSIONAL_MARKETING' ? styles.selected : ''}`}
                >
                  <div className={styles.optionIcon}>💼</div>
                  <div className={styles.optionTitle}>Profissional Independente</div>
                  <div className={styles.optionDesc}>Quero gerenciar a aprovação de posts e os resultados dos meus clientes em um só lugar.</div>
                </button>
              </div>
            )}

            {activeStep === 2 && (
              <div>
                <span className={styles.inputLabel}>Qual seu nicho de atuação?</span>
                <div className={styles.grid4}>
                  {['E-commerce', 'Infoprodutos', 'B2B SaaS', 'Serviços Médicos'].map((niche) => (
                    <button
                      key={niche}
                      onClick={() => updateForm('marketNiche', niche)}
                      className={`${styles.smallButton} ${form.marketNiche === niche ? styles.selected : ''}`}
                    >
                      {niche}
                    </button>
                  ))}
                </div>

                <span className={styles.inputLabel}>Orçamento Mensal Estimado</span>
                <div className={styles.grid3}>
                  {[
                    { key: 'LOW', value: 'Até R$ 5k' },
                    { key: 'MID', value: 'R$ 5k a R$ 20k' },
                    { key: 'HIGH', value: 'Acima de R$ 20k' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => updateForm('marketingInvestment', item.key)}
                      className={`${styles.optionButton} ${form.marketingInvestment === item.key ? styles.selected : ''}`}
                      style={{ padding: '1rem' }}
                    >
                      <div className={styles.optionTitle}>{item.value}</div>
                      <div className={styles.optionDesc}>Mídia/mês</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div>
                <span className={styles.inputLabel}>Canais com Atividades Ativas</span>
                <div className={styles.flexWrap}>
                  {['Instagram', 'Meta Ads', 'Google Ads', 'TikTok Ads', 'LinkedIn Ads'].map((channel) => (
                    <button
                      key={channel}
                      onClick={() => toggleChannelSelection(channel)}
                      className={`${styles.smallButton} ${form.primaryChannels.includes(channel) ? styles.selected : ''}`}
                      style={{ borderRadius: '20px' }}
                    >
                      {channel}
                    </button>
                  ))}
                </div>

                <span className={styles.inputLabel}>Endereço do seu Site ou Rede Social</span>
                <input
                  type="url"
                  placeholder="https://exemplo.com.br"
                  className={styles.input}
                  value={form.primaryChannelUrl}
                  onChange={(e) => updateForm('primaryChannelUrl', e.target.value)}
                />
              </div>
            )}

            {activeStep === 4 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}>✓</div>
                <h3 className={styles.title}>Pronto! Seu perfil foi analisado.</h3>
                <p className={styles.subtitle} style={{ marginBottom: 0 }}>
                  Para liberar seu acesso ao painel de simulação da planILHA e receber uma proposta personalizada, selecione o melhor horário abaixo:
                </p>

                <div className={styles.calContainer}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Diagnóstico Rápido</span>
                  <h4 style={{ margin: '0.25rem 0', color: '#fff' }}>Sessão Estratégica (15 min)</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Reunião de alinhamento com especialista para o nicho: {form.marketNiche || 'E-commerce'}.
                  </p>
                  
                  <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: 'var(--r-md)', textAlign: 'center', border: '1px solid var(--border)' }}>
                    <div style={{ marginBottom: '1rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Agendador de Reuniões (Calendly)</div>
                    <button className={styles.btnNext} style={{ margin: '0 auto' }}>Abrir Calendário Interativo</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.footer}>
            {activeStep > 1 && activeStep < 4 ? (
              <button onClick={goToPrevStep} className={styles.btnBack}>Voltar</button>
            ) : <div />}

            {activeStep < 3 ? (
              <button 
                onClick={goToNextStep} 
                className={styles.btnNext}
                disabled={activeStep === 1 && !form.personaType}
              >
                Continuar
              </button>
            ) : activeStep === 3 ? (
              <button 
                onClick={handleFormSubmission} 
                className={styles.btnNext}
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Concluir Diagnóstico'}
              </button>
            ) : (
              <button onClick={() => router.push('/dashboard/sandbox')} className={styles.btnDemo}>
                Acessar Área de Demonstração
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
