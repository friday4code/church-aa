export interface AttendanceMonitoring {
    pending: {
        districts: string[];
        groups: string[];
        regions: string[];
        states: string[];
    };
    submitted: {
        districts: string[];
        groups: string[];
        regions: string[];
        states: string[];
    };
}