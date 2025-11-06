// utils/youth-attendance.utils.ts
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { YouthAttendance } from '@/modules/admin/stores/youthMinistry/youthAttendance.store';
import type { Attendance } from '@/modules/admin/stores/attendance.store';

export const calculateYouthTotals = (attendances: Attendance[]) => {
    const totals = {
        men: 0,
        women: 0,
        youthBoys: 0,
        youthGirls: 0,
        childrenBoys: 0,
        childrenGirls: 0,
        total: 0
    }

    attendances.forEach(attendance => {
        totals.men += attendance.men || 0
        totals.women += attendance.women || 0
        totals.youthBoys += attendance.youthBoys || 0
        totals.youthGirls += attendance.youthGirls || 0
        totals.childrenBoys += attendance.childrenBoys || 0
        totals.childrenGirls += attendance.childrenGirls || 0
    })

    totals.total = totals.men + totals.women + totals.youthBoys + totals.youthGirls +
        totals.childrenBoys + totals.childrenGirls

    return totals
}

export const copyYouthAttendanceToClipboard = async (youthAttendance: YouthAttendance[]): Promise<void> => {
    const header = 'S/N\tGroup\tMonth\tYHSF Male\tYHSF Female\tYear\n';

    const text = youthAttendance
        .map(
            (attendance) =>
                `${attendance.id}\t${attendance.groupName}\t${attendance.month}\t${attendance.yhsfMale}\t${attendance.yhsfFemale}\t${attendance.year}`
        )
        .join('\n');

    try {
        await navigator.clipboard.writeText(header + text);
    } catch (err) {
        console.error('Failed to copy youth attendance to clipboard:', err);
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

export const exportYouthAttendanceToExcel = (youthAttendance: YouthAttendance[]): void => {
    try {
        // Prepare data for Excel
        const excelData = youthAttendance.map(attendance => ({
            'S/N': attendance.id,
            'Group': attendance.groupName,
            'Old Group': attendance.oldGroupName || '',
            'Month': attendance.month,
            'YHSF Male': attendance.yhsfMale,
            'YHSF Female': attendance.yhsfFemale,
            'Year': attendance.year,
            'Region (LGA)': attendance.regionName,
            'State': attendance.stateName,
            'Created Date': attendance.createdAt.toLocaleDateString(),
            'Updated Date': attendance.updatedAt.toLocaleDateString()
        }));

        // Create worksheet
        const worksheet = utils.json_to_sheet(excelData);

        // Create workbook
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, 'Youth Attendance Data');

        // Set column widths
        const colWidths = [
            { wch: 8 },  // S/N
            { wch: 20 }, // Group
            { wch: 15 }, // Old Group
            { wch: 12 }, // Month
            { wch: 12 }, // YHSF Male
            { wch: 12 }, // YHSF Female
            { wch: 8 },  // Year
            { wch: 20 }, // Region (LGA)
            { wch: 15 }, // State
            { wch: 12 }, // Created Date
            { wch: 12 }  // Updated Date
        ];
        worksheet['!cols'] = colWidths;

        writeFile(workbook, `youth-attendance-data-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('Failed to export youth attendance to Excel. Please try again.');
    }
};

export const exportYouthAttendanceToCSV = (youthAttendance: YouthAttendance[]): void => {
    try {
        // CSV headers
        const headers = ['S/N', 'Group', 'Old Group', 'Month', 'YHSF Male', 'YHSF Female', 'Year', 'Region (LGA)', 'State', 'Created Date', 'Updated Date'];

        // CSV data rows
        const csvRows = youthAttendance.map(attendance => [
            attendance.id.toString(),
            `"${attendance.groupName.replace(/"/g, '""')}"`,
            `"${(attendance.oldGroupName || '').replace(/"/g, '""')}"`,
            `"${attendance.month.replace(/"/g, '""')}"`,
            attendance.yhsfMale.toString(),
            attendance.yhsfFemale.toString(),
            attendance.year,
            `"${attendance.regionName.replace(/"/g, '""')}"`,
            `"${attendance.stateName.replace(/"/g, '""')}"`,
            attendance.createdAt.toLocaleDateString(),
            attendance.updatedAt.toLocaleDateString()
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
        link.setAttribute('download', `youth-attendance-data-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        alert('Failed to export youth attendance to CSV. Please try again.');
    }
};

export const exportYouthAttendanceToPDF = (youthAttendance: YouthAttendance[]): void => {
    try {
        // Create new PDF document
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text('Youth Attendance Data', 14, 15);

        // Add export date
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 14, 22);

        // Add total count
        doc.text(`Total Records: ${youthAttendance.length}`, 14, 28);

        // Prepare table data
        const tableData = youthAttendance.map(attendance => [
            attendance.id.toString(),
            attendance.groupName,
            attendance.month,
            attendance.yhsfMale.toString(),
            attendance.yhsfFemale.toString(),
            attendance.year
        ]);

        // Define table columns
        const tableColumns = [
            'S/N',
            'Group',
            'Month',
            'YHSF Male',
            'YHSF Female',
            'Year'
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
                1: { cellWidth: 25 }, // Group
                2: { cellWidth: 20 }, // Month
                3: { cellWidth: 15 }, // YHSF Male
                4: { cellWidth: 15 }, // YHSF Female
                5: { cellWidth: 15 }  // Year
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
        doc.save(`youth-attendance-data-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        alert('Failed to export youth attendance to PDF. Please try again.');
    }
};


// Service type configurations
export const SERVICE_TYPES = {
    'sunday-worship': {
        name: 'Sunday Worship Service',
        storageKey: 'sunday-worship-attendance',
    },
    'search-scriptures': {
        name: 'Search The Scriptures',
        storageKey: 'search-scriptures-attendance',
    },
    'house-caring': {
        name: 'House Caring Fellowship',
        storageKey: 'house-caring-attendance',
    },
    'thursday-revival': {
        name: 'Thursday Revival & ETS',
        storageKey: 'thursday-revival-attendance',
    },
    'monday-bible': {
        name: 'Monday Bible Study',
        storageKey: 'monday-bible-attendance',
    },
} as const;

export type ServiceType = keyof typeof SERVICE_TYPES;