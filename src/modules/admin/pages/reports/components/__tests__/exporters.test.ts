import { describe, it, expect } from 'vitest'
import { getReportFileName, buildStateReportSheet, buildRegionReportSheet, buildGroupReportSheet, buildOldGroupReportSheet, buildYouthMonthlyReportSheet } from '../exporters'
import type { AttendanceRecord } from '@/types/attendance.type'
import type { OldGroup } from '@/types/oldGroups.type'
import XLSX from 'xlsx-js-style'

const sampleAttendance: AttendanceRecord[] = [
  { id: 1, children_boys: 2, children_girls: 3, district_id: 10, group_id: 100, men: 5, month: 'January', old_group_id: 900, region_id: 5, service_type: 'Sunday Service', state_id: 2, week: 1, women: 4, year: 2025, youth_boys: 1, youth_girls: 2, created_at: '', updated_at: '' },
  { id: 2, children_boys: 1, children_girls: 1, district_id: 11, group_id: 101, men: 3, month: 'January', old_group_id: 901, region_id: 5, service_type: 'House Caring', state_id: 2, week: 2, women: 2, year: 2025, youth_boys: 0, youth_girls: 1, created_at: '', updated_at: '' },
  { id: 3, children_boys: 0, children_girls: 2, district_id: 12, group_id: 102, men: 7, month: 'February', old_group_id: 900, region_id: 6, service_type: 'Sunday Service', state_id: 2, week: 3, women: 6, year: 2025, youth_boys: 3, youth_girls: 1, created_at: '', updated_at: '' },
]

describe('getReportFileName', () => {
  it('generates state filename with correct pattern', () => {
    const name = getReportFileName('state')
    expect(name.startsWith('State Report Sheet File_')).toBe(true)
    expect(name.endsWith('.xlsx')).toBe(true)
    const stamp = name.replace('State Report Sheet File_', '').replace('.xlsx', '')
    expect(/^[0-9]{4}_[0-9]{2}_[0-9]{2}__[0-9]{2}_[0-9]{2}_[0-9]{2}$/.test(stamp)).toBe(true)
  })

  it('generates region filename with correct pattern', () => {
    const name = getReportFileName('region')
    expect(name.startsWith('Region Report Sheet File_')).toBe(true)
    expect(name.endsWith('.xlsx')).toBe(true)
    const stamp = name.replace('Region Report Sheet File_', '').replace('.xlsx', '')
    expect(/^[0-9]{4}_[0-9]{2}_[0-9]{2}__[0-9]{2}_[0-9]{2}_[0-9]{2}$/.test(stamp)).toBe(true)
  })

  it('generates group filename with correct pattern', () => {
    const name = getReportFileName('group')
    expect(name.startsWith('Group Report Sheet File_')).toBe(true)
    expect(name.endsWith('.xlsx')).toBe(true)
    const stamp = name.replace('Group Report Sheet File_', '').replace('.xlsx', '')
    expect(/^[0-9]{4}_[0-9]{2}_[0-9]{2}__[0-9]{2}_[0-9]{2}_[0-9]{2}$/.test(stamp)).toBe(true)
  })

  it('generates oldGroup filename with correct pattern', () => {
    const name = getReportFileName('oldGroup')
    expect(name.startsWith('Old Group Report Sheet File_')).toBe(true)
    expect(name.endsWith('.xlsx')).toBe(true)
    const stamp = name.replace('Old Group Report Sheet File_', '').replace('.xlsx', '')
    expect(/^[0-9]{4}_[0-9]{2}_[0-9]{2}__[0-9]{2}_[0-9]{2}_[0-9]{2}$/.test(stamp)).toBe(true)
  })

  it('generates district filename with correct pattern', () => {
    const name = getReportFileName('district')
    expect(name.startsWith('District Report Sheet File_')).toBe(true)
    expect(name.endsWith('.xlsx')).toBe(true)
    const stamp = name.replace('District Report Sheet File_', '').replace('.xlsx', '')
    expect(/^[0-9]{4}_[0-9]{2}_[0-9]{2}__[0-9]{2}_[0-9]{2}_[0-9]{2}$/.test(stamp)).toBe(true)
  })

  it('generates youth filename with correct pattern', () => {
    const name = getReportFileName('youth')
    expect(name.startsWith('Youth Monthly Report_')).toBe(true)
    expect(name.endsWith('.xlsx')).toBe(true)
    const stamp = name.replace('Youth Monthly Report_', '').replace('.xlsx', '')
    expect(/^[0-9]{4}_[0-9]{2}_[0-9]{2}__[0-9]{2}_[0-9]{2}_[0-9]{2}$/.test(stamp)).toBe(true)
  })
})

describe('buildStateReportSheet', () => {
  it('builds sheet with headers and subtotal for selected regions', () => {
    const regions = [ { id: 5, name: 'Region Five' }, { id: 6, name: 'Region Six' } ]
    const sheet = buildStateReportSheet(sampleAttendance, regions, 'AKWA IBOM', 2025, { single: 'January' })
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | number)[][]
    expect(data[0][0]).toBe('Deeper Life Bible Church, AKWA IBOM (State)')
    expect(data[5][0]).toBe('Regions')
    const lastRow = data[data.length - 2]
    expect(lastRow[0]).toBe('SubTotal')
    
    const janRegion5 = sampleAttendance.filter(a => a.region_id === 5 && a.year === 2025 && a.month === 'January')
    const men = janRegion5.reduce((s, a) => s + a.men, 0)
    const women = janRegion5.reduce((s, a) => s + a.women, 0)
    const adultsTotal = men + women
    const yb = janRegion5.reduce((s, a) => s + a.youth_boys, 0)
    const yg = janRegion5.reduce((s, a) => s + a.youth_girls, 0)
    const youthsTotal = yb + yg
    const cb = janRegion5.reduce((s, a) => s + a.children_boys, 0)
    const cg = janRegion5.reduce((s, a) => s + a.children_girls, 0)
    const childrenTotal = cb + cg
    const grandTotal = adultsTotal + youthsTotal + childrenTotal

    const rowForRegion5 = data.find(r => r[0] === 'Region Five')
    expect(rowForRegion5).toBeTruthy()
    if (rowForRegion5) {
      expect(rowForRegion5[2]).toBe(men)
      expect(rowForRegion5[3]).toBe(women)
      expect(rowForRegion5[4]).toBe(adultsTotal)
      expect(rowForRegion5[5]).toBe(yb)
      expect(rowForRegion5[6]).toBe(yg)
      expect(rowForRegion5[7]).toBe(youthsTotal)
      expect(rowForRegion5[10]).toBe(cg)
      expect(rowForRegion5[11]).toBe(childrenTotal)
      expect(rowForRegion5[12]).toBe(grandTotal)
    }

    // Verify merges reflect template
    const hasMergesArray = Array.isArray((sheet as unknown as Record<string, unknown>)['!merges'] as unknown[])
    expect(hasMergesArray).toBe(true)
    const merges = (sheet as unknown as Record<string, unknown>)['!merges'] as Array<{ s: { r: number; c: number }; e: { r: number; c: number } }>
    expect(merges.length).toBeGreaterThanOrEqual(8)

    // Verify column widths applied
    const cols = (sheet as unknown as Record<string, unknown>)['!cols'] as Array<{ wch: number }>
    expect(cols[0].wch).toBe(25)
    expect(cols[12].wch).toBe(12)

    // Verify styles on title and headers
    const a1 = (sheet as unknown as Record<string, unknown>)['A1'] as { s: { font: { bold: boolean } } }
    expect(a1.s.font.bold).toBe(true)
    const c4 = (sheet as unknown as Record<string, unknown>)['C4'] as { s: { font: { bold: boolean } } }
    expect(c4.s.font.bold).toBe(true)

    // Verify subtotal style fill color
    const firstSubtotalIndex = data.findIndex((r: (string | number)[]) => r[0] === 'SubTotal')
    const addr = XLSX.utils.encode_cell({ r: firstSubtotalIndex, c: 0 })
    const subCell = (sheet as unknown as Record<string, unknown>)[addr] as { s: { fill: { fgColor: { rgb: string } } } }
    expect(subCell.s.fill.fgColor.rgb).toBe('FFFF99')

    // Verify subtotal alignment: label left, numbers right
    const labelCell = (sheet as unknown as Record<string, unknown>)[XLSX.utils.encode_cell({ r: firstSubtotalIndex, c: 0 })] as { s: { alignment: { horizontal: string } } }
    expect(labelCell.s.alignment.horizontal).toBe('left')
    const numCell = (sheet as unknown as Record<string, unknown>)[XLSX.utils.encode_cell({ r: firstSubtotalIndex, c: 4 })] as { s: { alignment: { horizontal: string } } }
    expect(numCell.s.alignment.horizontal).toBe('right')
  })

  it('groups by month and adds subtotal per month', () => {
    const regions = [ { id: 5, name: 'Region Five' }, { id: 6, name: 'Region Six' } ]
    const sheet = buildStateReportSheet(sampleAttendance, regions, 'AKWA IBOM', 2025, { range: { from: 1, to: 2 } })
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | number)[][]
    const subtotalRows = data.filter(r => r[0] === 'SubTotal')
    expect(subtotalRows.length).toBeGreaterThanOrEqual(2)
    const janSubtotal = subtotalRows[0]
    expect(janSubtotal[1]).toBe('')
    const febSubtotal = subtotalRows[1]
    expect(febSubtotal[1]).toBe('')
  })

  it('subtitle reflects 1-based month range correctly', () => {
    const regions = [ { id: 5, name: 'Region Five' } ]
    const sheet = buildStateReportSheet(sampleAttendance, regions, 'AKWA IBOM', 2025, { range: { from: 1, to: 11 } })
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | number)[][]
    expect(data[1][0]).toBe('January - November 2025')
  })

  it('subtitle reflects single month correctly', () => {
    const regions = [ { id: 5, name: 'Region Five' } ]
    const sheet = buildStateReportSheet(sampleAttendance, regions, 'AKWA IBOM', 2025, { single: 'February' })
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | number)[][]
    expect(data[1][0]).toBe('February 2025')
  })

  it('subtitle reflects full year when months length is 12', () => {
    const regions = [ { id: 5, name: 'Region Five' } ]
    const sheet = buildStateReportSheet(sampleAttendance, regions, 'AKWA IBOM', 2025, { range: { from: 1, to: 12 } })
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | number)[][]
    expect(data[1][0]).toBe('January - December 2025')
  })
})

describe('buildRegionReportSheet', () => {
  it('builds sheet with old groups and subtotal', () => {
    const oldGroups: OldGroup[] = [
      { id: 900, name: 'OG-900', code: 'OG900', leader: '', state: '', region: '', state_id: 2, region_id: 5 },
      { id: 901, name: 'OG-901', code: 'OG901', leader: '', state: '', region: '', state_id: 2, region_id: 5 },
    ]
    const sheet = buildRegionReportSheet(sampleAttendance, oldGroups, 'Region Five', 2025, { months: ['January'] }, 5)
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | number)[][]
    expect(data[0][0]).toBe('Deeper Life Bible Church, Region Five (Region)')
    expect(data[5][0]).toBe('Old Groups')
    const idx = (() => {
      for (let i = data.length - 1; i >= 0; i--) {
        const r = data[i] as (string | number)[]
        if (r[0] === 'SubTotal') return i
      }
      return -1
    })()
    const lastRow = data[idx]
    expect(lastRow[0]).toBe('SubTotal')
    const ogRow = data.find((r: (string | number)[]) => r[0] === 'OG-900')
    expect(ogRow).toBeTruthy()

    // Verify styles similar to state report
    const a1 = (sheet as unknown as Record<string, unknown>)['A1'] as { s: { font: { bold: boolean } } }
    expect(a1.s.font.bold).toBe(true)
    const c4 = (sheet as unknown as Record<string, unknown>)['C4'] as { s: { font: { bold: boolean } } }
    expect(c4.s.font.bold).toBe(true)
  })
})

describe('buildGroupReportSheet', () => {
  it('builds sheet with districts and subtotal', () => {
    const districts = [
      { id: 10, name: 'Alu District', group_id: 100 },
      { id: 11, name: 'Beta District', group_id: 100 },
    ]
    const sheet = buildGroupReportSheet(sampleAttendance, districts, 'Alu Group', 2025, { months: ['January'] }, 100)
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | number)[][]
    expect(data[0][0]).toBe('Deeper Life Bible Church, Alu Group (Group)')
    expect(data[5][0]).toBe('Districts')
    const aluRow = data.find((r: (string | number)[]) => r[0] === 'Alu District')
    expect(aluRow).toBeTruthy()
    const subtotalRows = data.filter(r => r[0] === 'SubTotal')
    expect(subtotalRows.length).toBeGreaterThanOrEqual(1)
  })
})
describe('buildOldGroupReportSheet', () => {
  it('builds sheet with groups and subtotal', () => {
    const groups = [
      { id: 201, name: 'Group A', code: 'GA', leader: null, state: 'AK', region: 'PH', district: 'D', old_group_id: 501, old_group: 'OG', createdAt: undefined, updatedAt: undefined },
      { id: 202, name: 'Group B', code: 'GB', leader: null, state: 'AK', region: 'PH', district: 'D', old_group_id: 501, old_group: 'OG', createdAt: undefined, updatedAt: undefined },
    ]
    const sheet = buildOldGroupReportSheet(sampleAttendance, groups as any, 'PH Old Group', 2025, { months: ['January'] }, 501)
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | number)[][]
    expect(data[0][0]).toBe('Deeper Life Bible Church, PH Old Group (Old Group)')
    expect(data[5][0]).toBe('Groups')
    const groupRow = data.find((r: (string | number)[]) => r[0] === 'Group A' || r[0] === 'Group B')
    expect(groupRow).toBeTruthy()
    const subtotalRows = data.filter(r => r[0] === 'SubTotal')
    expect(subtotalRows.length).toBeGreaterThanOrEqual(1)
  })
})
describe('buildYouthMonthlyReportSheet', () => {
  it('builds youth monthly sheet matching template structure', () => {
    const weekly = [
      { id: 1, attendance_type: 'weekly', state_id: 1, region_id: 5, district_id: 10, group_id: 100, old_group_id: null, year: 2025, month: 'January', week: 1, male: 0, female: 0, member_boys: 10, member_girls: 12, visitor_boys: 2, visitor_girls: 3 },
      { id: 2, attendance_type: 'weekly', state_id: 1, region_id: 5, district_id: 10, group_id: 100, old_group_id: null, year: 2025, month: 'January', week: 2, male: 0, female: 0, member_boys: 8, member_girls: 11, visitor_boys: 1, visitor_girls: 2 },
      { id: 3, attendance_type: 'weekly', state_id: 1, region_id: 5, district_id: 10, group_id: 101, old_group_id: null, year: 2025, month: 'January', week: 1, male: 0, female: 0, member_boys: 6, member_girls: 7, visitor_boys: 1, visitor_girls: 1 },
    ]
    const groups = [ { id: 100, name: 'Group A' }, { id: 101, name: 'Group B' } ]
    const sheet = buildYouthMonthlyReportSheet(weekly as any, 'Region Five', 'January', 2025, groups)
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | number)[]
    expect(data[0][0]).toBe('DEEPER LIFE STUDENTS OUTREACH (DLSO) MONTHLY REPORT')
    expect(String(data[1][0]).includes('REGION: Region Five')).toBe(true)
    expect(String(data[1][2]).includes('MONTH: January')).toBe(true)
    expect(String(data[1][3]).includes('YEAR: 2025')).toBe(true)

    const header3 = data[2] as (string | number)[]
    expect(header3[0]).toBe('GROUP')
    expect(header3[1]).toBe('NO OF YHSF')
    expect(header3[3]).toBe('STRENGTH OF LAST MONTH')
    expect(header3[5]).toBe('WEEK 1')
    expect(header3[15]).toBe('AVERAGE')

    const merges = (sheet as unknown as Record<string, unknown>)['!merges'] as Array<{ s: { r: number; c: number }; e: { r: number; c: number } }>
    expect(Array.isArray(merges)).toBe(true)
    expect(merges.length).toBeGreaterThanOrEqual(8)

    const cols = (sheet as unknown as Record<string, unknown>)['!cols'] as Array<{ wch: number }>
    expect(cols[0].wch).toBe(22)
    expect(cols[16].wch).toBe(12)
  })
})
