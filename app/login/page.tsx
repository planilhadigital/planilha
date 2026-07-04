import styles from './login.module.css'
import Logo from '@/components/Logo'

export const metadata = {
  title: 'Login — planILHA',
  description: 'Acesse a plataforma planILHA com sua conta Google.',
}

export default function LoginPage() {
  return (
    <div className={styles.page}>
      {/* Background glows */}
      <div className={`${styles.glow} ${styles.glowTop}`} />
      <div className={`${styles.glow} ${styles.glowBottom}`} />

      {/* Grid texture */}
      <div className={styles.grid} />

      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logoWrap}>
          <Logo width={200} height={48} />
        </div>

        {/* Header text */}
        <div className={styles.header}>
          <h1 className={styles.title}>Bem-vindo de volta</h1>
          <p className={styles.subtitle}>
            Acesse sua plataforma de gestão de marketing e relatórios
          </p>
        </div>

        {/* Google login button */}
        <button className={styles.googleBtn} id="google-login-btn">
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <span>Entrar com Google</span>
        </button>

        <div className={styles.divider}>
          <span>ou</span>
        </div>

        {/* Email login */}
        <form className={styles.form} id="email-login-form">
          <div className="input-group">
            <label className="input-label" htmlFor="email-input">E-mail</label>
            <input
              id="email-input"
              type="email"
              className="input"
              placeholder="seu@email.com"
              autoComplete="email"
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="password-input">Senha</label>
            <input
              id="password-input"
              type="password"
              className="input"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full" id="email-login-submit-btn">
            Entrar na plataforma
          </button>
        </form>

        <p className={styles.terms}>
          Ao entrar, você concorda com os{' '}
          <a href="#" className={styles.link}>Termos de Uso</a> e a{' '}
          <a href="#" className={styles.link}>Política de Privacidade</a> da planILHA.
        </p>
      </div>
    </div>
  )
}
