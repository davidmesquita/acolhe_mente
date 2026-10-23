import { describe, expect, it } from 'vitest'
import { professionals } from '../../src/features/professionals/data'
import { filterProfessionals } from '../../src/features/professionals/filterProfessionals'

const noFilters = {
  specialty: '',
  availability: '',
  accessibility: '',
  communication: '',
  online: true,
}

describe('filterProfessionals', () => {
  it('matches the search query without case sensitivity', () => {
    expect(
      filterProfessionals(professionals, 'ANA LIMA', noFilters).map((person) => person.id),
    ).toEqual(['ana-lima'])
  })

  it('combines specialty, availability, accessibility, and communication filters', () => {
    const result = filterProfessionals(professionals, '', {
      specialty: 'Autoconhecimento',
      availability: 'Manhã',
      accessibility: 'Libras',
      communication: 'Comunicação por texto',
      online: true,
    })
    expect(result.map((person) => person.id)).toEqual(['joao-santos'])
  })

  it('returns an empty result when no profile matches', () => {
    expect(filterProfessionals(professionals, 'termo inexistente', noFilters)).toEqual([])
  })
})
