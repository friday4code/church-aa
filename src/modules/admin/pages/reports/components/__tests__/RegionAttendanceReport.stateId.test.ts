import { describe, it, expect } from 'vitest'
import { resolveStateIdFromValue } from '../regionFilters'

const states = [
  { id: 1, name: 'AKWA IBOM' },
  { id: 2, name: 'Rivers Central' },
  { id: 3, name: 'Cross River' },
]

describe('resolveStateIdFromValue', () => {
  it('returns numeric id when value is an id string', () => {
    expect(resolveStateIdFromValue('3', states)).toBe(3)
  })

  it('returns state id when value is exact state name', () => {
    expect(resolveStateIdFromValue('Rivers Central', states)).toBe(2)
  })

  it('returns 0 for empty or invalid values', () => {
    expect(resolveStateIdFromValue('', states)).toBe(0)
    expect(resolveStateIdFromValue('Unknown', states)).toBe(0)
  })
})
