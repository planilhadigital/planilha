'use client'

import { useState } from 'react'
import { Link2, Check } from 'lucide-react'

export default function CopyLinkButton() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="btn btn-secondary btn-sm"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.5rem 1rem',
        fontSize: '0.8125rem',
        fontWeight: 600,
        borderRadius: 'var(--r-full)',
        background: copied ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255,255,255,0.05)',
        border: copied ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(255,255,255,0.12)',
        color: copied ? '#22c55e' : 'var(--text-secondary)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {copied
        ? <Check size={14} strokeWidth={2.5} />
        : <Link2 size={14} strokeWidth={2} />}
      {copied ? 'Link copiado!' : 'Copiar link'}
    </button>
  )
}
