import { useState, type FormEvent } from 'react'
import { useAuth } from '../../app/providers/useAuth'
import { Button } from '../../components/ui/Button'
import { FormField } from '../../components/ui/FormField'
import { Notice } from '../../components/ui/Notice'
import { updateDisplayName } from '../auth/authService'

export function PatientDashboardPage() {
  const auth = useAuth()
  const [name, setName] = useState(auth.profile?.display_name ?? '')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  async function save(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSuccess('')
    try {
      await updateDisplayName(name)
      await auth.refreshProfile()
      setSuccess('Nome atualizado.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar.')
    }
  }
  async function logout() {
    try {
      await auth.logout()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível sair.')
    }
  }
  return (
    <section className="section inner-page dashboard-page">
      <span className="eyebrow">Área do paciente</span>
      <h1>Olá, {auth.profile?.display_name}.</h1>
      <p className="page-intro">Gerencie seu perfil e encontre profissionais para conhecer.</p>
      <Notice title="Agendamentos ainda não conectados">
        Esta versão não salva consultas. Não há dados clínicos ou histórico associados à sua conta.
      </Notice>
      {success && (
        <Notice title="Tudo certo" kind="success">
          {success}
        </Notice>
      )}
      {error && (
        <Notice title="Não foi possível concluir" kind="error">
          {error}
        </Notice>
      )}
      <form className="auth-form" onSubmit={(event) => void save(event)}>
        <FormField
          label="Nome de exibição"
          name="display-name"
          autoComplete="name"
          value={name}
          maxLength={100}
          required
          onChange={(event) => setName(event.target.value)}
        />
        <Button type="submit">Salvar perfil</Button>
        <Button type="button" variant="quiet" onClick={() => void logout()}>
          Sair da conta
        </Button>
      </form>
    </section>
  )
}
