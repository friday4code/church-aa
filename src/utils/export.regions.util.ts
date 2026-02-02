// utils/export.regions.util.ts
import type { Region } from "@/types/regions.type"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { utils, writeFile } from "xlsx"

// Regions Export Functions (updated)
export const exportRegionsToExcel = (data: Region[], filename: string = 'regions') => {
    const worksheet = utils.json_to_sheet(data.map(item => ({
        'State': item.state,
        'Region Name': item.name,
        'Region Code': item.code,
        'Region Leader': item.leader,
        'Leader Email': item.leader_email,
        'Leader Phone': item.leader_phone,
    })))

    // Add columns for leader_email and leader_phone
    worksheet['A1'].v = 'State'
    worksheet['B1'].v = 'Region Name'
    worksheet['C1'].v = 'Region Code'
    worksheet['D1'].v = 'Region Leader'
    worksheet['E1'].v = 'Leader Email'
    worksheet['F1'].v = 'Leader Phone'
    
    // Set column widths to fit content
    const colWidths = [
        { wch: Math.max(...data.map(item => item.state?.length || 0), 'State'.length) + 2 }, // State
        { wch: Math.max(...data.map(item => item.name?.length || 0), 'Region Name'.length) + 2 }, // Region Name
        { wch: Math.max(...data.map(item => item.code?.length || 0), 'Region Code'.length) + 2 }, // Region Code
        { wch: Math.max(...data.map(item => item.leader?.length || 0), 'Region Leader'.length) + 2 }, // Region Leader
        { wch: Math.max(...data.map(item => item.leader_email?.length || 0), 'Leader Email'.length) + 2 }, // Leader Email
        { wch: Math.max(...data.map(item => item.leader_phone?.length || 0), 'Leader Phone'.length) + 2 }, // Leader Phone
    ]
    worksheet['!cols'] = colWidths

    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, 'Regions')
    writeFile(workbook, `${filename}_${new Date().toISOString().replaceAll("/", "_")}.xlsx`)
}

export const exportRegionsToCSV = (data: Region[], filename: string = 'regions') => {
    const worksheet = utils.json_to_sheet(data.map(item => ({
        'State': item.state,
        'Region Name': item.name,
        'Region Code': item.code,
        'Region Leader': item.leader,
        'Leader Email': item.leader_email,
        'Leader Phone': item.leader_phone,
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
        head: [['S/N', 'State', 'Region Name', 'Region Code', 'Region Leader', 'Leader Email', 'Leader Phone']],
        body: data.map((item, index) => [
            (index + 1).toString(),
            item.state ?? '',
            item.name ?? '',
            item.code ?? '',
            item.leader ?? '',
            item.leader_email ?? '',
            item.leader_phone ?? ''
        ]),
        startY: 30,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 135, 245] }, // Blue header
        columnStyles: {
            0: { cellWidth: 15 }, // S/N
            1: { cellWidth: 30 }, // State
            2: { cellWidth: 35 }, // Region Name
            3: { cellWidth: 25 }, // Region Code
            4: { cellWidth: 35 },  // Region Leader
            5: { cellWidth: 40 },  // Leader Email
            6: { cellWidth: 25 }   // Leader Phone
        },
        tableWidth: 'auto'
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
        `${item.state}\t${item.name}\t${item.code}\t${item.leader}\t${item.leader_email}\t${item.leader_phone}`
    ).join('\n')

    const header = 'State\tRegion Name\tRegion Code\tRegion Leader\tLeader Email\tLeader Phone\n'
    await navigator.clipboard.writeText(header + text)
}

// Generic Export Functions that auto-detect type
export const exportDataToExcel = (data: any[], filename: string = 'data') => {
    if (data.length === 0) return

    // Check if it's Region data
    if ('state' in data[0] && 'code' in data[0]) {
        exportRegionsToExcel(data as Region[], filename)
    }
    // Add other data type checks here as needed
}

export const exportDataToCSV = (data: any[], filename: string = 'data') => {
    if (data.length === 0) return

    if ('state' in data[0] && 'code' in data[0]) {
        exportRegionsToCSV(data as Region[], filename)
    }
    // Add other data type checks here as needed
}

export const exportDataToPDF = (data: any[], filename: string = 'data') => {
    if (data.length === 0) return

    if ('state' in data[0] && 'code' in data[0]) {
        exportRegionsToPDF(data as Region[], filename)
    }
    // Add other data type checks here as needed
}

export const copyDataToClipboard = async (data: any[]) => {
    if (data.length === 0) return

    if ('state' in data[0] && 'code' in data[0]) {
        await copyRegionsToClipboard(data as Region[])
    }
    // Add other data type checks here as needed
}