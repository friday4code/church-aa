import type { Region } from "@/modules/admin/stores/region.store"
import type { State } from "@/modules/admin/stores/states.store"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { utils, writeFile } from "xlsx"
import { exportToExcel, exportToCSV, exportToPDF, copyToClipboard } from "./export.utils"

// Regions Export Functions (new)
export const exportRegionsToExcel = (data: Region[], filename: string = 'regions') => {
    const worksheet = utils.json_to_sheet(data.map(item => ({
        'S/N': item.id,
        'State Name': item.stateName,
        'Region Name': item.regionName,
        'Region Leader': item.leader
    })))
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, 'Regions')
    writeFile(workbook, `${filename}_${new Date().toISOString().replaceAll("/", "_")}.xlsx`)
}

export const exportRegionsToCSV = (data: Region[], filename: string = 'regions') => {
    const worksheet = utils.json_to_sheet(data.map(item => ({
        'S/N': item.id,
        'State Name': item.stateName,
        'Region Name': item.regionName,
        'Region Leader': item.leader
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

export const exportRegionsToPDF = (data: Region[], filename: string = 'regions') => {
    const doc = new jsPDF()

    // Title
    doc.setFontSize(16)
    doc.text('Regions Data', 14, 15)

    // Date
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22)

    autoTable(doc, {
        head: [['S/N', 'State Name', 'Region Name', 'Region Leader']],
        body: data.map(item => [item.id, item.stateName, item.regionName, item.leader]),
        startY: 30,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 135, 245] } // Blue header
    })

    // Footer with page numbers
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.text(
            `Page ${i} of ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        )
    }

    doc.save(`${filename}_${new Date().toISOString().replaceAll("/", "_")}.pdf`)
}

export const copyRegionsToClipboard = async (data: Region[]) => {
    const text = data.map(item =>
        `${item.id}\t${item.stateName}\t${item.regionName}\t${item.leader}`
    ).join('\n')

    const header = 'S/N\tState Name\tRegion Name\tRegion Leader\n'
    await navigator.clipboard.writeText(header + text)
}

// Generic Export Functions that auto-detect type
export const exportDataToExcel = (data: any[], filename: string = 'data') => {
    if (data.length === 0) return

    // Check if it's State data
    if ('stateCode' in data[0]) {
        exportToExcel(data as State[], filename)
    }
    // Check if it's Region data
    else if ('regionName' in data[0]) {
        exportRegionsToExcel(data as Region[], filename)
    }
}

export const exportDataToCSV = (data: any[], filename: string = 'data') => {
    if (data.length === 0) return

    if ('stateCode' in data[0]) {
        exportToCSV(data as State[], filename)
    }
    else if ('regionName' in data[0]) {
        exportRegionsToCSV(data as Region[], filename)
    }
}

export const exportDataToPDF = (data: any[], filename: string = 'data') => {
    if (data.length === 0) return

    if ('stateCode' in data[0]) {
        exportToPDF(data as State[], filename)
    }
    else if ('regionName' in data[0]) {
        exportRegionsToPDF(data as Region[], filename)
    }
}

export const copyDataToClipboard = async (data: any[]) => {
    if (data.length === 0) return

    if ('stateCode' in data[0]) {
        await copyToClipboard(data as State[])
    }
    else if ('regionName' in data[0]) {
        await copyRegionsToClipboard(data as Region[])
    }
}