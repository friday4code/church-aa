// types/groups.type.ts
export interface Group {
    id: number;
    code: string;
    name: string;
    leader: string | null;
    leader_email?: string | null;
    leader_phone?: string | null;
    state: string;
    region: string;
    district: string;
    state_id?: number;
    region_id?: number;
    old_group_id?: number;
    old_group: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export type Groups = Group[];

export interface CreateGroupData {
    group_name: string;
    leader: string;
    leader_email?: string;
    leader_phone?: string;
    state_id: number;
    region_id: number;
    old_group_id?: number;
}

export interface UpdateGroupData {
    id: number;
    data: Partial<CreateGroupData>;
}