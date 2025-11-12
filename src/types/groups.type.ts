// types/groups.type.ts
export interface Group {
    id: number;
    group_id: number;
    name: string;
    code: string;
    leader: string;
    state_id: number;
    region_id: number;
    district_id: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export type Groups = Group[];

export interface CreateGroupData {
    name: string;
    code: string;
    leader: string;
    state_id: number;
    region_id: number;
    district_id: number;
}

export interface UpdateGroupData {
    id: number;
    data: Partial<CreateGroupData>;
}