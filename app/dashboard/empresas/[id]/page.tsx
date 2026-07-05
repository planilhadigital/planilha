'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import styles from './page.module.css'

export default function EmpresaSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [empresa, setEmpresa] = useState<any>(null)
  const [metaPages, setMetaPages] = useState<any[]>([])
  const [selectedPageId, setSelectedPageId] = useState('')
  const [loading, setLoading] = useState(true)
  
  const [activeTab, setActiveTab] = useState<'metricas' | 'config' | 'posts'>('metricas')
  const [insightsData, setInsightsData] = useState<any>(null)
  const [loadingInsights, setLoadingInsights] = useState(false)
  
  // States para posts
  const [posts, setPosts] = useState<any[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [postForm, setPostForm] = useState({ legenda: '', dataHora: '', rede: 'Instagram', midiaUrl: '' })
  const [savingPost, setSavingPost] = useState(false)
  const [period, setPeriod] = useState(28)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        // Busca os dados da empresa
        const empRes = await fetch(`/api/empresas/${id}`)
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
  }, [id])

  useEffect(() => {
    async function loadInsights() {
      if (activeTab === 'metricas' && empresa?.igAccountId) {
        setLoadingInsights(true)
        try {
          const res = await fetch(`/api/empresas/${id}/insights?days=${period}`)
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
  }, [activeTab, empresa?.igAccountId, id, period])

  // Carrega posts se a aba for posts
  useEffect(() => {
    async function loadPosts() {
      if (activeTab === 'posts') {
        setLoadingPosts(true)
        try {
          const res = await fetch(`/api/empresas/${id}/posts`)
          if (res.ok) {
            const data = await res.json()
            setPosts(data.posts || [])
          }
        } catch (e) {
          console.error(e)
        } finally {
          setLoadingPosts(false)
        }
      }
    }
    loadPosts()
  }, [activeTab, id])

  const handleSave = async () => {
    setSaving(true)

    try {
      // Se selecionou uma página, vamos descobrir se ela tem Instagram vinculado
      const selectedPage = metaPages.find(p => p.id === selectedPageId)
      const igAccountId = selectedPage?.instagram_business_account?.id || null

      const res = await fetch(`/api/empresas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metaPageId: selectedPageId,
          igAccountId: igAccountId
        })
      })

      if (!res.ok) throw new Error('Erro ao salvar as configurações')
      
      const updated = await res.json()
      setEmpresa(updated.empresa)
      toast.success('Configurações salvas com sucesso!')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSchedulePost = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPost(true)

    try {
      const res = await fetch(`/api/empresas/${id}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postForm)
      })

      if (!res.ok) throw new Error('Erro ao agendar o post')
      
      const newPost = await res.json()
      setPosts([...posts, newPost])
      toast.success('Post agendado com sucesso!')
      setPostForm({ legenda: '', dataHora: '', rede: 'Instagram', midiaUrl: '' })
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSavingPost(false)
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

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'metricas' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('metricas')}
        >
          📊 Métricas
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'posts' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          📅 Posts
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>@{insightsData.profile.username}</h3>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <Link 
                        href={`/report/${id}?days=${period}`} 
                        target="_blank" 
                        className="btn btn-secondary btn-sm"
                      >
                        🔗 Compartilhar Relatório
                      </Link>

                      <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-elevated)', padding: '4px', borderRadius: 'var(--r-md)' }}>
                        {[7, 14, 28].map(d => (
                          <button 
                            key={d} 
                            onClick={() => setPeriod(d)}
                            className={`btn btn-sm ${period === d ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ minWidth: '40px', padding: '4px 8px', fontSize: '0.8rem' }}
                          >
                            {d}D
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className={styles.profileStats}>
                    <span><strong>{insightsData.profile.followers}</strong> Seguidores</span>
                    <span><strong>{insightsData.profile.postsCount}</strong> Posts</span>
                  </div>
                </div>
              </div>

              <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                  <div className={styles.kpiLabel}>Alcance ({period}d)</div>
                  <div className={styles.kpiValue} style={{ display: 'flex', alignItems: 'center' }}>
                    {insightsData.insights?.total?.reach || 0}
                    {insightsData.insights?.total?.reachDelta !== undefined && (
                      <span className={`${styles.deltaBadge} ${insightsData.insights.total.reachDelta >= 0 ? styles.deltaUp : styles.deltaDown}`}>
                        {insightsData.insights.total.reachDelta >= 0 ? '↑' : '↓'} {Math.abs(insightsData.insights.total.reachDelta).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.kpiCard}>
                  <div className={styles.kpiLabel}>Impressões ({period}d)</div>
                  <div className={styles.kpiValue} style={{ display: 'flex', alignItems: 'center' }}>
                    {insightsData.insights?.total?.impressions || 0}
                    {insightsData.insights?.total?.impressionsDelta !== undefined && (
                      <span className={`${styles.deltaBadge} ${insightsData.insights.total.impressionsDelta >= 0 ? styles.deltaUp : styles.deltaDown}`}>
                        {insightsData.insights.total.impressionsDelta >= 0 ? '↑' : '↓'} {Math.abs(insightsData.insights.total.impressionsDelta).toFixed(1)}%
                      </span>
                    )}
                  </div>
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

      {activeTab === 'posts' && (
        <div className={styles.grid2}>
          {/* Formulário de Agendamento */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Agendar Novo Post</h2>
            <form onSubmit={handleSchedulePost} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className={styles.label}>Rede Social</label>
                <select 
                  className={styles.select}
                  value={postForm.rede}
                  onChange={(e) => setPostForm({...postForm, rede: e.target.value})}
                >
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Ambas">Ambas (Insta + Face)</option>
                </select>
              </div>
              
              <div>
                <label className={styles.label}>URL da Imagem / Vídeo (Temporário)</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="https://..."
                  value={postForm.midiaUrl}
                  onChange={(e) => setPostForm({...postForm, midiaUrl: e.target.value})}
                />
              </div>

              <div>
                <label className={styles.label}>Legenda do Post</label>
                <textarea 
                  className={styles.input} 
                  rows={4}
                  placeholder="Escreva a legenda..."
                  value={postForm.legenda}
                  onChange={(e) => setPostForm({...postForm, legenda: e.target.value})}
                ></textarea>
              </div>

              <div>
                <label className={styles.label}>Data e Hora da Publicação</label>
                <input 
                  type="datetime-local" 
                  className={styles.input}
                  required
                  value={postForm.dataHora}
                  onChange={(e) => setPostForm({...postForm, dataHora: e.target.value})}
                />
              </div>

              <div className={styles.actions}>
                <button type="submit" className="btn btn-primary" disabled={savingPost}>
                  {savingPost ? 'Agendando...' : 'Agendar Post'}
                </button>
              </div>
            </form>
          </div>

          {/* Timeline de Posts */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Timeline de Posts</h2>
            {loadingPosts ? (
              <div className={styles.loading}>Carregando posts...</div>
            ) : posts.length === 0 ? (
              <p className={styles.subtitle}>Nenhum post agendado ainda.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {posts.map(post => (
                  <div key={post.id} className={styles.postItem}>
                    <div className={styles.postTime}>
                      {new Date(post.dataHora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                    <div className={styles.postContent}>
                      <span className={`badge badge-accent`}>{post.rede}</span>
                      <span className={`badge ${post.status === 'Agendado' ? 'badge-warning' : 'badge-success'}`}>
                        {post.status}
                      </span>
                      <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                        {post.legenda ? (post.legenda.length > 50 ? post.legenda.substring(0, 50) + '...' : post.legenda) : '[Sem legenda]'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
