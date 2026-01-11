// utils/userRights.utils.ts
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { UserRight } from '@/types/userRights.type';

export const copyUserRightsToClipboard = async (userRights: UserRight[]): Promise<void> => {
    const header = 'S/N\tFull Name\tAccess Level\tAccess Scope\n';

    const text = userRights
        .map(
            (userRight) =>
                `${userRight.id}\t${userRight.userName}\t${userRight.accessLevel}\t${userRight.accessScope}`
        )
        .join('\n');

    try {
        await navigator.clipboard.writeText(header + text);
    } catch (err) {
        console.error('Failed to copy user rights to clipboard:', err);
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

export const exportUserRightsToExcel = (userRights: UserRight[]): void => {
    try {
        // Prepare data for Excel
        const excelData = userRights.map(userRight => ({
            'S/N': userRight.id,
            'Full Name': userRight.userName,
            'Access Level': userRight.accessLevel.replace('_', ' ').toUpperCase(),
            'Access Scope': userRight.accessScope,
            'State': userRight.stateName || '',
            'Region': userRight.regionName || '',
            'Group': userRight.groupName || '',
            'Old Group': userRight.oldGroupName || '',
            'District': userRight.districtName || '',
            'Created Date': userRight.createdAt.toLocaleDateString(),
            'Updated Date': userRight.updatedAt.toLocaleDateString()
        }));

        // Create worksheet
        const worksheet = utils.json_to_sheet(excelData);

        // Create workbook
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, 'User Rights Data');

        // Set column widths
        const colWidths = [
            { wch: 8 },  // S/N
            { wch: 25 }, // Full Name
            { wch: 20 }, // Access Level
            { wch: 25 }, // Access Scope
            { wch: 20 }, // State
            { wch: 20 }, // Region
            { wch: 20 }, // Group
            { wch: 20 }, // Old Group
            { wch: 20 }, // District
            { wch: 12 }, // Created Date
            { wch: 12 }  // Updated Date
        ];
        worksheet['!cols'] = colWidths;

        // // Generate Excel file and save
        // const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
        // const data = new Blob([excelBuffer], {
        //     type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        // });
        writeFile(workbook, `user-rights-data-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('Failed to export user rights to Excel. Please try again.');
    }
};

export const exportUserRightsToCSV = (userRights: UserRight[]): void => {
    try {
        // CSV headers
        const headers = ['S/N', 'Full Name', 'Access Level', 'Access Scope', 'State', 'Region', 'Group', 'Old Group', 'District', 'Created Date', 'Updated Date'];

        // CSV data rows
        const csvRows = userRights.map(userRight => [
            userRight.id.toString(),
            `"${userRight.userName.replace(/"/g, '""')}"`,
            `"${userRight.accessLevel.replace('_', ' ').toUpperCase().replace(/"/g, '""')}"`,
            `"${userRight.accessScope.replace(/"/g, '""')}"`,
            `"${(userRight.stateName || '').replace(/"/g, '""')}"`,
            `"${(userRight.regionName || '').replace(/"/g, '""')}"`,
            `"${(userRight.groupName || '').replace(/"/g, '""')}"`,
            `"${(userRight.oldGroupName || '').replace(/"/g, '""')}"`,
            `"${(userRight.districtName || '').replace(/"/g, '""')}"`,
            userRight.createdAt.toLocaleDateString(),
            userRight.updatedAt.toLocaleDateString()
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
        link.setAttribute('download', `user-rights-data-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        alert('Failed to export user rights to CSV. Please try again.');
    }
};

export const exportUserRightsToPDF = (userRights: UserRight[]): void => {
    try {
        // Create new PDF document
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text('User Rights Data', 14, 15);

        // Add export date
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 14, 22);

        // Add total count
        doc.text(`Total User Rights: ${userRights.length}`, 14, 28);

        // Prepare table data
        const tableData = userRights.map(userRight => [
            userRight.id.toString(),
            userRight.userName,
            userRight.accessLevel.replace('_', ' ').toUpperCase(),
            userRight.accessScope
        ]);

        // Define table columns
        const tableColumns = [
            'S/N',
            'Full Name',
            'Access Level',
            'Access Scope'
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
                2: { cellWidth: 25 }, // Access Level
                3: { cellWidth: 40 }  // Access Scope
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
        doc.save(`user-rights-data-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        alert('Failed to export user rights to PDF. Please try again.');
    }
};

// Utility function to format access level for display
export const formatAccessLevel = (accessLevel: string): string => {
    const levelMap: { [key: string]: string } = {
        'super_admin': 'Super Admin',
        'group_admin': 'Group Admin',
        'district_admin': 'District Admin',
        'region_admin': 'Region Admin',
        'state_admin': 'State Admin'
    };

    return levelMap[accessLevel] || accessLevel.replace('_', ' ').toUpperCase();
};

// Utility function to get color for access level badge
export const getAccessLevelColor = (accessLevel: string): string => {
    const colorMap: { [key: string]: string } = {
        'super_admin': 'blue',
        'group_admin': 'green',
        'district_admin': 'orange',
        'region_admin': 'purple',
        'state_admin': 'red'
    };

    return colorMap[accessLevel] || 'gray';
};

// Utility function to generate filename with timestamp
export const generateExportFilename = (extension: string): string => {
    const timestamp = new Date().toISOString()
        .replace(/[:.]/g, '-')
        .split('T')
        .join('_')
        .slice(0, -5);
    return `user_rights_export_${timestamp}.${extension}`;
};

// Utility function to format user rights for display
export const formatUserRightsForExport = (userRights: UserRight[]) => {
    return userRights.map(userRight => ({
        id: userRight.id,
        userName: userRight.userName,
        accessLevel: formatAccessLevel(userRight.accessLevel),
        accessScope: userRight.accessScope,
        stateName: userRight.stateName || '',
        regionName: userRight.regionName || '',
        groupName: userRight.groupName || '',
        oldGroupName: userRight.oldGroupName || '',
        districtName: userRight.districtName || '',
        createdAt: userRight.createdAt,
        updatedAt: userRight.updatedAt
    }));
};