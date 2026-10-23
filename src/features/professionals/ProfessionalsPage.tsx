import { useState } from 'react'
import { FormField } from '../../components/ui/FormField'
import { Notice } from '../../components/ui/Notice'
import { ProfessionalCard } from '../../components/ui/ProfessionalCard'
import { SearchFilters, type ProfessionalFilters } from '../../components/ui/SearchFilters'
import { filterProfessionals } from './filterProfessionals'
import { professionals } from './data'

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
  const results = filterProfessionals(professionals, query, filters)

  return (
    <section className="section inner-page search-page">
      <span className="eyebrow">Encontre seu espaço · demonstração</span>
      <h1>
        Encontre alguém
        <br />
        <em>para caminhar junto.</em>
      </h1>
      <p className="page-intro">
        Conheça perfis criados para demonstrar o portal. As informações abaixo são fictícias; não
        representam profissionais reais.
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
        <h2>
          {results.length} {results.length === 1 ? 'perfil encontrado' : 'perfis encontrados'}
        </h2>
        <span>R$ 50 por sessão · valor de referência</span>
      </div>
      <Notice title="Perfis demonstrativos">
        Nenhum perfil, disponibilidade ou recurso listado aqui foi verificado.
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
