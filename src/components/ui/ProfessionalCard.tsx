import type { Professional } from '../../types/professional'
import { ButtonLink } from './ButtonLink'

export function ProfessionalCard({ professional }: { professional: Professional }) {
  return (
    <article className="professional-card">
      <div
        className={`portrait portrait-${professional.color}`}
        role="img"
        aria-label={`Ilustração abstrata de ${professional.name}; perfil fictício`}
      >
        <span>{professional.initials}</span>
      </div>
      <div className="professional-info">
        <span className="eyebrow">{professional.focus}</span>
        <h3>{professional.name}</h3>
        <p>{professional.description}</p>
        <div className="card-bottom">
          <span className="price">Perfil fictício</span>
          <ButtonLink
            to={`/profissionais/${professional.id}`}
            aria-label={`Ver perfil de demonstração de ${professional.name}`}
          >
            Conhecer <span aria-hidden="true">↗</span>
          </ButtonLink>
        </div>
      </div>
    </article>
  )
}
