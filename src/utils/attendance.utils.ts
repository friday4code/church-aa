import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { SERVICE_TYPES, type ServiceType } from '@/modules/admin/stores/attendance.store';
import type { Attendance } from '@/modules/admin/stores/attendance.store';

// Generic export functions that accept service type
export const copyAttendanceToClipboard = async (attendances: Attendance[], serviceType: ServiceType): Promise<void> => {
    const serviceName = SERVICE_TYPES[serviceType].name;
    const header = `S/N\tDistrict\tMonth\tWeek\tMen\tWomen\tYouth Boys\tYouth Girls\tChildren Boys\tChildren Girls\tYear\n`;

    const text = attendances
        .map(
            (attendance) =>
                `${attendance.id}\t${attendance.district}\t${attendance.month}\t${attendance.week}\t${attendance.men}\t${attendance.women}\t${attendance.youthBoys}\t${attendance.youthGirls}\t${attendance.childrenBoys}\t${attendance.childrenGirls}\t${attendance.year}`
        )
        .join('\n');

    try {
        await navigator.clipboard.writeText(`${serviceName}\n${header}${text}`);
    } catch (err) {
        console.error('Failed to copy attendance data to clipboard:', err);
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = `${serviceName}\n${header}${text}`;
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

export const exportAttendanceToExcel = (attendances: Attendance[], serviceType: ServiceType): void => {
    try {
        const serviceName = SERVICE_TYPES[serviceType].name;

        // Prepare data for Excel
        const excelData = attendances.map(attendance => ({
            'S/N': attendance.id,
            'District': attendance.district,
            'Month': attendance.month,
            'Week': attendance.week,
            'Men': attendance.men,
            'Women': attendance.women,
            'Youth Boys': attendance.youthBoys,
            'Youth Girls': attendance.youthGirls,
            'Children Boys': attendance.childrenBoys,
            'Children Girls': attendance.childrenGirls,
            'Year': attendance.year,
            'State': attendance.state || '',
            'Region': attendance.region || '',
            'Group': attendance.group || '',
            'Old Group': attendance.oldGroup || '',
            'Created Date': attendance.createdAt.toLocaleDateString(),
            'Updated Date': attendance.updatedAt.toLocaleDateString()
        }));

        // Create worksheet
        const worksheet = utils.json_to_sheet(excelData);

        // Create workbook
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, `${serviceName} Attendance`);

        // Set column widths
        const colWidths = [
            { wch: 8 },   // S/N
            { wch: 20 },  // District
            { wch: 15 },  // Month
            { wch: 8 },   // Week
            { wch: 8 },   // Men
            { wch: 10 },  // Women
            { wch: 12 },  // Youth Boys
            { wch: 12 },  // Youth Girls
            { wch: 15 },  // Children Boys
            { wch: 15 },  // Children Girls
            { wch: 8 },   // Year
            { wch: 15 },  // State
            { wch: 15 },  // Region
            { wch: 15 },  // Group
            { wch: 15 },  // Old Group
            { wch: 12 },  // Created Date
            { wch: 12 }   // Updated Date
        ];
        worksheet['!cols'] = colWidths;

        writeFile(workbook, `${serviceName.toLowerCase().replace(/\s+/g, '-')}-attendance-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('Failed to export attendance data to Excel. Please try again.');
    }
};

export const exportAttendanceToCSV = (attendances: Attendance[], serviceType: ServiceType): void => {
    try {
        const serviceName = SERVICE_TYPES[serviceType].name;

        // CSV headers
        const headers = ['S/N', 'District', 'Month', 'Week', 'Men', 'Women', 'Youth Boys', 'Youth Girls', 'Children Boys', 'Children Girls', 'Year', 'State', 'Region', 'Group', 'Old Group', 'Created Date', 'Updated Date'];

        // CSV data rows
        const csvRows = attendances.map(attendance => [
            attendance.id.toString(),
            `"${attendance.district.replace(/"/g, '""')}"`,
            `"${attendance.month.replace(/"/g, '""')}"`,
            attendance.week.toString(),
            attendance.men.toString(),
            attendance.women.toString(),
            attendance.youthBoys.toString(),
            attendance.youthGirls.toString(),
            attendance.childrenBoys.toString(),
            attendance.childrenGirls.toString(),
            attendance.year.toString(),
            `"${(attendance.state || '').replace(/"/g, '""')}"`,
            `"${(attendance.region || '').replace(/"/g, '""')}"`,
            `"${(attendance.group || '').replace(/"/g, '""')}"`,
            `"${(attendance.oldGroup || '').replace(/"/g, '""')}"`,
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
        link.setAttribute('download', `${serviceName.toLowerCase().replace(/\s+/g, '-')}-attendance-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        alert('Failed to export attendance data to CSV. Please try again.');
    }
};

export const exportAttendanceToPDF = (attendances: Attendance[], serviceType: ServiceType): void => {
    try {
        const serviceName = SERVICE_TYPES[serviceType].name;

        // Create new PDF document
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text(`${serviceName} Attendance`, 14, 15);

        // Add export date
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 14, 22);

        // Add total count
        doc.text(`Total Records: ${attendances.length}`, 14, 28);

        // Prepare table data
        const tableData = attendances.map(attendance => [
            attendance.id.toString(),
            attendance.district,
            attendance.month,
            attendance.week.toString(),
            attendance.men.toString(),
            attendance.women.toString(),
            attendance.youthBoys.toString(),
            attendance.youthGirls.toString(),
            attendance.childrenBoys.toString(),
            attendance.childrenGirls.toString(),
            attendance.year.toString()
        ]);

        // Define table columns
        const tableColumns = [
            'S/N',
            'District',
            'Month',
            'Week',
            'Men',
            'Women',
            'Youth Boys',
            'Youth Girls',
            'Children Boys',
            'Children Girls',
            'Year'
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
                1: { cellWidth: 20 },  // District
                2: { cellWidth: 15 },  // Month
                3: { cellWidth: 10 },  // Week
                4: { cellWidth: 10 },  // Men
                5: { cellWidth: 12 },  // Women
                6: { cellWidth: 15 },  // Youth Boys
                7: { cellWidth: 15 },  // Youth Girls
                8: { cellWidth: 18 },  // Children Boys
                9: { cellWidth: 18 },  // Children Girls
                10: { cellWidth: 10 }  // Year
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
        doc.save(`${serviceName.toLowerCase().replace(/\s+/g, '-')}-attendance-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        alert('Failed to export attendance data to PDF. Please try again.');
    }
};

// Utility function to calculate totals
export const calculateTotals = (attendances: Attendance[]) => {
    return attendances.reduce((totals, attendance) => ({
        men: totals.men + attendance.men,
        women: totals.women + attendance.women,
        youthBoys: totals.youthBoys + attendance.youthBoys,
        youthGirls: totals.youthGirls + attendance.youthGirls,
        childrenBoys: totals.childrenBoys + attendance.childrenBoys,
        childrenGirls: totals.childrenGirls + attendance.childrenGirls,
        total: totals.total +
            attendance.men + attendance.women +
            attendance.youthBoys + attendance.youthGirls +
            attendance.childrenBoys + attendance.childrenGirls
    }), {
        men: 0,
        women: 0,
        youthBoys: 0,
        youthGirls: 0,
        childrenBoys: 0,
        childrenGirls: 0,
        total: 0
    });
};

// Utility function to generate filename with timestamp
export const generateExportFilename = (serviceType: ServiceType, extension: string): string => {
    const serviceName = SERVICE_TYPES[serviceType].name.toLowerCase().replace(/\s+/g, '_');
    const timestamp = new Date().toISOString()
        .replace(/[:.]/g, '-')
        .split('T')
        .join('_')
        .slice(0, -5);
    return `${serviceName}_attendance_${timestamp}.${extension}`;
};

// Utility function to get month options
export const getMonthOptions = () => [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Utility function to get week options
export const getWeekOptions = () => [1, 2, 3, 4, 5];

// Utility function to get year options
export const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => currentYear - i);
};