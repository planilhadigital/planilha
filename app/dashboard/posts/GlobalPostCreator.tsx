'use client'

import { useState, useRef } from 'react'
import { UploadCloud, Image as ImageIcon, Film, Layout, Copy, Settings, Calendar } from 'lucide-react'
import { FaInstagram, FaFacebook } from 'react-icons/fa'
import toast from 'react-hot-toast'
import styles from '../empresas/[id]/page.module.css'

export default function GlobalPostCreator({ empresas }: { empresas: any[] }) {
  const [selectedEmpresaIds, setSelectedEmpresaIds] = useState<string[]>([])
  const [postForm, setPostForm] = useState<{legenda: string, canais: {instagram: boolean, facebook: boolean}, formatos: string[], midiaUrls: string[]}>({ 
    legenda: '', 
    canais: { instagram: true, facebook: false }, 
    formatos: ['Feed'], // Pode conter múltiplos: Feed, Reels, Stories, Carrossel
    midiaUrls: [] 
  })
  
  const [datas, setDatas] = useState([{ date: '', time: '' }])
  
  const [advancedConfig, setAdvancedConfig] = useState({
    location: '',
    disableComments: false,
    hideLikes: false,
    shareToFeed: true
  })
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const [savingPost, setSavingPost] = useState(false)
  const postMediaInputRef = useRef<HTMLInputElement>(null)

  // O preview usará a primeira empresa selecionada
  const selectedEmpresa = empresas.find(e => e.id === selectedEmpresaIds[0])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    const loadingToast = toast.loading('Fazendo upload...')
    try {
      const newUrls = []
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData()
        formData.append('file', files[i])
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        if (!res.ok) throw new Error('Erro ao fazer upload')
        const { url } = await res.json()
        newUrls.push(url)
      }
      
      if (postForm.formatos.includes('Carrossel')) {
        setPostForm({ ...postForm, midiaUrls: [...postForm.midiaUrls, ...newUrls] })
      } else {
        setPostForm({ ...postForm, midiaUrls: [newUrls[0]] }) // Substitui se não for carrossel
      }
      toast.success('Mídia carregada!', { id: loadingToast })
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast })
    }
  }

  const handlePublishNow = () => {
    const now = new Date()
    const date = now.toISOString().split('T')[0]
    const time = now.toTimeString().substring(0, 5)
    setDatas([{ date, time }])
    toast.success('Horário definido para Agora')
  }

  const handleSchedulePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedEmpresaIds.length === 0) return toast.error('Selecione pelo menos uma empresa!')
    if (postForm.midiaUrls.length === 0 && !postForm.formatos.includes('Text')) return toast.error('Anexe pelo menos uma mídia!')
    if (postForm.formatos.length === 0) return toast.error('Selecione pelo menos um formato!')
    if (!postForm.canais.instagram && !postForm.canais.facebook) return toast.error('Selecione pelo menos um canal!')
    
    // Check if at least one valid date/time exists
    const validDatas = datas.filter(d => d.date && d.time)
    if (validDatas.length === 0) return toast.error('Adicione pelo menos uma data e horário válido!')

    let redeFinal = 'Instagram'
    if (postForm.canais.instagram && postForm.canais.facebook) redeFinal = 'Ambas'
    else if (postForm.canais.facebook) redeFinal = 'Facebook'

    setSavingPost(true)
    let errors = 0
    let success = 0

    try {
      const promises = []
      
      for (const empId of selectedEmpresaIds) {
        for (const dt of validDatas) {
          for (const fmt of postForm.formatos) {
            const payload = { 
              legenda: postForm.legenda,
              canais: postForm.canais,
              formato: fmt,
              midiaUrl: postForm.midiaUrls[0] || '',
              midiaUrls: postForm.midiaUrls,
              rede: redeFinal,
              dataHora: `${dt.date}T${dt.time}:00`,
              advancedConfig 
            }
            
            promises.push(
              fetch(`/api/empresas/${empId}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              }).then(res => {
                if (!res.ok) throw new Error()
                success++
              }).catch(() => {
                errors++
              })
            )
          }
        }
      }
      
      await Promise.all(promises)

      if (success > 0) toast.success(`${success} post(s) agendado(s) com sucesso!`)
      if (errors > 0) toast.error(`${errors} erro(s) ao agendar.`)
      
      setPostForm({ legenda: '', canais: { instagram: true, facebook: false }, formatos: ['Feed'], midiaUrls: [] })
      setSelectedEmpresaIds([])
      setDatas([{ date: '', time: '' }])
      setAdvancedConfig({ location: '', disableComments: false, hideLikes: false, shareToFeed: true })
      setShowAdvanced(false)
    } finally {
      setSavingPost(false)
    }
  }

  return (
    <div className={`${styles.postCreatorLayout} anim-fade-up`}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', gridColumn: 'span 3', marginBottom: '1rem' }}>
        <Calendar size={28} color="var(--primary)" />
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Programar Posts</h1>
      </div>

      {/* EDITOR PANEL (COMPACTADO) */}
      <div className={styles.editorPanel} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', gridColumn: 'span 2' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Lado Esquerdo do Editor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div className={styles.stepTitle}>
                <span className={styles.stepNumber}>1</span> Selecione as contas
              </div>
              <select 
                className="input" 
                value=""
                onChange={e => {
                  const val = e.target.value
                  if (val && !selectedEmpresaIds.includes(val)) {
                    setSelectedEmpresaIds([...selectedEmpresaIds, val])
                  }
                }}
                style={{ width: '100%', padding: '0.8rem', background: 'var(--bg-deep)', color: '#fff', marginBottom: '0.5rem' }}
              >
                <option value="">-- Adicionar empresa --</option>
                {empresas.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {selectedEmpresaIds.map(id => {
                  const emp = empresas.find(e => e.id === id)
                  if(!emp) return null
                  return (
                    <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface)', padding: '0.25rem 0.5rem', borderRadius: 'var(--r-full)', border: '1px solid var(--border)' }}>
                      {emp.avatarUrl ? <img src={emp.avatarUrl} alt="avatar" style={{width: 24, height: 24, borderRadius: '50%', objectFit: 'cover'}} /> : <div style={{width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 'bold'}}>{emp.name.charAt(0).toUpperCase()}</div>}
                      <span style={{ fontSize: '0.85rem' }}>{emp.name}</span>
                      <button className="btn-icon" style={{ padding: 2, background: 'var(--danger-dim)', color: 'var(--danger)', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedEmpresaIds(selectedEmpresaIds.filter(i => i !== id))}>✕</button>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <div className={styles.stepTitle}>
                <span className={styles.stepNumber}>2</span> Selecione canais
              </div>
              <div className={styles.channelSelector}>
                <button 
                  className={styles.channelBtn} 
                  data-active={postForm.canais.instagram}
                  onClick={() => setPostForm({...postForm, canais: { ...postForm.canais, instagram: !postForm.canais.instagram }})}
                  style={{ padding: '0.8rem', borderRadius: '50%' }}
                  title="Instagram"
                >
                  <FaInstagram size={24} />
                </button>
                <button 
                  className={styles.channelBtn} 
                  data-active={postForm.canais.facebook}
                  onClick={() => setPostForm({...postForm, canais: { ...postForm.canais, facebook: !postForm.canais.facebook }})}
                  style={{ padding: '0.8rem', borderRadius: '50%' }}
                  title="Facebook"
                >
                  <FaFacebook size={24} />
                </button>
              </div>
            </div>

            <div>
              <div className={styles.stepTitle}>
                <span className={styles.stepNumber}>3</span> Formato do Post
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['Feed', 'Reels', 'Stories', 'Carrossel'].map(fmt => {
                  const isActive = postForm.formatos.includes(fmt)
                  return (
                    <button 
                      key={fmt}
                      onClick={() => {
                        if (isActive) {
                          setPostForm({...postForm, formatos: postForm.formatos.filter(f => f !== fmt)})
                        } else {
                          setPostForm({...postForm, formatos: [...postForm.formatos, fmt]})
                        }
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', borderRadius: 'var(--r-full)',
                        border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                        background: isActive ? 'var(--accent-dim)' : 'var(--bg-deep)',
                        color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                        cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600, fontSize: '0.85rem'
                      }}
                    >
                      {fmt === 'Feed' && <Layout size={14} />}
                      {fmt === 'Reels' && <Film size={14} />}
                      {fmt === 'Stories' && <Copy size={14} />}
                      {fmt === 'Carrossel' && <ImageIcon size={14} />}
                      {fmt}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <div className={styles.stepTitle}>
                <span className={styles.stepNumber}>4</span> Mídias
              </div>
              <input type="file" hidden multiple={postForm.formatos.includes('Carrossel')} ref={postMediaInputRef} onChange={handleUpload} accept="image/*,video/*" />
              <div className={styles.uploadZone} onClick={() => postMediaInputRef.current?.click()} style={{ padding: '1rem', minHeight: '120px' }}>
                {postForm.midiaUrls.length > 0 ? (
                  <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {postForm.midiaUrls.map((url, i) => (
                      <img key={i} src={url} alt="Preview" style={{ height: '80px', borderRadius: '8px', objectFit: 'contain' }} />
                    ))}
                  </div>
                ) : (
                  <>
                    <UploadCloud size={32} color="var(--text-muted)" />
                    <p style={{ fontSize: '0.85rem' }}><strong>Imagens ou vídeos</strong><br/>Clique aqui para enviar arquivos.</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Lado Direito do Editor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div className={styles.stepTitle} style={{ cursor: 'pointer' }} onClick={() => setShowAdvanced(!showAdvanced)}>
                <span className={styles.stepNumber}>5</span> Configurações Adicionais {showAdvanced ? '▲' : '▼'}
              </div>
              {showAdvanced && (
                <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                  {postForm.formato === 'Stories' ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                      Nenhuma configuração disponível.
                    </div>
                  ) : (
                    <>
                      <div className="input-group">
                        <label className="input-label" style={{ fontSize: '0.8rem' }}>Localização (Opcional)</label>
                        <input 
                          type="text" 
                          className="input" 
                          placeholder="Ex: São Paulo" 
                          style={{ background: 'var(--bg-deep)', padding: '0.6rem' }}
                          value={advancedConfig.location}
                          onChange={e => setAdvancedConfig({...advancedConfig, location: e.target.value})}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                          <input type="checkbox" style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} checked={advancedConfig.disableComments} onChange={e => setAdvancedConfig({...advancedConfig, disableComments: e.target.checked})} /> 
                          Sem comentários
                        </label>
                        
                        {(postForm.formato === 'Feed' || postForm.formato === 'Carrossel') && (
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                            <input type="checkbox" style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} checked={advancedConfig.hideLikes} onChange={e => setAdvancedConfig({...advancedConfig, hideLikes: e.target.checked})} /> 
                            Sem curtidas
                          </label>
                        )}

                        {postForm.formato === 'Reels' && (
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                            <input type="checkbox" style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} checked={advancedConfig.shareToFeed} onChange={e => setAdvancedConfig({...advancedConfig, shareToFeed: e.target.checked})} /> 
                            No Feed
                          </label>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div className={styles.stepTitle}>
                <span className={styles.stepNumber}>6</span> Texto do post
              </div>
              <textarea 
                className={styles.postTextarea}
                placeholder="Digite o seu texto aqui..."
                style={{ flex: 1, minHeight: '120px' }}
                value={postForm.legenda}
                onChange={e => setPostForm({...postForm, legenda: e.target.value})}
              />
            </div>

            <div>
              <div className={styles.stepTitle} style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span><span className={styles.stepNumber}>7</span> Data e horário</span>
                <button className="btn btn-secondary btn-sm" onClick={handlePublishNow}>Publicar agora</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {datas.map((dt, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input type="date" className="input" style={{ flex: 2, padding: '0.7rem', background: 'var(--bg-deep)', color: '#fff' }} value={dt.date} onChange={e => { const newDatas = [...datas]; newDatas[idx].date = e.target.value; setDatas(newDatas) }} />
                    <input type="time" className="input" style={{ flex: 1, padding: '0.7rem', background: 'var(--bg-deep)', color: '#fff' }} value={dt.time} onChange={e => { const newDatas = [...datas]; newDatas[idx].time = e.target.value; setDatas(newDatas) }} />
                    {datas.length > 1 && (
                      <button className="btn-icon" style={{ padding: '0.4rem', background: 'var(--danger-dim)', color: 'var(--danger)', borderRadius: 'var(--r-sm)' }} onClick={() => setDatas(datas.filter((_, i) => i !== idx))}>✕</button>
                    )}
                  </div>
                ))}
                <button className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start', marginTop: '0.25rem' }} onClick={() => setDatas([...datas, { date: '', time: '' }])}>
                  + Incluir mais dias e horários
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleSchedulePost} disabled={savingPost}>
            {savingPost ? 'Agendando Lote...' : 'Agendar Publicações'}
          </button>
        </div>
      </div>

      {/* PREVIEW PANEL */}
      <div className={styles.previewPanel}>
        <div className={styles.stepTitle} style={{ justifyContent: 'center' }}>
          Preview: {postForm.formatos.join(', ') || 'Nenhum'}
        </div>
        
        <div 
          className={styles.previewMobile} 
          style={
            (postForm.formatos.includes('Reels') || postForm.formatos.includes('Stories')) 
            ? { aspectRatio: '9/16', maxWidth: '300px', margin: '0 auto' } 
            : {}
          }
        >
          <div className={styles.previewHeader}>
            {selectedEmpresa?.avatarUrl ? (
              <img src={selectedEmpresa.avatarUrl} alt="avatar" className={styles.previewAvatar} />
            ) : (
              <div className={styles.previewAvatar}>{selectedEmpresa ? selectedEmpresa.name.charAt(0).toUpperCase() : ''}</div>
            )}
            <span className={styles.previewName}>{selectedEmpresa?.name || 'Selecione uma conta'}</span>
          </div>
          <div className={styles.previewImage} style={(postForm.formatos.includes('Reels') || postForm.formatos.includes('Stories')) ? { height: '100%', flex: 1, position: 'relative' } : { position: 'relative' }}>
            {postForm.midiaUrls.length > 0 ? (
              <>
                <img src={postForm.midiaUrls[0]} alt="media" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                {postForm.midiaUrls.length > 1 && (
                  <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '10px' }}>
                    1/{postForm.midiaUrls.length}
                  </div>
                )}
              </>
            ) : (
              <ImageIcon size={48} opacity={0.5} />
            )}
          </div>
          {!postForm.formatos.includes('Stories') && (
            <div className={styles.previewBody} style={(postForm.formatos.includes('Reels') || postForm.formatos.includes('Stories')) ? { position: 'absolute', bottom: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' } : {}}>
              <span style={{ fontWeight: 600 }}>{selectedEmpresa?.name || 'Conta'}</span> {postForm.legenda || 'O texto do seu post aparecerá aqui...'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

