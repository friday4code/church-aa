export interface MonitoringItem {
    id: number
    last_filled_week: number
    name: string
    status: 'red' | 'yellow' | 'green' | 'orange'
}

export interface AttendanceMonitoringData {
    districts: MonitoringItem[]
    groups: MonitoringItem[]
    old_groups: MonitoringItem[]
    regions: MonitoringItem[]
    states: MonitoringItem[]
}

export interface AttendanceMonitoring {
    data: AttendanceMonitoringData
    summary: any
}