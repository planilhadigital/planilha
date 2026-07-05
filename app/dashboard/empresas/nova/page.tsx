'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'

export default function NovaEmpresaPage() {
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [facebookUrl, setFacebookUrl] = useState('')
  
  const [metaPages, setMetaPages] = useState<any[]>([])
  const [selectedPageId, setSelectedPageId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function loadMeta() {
      try {
        const pagesRes = await fetch('/api/meta/pages')
        if (pagesRes.ok) {
          const pagesData = await pagesRes.json()
          setMetaPages(pagesData.pages || [])
        }
      } catch (e) {
        console.error(e)
      }
    }
    loadMeta()
  }, [])
  
  // Quando o usuário selecionar uma página Meta, puxa a foto de perfil automaticamente (se o campo estiver vazio)
  useEffect(() => {
    if (selectedPageId) {
      const page = metaPages.find(p => p.id === selectedPageId)
      if (page && page.picture?.data?.url && !avatarUrl) {
        setAvatarUrl(page.picture.data.url)
      }
    }
  }, [selectedPageId, metaPages, avatarUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('O nome é obrigatório')
      return
    }

    setLoading(true)
    setError('')

    try {
      const selectedPage = metaPages.find(p => p.id === selectedPageId)
      const igAccountId = selectedPage?.instagram_business_account?.id || null

      const res = await fetch('/api/empresas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name,
          metaPageId: selectedPageId || null,
          igAccountId,
          avatarUrl,
          websiteUrl,
          instagramUrl,
          facebookUrl
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao criar empresa')
      }

      // Redireciona para o dashboard geral onde ele pode ver a lista
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Nova Empresa</h1>
      <p className={styles.subtitle}>Cadastre um novo cliente ou marca para gerenciar.</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div>
          <label className={styles.label} htmlFor="name">Nome da Empresa</label>
          <input
            id="name"
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Barbearia do João"
            autoFocus
          />
        </div>

        {metaPages.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label className={styles.label} style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Vincular Página Meta (Opcional)</label>
            <select 
              className={styles.input}
              value={selectedPageId}
              onChange={(e) => setSelectedPageId(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', color: 'var(--text)' }}
            >
              <option value="">-- Nenhuma página vinculada --</option>
              {metaPages.map(page => (
                <option key={page.id} value={page.id}>
                  {page.name} {page.instagram_business_account ? '(+ Instagram)' : ''}
                </option>
              ))}
            </select>
            <p style={{ fontSize: '0.85rem', color: 'var(--accent)', marginTop: '0.5rem' }}>
              Selecionando a página, tentaremos puxar sua foto de perfil automaticamente!
            </p>
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label className={styles.label} style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>URL da Foto de Perfil (Avatar)</label>
          <input type="text" className={styles.input} value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '0.75rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', color: 'var(--text)' }} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label className={styles.label} style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Website (Opcional)</label>
          <input type="text" className={styles.input} value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '0.75rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', color: 'var(--text)' }} />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label className={styles.label} style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Link Instagram (Opcional)</label>
            <input type="text" className={styles.input} value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/..." style={{ width: '100%', padding: '0.75rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', color: 'var(--text)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label className={styles.label} style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Link Facebook (Opcional)</label>
            <input type="text" className={styles.input} value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="https://facebook.com/..." style={{ width: '100%', padding: '0.75rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', color: 'var(--text)' }} />
          </div>
        </div>

        {error && <div className={styles.error} style={{ background: 'rgba(231, 76, 60, 0.1)', color: '#E74C3C', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

        <div className={styles.actions}>
          <Link href="/dashboard" className="btn btn-ghost">
            Cancelar
          </Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Empresa'}
          </button>
        </div>
      </form>
    </div>
  )
}
