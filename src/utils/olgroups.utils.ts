// utils/oldgroups.utils.ts
import { utils, writeFile } from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { OldGroup } from '@/types/oldGroups.type'

export const exportToExcel = (data: OldGroup[], filename: string = 'oldgroups') => {
    const worksheet = utils.json_to_sheet(data.map(item => ({
        'Group Name': item.name,
        'Group Code': item.code,
        'Group Leader': item.leader,
        'State ID': item.state_id,
        'Region ID': item.region_id,
        'District ID': item.district_id,
        'Group ID': item.group_id
    })))
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, 'OldGroups')
    writeFile(workbook, `${filename}_${new Date().toISOString().replaceAll("/", "_")}.xlsx`)
}

export const exportToCSV = (data: OldGroup[], filename: string = 'oldgroups') => {
    const worksheet = utils.json_to_sheet(data.map(item => ({
        'Group Name': item.name,
        'Group Code': item.code,
        'Group Leader': item.leader,
        'State ID': item.state_id,
        'Region ID': item.region_id,
        'District ID': item.district_id,
        'Group ID': item.group_id
    })))
    const csv = utils.sheet_to_csv(worksheet)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}_${new Date().toISOString().replaceAll("/", "_")}.csv`
    link.click()
    URL.revokeObjectURL(url)
}

export const exportToPDF = (data: OldGroup[], filename: string = 'oldgroups') => {
    const doc = new jsPDF()

    doc.text('Old Groups Data', 14, 15)

    autoTable(doc, {
        head: [['S/N', 'Group Name', 'Group Code', 'Group Leader', 'State ID', 'Region ID', 'District ID', 'Group ID']],
        body: data.map((item, i) => [i, item.name, item.code, item.leader, item.state_id, item.region_id, item.district_id, item.group_id]),
        startY: 20,
    })

    doc.save(`${filename}_${new Date().toISOString().replaceAll("/", "_")}.pdf`)
}

export const copyToClipboard = async (data: OldGroup[]) => {
    const text = data.map((item, i) =>
        `${i}\t${item.name}\t${item.code}\t${item.leader}\t${item.state_id}\t${item.region_id}\t${item.district_id}\t${item.group_id}`
    ).join('\n')

    const header = 'S/N\tGroup Name\tGroup Code\tGroup Leader\tState ID\tRegion ID\tDistrict ID\tGroup ID\n'
    await navigator.clipboard.writeText(header + text)
}