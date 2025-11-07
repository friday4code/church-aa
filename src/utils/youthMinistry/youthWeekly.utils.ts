// utils/attendance/youthWeekly.utils.ts
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { YouthWeeklyAttendance } from '@/modules/admin/stores/youthMinistry/youthWeekly.store';

export const copyYouthWeeklyToClipboard = async (attendances: YouthWeeklyAttendance[]): Promise<void> => {
    const header = 'S/N\tYouth Att ID\tPeriod\tMembers Boys\tVisitors Boys\tMembers Girls\tVisitors Girls\n';

    const text = attendances
        .map(
            (attendance) =>
                `${attendance.id}\t${attendance.youthAttId}\t${attendance.period}\t${attendance.membersBoys}\t${attendance.visitorsBoys}\t${attendance.membersGirls}\t${attendance.visitorsGirls}`
        )
        .join('\n');

    try {
        await navigator.clipboard.writeText(header + text);
    } catch (err) {
        console.error('Failed to copy youth weekly attendance to clipboard:', err);
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

export const exportYouthWeeklyToExcel = (attendances: YouthWeeklyAttendance[]): void => {
    try {
        // Prepare data for Excel
        const excelData = attendances.map(attendance => ({
            'S/N': attendance.id,
            'Youth Att ID': attendance.youthAttId,
            'Period': attendance.period,
            'Members Boys': attendance.membersBoys,
            'Visitors Boys': attendance.visitorsBoys,
            'Members Girls': attendance.membersGirls,
            'Visitors Girls': attendance.visitorsGirls,
            'Year': attendance.year,
            'Month': attendance.month,
            'Week': attendance.week,
            'Created Date': attendance.createdAt.toLocaleDateString(),
            'Updated Date': attendance.updatedAt.toLocaleDateString()
        }));

        // Create worksheet
        const worksheet = utils.json_to_sheet(excelData);

        // Create workbook
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, 'Youth Weekly Attendance');

        // Set column widths
        const colWidths = [
            { wch: 8 },   // S/N
            { wch: 15 },  // Youth Att ID
            { wch: 35 },  // Period
            { wch: 15 },  // Members Boys
            { wch: 15 },  // Visitors Boys
            { wch: 15 },  // Members Girls
            { wch: 15 },  // Visitors Girls
            { wch: 10 },  // Year
            { wch: 12 },  // Month
            { wch: 8 },   // Week
            { wch: 12 },  // Created Date
            { wch: 12 }   // Updated Date
        ];
        worksheet['!cols'] = colWidths;

        writeFile(workbook, `youth-weekly-attendance-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('Failed to export youth weekly attendance to Excel. Please try again.');
    }
};

export const exportYouthWeeklyToCSV = (attendances: YouthWeeklyAttendance[]): void => {
    try {
        // CSV headers
        const headers = ['S/N', 'Youth Att ID', 'Period', 'Members Boys', 'Visitors Boys', 'Members Girls', 'Visitors Girls', 'Year', 'Month', 'Week', 'Created Date', 'Updated Date'];

        // CSV data rows
        const csvRows = attendances.map(attendance => [
            attendance.id.toString(),
            attendance.youthAttId.toString(),
            `"${attendance.period.replace(/"/g, '""')}"`,
            attendance.membersBoys.toString(),
            attendance.visitorsBoys.toString(),
            attendance.membersGirls.toString(),
            attendance.visitorsGirls.toString(),
            `"${attendance.year.replace(/"/g, '""')}"`,
            `"${attendance.month.replace(/"/g, '""')}"`,
            `"${attendance.week.replace(/"/g, '""')}"`,
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
        link.setAttribute('download', `youth-weekly-attendance-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        alert('Failed to export youth weekly attendance to CSV. Please try again.');
    }
};

export const exportYouthWeeklyToPDF = (attendances: YouthWeeklyAttendance[]): void => {
    try {
        // Create new PDF document
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text('Youth Weekly Attendance', 14, 15);

        // Add export date
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 14, 22);

        // Add total count
        doc.text(`Total Records: ${attendances.length}`, 14, 28);

        // Prepare table data
        const tableData = attendances.map(attendance => [
            attendance.id.toString(),
            attendance.youthAttId.toString(),
            attendance.period,
            attendance.membersBoys.toString(),
            attendance.visitorsBoys.toString(),
            attendance.membersGirls.toString(),
            attendance.visitorsGirls.toString()
        ]);

        // Define table columns
        const tableColumns = [
            'S/N',
            'Youth Att ID',
            'Period',
            'Members Boys',
            'Visitors Boys',
            'Members Girls',
            'Visitors Girls'
        ];

        // Add table to PDF
        (doc as any).autoTable({
            head: [tableColumns],
            body: tableData,
            startY: 35,
            theme: 'grid',
            styles: {
                fontSize: 7,
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
                0: { cellWidth: 10 },  // S/N
                1: { cellWidth: 15 },  // Youth Att ID
                2: { cellWidth: 40 },  // Period
                3: { cellWidth: 18 },  // Members Boys
                4: { cellWidth: 18 },  // Visitors Boys
                5: { cellWidth: 18 },  // Members Girls
                6: { cellWidth: 18 }   // Visitors Girls
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
        doc.save(`youth-weekly-attendance-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        alert('Failed to export youth weekly attendance to PDF. Please try again.');
    }
};

// Utility functions
export const getMonthOptions = () => [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const getWeekOptions = () => [1, 2, 3, 4, 5];

export const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => currentYear - i);
};

export const calculateTotals = (attendances: YouthWeeklyAttendance[]) => {
    return attendances.reduce((totals, attendance) => ({
        membersBoys: totals.membersBoys + attendance.membersBoys,
        visitorsBoys: totals.visitorsBoys + attendance.visitorsBoys,
        membersGirls: totals.membersGirls + attendance.membersGirls,
        visitorsGirls: totals.visitorsGirls + attendance.visitorsGirls,
        totalMembers: totals.totalMembers + attendance.membersBoys + attendance.membersGirls,
        totalVisitors: totals.totalVisitors + attendance.visitorsBoys + attendance.visitorsGirls,
        total: totals.total +
            attendance.membersBoys + attendance.visitorsBoys +
            attendance.membersGirls + attendance.visitorsGirls
    }), {
        membersBoys: 0,
        visitorsBoys: 0,
        membersGirls: 0,
        visitorsGirls: 0,
        totalMembers: 0,
        totalVisitors: 0,
        total: 0
    });
};