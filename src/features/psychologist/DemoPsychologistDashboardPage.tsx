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
export function DemoPsychologistDashboardPage() {
  return (
    <section className="section inner-page dashboard-page">
      <span className="eyebrow">Área profissional · demonstração</span>
      <h1>Sua agenda, com mais cuidado.</h1>
      <p className="page-intro">Exemplo fictício. Nenhum paciente ou horário é real.</p>
      <Notice title="Agenda fictícia">
        Esta demonstração não recebe nem armazena dados de pacientes.
      </Notice>
      <div className="agenda-toolbar">
        <h2>Quarta-feira, 28 de outubro</h2>
        <span>Horários locais · demonstração</span>
      </div>
      <div className="agenda-list">
        {agenda.map((item) => (
          <article className="agenda-row" key={item.time}>
            <time>{item.time}</time>
            <div className="agenda-line" aria-hidden="true" />
            <div className="agenda-content">
              <h3>{item.name} · perfil fictício</h3>
              <p>{item.mode}</p>
            </div>
            <StatusBadge status={item.status}>{item.label}</StatusBadge>
          </article>
        ))}
      </div>
    </section>
  )
}
