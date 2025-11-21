// utils/attendance.utils.ts
import type {
    AttendanceRecord,
    ServiceType,
    Attendance
} from '@/types/attendance.type';
import type { AttendanceFormData } from '@/modules/admin/schemas/attendance.schema';
import XLSX from 'xlsx-js-style';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface AttendanceTotals {
    total: number;
    men: number;
    women: number;
    youth_boys: number;
    youth_girls: number;
    children_boys: number;
    children_girls: number;
}

export interface StateReportData {
    region: string;
    month: string;
    adults: {
        men: number;
        women: number;
        total: number;
    };
    youths: {
        boys: number;
        girls: number;
        total: number;
    };
    totalAdultsYouths: number;
    children: {
        boys: number;
        girls: number;
        total: number;
    };
    grandTotal: number;
}

export const calculateTotals = (attendances: Attendance[]): AttendanceTotals => {
    return attendances.reduce(
        (totals, attendance) => ({
            total: totals.total +
                attendance.men +
                attendance.women +
                attendance.youth_boys +
                attendance.youth_girls +
                attendance.children_boys +
                attendance.children_girls,
            men: totals.men + attendance.men,
            women: totals.women + attendance.women,
            youth_boys: totals.youth_boys + attendance.youth_boys,
            youth_girls: totals.youth_girls + attendance.youth_girls,
            children_boys: totals.children_boys + attendance.children_boys,
            children_girls: totals.children_girls + attendance.children_girls,
        }),
        {
            total: 0,
            men: 0,
            women: 0,
            youth_boys: 0,
            youth_girls: 0,
            children_boys: 0,
            children_girls: 0,
        }
    );
};

export const getMonthOptions = (): string[] => {
    return [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
};

export const getWeekOptions = (): number[] => {
    return [1, 2, 3, 4, 5];
};

export const getYearOptions = (): number[] => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1];
};

// New function to generate state report data in the required format
export const generateStateReportData = (attendances: Attendance[], regions: any[]): StateReportData[] => {
    const reportData: StateReportData[] = [];
    const months = getMonthOptions();

    regions.forEach(region => {
        const regionAttendances = attendances.filter(att => att.region_id === region.id);

        months.forEach(month => {
            const monthAttendances = regionAttendances.filter(att => att.month === month);

            if (monthAttendances.length > 0) {
                const totals = calculateTotals(monthAttendances);

                const reportItem: StateReportData = {
                    region: region.name,
                    month: month,
                    adults: {
                        men: totals.men,
                        women: totals.women,
                        total: totals.men + totals.women
                    },
                    youths: {
                        boys: totals.youth_boys,
                        girls: totals.youth_girls,
                        total: totals.youth_boys + totals.youth_girls
                    },
                    totalAdultsYouths: totals.men + totals.women + totals.youth_boys + totals.youth_girls,
                    children: {
                        boys: totals.children_boys,
                        girls: totals.children_girls,
                        total: totals.children_boys + totals.children_girls
                    },
                    grandTotal: totals.total
                };

                reportData.push(reportItem);
            }
        });
    });

    return reportData;
};

// New function to export state report in Excel format matching the template
export const exportStateReportToExcel = (attendances: Attendance[], regions: any[], stateName: string = 'AKWA IBOM'): void => {
    const reportData = generateStateReportData(attendances, regions);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([]);

    // Add headers and title matching the state report format
    const headerData = [
        [`Deeper Life Bible Church, ${stateName.toUpperCase()} (State)`, '', '', '', '', '', '', '', '', '', '', '', ''],
        ['January - December 2025', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', 'Adults', '', '', 'Youths', '', '', 'Total', 'Children', '', '', 'Grand'],
        ['', '', '', '', '', '', '', '', 'Adults', '', '', '', 'Total'],
        ['Regions', 'Month', '(i)', '(ii)', '(iii)', '(iv)', '(v)', '(vi)', '(vii)', '(viii)', '(ix)', '(x)', '(vii)&(x)'],
        ['', '', 'Men', 'Women', 'Total', 'Boys', 'Girls', 'Total', '(iii)&(vi)', 'Boys', 'Girls', 'Total', '']
    ];

    // Add data rows
    const dataRows: any[][] = [];
    let currentRegion = '';
    let regionStartRow = 8; // Starting row for data after headers

    reportData.forEach((item, index) => {
        const row: any[] = [];

        // Only show region name once per region group
        if (item.region !== currentRegion) {
            currentRegion = item.region;
            row.push(item.region);
        } else {
            row.push('');
        }

        row.push(
            item.month,
            item.adults.men,
            item.adults.women,
            item.adults.total,
            item.youths.boys,
            item.youths.girls,
            item.youths.total,
            item.totalAdultsYouths,
            item.children.boys,
            item.children.girls,
            item.children.total,
            item.grandTotal
        );

        dataRows.push(row);
        regionStartRow++;
    });

    // Combine headers and data and add a dynamic SubTotal row
    const startDataRow = 8; // 1-based row index where data begins
    const subtotalRow: (string | number)[] = new Array(13).fill('');
    subtotalRow[0] = 'SubTotal';
    const numericCols = [2,3,4,5,6,7,8,9,10,11,12];
    numericCols.forEach((colIdx) => {
        let sum = 0;
        for (const r of dataRows) {
            const val = Number(r[colIdx] ?? 0);
            if (!Number.isNaN(val)) sum += val;
        }
        subtotalRow[colIdx] = sum;
    });

    const allData = [...headerData, ...dataRows, subtotalRow];

    XLSX.utils.sheet_add_aoa(ws, allData, { origin: 'A1' });

    // Set column widths to match the template
    ws['!cols'] = [
        { wch: 25 }, // A: Regions
        { wch: 12 }, // B: Month
        { wch: 8 },  // C: Men (i)
        { wch: 10 }, // D: Women (ii)
        { wch: 10 }, // E: Total Adults (iii)
        { wch: 8 },  // F: Youth Boys (iv)
        { wch: 10 }, // G: Youth Girls (v)
        { wch: 10 }, // H: Total Youths (vi)
        { wch: 12 }, // I: Total Adults & Youths (vii)
        { wch: 10 }, // J: Children Boys (viii)
        { wch: 10 }, // K: Children Girls (ix)
        { wch: 10 }, // L: Total Children (x)
        { wch: 12 }, // M: Grand Total
    ];

    // Merge header cells to match template format
    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push(
        { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } }, // Title row
        { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } }, // Date range row
        { s: { r: 3, c: 2 }, e: { r: 3, c: 4 } },  // Adults header
        { s: { r: 3, c: 5 }, e: { r: 3, c: 7 } },  // Youths header
        { s: { r: 3, c: 8 }, e: { r: 3, c: 8 } },  // Total Adults
        { s: { r: 3, c: 9 }, e: { r: 3, c: 11 } }, // Children header
        { s: { r: 3, c: 12 }, e: { r: 3, c: 12 } }, // Grand Total
        { s: { r: 4, c: 8 }, e: { r: 4, c: 8 } },  // Total Adults (continued)
        { s: { r: 4, c: 12 }, e: { r: 4, c: 12 } } // Grand Total (continued)
    );

    type Align = { horizontal?: 'center' | 'left' | 'right'; vertical?: 'center' | 'top' | 'bottom'; wrapText?: boolean };
    type Font = { sz?: number; bold?: boolean };
    type Fill = { patternType?: 'solid'; fgColor?: { rgb?: string } };
    type Style = { font?: Font; alignment?: Align; fill?: Fill };
    const titleStyle: Style = { font: { sz: 28, bold: true }, alignment: { horizontal: 'center', vertical: 'center' } };
    const headerStyle: Style = { font: { bold: true }, alignment: { horizontal: 'center', vertical: 'center' } };
    const subtotalStyle: Style = { font: { bold: true }, alignment: { horizontal: 'center', vertical: 'center' }, fill: { patternType: 'solid', fgColor: { rgb: 'FFFF99' } } };
    const setCellStyle = (row: number, col: number, style: Style) => {
        const addr = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = ws[addr] as unknown as { s?: Style };
        if (cell) {
            cell.s = style;
        }
    };
    const totalColumns = 13;
    for (let c = 0; c < totalColumns; c++) {
        setCellStyle(0, c, titleStyle);
        setCellStyle(1, c, titleStyle);
    }
    const headerRows = [3, 4, 5, 6];
    headerRows.forEach(r => {
        for (let c = 0; c < totalColumns; c++) {
            setCellStyle(r, c, headerStyle);
        }
    });

    const subtotalRowIndex = headerData.length + dataRows.length; // 0-based index for subtotal row
    for (let c = 0; c < totalColumns; c++) {
        setCellStyle(subtotalRowIndex, c, subtotalStyle);
    }

    XLSX.utils.book_append_sheet(wb, ws, 'State Report');
    XLSX.writeFile(wb, `state-report-${stateName.toLowerCase().replace(' ', '-')}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Updated PDF export to match state report format
export const exportStateReportToPDF = (attendances: Attendance[], regions: any[], stateName: string = 'AKWA IBOM'): void => {
    const reportData = generateStateReportData(attendances, regions);
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(16);
    doc.text(`Deeper Life Bible Church, ${stateName.toUpperCase()} (State)`, pageWidth / 2, 15, { align: 'center' });

    // Date range
    doc.setFontSize(12);
    doc.text('January - December 2025', pageWidth / 2, 22, { align: 'center' });

    // Prepare table data in state report format
    const tableHeaders = [
        [
            'Region',
            'Month',
            'Men',
            'Women',
            'Total\nAdults',
            'Youth\nBoys',
            'Youth\nGirls',
            'Total\nYouths',
            'Total\nAdults &\nYouths',
            'Children\nBoys',
            'Children\nGirls',
            'Total\nChildren',
            'Grand\nTotal'
        ]
    ];

    const tableData = reportData.map(item => [
        item.region,
        item.month,
        item.adults.men.toString(),
        item.adults.women.toString(),
        item.adults.total.toString(),
        item.youths.boys.toString(),
        item.youths.girls.toString(),
        item.youths.total.toString(),
        item.totalAdultsYouths.toString(),
        item.children.boys.toString(),
        item.children.girls.toString(),
        item.children.total.toString(),
        item.grandTotal.toString()
    ]);

    // Add table using autoTable
    autoTable(doc, {
        head: tableHeaders,
        body: tableData,
        startY: 30,
        styles: {
            fontSize: 8,
            cellPadding: 2,
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
        },
        headStyles: {
            fillColor: [22, 54, 94],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            textAlign: 'center',
            minCellHeight: 15,
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245],
        },
        margin: { top: 30, right: 5, bottom: 10, left: 5 },
        tableWidth: 'wrap',
    });

    // Calculate overall totals
    const overallTotals = reportData.reduce((totals, item) => ({
        men: totals.men + item.adults.men,
        women: totals.women + item.adults.women,
        youthBoys: totals.youthBoys + item.youths.boys,
        youthGirls: totals.youthGirls + item.youths.girls,
        childrenBoys: totals.childrenBoys + item.children.boys,
        childrenGirls: totals.childrenGirls + item.children.girls,
        grandTotal: totals.grandTotal + item.grandTotal
    }), {
        men: 0, women: 0, youthBoys: 0, youthGirls: 0,
        childrenBoys: 0, childrenGirls: 0, grandTotal: 0
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(10);
    doc.text('Overall Summary:', 14, finalY);

    doc.setFontSize(9);
    doc.text(`Total Men: ${overallTotals.men}`, 14, finalY + 6);
    doc.text(`Total Women: ${overallTotals.women}`, 14, finalY + 12);
    doc.text(`Total Youth Boys: ${overallTotals.youthBoys}`, 14, finalY + 18);
    doc.text(`Total Youth Girls: ${overallTotals.youthGirls}`, 14, finalY + 24);
    doc.text(`Total Children Boys: ${overallTotals.childrenBoys}`, 14, finalY + 30);
    doc.text(`Total Children Girls: ${overallTotals.childrenGirls}`, 14, finalY + 36);
    doc.text(`Grand Total: ${overallTotals.grandTotal}`, 14, finalY + 42);

    doc.save(`state-report-${stateName.toLowerCase().replace(' ', '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
};




export const copyAttendanceToClipboard = async (attendances: Attendance[], districts?: any[]): Promise<void> => {
    const getDistrictName = (districtId: number): string => {
        if (!districts) return `District ${districtId}`;
        const district = districts.find(d => d.id === districtId);
        return district?.name || `District ${districtId}`;
    };

    const headers = ['District', 'Month', 'Week', 'Year', 'Men', 'Women', 'Youth Boys', 'Youth Girls', 'Children Boys', 'Children Girls', 'Total'];
    const data = attendances.map(attendance => [
        getDistrictName(attendance.district_id),
        attendance.month,
        `Week ${attendance.week}`,
        attendance.year.toString(),
        attendance.men.toString(),
        attendance.women.toString(),
        attendance.youth_boys.toString(),
        attendance.youth_girls.toString(),
        attendance.children_boys.toString(),
        attendance.children_girls.toString(),
        (attendance.men + attendance.women + attendance.youth_boys + attendance.youth_girls + attendance.children_boys + attendance.children_girls).toString()
    ]);

    const csvContent = [headers, ...data]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

    try {
        await navigator.clipboard.writeText(csvContent);
        console.log('Attendance data copied to clipboard');
    } catch (error) {
        console.error('Failed to copy attendance data to clipboard:', error);
    }
};

export const exportAttendanceToExcel = (attendances: Attendance[], districts?: any[]): void => {
    const getDistrictName = (districtId: number): string => {
        if (!districts) return `District ${districtId}`;
        const district = districts.find(d => d.id === districtId);
        return district?.name || `District ${districtId}`;
    };

    const data = attendances.map(attendance => ({
        'District': getDistrictName(attendance.district_id),
        'Month': attendance.month,
        'Week': attendance.week,
        'Year': attendance.year,
        'Men': attendance.men,
        'Women': attendance.women,
        'Youth Boys': attendance.youth_boys,
        'Youth Girls': attendance.youth_girls,
        'Children Boys': attendance.children_boys,
        'Children Girls': attendance.children_girls,
        'Total': attendance.men + attendance.women + attendance.youth_boys + attendance.youth_girls + attendance.children_boys + attendance.children_girls,
        'Service Type': attendance.service_type,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    
    // Set column widths
    ws['!cols'] = [
        { wch: 12 }, // District ID
        { wch: 12 }, // Month
        { wch: 8 },  // Week
        { wch: 8 },  // Year
        { wch: 8 },  // Men
        { wch: 10 }, // Women
        { wch: 12 }, // Youth Boys
        { wch: 12 }, // Youth Girls
        { wch: 14 }, // Children Boys
        { wch: 14 }, // Children Girls
        { wch: 10 }, // Total
        { wch: 14 }, // Service Type
    ];

    XLSX.writeFile(wb, `attendance-${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportAttendanceToCSV = (attendances: Attendance[], districts?: any[]): void => {
    const getDistrictName = (districtId: number): string => {
        if (!districts) return `District ${districtId}`;
        const district = districts.find(d => d.id === districtId);
        return district?.name || `District ${districtId}`;
    };

    const headers = ['District', 'Month', 'Week', 'Year', 'Men', 'Women', 'Youth Boys', 'Youth Girls', 'Children Boys', 'Children Girls', 'Total'];
    const data = attendances.map(attendance => [
        getDistrictName(attendance.district_id),
        attendance.month,
        `Week ${attendance.week}`,
        attendance.year.toString(),
        attendance.men.toString(),
        attendance.women.toString(),
        attendance.youth_boys.toString(),
        attendance.youth_girls.toString(),
        attendance.children_boys.toString(),
        attendance.children_girls.toString(),
        (attendance.men + attendance.women + attendance.youth_boys + attendance.youth_girls + attendance.children_boys + attendance.children_girls).toString()
    ]);

    const csvContent = [headers, ...data]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `attendance-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportAttendanceToPDF = (attendances: Attendance[], districts?: any[]): void => {
    const getDistrictName = (districtId: number): string => {
        if (!districts) return `District ${districtId}`;
        const district = districts.find(d => d.id === districtId);
        return district?.name || `District ${districtId}`;
    };

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(16);
    doc.text('Church Attendance Report', pageWidth / 2, 15, { align: 'center' });
    
    // Date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 22, { align: 'center' });
    
    // Prepare table data
    const tableData = attendances.map(attendance => [
        getDistrictName(attendance.district_id),
        attendance.month,
        `Week ${attendance.week}`,
        attendance.year.toString(),
        attendance.men.toString(),
        attendance.women.toString(),
        attendance.youth_boys.toString(),
        attendance.youth_girls.toString(),
        attendance.children_boys.toString(),
        attendance.children_girls.toString(),
        (attendance.men + attendance.women + attendance.youth_boys + attendance.youth_girls + attendance.children_boys + attendance.children_girls).toString(),
    ]);

    // Add table using autoTable
    autoTable(doc, {
        head: [[
            'District',
            'Month',
            'Week',
            'Year',
            'Men',
            'Women',
            'Youth Boys',
            'Youth Girls',
            'Child Boys',
            'Child Girls',
            'Total',
        ]],
        body: tableData,
        startY: 28,
        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [22, 54, 94],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245],
        },
        margin: { top: 28, right: 10, bottom: 10, left: 10 },
    });

    // Summary stats
    const totals = calculateTotals(attendances);
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(10);
    doc.text('Summary Statistics:', 14, finalY);
    
    doc.setFontSize(9);
    doc.text(`Total Records: ${attendances.length}`, 14, finalY + 6);
    doc.text(`Total Attendance: ${totals.total}`, 14, finalY + 12);
    doc.text(`Average per Record: ${attendances.length > 0 ? Math.round(totals.total / attendances.length) : 0}`, 14, finalY + 18);

    doc.save(`attendance-${new Date().toISOString().split('T')[0]}.pdf`);
};

// API Transformation Functions
export const transformApiToStore = (apiRecord: AttendanceRecord): Attendance => {
    
    return {
        id: apiRecord.id,
        district_id: apiRecord.district_id,
        month: apiRecord.month,
        week: apiRecord.week,
        year: apiRecord.year,
        men: apiRecord.men,
        women: apiRecord.women,
        youth_boys: apiRecord.youth_boys,
        youth_girls: apiRecord.youth_girls,
        children_boys: apiRecord.children_boys,
        children_girls: apiRecord.children_girls,
        state_id: apiRecord.state_id,
        region_id: apiRecord.region_id,
        group_id: apiRecord.group_id,
        old_group_id: apiRecord.old_group_id,
        service_type: mapServiceTypeToInternal(apiRecord.service_type),
        created_at: apiRecord.created_at,
        updated_at: apiRecord.updated_at
    };
};

export const transformStoreToApi = (attendance: Partial<Attendance>, mode: 'create' | 'update'): Partial<Attendance> => {
    const baseData = {
        state_id: attendance.state_id,
        region_id: attendance.region_id,
        district_id: attendance.district_id,
        group_id: attendance.group_id,
        old_group_id: attendance.old_group_id || null,
        service_type: attendance.service_type,
        month: attendance.month,
        week: attendance.week,
        year: attendance.year,
        men: attendance.men,
        women: attendance.women,
        youth_boys: attendance.youth_boys,
        youth_girls: attendance.youth_girls,
        children_boys: attendance.children_boys,
        children_girls: attendance.children_girls,
    };

    if (mode === 'update') {
        return {
            id: attendance.id,
            ...baseData
        };
    }

    return baseData;
};



export const transformFormToStore = (formData: AttendanceFormData, serviceType: ServiceType, id?: number): any => {
    return {
        ...(id && { id }),
        district_id: formData.district_id,
        month: formData.month,
        week: formData.week,
        year: formData.year,
        men: formData.men,
        women: formData.women,
        youth_boys: formData.youth_boys,
        youth_girls: formData.youth_girls,
        children_boys: formData.children_boys,
        children_girls: formData.children_girls,
        state_id: formData.state_id,
        region_id: formData.region_id,
        group_id: formData.group_id,
        old_group_id: formData.old_group_id,
        service_type: serviceType
    };
};

export const transformStoreToForm = (attendance: Attendance): AttendanceFormData => {
    return {
        district_id: attendance.district_id,
        month: attendance.month,
        week: attendance.week,
        year: attendance.year,
        men: attendance.men,
        women: attendance.women,
        youth_boys: attendance.youth_boys,
        youth_girls: attendance.youth_girls,
        children_boys: attendance.children_boys,
        children_girls: attendance.children_girls,
        state_id: attendance.state_id,
        region_id: attendance.region_id,
        group_id: attendance.group_id,
        old_group_id: attendance.old_group_id,
        service_type: attendance.service_type
    };
};

// Service Type Mapping Functions
export const mapServiceTypeToInternal = (apiServiceType: string): ServiceType => {
    const serviceTypeMap: Record<string, ServiceType> = {
        'Sunday Service': 'sunday-worship',
        'House Caring': 'house-caring',
        'Search Scriptures': 'search-scriptures',
        'Thursday Revival': 'thursday-revival',
        'Monday Bible': 'monday-bible'
    };
    return serviceTypeMap[apiServiceType] || 'sunday-worship';
};

export const mapServiceTypeToApi = (internalServiceType: ServiceType): string => {
    const serviceTypeMap: Record<ServiceType, string> = {
        'sunday-worship': 'Sunday Service',
        'house-caring': 'House Caring',
        'search-scriptures': 'Search Scriptures',
        'thursday-revival': 'Thursday Revival',
        'monday-bible': 'Monday Bible'
    };
    return serviceTypeMap[internalServiceType] || 'Sunday Service';
};

// Validation and Helper Functions
export const validateAttendanceData = (data: Partial<Attendance>): string[] => {
    const errors: string[] = [];

    if (data.district_id === undefined || data.district_id === 0) errors.push('District is required');
    if (!data.month?.trim()) errors.push('Month is required');
    if (!data.week || data.week < 1 || data.week > 5) errors.push('Week must be between 1 and 5');
    if (!data.year || data.year < 2000 || data.year > 2100) errors.push('Year must be valid');
    if (data.men === undefined || data.men < 0) errors.push('Men must be a non-negative number');
    if (data.women === undefined || data.women < 0) errors.push('Women must be a non-negative number');
    if (data.youth_boys === undefined || data.youth_boys < 0) errors.push('Youth Boys must be a non-negative number');
    if (data.youth_girls === undefined || data.youth_girls < 0) errors.push('Youth Girls must be a non-negative number');
    if (data.children_boys === undefined || data.children_boys < 0) errors.push('Children Boys must be a non-negative number');
    if (data.children_girls === undefined || data.children_girls < 0) errors.push('Children Girls must be a non-negative number');

    return errors;
};

export const generateAttendanceSummary = (attendances: Attendance[]): { total: number; byMonth: Record<string, number>; byDistrict: Record<number, number> } => {
    const byMonth: Record<string, number> = {};
    const byDistrict: Record<number, number> = {};
    let total = 0;

    attendances.forEach(attendance => {
        const attendanceTotal = attendance.men + attendance.women + attendance.youth_boys +
            attendance.youth_girls + attendance.children_boys + attendance.children_girls;

        total += attendanceTotal;

        // Group by month
        byMonth[attendance.month] = (byMonth[attendance.month] || 0) + attendanceTotal;

        // Group by district
        byDistrict[attendance.district_id] = (byDistrict[attendance.district_id] || 0) + attendanceTotal;
    });

    return { total, byMonth, byDistrict };
};

// Date Helper Functions
export const getCurrentMonth = (): string => {
    const months = getMonthOptions();
    const currentMonthIndex = new Date().getMonth();
    return months[currentMonthIndex];
};

export const getCurrentWeek = (): number => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const pastDaysOfMonth = now.getDate() - firstDayOfMonth.getDate();
    return Math.ceil((pastDaysOfMonth + firstDayOfMonth.getDay() + 1) / 7);
};

export const getCurrentYear = (): number => {
    return new Date().getFullYear();
};