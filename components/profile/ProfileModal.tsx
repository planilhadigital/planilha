'use client'

import { useState, useRef } from 'react'
import { signOut } from 'next-auth/react'
import { X, UploadCloud, LogOut, Lock, User as UserIcon } from 'lucide-react'
import toast from 'react-hot-toast'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
}

export default function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const currentFirstName = user?.name?.split(' ')[0] || ''
  const currentLastName = user?.name?.split(' ').slice(1).join(' ') || ''
  
  const [firstName, setFirstName] = useState(currentFirstName)
  const [lastName, setLastName] = useState(currentLastName)
  const [email, setEmail] = useState(user?.email || '')
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  
  // Image state
  const [imagePreview, setImagePreview] = useState(user?.image || '')
  const [imageFile, setImageFile] = useState<File | null>(null)

  if (!isOpen) return null

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const fullName = `${firstName} ${lastName}`.trim()
      
      const payload = {
        name: fullName,
        email,
        imageStr: imagePreview !== user?.image ? imagePreview : undefined, // sending base64 if changed
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      }
      
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Erro ao atualizar perfil')
      }
      
      toast.success('Perfil atualizado! Recarregando...')
      setTimeout(() => window.location.reload(), 1500)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '1rem'
    }}>
      <div className="card anim-scale-in" style={{ 
        width: '100%', maxWidth: '500px', padding: 0, 
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        maxHeight: '90vh'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '1.5rem', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(255,255,255,0.02)'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserIcon size={20} color="var(--accent)" /> Meu Perfil
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
          <form id="profile-form" onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Foto de Perfil */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ 
                width: '80px', height: '80px', borderRadius: '50%', 
                background: 'var(--bg-deep)', border: '2px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', position: 'relative'
              }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <UserIcon size={32} color="var(--text-muted)" />
                )}
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Foto de Perfil</h4>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileInputRef.current?.click()}>
                  <UploadCloud size={16} /> Fazer Upload
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
              </div>
            </div>

            {/* Dados Básicos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ margin: 0, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Dados Básicos</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>Nome</label>
                  <input type="text" className="input" value={firstName} onChange={e => setFirstName(e.target.value)} required style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-deep)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', color: 'var(--text)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>Sobrenome</label>
                  <input type="text" className="input" value={lastName} onChange={e => setLastName(e.target.value)} required style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-deep)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', color: 'var(--text)' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>E-mail</label>
                <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-deep)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', color: 'var(--text)' }} />
              </div>
            </div>

            {/* Segurança */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ margin: 0, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Segurança
                <button type="button" onClick={() => setShowPasswordSection(!showPasswordSection)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>
                  {showPasswordSection ? 'Ocultar' : 'Alterar Senha'}
                </button>
              </h4>
              
              {showPasswordSection && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--r-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <Lock size={16} />
                    <span style={{ fontSize: '0.9rem' }}>Sua conta utiliza autenticação via Google. A alteração de senha deve ser feita diretamente na sua conta Google.</span>
                  </div>
                </div>
              )}
            </div>
            
          </form>
        </div>

        {/* Footer */}
        <div style={{ 
          padding: '1.5rem', borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(0,0,0,0.2)'
        }}>
          <button type="button" onClick={() => signOut({ callbackUrl: '/login' })} style={{ 
            background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', 
            padding: '0.5rem 1rem', borderRadius: 'var(--r-sm)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600
          }}>
            <LogOut size={16} /> Sair / Logout
          </button>
          
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" form="profile-form" className="btn btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
