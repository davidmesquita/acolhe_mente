import { Link } from 'react-router-dom'

const questions = [
  {
    question: 'O atendimento já pode ser agendado?',
    answer: 'Sim, quando o Supabase está conectado: pacientes podem solicitar horários reais de profissionais verificados. O atendimento fica pendente até a confirmação do profissional.',
  },
  {
    question: 'Os profissionais e valores são reais?',
    answer:
      'Os perfis identificados como demonstração são fictícios. Profissionais verificados têm agenda reservável, e o valor social configurado pelo sistema aparece antes da solicitação.',
  },
  {
    question: 'Posso falar sobre uma questão de saúde aqui?',
    answer:
      'Não envie dados pessoais ou informações clínicas. Este portal ainda não possui atendimento, equipe de suporte ou canal seguro de contato.',
  },
  {
    question: 'Onde vejo as opções de acessibilidade?',
    answer:
      'Use os controles no topo das páginas ou visite a página de acessibilidade para conhecer os recursos planejados.',
  },
]

export function HelpPage() {
  return (
    <section className="section inner-page content-page">
      <span className="eyebrow">Estamos aqui para orientar</span>
      <h1>
        Ajuda, com
        <br />
        <em>clareza e calma.</em>
      </h1>
      <p className="page-intro">Respostas sobre a agenda e os recursos disponíveis no AcolheMente.</p>
      <div className="faq-list">
        {questions.map((item) => (
          <details key={item.question}>
            <summary>
              {item.question}
              <span aria-hidden="true">＋</span>
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
      <div className="help-contact">
        <h2>Precisa de mais informação?</h2>
        <p>
          O canal de suporte ainda está em preparação. Não informe dados clínicos nesta plataforma.
        </p>
        <Link className="text-link" to="/acessibilidade">
          Consultar acessibilidade ↗
        </Link>
      </div>
    </section>
  )
}
