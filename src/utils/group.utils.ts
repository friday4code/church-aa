import { utils, writeFile } from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Group } from '@/types/groups.type'

export const exportGroupsToExcel = (data: Group[], filename: string = 'groups') => {
    const worksheet = utils.json_to_sheet(data.map(item => ({
        'Group Name': item.name,
        'Group Code': item.code,
        'Group Leader': item.leader,
        'Leader Email': item.leader_email ?? '',
        'Leader Phone': item.leader_phone ?? '',
        "State": item.state,
        "Region": item.region,
        "Old Group": item.old_group,
    })))
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, 'Groups')
    writeFile(workbook, `${filename}_${new Date().toISOString().replaceAll("/", "_")}.xlsx`)
}

export const exportGroupsToCSV = (data: Group[], filename: string = 'groups') => {
    const worksheet = utils.json_to_sheet(data.map(item => ({
        'Group Name': item.name,
        'Group Code': item.code,
        'Group Leader': item.leader,
        'Leader Email': item.leader_email ?? '',
        'Leader Phone': item.leader_phone ?? '',
        "State": item.state,
        "Region": item.region,
        "Old Group": item.old_group,
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

export const exportGroupsToPDF = (data: Group[], filename: string = 'groups') => {
    const doc = new jsPDF()

    doc.text('Groups Data', 14, 15)

    autoTable(doc, {
        head: [['S/N', 'Group Name', 'Group Code', 'Group Leader', 'Leader Email', 'Leader Phone' ,'State','Region', 'Old Group']],
        body: data.map((item, i) => [i + 1, item.name, item.code, item.leader || '', item.leader_email ?? '', item.leader_phone ?? '',item.state || "",item.region || "", item.old_group || ""]),
        startY: 20,
        styles: {
            fontSize: 8,
            cellPadding: 2,
            overflow: 'linebreak'
        },
        headStyles: {
            fillColor: [66, 135, 245],
            textColor: 255,
            fontStyle: 'bold'
        },
        columnStyles: {
            0: { cellWidth: 10 }, // S/N
            1: { cellWidth: 25 }, // Group Name
            2: { cellWidth: 20 }, // Group Code
            3: { cellWidth: 25 }, // Group Leader
            4: { cellWidth: 30 }, // Leader Email
            5: { cellWidth: 20 }, // Leader Phone
            6: { cellWidth: 20 }, // State
            7: { cellWidth: 20 }, // Region
            8: { cellWidth: 20 }  // Old Group
        },
        margin: { top: 20 }
    })

    doc.save(`${filename}_${new Date().toISOString().replaceAll("/", "_")}.pdf`)
}

export const copyGroupsToClipboard = async (data: Group[]) => {
    const text = data.map((item, i) =>
        `${i + 1}\t${item.name}\t${item.code}\t${item.leader || ''}\t${item.leader_email ?? ''}\t${item.leader_phone ?? ''}\t${item.state || ''}\t${item.region || ''}\t${item.old_group || ''}`
    ).join('\n')

    const header = 'S/N\tGroup Name\tGroup Code\tGroup Leader\tLeader Email\tLeader Phone\tState\tRegion\tOld Group\n'
    await navigator.clipboard.writeText(header + text)
}
