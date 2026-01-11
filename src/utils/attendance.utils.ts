// utils/attendance.utils.ts
import type {
    AttendanceRecord,
    ServiceType,
    Attendance
} from '@/types/attendance.type';
import type { AttendanceFormData } from '@/modules/admin/schemas/attendance.schema';
import * as XLSX from 'xlsx';
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

export const copyAttendanceToClipboard = async (attendances: Attendance[], districts?: any[]): Promise<void> => {
     const getDistrictName = (districtId: number): string => {
        const district = districts?.find(d => d.id === districtId)
        return district?.name || `District ${districtId}`
    }

    const headers = ['District', 'Month', 'Week', 'Year', 'Men', 'Women', 'Youth Boys', 'Youth Girls', 'Children Boys', 'Children Girls', 'New Comers', 'Tithe & Offering', 'Total'];
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
        String(attendance.new_comers ?? 0),
        String(attendance.tithe_offering ?? 0),
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
    console.log(districts)
     const getDistrictName = (districtId: number): string => {
        const district = districts?.find(d => d.id === districtId)
        return district?.name || `District ${districtId}`
    }

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
        'New Comers': attendance.new_comers ?? 0,
        'Tithe & Offering': attendance.tithe_offering ?? 0,
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
        { wch: 12 }, // New Comers
        { wch: 16 }, // Tithe & Offering
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

    const headers = ['District', 'Month', 'Week', 'Year', 'Men', 'Women', 'Youth Boys', 'Youth Girls', 'Children Boys', 'Children Girls', 'New Comers', 'Tithe & Offering', 'Total'];
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
        String(attendance.new_comers ?? 0),
        String(attendance.tithe_offering ?? 0),
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
        String(attendance.new_comers ?? 0),
        String(attendance.tithe_offering ?? 0),
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
            'Children Boys',
            'Children Girls',
            'New Comers',
            'Tithe & Offering',
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
        updated_at: apiRecord.updated_at,
        new_comers: apiRecord.new_comers ?? 0,
        tithe_offering: apiRecord.tithe_offering ?? 0
    } as any
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
        new_comers: attendance.new_comers ?? 0,
        tithe_offering: attendance.tithe_offering ?? 0,
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
        service_type: serviceType,
        new_comers: formData.new_comers ?? 0,
        tithe_offering: formData.tithe_offering ?? 0,
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
        service_type: attendance.service_type,
        new_comers: attendance.new_comers ?? 0,
        tithe_offering: attendance.tithe_offering ?? 0,
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
