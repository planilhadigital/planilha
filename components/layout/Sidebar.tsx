import styles from './Sidebar.module.css'
import Logo from '../Logo'
import SidebarNav from './SidebarNav'

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoWrap}>
        <Logo width={140} height={34} />
      </div>
      <SidebarNav />
      <div className={styles.footer}>
        <div className={styles.userCard}>
          <div className={styles.avatar}>JD</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Jean Dev</span>
            <span className={styles.userRole}>Admin</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
