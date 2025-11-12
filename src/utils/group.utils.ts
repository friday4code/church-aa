// utils/groups.utils.ts
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Group } from '@/types/groups.type';

export const copyGroupsToClipboard = async (groups: Group[]): Promise<void> => {
    const header = 'S/N\tGroup Name\tGroup Leader\tAccess Level\tState ID\tRegion ID\tDistrict ID\n';

    const text = groups
        .map(
            (group, index) =>
                `${index + 1}\t${group.group_name}\t${group.leader}\t${group.access_level}\t${group.state_id}\t${group.region_id}\t${group.district_id}`
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
            'Group Name': group.group_name,
            'Group Leader': group.leader,
            'Access Level': group.access_level,
            'State ID': group.state_id,
            'Region ID': group.region_id,
            'District ID': group.district_id,
            'Created Date': group.createdAt ? group.createdAt.toLocaleDateString() : '',
            'Updated Date': group.updatedAt ? group.updatedAt.toLocaleDateString() : ''
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
            { wch: 25 }, // Group Leader
            { wch: 20 }, // Access Level
            { wch: 10 }, // State ID
            { wch: 12 }, // Region ID
            { wch: 12 }, // District ID
            { wch: 12 }, // Created Date
            { wch: 12 }  // Updated Date
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
        const headers = ['S/N', 'Group Name', 'Group Leader', 'Access Level', 'State ID', 'Region ID', 'District ID', 'Created Date', 'Updated Date'];

        // CSV data rows
        const csvRows = groups.map((group, index) => [
            (index + 1).toString(),
            `"${group.group_name.replace(/"/g, '""')}"`,
            `"${group.leader.replace(/"/g, '""')}"`,
            `"${group.access_level.replace(/"/g, '""')}"`,
            group.state_id.toString(),
            group.region_id.toString(),
            group.district_id.toString(),
            group.createdAt ? group.createdAt.toLocaleDateString() : '',
            group.updatedAt ? group.updatedAt.toLocaleDateString() : ''
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

        // Prepare table data
        const tableData = groups.map((group, index) => [
            (index + 1).toString(),
            group.group_name,
            group.leader,
            group.access_level,
            group.state_id.toString(),
            group.region_id.toString(),
            group.district_id.toString()
        ]);

        // Define table columns
        const tableColumns = [
            'S/N',
            'Group Name',
            'Group Leader',
            'Access Level',
            'State ID',
            'Region ID',
            'District ID'
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
                2: { cellWidth: 25 }, // Group Leader
                3: { cellWidth: 20 }, // Access Level
                4: { cellWidth: 15 }, // State ID
                5: { cellWidth: 15 }, // Region ID
                6: { cellWidth: 15 }  // District ID
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
        group_name: group.group_name,
        leader: group.leader,
        access_level: group.access_level,
        state_id: group.state_id,
        region_id: group.region_id,
        district_id: group.district_id,
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