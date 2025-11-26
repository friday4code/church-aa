import type { Region } from '@/types/regions.type'
import type { OldGroup } from '@/types/oldGroups.type'

export function getRegionsByStateName(stateName: string, regions: Region[]): Region[] {
  if (!stateName) return []
  return regions.filter(r => r.state === stateName)
}

/**
 * Filters and retrieves all old groups associated with a given region name.
 * @param regionName Case-sensitive region name to match against the `region` property
 * @param regionsData Source array of old groups (immutable)
 * @returns New array of matching old group objects preserving original structure
 * @example
 * const matches = getOldGroupsByRegion('Port Harcourt', oldGroups)
 */
export function getOldGroupsByRegion(regionName: string, regionsData: OldGroup[]): OldGroup[] {
  if (process.env.NODE_ENV !== 'production') {
    if (typeof regionName !== 'string') throw new TypeError('regionName must be a string')
    if (!Array.isArray(regionsData)) throw new TypeError('regionsData must be an array')
    for (const item of regionsData) {
      if (!item || typeof item !== 'object') throw new TypeError('regionsData items must be objects')
      if (typeof (item as OldGroup).id !== 'number') throw new TypeError('OldGroup.id must be number')
      if (typeof (item as OldGroup).name !== 'string') throw new TypeError('OldGroup.name must be string')
      if (typeof (item as OldGroup).code !== 'string') throw new TypeError('OldGroup.code must be string')
      if (typeof (item as OldGroup).state !== 'string') throw new TypeError('OldGroup.state must be string')
      if (typeof (item as OldGroup).region !== 'string') throw new TypeError('OldGroup.region must be string')
    }
  }
  if (!regionName || regionsData.length === 0) return []
  return regionsData.filter((g) => g.region === regionName)
}

/**
 * Resolve a state ID from a combobox value.
 * Accepts either a numeric string (id) or an exact state name.
 * Returns 0 when not resolvable.
 */
export function resolveStateIdFromValue(value: string, list: Array<{ id: number; name: string }>): number {
  const n = parseInt(value || '', 10)
  if (Number.isFinite(n) && n > 0) return n
  const match = (list || []).find(s => s.name === value)
  return match?.id ?? 0
}
