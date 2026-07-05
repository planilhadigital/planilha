'use client'

import { useState } from 'react'
import { Link2, Check } from 'lucide-react'
import styles from '@/app/report/[id]/page.module.css'

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
    <button className={styles.printBtn} onClick={handleCopy}>
      {copied ? <Check size={18} /> : <Link2 size={18} />}
      <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
    </button>
  )
}
