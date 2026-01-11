// types/attendance.type.ts
export interface AttendanceRecord {
    id: number;
    children_boys: number;
    children_girls: number;
    district_id: number;
    group_id: number;
    men: number;
    month: string;
    old_group_id: number | null;
    region_id: number;
    service_type: string;
    state_id: number;
    week: number;
    women: number;
    year: number;
    youth_boys: number;
    youth_girls: number;
    created_at: string;
    updated_at: string;
    new_comers?: number;
    tithe_offering?: number;
}

export interface Attendance {
    id: number;
    children_boys: number;
    children_girls: number;
    district_id: number;
    group_id: number;
    men: number;
    month: string;
    old_group_id: number | null;
    region_id: number;
    service_type: string;
    state_id: number;
    week: number;
    women: number;
    year: number;
    youth_boys: number;
    youth_girls: number;
    created_at: string;
    updated_at: string;
    new_comers?: number;
    tithe_offering?: number;
}

export interface Region {
    code: string;
    id: number;
    leader: string;
    name: string;
    state: string;
}

export type Regions = Region[];

export interface State {
    id: number;
    name: string;
    code: string;
}

export interface District {
    id: number;
    name: string;
    region_id: number;
}

export interface Group {
    id: number;
    name: string;
    district_id: number;
}

export interface OldGroup {
    id: number;
    name: string;
    group_id: number;
}

export type ServiceType = 'sunday-worship' | 'house-caring' | 'search-scriptures' | 'thursday-revival' | 'monday-bible';

export const SERVICE_TYPES: Record<ServiceType, { name: string; apiValue: string }> = {
    'sunday-worship': { name: 'Sunday Worship', apiValue: 'Sunday Service' },
    'house-caring': { name: 'House Caring', apiValue: 'House Caring' },
    'search-scriptures': { name: 'Search Scriptures', apiValue: 'Search Scriptures' },
    'thursday-revival': { name: 'Thursday Revival', apiValue: 'Thursday Revival' },
    'monday-bible': { name: 'Monday Bible', apiValue: 'Monday Bible' }
};

export const API_SERVICE_TYPES = {
    'Sunday Service': 'sunday-worship',
    'House Caring': 'house-caring',
    'Search Scriptures': 'search-scriptures',
    'Thursday Revival': 'thursday-revival',
    'Monday Bible': 'monday-bible'
} as const;