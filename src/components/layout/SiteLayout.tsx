import { NavLink, Outlet } from 'react-router-dom'
import { AccessibilityToolbar } from '../accessibility/AccessibilityToolbar'

export function SiteLayout() {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className="site-header">
        <div className="header-inner">
          <NavLink className="brand" to="/" aria-label="AcolheMente, página inicial">
            <span className="brand-mark" aria-hidden="true">
              a
            </span>
            <span>
              Acolhe<span className="brand-light">Mente</span>
            </span>
          </NavLink>
          <nav className="main-nav" aria-label="Navegação principal">
            <NavLink to="/profissionais">Profissionais</NavLink>
            <NavLink to="/sessao-online">Como funciona</NavLink>
            <NavLink className="nav-cta" to="/agendar">
              Agendar sessão <span aria-hidden="true">↗</span>
            </NavLink>
          </nav>
        </div>
      </header>
      <AccessibilityToolbar />
      <main id="conteudo" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="footer-inner">
          <NavLink className="brand footer-brand" to="/">
            <span className="brand-mark" aria-hidden="true">
              a
            </span>
            <span>
              Acolhe<span className="brand-light">Mente</span>
            </span>
          </NavLink>
          <p>Um espaço para cuidar de você, no seu tempo.</p>
          <span className="footer-note">Projeto demonstrativo · Dados fictícios</span>
        </div>
      </footer>
    </div>
  )
}
