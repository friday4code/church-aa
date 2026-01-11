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
