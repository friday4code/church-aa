// utils/groups.utils.ts
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Group } from '@/types/groups.type';

export const copyGroupsToClipboard = async (groups: Group[]): Promise<void> => {
    const header = 'S/N\tGroup Name\tGroup Leader\tLeader Email\tLeader Phone\n';

    const text = groups
        .map(
            (group, index) =>
                `${index + 1}\t${group.name}\t${group.code}\t${group.leader}\t${group.leader_email ?? ''}\t${group.leader_phone ?? ''} \t${group.state}\t${group.region}\t${group.old_group.toString()}`
        )
        .join('\n');

    try {
        await navigator.clipboard.writeText(header + text);
    } catch (err) {
        console.error('Failed to copy groups to clipboard:', err);
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = header + text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (fallbackErr) {
            console.error('Fallback copy failed:', fallbackErr);
        }
        document.body.removeChild(textArea);
    }
};

export const exportGroupsToExcel = (groups: Group[]): void => {
    try {
        // Prepare data for Excel
        const excelData = groups.map((group, index) => ({
            'S/N': index + 1,
            'Group Name': group.name,
            'Group Code': group.code,
            'Group Leader': group.leader,
            'Leader Email': group.leader_email ?? '',
            'Leader Phone': group.leader_phone ?? '',
            'State': group.state,
            'Region': group.region,
            'Old Group': group.old_group.toString(),
        }));

        // Create worksheet
        const worksheet = utils.json_to_sheet(excelData);

        // Create workbook
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, 'Groups Data');

        // Set column widths
        const colWidths = [
            { wch: 8 },  // S/N
            { wch: 25 }, // Group Name
            { wch: 10 }, // Group Code
            { wch: 25 }, // Group Leader
            { wch: 10 }, // Leader Email
            { wch: 12 }, // Leader Phone
            { wch: 10 }, // State ID
            { wch: 12 }, // Region ID
            { wch: 12 }, // Old Group
        ];
        worksheet['!cols'] = colWidths;

        // Generate Excel file and save
        writeFile(workbook, `groups-data-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('Failed to export groups to Excel. Please try again.');
    }
};

export const exportGroupsToCSV = (groups: Group[]): void => {
    try {
        // CSV headers
        const headers = ['S/N', 'Group Name', 'Group Code', 'Group Leader','Leader Email','Leader Phone', 'State', 'Region','Old Group'];

        // CSV data rows
        const csvRows = groups.map((group, index) => [
            (index + 1).toString(),
            `"${group.name.replace(/"/g, '""')}"`,
            `"${group.code.replace(/"/g, '""')}"`,
            `"${group?.leader?.replace(/"/g, '""')}"`,
            group.leader_email ?? '',
            group.leader_phone ?? '',
            group.state.toString(),
            group.region.toString(),
            group.old_group.toString(),
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...csvRows.map(row => row.join(','))
        ].join('\n');

        // Create and download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `groups-data-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        alert('Failed to export groups to CSV. Please try again.');
    }
};

export const exportGroupsToPDF = (groups: Group[]): void => {
    try {
        // Create new PDF document
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text('Groups Data', 14, 15);

        // Add export date
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 14, 22);

        // Add total count
        doc.text(`Total Groups: ${groups.length}`, 14, 28);

        // Add Group Code and contact info fields to PDF table data
        const tableData = groups.map((group, index) => [
            (index + 1).toString(),
            group.name,
            group.code,
            group.leader,
            group.leader_email ?? '',
            group.leader_phone ?? '',
            group.state.toString(),
            group.region.toString(),
            group.old_group.toString()
        ]);

        // Define table columns
        const tableColumns = [
            'S/N',
            'Group Name',
            'Group Code',
            'Group Leader',
            'Leader Email',
            'Leader Phone',
            'Leader Email',
            'Leader Phone',
            'State',
            'Region',
            "Old Group"
        ];

        // Add table to PDF
        (doc as any).autoTable({
            head: [tableColumns],
            body: tableData,
            startY: 35,
            theme: 'grid',
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
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            columnStyles: {
                0: { cellWidth: 15 }, // S/N
                1: { cellWidth: 30 }, // Group Name
                2: { cellWidth: 25 }, // Group Code
                3: { cellWidth: 25 }, // Group Leader
                4: { cellWidth: 20 }, // Leader Email
                5: { cellWidth: 20 }, // Leader Phone
                6: { cellWidth: 15 }, // State ID
                7: { cellWidth: 15 }, // Region ID
                8: { cellWidth: 15 }  // District ID
            },
            margin: { top: 35 }
        });

        // Add page numbers
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
                `Page ${i} of ${pageCount}`,
                doc.internal.pageSize.width / 2,
                doc.internal.pageSize.height - 10,
                { align: 'center' }
            );
        }

        // Save PDF
        doc.save(`groups-data-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        alert('Failed to export groups to PDF. Please try again.');
    }
};

// Utility function to format data for display
export const formatGroupsForExport = (groups: Group[]) => {
    return groups.map(group => ({
        group_name: group.name,
        leader: group.leader,
        state_id: group.state_id,
        region_id: group.region_id,
        district_id: group.district,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt
    }));
};

// Utility function to generate filename with timestamp
export const generateExportFilename = (extension: string) => {
    const timestamp = new Date().toISOString()
        .replace(/[:.]/g, '-')
        .split('T')
        .join('_')
        .slice(0, -5);
    return `groups_export_${timestamp}.${extension}`;
};