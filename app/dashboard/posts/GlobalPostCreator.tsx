'use client'

import { useState, useRef } from 'react'
import { UploadCloud, Image as ImageIcon, Film, Layout, Copy } from 'lucide-react'
import { FaInstagram, FaFacebook } from 'react-icons/fa'
import toast from 'react-hot-toast'
import styles from '../empresas/[id]/page.module.css'

export default function GlobalPostCreator({ empresas }: { empresas: any[] }) {
  const [selectedEmpresaId, setSelectedEmpresaId] = useState('')
  const [postForm, setPostForm] = useState({ 
    legenda: '', 
    dataHora: '', 
    canais: { instagram: true, facebook: false }, 
    formato: 'Feed', // Feed, Reels, Stories, Carrossel
    midiaUrl: '' 
  })
  const [savingPost, setSavingPost] = useState(false)
  const postMediaInputRef = useRef<HTMLInputElement>(null)

  const selectedEmpresa = empresas.find(e => e.id === selectedEmpresaId)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setPostForm({ ...postForm, midiaUrl: url })
      toast.success('Mídia carregada!', { id: loadingToast })
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast })
    }
  }

  const handleSchedulePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmpresaId) return toast.error('Selecione uma empresa primeiro!')
    if (!postForm.midiaUrl && postForm.formato !== 'Text') return toast.error('Anexe uma mídia!')
    if (!postForm.canais.instagram && !postForm.canais.facebook) return toast.error('Selecione pelo menos um canal!')
    
    // Converter estado para compatibilidade com API atual
    let redeFinal = 'Instagram'
    if (postForm.canais.instagram && postForm.canais.facebook) redeFinal = 'Ambas'
    else if (postForm.canais.facebook) redeFinal = 'Facebook'

    const payload = { ...postForm, rede: redeFinal }

    setSavingPost(true)
    try {
      const res = await fetch(`/api/empresas/${selectedEmpresaId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Erro ao agendar o post')
      
      toast.success('Post agendado com sucesso!')
      setPostForm({ legenda: '', dataHora: '', canais: { instagram: true, facebook: false }, formato: 'Feed', midiaUrl: '' })
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSavingPost(false)
    }
  }

  return (
    <div className={`${styles.postCreatorLayout} anim-fade-up`}>
      {/* COLUNA 1: Cliente e Legenda */}
      <div className={styles.editorPanel}>
        <div>
          <div className={styles.stepTitle}>
            <span className={styles.stepNumber}>1</span> Cliente / Conta
          </div>
          <select 
            className="input" 
            value={selectedEmpresaId} 
            onChange={e => setSelectedEmpresaId(e.target.value)}
            style={{ width: '100%', padding: '0.8rem', background: 'var(--bg-deep)', color: '#fff' }}
          >
            <option value="">-- Selecione a empresa --</option>
            {empresas.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>

        <div>
          <div className={styles.stepTitle}>
            <span className={styles.stepNumber}>2</span> Texto do post
          </div>
          <textarea 
            className={styles.postTextarea}
            placeholder="Digite o seu texto aqui..."
            style={{ minHeight: '300px' }}
            value={postForm.legenda}
            onChange={e => setPostForm({...postForm, legenda: e.target.value})}
          />
        </div>
      </div>

      {/* COLUNA 2: Canais, Formato, Mídias e Agendamento */}
      <div className={styles.editorPanel}>
        <div>
          <div className={styles.stepTitle}>
            <span className={styles.stepNumber}>3</span> Selecione canais
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
            <span className={styles.stepNumber}>4</span> Formato do Post
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['Feed', 'Reels', 'Stories', 'Carrossel'].map(fmt => (
              <button 
                key={fmt}
                onClick={() => setPostForm({...postForm, formato: fmt})}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 1rem', borderRadius: 'var(--r-full)',
                  border: `1px solid ${postForm.formato === fmt ? 'var(--accent)' : 'var(--border)'}`,
                  background: postForm.formato === fmt ? 'var(--accent-dim)' : 'var(--bg-deep)',
                  color: postForm.formato === fmt ? 'var(--accent)' : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600, fontSize: '0.85rem'
                }}
              >
                {fmt === 'Feed' && <Layout size={14} />}
                {fmt === 'Reels' && <Film size={14} />}
                {fmt === 'Stories' && <Copy size={14} />}
                {fmt === 'Carrossel' && <ImageIcon size={14} />}
                {fmt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className={styles.stepTitle}>
            <span className={styles.stepNumber}>5</span> Mídias
          </div>
          <input type="file" hidden ref={postMediaInputRef} onChange={handleUpload} accept="image/*,video/*" />
          <div className={styles.uploadZone} onClick={() => postMediaInputRef.current?.click()}>
            {postForm.midiaUrl ? (
              <img src={postForm.midiaUrl} alt="Preview" style={{ height: '120px', borderRadius: '8px', objectFit: 'contain' }} />
            ) : (
              <>
                <UploadCloud size={40} color="var(--text-muted)" />
                <p><strong>Imagens ou vídeos</strong><br/>Clique aqui para enviar arquivos.</p>
              </>
            )}
          </div>
        </div>

        <div>
          <div className={styles.stepTitle}>
            <span className={styles.stepNumber}>6</span> Data e horário da publicação
          </div>
          <input 
            type="datetime-local" 
            className={styles.postTextarea}
            style={{ minHeight: 'auto' }}
            value={postForm.dataHora}
            onChange={e => setPostForm({...postForm, dataHora: e.target.value})}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleSchedulePost} disabled={savingPost}>
            {savingPost ? 'Agendando...' : 'Agendar Publicações'}
          </button>
        </div>
      </div>

      {/* COLUNA 3: Preview */}
      <div className={styles.previewPanel}>
        <div className={styles.stepTitle} style={{ justifyContent: 'center' }}>
          Preview: {postForm.formato}
        </div>
        
        <div 
          className={styles.previewMobile} 
          style={
            (postForm.formato === 'Reels' || postForm.formato === 'Stories') 
            ? { aspectRatio: '9/16', maxWidth: '300px', margin: '0 auto' } 
            : {}
          }
        >
          <div className={styles.previewHeader}>
            {selectedEmpresa?.avatarUrl ? (
              <img src={selectedEmpresa.avatarUrl} alt="avatar" className={styles.previewAvatar} />
            ) : (
              <div className={styles.previewAvatar} />
            )}
            <span className={styles.previewName}>{selectedEmpresa?.name || 'Selecione uma conta'}</span>
          </div>
          <div className={styles.previewImage} style={(postForm.formato === 'Reels' || postForm.formato === 'Stories') ? { height: '100%', flex: 1 } : {}}>
            {postForm.midiaUrl ? (
              <img src={postForm.midiaUrl} alt="media" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
            ) : (
              <ImageIcon size={48} opacity={0.5} />
            )}
          </div>
          {postForm.formato !== 'Stories' && (
            <div className={styles.previewBody} style={(postForm.formato === 'Reels' || postForm.formato === 'Stories') ? { position: 'absolute', bottom: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' } : {}}>
              <span style={{ fontWeight: 600 }}>{selectedEmpresa?.name || 'Conta'}</span> {postForm.legenda || 'O texto do seu post aparecerá aqui...'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
