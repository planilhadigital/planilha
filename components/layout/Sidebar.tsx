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


      <SidebarNav />
      <div className={styles.footer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className={styles.userCard} style={{ flex: 1, paddingRight: '0.5rem' }}>
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
        <button className="btn-icon" title="Notificações" style={{ position: 'relative', background: 'transparent', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--r-md)', border: 'none', cursor: 'pointer' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span style={{ position: 'absolute', top: 0, right: 0, background: 'var(--primary)', color: 'white', fontSize: '0.65rem', fontWeight: 'bold', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>3</span>
        </button>
      </div>
    </aside>
  )
}
