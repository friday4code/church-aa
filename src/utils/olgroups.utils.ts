import type { OldGroup } from "@/modules/admin/stores/oldgroups.store"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { utils, writeFile } from "xlsx"


// Old Groups Export Functions
export const exportOldGroupsToExcel = (data: OldGroup[], filename: string = 'old-groups') => {
    const worksheet = utils.json_to_sheet(data.map(item => ({
        'S/N': item.id,
        'Region Name': item.regionName,
        'Old Group Name': item.groupName,
        'Group Leader': item.leader || ''
    })))
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, 'Old Groups')
    writeFile(workbook, `${filename}.xlsx`)
}

export const exportOldGroupsToCSV = (data: OldGroup[], filename: string = 'old-groups') => {
    const worksheet = utils.json_to_sheet(data.map(item => ({
        'S/N': item.id,
        'Region Name': item.regionName,
        'Old Group Name': item.groupName,
        'Group Leader': item.leader || ''
    })))
    const csv = utils.sheet_to_csv(worksheet)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.csv`
    link.click()
    URL.revokeObjectURL(url)
}

export const exportOldGroupsToPDF = (data: OldGroup[], filename: string = 'old-groups') => {
    const doc = new jsPDF()

    doc.text('Old Groups Data', 14, 15)

    autoTable(doc, {
        head: [['S/N', 'Region Name', 'Old Group Name', 'Group Leader']],
        body: data.map(item => [item.id, item.regionName, item.groupName, item.leader || '']),
        startY: 20,
    })

    doc.save(`${filename}.pdf`)
}

export const copyOldGroupsToClipboard = async (data: OldGroup[]) => {
    const text = data.map(item =>
        `${item.id}\t${item.regionName}\t${item.groupName}\t${item.leader || ''}`
    ).join('\n')

    const header = 'S/N\tRegion Name\tOld Group Name\tGroup Leader\n'
    await navigator.clipboard.writeText(header + text)
}