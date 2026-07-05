'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './SidebarNav.module.css'

import { LayoutDashboard, Building2, ClipboardList, BarChart3, CalendarPlus, CalendarDays, Settings } from 'lucide-react'

const navItems = [
  {
    group: 'Principal',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
      { href: '/dashboard/empresas', label: 'Empresas', icon: <Building2 size={20} /> },
    ],
  },
  {
    group: 'Ferramentas',
    items: [
      { href: '/dashboard/planejamentos', label: 'Planejamentos', icon: <ClipboardList size={20} /> },
      { href: '/dashboard/posts', label: 'Programar Posts', icon: <CalendarPlus size={20} /> },
      { href: '/dashboard/calendario', label: 'Calendário', icon: <CalendarDays size={20} /> },
      { href: '/dashboard/relatorios', label: 'Relatórios', icon: <BarChart3 size={20} /> },
    ],
  },
  {
    group: 'Configurações',
    items: [
      { href: '/dashboard/configuracoes', label: 'Configurações', icon: <Settings size={20} /> },
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
              const isActive = item.href === '/dashboard' 
                ? pathname === '/dashboard'
                : pathname === item.href || pathname.startsWith(item.href + '/')
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
