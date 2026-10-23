import { Link } from 'react-router-dom'

const questions = [
  {
    question: 'O atendimento já pode ser agendado?',
    answer: 'Ainda não. A página de horários é uma demonstração local e não reserva consultas.',
  },
  {
    question: 'Os profissionais e valores são reais?',
    answer:
      'Não. Todos os perfis, horários e recursos são fictícios. O preço de R$ 50 é uma referência demonstrativa do produto.',
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
      <p className="page-intro">Respostas sobre esta versão de demonstração do AcolheMente.</p>
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
          O canal de suporte ainda está em preparação. Nenhuma mensagem será solicitada ou coletada
          por esta demonstração.
        </p>
        <Link className="text-link" to="/acessibilidade">
          Consultar acessibilidade ↗
        </Link>
      </div>
    </section>
  )
}
