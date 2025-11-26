import XLSX from 'xlsx-js-style'
import type { AttendanceRecord } from '@/types/attendance.type'
import type { OldGroup } from '@/types/oldGroups.type'
import type { Group } from '@/types/groups.type'

export type MonthSpec = { months?: string[]; single?: string; range?: { from: number; to: number } }

const pad = (n: number) => n.toString().padStart(2, '0')

export const getReportFileName = (type: 'state' | 'region') => {
  const d = new Date()
  const stamp = `${d.getFullYear()}_${pad(d.getMonth() + 1)}_${pad(d.getDate())}__${pad(d.getHours())}_${pad(d.getMinutes())}_${pad(d.getSeconds())}`
  return type === 'state' ? `State Report Sheet File_${stamp}.xlsx` : `Region Report Sheet File_${stamp}.xlsx`
}

type Align = { horizontal?: 'center' | 'left' | 'right'; vertical?: 'center' | 'top' | 'bottom'; wrapText?: boolean }
type Font = { sz?: number; bold?: boolean }
type Fill = { patternType?: 'solid'; fgColor?: { rgb?: string } }
type Style = { font?: Font; alignment?: Align; fill?: Fill }

const TITLE_STYLE: Style = { font: { sz: 28, bold: true }, alignment: { horizontal: 'center', vertical: 'center' } }
const HEADER_STYLE: Style = { font: { bold: true }, alignment: { horizontal: 'center', vertical: 'center' } }
const SUBTOTAL_STYLE: Style = { font: { bold: true }, alignment: { horizontal: 'center', vertical: 'center' }, fill: { patternType: 'solid', fgColor: { rgb: 'FFFF99' } } }
const SUBTOTAL_LABEL_STYLE: Style = { font: { bold: true, sz: 12 }, alignment: { horizontal: 'left', vertical: 'center' }, fill: { patternType: 'solid', fgColor: { rgb: 'FFFF99' } } }
const SUBTOTAL_NUM_STYLE: Style = { font: { bold: true, sz: 12 }, alignment: { horizontal: 'right', vertical: 'center' }, fill: { patternType: 'solid', fgColor: { rgb: 'FFFF99' } } }

const buildHeaderBlock = (title: string, subtitle: string, firstLabel: 'Regions' | 'Old Groups'): (string | number)[][] => {
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
    rows.push(['SubTotal','',monthSubtotal.men,monthSubtotal.women,monthSubtotal.adultsTotal,monthSubtotal.yb,monthSubtotal.yg,monthSubtotal.youthsTotal,monthSubtotal.totalAdults,monthSubtotal.cb,monthSubtotal.cg,monthSubtotal.childrenTotal,monthSubtotal.grandTotal])
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
  ;[3,4,5,6].forEach(r => { for (let c = 0; c < totalColumns; c++) setCellStyle(r, c, HEADER_STYLE) })
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
  const header = buildHeaderBlock(title, subtitle, 'Districts')
  const rows: (string | number)[][] = [...header]

  const months = baseMonths.length ? sortMonths(baseMonths) : sortMonths(data.filter(d => d.year === year && d.group_id === groupId).map(d => d.month))
  const ds = districts.filter(d => Number(d.group_id) === Number(groupId))

  for (const m of months) {
    for (const d of ds) {
      for (let wk = 1; wk <= 5; wk++) {
        const items = data.filter(x => x.group_id === groupId && x.district_id === d.id && x.year === year && x.month === m && x.week === wk)
        const s = sumFor(items)
        rows.push([
          `${d.name} (Week ${wk})`,
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
    rows.push(['SubTotal','',monthSubtotal.men,monthSubtotal.women,monthSubtotal.adultsTotal,monthSubtotal.yb,monthSubtotal.yg,monthSubtotal.youthsTotal,monthSubtotal.totalAdults,monthSubtotal.cb,monthSubtotal.cg,monthSubtotal.childrenTotal,monthSubtotal.grandTotal])
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
  ;[3,4,5,6].forEach(r => { for (let c = 0; c < totalColumns; c++) setCellStyle(r, c, HEADER_STYLE) })
  for (let i = 0; i < rows.length; i++) if (rows[i] && rows[i][0] === 'SubTotal') { setCellStyle(i, 0, SUBTOTAL_LABEL_STYLE); setCellStyle(i, 1, SUBTOTAL_STYLE); for (let c = 2; c < totalColumns; c++) setCellStyle(i, c, SUBTOTAL_NUM_STYLE) }
  return ws
}

export const exportSheet = (sheet: XLSX.WorkSheet, fileName: string, sheetName: string) => {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, sheet, sheetName)
  XLSX.writeFile(wb, fileName)
}

