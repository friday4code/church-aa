// types/oldgroups.type.ts
export interface OldGroup {
    id: number
    name: string
    code: string
    leader: string
    state_id: number
    region_id: number
    district_id: number
    group_id: number
}

// For form data (camelCase for frontend)
export interface OldGroupFormData {
    name: string
    code: string
    leader: string
    state_id: number
    region_id: number
    district_id: number
    group_id: number
}

// For API responses
export interface OldGroupsResponse {
    data: OldGroup[]
    total: number
    page: number
    limit: number
}

export interface OldGroupResponse {
    data: OldGroup
}

// For creating/updating old groups - same as payload
export interface CreateOldGroupRequest {
    name: string
    code: string
    leader: string
    state_id: number
    region_id: number
    district_id: number
    group_id: number
}

export interface UpdateOldGroupRequest {
    name?: string
    code?: string
    leader?: string
    state_id?: number
    region_id?: number
    district_id?: number
    group_id?: number
}