// utils/states.utils.ts
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { State } from '@/types/states.type';

export const copyStatesToClipboard = async (states: State[]): Promise<void> => {
    const header = 'State Name\tState Code\n';

    const text = states
        .map(
            (state) =>
                `${state.name}\t${state.code}`
        )
        .join('\n');

    try {
        await navigator.clipboard.writeText(header + text);
    } catch (err) {
        console.error('Failed to copy states to clipboard:', err);
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

export const exportStatesToExcel = (states: State[]): void => {
    try {
        // Prepare data for Excel
        const excelData = states.map((state) => ({
            'State Name': state.name,
            'State Code': state.code,
            'State Leader': state.leader,
        }));

        // Create worksheet
        const worksheet = utils.json_to_sheet(excelData);

        // Create workbook
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, 'States Data');

        // Set column widths
        const colWidths = [
            { wch: 20 }, // State Name
            { wch: 15 }, // State Code
            { wch: 20 }, // State Leader
        ];
        worksheet['!cols'] = colWidths;

        // Generate Excel file and save
        writeFile(workbook, `Church Attendance App (States)-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('Failed to export states to Excel. Please try again.');
    }
};

export const exportStatesToCSV = (states: State[]): void => {
    try {
        // CSV headers
        const headers = ['State Name', 'State Code', 'State Leader', 'Region', 'Created Date', 'Updated Date'];

        // CSV data rows
        const csvRows = states.map((state) => [
            `"${state.name.replace(/"/g, '""')}"`,
            `"${state.code.replace(/"/g, '""')}"`,
            `"${state.leader.replace(/"/g, '""')}"`,
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
        link.setAttribute('download', `Church Attendance App (States)-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        alert('Failed to export states to CSV. Please try again.');
    }
};

export const exportStatesToPDF = (states: State[]): void => {
    try {
        // Create new PDF document
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text('States Data', 14, 15);

        // Add export date
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 14, 22);

        // Add total count
        doc.text(`Total States: ${states.length}`, 14, 28);

        // Prepare table data
        const tableData = states.map((state, index) => [
            (index + 1).toString(),
            state.name,
            state.code,
            state.leader,
        ]);

        // Define table columns
        const tableColumns = [
            'State Name',
            'State Code',
            'State Leader',
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
                1: { cellWidth: 30 }, // State Name
                2: { cellWidth: 20 }, // State Code
                3: { cellWidth: 30 }, // State Leader
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
        doc.save(`Church Attendance App (States)-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        alert('Failed to export states to PDF. Please try again.');
    }
};
