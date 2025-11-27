import { describe, it, expect } from 'vitest'
import { mapOldGroupsToCombo } from '../oldGroupCombo.utils'

describe('mapOldGroupsToCombo', () => {
  it('maps id and name to label/value strings', () => {
    const input = [
      { id: 501, name: 'OG-Alpha' },
      { id: 502, name: 'OG-Beta' },
    ]
    const result = mapOldGroupsToCombo(input)
    expect(result).toEqual([
      { label: 'OG-Alpha', value: '501' },
      { label: 'OG-Beta', value: '502' },
    ])
  })

  it('handles empty arrays', () => {
    const result = mapOldGroupsToCombo([])
    expect(result).toEqual([])
  })
})
