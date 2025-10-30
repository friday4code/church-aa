// utils/export.utils.ts
import { utils, writeFile } from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { State } from '@/modules/admin/stores/states.store'

export const exportToExcel = (data: State[], filename: string = 'states') => {
    const worksheet = utils.json_to_sheet(data.map(item => ({
        'S/N': item.id,
        'State Name': item.stateName,
        'State Code': item.stateCode,
        'State Leader': item.leader
    })))
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, 'States')
    writeFile(workbook, `${filename}.xlsx`)
}

export const exportToCSV = (data: State[], filename: string = 'states') => {
    const worksheet = utils.json_to_sheet(data.map(item => ({
        'S/N': item.id,
        'State Name': item.stateName,
        'State Code': item.stateCode,
        'State Leader': item.leader
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

export const exportToPDF = (data: State[], filename: string = 'states') => {
    const doc = new jsPDF()

    doc.text('States Data', 14, 15)

    autoTable(doc, {
        head: [['S/N', 'State Name', 'State Code', 'State Leader']],
        body: data.map(item => [item.id, item.stateName, item.stateCode, item.leader]),
        startY: 20,
    })

    doc.save(`${filename}.pdf`)
}

export const copyToClipboard = async (data: State[]) => {
    const text = data.map(item =>
        `${item.id}\t${item.stateName}\t${item.stateCode}\t${item.leader}`
    ).join('\n')

    const header = 'S/N\tState Name\tState Code\tState Leader\n'
    await navigator.clipboard.writeText(header + text)
}