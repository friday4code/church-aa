import { describe, it, expect } from 'vitest'
import { getOldGroupsByRegion } from '../regionFilters'
import type { OldGroup } from '@/types/oldGroups.type'

const buildOldGroup = (id: number, name: string, region: string, state = 'AKWA IBOM'): OldGroup => ({
  id,
  name,
  code: `OG${id}`,
  leader: '',
  state,
  region,
  state_id: 2,
  region_id: 5,
})

describe('getOldGroupsByRegion', () => {
  it('returns exact matches for region name (case-sensitive)', () => {
    const data: OldGroup[] = [
      buildOldGroup(1, 'A', 'Port Harcourt'),
      buildOldGroup(2, 'B', 'Port Harcourt'),
      buildOldGroup(3, 'C', 'Bonny'),
    ]
    const res = getOldGroupsByRegion('Port Harcourt', data)
    expect(res.length).toBe(2)
    expect(res.map(x => x.name)).toEqual(['A', 'B'])
  })

  it('is case-sensitive and does not match different casing', () => {
    const data: OldGroup[] = [buildOldGroup(1, 'A', 'Port Harcourt')]
    const res = getOldGroupsByRegion('port harcourt', data)
    expect(res.length).toBe(0)
  })

  it('returns empty array for empty data', () => {
    const res = getOldGroupsByRegion('Port Harcourt', [])
    expect(res).toEqual([])
  })

  it('maintains data structure integrity and immutability', () => {
    const data: OldGroup[] = [buildOldGroup(1, 'A', 'PH')]
    const before = JSON.stringify(data)
    const res = getOldGroupsByRegion('PH', data)
    expect(res[0]).toHaveProperty('code')
    expect(JSON.stringify(data)).toBe(before)
  })

  it('handles large datasets efficiently', () => {
    const data: OldGroup[] = []
    for (let i = 0; i < 15000; i++) data.push(buildOldGroup(i, `N${i}`, i % 2 ? 'PH' : 'Bonny'))
    const start = performance.now()
    const res = getOldGroupsByRegion('PH', data)
    const dur = performance.now() - start
    expect(res.length).toBeGreaterThan(7000)
    expect(dur).toBeLessThan(2000)
  })

  it('throws on invalid inputs in development mode', () => {
    const data: OldGroup[] = [buildOldGroup(1, 'A', 'PH')]
    const oldEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    expect(() => getOldGroupsByRegion(undefined as unknown as string, data)).toThrow()
    expect(() => getOldGroupsByRegion('PH', null as unknown as OldGroup[])).toThrow()
    process.env.NODE_ENV = oldEnv
  })
})

