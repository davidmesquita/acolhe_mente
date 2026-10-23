export type ProfessionalFilters = {
  specialty: string
  availability: string
  accessibility: string
  communication: string
  online: boolean
}

export function SearchFilters({
  value,
  onChange,
}: {
  value: ProfessionalFilters
  onChange: (value: ProfessionalFilters) => void
}) {
  function update(key: keyof ProfessionalFilters, next: string) {
    onChange({ ...value, [key]: next })
  }

  return (
    <fieldset className="search-filters">
      <legend>Refine sua busca</legend>
      <label className="filter-field">
        Especialidade
        <select
          value={value.specialty}
          onChange={(event) => update('specialty', event.target.value)}
        >
          <option value="">Todas as especialidades</option>
          <option>Ansiedade</option>
          <option>Relacionamentos</option>
          <option>Autoconhecimento</option>
        </select>
      </label>
      <label className="filter-field">
        Disponibilidade
        <select
          value={value.availability}
          onChange={(event) => update('availability', event.target.value)}
        >
          <option value="">Qualquer horário</option>
          <option>Manhã</option>
          <option>Tarde</option>
          <option>Noite</option>
        </select>
      </label>
      <label className="filter-field">
        Recurso de acessibilidade
        <select
          value={value.accessibility}
          onChange={(event) => update('accessibility', event.target.value)}
        >
          <option value="">Qualquer recurso</option>
          <option>Legendas</option>
          <option>Libras</option>
          <option>Leitura labial</option>
        </select>
      </label>
      <label className="filter-field">
        Comunicação
        <select
          value={value.communication}
          onChange={(event) => update('communication', event.target.value)}
        >
          <option value="">Qualquer preferência</option>
          <option>Chat antes da sessão</option>
          <option>Comunicação por texto</option>
        </select>
      </label>
      <div className="filter-checks">
        <span>Formato</span>
        <label>
          <input
            type="checkbox"
            checked={value.online}
            onChange={(event) => onChange({ ...value, online: event.target.checked })}
          />{' '}
          Atendimento online
        </label>
      </div>
    </fieldset>
  )
}
