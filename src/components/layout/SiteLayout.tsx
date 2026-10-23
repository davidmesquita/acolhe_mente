import { useRef, useState, type KeyboardEvent } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { AccessibilityToolbar } from '../accessibility/AccessibilityToolbar'

export function SiteLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const closeMenu = () => setMenuOpen(false)
  const handleMenuKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape' && menuOpen) {
      closeMenu()
      menuButton.current?.focus()
    }
  }
  return (
    <div className="site-shell">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header
        className={`site-header ${menuOpen ? 'menu-visible' : ''}`}
        onKeyDown={handleMenuKeyDown}
      >
        <div className="header-inner">
          <NavLink className="brand" to="/" aria-label="AcolheMente, página inicial">
            <span className="brand-mark" aria-hidden="true">
              a
            </span>
            <span>
              Acolhe<span className="brand-light">Mente</span>
            </span>
          </NavLink>
          <button
            ref={menuButton}
            className="menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="menu-icon" aria-hidden="true">
              {menuOpen ? '×' : '☰'}
            </span>
            <span>{menuOpen ? 'Fechar menu' : 'Menu'}</span>
          </button>
          <nav
            id="primary-navigation"
            className={`main-nav ${menuOpen ? 'is-open' : ''}`}
            aria-label="Navegação principal"
          >
            <NavLink to="/profissionais" onClick={closeMenu}>
              Profissionais
            </NavLink>
            <NavLink to="/sessao-online" onClick={closeMenu}>
              Como funciona
            </NavLink>
            <NavLink to="/ajuda" onClick={closeMenu}>
              Ajuda
            </NavLink>
            <NavLink to="/entrar" onClick={closeMenu}>
              Entrar
            </NavLink>
            <NavLink className="nav-cta" to="/agendar" onClick={closeMenu}>
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
          <nav className="footer-links" aria-label="Links do rodapé">
            <NavLink to="/acessibilidade">Acessibilidade</NavLink>
            <NavLink to="/ajuda">Ajuda</NavLink>
            <NavLink to="/privacidade">Termos e privacidade</NavLink>
            <NavLink to="/paciente">Área do paciente</NavLink>
            <NavLink to="/psicologo">Área profissional</NavLink>
          </nav>
          <span className="footer-note">Projeto demonstrativo · Dados fictícios</span>
        </div>
      </footer>
    </div>
  )
}
