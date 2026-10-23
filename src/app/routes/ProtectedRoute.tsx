import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { StateMessage } from '../../components/ui/StateMessage'
import { useAuth } from '../providers/useAuth'
import type { UserRole } from '../../types/database'
import { getProtectedRouteDecision } from '../../lib/authorization'

export function ProtectedRoute({ role }: { role: Exclude<UserRole, 'admin'> }) {
  const auth = useAuth()
  const location = useLocation()
  const decision = getProtectedRouteDecision(
    {
      loading: auth.loading,
      configured: auth.configured,
      userId: auth.user?.id ?? null,
      profileRole: auth.profile?.role ?? null,
      hasError: Boolean(auth.error),
    },
    role,
  )
  if (decision === 'loading')
    return (
      <main className="section inner-page">
        <StateMessage kind="loading" title="Carregando sua conta">
          Aguarde enquanto verificamos sua sessão.
        </StateMessage>
      </main>
    )
  if (decision === 'configuration-required')
    return <Navigate to="/entrar" replace state={{ from: location, configurationRequired: true }} />
  if (decision === 'login-required')
    return <Navigate to="/entrar" replace state={{ from: location }} />
  if (decision === 'profile-error')
    return (
      <main className="section inner-page">
        <StateMessage kind="error" title="Não foi possível carregar sua conta">
          {auth.error}
        </StateMessage>
      </main>
    )
  if (decision === 'profile-unavailable')
    return (
      <main className="section inner-page">
        <StateMessage kind="error" title="Perfil indisponível">
          Seu perfil ainda não foi criado. Verifique a confirmação do cadastro ou peça ajuda ao
          suporte.
        </StateMessage>
      </main>
    )
  if (decision === 'wrong-role') {
    const profileRole = auth.profile!.role
    const destination =
      profileRole === 'psychologist' ? '/psicologo' : profileRole === 'patient' ? '/paciente' : '/'
    return <Navigate to={destination} replace />
  }
  return <Outlet />
}
