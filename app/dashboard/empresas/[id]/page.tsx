'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import styles from './page.module.css'

export default function EmpresaSettingsPage({ params }: { params: { id: string } }) {
  const [empresa, setEmpresa] = useState<any>(null)
  const [metaPages, setMetaPages] = useState<any[]>([])
  const [selectedPageId, setSelectedPageId] = useState('')
  
  const [activeTab, setActiveTab] = useState<'metricas' | 'config'>('metricas')
  const [insightsData, setInsightsData] = useState<any>(null)
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        // Busca os dados da empresa
        const empRes = await fetch(`/api/empresas/${params.id}`)
        if (!empRes.ok) throw new Error('Empresa não encontrada')
        const empData = await empRes.json()
        setEmpresa(empData)
        setSelectedPageId(empData.metaPageId || '')

        // Busca as páginas do Facebook do usuário
        const pagesRes = await fetch('/api/meta/pages')
        if (pagesRes.ok) {
          const pagesData = await pagesRes.json()
          setMetaPages(pagesData.pages || [])
        } else {
          const pagesErr = await pagesRes.json()
          if (pagesErr.error === 'Conta da Meta não conectada') {
            // O usuário ainda não conectou o próprio Facebook
            setMetaPages([])
          }
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [params.id])

  useEffect(() => {
    async function loadInsights() {
      if (activeTab === 'metricas' && empresa?.igAccountId) {
        setLoadingInsights(true)
        try {
          const res = await fetch(`/api/empresas/${params.id}/insights`)
          if (res.ok) {
            const data = await res.json()
            setInsightsData(data)
          }
        } catch (e) {
          console.error(e)
        } finally {
          setLoadingInsights(false)
        }
      }
    }
    loadInsights()
  }, [activeTab, empresa?.igAccountId, params.id])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Se selecionou uma página, vamos descobrir se ela tem Instagram vinculado
      const selectedPage = metaPages.find(p => p.id === selectedPageId)
      const igAccountId = selectedPage?.instagram_business_account?.id || null

      const res = await fetch(`/api/empresas/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metaPageId: selectedPageId,
          igAccountId: igAccountId
        })
      })

      if (!res.ok) throw new Error('Erro ao salvar as configurações')
      
      setSuccess('Configurações salvas com sucesso!')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className={styles.page}><div className={styles.loading}>Carregando...</div></div>
  if (!empresa) return <div className={styles.page}><div className={styles.error}>Empresa não encontrada</div></div>

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{empresa.name}</h1>
          <p className={styles.subtitle}>Configurações da Empresa</p>
        </div>
        <Link href="/dashboard" className="btn btn-ghost">
          ← Voltar ao Dashboard
        </Link>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'metricas' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('metricas')}
        >
          📊 Métricas
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'config' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('config')}
        >
          ⚙️ Configurações
        </button>
      </div>

      {activeTab === 'metricas' && (
        <div className={styles.metricasContainer}>
          {!empresa.igAccountId ? (
            <div className={styles.alertWarning}>
              Para ver as métricas, vá na aba Configurações e vincule uma Página do Facebook com Instagram.
            </div>
          ) : loadingInsights ? (
            <div className={styles.loading}>Buscando dados em tempo real da Meta...</div>
          ) : insightsData?.profile ? (
            <div>
              <div className={styles.profileCard}>
                <img src={insightsData.profile.avatar} alt="Avatar" className={styles.profileAvatar} />
                <div className={styles.profileInfo}>
                  <h3>@{insightsData.profile.username}</h3>
                  <div className={styles.profileStats}>
                    <span><strong>{insightsData.profile.followers}</strong> Seguidores</span>
                    <span><strong>{insightsData.profile.postsCount}</strong> Posts</span>
                  </div>
                </div>
              </div>

              <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                  <div className={styles.kpiLabel}>Alcance (28d)</div>
                  <div className={styles.kpiValue}>{insightsData.insights?.total?.reach || 0}</div>
                </div>
                <div className={styles.kpiCard}>
                  <div className={styles.kpiLabel}>Impressões (28d)</div>
                  <div className={styles.kpiValue}>{insightsData.insights?.total?.impressions || 0}</div>
                </div>
              </div>

              {/* GRÁFICO RECHARTS */}
              <div className={styles.chartContainer}>
                <h3 className={styles.chartTitle}>Crescimento de Alcance e Impressões</h3>
                {insightsData.insights?.history && insightsData.insights.history.length > 0 ? (
                  <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                      <LineChart data={insightsData.insights.history} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          stroke="#666" 
                          tick={{ fill: '#666', fontSize: 12 }} 
                          tickMargin={10} 
                        />
                        <YAxis 
                          stroke="#666" 
                          tick={{ fill: '#666', fontSize: 12 }} 
                          tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="reach" 
                          name="Alcance"
                          stroke="#FA4616" 
                          strokeWidth={3} 
                          dot={false}
                          activeDot={{ r: 6, fill: '#FA4616', stroke: '#050505', strokeWidth: 2 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="impressions" 
                          name="Impressões"
                          stroke="#4A90E2" 
                          strokeWidth={3} 
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className={styles.loading}>Nenhum dado de histórico disponível para os últimos 28 dias.</div>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.error}>Não foi possível carregar os insights. Talvez o token tenha expirado.</div>
          )}
        </div>
      )}

      {activeTab === 'config' && (
        <div className={styles.card}>
        <h2 className={styles.cardTitle}>Integração com Redes Sociais</h2>
        
        {metaPages.length === 0 ? (
          <div className={styles.alertWarning}>
            <span>⚠️ Sua conta não possui Páginas do Facebook vinculadas ou você ainda não conectou seu Facebook na aba de Configurações globais.</span>
            <Link href="/dashboard/configuracoes" className="btn btn-primary" style={{ width: 'fit-content' }}>
              Ir para Configurações Globais
            </Link>
          </div>
        ) : (
          <div className={styles.formGroup}>
            <label className={styles.label}>Selecione a Página do Facebook desta empresa</label>
            <select 
              className={styles.select}
              value={selectedPageId}
              onChange={(e) => setSelectedPageId(e.target.value)}
            >
              <option value="">-- Nenhuma página vinculada --</option>
              {metaPages.map(page => (
                <option key={page.id} value={page.id}>
                  {page.name} {page.instagram_business_account ? '(+ Instagram)' : ''}
                </option>
              ))}
            </select>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Dica: Para o Instagram funcionar, ele precisa ser uma conta Profissional/Criador vinculada à sua Página do Facebook.
            </p>
          </div>
        )}

        <div className={styles.actions}>
          <button 
            className="btn btn-primary" 
            onClick={handleSave} 
            disabled={saving || metaPages.length === 0}
          >
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </div>
      )}
    </div>
  )
}
