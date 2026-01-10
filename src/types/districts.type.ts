export interface District {
    code: string;
    id: number;
    leader: string;
    leader_email?: string;
    leader_phone?: string;
    name: string;
    region: string;
    state: string;
    state_id?: number;
    region_id?: number;
    old_group_id?: number;
    group_id?: number;
    old_group?: string;
    group?: string;
}

export type Districts = District[];