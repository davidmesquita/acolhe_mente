import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { FormField } from '../../components/ui/FormField'
import { Notice } from '../../components/ui/Notice'
import { useAuth } from '../../app/providers/useAuth'
import { getProfile, requestPasswordReset, signIn, signUp, updatePassword } from './authService'

function message(error: unknown) {
  return error instanceof Error ? error.message : 'Não foi possível concluir. Tente novamente.'
}

export function AccountPage() {
  const { pathname, state } = useLocation()
  const navigate = useNavigate()
  const auth = useAuth()
  const isSignUp = pathname === '/cadastro'
  const isRecovery = pathname === '/recuperar-senha'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      if (isRecovery) {
        if (password.length < 8) throw new Error('Use uma senha com pelo menos 8 caracteres.')
        await updatePassword(password)
        setSuccess('Senha atualizada. Você já pode acessar sua conta.')
        window.setTimeout(() => navigate('/paciente', { replace: true }), 900)
      } else if (pathname === '/esqueci-senha') {
        await requestPasswordReset(email)
        setSuccess(
          'Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.',
        )
      } else if (isSignUp) {
        const result = await signUp(email, password, name)
        setSuccess(
          result.session
            ? 'Conta criada. Seu perfil inicial é de paciente.'
            : 'Cadastro recebido. Confira seu e-mail para confirmar a conta.',
        )
      } else {
        const result = await signIn(email, password)
        const target = (state as { from?: { pathname?: string } } | null)?.from?.pathname
        const profile = await getProfile(result.user)
        navigate(target || (profile.role === 'psychologist' ? '/psicologo' : '/paciente'), {
          replace: true,
        })
      }
    } catch (cause) {
      setError(message(cause))
    } finally {
      setBusy(false)
    }
  }

  async function logout() {
    setBusy(true)
    setError('')
    try {
      await auth.logout()
      setSuccess('Você saiu da sua conta.')
    } catch (cause) {
      setError(message(cause))
    } finally {
      setBusy(false)
    }
  }

  const title = isRecovery
    ? 'Escolha uma nova senha'
    : pathname === '/esqueci-senha'
      ? 'Recuperar acesso'
      : isSignUp
        ? 'Criar uma conta'
        : 'Que bom ter você por aqui.'
  return (
    <section className="section inner-page account-page">
      <div className="account-card">
        <span className="eyebrow">Acesso à plataforma</span>
        <h1>{title}</h1>
        <p className="page-intro">
          A autenticação usa o Supabase configurado pelo responsável técnico do portal.
        </p>
        {!auth.configured && (
          <Notice title="Configuração necessária">
            O acesso ainda não está conectado. Configure VITE_SUPABASE_URL e
            VITE_SUPABASE_PUBLISHABLE_KEY no arquivo .env.local e reinicie o servidor. Não informe
            senhas enquanto a configuração não estiver ativa.
          </Notice>
        )}
        {auth.sessionExpired && (
          <Notice title="Sessão encerrada">
            Sua sessão terminou. Entre novamente para continuar.
          </Notice>
        )}
        {Boolean((state as { configurationRequired?: boolean } | null)?.configurationRequired) && (
          <Notice title="Acesso não configurado">
            As páginas protegidas dependem de uma conexão Supabase válida.
          </Notice>
        )}
        {error && (
          <Notice title="Não foi possível continuar" kind="error">
            {error}
          </Notice>
        )}
        {success && (
          <Notice title="Tudo certo" kind="success">
            {success}
          </Notice>
        )}
        {auth.user && !isRecovery && (
          <div>
            <p>
              Você está conectado como{' '}
              <strong>{auth.profile?.display_name || auth.user.email}</strong>.
            </p>
            <Button disabled={busy} onClick={() => void logout()}>
              Sair da conta
            </Button>
          </div>
        )}
        {(!auth.user || isRecovery) && (
          <form className="auth-form" onSubmit={(event) => void submit(event)}>
            {isSignUp && (
              <FormField
                label="Como podemos chamar você?"
                name="display-name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={100}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            )}
            {!isRecovery && (
              <FormField
                label="E-mail"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            )}
            {pathname !== '/esqueci-senha' && (
              <FormField
                label={isRecovery ? 'Nova senha' : 'Senha'}
                name="password"
                type="password"
                autoComplete={
                  isRecovery ? 'new-password' : isSignUp ? 'new-password' : 'current-password'
                }
                required
                minLength={8}
                hint="Pelo menos 8 caracteres."
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            )}
            <Button type="submit" disabled={busy || !auth.configured}>
              {busy
                ? 'Aguarde…'
                : isRecovery
                  ? 'Atualizar senha'
                  : pathname === '/esqueci-senha'
                    ? 'Enviar instruções'
                    : isSignUp
                      ? 'Criar conta de paciente'
                      : 'Entrar'}
            </Button>
          </form>
        )}
        {!isRecovery && !auth.user && (
          <div className="account-tabs" aria-label="Acesso">
            <Link
              to="/entrar"
              aria-current={!isSignUp && pathname === '/entrar' ? 'page' : undefined}
            >
              Entrar
            </Link>
            <Link to="/cadastro" aria-current={isSignUp ? 'page' : undefined}>
              Criar conta
            </Link>
          </div>
        )}
        {pathname === '/entrar' && (
          <Link to="/esqueci-senha" className="text-link">
            Esqueci minha senha
          </Link>
        )}
        <p className="field-hint">
          O cadastro cria uma conta de paciente. A concessão da função profissional ocorre somente
          por operação administrativa protegida.
        </p>
      </div>
    </section>
  )
}
