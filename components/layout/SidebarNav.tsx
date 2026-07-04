'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './SidebarNav.module.css'

const navItems = [
  {
    group: 'Principal',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
      { href: '/dashboard/empresas', label: 'Empresas', icon: '🏢' },
      { href: '/dashboard/planejamentos', label: 'Planejamentos', icon: '📋' },
    ],
  },
  {
    group: 'Ferramentas',
    items: [
      { href: '/dashboard/relatorios', label: 'Relatórios', icon: '📊' },
      { href: '/dashboard/posts', label: 'Programar Posts', icon: '📅' },
      { href: '/dashboard/calendario', label: 'Calendário', icon: '🗓️' },
    ],
  },
  {
    group: 'Configurações',
    items: [
      { href: '/dashboard/configuracoes', label: 'Configurações', icon: '⚙️' },
    ],
  },
]

export default function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className={styles.nav}>
      {navItems.map((group) => (
        <div key={group.group} className={styles.group}>
          <span className={styles.groupLabel}>{group.group}</span>
          <ul>
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                  >
                    <span className={styles.icon}>{item.icon}</span>
                    <span>{item.label}</span>
                    {isActive && <span className={styles.activeDot} />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
