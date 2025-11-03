// utils/districts.utils.ts
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { District } from '@/modules/admin/stores/districts.store';

export const copyDistrictsToClipboard = async (districts: District[]): Promise<void> => {
    const header = 'S/N\tDistrict Name\tGroup Name\tDistrict Leader\tRegion\tState\n';

    const text = districts
        .map(
            (district) =>
                `${district.id}\t${district.districtName}\t${district.groupName}\t${district.leader || ''}\t${district.regionName}\t${district.stateName}`
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
        const excelData = districts.map(district => ({
            'S/N': district.id,
            'District Name': district.districtName,
            'Group Name': district.groupName,
            'Old Group Name': district.oldGroupName || '',
            'District Leader': district.leader || '',
            'Region': district.regionName,
            'State': district.stateName,
            'Created Date': district.createdAt.toLocaleDateString(),
            'Updated Date': district.updatedAt.toLocaleDateString()
        }));

        // Create worksheet
        const worksheet = utils.json_to_sheet(excelData);

        // Create workbook
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, 'Districts Data');

        // Set column widths
        const colWidths = [
            { wch: 8 },  // S/N
            { wch: 25 }, // District Name
            { wch: 20 }, // Group Name
            { wch: 20 }, // Old Group Name
            { wch: 25 }, // District Leader
            { wch: 20 }, // Region
            { wch: 15 }, // State
            { wch: 12 }, // Created Date
            { wch: 12 }  // Updated Date
        ];
        worksheet['!cols'] = colWidths;

        // Generate Excel file and save
        // const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
        // const data = new Blob([excelBuffer], {
        //     type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        // });
        writeFile(workbook, `districts-data-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('Failed to export districts to Excel. Please try again.');
    }
};

export const exportDistrictsToCSV = (districts: District[]): void => {
    try {
        // CSV headers
        const headers = ['S/N', 'District Name', 'Group Name', 'Old Group Name', 'District Leader', 'Region', 'State', 'Created Date', 'Updated Date'];

        // CSV data rows
        const csvRows = districts.map(district => [
            district.id.toString(),
            `"${district.districtName.replace(/"/g, '""')}"`,
            `"${district.groupName.replace(/"/g, '""')}"`,
            `"${(district.oldGroupName || '').replace(/"/g, '""')}"`,
            `"${(district.leader || '').replace(/"/g, '""')}"`,
            `"${district.regionName.replace(/"/g, '""')}"`,
            `"${district.stateName.replace(/"/g, '""')}"`,
            district.createdAt.toLocaleDateString(),
            district.updatedAt.toLocaleDateString()
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

export const exportDistrictsToPDF = (districts: District[]): void => {
    try {
        // Create new PDF document
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text('Districts Data', 14, 15);

        // Add export date
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 14, 22);

        // Add total count
        doc.text(`Total Districts: ${districts.length}`, 14, 28);

        // Prepare table data
        const tableData = districts.map(district => [
            district.id.toString(),
            district.districtName,
            district.groupName,
            district.leader || '-',
            district.regionName,
            district.stateName
        ]);

        // Define table columns
        const tableColumns = [
            'S/N',
            'District Name',
            'Group Name',
            'District Leader',
            'Region',
            'State'
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
                1: { cellWidth: 30 }, // District Name
                2: { cellWidth: 25 }, // Group Name
                3: { cellWidth: 30 }, // District Leader
                4: { cellWidth: 25 }, // Region
                5: { cellWidth: 20 }  // State
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