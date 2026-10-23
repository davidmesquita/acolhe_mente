import { describe, expect, it } from 'vitest'
import { formatCurrency } from '../../src/lib/formatCurrency'

describe('formatCurrency', () => {
  it('formats the social session price in Brazilian reais', () => {
    expect(formatCurrency(50)).toBe('R$ 50,00')
  })
})
