import { describe, it, expect } from 'vitest'
import { getRegionsByStateName } from '../regionFilters'
import type { Region } from '@/types/regions.type'

const sampleRegions: Region[] = [
  { code: 'R1', id: 1, leader: 'L1', name: 'Alpha', state: 'AKWA IBOM', state_id: 2 },
  { code: 'R2', id: 2, leader: 'L2', name: 'Beta', state: 'AKWA IBOM', state_id: 2 },
  { code: 'R3', id: 3, leader: 'L3', name: 'Gamma', state: 'Cross River', state_id: 3 },
]

describe('getRegionsByStateName', () => {
  it('returns all regions matching exact state name', () => {
    const result = getRegionsByStateName('AKWA IBOM', sampleRegions)
    expect(result.length).toBe(2)
    expect(result.map(r => r.name)).toEqual(['Alpha', 'Beta'])
  })

  it('is case-sensitive and does not match different casing', () => {
    const result = getRegionsByStateName('akwa ibom', sampleRegions)
    expect(result.length).toBe(0)
  })

  it('returns empty array when no matches', () => {
    const result = getRegionsByStateName('Unknown State', sampleRegions)
    expect(result.length).toBe(0)
  })

  it('handles large datasets efficiently', () => {
    const large: Region[] = []
    for (let i = 0; i < 50000; i++) {
      large.push({ code: `C${i}`, id: i, leader: `L${i}`, name: `N${i}`, state: i % 2 === 0 ? 'AKWA IBOM' : 'Cross River', state_id: i % 2 === 0 ? 2 : 3 })
    }
    const start = performance.now()
    const result = getRegionsByStateName('AKWA IBOM', large)
    const duration = performance.now() - start
    expect(result.length).toBe(25000)
    expect(duration).toBeLessThan(2000)
  })
})
