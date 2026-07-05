import Sidebar from '@/components/layout/Sidebar'
import styles from './dashboard.module.css'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  )
}
