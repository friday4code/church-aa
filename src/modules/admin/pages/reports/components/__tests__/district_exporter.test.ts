import { describe, it, expect } from 'vitest'
import XLSX from 'xlsx-js-style'
import { buildDistrictReportSheet } from '../exporters'
import type { AttendanceRecord } from '@/types/attendance.type'

const sample: AttendanceRecord[] = [
  { id: 1, children_boys: 0, children_girls: 0, district_id: 10, group_id: 100, men: 2, month: 'January', old_group_id: 900, region_id: 5, service_type: 'Sunday Service', state_id: 2, week: 1, women: 3, year: 2025, youth_boys: 1, youth_girls: 0, created_at: '', updated_at: '' },
  { id: 2, children_boys: 1, children_girls: 1, district_id: 10, group_id: 100, men: 1, month: 'January', old_group_id: 900, region_id: 5, service_type: 'Sunday Service', state_id: 2, week: 2, women: 2, year: 2025, youth_boys: 0, youth_girls: 1, created_at: '', updated_at: '' },
]

describe('buildDistrictReportSheet', () => {
  it('renders weeks under each month for districts', () => {
    const districts = [{ id: 10, name: 'District 10', group_id: 100 }]
    const sheet = buildDistrictReportSheet(sample, districts as any, 'Group 100', 2025, { range: { from: 1, to: 1 } }, 100)
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | number)[][]
    const rowsForDistrict = data.filter(r => typeof r[0] === 'string' && (r[0] as string).includes('District 10'))
    expect(rowsForDistrict.length).toBeGreaterThanOrEqual(2)
    expect(rowsForDistrict[0][0]).toContain('Week 1')
    expect(rowsForDistrict[1][0]).toContain('Week 2')
  })
})

