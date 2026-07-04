import styles from './Topbar.module.css'

export default function Topbar() {
  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        {/* Empresa selecionada */}
        <button className={styles.companySelector} id="company-selector-btn">
          <span className={styles.companyDot} />
          <span className={styles.companyName}>Selecione uma empresa</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      <div className={styles.right}>
        {/* Busca */}
        <button className="btn-icon" title="Buscar" id="search-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        {/* Notificações */}
        <button className={`btn-icon ${styles.notifBtn}`} title="Notificações" id="notifications-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className={styles.notifBadge}>3</span>
        </button>

        {/* Novo Post CTA */}
        <button className="btn btn-primary btn-sm" id="new-post-btn">
          + Novo Post
        </button>
      </div>
    </header>
  )
}
