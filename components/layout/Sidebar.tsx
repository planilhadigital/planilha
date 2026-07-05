import styles from './Sidebar.module.css'
import Logo from '../Logo'
import SidebarNav from './SidebarNav'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Link from 'next/link'
import SidebarProfile from './SidebarProfile'

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
      <SidebarProfile user={user} />
    </aside>
  )
}
