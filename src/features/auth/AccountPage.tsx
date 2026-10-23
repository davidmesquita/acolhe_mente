import { Link, useLocation } from 'react-router-dom'
import { Notice } from '../../components/ui/Notice'

export function AccountPage() {
  const isSignUp = useLocation().pathname === '/cadastro'
  return (
    <section className="section inner-page account-page">
      <div className="account-card">
        <span className="eyebrow">Acesso à plataforma</span>
        <h1>{isSignUp ? 'Criar uma conta' : 'Que bom ter você por aqui.'}</h1>
        <p className="page-intro">
          {isSignUp
            ? 'O cadastro ainda não está disponível nesta versão.'
            : 'O acesso à conta ainda não está disponível nesta versão.'}
        </p>
        <Notice title="Demonstração sem autenticação">
          Não digite nem envie senhas ou dados pessoais. Esta página não autentica, cria contas ou
          protege áreas de usuário.
        </Notice>
        <div className="account-tabs" aria-label="Acesso">
          <Link to="/entrar" aria-current={!isSignUp ? 'page' : undefined}>
            Entrar
          </Link>
          <Link to="/cadastro" aria-current={isSignUp ? 'page' : undefined}>
            Criar conta
          </Link>
        </div>
        <p className="muted-copy">
          Quando o portal tiver um sistema de acesso seguro, esta área será substituída por um fluxo
          conectado e revisado.
        </p>
        <Link to="/paciente" className="text-link">
          Ver a área de paciente demonstrativa ↗
        </Link>
      </div>
    </section>
  )
}
