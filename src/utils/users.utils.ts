// utils/users.utils.ts
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { User } from '@/modules/admin/stores/users.store';

export const copyUsersToClipboard = async (users: User[]): Promise<void> => {
    const header = 'S/N\tFull Name\tEmail\tPhone\n';

    const text = users
        .map(
            (user) =>
                `${user.id}\t${user.firstName} ${user.lastName}\t${user.email}\t${user.phone}`
        )
        .join('\n');

    try {
        await navigator.clipboard.writeText(header + text);
    } catch (err) {
        console.error('Failed to copy users to clipboard:', err);
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

export const exportUsersToExcel = (users: User[]): void => {
    try {
        // Prepare data for Excel
        const excelData = users.map(user => ({
            'S/N': user.id,
            'First Name': user.firstName,
            'Last Name': user.lastName,
            'Full Name': `${user.firstName} ${user.lastName}`,
            'Email': user.email,
            'Phone': user.phone,
            'Created Date': user.createdAt.toLocaleDateString(),
            'Updated Date': user.updatedAt.toLocaleDateString()
        }));

        // Create worksheet
        const worksheet = utils.json_to_sheet(excelData);

        // Create workbook
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, 'Users Data');

        // Set column widths
        const colWidths = [
            { wch: 8 },  // S/N
            { wch: 15 }, // First Name
            { wch: 15 }, // Last Name
            { wch: 25 }, // Full Name
            { wch: 30 }, // Email
            { wch: 20 }, // Phone
            { wch: 12 }, // Created Date
            { wch: 12 }  // Updated Date
        ];
        worksheet['!cols'] = colWidths;

        // Generate Excel file and save
        // const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
        // const data = new Blob([excelBuffer], {
        //     type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        // });
        writeFile(workbook, `users-data-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('Failed to export users to Excel. Please try again.');
    }
};

export const exportUsersToCSV = (users: User[]): void => {
    try {
        // CSV headers
        const headers = ['S/N', 'First Name', 'Last Name', 'Full Name', 'Email', 'Phone', 'Created Date', 'Updated Date'];

        // CSV data rows
        const csvRows = users.map(user => [
            user.id.toString(),
            `"${user.firstName.replace(/"/g, '""')}"`,
            `"${user.lastName.replace(/"/g, '""')}"`,
            `"${user.firstName} ${user.lastName}".replace(/"/g, '""')`,
            `"${user.email.replace(/"/g, '""')}"`,
            `"${user.phone.replace(/"/g, '""')}"`,
            user.createdAt.toLocaleDateString(),
            user.updatedAt.toLocaleDateString()
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
        link.setAttribute('download', `users-data-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        alert('Failed to export users to CSV. Please try again.');
    }
};

export const exportUsersToPDF = (users: User[]): void => {
    try {
        // Create new PDF document
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text('Users Data', 14, 15);

        // Add export date
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 14, 22);

        // Add total count
        doc.text(`Total Users: ${users.length}`, 14, 28);

        // Prepare table data
        const tableData = users.map(user => [
            user.id.toString(),
            `${user.firstName} ${user.lastName}`,
            user.email,
            user.phone
        ]);

        // Define table columns
        const tableColumns = [
            'S/N',
            'Full Name',
            'Email',
            'Phone'
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
                1: { cellWidth: 35 }, // Full Name
                2: { cellWidth: 45 }, // Email
                3: { cellWidth: 30 }  // Phone
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
        doc.save(`users-data-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        alert('Failed to export users to PDF. Please try again.');
    }
};