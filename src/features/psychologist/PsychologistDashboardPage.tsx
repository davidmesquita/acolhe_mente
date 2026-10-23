import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { FormField } from '../../components/ui/FormField'
import { Notice } from '../../components/ui/Notice'
import { useAuth } from '../../app/providers/useAuth'
import { getProfessionalProfile, saveProfessionalProfile } from '../auth/authService'
import type { ProfessionalProfile } from '../../types/database'
import type { AppointmentSummary } from '../../types/database'
import { ProfessionalScheduleEditor } from '../appointments/ProfessionalScheduleEditor'
import { getMyAppointments, schedulingErrorMessage, updateAppointmentStatus } from '../appointments/schedulingService'

const appointmentStatusLabels = {
  requested: 'Solicitado',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  completed: 'Concluído',
} as const

function formatProfessionalDate(value: string, timezone: string | null, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: timezone ?? undefined, ...options }).format(new Date(value))
}

const emptyProfile: Pick<
  ProfessionalProfile,
  'presentation' | 'specialties' | 'registration_number' | 'accessibility_modalities'
> = { presentation: '', specialties: [], registration_number: null, accessibility_modalities: [] }
export function PsychologistDashboardPage() {
  const auth = useAuth()
  const [profile, setProfile] = useState(emptyProfile)
  const [verificationStatus, setVerificationStatus] = useState('pendente')
  const [specialties, setSpecialties] = useState('')
  const [modalities, setModalities] = useState('')
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [appointments, setAppointments] = useState<AppointmentSummary[]>([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(true)
  const [appointmentAction, setAppointmentAction] = useState('')
  useEffect(() => {
    let active = true
    void getProfessionalProfile(auth.user!.id)
      .then((data) => {
        if (!active || !data) return
        setProfile(data)
        setVerificationStatus(data.verification_status)
        setSpecialties(data.specialties.join(', '))
        setModalities(data.accessibility_modalities.join(', '))
      })
      .catch((cause: unknown) => {
        if (active)
          setError(cause instanceof Error ? cause.message : 'Não foi possível carregar seu perfil.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [auth.user])
  useEffect(() => {
    let active = true
    void getMyAppointments()
      .then((data) => {
        if (active) setAppointments(data)
      })
      .catch((cause: unknown) => {
        if (active) setError(schedulingErrorMessage(cause))
      })
      .finally(() => {
        if (active) setAppointmentsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])
  async function save(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSuccess('')
    try {
      setProfile(
        await saveProfessionalProfile({
          ...profile,
          specialties: specialties
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 20),
          accessibility_modalities: modalities
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 20),
        }),
      )
      setSuccess('Perfil salvo como não verificado.')
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
  async function updateAppointment(id: string, status: 'confirmed' | 'cancelled' | 'completed') {
    setAppointmentAction(id)
    setError('')
    setSuccess('')
    try {
      await updateAppointmentStatus(id, status)
      setAppointments(await getMyAppointments())
      setSuccess('Status do atendimento atualizado.')
    } catch (cause) {
      setError(schedulingErrorMessage(cause))
    } finally {
      setAppointmentAction('')
    }
  }
  return (
    <section className="section inner-page dashboard-page">
      <span className="eyebrow">Área profissional</span>
      <h1>Seu perfil profissional</h1>
      <p className="page-intro">
        Mantenha informações de apresentação e acessibilidade atualizadas.
      </p>
      <Notice title={`Verificação: ${verificationStatus}`}>
        O status é somente leitura para profissionais. A verificação depende de revisão
        administrativa.
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
      {loading ? (
        <p role="status">Carregando seu perfil…</p>
      ) : (
        <form className="auth-form" onSubmit={(event) => void save(event)}>
          <div className="form-field">
            <label htmlFor="presentation">Apresentação</label>
            <textarea
              id="presentation"
              rows={5}
              maxLength={2000}
              value={profile.presentation}
              onChange={(event) => setProfile({ ...profile, presentation: event.target.value })}
            />
            <p className="field-hint">Não inclua informações de pacientes ou dados clínicos.</p>
          </div>
          <FormField
            label="Especialidades (separadas por vírgula)"
            name="specialties"
            value={specialties}
            maxLength={500}
            onChange={(event) => setSpecialties(event.target.value)}
          />
          <FormField
            label="Registro profissional (opcional)"
            name="registration"
            value={profile.registration_number ?? ''}
            maxLength={100}
            onChange={(event) =>
              setProfile({ ...profile, registration_number: event.target.value || null })
            }
          />
          <FormField
            label="Modalidades de acessibilidade (separadas por vírgula)"
            name="modalities"
            value={modalities}
            maxLength={500}
            onChange={(event) => setModalities(event.target.value)}
          />
          <Button type="submit">Salvar perfil</Button>
          <Button type="button" variant="quiet" onClick={() => void logout()}>
            Sair da conta
          </Button>
        </form>
      )}
      <section className="professional-agenda" aria-labelledby="professional-agenda-heading">
        <h2 className="subheading" id="professional-agenda-heading">Minha agenda</h2>
        {appointmentsLoading ? <p role="status">Carregando atendimentos...</p> : appointments.length ? (
          <div className="agenda-list">
            {appointments.map((appointment) => (
              <article className="appointment-row" key={appointment.id}>
                <div className="appointment-date">
                  <strong>{formatProfessionalDate(appointment.starts_at, appointment.timezone, { day: '2-digit' })}</strong>
                  <span>{formatProfessionalDate(appointment.starts_at, appointment.timezone, { month: 'short' })}</span>
                </div>
                <div className="agenda-content">
                  <h3>{appointment.other_party_name}</h3>
                  <p>{formatProfessionalDate(appointment.starts_at, appointment.timezone, { dateStyle: 'short', timeStyle: 'short' })} · {appointment.duration_minutes} min</p>
                </div>
                <span className={`status-badge status-${appointment.status}`}>{appointmentStatusLabels[appointment.status]}</span>
                <div className="agenda-actions">
                  {appointment.status === 'requested' && (
                    <Button type="button" disabled={appointmentAction === appointment.id} onClick={() => void updateAppointment(appointment.id, 'confirmed')}>Confirmar</Button>
                  )}
                  {['requested', 'confirmed'].includes(appointment.status) && (
                    <Button type="button" variant="quiet" disabled={appointmentAction === appointment.id} onClick={() => void updateAppointment(appointment.id, 'cancelled')}>Cancelar</Button>
                  )}
                  {appointment.status === 'confirmed' && new Date(appointment.ends_at) <= new Date() && (
                    <Button type="button" variant="secondary" disabled={appointmentAction === appointment.id} onClick={() => void updateAppointment(appointment.id, 'completed')}>Concluir</Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : <p className="muted-copy">Nenhum atendimento na agenda.</p>}
      </section>
      <ProfessionalScheduleEditor />
    </section>
  )
}
