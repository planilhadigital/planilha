import styles from './login.module.css'
import Logo from '@/components/Logo'
import GoogleLoginButton from '@/components/GoogleLoginButton'

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
        <GoogleLoginButton />

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
