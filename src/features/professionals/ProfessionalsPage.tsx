import { useEffect, useState } from 'react'
import { ButtonLink } from '../../components/ui/ButtonLink'
import { FormField } from '../../components/ui/FormField'
import { Notice } from '../../components/ui/Notice'
import { ProfessionalCard } from '../../components/ui/ProfessionalCard'
import { SearchFilters, type ProfessionalFilters } from '../../components/ui/SearchFilters'
import { filterProfessionals } from './filterProfessionals'
import { professionals } from './data'
import { requireSupabase, supabaseConfigured } from '../../lib/supabaseClient'
import { formatCurrency } from '../../lib/formatCurrency'
import { getSchedulerSettings } from '../appointments/schedulingService'
import type { SchedulerSettings, VerifiedProfessional } from '../../types/database'

const emptyFilters: ProfessionalFilters = {
  specialty: '',
  availability: '',
  accessibility: '',
  communication: '',
  online: true,
}

export function ProfessionalsPage() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(emptyFilters)
  const [verified, setVerified] = useState<VerifiedProfessional[]>([])
  const [settings, setSettings] = useState<SchedulerSettings | null>(null)
  const [loading, setLoading] = useState(supabaseConfigured)
  const [serviceError, setServiceError] = useState('')
  const results = filterProfessionals(professionals, query, filters)
  const verifiedResults = verified.filter((person) => {
    const searchable = `${person.display_name} ${person.presentation} ${person.specialties.join(' ')}`
      .toLocaleLowerCase('pt-BR')
    return (
      (!query.trim() || searchable.includes(query.trim().toLocaleLowerCase('pt-BR'))) &&
      (!filters.specialty || person.specialties.includes(filters.specialty)) &&
      (!filters.accessibility || person.accessibility_modalities.includes(filters.accessibility))
    )
  })

  useEffect(() => {
    if (!supabaseConfigured) return
    let active = true
    void Promise.all([
      requireSupabase()
        .from('verified_professional_profiles')
        .select('*')
        .order('display_name'),
      getSchedulerSettings(),
    ])
      .then(([professionalsResult, schedulerSettings]) => {
        if (professionalsResult.error) throw professionalsResult.error
        if (!active) return
        setVerified(professionalsResult.data)
        setSettings(schedulerSettings)
      })
      .catch((cause: unknown) => {
        if (active) setServiceError(cause instanceof Error ? cause.message : 'Falha ao carregar profissionais.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="section inner-page search-page">
      <span className="eyebrow">Encontre seu espaço</span>
      <h1>
        Encontre alguém
        <br />
        <em>para caminhar junto.</em>
      </h1>
      <p className="page-intro">
        Consulte profissionais verificados e seus horários disponíveis. O valor da sessão aparece
        antes da solicitação.
      </p>
      <div className="search-panel">
        <FormField
          id="professional-search"
          label="O que você procura?"
          placeholder="Busque por nome ou tema"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          type="search"
        />
        <SearchFilters value={filters} onChange={setFilters} />
      </div>
      <div className="results-heading">
        <h2>Profissionais verificados</h2>
        {settings && <span>{formatCurrency(settings.price_cents / 100)} por sessão · {settings.duration_minutes} min</span>}
      </div>
      {serviceError && <Notice kind="error" title="Não foi possível carregar a agenda">{serviceError}</Notice>}
      {!supabaseConfigured && <Notice title="Agenda não conectada">Configure o Supabase para consultar profissionais reais e horários persistidos.</Notice>}
      {loading ? <p role="status">Carregando profissionais...</p> : verifiedResults.length ? (
        <div className="verified-professional-list">
          {verifiedResults.map((person) => (
            <article className="verified-professional-row" key={person.id}>
              <div>
                <span className="eyebrow">Psicologia · perfil verificado</span>
                <h3>{person.display_name}</h3>
                <p>{person.presentation || person.specialties.join(' · ') || 'Atendimento psicológico'}</p>
                {person.specialties.length > 0 && <ul className="tag-list">{person.specialties.map((item) => <li key={item}>{item}</li>)}</ul>}
              </div>
              <ButtonLink to={`/agendar/${person.id}`}>Ver horários <span aria-hidden="true">↗</span></ButtonLink>
            </article>
          ))}
        </div>
      ) : <p className="muted-copy">Nenhum profissional verificado corresponde à busca.</p>}
      <div className="results-heading demo-results-heading">
        <h2>Perfis de demonstração</h2>
        <span>{results.length} {results.length === 1 ? 'perfil' : 'perfis'} · não reserváveis</span>
      </div>
      <Notice title="Demonstrações fictícias">
        Os perfis abaixo não representam profissionais reais nem têm agenda conectada.
      </Notice>
      {results.length ? (
        <div className="professional-grid">
          {results.map((person) => (
            <ProfessionalCard key={person.id} professional={person} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span aria-hidden="true">⌕</span>
          <h2>Nenhum perfil por aqui</h2>
          <p>Tente outro termo ou remova alguns filtros.</p>
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setFilters(emptyFilters)
              setQuery('')
            }}
          >
            Limpar busca e filtros
          </button>
        </div>
      )}
    </section>
  )
}
