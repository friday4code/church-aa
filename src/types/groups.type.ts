// types/groups.type.ts
export interface Group {
    id: number;
    code: string;
    name: string;
    leader: string | null;
    state: string;
    region: string;
    district: string;
    access_level?: string;
    state_id?: number;
    region_id?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export type Groups = Group[];

export interface CreateGroupData {
    group_name: string;
    leader: string;
    access_level: string;
    state_id: number;
    region_id: number;
}

export interface UpdateGroupData {
    id: number;
    data: Partial<CreateGroupData>;
}