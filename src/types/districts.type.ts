export interface District {
    code: string;
    id: number;
    leader: string;
    name: string;
    region: string;
    state: string;
    state_id?: number;
    region_id?: number;
}

export type Districts = District[];