import { describe, it, expect } from 'vitest'
import type { AttendanceRecord } from '@/types/attendance.type'
import { getAllowedReportTypes, restrictAttendanceByScope } from './permissions.utils'

const sample: AttendanceRecord[] = [
  { id: 1, children_boys: 0, children_girls: 0, district_id: 10, group_id: 100, men: 0, month: 'January', old_group_id: null, region_id: 5, service_type: 'Sunday Service', state_id: 2, week: 1, women: 0, year: 2025, youth_boys: 0, youth_girls: 0, created_at: '', updated_at: '' },
  { id: 2, children_boys: 0, children_girls: 0, district_id: 11, group_id: 101, men: 0, month: 'February', old_group_id: null, region_id: 6, service_type: 'House Caring', state_id: 3, week: 2, women: 0, year: 2025, youth_boys: 0, youth_girls: 0, created_at: '', updated_at: '' },
]

describe('getAllowedReportTypes', () => {
  it('allows all for Super Admin', () => {
    const allowed = getAllowedReportTypes(['Super Admin'])
    expect(allowed).toContain('state')
    expect(allowed).toContain('region')
    expect(allowed).toContain('group')
    expect(allowed).toContain('youth')
  })

  it('allows region/group/youth for Region Admin', () => {
    const allowed = getAllowedReportTypes(['Region Admin'])
    expect(allowed).toEqual(['region', 'group', 'youth'])
  })

  it('allows only group for Group Admin', () => {
    const allowed = getAllowedReportTypes(['Group Admin'])
    expect(allowed).toEqual(['group'])
  })
})

describe('restrictAttendanceByScope', () => {
  it('keeps all for Super Admin', () => {
    const out = restrictAttendanceByScope(sample, { roles: ['Super Admin'] })
    expect(out.length).toBe(2)
  })

  it('filters by state for State Admin', () => {
    const out = restrictAttendanceByScope(sample, { roles: ['State Admin'], state_id: 2 })
    expect(out.map(a => a.id)).toEqual([1])
  })

  it('filters by region for Region Admin', () => {
    const out = restrictAttendanceByScope(sample, { roles: ['Region Admin'], region_id: 6 })
    expect(out.map(a => a.id)).toEqual([2])
  })

  it('filters by district for District Admin', () => {
    const out = restrictAttendanceByScope(sample, { roles: ['District Admin'], district_id: 10 })
    expect(out.map(a => a.id)).toEqual([1])
  })

  it('filters by group for Group Admin', () => {
    const out = restrictAttendanceByScope(sample, { roles: ['Group Admin'], group_id: 101 })
    expect(out.map(a => a.id)).toEqual([2])
  })
})