import { ProfessionalCard } from '../../components/ui/ProfessionalCard'
import { professionals } from './data'

export function ProfessionalsPage() {
  return (
    <section className="section inner-page">
      <span className="eyebrow">Rede de acolhimento · demonstração</span>
      <h1>
        Conheça quem pode
        <br />
        <em>caminhar com você.</em>
      </h1>
      <p className="page-intro">
        Perfis fictícios para apresentar a experiência do portal. Cada sessão tem valor social
        demonstrativo de R$ 50.
      </p>
      <div className="professional-grid">
        {professionals.map((person) => (
          <ProfessionalCard key={person.id} professional={person} />
        ))}
      </div>
    </section>
  )
}
