import type { ProfessionalFilters } from '../../components/ui/SearchFilters'
import type { Professional } from '../../types/professional'

export function filterProfessionals(
  profiles: Professional[],
  query: string,
  filters: ProfessionalFilters,
) {
  const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR')
  return profiles.filter((person) => {
    const searchable = `${person.name} ${person.focus} ${person.description}`.toLocaleLowerCase(
      'pt-BR',
    )
    const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery)
    return (
      matchesQuery &&
      (!filters.specialty || person.specialty === filters.specialty) &&
      (!filters.availability || person.availability.includes(filters.availability)) &&
      (!filters.accessibility || person.accessibility.includes(filters.accessibility)) &&
      (!filters.communication || person.communication.includes(filters.communication)) &&
      (!filters.online || person.online)
    )
  })
}
