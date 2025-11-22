export interface MonitoringItem {
    id: number
    last_filled_week: number
    name: string
    status: 'red' | 'yellow' | 'green'
}

export interface AttendanceMonitoring {
    districts: MonitoringItem[]
    groups: MonitoringItem[]
    old_groups: MonitoringItem[]
    regions: MonitoringItem[]
    states: MonitoringItem[]
}