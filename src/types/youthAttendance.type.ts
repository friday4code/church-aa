// types/youthAttendance.type.ts
export interface YouthAttendance {
    id: number
    attendance_type: 'weekly' | 'revival'
    state_id: number
    region_id: number
    district_id: number
    group_id: number
    old_group_id?: number | null
    year: number
    month: string
    week?: number
    male: number
    female: number
    member_boys: number
    member_girls: number
    visitor_boys: number
    visitor_girls: number
    challenges?: string
    solutions?: string
    testimony?: string
    remarks?: string
    yhsfMale?: number
    yhsfFemale?: number
    createdAt?: Date
    updatedAt?: Date

    // Joined fields
    stateName?: string
    regionName?: string
    districtName?: string
    groupName?: string
    oldGroupName?: string
}

export type YouthAttendances = YouthAttendance[]

export interface CreateYouthAttendanceData {
    attendance_type: 'weekly' | 'revival'
    state_id: number
    region_id: number
    district_id: number
    group_id: number
    old_group_id?: number | null
    year: number
    month: string
    week?: number
    male: number
    female: number
    member_boys: number
    member_girls: number
    visitor_boys: number
    visitor_girls: number
    challenges?: string
    solutions?: string
    testimony?: string
    remarks?: string
}

export interface UpdateYouthAttendanceData {
    attendance_type?: 'weekly' | 'revival'
    state_id?: number
    region_id?: number
    district_id?: number
    group_id?: number
    old_group_id?: number | null
    year?: number
    month?: string
    week?: number
    male?: number
    female?: number
    member_boys?: number
    member_girls?: number
    visitor_boys?: number
    visitor_girls?: number
    challenges?: string
    solutions?: string
    testimony?: string
    remarks?: string
}

export interface YouthAttendanceFilters {
    attendance_type?: 'weekly' | 'revival'
    year?: number
    month?: string
}

export interface YouthAttendanceResponse {
    data: YouthAttendance
}

export interface YouthAttendancesResponse {
    data: YouthAttendances
    total: number
    page: number
    limit: number
}
