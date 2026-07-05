import styles from './Sidebar.module.css'
import Logo from '../Logo'
import SidebarNav from './SidebarNav'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

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
