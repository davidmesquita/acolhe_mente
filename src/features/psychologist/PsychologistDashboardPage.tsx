import { StatusBadge } from '../../components/ui/StatusBadge'
import { Notice } from '../../components/ui/Notice'

const agenda = [
  {
    time: '09:00',
    name: 'Camila R.',
    mode: 'Online · Legendas solicitadas',
    status: 'confirmed' as const,
    label: 'Confirmado',
  },
  {
    time: '11:30',
    name: 'Rafael M.',
    mode: 'Online · Comunicação por texto',
    status: 'pending' as const,
    label: 'Aguardando confirmação',
  },
  {
    time: '15:00',
    name: 'Joana P.',
    mode: 'Online · Atendimento demonstrativo',
    status: 'demo' as const,
    label: 'Exemplo',
  },
]

export function PsychologistDashboardPage() {
  return (
    <section className="section inner-page dashboard-page">
      <span className="eyebrow">Área do psicólogo · demonstração</span>
      <h1>
        Sua agenda,
        <br />
        <em>com mais cuidado.</em>
      </h1>
      <p className="page-intro">
        Uma visualização de exemplo para a área profissional. Nenhum paciente ou horário é real.
      </p>
      <Notice title="Agenda fictícia">
        Os nomes e as preferências são inventados. Esta tela não recebe nem armazena dados de
        pacientes.
      </Notice>
      <div className="agenda-toolbar">
        <h2>Quarta-feira, 28 de outubro</h2>
        <span>Horários locais · demonstração</span>
      </div>
      <div className="agenda-list">
        {agenda.map((item) => (
          <article className="agenda-row" key={item.time}>
            <time>{item.time}</time>
            <div className="agenda-line" aria-hidden="true"></div>
            <div className="agenda-content">
              <h3>
                {item.name} <span>· perfil fictício</span>
              </h3>
              <p>{item.mode}</p>
            </div>
            <StatusBadge status={item.status}>{item.label}</StatusBadge>
          </article>
        ))}
      </div>
      <p className="field-hint">Não use esta página para coordenar atendimentos reais.</p>
    </section>
  )
}
