'use client'

import styles from './Sidebar.module.css'
import { useSidebar } from '@/contexts/SidebarContext'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const { isOpen, setIsOpen } = useSidebar()
  const pathname = usePathname()

  // Fechar a barra lateral no mobile sempre que a rota mudar
  useEffect(() => {
    setIsOpen(false)
  }, [pathname, setIsOpen])

  return (
    <>
      {/* Backdrop para mobile */}
      {isOpen && (
        <div 
          className={styles.backdrop} 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar com classe de estado open */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        {children}
      </aside>
    </>
  )
}
