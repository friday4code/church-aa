// utils/districts.utils.ts
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { District } from '@/types/districts.type';
import { addPdfHeader, TABLE_HEADER_COLOR } from './pdf.utils';

export const copyDistrictsToClipboard = async (districts: District[]): Promise<void> => {
    const header = 'Group Name\tDistrict Name\tDistrict Leader';

    const text = districts
        .map(
            (district) =>
                `${district.group}\t${district.name}\t${district.leader}`
        )
        .join('\n');

    try {
        await navigator.clipboard.writeText(header + text);
    } catch (err) {
        console.error('Failed to copy districts to clipboard:', err);
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

export const exportDistrictsToExcel = (districts: District[]): void => {
    try {
        // Prepare data for Excel
        const excelData = districts.map((district) => ({
            'Group Name': district.group,
            'District Name': district.name,
            'District Leader': district.leader,
        }));

        // Create worksheet
        const worksheet = utils.json_to_sheet(excelData);

        // Create workbook
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, 'Districts Data');

        // Set column widths
        const colWidths = [
            { wch: 25 },  // Group Name
            { wch: 25 }, // District Name
            { wch: 25 }, // District Leader
        ];
        worksheet['!cols'] = colWidths;

        writeFile(workbook, `districts-data-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('Failed to export districts to Excel. Please try again.');
    }
};

export const exportDistrictsToCSV = (districts: District[]): void => {
    try {
        // CSV headers
        const headers = ['Group Name', 'District Name', 'District Leader'];

        // CSV data rows
        const csvRows = districts.map((district) => [
            `"${district?.group?.replace(/"/g, '""')}"`,
            `"${district?.name?.replace(/"/g, '""')}"`,
            `"${district?.leader?.replace(/"/g, '""')}"`,
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
        link.setAttribute('download', `districts-data-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        alert('Failed to export districts to CSV. Please try again.');
    }
};

export const exportDistrictsToPDF = async (districts: District[]): Promise<void> => {
    try {
        // Create new PDF document
        const doc = new jsPDF();

        // Add header
        await addPdfHeader(doc, 'Districts Data', `Total Districts: ${districts.length}`);



        // Prepare table data
        const tableData = districts.map((district, index) => [
            (index + 1).toString(),
            district.group || '',
            district.name || '',
            district.leader || '',
        ]);

        // Define table columns
        const tableColumns = [
            'S/N',
            'Group Name',
            'District Name',
            'District Leader'
        ];

        // Add table to PDF
        autoTable(doc, {
            head: [tableColumns],
            body: tableData,
            startY: 70,
            theme: 'grid',
            styles: {
                fontSize: 8,
                cellPadding: 2,
                overflow: 'linebreak'
            },
            headStyles: {
                fillColor: TABLE_HEADER_COLOR,
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            columnStyles: {
                0: { cellWidth: 15 }, // S/N
                1: { cellWidth: 55 }, // Group Name
                2: { cellWidth: 55 }, // District Name
                3: { cellWidth: 55 }, // District Leader
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
        doc.save(`districts-data-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        alert('Failed to export districts to PDF. Please try again.');
    }
};