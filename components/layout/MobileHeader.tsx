'use client'

import styles from './MobileHeader.module.css'
import { Menu } from 'lucide-react'
import Logo from '../Logo'
import { useSidebar } from '@/contexts/SidebarContext'

export default function MobileHeader() {
  const { toggle } = useSidebar()

  return (
    <header className={styles.mobileHeader}>
      <button className={styles.menuButton} onClick={toggle} aria-label="Abrir menu">
        <Menu size={24} />
      </button>
      <div className={styles.logoWrap}>
        <Logo width={160} height={36} />
      </div>
      <div className={styles.placeholder} />
    </header>
  )
}
