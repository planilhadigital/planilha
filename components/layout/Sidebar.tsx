import styles from './Sidebar.module.css'
import Logo from '../Logo'
import SidebarNav from './SidebarNav'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import SidebarProfile from './SidebarProfile'
import SidebarWrapper from './SidebarWrapper'

export default async function Sidebar() {
  const session = await getServerSession(authOptions)
  const user = session?.user

  return (
    <SidebarWrapper>
      <div className={styles.logoWrap}>
        <Logo width={220} height={52} className={styles.logo} />
      </div>

      <SidebarNav />
      <SidebarProfile user={user} />
    </SidebarWrapper>
  )
}
