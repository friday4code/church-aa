// utils/oldgroups.utils.ts
import { utils, writeFile } from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { OldGroup } from '@/types/oldGroups.type'

export const exportToExcel = (data: OldGroup[], filename: string = 'oldgroups') => {
    const worksheet = utils.json_to_sheet(data.map(item => ({
        'Old Group Name': item.name,
        'Old Group Code': item.code,
        'Old Group Leader': item.leader,
        'Leader Email': item.leader_email ?? '',
        'Leader Phone': item.leader_phone ?? '',
        "State": item.state,
        "Region": item.region,

    })))
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, 'OldGroups')
    writeFile(workbook, `${filename}_${new Date().toISOString().replaceAll("/", "_")}.xlsx`)
}

export const exportToCSV = (data: OldGroup[], filename: string = 'oldgroups') => {
    const worksheet = utils.json_to_sheet(data.map(item => ({
        'Old Group Name': item.name,
        'Old Group Code': item.code,
        'Old Group Leader': item.leader,
        'Leader Email': item.leader_email ?? '',
        'Leader Phone': item.leader_phone ?? '',
        "State": item.state,
        "Region": item.region,

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
        head: [['S/N', 'Old Group Name', 'Old Group Code', 'Old Group Leader', 'Leader Email', 'Leader Phone' ,'State','Region'  ]],
        body: data.map((item, i) => [i + 1, item.name, item.code, item.leader, item.leader_email ?? '', item.leader_phone ?? '',item.state || "",item.region || ""]),
        startY: 20,
    })

    doc.save(`${filename}_${new Date().toISOString().replaceAll("/", "_")}.pdf`)
}

export const copyToClipboard = async (data: OldGroup[]) => {
    const text = data.map((item, i) =>
        `${i + 1}\t${item.name}\t${item.code}\t${item.leader}\t${item.leader_email ?? ''}\t${item.leader_phone ?? ''}\t${item.state || ''}\t${item.region || ''}`
    ).join('\n')

    const header = 'S/N\tOld Group Name\tOld Group Code\tOld Group Leader\tLeader Email\tLeader Phone\tState\tRegion\n'
    await navigator.clipboard.writeText(header + text)
}