import XLSX from 'xlsx-js-style'
import type { AttendanceRecord } from '@/types/attendance.type'
import type { OldGroup } from '@/types/oldGroups.type'
import type { Group } from '@/types/groups.type'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { YouthAttendance } from '@/types/youthAttendance.type'

export type MonthSpec = { months?: string[]; single?: string; range?: { from: number; to: number } }

const pad = (n: number) => n.toString().padStart(2, '0')

export const getReportFileName = (type: 'state' | 'region' | 'district' | 'group' | 'oldGroup' | 'youth' | 'stateNewComers' | 'stateTitheOffering') => {
  const d = new Date()
  const stamp = `${d.getFullYear()}_${pad(d.getMonth() + 1)}_${pad(d.getDate())}__${pad(d.getHours())}_${pad(d.getMinutes())}_${pad(d.getSeconds())}`
  if (type === 'state') return `State Report Sheet File_${stamp}.xlsx`
  if (type === 'region') return `Region Report Sheet File_${stamp}.xlsx`
  if (type === 'district') return `District Report Sheet File_${stamp}.xlsx`
  if (type === 'oldGroup') return `Old Group Report Sheet File_${stamp}.xlsx`
  if (type === 'youth') return `Youth Monthly Report_${stamp}.xlsx`
  if (type === 'stateNewComers') return `State New Comers Report_${stamp}.xlsx`
  if (type === 'stateTitheOffering') return `State Tithe & Offering Report_${stamp}.xlsx`
  return `Group Report Sheet File_${stamp}.xlsx`
}

type Align = { horizontal?: 'center' | 'left' | 'right'; vertical?: 'center' | 'top' | 'bottom'; wrapText?: boolean }
type Font = { sz?: number; bold?: boolean }
type Fill = { patternType?: 'solid'; fgColor?: { rgb?: string } }
type Style = { font?: Font; alignment?: Align; fill?: Fill }

const TITLE_STYLE: Style = { font: { sz: 28, bold: true }, alignment: { horizontal: 'center', vertical: 'center' } }
const HEADER_STYLE: Style = { font: { bold: true, sz: 14 }, alignment: { horizontal: 'center', vertical: 'center' } }
const SUBTOTAL_STYLE: Style = { font: { bold: true, sz: 14 }, alignment: { horizontal: 'center', vertical: 'center' }, fill: { patternType: 'solid', fgColor: { rgb: 'FFFF99' } } }
const SUBTOTAL_LABEL_STYLE: Style = { font: { bold: true, sz: 14 }, alignment: { horizontal: 'left', vertical: 'center' }, fill: { patternType: 'solid', fgColor: { rgb: 'FFFF99' } } }
const SUBTOTAL_NUM_STYLE: Style = { font: { bold: true, sz: 14 }, alignment: { horizontal: 'right', vertical: 'center' }, fill: { patternType: 'solid', fgColor: { rgb: 'FFFF99' } } }
const WEEK_STYLE: Style = { font: { bold: true, sz: 14 }, alignment: { horizontal: 'left', vertical: 'center' }}

const buildHeaderBlock = (title: string, subtitle: string, firstLabel: 'Regions' | 'Old Groups' | 'Groups' | 'Districts' | 'Period of report'): (string | number)[][] => {
  return [
    [title, '', '', '', '', '', '', '', '', '', '', '', ''],
    [subtitle, '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', 'Adults', '', '', 'Youths', '', '', 'Total', 'Children', '', '', 'Grand'],
    ['', '', '', '', '', '', '', '', 'Adults', '', '', '', 'Total'],
    [firstLabel, 'Month', '(i)', '(ii)', '(iii)', '(iv)', '(v)', '(vi)', '(vii)', '(viii)', '(ix)', '(x)', '(vii)&(x)'],
    ['', '', 'Men', 'Women', 'Total', 'Boys', 'Girls', 'Total', '(iii)&(vi)', 'Boys', 'Girls', 'Total', '']
  ]
}

const monthsToUse = (spec: MonthSpec) => {
  if (spec.single) return [spec.single]
  if (spec.range) {
    const { from, to } = spec.range
    const start = Math.max(1, Math.min(12, from))
    const end = Math.max(1, Math.min(12, to))
    const labels: string[] = []
    const a = start <= end ? { s: start, e: end } : { s: end, e: start }
    for (let i = a.s; i <= a.e; i++) labels.push(MONTH_ORDER[i - 1])
    return labels
  }
  return spec.months && spec.months.length ? spec.months : []
}

const buildSubtitle = (spec: MonthSpec, year: number) => {
  if (spec.single) return `${spec.single} ${year}`
  if (spec.range) {
    const fromLabel = MONTH_ORDER[Math.max(1, Math.min(12, spec.range.from)) - 1]
    const toLabel = MONTH_ORDER[Math.max(1, Math.min(12, spec.range.to)) - 1]
    return `${fromLabel} - ${toLabel} ${year}`
  }
  const months = monthsToUse(spec)
  if (months.length === 12) return `January - December ${year}`
  if (months.length === 1) return `${months[0]} ${year}`
  return `Selected Months ${year}`
}

const sumFor = (items: AttendanceRecord[]) => {
  const men = items.reduce((a, b) => a + (b.men || 0), 0)
  const women = items.reduce((a, b) => a + (b.women || 0), 0)
  const yb = items.reduce((a, b) => a + (b.youth_boys || 0), 0)
  const yg = items.reduce((a, b) => a + (b.youth_girls || 0), 0)
  const cb = items.reduce((a, b) => a + (b.children_boys || 0), 0)
  const cg = items.reduce((a, b) => a + (b.children_girls || 0), 0)
  const adultsTotal = men + women
  const youthsTotal = yb + yg
  const totalAdults = adultsTotal + youthsTotal
  const childrenTotal = cb + cg
  const grandTotal = totalAdults + childrenTotal
  return { men, women, adultsTotal, yb, yg, youthsTotal, totalAdults, cb, cg, childrenTotal, grandTotal }
}

const MONTH_ORDER = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const sortMonths = (arr: string[]) => {
  return [...new Set(arr)].sort((a, b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b))
}

export const buildStateReportSheet = (
  data: AttendanceRecord[],
  regions: { id: number; name: string }[],
  stateName: string,
  year: number,
  spec: MonthSpec
) => {
  const baseMonths = monthsToUse(spec)
  const title = `Deeper Life Bible Church, ${stateName} (State)`
  const subtitle = buildSubtitle(spec, year)
  const header = buildHeaderBlock(title, subtitle, 'Regions')
  const rows: (string | number)[][] = [...header]
  const months = baseMonths.length ? sortMonths(baseMonths) : sortMonths(data.filter(d => d.year === year).map(d => d.month))

  for (const m of months) {
    for (const r of regions) {
      const items = data.filter(x => x.region_id === r.id && x.year === year && x.month === m)
      const s = sumFor(items)
      rows.push([
        r.name,
        m,
        s.men,
        s.women,
        s.adultsTotal,
        s.yb,
        s.yg,
        s.youthsTotal,
        s.totalAdults,
        s.cb,
        s.cg,
        s.childrenTotal,
        s.grandTotal
      ])
    }
    const monthSubtotal = sumFor(data.filter(x => x.year === year && x.month === m))
    rows.push([
      'SubTotal',
      '',
      monthSubtotal.men,
      monthSubtotal.women,
      monthSubtotal.adultsTotal,
      monthSubtotal.yb,
      monthSubtotal.yg,
      monthSubtotal.youthsTotal,
      monthSubtotal.totalAdults,
      monthSubtotal.cb,
      monthSubtotal.cg,
      monthSubtotal.childrenTotal,
      monthSubtotal.grandTotal
    ])
    rows.push(new Array(13).fill(''))
  }

  const ws = XLSX.utils.aoa_to_sheet(rows)

  // Column widths
  ws['!cols'] = [
    { wch: 25 }, { wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }
  ]

  // Merges like template
  if (!ws['!merges']) ws['!merges'] = []
  ws['!merges'].push(
    { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } },
    { s: { r: 3, c: 2 }, e: { r: 3, c: 4 } },
    { s: { r: 3, c: 5 }, e: { r: 3, c: 7 } },
    { s: { r: 3, c: 8 }, e: { r: 3, c: 8 } },
    { s: { r: 3, c: 9 }, e: { r: 3, c: 11 } },
    { s: { r: 3, c: 12 }, e: { r: 3, c: 12 } },
    { s: { r: 4, c: 8 }, e: { r: 4, c: 8 } },
    { s: { r: 4, c: 12 }, e: { r: 4, c: 12 } }
  )

  // Styles
  const setCellStyle = (row: number, col: number, style: Style) => {
    const addr = XLSX.utils.encode_cell({ r: row, c: col })
    const cell = ws[addr] as unknown as { s?: Style }
    if (cell) cell.s = style
  }
  const totalColumns = 13
  for (let c = 0; c < totalColumns; c++) {
    setCellStyle(0, c, TITLE_STYLE)
    setCellStyle(1, c, TITLE_STYLE)
  }
  const headerRowsIdx = [3, 4, 5, 6]
  headerRowsIdx.forEach(r => {
    for (let c = 0; c < totalColumns; c++) setCellStyle(r, c, HEADER_STYLE)
  })
  for (let i = 0; i < rows.length; i++) {
    if (rows[i] && rows[i][0] === 'SubTotal') {
      setCellStyle(i, 0, SUBTOTAL_LABEL_STYLE)
      setCellStyle(i, 1, SUBTOTAL_STYLE)
      for (let c = 2; c < totalColumns; c++) setCellStyle(i, c, SUBTOTAL_NUM_STYLE)
    }
  }

  return ws
}

const formatNaira = (amount: number) => {
  const val = Number(amount || 0)
  return `₦${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const buildStateNewComersReportSheet = (
  data: AttendanceRecord[],
  regions: { id: number; name: string }[],
  stateName: string,
  year: number,
  spec: MonthSpec
) => {
  const baseMonths = monthsToUse(spec)
  const title = `Deeper Life Bible Church, ${stateName} (State)`
  const subtitle = buildSubtitle(spec, year)
  const rows: (string | number)[][] = [
    [title, '', ''],
    [subtitle, '', ''],
    ['', '', ''],
    ['Regions', 'Month', 'New Comers'],
  ]
  const months = baseMonths.length ? sortMonths(baseMonths) : sortMonths(data.filter(d => d.year === year).map(d => d.month))

  for (const m of months) {
    for (const r of regions) {
      const items = data.filter(x => x.region_id === r.id && x.year === year && x.month === m)
      const newcomers = items.reduce((sum, it) => sum + (it.new_comers || 0), 0)
      rows.push([r.name, m, newcomers])
    }
    const monthSubtotal = data.filter(x => x.year === year && x.month === m).reduce((sum, it) => sum + (it.new_comers || 0), 0)
    rows.push(['SubTotal', '', monthSubtotal])
    rows.push(['', '', ''])
  }

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 18 }]
  if (!ws['!merges']) ws['!merges'] = []
  ws['!merges'].push(
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } }
  )
  const setCellStyle = (row: number, col: number, style: Style) => {
    const addr = XLSX.utils.encode_cell({ r: row, c: col })
    const cell = ws[addr] as unknown as { s?: Style }
    if (cell) cell.s = style
  }
  for (let c = 0; c <= 2; c++) { setCellStyle(0, c, TITLE_STYLE); setCellStyle(1, c, TITLE_STYLE) }
  for (let c = 0; c <= 2; c++) { setCellStyle(3, c, HEADER_STYLE) }
  for (let i = 0; i < rows.length; i++) {
    if (rows[i] && rows[i][0] === 'SubTotal') {
      setCellStyle(i, 0, SUBTOTAL_LABEL_STYLE)
      setCellStyle(i, 1, SUBTOTAL_STYLE)
      setCellStyle(i, 2, SUBTOTAL_NUM_STYLE)
    }
  }
  return ws
}

export const buildStateTitheOfferingReportSheet = (
  data: AttendanceRecord[],
  regions: { id: number; name: string }[],
  stateName: string,
  year: number,
  spec: MonthSpec
) => {
  const baseMonths = monthsToUse(spec)
  const title = `Deeper Life Bible Church, ${stateName} (State)`
  const subtitle = buildSubtitle(spec, year)
  const rows: (string | number)[][] = [
    [title, '', ''],
    [subtitle, '', ''],
    ['', '', ''],
    ['Regions', 'Month', 'Tithe & Offering'],
  ]
  const months = baseMonths.length ? sortMonths(baseMonths) : sortMonths(data.filter(d => d.year === year).map(d => d.month))

  for (const m of months) {
    for (const r of regions) {
      const items = data.filter(x => x.region_id === r.id && x.year === year && x.month === m)
      const amount = items.reduce((sum, it) => sum + (it.tithe_offering || 0), 0)
      rows.push([r.name, m, formatNaira(amount)])
    }
    const subtotalAmt = data.filter(x => x.year === year && x.month === m).reduce((sum, it) => sum + (it.tithe_offering || 0), 0)
    rows.push(['SubTotal', '', formatNaira(subtotalAmt)])
    rows.push(['', '', ''])
  }

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 22 }]
  if (!ws['!merges']) ws['!merges'] = []
  ws['!merges'].push(
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } }
  )
  const setCellStyle = (row: number, col: number, style: Style) => {
    const addr = XLSX.utils.encode_cell({ r: row, c: col })
    const cell = ws[addr] as unknown as { s?: Style }
    if (cell) cell.s = style
  }
  for (let c = 0; c <= 2; c++) { setCellStyle(0, c, TITLE_STYLE); setCellStyle(1, c, TITLE_STYLE) }
  for (let c = 0; c <= 2; c++) { setCellStyle(3, c, HEADER_STYLE) }
  for (let i = 0; i < rows.length; i++) {
    if (rows[i] && rows[i][0] === 'SubTotal') {
      setCellStyle(i, 0, SUBTOTAL_LABEL_STYLE)
      setCellStyle(i, 1, SUBTOTAL_STYLE)
      setCellStyle(i, 2, SUBTOTAL_NUM_STYLE)
    }
  }
  return ws
}

export const buildRegionReportSheet = (
  data: AttendanceRecord[],
  oldGroups: OldGroup[],
  regionName: string,
  year: number,
  spec: MonthSpec,
  regionId: number
) => {
  const baseMonths = monthsToUse(spec)
  const title = `Deeper Life Bible Church, ${regionName} (Region)`
  const subtitle = buildSubtitle(spec, year)
  const header = buildHeaderBlock(title, subtitle, 'Old Groups')
  const rows: (string | number)[][] = [...header]
  const months = baseMonths.length ? sortMonths(baseMonths) : sortMonths(data.filter(d => d.year === year && d.region_id === regionId).map(d => d.month))
  const ogs = oldGroups.filter(g => g.region === regionName)
  //   const ogs = oldGroups.filter(g => Number(g.region_id) === Number(regionId))

  for (const m of months) {
    for (const og of ogs) {
      const items = data.filter(x => x.region_id === regionId && x.old_group_id === og.id && x.year === year && x.month === m)
      const s = sumFor(items)
      rows.push([
        og.name,
        m,
        s.men,
        s.women,
        s.adultsTotal,
        s.yb,
        s.yg,
        s.youthsTotal,
        s.totalAdults,
        s.cb,
        s.cg,
        s.childrenTotal,
        s.grandTotal
      ])
    }
    const monthSubtotal = sumFor(data.filter(x => x.region_id === regionId && x.year === year && x.month === m))
    rows.push([
      'SubTotal',
      '',
      monthSubtotal.men,
      monthSubtotal.women,
      monthSubtotal.adultsTotal,
      monthSubtotal.yb,
      monthSubtotal.yg,
      monthSubtotal.youthsTotal,
      monthSubtotal.totalAdults,
      monthSubtotal.cb,
      monthSubtotal.cg,
      monthSubtotal.childrenTotal,
      monthSubtotal.grandTotal
    ])
    rows.push(new Array(13).fill(''))
  }

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [
    { wch: 25 }, { wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }
  ]
  if (!ws['!merges']) ws['!merges'] = []
  ws['!merges'].push(
    { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } },
    { s: { r: 3, c: 2 }, e: { r: 3, c: 4 } },
    { s: { r: 3, c: 5 }, e: { r: 3, c: 7 } },
    { s: { r: 3, c: 8 }, e: { r: 3, c: 8 } },
    { s: { r: 3, c: 9 }, e: { r: 3, c: 11 } },
    { s: { r: 3, c: 12 }, e: { r: 3, c: 12 } },
    { s: { r: 4, c: 8 }, e: { r: 4, c: 8 } },
    { s: { r: 4, c: 12 }, e: { r: 4, c: 12 } }
  )
  const setCellStyle = (row: number, col: number, style: Style) => {
    const addr = XLSX.utils.encode_cell({ r: row, c: col })
    const cell = ws[addr] as unknown as { s?: Style }
    if (cell) cell.s = style
  }
  const totalColumns = 13
  for (let c = 0; c < totalColumns; c++) {
    setCellStyle(0, c, TITLE_STYLE)
    setCellStyle(1, c, TITLE_STYLE)
  }
  const headerRowsIdx = [3, 4, 5, 6]
  headerRowsIdx.forEach(r => {
    for (let c = 0; c < totalColumns; c++) setCellStyle(r, c, HEADER_STYLE)
  })
  for (let i = 0; i < rows.length; i++) {
    if (rows[i] && rows[i][0] === 'SubTotal') {
      setCellStyle(i, 0, SUBTOTAL_LABEL_STYLE)
      setCellStyle(i, 1, SUBTOTAL_STYLE)
      for (let c = 2; c < totalColumns; c++) setCellStyle(i, c, SUBTOTAL_NUM_STYLE)
    }
  }

  return ws
}

export const buildOldGroupReportSheet = (
  data: AttendanceRecord[],
  groups: Group[],
  oldGroupName: string,
  year: number,
  spec: MonthSpec,
  oldGroupId: number
) => {
  const baseMonths = monthsToUse(spec)
  const title = `Deeper Life Bible Church, ${oldGroupName} (Old Group)`
  const subtitle = buildSubtitle(spec, year)
  const header = buildHeaderBlock(title, subtitle, 'Groups')
  const rows: (string | number)[][] = [...header]

  const months = baseMonths.length ? sortMonths(baseMonths) : sortMonths(data.filter(d => d.year === year && d.old_group_id === oldGroupId).map(d => d.month))
  const gs = groups.filter(g => Number(g.old_group_id) === Number(oldGroupId))

  for (const m of months) {
    for (const g of gs) {
      const items = data.filter(x => x.old_group_id === oldGroupId && x.group_id === g.id && x.year === year && x.month === m)
      const s = sumFor(items)
      rows.push([
        g.name,
        m,
        s.men,
        s.women,
        s.adultsTotal,
        s.yb,
        s.yg,
        s.youthsTotal,
        s.totalAdults,
        s.cb,
        s.cg,
        s.childrenTotal,
        s.grandTotal
      ])
    }
    const monthSubtotal = sumFor(data.filter(x => x.old_group_id === oldGroupId && x.year === year && x.month === m))
    rows.push(['SubTotal', '', monthSubtotal.men, monthSubtotal.women, monthSubtotal.adultsTotal, monthSubtotal.yb, monthSubtotal.yg, monthSubtotal.youthsTotal, monthSubtotal.totalAdults, monthSubtotal.cb, monthSubtotal.cg, monthSubtotal.childrenTotal, monthSubtotal.grandTotal])
    rows.push(new Array(13).fill(''))
  }

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [
    { wch: 25 }, { wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }
  ]
  if (!ws['!merges']) ws['!merges'] = []
  ws['!merges'].push(
    { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } },
    { s: { r: 3, c: 2 }, e: { r: 3, c: 4 } },
    { s: { r: 3, c: 5 }, e: { r: 3, c: 7 } },
    { s: { r: 3, c: 9 }, e: { r: 3, c: 11 } }
  )
  const setCellStyle = (row: number, col: number, style: Style) => {
    const addr = XLSX.utils.encode_cell({ r: row, c: col })
    const cell = ws[addr] as unknown as { s?: Style }
    if (cell) cell.s = style
  }
  const totalColumns = 13
  for (let c = 0; c < totalColumns; c++) { setCellStyle(0, c, TITLE_STYLE); setCellStyle(1, c, TITLE_STYLE) }
  ;[3, 4, 5, 6].forEach(r => { for (let c = 0; c < totalColumns; c++) setCellStyle(r, c, HEADER_STYLE) })
  for (let i = 0; i < rows.length; i++) if (rows[i] && rows[i][0] === 'SubTotal') { setCellStyle(i, 0, SUBTOTAL_LABEL_STYLE); setCellStyle(i, 1, SUBTOTAL_STYLE); for (let c = 2; c < totalColumns; c++) setCellStyle(i, c, SUBTOTAL_NUM_STYLE) }
  return ws
}

export const buildDistrictReportSheet = (
  data: AttendanceRecord[],
  districts: Array<{ id: number; name: string; group_id?: number }>,
  contextName: string,
  year: number,
  spec: MonthSpec,
  groupId: number
) => {
  const baseMonths = monthsToUse(spec)
  const title = `Deeper Life Bible Church, ${contextName} (District)`
  const subtitle = buildSubtitle(spec, year)
  const header = buildHeaderBlock(title, subtitle, 'Period of report')
  const rows: (string | number)[][] = [...header]

  const months = baseMonths.length ? sortMonths(baseMonths) : sortMonths(data.filter(d => d.year === year && d.group_id === groupId).map(d => d.month))
  const ds = districts.filter(d => Number(d.group_id) === Number(groupId))

  for (const m of months) {
    for (const d of ds) {
      for (let wk = 1; wk <= 5; wk++) {
        const items = data.filter(x => x.group_id === groupId && x.district_id === d.id && x.year === year && x.month === m && x.week === wk)
        const s = sumFor(items)
        rows.push([
          `Week ${wk}`,
          m,
          s.men,
          s.women,
          s.adultsTotal,
          s.yb,
          s.yg,
          s.youthsTotal,
          s.totalAdults,
          s.cb,
          s.cg,
          s.childrenTotal,
          s.grandTotal
        ])
      }
    }
    const monthSubtotal = sumFor(data.filter(x => x.group_id === groupId && x.year === year && x.month === m))
    rows.push(['SubTotal', '', monthSubtotal.men, monthSubtotal.women, monthSubtotal.adultsTotal, monthSubtotal.yb, monthSubtotal.yg, monthSubtotal.youthsTotal, monthSubtotal.totalAdults, monthSubtotal.cb, monthSubtotal.cg, monthSubtotal.childrenTotal, monthSubtotal.grandTotal])
    rows.push(new Array(13).fill(''))
  }

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [
    { wch: 30 }, { wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }
  ]
  if (!ws['!merges']) ws['!merges'] = []
  ws['!merges'].push(
    { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } },
    { s: { r: 3, c: 2 }, e: { r: 3, c: 4 } },
    { s: { r: 3, c: 5 }, e: { r: 3, c: 7 } },
    { s: { r: 3, c: 9 }, e: { r: 3, c: 11 } }
  )
  const setCellStyle = (row: number, col: number, style: Style) => {
    const addr = XLSX.utils.encode_cell({ r: row, c: col })
    const cell = ws[addr] as unknown as { s?: Style }
    if (cell) cell.s = style
  }
  const totalColumns = 13
  for (let c = 0; c < totalColumns; c++) { setCellStyle(0, c, TITLE_STYLE); setCellStyle(1, c, TITLE_STYLE) }
  ;[3, 4, 5, 6].forEach(r => { for (let c = 0; c < totalColumns; c++) setCellStyle(r, c, HEADER_STYLE) })
  for (let i = 0; i < rows.length; i++) if (rows[i] && rows[i][0] === 'SubTotal') { setCellStyle(i, 0, SUBTOTAL_LABEL_STYLE); setCellStyle(i, 1, SUBTOTAL_STYLE); for (let c = 2; c < totalColumns; c++) setCellStyle(i, c, SUBTOTAL_NUM_STYLE) }
  for (let i = 0; i < rows.length; i++) if (rows[i] && rows[i][0].toString().includes("Week")) { setCellStyle(i, 0, WEEK_STYLE); }
  return ws
}

export const buildGroupReportSheet = (
  data: AttendanceRecord[],
  districts: Array<{ id: number; name: string; group_id?: number }>,
  groupName: string,
  year: number,
  spec: MonthSpec,
  groupId: number
) => {
  const baseMonths = monthsToUse(spec)
  const title = `Deeper Life Bible Church, ${groupName} (Group)`
  const subtitle = buildSubtitle(spec, year)
  const header = buildHeaderBlock(title, subtitle, 'Districts')
  const rows: (string | number)[][] = [...header]

  const months = baseMonths.length ? sortMonths(baseMonths) : sortMonths(data.filter(d => d.year === year && d.group_id === groupId).map(d => d.month))
  const ds = districts.filter(d => Number(d.group_id) === Number(groupId))

  for (const m of months) {
    for (const d of ds) {
      const items = data.filter(x => x.group_id === groupId && x.district_id === d.id && x.year === year && x.month === m)
      const s = sumFor(items)
      rows.push([
        d.name,
        m,
        s.men,
        s.women,
        s.adultsTotal,
        s.yb,
        s.yg,
        s.youthsTotal,
        s.totalAdults,
        s.cb,
        s.cg,
        s.childrenTotal,
        s.grandTotal
      ])
    }
    const monthSubtotal = sumFor(data.filter(x => x.group_id === groupId && x.year === year && x.month === m))
    rows.push(['SubTotal', '', monthSubtotal.men, monthSubtotal.women, monthSubtotal.adultsTotal, monthSubtotal.yb, monthSubtotal.yg, monthSubtotal.youthsTotal, monthSubtotal.totalAdults, monthSubtotal.cb, monthSubtotal.cg, monthSubtotal.childrenTotal, monthSubtotal.grandTotal])
    rows.push(new Array(13).fill(''))
  }

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [
    { wch: 25 }, { wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }
  ]
  if (!ws['!merges']) ws['!merges'] = []
  ws['!merges'].push(
    { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } },
    { s: { r: 3, c: 2 }, e: { r: 3, c: 4 } },
    { s: { r: 3, c: 5 }, e: { r: 3, c: 7 } },
    { s: { r: 3, c: 9 }, e: { r: 3, c: 11 } }
  )
  const setCellStyle = (row: number, col: number, style: Style) => {
    const addr = XLSX.utils.encode_cell({ r: row, c: col })
    const cell = ws[addr] as unknown as { s?: Style }
    if (cell) cell.s = style
  }
  const totalColumns = 13
  for (let c = 0; c < totalColumns; c++) { setCellStyle(0, c, TITLE_STYLE); setCellStyle(1, c, TITLE_STYLE) }
  ;[3, 4, 5, 6].forEach(r => { for (let c = 0; c < totalColumns; c++) setCellStyle(r, c, HEADER_STYLE) })
  for (let i = 0; i < rows.length; i++) if (rows[i] && rows[i][0] === 'SubTotal') { setCellStyle(i, 0, SUBTOTAL_LABEL_STYLE); setCellStyle(i, 1, SUBTOTAL_STYLE); for (let c = 2; c < totalColumns; c++) setCellStyle(i, c, SUBTOTAL_NUM_STYLE) }
  return ws
}

export const buildYouthMonthlyReportPdf = (
  weekly: YouthAttendance[],
  regionName: string,
  monthLabel: string,
  year: number,
  groups: Array<{ id: number; name: string }>,
  coordinator?: string,
  code?: string
) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('DEEPER LIFE STUDENTS OUTREACH (DLSO) MONTHLY REPORT', 40, 40)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  const headerLeft = `REGION: ${regionName}`
  const headerMid = `CODE: ${code ?? ''}`
  const headerMonth = `MONTH: ${monthLabel}`
  const headerYear = `YEAR: ${year}`
  const headerCoord = `REGION COORDINATOR: ${coordinator ?? ''}`
  doc.text(headerLeft, 40, 60)
  doc.text(headerMid, 220, 60)
  doc.text(headerMonth, 360, 60)
  doc.text(headerYear, 500, 60)
  doc.text(headerCoord, 40, 80)

  const groupName = (id: number) => groups.find(g => g.id === id)?.name || `Group ${id}`
  const weeks = [1, 2, 3, 4, 5]

  const byGroup = new Map<number, YouthAttendance[]>()
  for (const rec of weekly) {
    if (!byGroup.has(rec.group_id)) byGroup.set(rec.group_id, [])
    byGroup.get(rec.group_id)!.push(rec)
  }

  const head = [
    { title: 'GROUP', dataKey: 'group' },
    { title: 'NO OF YHSF M', dataKey: 'yhsf_m' },
    { title: 'NO OF YHSF F', dataKey: 'yhsf_f' },
    { title: 'STRENGTH LAST M M', dataKey: 'last_m' },
    { title: 'STRENGTH LAST M F', dataKey: 'last_f' },
    { title: 'WEEK1 M', dataKey: 'w1m' },
    { title: 'WEEK1 F', dataKey: 'w1f' },
    { title: 'WEEK2 M', dataKey: 'w2m' },
    { title: 'WEEK2 F', dataKey: 'w2f' },
    { title: 'WEEK3 M', dataKey: 'w3m' },
    { title: 'WEEK3 F', dataKey: 'w3f' },
    { title: 'WEEK4 M', dataKey: 'w4m' },
    { title: 'WEEK4 F', dataKey: 'w4f' },
    { title: 'WEEK5 M', dataKey: 'w5m' },
    { title: 'WEEK5 F', dataKey: 'w5f' },
    { title: 'AVERAGE M', dataKey: 'avgm' },
    { title: 'AVERAGE F', dataKey: 'avgf' }
  ]

  const rows = [] as Array<Record<string, string | number>>
  for (const [gid, recs] of byGroup) {
    const getWeek = (w: number) => recs.find(r => r.week === w)
    const yhsf_m = (recs.reduce((acc, r) => acc + (r.member_boys || 0), 0))
    const yhsf_f = (recs.reduce((acc, r) => acc + (r.member_girls || 0), 0))
    const lastMonthLabel = monthLabel === 'January' ? 'December' : monthLabel
    const last_m = 0
    const last_f = 0
    const wVals = weeks.map(w => getWeek(w))
    const wM = wVals.map(r => r ? ((r.member_boys || 0) + (r.visitor_boys || 0)) : 0)
    const wF = wVals.map(r => r ? ((r.member_girls || 0) + (r.visitor_girls || 0)) : 0)
    const avgm = Math.round(wM.reduce((a, b) => a + b, 0) / weeks.length)
    const avgf = Math.round(wF.reduce((a, b) => a + b, 0) / weeks.length)
    rows.push({
      group: groupName(gid),
      yhsf_m,
      yhsf_f,
      last_m,
      last_f,
      w1m: wM[0], w1f: wF[0], w2m: wM[1], w2f: wF[1], w3m: wM[2], w3f: wF[2], w4m: wM[3], w4f: wF[3], w5m: wM[4], w5f: wF[4],
      avgm,
      avgf
    })
  }

  autoTable(doc, {
    startY: 100,
    head: [head.map(h => h.title)],
    body: rows.map(r => head.map(h => r[h.dataKey] ?? '')),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [240, 240, 240], textColor: 20 },
    alternateRowStyles: { fillColor: [248, 248, 248] }
  })

  return doc
}

export const exportYouthPdf = (doc: jsPDF, fileName: string) => {
  doc.save(fileName)
}

export const buildYouthMonthlyReportSheet = (
  weekly: YouthAttendance[],
  regionName: string,
  monthLabel: string,
  year: number,
  groups: Array<{ id: number; name: string }>,
  coordinator?: string,
  code?: string
) => {
  const head1 = [`DEEPER LIFE STUDENTS OUTREACH (DLSO) MONTHLY REPORT`, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
  const head2 = [`REGION: ${regionName}`, `CODE: ${code ?? ''}`, `MONTH: ${monthLabel}`, `YEAR: ${year}`, `REGION COORDINATOR: ${coordinator ?? ''}`, '', '', '', '', '', '', '', '', '', '', '', '']
  const head3 = ['GROUP', 'NO OF YHSF', '', 'STRENGTH OF LAST MONTH', '', 'WEEK 1', '', 'WEEK 2', '', 'WEEK 3', '', 'WEEK 4', '', 'WEEK 5', '', 'AVERAGE', '']
  const head4 = ['', 'M', 'F', 'M', 'F', 'M', 'F', 'M', 'F', 'M', 'F', 'M', 'F', 'M', 'F', 'M', 'F']

  const byGroup = new Map<number, YouthAttendance[]>()
  for (const rec of weekly) {
    if (!byGroup.has(rec.group_id)) byGroup.set(rec.group_id, [])
    byGroup.get(rec.group_id)!.push(rec)
  }
  const groupName = (id: number) => groups.find(g => g.id === id)?.name || `Group ${id}`
  const prevMonth = (() => {
    const order = ['January','February','March','April','May','June','July','August','September','October','November','December']
    const idx = order.indexOf(monthLabel)
    return idx <= 0 ? 'December' : order[idx - 1]
  })()

  const rows: (string | number)[][] = [head1, head2, head3, head4]
  for (const [gid, recs] of byGroup) {
    const week = (w: number) => recs.find(r => r.week === w)
    const wM = [1,2,3,4,5].map(w => {
      const r = week(w); return r ? ((r.member_boys || 0) + (r.visitor_boys || 0)) : 0
    })
    const wF = [1,2,3,4,5].map(w => {
      const r = week(w); return r ? ((r.member_girls || 0) + (r.visitor_girls || 0)) : 0
    })
    const yhsf_m = recs.reduce((acc, r) => acc + (r.member_boys || 0), 0)
    const yhsf_f = recs.reduce((acc, r) => acc + (r.member_girls || 0), 0)
    const prev = recs.filter(r => r.month === prevMonth)
    const last_m = prev.reduce((acc, r) => acc + (r.member_boys || 0), 0)
    const last_f = prev.reduce((acc, r) => acc + (r.member_girls || 0), 0)
    const avgm = Math.round(wM.reduce((a,b)=>a+b,0)/5)
    const avgf = Math.round(wF.reduce((a,b)=>a+b,0)/5)
    rows.push([
      groupName(gid),
      yhsf_m, yhsf_f,
      last_m, last_f,
      wM[0], wF[0], wM[1], wF[1], wM[2], wF[2], wM[3], wF[3], wM[4], wF[4],
      avgm, avgf
    ])
  }

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [
    { wch: 22 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }
  ]
  if (!ws['!merges']) ws['!merges'] = []
  ws['!merges'].push(
    { s: { r: 0, c: 0 }, e: { r: 0, c: 16 } },
    { s: { r: 2, c: 1 }, e: { r: 2, c: 2 } },
    { s: { r: 2, c: 3 }, e: { r: 2, c: 4 } },
    { s: { r: 2, c: 5 }, e: { r: 2, c: 6 } },
    { s: { r: 2, c: 7 }, e: { r: 2, c: 8 } },
    { s: { r: 2, c: 9 }, e: { r: 2, c: 10 } },
    { s: { r: 2, c: 11 }, e: { r: 2, c: 12 } },
    { s: { r: 2, c: 13 }, e: { r: 2, c: 14 } },
    { s: { r: 2, c: 15 }, e: { r: 2, c: 16 } }
  )
  const setCellStyle = (row: number, col: number, style: Style) => {
    const addr = XLSX.utils.encode_cell({ r: row, c: col })
    const cell = ws[addr] as unknown as { s?: Style }
    if (cell) cell.s = style
  }
  for (let c = 0; c <= 16; c++) setCellStyle(0, c, TITLE_STYLE)
  for (let c = 0; c <= 16; c++) setCellStyle(2, c, HEADER_STYLE)
  for (let c = 0; c <= 16; c++) setCellStyle(3, c, HEADER_STYLE)
  return ws
}

export const exportSheet = (sheet: XLSX.WorkSheet, fileName: string, sheetName: string) => {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, sheet, sheetName)
  XLSX.writeFile(wb, fileName)
}

