import Sidebar from '@/components/layout/Sidebar'
import MobileHeader from '@/components/layout/MobileHeader'
import styles from './dashboard.module.css'
import { SidebarProvider } from '@/contexts/SidebarContext'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className={styles.shell}>
        <Sidebar />
        <div className={styles.main}>
          <MobileHeader />
          <main className={styles.content}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
