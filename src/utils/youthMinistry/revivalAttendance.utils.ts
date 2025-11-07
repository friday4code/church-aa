// utils/youth-revival-attendance.utils.ts
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { YouthRevivalAttendance } from '@/modules/admin/stores/youthMinistry/revival.store';

export const copyYouthRevivalAttendanceToClipboard = async (attendances: YouthRevivalAttendance[]): Promise<void> => {
    const header = 'S/N\tYouth Att ID\tPeriod\tMale\tFemale\tTestimony\tChallenges\tSolutions\tRemarks\n';

    const text = attendances
        .map(
            (attendance) =>
                `${attendance.id}\t${attendance.id}\t${attendance.period}\t${attendance.male}\t${attendance.female}\t${attendance.testimony || 'N/A'}\t${attendance.challenges || 'N/A'}\t${attendance.solutions || 'N/A'}\t${attendance.remarks || 'N/A'}`
        )
        .join('\n');

    try {
        await navigator.clipboard.writeText(header + text);
    } catch (err) {
        console.error('Failed to copy youth revival attendance to clipboard:', err);
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

export const exportYouthRevivalAttendanceToExcel = (attendances: YouthRevivalAttendance[]): void => {
    try {
        // Prepare data for Excel
        const excelData = attendances.map(attendance => ({
            'S/N': attendance.id,
            'Youth Att ID': attendance.id,
            'Period': attendance.period,
            'Male': attendance.male,
            'Female': attendance.female,
            'Testimony': attendance.testimony || 'N/A',
            'Challenges': attendance.challenges || 'N/A',
            'Solutions': attendance.solutions || 'N/A',
            'Remarks': attendance.remarks || 'N/A',
            'Created Date': attendance.createdAt.toLocaleDateString(),
            'Updated Date': attendance.updatedAt.toLocaleDateString()
        }));

        // Create worksheet
        const worksheet = utils.json_to_sheet(excelData);

        // Create workbook
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, 'Youth Revival Attendance Data');

        // Set column widths
        const colWidths = [
            { wch: 8 },  // S/N
            { wch: 12 }, // Youth Att ID
            { wch: 30 }, // Period
            { wch: 8 },  // Male
            { wch: 8 },  // Female
            { wch: 20 }, // Testimony
            { wch: 20 }, // Challenges
            { wch: 20 }, // Solutions
            { wch: 20 }, // Remarks
            { wch: 12 }, // Created Date
            { wch: 12 }  // Updated Date
        ];
        worksheet['!cols'] = colWidths;

        writeFile(workbook, `youth-revival-attendance-data-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('Failed to export youth revival attendance to Excel. Please try again.');
    }
};

export const exportYouthRevivalAttendanceToCSV = (attendances: YouthRevivalAttendance[]): void => {
    try {
        // CSV headers
        const headers = ['S/N', 'Youth Att ID', 'Period', 'Male', 'Female', 'Testimony', 'Challenges', 'Solutions', 'Remarks', 'Created Date', 'Updated Date'];

        // CSV data rows
        const csvRows = attendances.map(attendance => [
            attendance.id.toString(),
            attendance.id.toString(),
            `"${attendance.period.replace(/"/g, '""')}"`,
            attendance.male.toString(),
            attendance.female.toString(),
            `"${(attendance.testimony || 'N/A').replace(/"/g, '""')}"`,
            `"${(attendance.challenges || 'N/A').replace(/"/g, '""')}"`,
            `"${(attendance.solutions || 'N/A').replace(/"/g, '""')}"`,
            `"${(attendance.remarks || 'N/A').replace(/"/g, '""')}"`,
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
        link.setAttribute('download', `youth-revival-attendance-data-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        alert('Failed to export youth revival attendance to CSV. Please try again.');
    }
};

export const exportYouthRevivalAttendanceToPDF = (attendances: YouthRevivalAttendance[]): void => {
    try {
        // Create new PDF document
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text('Youth Revival Attendance Data', 14, 15);

        // Add export date
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 14, 22);

        // Add total count
        doc.text(`Total Records: ${attendances.length}`, 14, 28);

        // Prepare table data
        const tableData = attendances.map(attendance => [
            attendance.id.toString(),
            attendance.period,
            attendance.male.toString(),
            attendance.female.toString(),
            attendance.testimony || 'N/A',
            attendance.challenges || 'N/A',
            attendance.solutions || 'N/A',
            attendance.remarks || 'N/A'
        ]);

        // Define table columns
        const tableColumns = [
            'S/N',
            'Period',
            'Male',
            'Female',
            'Testimony',
            'Challenges',
            'Solutions',
            'Remarks'
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
                1: { cellWidth: 35 }, // Period
                2: { cellWidth: 15 }, // Male
                3: { cellWidth: 15 }, // Female
                4: { cellWidth: 30 }, // Testimony
                5: { cellWidth: 30 }, // Challenges
                6: { cellWidth: 30 }, // Solutions
                7: { cellWidth: 30 }  // Remarks
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
        doc.save(`youth-revival-attendance-data-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        alert('Failed to export youth revival attendance to PDF. Please try again.');
    }
};