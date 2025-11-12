// types/regions.type.ts
export interface Region {
    code: string;
    id: number;
    leader: string;
    name: string;
    state: string;
    state_id?: number; // Optional for API compatibility
}

export type Regions = Region[];

// API request types
export interface CreateRegionRequest {
    code: string;
    leader: string;
    name: string;
    state_id: number;
}

export interface UpdateRegionRequest {
    code?: string;
    leader?: string;
    name?: string;
    state_id?: number;
}