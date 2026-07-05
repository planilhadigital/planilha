import styles from './Sidebar.module.css'
import Logo from '../Logo'
import SidebarNav from './SidebarNav'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Link from 'next/link'

export default async function Sidebar() {
  const session = await getServerSession(authOptions)
  const user = session?.user
  const fallbackInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoWrap}>
        <Logo width={220} height={52} className={styles.logo} />
      </div>
      
      <div style={{ padding: '0 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Link href="/dashboard/posts" className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center', fontWeight: 'bold' }}>
          + NOVO POST
        </Link>
        <button className="btn-icon" title="Notificações" style={{ position: 'relative', background: 'var(--bg-deep)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--primary)', color: 'white', fontSize: '0.65rem', fontWeight: 'bold', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>3</span>
        </button>
      </div>

      <SidebarNav />
      <div className={styles.footer}>
        <div className={styles.userCard}>
          <div className={styles.avatar}>
            {user?.image ? (
              <img src={user.image} alt={user?.name || 'User'} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              fallbackInitial
            )}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name || 'Usuário'}</span>
            <span className={styles.userRole}>Admin</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
