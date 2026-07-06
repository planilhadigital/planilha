'use client'

import { useEffect, useState, use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import GenerateReportButton from '@/components/reports/GenerateReportButton'
import styles from './page.module.css'
import { CalendarDays, Settings, BarChart3, PenSquare, CheckCircle2, ChevronLeft, ChevronRight, Download, Eye, UploadCloud, ClipboardList, Plus, ArrowRight } from 'lucide-react'
import { FaInstagram, FaFacebook, FaGlobe } from 'react-icons/fa'
import GlobalPostCreator from '../../posts/GlobalPostCreator'
import PlanejamentoBoard from '../../planejamentos/PlanejamentoBoard'

export default function EmpresaSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [empresa, setEmpresa] = useState<any>(null)
  const [metaPages, setMetaPages] = useState<any[]>([])
  const [selectedPageId, setSelectedPageId] = useState('')
  const [loading, setLoading] = useState(true)
  
  const [activeTab, setActiveTab] = useState<'metricas' | 'posts' | 'calendario' | 'leads' | 'config' | 'planejamentos'>('metricas')
  const [empresaPlans, setEmpresaPlans] = useState<any[]>([])
  const [activePlanId, setActivePlanId] = useState<string | null>(null)
  const [insightsData, setInsightsData] = useState<any>(null)
  const [loadingInsights, setLoadingInsights] = useState(false)
  
  // States para posts
  const [posts, setPosts] = useState<any[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [postForm, setPostForm] = useState({ legenda: '', canais: { instagram: true, facebook: false }, formato: 'Feed', midiaUrl: '' })
  const [datas, setDatas] = useState([{ date: '', time: '' }])
  const [advancedConfig, setAdvancedConfig] = useState({ location: '', disableComments: false, hideLikes: false, shareToFeed: true })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [savingPost, setSavingPost] = useState(false)
  
  // Config
  const [saving, setSaving] = useState(false)
  const [websiteUrl, setWebsiteUrl] = useState('')
  
  // Calendário
  const [currentDate, setCurrentDate] = useState(new Date())

  const router = useRouter()
  
  // Refs para upload de arquivo
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const postMediaInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const empRes = await fetch(`/api/empresas/${id}`)
        if (!empRes.ok) throw new Error('Empresa não encontrada')
        const empData = await empRes.json()
        setEmpresa(empData)
        setSelectedPageId(empData.metaPageId || '')
        setWebsiteUrl(empData.websiteUrl || '')

        const pagesRes = await fetch('/api/meta/pages')
        if (pagesRes.ok) {
          const pagesData = await pagesRes.json()
          setMetaPages(pagesData.pages || [])
        }
      } catch (err: any) {
        toast.error(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  // Carrega posts e leads dependendo da aba
  useEffect(() => {
    async function loadTabData() {
      if (activeTab === 'posts' || activeTab === 'calendario') {
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
      if (activeTab === 'planejamentos') {
        loadEmpresaPlans()
      }
    }
    loadTabData()
  }, [activeTab, id])

  async function loadEmpresaPlans() {
    try {
      const res = await fetch(`/api/planejamentos?empresaId=${id}`)
      const data = await res.json()
      const plans = data.planejamentos || []
      setEmpresaPlans(plans)
      if (plans.length === 1 && !activePlanId) {
        setActivePlanId(plans[0].id)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'cover' | 'post') => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const formData = new FormData()
    formData.append('file', file)

    const loadingToast = toast.loading('Fazendo upload...')
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      if (!res.ok) throw new Error('Erro ao fazer upload')
      
      const { url } = await res.json()
      
      if (target === 'post') {
        setPostForm({ ...postForm, midiaUrl: url })
        toast.success('Mídia carregada!', { id: loadingToast })
      } else {
        // Para avatar e cover, já salva direto na empresa
        const field = target === 'avatar' ? 'avatarUrl' : 'coverUrl'
        const patchRes = await fetch(`/api/empresas/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: url })
        })
        if (!patchRes.ok) throw new Error('Erro ao salvar empresa')
        const updated = await patchRes.json()
        setEmpresa(updated)
        toast.success(`${target === 'avatar' ? 'Avatar' : 'Capa'} atualizada!`, { id: loadingToast })
      }
    } catch (e: any) {
      toast.error(e.message || 'Erro no upload', { id: loadingToast })
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Tem certeza que deseja deletar este relatório?')) return
    const loadingToast = toast.loading('Deletando relatório...')
    try {
      const res = await fetch(`/api/reports/${reportId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao deletar relatório')
      
      setEmpresa({
        ...empresa,
        relatoriosGerados: empresa.relatoriosGerados.filter((r: any) => r.id !== reportId)
      })
      toast.success('Relatório deletado!', { id: loadingToast })
    } catch (e: any) {
      toast.error(e.message || 'Erro ao deletar', { id: loadingToast })
    }
  }


  const handleSaveConfig = async () => {
    setSaving(true)
    try {
      const selectedPage = metaPages.find(p => p.id === selectedPageId)
      const igAccountId = selectedPage?.instagram_business_account?.id || null

      const res = await fetch(`/api/empresas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metaPageId: selectedPageId,
          igAccountId: igAccountId,
          websiteUrl: websiteUrl,
        })
      })

      if (!res.ok) throw new Error('Erro ao salvar as configurações')
      
      const updated = await res.json()
      setEmpresa(updated)
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
    if (!postForm.midiaUrl && postForm.formato !== 'Text') return toast.error('Anexe uma mídia!')
    if (!postForm.canais.instagram && !postForm.canais.facebook) return toast.error('Selecione pelo menos um canal!')
    
    // Converter estado para compatibilidade com API atual
    let redeFinal = 'Instagram'
    if (postForm.canais.instagram && postForm.canais.facebook) redeFinal = 'Ambas'
    else if (postForm.canais.facebook) redeFinal = 'Facebook'

    const payload = { ...postForm, rede: redeFinal }

    setSavingPost(true)
    try {
      let createdPosts = 0
      for (const dt of datas) {
        if (!dt.date || !dt.time) continue
        const isoDate = new Date(`${dt.date}T${dt.time}:00`).toISOString()
        
        const res = await fetch(`/api/empresas/${id}/posts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, dataHora: isoDate, advancedConfig })
        })

        if (res.ok) {
          const newPost = await res.json()
          setPosts(prev => [...prev, newPost])
          createdPosts++
        }
      }

      if (createdPosts === 0) throw new Error('Selecione pelo menos uma data e hora válidas')
      
      toast.success('Post agendado com sucesso!')
      setPostForm({ legenda: '', canais: { instagram: true, facebook: false }, formato: 'Feed', midiaUrl: '' })
      setDatas([{ date: '', time: '' }])
      setAdvancedConfig({ location: '', disableComments: false, hideLikes: false, shareToFeed: true })
      setShowAdvanced(false)
      setActiveTab('calendario')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSavingPost(false)
    }
  }

  // --- Função do Calendário ---
  const generateCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - startDate.getDay()) // Início no Domingo
    
    const endDate = new Date(lastDay)
    if (endDate.getDay() !== 6) {
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay())) // Fim no Sábado
    }
    
    const days = []
    let tempDate = new Date(startDate)
    while (tempDate <= endDate) {
      days.push(new Date(tempDate))
      tempDate.setDate(tempDate.getDate() + 1)
    }
    return days
  }

  if (loading) return (
    <div className={styles.page}>
      <div className="skeleton" style={{ width: '100%', height: '250px', borderRadius: 'var(--r-xl)', marginBottom: '2rem' }}></div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="skeleton" style={{ width: '120px', height: '40px', borderRadius: 'var(--r-md)' }}></div>
        <div className="skeleton" style={{ width: '120px', height: '40px', borderRadius: 'var(--r-md)' }}></div>
        <div className="skeleton" style={{ width: '120px', height: '40px', borderRadius: 'var(--r-md)' }}></div>
      </div>
      <div className="skeleton" style={{ width: '100%', height: '400px', borderRadius: 'var(--r-lg)' }}></div>
    </div>
  )
  if (!empresa) return <div className={styles.page}><div className={styles.error}>Empresa não encontrada</div></div>

  const calendarDays = generateCalendar()

  return (
    <div className={styles.page}>
      
      {/* HEADER TIPO FACEBOOK */}
      <div className={`card ${styles.premiumHeader} anim-fade-up`}>
        {empresa.coverUrl ? (
          <div className={styles.coverImage} style={{ backgroundImage: `url(${empresa.coverUrl})` }} />
        ) : (
          <div className={styles.coverEmpty}>
            <span style={{ color: 'var(--text-muted)' }}>Capa não definida</span>
          </div>
        )}
        
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            {empresa.avatarUrl ? (
              <img src={empresa.avatarUrl} alt={empresa.name} className={styles.companyLogo} />
            ) : (
              <div className={styles.companyLogo}>{empresa.name.charAt(0).toUpperCase()}</div>
            )}
            <div className={styles.companyTitleContainer}>
              <h1 className={styles.companyName}>{empresa.name}</h1>
              <div className={styles.badgesContainer}>
                {empresa.metaPageId && <span className={styles.badgeLinked} style={{display: 'inline-flex', alignItems: 'center', gap: '4px'}}><CheckCircle2 size={14} /> Página Vinculada</span>}
                {empresa.igAccountId && <span className={styles.badgeLinked} style={{display: 'inline-flex', alignItems: 'center', gap: '4px'}}><CheckCircle2 size={14} /> Insta Vinculado</span>}
              </div>
            </div>
          </div>
          <div className={styles.headerRight}>
            {empresa.websiteUrl && empresa.websiteUrl.trim() !== '' && (
              <a href={empresa.websiteUrl.startsWith('http') ? empresa.websiteUrl : `https://${empresa.websiteUrl}`} target="_blank" rel="noreferrer" className={styles.socialBtn} title="Website">
                <FaGlobe size={20} />
              </a>
            )}
            {empresa.igAccountId && (
              <a href={`https://instagram.com`} target="_blank" rel="noreferrer" className={styles.socialBtn} title="Instagram">
                <FaInstagram size={20} />
              </a>
            )}
            {empresa.metaPageId && (
              <a href={`https://facebook.com/${empresa.metaPageId}`} target="_blank" rel="noreferrer" className={styles.socialBtn} title="Facebook">
                <FaFacebook size={20} />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className={`${styles.tabs} anim-fade-up`}>
        <button className={`${styles.tab} ${activeTab === 'metricas' ? styles.tabActive : ''}`} onClick={() => setActiveTab('metricas')} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <BarChart3 size={18} /> Métricas
        </button>
        <button className={`${styles.tab} ${activeTab === 'posts' ? styles.tabActive : ''}`} onClick={() => setActiveTab('posts')} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <PenSquare size={18} /> Criar Post
        </button>
        <button className={`${styles.tab} ${activeTab === 'calendario' ? styles.tabActive : ''}`} onClick={() => setActiveTab('calendario')} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <CalendarDays size={18} /> Calendário
        </button>
        <button className={`${styles.tab} ${activeTab === 'planejamentos' ? styles.tabActive : ''}`} onClick={() => setActiveTab('planejamentos')} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <ClipboardList size={18} /> Planejamentos
        </button>
        <button className={`${styles.tab} ${activeTab === 'config' ? styles.tabActive : ''}`} onClick={() => setActiveTab('config')} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <Settings size={18} /> Configurações
        </button>
      </div>

      {activeTab === 'posts' && (
        <div style={{ marginTop: '2rem' }}>
          <GlobalPostCreator empresas={[empresa]} />
        </div>
      )}

      {activeTab === 'planejamentos' && (
        <div className="anim-fade-up">
          {activePlanId ? (
            <PlanejamentoBoard 
              id={activePlanId} 
              hideBackButton={empresaPlans.length <= 1} 
              onBack={() => setActivePlanId(null)} 
            />
          ) : (
            <div className={styles.grid}>
              {empresaPlans.map(q => (
                <div key={q.id} onClick={() => setActivePlanId(q.id)} className={`card ${styles.boardCard}`} style={{ cursor: 'pointer', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>{q.titulo}</h3>
                    {q.descricao && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>{q.descricao}</p>}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1rem', color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: '0.8rem' }}>
                      Criado em: {new Date(q.createdAt).toLocaleDateString()}
                    </span>
                    <span style={{ color: 'var(--accent)' }}><ArrowRight size={18} /></span>
                  </div>
                </div>
              ))}
              {empresaPlans.length === 0 && (
                <div className="card" style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1' }}>
                  <ClipboardList size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
                  <h3>Nenhum planejamento encontrado</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Esta empresa ainda não possui um quadro de planejamento.</p>
                  <Link href="/dashboard/planejamentos" className="btn btn-primary">
                    <Plus size={18} /> Criar Quadro
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'calendario' && (
        <div className={`card-plain ${styles.calendarWrapper} anim-fade-up`}>
          <div className={styles.calendarHeader}>
            <button className="btn btn-icon" onClick={() => {
              const d = new Date(currentDate)
              d.setMonth(d.getMonth() - 1)
              setCurrentDate(d)
            }}>&lt;</button>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
              {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
            </h2>
            <button className="btn btn-icon" onClick={() => {
              const d = new Date(currentDate)
              d.setMonth(d.getMonth() + 1)
              setCurrentDate(d)
            }}>&gt;</button>
          </div>
          <div className={styles.calendarGrid}>
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className={styles.calendarDayHeader}>{d}</div>
            ))}
            
            {calendarDays.map((day, idx) => {
              const isOtherMonth = day.getMonth() !== currentDate.getMonth()
              const isToday = day.toDateString() === new Date().toDateString()
              
              // Filtra os posts desse dia
              const dayPosts = posts.filter(p => new Date(p.dataHora).toDateString() === day.toDateString())

              return (
                <div key={idx} className={styles.calendarCell} data-other-month={isOtherMonth} data-today={isToday}>
                  <div className={styles.dayNumber}>{day.getDate()}</div>
                  {dayPosts.map(post => (
                    <div key={post.id} className={styles.calendarPostPill}>
                      {post.rede.includes('Insta') ? <FaInstagram size={12} color="#FA4616" /> : <FaFacebook size={12} color="#3B82F6" />}
                      <span>{new Date(post.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className={styles.configGrid}>
          <div className={`card-plain ${styles.configSection}`}>
            <h3>Dados Básicos</h3>
            
            <input type="file" hidden ref={coverInputRef} onChange={e => handleUpload(e, 'cover')} accept="image/*" />
            <input type="file" hidden ref={avatarInputRef} onChange={e => handleUpload(e, 'avatar')} accept="image/*" />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
              <div>
                <label className="input-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Capa da Página</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
                  {empresa.coverUrl ? (
                    <img src={empresa.coverUrl} className={styles.uploadPreviewCover} alt="Capa" />
                  ) : (
                    <div style={{ width: '100%', height: '100px', background: 'var(--bg-deep)', borderRadius: 'var(--r-md)', border: '1px dashed var(--border)' }} />
                  )}
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => coverInputRef.current?.click()} style={{ marginTop: '0.25rem' }}>
                    <UploadCloud size={16} /> Fazer Upload
                  </button>
                </div>
              </div>
              
              <div>
                <label className="input-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Foto de Perfil</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
                  {empresa.avatarUrl ? (
                    <img src={empresa.avatarUrl} className={styles.uploadPreview} alt="Avatar" />
                  ) : (
                    <div style={{ width: '64px', height: '64px', background: 'var(--bg-deep)', borderRadius: 'var(--r-md)', border: '1px dashed var(--border)' }} />
                  )}
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => avatarInputRef.current?.click()} style={{ marginTop: '0.25rem' }}>
                    <UploadCloud size={16} /> Fazer Upload
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={`card-plain ${styles.configSection}`}>
            <h3>Redes Sociais & Integrações</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Vincule a página do Facebook para puxarmos os links e acessos automaticamente. Não é mais necessário colar URLs manualmente!
            </p>
            
            {metaPages.length === 0 ? (
              <div className="alert-warning" style={{ padding: '1rem', background: 'var(--warning-dim)', border: '1px solid var(--warning)', borderRadius: 'var(--r-md)', color: 'var(--warning)' }}>
                Sua conta não possui Páginas do Facebook vinculadas.
              </div>
            ) : (
              <div className="input-group">
                <label className="input-label">Selecione a Página do Facebook desta empresa</label>
                <select 
                  className="input"
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-deep)', color: '#fff', borderRadius: 'var(--r-sm)' }}
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
                
                {selectedPageId && metaPages.find(p => p.id === selectedPageId) && (
                  <div className={styles.socialIntegrationCard}>
                    {(() => {
                      const page = metaPages.find(p => p.id === selectedPageId)
                      return (
                        <>
                          <div className={styles.socialIntegrationItem}>
                            <img src={page.picture?.data?.url || 'https://via.placeholder.com/40'} alt="FB" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{page.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Página do Facebook</div>
                            </div>
                          </div>
                          
                          {page.instagram_business_account ? (
                            <div className={`${styles.socialIntegrationItem} ${styles.socialIntegrationDivider}`}>
                              <img src={page.instagram_business_account.profile_picture_url || 'https://via.placeholder.com/40'} alt="IG" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>@{page.instagram_business_account.username || 'instagram'}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Instagram Business</div>
                              </div>
                            </div>
                          ) : (
                            <div className={`${styles.socialIntegrationItem} ${styles.socialIntegrationDivider}`} style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              Nenhuma conta do Instagram vinculada a esta página.
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                )}
              </div>
            )}

            <div className="input-group" style={{ marginTop: '1.5rem' }}>
              <label className="input-label">Website da Empresa</label>
              <input 
                type="text" 
                className="input" 
                placeholder="Ex: www.planilha.digital" 
                style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-deep)', color: '#fff', borderRadius: 'var(--r-sm)' }}
                value={websiteUrl}
                onChange={e => setWebsiteUrl(e.target.value)}
              />
            </div>

            <div style={{ marginTop: '2rem' }}>
              <button className="btn btn-primary w-full" onClick={handleSaveConfig} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Fallback silencioso para métricas (Mantivemos a lógica, mas simplifiquei a renderização pra caber no arquivo se o user pedir) */}
      {activeTab === 'metricas' && (
        <div className="anim-fade-up card-plain">
          <h2 style={{ marginBottom: '1rem' }}>Métricas e Relatórios</h2>
          {!empresa?.metaPageId ? (
            <div style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: 'var(--r-md)', border: '1px dashed var(--border)' }}>
              <p>Módulo de relatórios mantido operante no back-end.</p>
              <p style={{ marginTop: '0.5rem', color: 'var(--accent)' }}>Vincule uma página do Facebook e Instagram na aba <strong>Configurações</strong> para desbloquear a geração de insights.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>
                Sua conta do Facebook está vinculada! Agora você pode gerar relatórios de desempenho e inteligência artificial atualizados com dados em tempo real.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <GenerateReportButton empresaId={empresa.id} platform="INSTAGRAM" />
                <GenerateReportButton empresaId={empresa.id} platform="FACEBOOK" />
              </div>
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Histórico de Relatórios ({empresa.relatoriosGerados?.length || 0})</h3>
                {empresa.relatoriosGerados && empresa.relatoriosGerados.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {empresa.relatoriosGerados.map((relatorio: any) => (
                      <div key={relatorio.id} className={styles.reportHistoryCard}>
                        <div>
                          <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Relatório de {relatorio.dias} dias
                            <span className={`badge ${relatorio.platform === 'FACEBOOK' ? 'badge-primary' : 'badge-neutral'}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                              {relatorio.platform || 'INSTAGRAM'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Gerado em {new Date(relatorio.createdAt).toLocaleDateString('pt-BR')} às {new Date(relatorio.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <a href={`/report/${relatorio.id}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Eye size={16} /> Ver
                          </a>
                          <button onClick={() => handleDeleteReport(relatorio.id)} className="btn btn-secondary btn-sm" style={{ padding: '0 0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                            X
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Nenhum relatório salvo ainda.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
